import { ApprovalRepository } from '../repositories/approval.repository';
import { QuotationRepository } from '../repositories/quotation.repository';
import { AuditRepository } from '../repositories/audit.repository';
import { ApprovalEngine } from '../engines/approval.engine';
import { ApprovalRequest, User } from '../types';

export class ApprovalService {
  public static async getAllRequests(filter?: { status?: string; requiredRole?: string }): Promise<ApprovalRequest[]> {
    return ApprovalRepository.getAllRequests(filter);
  }

  public static async getRequestById(id: string): Promise<ApprovalRequest | null> {
    return ApprovalRepository.findRequestById(id);
  }

  public static async getActionsByQuotationId(quotationId: string) {
    return ApprovalRepository.getActionsByQuotationId(quotationId);
  }

  public static async processApproval(
    requestId: string,
    action: 'APPROVE' | 'REJECT',
    comment: string,
    user: User
  ): Promise<{ request: ApprovalRequest; quotation: any }> {
    const request = await ApprovalRepository.findRequestById(requestId);
    if (!request) throw new Error('Approval request not found');

    if (request.status !== 'PENDING') {
      throw new Error(`Approval request has already been ${request.status.toLowerCase()}`);
    }

    const quotation = await QuotationRepository.findById(request.quotationId);
    if (!quotation) throw new Error('Associated quotation not found');

    const result = ApprovalEngine.processAction(request, user, action, comment);

    await ApprovalRepository.updateRequest(requestId, result.updatedRequest);
    await ApprovalRepository.recordAction(result.approvalAction);

    quotation.status = result.newQuotationStatus;
    quotation.approvalStatus = action === 'APPROVE' ? 'APPROVED' : 'REJECTED';
    const updatedQuotation = await QuotationRepository.update(quotation.id, quotation);

    await AuditRepository.log({
      actorId: user.id,
      actorName: user.name,
      actorRole: user.role,
      entityType: 'APPROVAL',
      entityId: requestId,
      action: `QUOTATION_${action}`,
      comment,
      newValues: { quotationStatus: quotation.status, approver: user.name },
    });

    return { request: result.updatedRequest, quotation: updatedQuotation };
  }
}
