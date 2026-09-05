import { Request, Response, NextFunction } from 'express';
import { NegotiationService } from '../services/negotiation.service';
import { NegotiationCounterSchema, NegotiationMessageSchema, NegotiationStartSchema } from '../validators';
import { sendSuccess, sendError } from '../utils/response';

export class NegotiationController {
  public static async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = req.user!;
      const customerId = user.role === 'CUSTOMER' ? user.customerId : undefined;
      const quotationId = req.query.quotationId as string;

      const list = await NegotiationService.getNegotiations({ customerId, quotationId });
      sendSuccess(res, list);
    } catch (error) {
      next(error);
    }
  }

  public static async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const negotiation = await NegotiationService.getNegotiationById(req.params.id);
      if (!negotiation) {
        sendError(res, 'NEGOTIATION_NOT_FOUND', 'Negotiation not found', 404);
        return;
      }
      sendSuccess(res, negotiation);
    } catch (error) {
      next(error);
    }
  }

  public static async getByQuotation(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const negotiation = await NegotiationService.getNegotiationByQuotationId(req.params.id);
      sendSuccess(res, negotiation || null);
    } catch (error) {
      next(error);
    }
  }

  public static async start(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { requestedDiscountPct, initialMessage } = NegotiationStartSchema.parse(req.body);
      const quotationId = req.body.quotationId;
      if (!quotationId) {
        sendError(res, 'MISSING_QUOTATION_ID', 'quotationId is required', 400);
        return;
      }

      const negotiation = await NegotiationService.startNegotiation(
        quotationId,
        requestedDiscountPct,
        initialMessage,
        req.user!
      );
      sendSuccess(res, negotiation, 'Negotiation started and commercial terms updated', 201);
    } catch (error) {
      next(error);
    }
  }

  public static async sendMessage(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { message } = NegotiationMessageSchema.parse(req.body);
      const msg = await NegotiationService.sendMessage(req.params.id, message, req.user!);
      sendSuccess(res, msg, 'Message sent successfully');
    } catch (error) {
      next(error);
    }
  }

  public static async counter(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { counterDiscountPct, message } = NegotiationCounterSchema.parse(req.body);
      const updated = await NegotiationService.counterOffer(
        req.params.id,
        counterDiscountPct,
        message,
        req.user!
      );
      sendSuccess(res, updated, 'Counter-offer submitted and quotation terms recalculated');
    } catch (error) {
      next(error);
    }
  }

  public static async accept(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const updated = await NegotiationService.acceptNegotiation(req.params.id, req.user!);
      sendSuccess(res, updated, 'Negotiation agreed and accepted');
    } catch (error) {
      next(error);
    }
  }
}
