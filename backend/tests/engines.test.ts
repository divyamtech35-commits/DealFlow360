import { describe, it, expect } from 'vitest';
import { PricingEngine } from '../src/engines/pricing.engine';
import { DiscountEngine } from '../src/engines/discount.engine';
import { RiskEngine } from '../src/engines/risk.engine';
import { ApprovalEngine } from '../src/engines/approval.engine';
import { FulfillmentEngine } from '../src/engines/fulfillment.engine';
import { BillingEngine } from '../src/engines/billing.engine';
import { DealHealthEngine } from '../src/engines/deal_health.engine';
import { RecommendationEngine } from '../src/engines/recommendation.engine';
import { Customer, CustomerTier, Product, Quotation, UpsellRule, User, Warehouse, WarehouseStock } from '../src/types';

describe('1. Pricing Engine', () => {
  it('correctly calculates line totals, tax, and margins without floating drift', () => {
    const result = PricingEngine.calculateQuotation('q1', [
      {
        productId: 'p1',
        productName: 'Laptop Pro',
        quantity: 2,
        unitPrice: 1000,
        unitCost: 600,
        discountPct: 10,
        taxRate: 10,
      },
    ]);

    // Subtotal: 2 * 1000 = 2000
    // Discount: 10% of 2000 = 200
    // Taxable: 1800
    // Tax: 10% of 1800 = 180
    // Total: 1980
    // Total cost: 2 * 600 = 1200
    // Margin: (1800 - 1200) / 1800 = 33.33%
    expect(result.subtotal).toBe(2000);
    expect(result.discountAmount).toBe(200);
    expect(result.taxAmount).toBe(180);
    expect(result.total).toBe(1980);
    expect(result.totalCost).toBe(1200);
    expect(result.marginPct).toBe(33.33);
  });
});

describe('2. Discount Engine', () => {
  const goldTier: CustomerTier = {
    id: 'tier_gold',
    name: 'Gold',
    baseDiscountLimitPct: 15,
    priorityLevel: 3,
    paymentTermsDays: 45,
  };

  it('allows discount exactly at tier limit', () => {
    const res = DiscountEngine.evaluateDiscount({
      tier: goldTier,
      requestedDiscountPct: 15,
      marginPct: 35,
    });
    expect(res.allowed).toBe(true);
    expect(res.violation).toBe(false);
    expect(res.requiresApproval).toBe(false);
  });

  it('flags discount above limit as violation and routes to Sales Manager', () => {
    const res = DiscountEngine.evaluateDiscount({
      tier: goldTier,
      requestedDiscountPct: 20, // +5% excess
      marginPct: 30,
    });
    expect(res.allowed).toBe(false);
    expect(res.violation).toBe(true);
    expect(res.requiresApproval).toBe(true);
    expect(res.approvalRole).toBe('SALES_MANAGER');
  });

  it('escalates to Finance if discount exceeds limit by >10%', () => {
    const res = DiscountEngine.evaluateDiscount({
      tier: goldTier,
      requestedDiscountPct: 28, // +13% excess
      marginPct: 25,
    });
    expect(res.allowed).toBe(false);
    expect(res.requiresApproval).toBe(true);
    expect(res.approvalRole).toBe('FINANCE');
  });
});

describe('3. Risk Engine', () => {
  const customer: Customer = {
    id: 'c1',
    name: 'Acme Corp',
    tierId: 't1',
    salesRepId: 'u1',
    contactEmail: 'acme@test.com',
    contactPhone: '123',
    address: 'Chicago',
    creditLimit: 100000,
    creditStatus: 'GOOD',
    riskProfile: 'LOW',
    createdAt: '',
    updatedAt: '',
  };

  it('produces LOW risk for compliant discounts and healthy margins', () => {
    const res = RiskEngine.evaluateRisk({
      customer,
      requestedDiscountPct: 10,
      maxAllowedDiscountPct: 15,
      marginPct: 40,
      totalDealAmount: 15000,
    });
    expect(res.riskLevel).toBe('LOW');
    expect(res.riskScore).toBeLessThanOrEqual(25);
  });

  it('produces HIGH or CRITICAL risk when discount is excessive and margin is depleted', () => {
    const res = RiskEngine.evaluateRisk({
      customer,
      requestedDiscountPct: 30,
      maxAllowedDiscountPct: 10,
      marginPct: 15,
      totalDealAmount: 120000,
    });
    expect(['HIGH', 'CRITICAL']).toContain(res.riskLevel);
    expect(res.riskScore).toBeGreaterThan(50);
  });
});

