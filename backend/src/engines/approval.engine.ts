import { ApprovalAction, ApprovalRequest, Quotation, RiskLevel, User } from '../types';

export interface ApprovalCheckInput {
  quotation: Quotation;
  discountViolation: boolean;
  approvalRoleHint?: 'SALES_MANAGER' | 'FINANCE';
}

export interface ApprovalDecision {
  requiresApproval: boolean;
  requiredRole?: 'SALES_MANAGER' | 'FINANCE';
  reason: string;
}

export class ApprovalEngine {
  /**
   * Evaluates if a quotation demands management or financial approval before it can be submitted or confirmed.
   */
  public static evaluateApprovalRequirement(input: ApprovalCheckInput): ApprovalDecision {
    const { quotation, discountViolation, approvalRoleHint } = input;

    // 1. Critical or High Risk
    if (quotation.riskLevel === 'CRITICAL') {
      return {
        requiresApproval: true,
        requiredRole: 'FINANCE',
        reason: `Quotation has CRITICAL risk score (${quotation.riskScore}/100); executive finance clearance required.`,
      };
    }

    // 2. Finance requirement from discount/margin engine
    if (approvalRoleHint === 'FINANCE') {
      return {
        requiresApproval: true,
        requiredRole: 'FINANCE',
        reason: `Discount policy violation or margin below 20% threshold requires Finance approval.`,
      };
    }

    // 3. High Risk
    if (quotation.riskLevel === 'HIGH') {
      return {
        requiresApproval: true,
        requiredRole: 'SALES_MANAGER',
        reason: `Quotation has HIGH risk score (${quotation.riskScore}/100); requires Sales Manager review.`,
      };
    }

    // 4. Discount policy violation within manager tolerance
    if (discountViolation) {
      return {
        requiresApproval: true,
        requiredRole: 'SALES_MANAGER',
        reason: `Requested discount exceeds tier policy; requires Sales Manager sign-off.`,
      };
    }

    // 5. Total deal value threshold ($50,000+)
    if (quotation.total >= 50000) {
      return {
        requiresApproval: true,
        requiredRole: 'SALES_MANAGER',
        reason: `High value deal ($${quotation.total.toLocaleString()}) requires Sales Manager authorization.`,
      };
    }

    return {
      requiresApproval: false,
      reason: 'Quotation complies with all commercial and risk thresholds. No approval required.',
    };
  }

  /**
   * Applies an approval decision to an existing approval request and quotation.
   */
  public static processAction(
    request: ApprovalRequest,
    user: User,
    action: 'APPROVE' | 'REJECT',
    comment: string
  ): {
    updatedRequest: ApprovalRequest;
    approvalAction: ApprovalAction;
    newQuotationStatus: 'APPROVED' | 'REJECTED';
  } {
    const now = new Date().toISOString();

    const updatedRequest: ApprovalRequest = {
      ...request,
      status: action === 'APPROVE' ? 'APPROVED' : 'REJECTED',
      resolvedAt: now,
    };

    const approvalAction: ApprovalAction = {
      id: `action_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      approvalRequestId: request.id,
      quotationId: request.quotationId,
      approverId: user.id,
      approverName: user.name,
      action,
      comment: comment || (action === 'APPROVE' ? 'Approved by manager' : 'Rejected by manager'),
      actedAt: now,
    };

    return {
      updatedRequest,
      approvalAction,
      newQuotationStatus: action === 'APPROVE' ? 'APPROVED' : 'REJECTED',
    };
  }
}
