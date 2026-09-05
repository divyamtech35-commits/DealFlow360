import { Request, Response, NextFunction } from 'express';
import { FulfillmentService } from '../services/fulfillment.service';
import { sendSuccess, sendError } from '../utils/response';
import { UpdateOrderStatusSchema } from '../validators';

export class FulfillmentController {
  public static async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const orders = await FulfillmentService.getAllOrders();
      sendSuccess(res, orders);
    } catch (error) {
      next(error);
    }
  }

  public static async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const order = await FulfillmentService.getOrderById(req.params.id);
      if (!order) {
        sendError(res, 'ORDER_NOT_FOUND', 'Fulfillment order not found', 404);
        return;
      }
      sendSuccess(res, order);
    } catch (error) {
      next(error);
    }
  }

  public static async getWarehouses(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const warehouses = await FulfillmentService.getWarehouses();
      sendSuccess(res, warehouses);
    } catch (error) {
      next(error);
    }
  }

  public static async getStock(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const stock = await FulfillmentService.getWarehouseStock();
      sendSuccess(res, stock);
    } catch (error) {
      next(error);
    }
  }

  public static async updateStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { status } = UpdateOrderStatusSchema.parse(req.body);
      const order = await FulfillmentService.updateOrderStatus(req.params.id, status, req.user!);
      sendSuccess(res, order, `Fulfillment status updated to ${status}`);
    } catch (error) {
      next(error);
    }
  }

  public static async ship(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const order = await FulfillmentService.updateOrderStatus(req.params.id, 'SHIPPED', req.user!);
      sendSuccess(res, order, 'Order shipped successfully');
    } catch (error) {
      next(error);
    }
  }

  public static async complete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const order = await FulfillmentService.updateOrderStatus(req.params.id, 'DELIVERED', req.user!);
      sendSuccess(res, order, 'Order marked as delivered and complete');
    } catch (error) {
      next(error);
    }
  }
}
