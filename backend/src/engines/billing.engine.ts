import { Invoice, InvoiceLine, InvoiceStatus, Payment, Quotation } from '../types';
import { PricingEngine } from './pricing.engine';

export class BillingEngine {
  /**
   * Generates a new invoice from a confirmed quotation.
   */
  public static createInvoiceFromQuotation(quotation: Quotation): {
    invoice: Invoice;
    lines: InvoiceLine[];
  } {
    const invoiceId = `inv_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const invoiceNumber = `INV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const now = new Date();
    const dueDate = new Date();
    dueDate.setDate(now.getDate() + 30); // Net 30 default

    const lines: InvoiceLine[] = quotation.lines.map((ql, idx) => ({
      id: `inv_line_${invoiceId}_${idx + 1}`,
      invoiceId,
      description: `${ql.productName || 'Item'} (Qty: ${ql.quantity})`,
      quantity: ql.quantity,
      unitPrice: ql.unitPrice,
      lineTotal: ql.lineTotal,
    }));

    const invoice: Invoice = {
      id: invoiceId,
      invoiceNumber,
      customerId: quotation.customerId,
      customerName: quotation.customerName,
      quotationId: quotation.id,
      type: 'ONE_TIME',
      status: 'ISSUED',
      lines,
      subtotal: quotation.subtotal,
      taxAmount: quotation.taxAmount,
      total: quotation.total,
      amountPaid: 0,
      balanceDue: quotation.total,
      dueDate: dueDate.toISOString(),
      issuedAt: now.toISOString(),
    };

    return { invoice, lines };
  }

  /**
   * Processes a payment against an invoice and updates balance due and status.
   */
  public static processPayment(
    invoice: Invoice,
    paymentAmount: number,
    paymentMethod: Payment['paymentMethod'],
    referenceNumber: string
  ): {
    updatedInvoice: Invoice;
    payment: Payment;
  } {
    const validAmount = PricingEngine.round(Math.max(0, paymentAmount));
    const newAmountPaid = PricingEngine.round(invoice.amountPaid + validAmount);
    const newBalanceDue = PricingEngine.round(Math.max(0, invoice.total - newAmountPaid));

    let newStatus: InvoiceStatus = invoice.status;
    if (newBalanceDue <= 0) {
      newStatus = 'PAID';
    } else if (newAmountPaid > 0) {
      newStatus = 'ISSUED';
    }

    const now = new Date().toISOString();

    const payment: Payment = {
      id: `pay_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      invoiceId: invoice.id,
      amount: validAmount,
      paymentMethod,
      referenceNumber: referenceNumber || `REF-${Math.floor(100000 + Math.random() * 900000)}`,
      paidAt: now,
      status: 'SUCCESS',
    };

    const updatedInvoice: Invoice = {
      ...invoice,
      amountPaid: newAmountPaid,
      balanceDue: newBalanceDue,
      status: newStatus,
      paidAt: newStatus === 'PAID' ? now : invoice.paidAt,
    };

    return { updatedInvoice, payment };
  }
}
