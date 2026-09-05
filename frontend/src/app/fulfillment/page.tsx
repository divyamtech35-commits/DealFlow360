'use client';

import React, { useEffect, useState } from 'react';
import { Truck, Warehouse as WarehouseIcon, Package, CheckCircle2, AlertTriangle, Send } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { ApiClient } from '../../lib/api';
import { FulfillmentOrder, Warehouse, WarehouseStock } from '../../types';

export default function FulfillmentPage() {
  const [orders, setOrders] = useState<FulfillmentOrder[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [stocks, setStocks] = useState<WarehouseStock[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFulfillmentData();
  }, []);

  async function loadFulfillmentData() {
    try {
      setLoading(true);
      const [ordList, whList, stockList] = await Promise.all([
        ApiClient.get<FulfillmentOrder[]>('/fulfillment'),
        ApiClient.get<Warehouse[]>('/fulfillment/warehouses'),
        ApiClient.get<WarehouseStock[]>('/fulfillment/stock'),
      ]);
      setOrders(ordList);
      setWarehouses(whList);
      setStocks(stockList);
    } catch (err) {
      console.error('Failed to load fulfillment data:', err);
    } finally {
      setLoading(false);
    }
  }

  const handleShip = async (orderId: string) => {
    try {
      await ApiClient.post(`/fulfillment/${orderId}/ship`);
      alert('Order marked as SHIPPED!');
      loadFulfillmentData();
    } catch (err: any) {
      alert(`Error shipping order: ${err.message}`);
    }
  };

  const handleComplete = async (orderId: string) => {
    try {
      await ApiClient.post(`/fulfillment/${orderId}/complete`);
      alert('Order marked as DELIVERED & COMPLETE!');
      loadFulfillmentData();
    } catch (err: any) {
      alert(`Error delivering order: ${err.message}`);
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <Truck className="w-6 h-6 text-blue-600" /> Fulfillment & Inventory Operations
        </h1>
        <p className="text-slate-500 text-sm mt-0.5">
          Multi-warehouse inventory allocation, stock reservations, backorders, and shipment fulfillment dispatch.
        </p>
      </div>

      {/* Warehouse Live Stock Gauges */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {warehouses.map((wh) => {
          const whStocks = stocks.filter((s) => s.warehouseId === wh.id);
          const totalQty = whStocks.reduce((a, b) => a + b.totalQuantity, 0);
          const reservedQty = whStocks.reduce((a, b) => a + b.reservedQuantity, 0);
          const availableQty = Math.max(0, totalQty - reservedQty);

          return (
            <div key={wh.id} className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                    <WarehouseIcon className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-base">{wh.name}</h3>
                    <p className="text-xs text-slate-500">{wh.location} | Priority: {wh.priority}</p>
                  </div>
                </div>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Operational
                </span>
              </div>

              <div className="grid grid-cols-3 gap-3 pt-2">
                <div className="bg-slate-50 p-3 rounded-xl text-center">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase">Total Stock</span>
                  <p className="text-xl font-bold text-slate-900 mt-1">{totalQty}</p>
                </div>
                <div className="bg-amber-50/50 p-3 rounded-xl text-center">
                  <span className="text-[11px] font-semibold text-amber-600 uppercase">Reserved</span>
                  <p className="text-xl font-bold text-amber-700 mt-1">{reservedQty}</p>
                </div>
                <div className="bg-emerald-50/50 p-3 rounded-xl text-center">
                  <span className="text-[11px] font-semibold text-emerald-600 uppercase">Available</span>
                  <p className="text-xl font-bold text-emerald-700 mt-1">{availableQty}</p>
                </div>
              </div>

              <div className="text-xs text-slate-500 pt-1">
                <strong>Tracked Hardware:</strong> Laptop Pro 16" ({availableQty} available for dispatch)
              </div>
            </div>
          );
        })}
      </div>

      {/* Fulfillment Orders List */}
      <Card title="Fulfillment Orders & Allocations" subtitle={`${orders.length} active fulfillment orders`}>
        {loading ? (
          <div className="text-center py-12 text-slate-400">Loading orders...</div>
        ) : orders.length === 0 ? (
          <div className="text-center py-12 text-slate-500 text-sm">
            No fulfillment orders have been generated yet. Confirm a quotation to trigger automated inventory allocation!
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div
                key={order.id}
                className="p-5 rounded-2xl border border-slate-200 bg-white shadow-sm space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                  <div>
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-slate-900 text-base">{order.orderNumber}</span>
                      <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                        {order.status.replace('_', ' ')}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Customer: <strong className="text-slate-700">{order.customerName}</strong>
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    {order.status !== 'SHIPPED' && order.status !== 'DELIVERED' && (
                      <Button size="sm" onClick={() => handleShip(order.id)} className="gap-1 text-xs">
                        <Send className="w-3.5 h-3.5" /> Ship Dispatch
                      </Button>
                    )}
                    {order.status === 'SHIPPED' && (
                      <Button size="sm" variant="success" onClick={() => handleComplete(order.id)} className="gap-1 text-xs">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Mark Delivered
                      </Button>
                    )}
                  </div>
                </div>

                {/* Multi-warehouse Allocations Grid */}
                <div>
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                    Warehouse Allocations:
                  </h4>
                  {order.allocations.length === 0 ? (
                    <p className="text-xs text-slate-400">No immediate allocations.</p>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {order.allocations.map((alloc) => (
                        <div
                          key={alloc.id}
                          className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs"
                        >
                          <div>
                            <span className="font-bold text-slate-800">{alloc.productName}</span>
                            <p className="text-[11px] text-slate-500 mt-0.5">Source: {alloc.warehouseName}</p>
                          </div>
                          <span className="font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                            {alloc.allocatedQuantity} Allocated
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Backorders Section */}
                {order.backorders?.length > 0 && (
                  <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 space-y-2">
                    <div className="flex items-center gap-2 text-xs font-bold text-amber-900">
                      <AlertTriangle className="w-4 h-4 text-amber-600" />
                      Backorder Notice (Stock Insufficient across all distribution centers):
                    </div>
                    {order.backorders.map((bo) => (
                      <div key={bo.id} className="flex items-center justify-between text-xs text-amber-800">
                        <span>
                          {bo.productName} — <strong>{bo.backorderQuantity} Units short</strong>
                        </span>
                        <span>Estimated Supplier Arrival: {new Date(bo.expectedDate).toLocaleDateString()}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
