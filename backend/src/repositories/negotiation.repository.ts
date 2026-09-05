import { InMemoryStore } from './in_memory_store';
import { Negotiation, NegotiationMessage } from '../types';

export class NegotiationRepository {
  public static async getAll(filter?: { quotationId?: string; customerId?: string }): Promise<Negotiation[]> {
    let list = InMemoryStore.negotiations;
    if (filter?.quotationId) {
      list = list.filter((n) => n.quotationId === filter.quotationId);
    }
    if (filter?.customerId) {
      list = list.filter((n) => n.customerId === filter.customerId);
    }
    return list;
  }

  public static async findById(id: string): Promise<Negotiation | null> {
    return InMemoryStore.negotiations.find((n) => n.id === id) || null;
  }

  public static async findByQuotationId(quotationId: string): Promise<Negotiation | null> {
    return InMemoryStore.negotiations.find((n) => n.quotationId === quotationId) || null;
  }

  public static async create(negotiation: Negotiation): Promise<Negotiation> {
    InMemoryStore.negotiations.unshift(negotiation);
    return negotiation;
  }

  public static async update(id: string, partial: Partial<Negotiation>): Promise<Negotiation | null> {
    const idx = InMemoryStore.negotiations.findIndex((n) => n.id === id);
    if (idx === -1) return null;
    InMemoryStore.negotiations[idx] = {
      ...InMemoryStore.negotiations[idx],
      ...partial,
      updatedAt: new Date().toISOString(),
    };
    return InMemoryStore.negotiations[idx];
  }

  public static async addMessage(negotiationId: string, message: NegotiationMessage): Promise<void> {
    const neg = InMemoryStore.negotiations.find((n) => n.id === negotiationId);
    if (neg) {
      neg.messages.push(message);
      neg.updatedAt = new Date().toISOString();
    }
  }
}
