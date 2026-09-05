import { Request, Response, NextFunction } from 'express';
import { CustomerService } from '../services/customer.service';
import { CreateCustomerSchema } from '../validators';
import { sendSuccess, sendError } from '../utils/response';

export class CustomerController {
  public static async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const customers = await CustomerService.getAllCustomers();
      sendSuccess(res, customers);
    } catch (error) {
      next(error);
    }
  }

  public static async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const customer = await CustomerService.getCustomerById(req.params.id);
      if (!customer) {
        sendError(res, 'CUSTOMER_NOT_FOUND', 'Customer not found', 404);
        return;
      }
      sendSuccess(res, customer);
    } catch (error) {
      next(error);
    }
  }

  public static async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = CreateCustomerSchema.parse(req.body);
      const customer = await CustomerService.createCustomer(data);
      sendSuccess(res, customer, 'Customer created successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  public static async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const customer = await CustomerService.updateCustomer(req.params.id, req.body);
      if (!customer) {
        sendError(res, 'CUSTOMER_NOT_FOUND', 'Customer not found', 404);
        return;
      }
      sendSuccess(res, customer, 'Customer updated successfully');
    } catch (error) {
      next(error);
    }
  }

  public static async getTiers(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const tiers = await CustomerService.getTiers();
      sendSuccess(res, tiers);
    } catch (error) {
      next(error);
    }
  }
}
