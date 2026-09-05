import { InMemoryStore } from './in_memory_store';
import { ApprovalAction, ApprovalRequest } from '../types';

export class ApprovalRepository {
  public static async getAllRequests(filter?: { status?: string; requiredRole?: string }): Promise<ApprovalRequest[]> {
    let list = InMemoryStore.approvalRequests;
    if (filter?.status) {
      list = list.filter((r) => r.status === filter.status);
    }
    if (filter?.requiredRole) {
      list = list.filter((r) => r.requiredRole === filter.requiredRole);
    }
    return list;
  }

  public static async findRequestById(id: string): Promise<ApprovalRequest | null> {
    return InMemoryStore.approvalRequests.find((r) => r.id === id) || null;
  }

  public static async findRequestByQuotationId(quotationId: string): Promise<ApprovalRequest | null> {
    return InMemoryStore.approvalRequests.find((r) => r.quotationId === quotationId) || null;
  }

  public static async createRequest(request: ApprovalRequest): Promise<ApprovalRequest> {
    InMemoryStore.approvalRequests.unshift(request);
    return request;
  }

  public static async updateRequest(id: string, partial: Partial<ApprovalRequest>): Promise<ApprovalRequest | null> {
    const idx = InMemoryStore.approvalRequests.findIndex((r) => r.id === id);
    if (idx === -1) return null;
    InMemoryStore.approvalRequests[idx] = {
      ...InMemoryStore.approvalRequests[idx],
      ...partial,
    };
    return InMemoryStore.approvalRequests[idx];
  }

  public static async recordAction(action: ApprovalAction): Promise<ApprovalAction> {
    InMemoryStore.approvalActions.unshift(action);
    return action;
  }

  public static async getActionsByQuotationId(quotationId: string): Promise<ApprovalAction[]> {
    return InMemoryStore.approvalActions.filter((a) => a.quotationId === quotationId);
  }
}
