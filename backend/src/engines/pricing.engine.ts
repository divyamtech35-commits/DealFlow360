import { QuotationLine } from '../types';

export interface PricingCalculationInputLine {
  productId: string;
  productName?: string;
  variantId?: string;
  quantity: number;
  unitPrice: number;
  unitCost: number;
  discountPct: number;
  taxRate?: number; // e.g. 10 for 10%
}

export interface PricingCalculationResult {
  lines: QuotationLine[];
  subtotal: number;
  discountAmount: number;
  taxAmount: number;
  total: number;
  totalCost: number;
  marginPct: number;
}

export class PricingEngine {
  /**
   * Rounds a number safely to 2 decimal places to avoid IEEE-754 precision drift.
   */
  public static round(value: number): number {
    return Math.round((value + Number.EPSILON) * 100) / 100;
  }

  /**
   * Deterministically calculates line items and quotation totals.
   */
  public static calculateQuotation(
    quotationId: string,
    rawLines: PricingCalculationInputLine[]
  ): PricingCalculationResult {
    let subtotal = 0;
    let totalDiscountAmount = 0;
    let totalTaxAmount = 0;
    let totalCost = 0;

    const calculatedLines: QuotationLine[] = rawLines.map((line, idx) => {
      const quantity = Math.max(1, Math.floor(line.quantity || 1));
      const unitPrice = this.round(Math.max(0, line.unitPrice || 0));
      const unitCost = this.round(Math.max(0, line.unitCost || 0));
      const discountPct = Math.min(100, Math.max(0, line.discountPct || 0));
      const taxRate = Math.max(0, line.taxRate !== undefined ? line.taxRate : 8.5); // default standard 8.5% tax

      const lineSubtotal = this.round(unitPrice * quantity);
      const lineDiscountAmount = this.round(lineSubtotal * (discountPct / 100));
      const lineTaxable = this.round(lineSubtotal - lineDiscountAmount);
      const lineTaxAmount = this.round(lineTaxable * (taxRate / 100));
      const lineTotal = this.round(lineTaxable + lineTaxAmount);
      const lineTotalCost = this.round(unitCost * quantity);

      const lineMarginPct =
        lineTaxable > 0
          ? this.round(((lineTaxable - lineTotalCost) / lineTaxable) * 100)
          : 0;

      subtotal += lineSubtotal;
      totalDiscountAmount += lineDiscountAmount;
      totalTaxAmount += lineTaxAmount;
      totalCost += lineTotalCost;

      return {
        id: `line_${quotationId}_${idx + 1}`,
        quotationId,
        productId: line.productId,
        productName: line.productName || 'Product',
        variantId: line.variantId,
        quantity,
        unitPrice,
        unitCost,
        discountPct,
        discountAmount: lineDiscountAmount,
        taxRate,
        taxAmount: lineTaxAmount,
        lineTotal,
        lineMarginPct,
      };
    });

    subtotal = this.round(subtotal);
    totalDiscountAmount = this.round(totalDiscountAmount);
    totalTaxAmount = this.round(totalTaxAmount);
    totalCost = this.round(totalCost);

    const taxableAmount = this.round(subtotal - totalDiscountAmount);
    const total = this.round(taxableAmount + totalTaxAmount);
    const marginPct =
      taxableAmount > 0
        ? this.round(((taxableAmount - totalCost) / taxableAmount) * 100)
        : 0;

    return {
      lines: calculatedLines,
      subtotal,
      discountAmount: totalDiscountAmount,
      taxAmount: totalTaxAmount,
      total,
      totalCost,
      marginPct,
    };
  }
}
