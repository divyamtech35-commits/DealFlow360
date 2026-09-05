import { FulfillmentRepository } from '../repositories/fulfillment.repository';
import { QuotationRepository } from '../repositories/quotation.repository';
import { AuditRepository } from '../repositories/audit.repository';
import { FulfillmentEngine } from '../engines/fulfillment.engine';
import { FulfillmentOrder, FulfillmentStatus, Quotation, User } from '../types';

export class FulfillmentService {
  public static async getAllOrders(): Promise<FulfillmentOrder[]> {
    return FulfillmentRepository.getAllOrders();
  }

  public static async getOrderById(id: string): Promise<FulfillmentOrder | null> {
    return FulfillmentRepository.findOrderById(id);
  }

  public static async getWarehouses() {
    return FulfillmentRepository.getWarehouses();
  }

  public static async getWarehouseStock() {
    return FulfillmentRepository.getStocks();
  }

  public static async createFulfillmentOrder(quotation: Quotation): Promise<FulfillmentOrder> {
    const existing = await FulfillmentRepository.findOrderByQuotationId(quotation.id);
    if (existing) return existing;

    const orderId = `fulf_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const orderNumber = `FO-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const warehouses = await FulfillmentRepository.getWarehouses();
    const currentStocks = await FulfillmentRepository.getStocks();

    const plan = FulfillmentEngine.planFulfillment(orderId, quotation.lines, warehouses, currentStocks);

    // Save updated stock
    await FulfillmentRepository.updateStocks(plan.updatedStocks);
    await FulfillmentRepository.addAllocations(plan.allocations);
    await FulfillmentRepository.addBackorders(plan.backorders);

    const order: FulfillmentOrder = {
      id: orderId,
      orderNumber,
      quotationId: quotation.id,
      customerId: quotation.customerId,
      customerName: quotation.customerName,
      status: plan.orderStatus,
      allocations: plan.allocations,
      backorders: plan.backorders,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return FulfillmentRepository.createOrder(order);
  }

  public static async updateOrderStatus(id: string, status: FulfillmentStatus, user: User): Promise<FulfillmentOrder> {
    const order = await FulfillmentRepository.findOrderById(id);
    if (!order) throw new Error('Fulfillment order not found');

    const updated = await FulfillmentRepository.updateOrder(id, { status });
    if (!updated) throw new Error('Failed to update fulfillment order');

    await AuditRepository.log({
      actorId: user.id,
      actorName: user.name,
      actorRole: user.role,
      entityType: 'FULFILLMENT_ORDER',
      entityId: id,
      action: `STATUS_CHANGE_TO_${status}`,
    });

    return updated;
  }
}
