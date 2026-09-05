import UserModel from '../models/User';
import CustomerModel from '../models/Customer';
import CustomerTierModel from '../models/CustomerTier';
import { Customer, CustomerTier, User } from '../types';
import { InMemoryStore } from './in_memory_store';

const cleanDoc = (doc: any) => {
  if (!doc) return null;
  const obj = doc.toObject ? doc.toObject() : doc;
  obj.id = obj._id.toString();
  delete obj._id;
  delete obj.__v;
  return obj;
};

export class UserRepository {
  public static async findById(id: string): Promise<User | null> {
    const doc = await UserModel.findById(id).lean();
    if (!doc) return null;
    return cleanDoc(doc) as unknown as User;
  }

  public static async findByEmail(email: string): Promise<User | null> {
    const doc = await UserModel.findOne({ email }).lean();
    if (!doc) return null;
    return cleanDoc(doc) as unknown as User;
  }

  public static async getAll(): Promise<User[]> {
    const docs = await UserModel.find().lean();
    return docs.map(cleanDoc) as unknown as User[];
  }
}

export class CustomerRepository {
  public static async getAll(): Promise<Customer[]> {
    const docs = await CustomerModel.find().lean();
    return docs.map(cleanDoc) as unknown as Customer[];
  }

  public static async findById(id: string): Promise<Customer | null> {
    const doc = await CustomerModel.findById(id).lean();
    if (!doc) return null;
    return cleanDoc(doc) as unknown as Customer;
  }

  public static async create(customer: Customer): Promise<Customer> {
    const doc = await CustomerModel.create(customer);
    return cleanDoc(doc) as unknown as Customer;
  }

  public static async update(id: string, partial: Partial<Customer>): Promise<Customer | null> {
    const doc = await CustomerModel.findByIdAndUpdate(id, partial, { new: true }).lean();
    if (!doc) return null;
    return cleanDoc(doc) as unknown as Customer;
  }

  public static async getTiers(): Promise<CustomerTier[]> {
    const docs = await CustomerTierModel.find().lean();
    return docs.map(cleanDoc) as unknown as CustomerTier[];
  }

  public static async getTierById(tierId: string): Promise<CustomerTier | null> {
    const doc = await CustomerTierModel.findById(tierId).lean();
    if (!doc) return InMemoryStore.customerTiers.find((t) => t.id === tierId) || null;
    return cleanDoc(doc) as unknown as CustomerTier;
  }
}
