import { InMemoryStore } from './in_memory_store';
import { Backorder, FulfillmentAllocation, FulfillmentOrder, Warehouse, WarehouseStock } from '../types';

export class FulfillmentRepository {
  public static async getAllOrders(): Promise<FulfillmentOrder[]> {
    return InMemoryStore.fulfillmentOrders;
  }

  public static async findOrderById(id: string): Promise<FulfillmentOrder | null> {
    return InMemoryStore.fulfillmentOrders.find((o) => o.id === id) || null;
  }

  public static async findOrderByQuotationId(quotationId: string): Promise<FulfillmentOrder | null> {
    return InMemoryStore.fulfillmentOrders.find((o) => o.quotationId === quotationId) || null;
  }

  public static async createOrder(order: FulfillmentOrder): Promise<FulfillmentOrder> {
    InMemoryStore.fulfillmentOrders.unshift(order);
    return order;
  }

  public static async updateOrder(id: string, partial: Partial<FulfillmentOrder>): Promise<FulfillmentOrder | null> {
    const idx = InMemoryStore.fulfillmentOrders.findIndex((o) => o.id === id);
    if (idx === -1) return null;
    InMemoryStore.fulfillmentOrders[idx] = {
      ...InMemoryStore.fulfillmentOrders[idx],
      ...partial,
      updatedAt: new Date().toISOString(),
    };
    return InMemoryStore.fulfillmentOrders[idx];
  }

  public static async getWarehouses(): Promise<Warehouse[]> {
    return InMemoryStore.warehouses;
  }

  public static async getStocks(): Promise<WarehouseStock[]> {
    return InMemoryStore.warehouseStock;
  }

  public static async updateStocks(updated: WarehouseStock[]): Promise<void> {
    InMemoryStore.warehouseStock = updated;
  }

  public static async addAllocations(allocations: FulfillmentAllocation[]): Promise<void> {
    InMemoryStore.fulfillmentAllocations.push(...allocations);
  }

  public static async addBackorders(backorders: Backorder[]): Promise<void> {
    InMemoryStore.backorders.push(...backorders);
  }
}
