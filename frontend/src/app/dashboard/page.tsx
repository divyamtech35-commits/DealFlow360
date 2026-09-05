'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  TrendingUp,
  DollarSign,
  FileCheck2,
  AlertTriangle,
  ArrowRight,
  ShoppingCart,
  CheckCircle2,
  Clock,
  Truck,
} from 'lucide-react';
import { StatCard, Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { StatusBadge, RiskBadge } from '../../components/ui/Badge';
import { ApiClient } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import { Quotation, DealHealthAlert, ApprovalRequest } from '../../types';

export default function DashboardPage() {
  const { currentUser, isCustomer, isManager, isFinance, isSalesRep } = useAuth();
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [alerts, setAlerts] = useState<DealHealthAlert[]>([]);
  const [pendingApprovals, setPendingApprovals] = useState<ApprovalRequest[]>([]);
  const [salesStats, setSalesStats] = useState<any>(null);
  const [revenueStats, setRevenueStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboard() {
      try {
        setLoading(true);
        const [quotesData, alertsData, salesData, revenueData] = await Promise.all([
          ApiClient.get<Quotation[]>('/quotations').catch(() => []),
          ApiClient.get<DealHealthAlert[]>('/deal-health').catch(() => []),
          ApiClient.get<any>('/reports/sales').catch(() => null),
          ApiClient.get<any>('/reports/revenue').catch(() => null),
        ]);

        setQuotations(quotesData);
        setAlerts(alertsData);
        setSalesStats(salesData);
        setRevenueStats(revenueData);

        if (isManager || isFinance) {
          const appr = await ApiClient.get<ApprovalRequest[]>('/approvals?status=PENDING').catch(() => []);
          setPendingApprovals(appr);
        }
      } catch (err) {
        console.error('Failed to load dashboard:', err);
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, [currentUser, isManager, isFinance]);

  const pipelineTotal = quotations.reduce((acc, q) => acc + q.total, 0);
  const activeCount = quotations.filter((q) => !['CANCELLED', 'CONFIRMED'].includes(q.status)).length;
  const confirmedCount = quotations.filter((q) => q.status === 'CONFIRMED').length;

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-slate-900 rounded-2xl p-8 text-white shadow-xl relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-xs font-semibold backdrop-blur-md mb-3 border border-white/20">
            <span>✨ DealFlow360 Enterprise Engine Active</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
            Welcome back, {currentUser.name}
          </h1>
          <p className="text-blue-100 text-sm mt-1 max-w-xl">
            Unified deal governance across pricing, discount compliance, risk scoring, approvals, and fulfillment.
          </p>
        </div>

        <div className="relative z-10 flex flex-wrap gap-3">
          {isCustomer ? (
            <Link href="/portal">
              <Button variant="secondary" className="gap-2 bg-white text-blue-900 hover:bg-blue-50 font-semibold shadow-md">
                Open Customer Portal <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          ) : (
            <>
              <Link href="/sales">
                <Button className="gap-2 bg-blue-500 hover:bg-blue-400 text-white font-semibold shadow-lg shadow-blue-500/30">
                  <ShoppingCart className="w-4 h-4" /> New Quotation
                </Button>
              </Link>
              {(isManager || isFinance) && (
                <Link href="/approvals">
                  <Button variant="secondary" className="gap-2 bg-white/10 hover:bg-white/20 text-white border border-white/20">
                    <FileCheck2 className="w-4 h-4" /> Review Approvals
                  </Button>
                </Link>
              )}
            </>
          )}
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="Active Pipeline Value"
          value={`$${(pipelineTotal || 0).toLocaleString()}`}
          change={`${quotations.length} total deals in system`}
          icon={<DollarSign className="w-5 h-5 text-blue-600" />}
          trend="up"
        />
        <StatCard
          title="Pending Approvals"
          value={pendingApprovals.length}
          change={pendingApprovals.length > 0 ? "Requires manager/finance sign-off" : "All approvals up to date"}
          icon={<Clock className="w-5 h-5 text-amber-600" />}
          trend={pendingApprovals.length > 0 ? "down" : "up"}
        />
        <StatCard
          title="Confirmed Deals"
          value={confirmedCount}
          change={`Win rate: ${salesStats?.winRatePct || 0}%`}
          icon={<CheckCircle2 className="w-5 h-5 text-emerald-600" />}
          trend="up"
        />
        <StatCard
          title="Active Health Alerts"
          value={alerts.filter((a) => a.status === 'ACTIVE').length}
          change="Proactive risk detection"
          icon={<AlertTriangle className="w-5 h-5 text-rose-600" />}
          trend={alerts.length > 0 ? "down" : "up"}
        />
      </div>

      {/* Main Sections: Recent Deals & Proactive Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Quotation Pipeline (2 Cols) */}
        <div className="lg:col-span-2 space-y-6">
          <Card
            title="Recent Quotations"
            subtitle="Central deal objects across all stages"
            action={
              <Link href="/quotations" className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1">
                View All <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            }
          >
            {quotations.length === 0 ? (
              <div className="text-center py-10 text-slate-500 text-sm">
                No quotations found. Start by creating a quotation in the Sales Workspace!
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="text-xs text-slate-400 uppercase border-b border-slate-100 font-semibold">
                    <tr>
                      <th className="pb-3">Quotation #</th>
                      <th className="pb-3">Customer</th>
                      <th className="pb-3">Total</th>
                      <th className="pb-3">Margin</th>
                      <th className="pb-3">Risk</th>
                      <th className="pb-3">Status</th>
                      <th className="pb-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {quotations.slice(0, 5).map((q) => (
                      <tr key={q.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3.5 font-semibold text-blue-600">
                          <Link href={`/quotations/${q.id}`} className="hover:underline">
                            {q.quotationNumber}
                          </Link>
                        </td>
                        <td className="py-3.5 font-medium text-slate-900">{q.customerName}</td>
                        <td className="py-3.5 font-semibold text-slate-900">
                          ${q.total.toLocaleString()}
                        </td>
                        <td className="py-3.5 text-slate-600 font-medium">{q.marginPct}%</td>
                        <td className="py-3.5">
                          <RiskBadge level={q.riskLevel} score={q.riskScore} />
                        </td>
                        <td className="py-3.5">
                          <StatusBadge status={q.status} />
                        </td>
                        <td className="py-3.5 text-right">
                          <Link href={`/quotations/${q.id}`}>
                            <Button variant="outline" size="sm">
                              Details
                            </Button>
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>

        {/* Health Alerts & Quick Actions (1 Col) */}
        <div className="space-y-6">
          <Card
            title="Deal Health Alerts"
            subtitle="Automated risks & anomalies"
            action={
              <Link href="/deal-health" className="text-xs font-semibold text-blue-600 hover:text-blue-700">
                All Alerts
              </Link>
            }
          >
            {alerts.length === 0 ? (
              <div className="text-center py-8 text-slate-500 text-xs">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2 opacity-80" />
                No critical deal health alerts detected. All pipeline metrics healthy.
              </div>
            ) : (
              <div className="space-y-3">
                {alerts.slice(0, 4).map((alert) => (
                  <div
                    key={alert.id}
                    className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/60 hover:bg-slate-100/60 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-900 truncate">
                        {alert.quotationNumber || 'Deal Alert'}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          alert.severity === 'CRITICAL'
                            ? 'bg-rose-100 text-rose-700'
                            : alert.severity === 'HIGH'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {alert.severity}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 mt-1">{alert.message}</p>
                    <div className="mt-2 text-[11px] font-medium text-slate-400">
                      {alert.customerName}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
