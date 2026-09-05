import { DealHealthAlert, Quotation } from '../types';

export interface DealHealthInput {
  quotation: Quotation;
  daysInCurrentStatus?: number;
  negotiationRoundCount?: number;
  hasBackorders?: boolean;
}

export class DealHealthEngine {
  /**
   * Evaluates deal health and outputs proactive alerts for sales and finance operations.
   */
  public static evaluateDealHealth(input: DealHealthInput): DealHealthAlert[] {
    const alerts: DealHealthAlert[] = [];
    const { quotation, daysInCurrentStatus = 0, negotiationRoundCount = 0, hasBackorders = false } = input;
    const now = new Date().toISOString();

    // 1. Stalled Deal Alert: If in PENDING_APPROVAL or UNDER_NEGOTIATION for > 5 days
    if (['PENDING_APPROVAL', 'UNDER_NEGOTIATION'].includes(quotation.status) && daysInCurrentStatus >= 5) {
      alerts.push({
        id: `alert_stall_${quotation.id}`,
        quotationId: quotation.id,
        quotationNumber: quotation.quotationNumber,
        customerName: quotation.customerName,
        type: 'STALLED_DEAL',
        severity: daysInCurrentStatus > 10 ? 'HIGH' : 'MEDIUM',
        message: `Deal has remained in ${quotation.status} state for ${daysInCurrentStatus} days without progress.`,
        thresholdValue: 5,
        currentValue: daysInCurrentStatus,
        status: 'ACTIVE',
        createdAt: now,
      });
    }

    // 2. Excessive Discount Alert: If aggregate discount > 20%
    const effectiveDiscountPct =
      quotation.subtotal > 0
        ? Math.round((quotation.discountAmount / quotation.subtotal) * 100)
        : 0;

    if (effectiveDiscountPct >= 20) {
      alerts.push({
        id: `alert_disc_${quotation.id}`,
        quotationId: quotation.id,
        quotationNumber: quotation.quotationNumber,
        customerName: quotation.customerName,
        type: 'EXCESSIVE_DISCOUNT',
        severity: effectiveDiscountPct >= 30 ? 'CRITICAL' : 'HIGH',
        message: `Total discount is ${effectiveDiscountPct}%, triggering margin dilution alert.`,
        thresholdValue: 20,
        currentValue: effectiveDiscountPct,
        status: 'ACTIVE',
        createdAt: now,
      });
    }

    // 3. Margin Erosion Alert: If overall margin < 25%
    if (quotation.marginPct < 25 && quotation.total > 0) {
      alerts.push({
        id: `alert_margin_${quotation.id}`,
        quotationId: quotation.id,
        quotationNumber: quotation.quotationNumber,
        customerName: quotation.customerName,
        type: 'MARGIN_EROSION',
        severity: quotation.marginPct < 15 ? 'CRITICAL' : 'HIGH',
        message: `Gross profit margin is compressed at ${quotation.marginPct}%, below target 25%.`,
        thresholdValue: 25,
        currentValue: quotation.marginPct,
        status: 'ACTIVE',
        createdAt: now,
      });
    }

    // 4. Fulfillment Delay / Backorder Risk Alert
    if (hasBackorders) {
      alerts.push({
        id: `alert_fulf_${quotation.id}`,
        quotationId: quotation.id,
        quotationNumber: quotation.quotationNumber,
        customerName: quotation.customerName,
        type: 'FULFILLMENT_RISK',
        severity: 'MEDIUM',
        message: `Confirmed deal has pending backorders due to warehouse stock depletion.`,
        status: 'ACTIVE',
        createdAt: now,
      });
    }

    return alerts;
  }
}
