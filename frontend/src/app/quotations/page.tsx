'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus, Search, Filter, ArrowRight, FileText } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { StatusBadge, RiskBadge } from '../../components/ui/Badge';
import { ApiClient } from '../../lib/api';
import { Quotation } from '../../types';

export default function QuotationsPage() {
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadQuotations() {
      try {
        setLoading(true);
        const data = await ApiClient.get<Quotation[]>('/quotations');
        setQuotations(data);
      } catch (err) {
        console.error('Failed to load quotations:', err);
      } finally {
        setLoading(false);
      }
    }
    loadQuotations();
  }, []);

  const filtered = quotations.filter((q) => {
    const matchesSearch =
      q.quotationNumber.toLowerCase().includes(search.toLowerCase()) ||
      q.customerName.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || q.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <FileText className="w-6 h-6 text-blue-600" /> Quotations
          </h1>
          <p className="text-slate-500 text-sm mt-0.5">
            Track and manage all enterprise sales quotations and commercial agreements.
          </p>
        </div>

        <Link href="/sales">
          <Button className="gap-2">
            <Plus className="w-4 h-4" /> Create Quotation
          </Button>
        </Link>
      </div>

      <Card>
        {/* Filters and search */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pb-6 mb-6 border-b border-slate-100">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search quotation # or customer..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-xs border border-slate-200 rounded-lg px-2.5 py-2 font-medium bg-white"
            >
              <option value="ALL">All Statuses</option>
              <option value="DRAFT">Draft</option>
              <option value="PENDING_APPROVAL">Pending Approval</option>
              <option value="APPROVED">Approved</option>
              <option value="UNDER_NEGOTIATION">Under Negotiation</option>
              <option value="CONFIRMED">Confirmed Deal</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>
        </div>

        {/* Quotations Table */}
        {loading ? (
          <div className="text-center py-12 text-slate-400">Loading quotations...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 text-slate-500 text-sm">
            No quotations match the selected filters.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-xs text-slate-400 uppercase border-b border-slate-100 font-semibold">
                <tr>
                  <th className="pb-3">Quotation Number</th>
                  <th className="pb-3">Customer</th>
                  <th className="pb-3">Total Value</th>
                  <th className="pb-3">Discount</th>
                  <th className="pb-3">Margin</th>
                  <th className="pb-3">Risk Level</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((q) => (
                  <tr key={q.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 font-bold text-blue-600">
                      <Link href={`/quotations/${q.id}`} className="hover:underline">
                        {q.quotationNumber}
                      </Link>
                    </td>
                    <td className="py-3.5 font-medium text-slate-900">{q.customerName}</td>
                    <td className="py-3.5 font-bold text-slate-900">${q.total.toLocaleString()}</td>
                    <td className="py-3.5 text-slate-600 font-medium">-${q.discountAmount.toLocaleString()}</td>
                    <td className="py-3.5 font-semibold text-slate-700">{q.marginPct}%</td>
                    <td className="py-3.5">
                      <RiskBadge level={q.riskLevel} score={q.riskScore} />
                    </td>
                    <td className="py-3.5">
                      <StatusBadge status={q.status} />
                    </td>
                    <td className="py-3.5 text-right">
                      <Link href={`/quotations/${q.id}`}>
                        <Button variant="outline" size="sm" className="gap-1">
                          View <ArrowRight className="w-3.5 h-3.5" />
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
  );
}
