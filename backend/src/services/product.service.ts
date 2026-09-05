import { ProductRepository } from '../repositories/product.repository';
import { Product, ProductCategory } from '../types';

export class ProductService {
  public static async getAllProducts(): Promise<Product[]> {
    return ProductRepository.getAll();
  }

  public static async getProductById(id: string): Promise<Product | null> {
    return ProductRepository.findById(id);
  }

  public static async getCategories(): Promise<ProductCategory[]> {
    return ProductRepository.getCategories();
  }
}
