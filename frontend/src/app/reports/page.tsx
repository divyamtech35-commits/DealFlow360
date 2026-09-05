'use client';

import React, { useEffect, useState } from 'react';
import { BarChart3, TrendingUp, DollarSign, Truck, FileCheck, CheckCircle2 } from 'lucide-react';
import { Card, StatCard } from '../../components/ui/Card';
import { ApiClient } from '../../lib/api';

export default function ReportsPage() {
  const [salesReport, setSalesReport] = useState<any>(null);
  const [revenueReport, setRevenueReport] = useState<any>(null);
  const [fulfillmentReport, setFulfillmentReport] = useState<any>(null);
  const [billingReport, setBillingReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadReports() {
      try {
        setLoading(true);
        const [s, r, f, b] = await Promise.all([
          ApiClient.get<any>('/reports/sales'),
          ApiClient.get<any>('/reports/revenue'),
          ApiClient.get<any>('/reports/fulfillment'),
          ApiClient.get<any>('/reports/billing'),
        ]);
        setSalesReport(s);
        setRevenueReport(r);
        setFulfillmentReport(f);
        setBillingReport(b);
      } catch (err) {
        console.error('Failed to load reports:', err);
      } finally {
        setLoading(false);
      }
    }
    loadReports();
  }, []);

  if (loading) {
    return <div className="text-center py-20 text-slate-400">Aggregating executive intelligence reports...</div>;
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <BarChart3 className="w-6 h-6 text-blue-600" /> Executive Intelligence & Deal Analytics
        </h1>
        <p className="text-slate-500 text-sm mt-0.5">
          End-to-end performance visibility across sales velocity, realized margins, fulfillment efficiency, and billing collection.
        </p>
      </div>

      {/* Sales Velocity & Pipeline */}
      <div>
        <h2 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-blue-600" /> Sales Velocity & Pipeline Conversion
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
          <StatCard
            title="Total Quotation Volume"
            value={salesReport?.totalQuotations || 0}
            change="Active & Historical proposals"
            icon={<FileCheck className="w-5 h-5 text-blue-600" />}
          />
          <StatCard
            title="Total Pipeline Volume"
            value={`$${(salesReport?.totalPipelineValue || 0).toLocaleString()}`}
            change="Aggregate contract value"
            icon={<DollarSign className="w-5 h-5 text-indigo-600" />}
          />
          <StatCard
            title="Confirmed Deals Value"
            value={`$${(salesReport?.confirmedValue || 0).toLocaleString()}`}
            change={`${salesReport?.confirmedDealsCount || 0} contracts executed`}
            icon={<CheckCircle2 className="w-5 h-5 text-emerald-600" />}
            trend="up"
          />
          <StatCard
            title="Win Conversion Rate"
            value={`${salesReport?.winRatePct || 0}%`}
            change="Quotation-to-close ratio"
            icon={<TrendingUp className="w-5 h-5 text-purple-600" />}
            trend="up"
          />
        </div>
      </div>

      {/* Revenue & Billing Health */}
      <div>
        <h2 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
          <DollarSign className="w-5 h-5 text-emerald-600" /> Revenue Realization & Collections
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <StatCard
            title="Gross Invoiced"
            value={`$${(revenueReport?.totalInvoiced || 0).toLocaleString()}`}
            change={`${revenueReport?.paidInvoiceCount || 0} invoices settled`}
            icon={<DollarSign className="w-5 h-5 text-emerald-600" />}
          />
          <StatCard
            title="Cash Collected"
            value={`$${(revenueReport?.totalCollected || 0).toLocaleString()}`}
            change="Reconciled in bank ledger"
            icon={<CheckCircle2 className="w-5 h-5 text-emerald-600" />}
            trend="up"
          />
          <StatCard
            title="Receivables Balance"
            value={`$${(revenueReport?.totalOutstanding || 0).toLocaleString()}`}
            change={`${revenueReport?.openInvoiceCount || 0} open invoices`}
            icon={<DollarSign className="w-5 h-5 text-amber-600" />}
            trend="neutral"
          />
        </div>
      </div>

      {/* Fulfillment Operations & Backorder Health */}
      <div>
        <h2 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
          <Truck className="w-5 h-5 text-blue-600" /> Warehouse & Fulfillment Dispatch
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <StatCard
            title="Fulfillment Orders"
            value={fulfillmentReport?.totalOrders || 0}
            change="Orders allocated across DC hubs"
            icon={<Truck className="w-5 h-5 text-blue-600" />}
          />
          <StatCard
            title="Fully Allocated"
            value={fulfillmentReport?.fullyAllocatedCount || 0}
            change="100% immediate inventory available"
            icon={<CheckCircle2 className="w-5 h-5 text-emerald-600" />}
            trend="up"
          />
          <StatCard
            title="Pending Backorders"
            value={fulfillmentReport?.totalBackorders || 0}
            change="Restock allocations queued"
            icon={<Truck className="w-5 h-5 text-amber-600" />}
            trend={fulfillmentReport?.totalBackorders > 0 ? "down" : "up"}
          />
        </div>
      </div>
    </div>
  );
}
