import { Request, Response, NextFunction } from 'express';
import { BillingService } from '../services/billing.service';
import { PaymentSchema } from '../validators';
import { sendSuccess, sendError } from '../utils/response';

export class BillingController {
  public static async getAllInvoices(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = req.user!;
      const customerId = user.role === 'CUSTOMER' ? user.customerId : (req.query.customerId as string);
      const status = req.query.status as string;

      const invoices = await BillingService.getAllInvoices({ customerId, status });
      sendSuccess(res, invoices);
    } catch (error) {
      next(error);
    }
  }

  public static async getInvoiceById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const invoice = await BillingService.getInvoiceById(req.params.id);
      if (!invoice) {
        sendError(res, 'INVOICE_NOT_FOUND', 'Invoice not found', 404);
        return;
      }
      sendSuccess(res, invoice);
    } catch (error) {
      next(error);
    }
  }

  public static async payInvoice(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { amount, paymentMethod, referenceNumber } = PaymentSchema.parse(req.body);
      const result = await BillingService.recordPayment(
        req.params.id,
        amount,
        paymentMethod,
        referenceNumber || '',
        req.user!
      );
      sendSuccess(res, result, 'Payment processed successfully');
    } catch (error) {
      next(error);
    }
  }

  public static async getAllSubscriptions(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = req.user!;
      const customerId = user.role === 'CUSTOMER' ? user.customerId : (req.query.customerId as string);
      const subs = await BillingService.getAllSubscriptions(customerId);
      sendSuccess(res, subs);
    } catch (error) {
      next(error);
    }
  }

  public static async updateSubscription(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const action = req.params.action.toUpperCase();
      if (!['PAUSE', 'RESUME', 'CANCEL'].includes(action)) {
        sendError(res, 'INVALID_ACTION', 'Action must be PAUSE, RESUME, or CANCEL', 400);
        return;
      }

      const statusMap: Record<string, any> = {
        PAUSE: 'PAUSED',
        RESUME: 'ACTIVE',
        CANCEL: 'CANCELLED',
      };

      const updated = await BillingService.updateSubscriptionStatus(
        req.params.id,
        statusMap[action],
        req.user!
      );
      sendSuccess(res, updated, `Subscription ${action.toLowerCase()}d successfully`);
    } catch (error) {
      next(error);
    }
  }
}
