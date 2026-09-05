import { CustomerTier, DiscountRule, ProductCategory } from '../types';

export interface DiscountEvaluationInput {
  tier?: CustomerTier;
  category?: ProductCategory;
  rule?: DiscountRule;
  requestedDiscountPct: number;
  marginPct: number;
}

export interface DiscountEvaluationResult {
  allowed: boolean;
  maxAllowedDiscountPct: number;
  violation: boolean;
  requiresApproval: boolean;
  approvalRole?: 'SALES_MANAGER' | 'FINANCE';
  reasons: string[];
}

export class DiscountEngine {
  /**
   * Deterministically evaluates whether a requested discount is within limits or triggers approval escalation.
   */
  public static evaluateDiscount(input: DiscountEvaluationInput): DiscountEvaluationResult {
    const reasons: string[] = [];
    let maxAllowed = 10; // default fallback 10%

    // 1. Customer tier discount baseline
    if (input.tier) {
      maxAllowed = input.tier.baseDiscountLimitPct;
    }

    // 2. Specific rule override
    if (input.rule && input.rule.maxDiscountPct !== undefined) {
      maxAllowed = input.rule.maxDiscountPct;
    }

    // 3. Category cap override if tighter
    if (input.category && input.category.maxCategoryDiscountPct !== undefined) {
      maxAllowed = Math.min(maxAllowed, input.category.maxCategoryDiscountPct);
    }

    const requested = Math.max(0, input.requestedDiscountPct);
    const excessDiscount = requested - maxAllowed;

    let allowed = true;
    let violation = false;
    let requiresApproval = false;
    let approvalRole: 'SALES_MANAGER' | 'FINANCE' | undefined = undefined;

    if (excessDiscount > 0) {
      violation = true;
      requiresApproval = true;
      reasons.push(
        `Requested discount (${requested}%) exceeds the authorized tier limit of ${maxAllowed}% by ${excessDiscount.toFixed(1)}%.`
      );

      if (excessDiscount > 10 || input.marginPct < 20) {
        approvalRole = 'FINANCE';
        reasons.push(
          excessDiscount > 10
            ? `Excess discount exceeds 10% tolerance; escalated to Finance.`
            : `Gross margin (${input.marginPct.toFixed(1)}%) is below minimum threshold (20%); escalated to Finance.`
        );
      } else {
        approvalRole = 'SALES_MANAGER';
        reasons.push(`Discount within manager discretion limit; requires Sales Manager approval.`);
      }
    } else {
      reasons.push(`Requested discount (${requested}%) is within the approved ${maxAllowed}% policy.`);
    }

    // Margin check even if discount is nominally within tier
    if (!violation && input.marginPct < 20) {
      violation = true;
      requiresApproval = true;
      approvalRole = 'FINANCE';
      reasons.push(`Gross margin (${input.marginPct.toFixed(1)}%) is below company minimum 20%.`);
    }

    allowed = !violation;

    return {
      allowed,
      maxAllowedDiscountPct: maxAllowed,
      violation,
      requiresApproval,
      approvalRole,
      reasons,
    };
  }
}
