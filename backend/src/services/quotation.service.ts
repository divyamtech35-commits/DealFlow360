import { CustomerRepository } from '../repositories/customer.repository';
import { ProductRepository } from '../repositories/product.repository';
import { QuotationRepository } from '../repositories/quotation.repository';
import { ApprovalRepository } from '../repositories/approval.repository';
import { AuditRepository } from '../repositories/audit.repository';
import { PricingCalculationInputLine, PricingEngine } from '../engines/pricing.engine';
import { DiscountEngine } from '../engines/discount.engine';
import { RiskEngine } from '../engines/risk.engine';
import { ApprovalEngine } from '../engines/approval.engine';
import { FulfillmentService } from './fulfillment.service';
import { BillingService } from './billing.service';
import { Quotation, User } from '../types';

export interface QuotationLineInput {
  productId: string;
  variantId?: string;
  quantity: number;
  discountPct?: number;
}

export class QuotationService {
  /**
   * Evaluates pricing, discount compliance, and risk metrics for a set of proposed quotation lines.
   */
  public static async calculateMetrics(customerId: string, rawLines: QuotationLineInput[]) {
    const customer = await CustomerRepository.findById(customerId);
    const tier = customer ? await CustomerRepository.getTierById(customer.tierId) : undefined;
    const allProducts = await ProductRepository.getAll();

    // Map raw lines to input with base product pricing
    const pricingInputs: PricingCalculationInputLine[] = rawLines.map((line) => {
      const prod = allProducts.find((p) => p.id === line.productId);
      const unitPrice = prod?.basePrice || 0;
      const unitCost = prod?.unitCost || 0;
      return {
        productId: line.productId,
        productName: prod?.name || 'Product',
        variantId: line.variantId,
        quantity: line.quantity,
        unitPrice,
        unitCost,
        discountPct: line.discountPct || 0,
      };
    });

    const pricing = PricingEngine.calculateQuotation('preview', pricingInputs);

    // Calculate aggregate discount percentage
    const aggregateDiscountPct =
      pricing.subtotal > 0
        ? PricingEngine.round((pricing.discountAmount / pricing.subtotal) * 100)
        : 0;

    const discountEvaluation = DiscountEngine.evaluateDiscount({
      tier: tier || undefined,
      requestedDiscountPct: aggregateDiscountPct,
      marginPct: pricing.marginPct,
    });

    const riskEvaluation = RiskEngine.evaluateRisk({
      customer: customer || undefined,
      requestedDiscountPct: aggregateDiscountPct,
      maxAllowedDiscountPct: discountEvaluation.maxAllowedDiscountPct,
      marginPct: pricing.marginPct,
      totalDealAmount: pricing.total,
    });

    const approvalDecision = ApprovalEngine.evaluateApprovalRequirement({
      quotation: {
        ...pricing,
        id: 'preview',
        quotationNumber: 'PREVIEW',
        customerId,
        salesRepId: '',
        status: 'DRAFT',
        riskScore: riskEvaluation.riskScore,
        riskLevel: riskEvaluation.riskLevel,
        approvalRequired: discountEvaluation.requiresApproval,
        validityDate: '',
        createdAt: '',
        updatedAt: '',
      },
      discountViolation: discountEvaluation.violation,
      approvalRoleHint: discountEvaluation.approvalRole,
    });

    return {
      pricing,
      discountEvaluation,
      riskEvaluation,
      approvalDecision,
    };
  }

  public static async getAllQuotations(filter?: { customerId?: string; salesRepId?: string }): Promise<Quotation[]> {
    return QuotationRepository.getAll(filter);
  }

  public static async getQuotationById(id: string): Promise<Quotation | null> {
    return QuotationRepository.findById(id);
  }

