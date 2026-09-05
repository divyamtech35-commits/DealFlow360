import { NegotiationRepository } from '../repositories/negotiation.repository';
import { QuotationRepository } from '../repositories/quotation.repository';
import { ApprovalRepository } from '../repositories/approval.repository';
import { AuditRepository } from '../repositories/audit.repository';
import { QuotationService } from './quotation.service';
import { Negotiation, NegotiationMessage, User } from '../types';

export class NegotiationService {
  public static async getNegotiations(filter?: { quotationId?: string; customerId?: string }): Promise<Negotiation[]> {
    return NegotiationRepository.getAll(filter);
  }

  public static async getNegotiationById(id: string): Promise<Negotiation | null> {
    return NegotiationRepository.findById(id);
  }

  public static async getNegotiationByQuotationId(quotationId: string): Promise<Negotiation | null> {
    return NegotiationRepository.findByQuotationId(quotationId);
  }

  /**
   * Initiates or retrieves an existing negotiation session for a quotation.
   */
  public static async startNegotiation(
    quotationId: string,
    requestedDiscountPct: number,
    initialMessage: string,
    user: User
  ): Promise<Negotiation> {
    const quotation = await QuotationRepository.findById(quotationId);
    if (!quotation) throw new Error('Quotation not found');

    const originalDiscountPct =
      quotation.subtotal > 0
        ? Math.round((quotation.discountAmount / quotation.subtotal) * 100)
        : 0;

    const negotiationId = `neg_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const now = new Date().toISOString();

    const messages: NegotiationMessage[] = [];
    if (initialMessage) {
      messages.push({
        id: `msg_${Date.now()}_1`,
        negotiationId,
        senderId: user.id,
        senderName: user.name,
        senderRole: user.role,
        message: initialMessage,
        timestamp: now,
      });
    }

    const negotiation: Negotiation = {
      id: negotiationId,
      quotationId,
      quotationNumber: quotation.quotationNumber,
      customerId: quotation.customerId,
      customerName: quotation.customerName,
      status: 'OPEN',
      originalDiscountPct,
      requestedDiscountPct,
      messages,
      createdAt: now,
      updatedAt: now,
    };

    const saved = await NegotiationRepository.create(negotiation);

    // Apply counter-offer terms to quotation and rerun all business engines!
    await this.applyCounterOfferTerms(quotationId, requestedDiscountPct, user, 'Customer initiated negotiation counter-offer');

    return saved;
  }

  /**
   * Adds a message to an ongoing negotiation.
   */
  public static async sendMessage(
    negotiationId: string,
    messageText: string,
    user: User
  ): Promise<NegotiationMessage> {
    const message: NegotiationMessage = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      negotiationId,
      senderId: user.id,
      senderName: user.name,
      senderRole: user.role,
      message: messageText,
      timestamp: new Date().toISOString(),
    };

    await NegotiationRepository.addMessage(negotiationId, message);
    return message;
  }

  /**
   * Counter-offer: Modifies commercial terms and rigorously triggers all 8 engine steps.
   */
  public static async counterOffer(
    negotiationId: string,
    counterDiscountPct: number,
    messageText: string,
    user: User
  ): Promise<Negotiation> {
    const negotiation = await NegotiationRepository.findById(negotiationId);
    if (!negotiation) throw new Error('Negotiation not found');

    negotiation.counterDiscountPct = counterDiscountPct;
    negotiation.updatedAt = new Date().toISOString();

    if (messageText) {
      negotiation.messages.push({
        id: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        negotiationId,
        senderId: user.id,
        senderName: user.name,
        senderRole: user.role,
        message: messageText,
        timestamp: new Date().toISOString(),
      });
    }

    await NegotiationRepository.update(negotiationId, negotiation);

    // CRITICAL: Re-evaluate commercial terms, pricing, discount, risk, and approval requirements
    await this.applyCounterOfferTerms(
      negotiation.quotationId,
      counterDiscountPct,
      user,
      `Counter offer of ${counterDiscountPct}% discount proposed`
    );

    return negotiation;
  }

  /**
   * Internal routine to recalculate quotation terms with full business engine re-evaluation.
   */
  private static async applyCounterOfferTerms(
    quotationId: string,
    newDiscountPct: number,
    user: User,
    reason: string
  ) {
    const quotation = await QuotationRepository.findById(quotationId);
    if (!quotation) throw new Error('Quotation not found');

    // 1. Update line item discount percentages to match new terms
    const rawLines = quotation.lines.map((l) => ({
      productId: l.productId,
      variantId: l.variantId,
      quantity: l.quantity,
      discountPct: newDiscountPct,
    }));

    // 2. Recalculate Pricing, Discount compliance, and Risk via QuotationService
    const metrics = await QuotationService.calculateMetrics(quotation.customerId, rawLines);

    // 3. Update Quotation
    quotation.status = 'UNDER_NEGOTIATION';
    quotation.lines = metrics.pricing.lines.map((l) => ({
      ...l,
      quotationId,
    }));
    quotation.subtotal = metrics.pricing.subtotal;
    quotation.discountAmount = metrics.pricing.discountAmount;
    quotation.taxAmount = metrics.pricing.taxAmount;
    quotation.total = metrics.pricing.total;
    quotation.totalCost = metrics.pricing.totalCost;
    quotation.marginPct = metrics.pricing.marginPct;
    quotation.riskScore = metrics.riskEvaluation.riskScore;
    quotation.riskLevel = metrics.riskEvaluation.riskLevel;

    // 4. Re-evaluate approval requirements
    if (metrics.approvalDecision.requiresApproval) {
      quotation.approvalRequired = true;
      quotation.approvalRoleRequired = metrics.approvalDecision.requiredRole;
      quotation.approvalStatus = 'PENDING';

      // Re-trigger / create approval request
      await ApprovalRepository.createRequest({
        id: `appr_req_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        quotationId: quotation.id,
        quotationNumber: quotation.quotationNumber,
        customerName: quotation.customerName,
        totalAmount: quotation.total,
        discountPct: newDiscountPct,
        riskLevel: quotation.riskLevel,
        riskScore: quotation.riskScore,
        requiredRole: metrics.approvalDecision.requiredRole || 'SALES_MANAGER',
        status: 'PENDING',
        requestedAt: new Date().toISOString(),
        reason: `Commercial terms renegotiated to ${newDiscountPct}% discount. Re-approval required.`,
      });
    } else {
      quotation.approvalRequired = false;
      quotation.approvalStatus = 'NOT_REQUIRED';
    }

    await QuotationRepository.update(quotation.id, quotation);

    await AuditRepository.log({
      actorId: user.id,
      actorName: user.name,
      actorRole: user.role,
      entityType: 'NEGOTIATION',
      entityId: quotation.id,
      action: 'RECALCULATE_TERMS',
      comment: reason,
      newValues: {
        newDiscountPct,
        newTotal: quotation.total,
        newRiskScore: quotation.riskScore,
        requiresApproval: quotation.approvalRequired,
      },
    });
  }

  public static async acceptNegotiation(negotiationId: string, user: User): Promise<Negotiation> {
    const negotiation = await NegotiationRepository.findById(negotiationId);
    if (!negotiation) throw new Error('Negotiation not found');

    negotiation.status = 'ACCEPTED';
    negotiation.updatedAt = new Date().toISOString();

    const quotation = await QuotationRepository.findById(negotiation.quotationId);
    if (quotation) {
      if (!quotation.approvalRequired || quotation.approvalStatus === 'APPROVED') {
        quotation.status = 'APPROVED';
      }
      await QuotationRepository.update(quotation.id, quotation);
    }

    await NegotiationRepository.update(negotiationId, negotiation);

    await AuditRepository.log({
      actorId: user.id,
      actorName: user.name,
      actorRole: user.role,
      entityType: 'NEGOTIATION',
      entityId: negotiationId,
      action: 'ACCEPT_NEGOTIATION',
    });

    return negotiation;
  }
}
