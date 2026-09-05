import { InMemoryStore } from './in_memory_store';
import { CreditNote, Invoice, Payment, Subscription } from '../types';

export class BillingRepository {
  public static async getAllInvoices(filter?: { customerId?: string; status?: string }): Promise<Invoice[]> {
    let list = InMemoryStore.invoices;
    if (filter?.customerId) {
      list = list.filter((i) => i.customerId === filter.customerId);
    }
    if (filter?.status) {
      list = list.filter((i) => i.status === filter.status);
    }
    return list;
  }

  public static async findInvoiceById(id: string): Promise<Invoice | null> {
    return InMemoryStore.invoices.find((i) => i.id === id) || null;
  }

  public static async findInvoiceByQuotationId(quotationId: string): Promise<Invoice | null> {
    return InMemoryStore.invoices.find((i) => i.quotationId === quotationId) || null;
  }

  public static async createInvoice(invoice: Invoice): Promise<Invoice> {
    InMemoryStore.invoices.unshift(invoice);
    return invoice;
  }

  public static async updateInvoice(id: string, partial: Partial<Invoice>): Promise<Invoice | null> {
    const idx = InMemoryStore.invoices.findIndex((i) => i.id === id);
    if (idx === -1) return null;
    InMemoryStore.invoices[idx] = {
      ...InMemoryStore.invoices[idx],
      ...partial,
    };
    return InMemoryStore.invoices[idx];
  }

  public static async getAllSubscriptions(filter?: { customerId?: string }): Promise<Subscription[]> {
    let list = InMemoryStore.subscriptions;
    if (filter?.customerId) {
      list = list.filter((s) => s.customerId === filter.customerId);
    }
    return list;
  }

  public static async findSubscriptionById(id: string): Promise<Subscription | null> {
    return InMemoryStore.subscriptions.find((s) => s.id === id) || null;
  }

  public static async createSubscription(sub: Subscription): Promise<Subscription> {
    InMemoryStore.subscriptions.unshift(sub);
    return sub;
  }

  public static async updateSubscription(id: string, partial: Partial<Subscription>): Promise<Subscription | null> {
    const idx = InMemoryStore.subscriptions.findIndex((s) => s.id === id);
    if (idx === -1) return null;
    InMemoryStore.subscriptions[idx] = {
      ...InMemoryStore.subscriptions[idx],
      ...partial,
    };
    return InMemoryStore.subscriptions[idx];
  }

  public static async createCreditNote(note: CreditNote): Promise<CreditNote> {
    InMemoryStore.creditNotes.unshift(note);
    return note;
  }

  public static async getCreditNotes(invoiceId?: string): Promise<CreditNote[]> {
    if (invoiceId) {
      return InMemoryStore.creditNotes.filter((c) => c.invoiceId === invoiceId);
    }
    return InMemoryStore.creditNotes;
  }
}