describe('4. Approval Engine', () => {
  const dummyQuotation: Quotation = {
    id: 'q1',
    quotationNumber: 'Q-101',
    customerId: 'c1',
    salesRepId: 'u1',
    status: 'DRAFT',
    lines: [],
    subtotal: 10000,
    discountAmount: 2000,
    taxAmount: 800,
    total: 8800,
    totalCost: 5000,
    marginPct: 37.5,
    riskScore: 65,
    riskLevel: 'HIGH',
    approvalRequired: true,
    validityDate: '2026-12-31',
    createdAt: '',
    updatedAt: '',
  };

  it('triggers approval requirement when risk level is HIGH', () => {
    const decision = ApprovalEngine.evaluateApprovalRequirement({
      quotation: dummyQuotation,
      discountViolation: true,
    });
    expect(decision.requiresApproval).toBe(true);
    expect(decision.requiredRole).toBe('SALES_MANAGER');
  });

  it('processes approve action and produces audit trail and APPROVED status', () => {
    const approver: User = {
      id: 'mgr_1',
      name: 'Sarah Manager',
      email: 'sarah@dealflow.com',
      role: 'SALES_MANAGER',
      createdAt: '',
      updatedAt: '',
    };

    const req = {
      id: 'req_1',
      quotationId: 'q1',
      requiredRole: 'SALES_MANAGER' as const,
      status: 'PENDING' as const,
      requestedAt: new Date().toISOString(),
      reason: 'Excess discount',
    };

    const result = ApprovalEngine.processAction(req, approver, 'APPROVE', 'Approved for deal closing');
    expect(result.updatedRequest.status).toBe('APPROVED');
    expect(result.approvalAction.action).toBe('APPROVE');
    expect(result.newQuotationStatus).toBe('APPROVED');
  });
});

describe('5. Fulfillment Engine', () => {
  const warehouses: Warehouse[] = [
    { id: 'wh_main', code: 'MAIN', name: 'Main Warehouse', location: 'Chicago', priority: 1 },
    { id: 'wh_east', code: 'EAST', name: 'East Warehouse', location: 'Newark', priority: 2 },
  ];

  it('allocates full stock from primary warehouse when available', () => {
    const currentStocks: WarehouseStock[] = [
      { id: 's1', warehouseId: 'wh_main', productId: 'p1', totalQuantity: 20, reservedQuantity: 0, availableQuantity: 20 },
      { id: 's2', warehouseId: 'wh_east', productId: 'p1', totalQuantity: 10, reservedQuantity: 0, availableQuantity: 10 },
    ];

    const lines = [
      {
        id: 'l1',
        quotationId: 'q1',
        productId: 'p1',
        quantity: 5,
        unitPrice: 100,
        unitCost: 60,
        discountPct: 0,
        discountAmount: 0,
        taxRate: 0,
        taxAmount: 0,
        lineTotal: 500,
        lineMarginPct: 40,
      },
    ];

    const plan = FulfillmentEngine.planFulfillment('ord_1', lines, warehouses, currentStocks);
    expect(plan.orderStatus).toBe('ALLOCATED');
    expect(plan.allocations.length).toBe(1);
    expect(plan.allocations[0].warehouseId).toBe('wh_main');
    expect(plan.allocations[0].allocatedQuantity).toBe(5);
    expect(plan.backorders.length).toBe(0);
  });

  it('allocates stock across warehouses and creates backorders when insufficient', () => {
    const currentStocks: WarehouseStock[] = [
      { id: 's1', warehouseId: 'wh_main', productId: 'p1', totalQuantity: 5, reservedQuantity: 0, availableQuantity: 5 },
      { id: 's2', warehouseId: 'wh_east', productId: 'p1', totalQuantity: 3, reservedQuantity: 0, availableQuantity: 3 },
    ];

    const lines = [
      {
        id: 'l1',
        quotationId: 'q1',
        productId: 'p1',
        quantity: 12, // Needs 12, total available is 8
        unitPrice: 100,
        unitCost: 60,
        discountPct: 0,
        discountAmount: 0,
        taxRate: 0,
        taxAmount: 0,
        lineTotal: 1200,
        lineMarginPct: 40,
      },
    ];

    const plan = FulfillmentEngine.planFulfillment('ord_2', lines, warehouses, currentStocks);
    expect(plan.orderStatus).toBe('PARTIALLY_ALLOCATED');
    expect(plan.allocations.length).toBe(2); // 5 from Main, 3 from East
    expect(plan.backorders.length).toBe(1);
    expect(plan.backorders[0].backorderQuantity).toBe(4); // 12 - 8 = 4
  });
});

