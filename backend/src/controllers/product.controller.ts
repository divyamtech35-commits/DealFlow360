import { Request, Response, NextFunction } from 'express';
import { ProductService } from '../services/product.service';
import { sendSuccess, sendError } from '../utils/response';

export class ProductController {
  public static async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const products = await ProductService.getAllProducts();
      sendSuccess(res, products);
    } catch (error) {
      next(error);
    }
  }

  public static async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const product = await ProductService.getProductById(req.params.id);
      if (!product) {
        sendError(res, 'PRODUCT_NOT_FOUND', 'Product not found', 404);
        return;
      }
      sendSuccess(res, product);
    } catch (error) {
      next(error);
    }
  }

  public static async getCategories(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const categories = await ProductService.getCategories();
      sendSuccess(res, categories);
    } catch (error) {
      next(error);
    }
  }
}
