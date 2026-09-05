import { Request, Response, NextFunction } from 'express';
import { ApprovalService } from '../services/approval.service';
import { ApprovalActionSchema } from '../validators';
import { sendSuccess, sendError } from '../utils/response';

export class ApprovalController {
  public static async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const status = req.query.status as string;
      const requiredRole = req.query.requiredRole as string;
      const requests = await ApprovalService.getAllRequests({ status, requiredRole });
      sendSuccess(res, requests);
    } catch (error) {
      next(error);
    }
  }

  public static async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const request = await ApprovalService.getRequestById(req.params.id);
      if (!request) {
        sendError(res, 'REQUEST_NOT_FOUND', 'Approval request not found', 404);
        return;
      }
      sendSuccess(res, request);
    } catch (error) {
      next(error);
    }
  }

  public static async approve(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const comment = (req.body.comment as string) || 'Approved by manager';
      const result = await ApprovalService.processApproval(req.params.id, 'APPROVE', comment, req.user!);
      sendSuccess(res, result, 'Quotation approved successfully');
    } catch (error) {
      next(error);
    }
  }

  public static async reject(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const comment = (req.body.comment as string) || 'Rejected by manager';
      const result = await ApprovalService.processApproval(req.params.id, 'REJECT', comment, req.user!);
      sendSuccess(res, result, 'Quotation rejected');
    } catch (error) {
      next(error);
    }
  }

  public static async getHistory(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const actions = await ApprovalService.getActionsByQuotationId(req.params.id);
      sendSuccess(res, actions);
    } catch (error) {
      next(error);
    }
  }
}
