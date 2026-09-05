import { Request, Response, NextFunction } from 'express';
import { DealHealthService } from '../services/deal_health.service';
import { sendSuccess } from '../utils/response';

export class DealHealthController {
  public static async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const alerts = await DealHealthService.getAllAlerts();
      sendSuccess(res, alerts);
    } catch (error) {
      next(error);
    }
  }

  public static async getForQuotation(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const alerts = await DealHealthService.getAlertsForQuotation(req.params.id);
      sendSuccess(res, alerts);
    } catch (error) {
      next(error);
    }
  }

  public static async resolve(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const success = await DealHealthService.resolveAlert(req.params.id);
      sendSuccess(res, { resolved: success }, 'Alert resolved');
    } catch (error) {
      next(error);
    }
  }
}
