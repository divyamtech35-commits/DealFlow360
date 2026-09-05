import ProductModel from '../models/Product';
import { InMemoryStore } from './in_memory_store';
import { Product, ProductCategory, UpsellRule } from '../types';

const cleanDoc = (doc: any) => {
  if (!doc) return null;
  const obj = doc;
  obj.id = obj._id.toString();
  delete obj._id;
  delete obj.__v;
  return obj;
};

export class ProductRepository {
  public static async getAll(): Promise<Product[]> {
    const docs = await ProductModel.find().lean();
    return docs.map(cleanDoc) as unknown as Product[];
  }

  public static async findById(id: string): Promise<Product | null> {
    const doc = await ProductModel.findById(id).lean();
    if (!doc) return null;
    return cleanDoc(doc) as unknown as Product;
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
