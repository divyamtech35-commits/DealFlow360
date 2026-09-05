import { Request, Response, NextFunction } from 'express';
import { QuotationService } from '../services/quotation.service';
import { CalculateQuotationSchema, CreateQuotationSchema } from '../validators';
import { sendSuccess, sendError } from '../utils/response';

export class QuotationController {
  public static async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = req.user!;
      // If customer role, strictly scope to their customerId
      const filter: { customerId?: string; salesRepId?: string } = {};
      if (user.role === 'CUSTOMER' && user.customerId) {
        filter.customerId = user.customerId;
      } else if (user.role === 'SALES_REP') {
        // Sales reps can view all or filter by query param
        if (req.query.customerId) filter.customerId = String(req.query.customerId);
      }

      const quotations = await QuotationService.getAllQuotations(filter);
      sendSuccess(res, quotations);
    } catch (error) {
      next(error);
    }
  }

  public static async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const quotation = await QuotationService.getQuotationById(req.params.id);
      if (!quotation) {
        sendError(res, 'QUOTATION_NOT_FOUND', 'Quotation not found', 404);
        return;
      }

      // Security check: customer can only view their own quotation
      if (req.user?.role === 'CUSTOMER' && req.user.customerId && quotation.customerId !== req.user.customerId) {
        sendError(res, 'FORBIDDEN', 'Access denied to this quotation', 403);
        return;
      }

      sendSuccess(res, quotation);
    } catch (error) {
      next(error);
    }
  }

  public static async calculate(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = CalculateQuotationSchema.parse(req.body);
      const metrics = await QuotationService.calculateMetrics(data.customerId, data.lines);
      sendSuccess(res, metrics, 'Metrics calculated successfully');
    } catch (error) {
      next(error);
    }
  }

  public static async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = CreateQuotationSchema.parse(req.body);
      const quotation = await QuotationService.createQuotation(req.user!, data);
      sendSuccess(res, quotation, 'Quotation draft created successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  public static async submit(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const quotation = await QuotationService.submitQuotation(req.params.id, req.user!);
      sendSuccess(res, quotation, 'Quotation submitted successfully');
    } catch (error) {
      next(error);
    }
  }

  public static async confirm(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await QuotationService.confirmQuotation(req.params.id, req.user!);
      sendSuccess(res, result, 'Deal confirmed! Fulfillment order and invoice created.');
    } catch (error) {
      next(error);
    }
  }

  public static async cancel(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const quotation = await QuotationService.cancelQuotation(req.params.id, req.user!, req.body.reason);
      sendSuccess(res, quotation, 'Quotation cancelled successfully');
    } catch (error) {
      next(error);
    }
  }
}
