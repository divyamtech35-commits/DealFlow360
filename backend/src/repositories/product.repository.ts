import { InMemoryStore } from './in_memory_store';
import { Product, ProductCategory, UpsellRule } from '../types';

export class ProductRepository {
  public static async getAll(): Promise<Product[]> {
    return InMemoryStore.products;
  }

  public static async findById(id: string): Promise<Product | null> {
    return InMemoryStore.products.find((p) => p.id === id) || null;
  }

  public static async getCategories(): Promise<ProductCategory[]> {
    return InMemoryStore.categories;
  }

  public static async getCategoryById(id: string): Promise<ProductCategory | null> {
    return InMemoryStore.categories.find((c) => c.id === id) || null;
  }

  public static async getUpsellRules(): Promise<UpsellRule[]> {
    return InMemoryStore.upsellRules;
  }
}
