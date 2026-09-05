import { Customer, RiskLevel } from '../types';

export interface RiskEvaluationInput {
  customer?: Customer;
  requestedDiscountPct: number;
  maxAllowedDiscountPct: number;
  marginPct: number;
  totalDealAmount: number;
}

export interface RiskEvaluationResult {
  riskScore: number;
  riskLevel: RiskLevel;
  discountRisk: number;
  marginRisk: number;
  customerRisk: number;
  dealSizeRisk: number;
  factors: string[];
}

export class RiskEngine {
  /**
   * Deterministically calculates risk score (0-100) and assigns risk level.
   * Isolates all risk formulas centrally as mandated by specification.
   */
  public static evaluateRisk(input: RiskEvaluationInput): RiskEvaluationResult {
    const factors: string[] = [];
    let discountRisk = 0;
    let marginRisk = 0;
    let customerRisk = 0;
    let dealSizeRisk = 0;

    // 1. Discount Deviation Risk (Weight: 40%)
    const excessDiscount = Math.max(0, input.requestedDiscountPct - input.maxAllowedDiscountPct);
    if (excessDiscount > 0) {
      // 4 points per percentage point of excess discount up to 40 max
      discountRisk = Math.min(40, Math.round(excessDiscount * 4));
      factors.push(`Discount exceeds limit by ${excessDiscount.toFixed(1)}% (+${discountRisk} risk pts)`);
    }

    // 2. Margin Risk (Weight: 30%)
    // Benchmark healthy margin is 35%. Below 35% adds risk.
    if (input.marginPct < 35) {
      const marginShortfall = Math.max(0, 35 - input.marginPct);
      marginRisk = Math.min(30, Math.round(marginShortfall * 2));
      factors.push(`Gross margin is ${input.marginPct.toFixed(1)}% (below 35% target) (+${marginRisk} risk pts)`);
    }

    // 3. Customer Profile Risk (Weight: 20%)
    if (input.customer) {
      if (input.customer.creditStatus === 'BLOCKED') {
        customerRisk += 20;
        factors.push(`Customer credit is BLOCKED (+20 risk pts)`);
      } else if (input.customer.creditStatus === 'WARNING') {
        customerRisk += 10;
        factors.push(`Customer credit is in WARNING state (+10 risk pts)`);
      }

      if (input.customer.riskProfile === 'HIGH') {
        customerRisk += 10;
        factors.push(`Customer designated as HIGH risk profile (+10 risk pts)`);
      } else if (input.customer.riskProfile === 'MEDIUM') {
        customerRisk += 5;
        factors.push(`Customer designated as MEDIUM risk profile (+5 risk pts)`);
      }
    }
    customerRisk = Math.min(20, customerRisk);

    // 4. Deal Size Exposure (Weight: 10%)
    if (input.totalDealAmount > 100000) {
      dealSizeRisk = 10;
      factors.push(`High-value transaction above $100,000 (+10 risk pts)`);
    } else if (input.totalDealAmount > 50000) {
      dealSizeRisk = 5;
      factors.push(`Medium-value transaction above $50,000 (+5 risk pts)`);
    }

    // Baseline minimum operational risk: 5
    const baseRisk = 5;
    const totalRawScore = baseRisk + discountRisk + marginRisk + customerRisk + dealSizeRisk;
    const riskScore = Math.min(100, Math.max(0, totalRawScore));

    let riskLevel: RiskLevel = 'LOW';
    if (riskScore >= 76) {
      riskLevel = 'CRITICAL';
    } else if (riskScore >= 51) {
      riskLevel = 'HIGH';
    } else if (riskScore >= 26) {
      riskLevel = 'MEDIUM';
    } else {
      riskLevel = 'LOW';
    }

    return {
      riskScore,
      riskLevel,
      discountRisk,
      marginRisk,
      customerRisk,
      dealSizeRisk,
      factors,
    };
  }
}
