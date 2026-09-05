import { Backorder, FulfillmentAllocation, FulfillmentOrder, FulfillmentStatus, QuotationLine, Warehouse, WarehouseStock } from '../types';

export interface AllocationPlanItem {
  productId: string;
  productName: string;
  requiredQuantity: number;
  allocations: {
    warehouseId: string;
    warehouseName: string;
    quantity: number;
  }[];
  backorderQuantity: number;
}

export interface FulfillmentPlanResult {
  orderStatus: FulfillmentStatus;
  allocations: FulfillmentAllocation[];
  backorders: Backorder[];
  updatedStocks: WarehouseStock[];
}

export class FulfillmentEngine {
  /**
   * Plans stock allocation across warehouses (ordered by priority) and creates backorders when available stock is insufficient.
   */
  public static planFulfillment(
    orderId: string,
    lines: QuotationLine[],
    warehouses: Warehouse[],
    currentStocks: WarehouseStock[]
  ): FulfillmentPlanResult {
    const allocations: FulfillmentAllocation[] = [];
    const backorders: Backorder[] = [];
    // Clone current stocks so we don't mutate input
    const workingStocks: WarehouseStock[] = currentStocks.map((s) => ({ ...s }));

    // Sort warehouses by priority ascending (1 = Primary, 2 = Secondary, etc.)
    const sortedWarehouses = [...warehouses].sort((a, b) => a.priority - b.priority);

    let hasAnyAllocation = false;
    let hasAnyBackorder = false;

    for (const line of lines) {
      let needed = line.quantity;
      const productId = line.productId;
      const productName = line.productName || 'Product';

      for (const wh of sortedWarehouses) {
        if (needed <= 0) break;

        const stock = workingStocks.find(
          (s) => s.warehouseId === wh.id && s.productId === productId
        );

        if (stock) {
          const available = Math.max(0, stock.totalQuantity - stock.reservedQuantity);
          if (available > 0) {
            const allocateQty = Math.min(needed, available);
            stock.reservedQuantity += allocateQty;
            stock.availableQuantity = Math.max(0, stock.totalQuantity - stock.reservedQuantity);
            needed -= allocateQty;
            hasAnyAllocation = true;

            allocations.push({
              id: `alloc_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
              fulfillmentOrderId: orderId,
              warehouseId: wh.id,
              warehouseName: wh.name,
              productId,
              productName,
              allocatedQuantity: allocateQty,
              allocatedAt: new Date().toISOString(),
            });
          }
        }
      }

      // If we still need items after checking all warehouses, create a backorder
      if (needed > 0) {
        hasAnyBackorder = true;
        const expectedDate = new Date();
        expectedDate.setDate(expectedDate.getDate() + 14); // 2 weeks out

        backorders.push({
          id: `bo_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
          fulfillmentOrderId: orderId,
          productId,
          productName,
          backorderQuantity: needed,
          status: 'PENDING',
          expectedDate: expectedDate.toISOString(),
          createdAt: new Date().toISOString(),
        });
      }
    }

    let orderStatus: FulfillmentStatus = 'PENDING';
    if (hasAnyAllocation && !hasAnyBackorder) {
      orderStatus = 'ALLOCATED';
    } else if (hasAnyAllocation && hasAnyBackorder) {
      orderStatus = 'PARTIALLY_ALLOCATED';
    } else if (!hasAnyAllocation && hasAnyBackorder) {
      orderStatus = 'PENDING';
    }

    return {
      orderStatus,
      allocations,
      backorders,
      updatedStocks: workingStocks,
    };
  }
}