  public static async createQuotation(
    user: User,
    data: {
      customerId: string;
      lines: QuotationLineInput[];
      notes?: string;
      validityDays?: number;
    }
  ): Promise<Quotation> {
    const customer = await CustomerRepository.findById(data.customerId);
    const quotationId = `quot_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const quotationNumber = `QT-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const metrics = await this.calculateMetrics(data.customerId, data.lines);
    const now = new Date();
    const validityDate = new Date();
    validityDate.setDate(now.getDate() + (data.validityDays || 30));

    // Fix the quotation ID on lines
    const finalLines = metrics.pricing.lines.map((l, idx) => ({
      ...l,
      id: `line_${quotationId}_${idx + 1}`,
      quotationId,
    }));

    const quotation: Quotation = {
      id: quotationId,
      quotationNumber,
      customerId: data.customerId,
      customerName: customer?.name || 'Customer',
      salesRepId: user.id,
      salesRepName: user.name,
      status: 'DRAFT',
      lines: finalLines,
      subtotal: metrics.pricing.subtotal,
      discountAmount: metrics.pricing.discountAmount,
      taxAmount: metrics.pricing.taxAmount,
      total: metrics.pricing.total,
      totalCost: metrics.pricing.totalCost,
      marginPct: metrics.pricing.marginPct,
      riskScore: metrics.riskEvaluation.riskScore,
      riskLevel: metrics.riskEvaluation.riskLevel,
      approvalRequired: metrics.approvalDecision.requiresApproval,
      approvalRoleRequired: metrics.approvalDecision.requiredRole,
      approvalStatus: metrics.approvalDecision.requiresApproval ? 'PENDING' : 'NOT_REQUIRED',
      validityDate: validityDate.toISOString(),
      notes: data.notes,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    };

    const created = await QuotationRepository.create(quotation);

    await AuditRepository.log({
      actorId: user.id,
      actorName: user.name,
      actorRole: user.role,
      entityType: 'QUOTATION',
      entityId: quotation.id,
      action: 'CREATE_DRAFT',
      newValues: { quotationNumber, total: quotation.total, riskLevel: quotation.riskLevel },
    });

    return created;
  }

  public static async submitQuotation(id: string, user: User): Promise<Quotation> {
    const quotation = await QuotationRepository.findById(id);
    if (!quotation) throw new Error('Quotation not found');

    if (quotation.status !== 'DRAFT') {
      throw new Error(`Cannot submit quotation currently in status: ${quotation.status}`);
    }

    if (quotation.approvalRequired) {
      quotation.status = 'PENDING_APPROVAL';
      quotation.approvalStatus = 'PENDING';

      // Create Approval Request
      await ApprovalRepository.createRequest({
        id: `appr_req_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        quotationId: quotation.id,
        quotationNumber: quotation.quotationNumber,
        customerName: quotation.customerName,
        totalAmount: quotation.total,
        discountPct: quotation.subtotal > 0 ? Math.round((quotation.discountAmount / quotation.subtotal) * 100) : 0,
        riskLevel: quotation.riskLevel,
        riskScore: quotation.riskScore,
        requiredRole: quotation.approvalRoleRequired || 'SALES_MANAGER',
        status: 'PENDING',
        requestedAt: new Date().toISOString(),
        reason: `Quotation has risk level ${quotation.riskLevel} and requires management authorization.`,
      });
    } else {
      quotation.status = 'APPROVED';
      quotation.approvalStatus = 'NOT_REQUIRED';
    }

    const updated = (await QuotationRepository.update(quotation.id, quotation))!;

    await AuditRepository.log({
      actorId: user.id,
      actorName: user.name,
      actorRole: user.role,
      entityType: 'QUOTATION',
      entityId: quotation.id,
      action: 'SUBMIT_QUOTATION',
      newValues: { status: quotation.status, approvalRequired: quotation.approvalRequired },
    });

    return updated;
  }

  public static async confirmQuotation(id: string, user: User): Promise<{ quotation: Quotation; fulfillmentOrder: any; invoice: any }> {
    const quotation = await QuotationRepository.findById(id);
    if (!quotation) throw new Error('Quotation not found');

    if (!['APPROVED', 'UNDER_NEGOTIATION'].includes(quotation.status)) {
      throw new Error(`Quotation must be APPROVED before confirmation. Current status: ${quotation.status}`);
    }

    quotation.status = 'CONFIRMED';
    const updatedQuotation = (await QuotationRepository.update(quotation.id, quotation))!;

    // 1. Trigger Fulfillment Order creation & stock allocation
    const fulfillmentOrder = await FulfillmentService.createFulfillmentOrder(updatedQuotation);

    // 2. Trigger Invoice generation
    const invoice = await BillingService.generateInvoice(updatedQuotation);

    await AuditRepository.log({
      actorId: user.id,
      actorName: user.name,
      actorRole: user.role,
      entityType: 'QUOTATION',
      entityId: quotation.id,
      action: 'CONFIRM_DEAL',
      newValues: { status: 'CONFIRMED', invoiceId: invoice.id, fulfillmentOrderId: fulfillmentOrder.id },
    });

    return { quotation: updatedQuotation, fulfillmentOrder, invoice };
  }

  public static async cancelQuotation(id: string, user: User, reason?: string): Promise<Quotation> {
    const quotation = await QuotationRepository.findById(id);
    if (!quotation) throw new Error('Quotation not found');

    quotation.status = 'CANCELLED';
    const updated = (await QuotationRepository.update(quotation.id, quotation))!;

    await AuditRepository.log({
      actorId: user.id,
      actorName: user.name,
      actorRole: user.role,
      entityType: 'QUOTATION',
      entityId: quotation.id,
      action: 'CANCEL_QUOTATION',
      comment: reason,
    });

    return updated;
  }
}
