import { InMemoryStore } from './in_memory_store';
import { Quotation } from '../types';

export class QuotationRepository {
  public static async getAll(filter?: { customerId?: string; salesRepId?: string }): Promise<Quotation[]> {
    let list = InMemoryStore.quotations;
    if (filter?.customerId) {
      list = list.filter((q) => q.customerId === filter.customerId);
    }
    if (filter?.salesRepId) {
      list = list.filter((q) => q.salesRepId === filter.salesRepId);
    }
    return list;
  }

  public static async findById(id: string): Promise<Quotation | null> {
    return InMemoryStore.quotations.find((q) => q.id === id) || null;
  }

  public static async create(quotation: Quotation): Promise<Quotation> {
    InMemoryStore.quotations.unshift(quotation);
    return quotation;
  }

  public static async update(id: string, partial: Partial<Quotation>): Promise<Quotation | null> {
    const idx = InMemoryStore.quotations.findIndex((q) => q.id === id);
    if (idx === -1) return null;
    InMemoryStore.quotations[idx] = {
      ...InMemoryStore.quotations[idx],
      ...partial,
      updatedAt: new Date().toISOString(),
    };
    return InMemoryStore.quotations[idx];
  }

  public static async delete(id: string): Promise<boolean> {
    const idx = InMemoryStore.quotations.findIndex((q) => q.id === id);
    if (idx === -1) return false;
    InMemoryStore.quotations.splice(idx, 1);
    return true;
  }
}
