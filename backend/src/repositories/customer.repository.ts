import { appwriteDatabases, isAppwriteConfigured } from '../config/appwrite';
import { config } from '../config';
import { InMemoryStore } from './in_memory_store';
import { Customer, CustomerTier, User } from '../types';

export class UserRepository {
  public static async findById(id: string): Promise<User | null> {
    if (isAppwriteConfigured && appwriteDatabases) {
      try {
        const doc = await appwriteDatabases.getDocument(
          config.appwrite.databaseId,
          config.appwrite.collections.users,
          id
        );
        return doc as unknown as User;
      } catch (err) {
        // fallback to in-memory
      }
    }
    return InMemoryStore.users.find((u) => u.id === id) || null;
  }

  public static async findByEmail(email: string): Promise<User | null> {
    const normalized = email.toLowerCase().trim();
    return InMemoryStore.users.find((u) => u.email.toLowerCase() === normalized) || null;
  }

  public static async getAll(): Promise<User[]> {
    return InMemoryStore.users;
  }
}

export class CustomerRepository {
  public static async getAll(): Promise<Customer[]> {
    if (isAppwriteConfigured && appwriteDatabases) {
      try {
        const res = await appwriteDatabases.listDocuments(
          config.appwrite.databaseId,
          config.appwrite.collections.customers
        );
        return res.documents as unknown as Customer[];
      } catch (err) {
        // fallback to memory
      }
    }
    return InMemoryStore.customers;
  }

  public static async findById(id: string): Promise<Customer | null> {
    if (isAppwriteConfigured && appwriteDatabases) {
      try {
        const doc = await appwriteDatabases.getDocument(
          config.appwrite.databaseId,
          config.appwrite.collections.customers,
          id
        );
        return doc as unknown as Customer;
      } catch (err) {
        // fallback
      }
    }
    return InMemoryStore.customers.find((c) => c.id === id) || null;
  }

  public static async create(customer: Customer): Promise<Customer> {
    InMemoryStore.customers.push(customer);
    return customer;
  }

  public static async update(id: string, partial: Partial<Customer>): Promise<Customer | null> {
    const idx = InMemoryStore.customers.findIndex((c) => c.id === id);
    if (idx === -1) return null;
    InMemoryStore.customers[idx] = {
      ...InMemoryStore.customers[idx],
      ...partial,
      updatedAt: new Date().toISOString(),
    };
    return InMemoryStore.customers[idx];
  }

  public static async getTiers(): Promise<CustomerTier[]> {
    return InMemoryStore.customerTiers;
  }

  public static async getTierById(tierId: string): Promise<CustomerTier | null> {
    return InMemoryStore.customerTiers.find((t) => t.id === tierId) || null;
  }
}
