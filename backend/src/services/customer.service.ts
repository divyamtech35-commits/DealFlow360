import { CustomerRepository } from '../repositories/customer.repository';
import { Customer, CustomerTier } from '../types';

export class CustomerService {
  public static async getAllCustomers(): Promise<Customer[]> {
    return CustomerRepository.getAll();
  }

  public static async getCustomerById(id: string): Promise<Customer | null> {
    return CustomerRepository.findById(id);
  }

  public static async createCustomer(data: Omit<Customer, 'id' | 'createdAt' | 'updatedAt'>): Promise<Customer> {
    const customer: Customer = {
      ...data,
      id: `cust_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    return CustomerRepository.create(customer);
  }

  public static async updateCustomer(id: string, partial: Partial<Customer>): Promise<Customer | null> {
    return CustomerRepository.update(id, partial);
  }

  public static async getTiers(): Promise<CustomerTier[]> {
    return CustomerRepository.getTiers();
  }
}
