import { BillingRepository } from '../repositories/billing.repository';
import { AuditRepository } from '../repositories/audit.repository';
import { BillingEngine } from '../engines/billing.engine';
import { Invoice, Payment, Quotation, Subscription, SubscriptionStatus, User } from '../types';

export class BillingService {
  public static async getAllInvoices(filter?: { customerId?: string; status?: string }): Promise<Invoice[]> {
    return BillingRepository.getAllInvoices(filter);
  }

  public static async getInvoiceById(id: string): Promise<Invoice | null> {
    return BillingRepository.findInvoiceById(id);
  }

  public static async generateInvoice(quotation: Quotation): Promise<Invoice> {
    const existing = await BillingRepository.findInvoiceByQuotationId(quotation.id);
    if (existing) return existing;

    const { invoice } = BillingEngine.createInvoiceFromQuotation(quotation);
    return BillingRepository.createInvoice(invoice);
  }

  public static async recordPayment(
    invoiceId: string,
    amount: number,
    paymentMethod: Payment['paymentMethod'],
    referenceNumber: string,
    user: User
  ): Promise<{ invoice: Invoice; payment: Payment }> {
    const invoice = await BillingRepository.findInvoiceById(invoiceId);
    if (!invoice) throw new Error('Invoice not found');

    const { updatedInvoice, payment } = BillingEngine.processPayment(
      invoice,
      amount,
      paymentMethod,
      referenceNumber
    );

    const savedInvoice = await BillingRepository.updateInvoice(invoiceId, updatedInvoice);

    await AuditRepository.log({
      actorId: user.id,
      actorName: user.name,
      actorRole: user.role,
      entityType: 'INVOICE',
      entityId: invoiceId,
      action: 'RECORD_PAYMENT',
      newValues: { amount, paymentMethod, status: savedInvoice?.status },
    });

    return { invoice: savedInvoice!, payment };
  }

  public static async getAllSubscriptions(customerId?: string): Promise<Subscription[]> {
    return BillingRepository.getAllSubscriptions(customerId ? { customerId } : undefined);
  }

  public static async updateSubscriptionStatus(
    id: string,
    status: SubscriptionStatus,
    user: User
  ): Promise<Subscription> {
    const sub = await BillingRepository.findSubscriptionById(id);
    if (!sub) throw new Error('Subscription not found');

    const updated = await BillingRepository.updateSubscription(id, { status });
    if (!updated) throw new Error('Failed to update subscription');

    await AuditRepository.log({
      actorId: user.id,
      actorName: user.name,
      actorRole: user.role,
      entityType: 'SUBSCRIPTION',
      entityId: id,
      action: `UPDATE_STATUS_${status}`,
    });

    return updated;
  }
}