describe('6. Billing Engine', () => {
  it('creates an issued invoice from quotation and handles payments', () => {
    const quotation: Quotation = {
      id: 'q1',
      quotationNumber: 'Q-200',
      customerId: 'c1',
      customerName: 'Acme',
      salesRepId: 'u1',
      status: 'CONFIRMED',
      lines: [
        {
          id: 'l1',
          quotationId: 'q1',
          productId: 'p1',
          productName: 'Laptop',
          quantity: 1,
          unitPrice: 1000,
          unitCost: 600,
          discountPct: 0,
          discountAmount: 0,
          taxRate: 10,
          taxAmount: 100,
          lineTotal: 1100,
          lineMarginPct: 40,
        },
      ],
      subtotal: 1000,
      discountAmount: 0,
      taxAmount: 100,
      total: 1100,
      totalCost: 600,
      marginPct: 40,
      riskScore: 10,
      riskLevel: 'LOW',
      approvalRequired: false,
      validityDate: '',
      createdAt: '',
      updatedAt: '',
    };

    const { invoice } = BillingEngine.createInvoiceFromQuotation(quotation);
    expect(invoice.status).toBe('ISSUED');
    expect(invoice.total).toBe(1100);
    expect(invoice.balanceDue).toBe(1100);

    // Make full payment
    const { updatedInvoice, payment } = BillingEngine.processPayment(
      invoice,
      1100,
      'WIRE_TRANSFER',
      'WIRE-999'
    );
    expect(payment.status).toBe('SUCCESS');
    expect(updatedInvoice.amountPaid).toBe(1100);
    expect(updatedInvoice.balanceDue).toBe(0);
    expect(updatedInvoice.status).toBe('PAID');
  });
});

describe('7. Recommendation Engine', () => {
  it('suggests related upsells and cross-sells based on basket products', () => {
    const products: Product[] = [
      { id: 'p_laptop', sku: 'LP1', name: 'Laptop Pro', categoryId: 'c1', basePrice: 1500, unitCost: 900, isSubscription: false, stockTrackable: true, status: 'ACTIVE' },
      { id: 'p_warranty', sku: 'WR1', name: 'Extended Warranty', categoryId: 'c2', basePrice: 299, unitCost: 50, isSubscription: false, stockTrackable: false, status: 'ACTIVE' },
    ];

    const rules: UpsellRule[] = [
      {
        id: 'r1',
        triggerProductId: 'p_laptop',
        recommendedProductId: 'p_warranty',
        ruleType: 'ADDON',
        discountIncentivePct: 10,
        reason: 'Recommended for Laptop Pro coverage',
      },
    ];

    const lines = [
      {
        id: 'l1',
        quotationId: 'q1',
        productId: 'p_laptop',
        productName: 'Laptop Pro',
        quantity: 1,
        unitPrice: 1500,
        unitCost: 900,
        discountPct: 0,
        discountAmount: 0,
        taxRate: 0,
        taxAmount: 0,
        lineTotal: 1500,
        lineMarginPct: 40,
      },
    ];

    const recs = RecommendationEngine.getRecommendations(lines, rules, products);
    expect(recs.length).toBe(1);
    expect(recs[0].recommendedProduct.id).toBe('p_warranty');
    expect(recs[0].ruleType).toBe('ADDON');
  });
});

describe('8. Deal Health Engine', () => {
  it('generates alerts for excessive discount and margin erosion', () => {
    const quotation: Quotation = {
      id: 'q1',
      quotationNumber: 'Q-300',
      customerId: 'c1',
      customerName: 'TechNova',
      salesRepId: 'u1',
      status: 'PENDING_APPROVAL',
      lines: [],
      subtotal: 10000,
      discountAmount: 3000, // 30% discount
      taxAmount: 0,
      total: 7000,
      totalCost: 6500,
      marginPct: 7.1, // < 25% target
      riskScore: 80,
      riskLevel: 'CRITICAL',
      approvalRequired: true,
      validityDate: '',
      createdAt: '',
      updatedAt: '',
    };

    const alerts = DealHealthEngine.evaluateDealHealth({
      quotation,
      daysInCurrentStatus: 7, // Stalled > 5 days
      hasBackorders: true,
    });

    const alertTypes = alerts.map((a) => a.type);
    expect(alertTypes).toContain('STALLED_DEAL');
    expect(alertTypes).toContain('EXCESSIVE_DISCOUNT');
    expect(alertTypes).toContain('MARGIN_EROSION');
    expect(alertTypes).toContain('FULFILLMENT_RISK');
  });
});
