import { QuotationRepository } from '../repositories/quotation.repository';
import { BillingRepository } from '../repositories/billing.repository';
import { FulfillmentRepository } from '../repositories/fulfillment.repository';
import { PricingEngine } from '../engines/pricing.engine';

export class ReportService {
  public static async getSalesReport() {
    const quotations = await QuotationRepository.getAll();

    const totalPipelineValue = quotations.reduce((acc, q) => acc + q.total, 0);
    const confirmedDeals = quotations.filter((q) => q.status === 'CONFIRMED');
    const confirmedValue = confirmedDeals.reduce((acc, q) => acc + q.total, 0);

    const statusCounts = quotations.reduce((acc, q) => {
      acc[q.status] = (acc[q.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalQuotations: quotations.length,
      totalPipelineValue: PricingEngine.round(totalPipelineValue),
      confirmedDealsCount: confirmedDeals.length,
      confirmedValue: PricingEngine.round(confirmedValue),
      winRatePct: quotations.length > 0 ? PricingEngine.round((confirmedDeals.length / quotations.length) * 100) : 0,
      statusCounts,
    };
  }

  public static async getRevenueReport() {
    const invoices = await BillingRepository.getAllInvoices();
    const totalInvoiced = invoices.reduce((acc, i) => acc + i.total, 0);
    const totalCollected = invoices.reduce((acc, i) => acc + i.amountPaid, 0);
    const totalOutstanding = invoices.reduce((acc, i) => acc + i.balanceDue, 0);

    return {
      totalInvoiced: PricingEngine.round(totalInvoiced),
      totalCollected: PricingEngine.round(totalCollected),
      totalOutstanding: PricingEngine.round(totalOutstanding),
      paidInvoiceCount: invoices.filter((i) => i.status === 'PAID').length,
      openInvoiceCount: invoices.filter((i) => i.status === 'ISSUED').length,
    };
  }

  public static async getFulfillmentReport() {
    const orders = await FulfillmentRepository.getAllOrders();
    const allocated = orders.filter((o) => o.status === 'ALLOCATED').length;
    const partial = orders.filter((o) => o.status === 'PARTIALLY_ALLOCATED').length;
    const totalBackorders = orders.reduce((acc, o) => acc + (o.backorders?.length || 0), 0);

    return {
      totalOrders: orders.length,
      fullyAllocatedCount: allocated,
      partiallyAllocatedCount: partial,
      totalBackorders,
    };
  }

  public static async getBillingReport() {
    const invoices = await BillingRepository.getAllInvoices();
    const subscriptions = await BillingRepository.getAllSubscriptions();

    return {
      activeSubscriptions: subscriptions.filter((s) => s.status === 'ACTIVE').length,
      monthlyRecurringRevenue: subscriptions
        .filter((s) => s.status === 'ACTIVE' && s.billingInterval === 'MONTHLY')
        .reduce((acc, s) => acc + s.amount, 0),
      totalInvoices: invoices.length,
    };
  }
}
