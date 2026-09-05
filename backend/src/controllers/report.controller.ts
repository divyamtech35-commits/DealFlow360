import { Request, Response, NextFunction } from 'express';
import { ReportService } from '../services/report.service';
import { AuditRepository } from '../repositories/audit.repository';
import { sendSuccess } from '../utils/response';

export class ReportController {
  public static async getSales(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await ReportService.getSalesReport();
      sendSuccess(res, data);
    } catch (error) {
      next(error);
    }
  }

  public static async getRevenue(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await ReportService.getRevenueReport();
      sendSuccess(res, data);
    } catch (error) {
      next(error);
    }
  }

  public static async getFulfillment(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await ReportService.getFulfillmentReport();
      sendSuccess(res, data);
    } catch (error) {
      next(error);
    }
  }

  public static async getBilling(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await ReportService.getBillingReport();
      sendSuccess(res, data);
    } catch (error) {
      next(error);
    }
  }

  public static async getAuditLogs(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const logs = await AuditRepository.getAll({
        entityType: req.query.entityType as string,
        entityId: req.query.entityId as string,
      });
      sendSuccess(res, logs);
    } catch (error) {
      next(error);
    }
  }
}
