'use client';

import React, { useEffect, useState } from 'react';
import { Users, ShieldCheck, CreditCard, Plus, ArrowRight } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { ApiClient } from '../../lib/api';
import { Customer, CustomerTier } from '../../types';

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [tiers, setTiers] = useState<CustomerTier[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const [cList, tList] = await Promise.all([
          ApiClient.get<Customer[]>('/customers'),
          ApiClient.get<CustomerTier[]>('/customers/tiers'),
        ]);
        setCustomers(cList);
        setTiers(tList);
      } catch (err) {
        console.error('Failed to load customers:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <Users className="w-6 h-6 text-blue-600" /> Customer & Account Directory
        </h1>
        <p className="text-slate-500 text-sm mt-0.5">
          Enterprise accounts, assigned tiers, credit terms, and discount limit policies.
        </p>
      </div>

      {/* Tiers Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {tiers.map((tier) => (
          <div key={tier.id} className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900 text-base">{tier.name} Tier</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700">
                Priority {tier.priorityLevel}
              </span>
            </div>
            <div className="pt-2 border-t border-slate-100 space-y-1 text-xs text-slate-600">
              <div className="flex justify-between">
                <span>Max Discount:</span>
                <strong className="text-slate-900">{tier.baseDiscountLimitPct}%</strong>
              </div>
              <div className="flex justify-between">
                <span>Payment Terms:</span>
                <strong className="text-slate-900">Net {tier.paymentTermsDays} Days</strong>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Customers Table */}
      <Card title="Accounts & Commercial Profiles" subtitle={`${customers.length} registered accounts`}>
        {loading ? (
          <div className="text-center py-12 text-slate-400">Loading accounts...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-xs text-slate-400 uppercase border-b border-slate-100 font-semibold">
                <tr>
                  <th className="pb-3">Account Name</th>
                  <th className="pb-3">Tier</th>
                  <th className="pb-3">Credit Limit</th>
                  <th className="pb-3">Credit Status</th>
                  <th className="pb-3">Risk Profile</th>
                  <th className="pb-3">Primary Contact</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {customers.map((c) => {
                  const tier = tiers.find((t) => t.id === c.tierId);
                  return (
                    <tr key={c.id} className="hover:bg-slate-50/50">
                      <td className="py-4 font-bold text-slate-900">
                        <div>{c.name}</div>
                        <span className="text-xs text-slate-400 font-normal">{c.address}</span>
                      </td>
                      <td className="py-4 font-semibold text-blue-700">
                        {tier?.name} ({tier?.baseDiscountLimitPct}% max)
                      </td>
                      <td className="py-4 font-bold text-slate-900">${c.creditLimit.toLocaleString()}</td>
                      <td className="py-4">
                        <span
                          className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                            c.creditStatus === 'GOOD'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {c.creditStatus}
                        </span>
                      </td>
                      <td className="py-4 font-medium text-slate-700">{c.riskProfile}</td>
                      <td className="py-4 text-xs text-slate-600">
                        <div>{c.contactEmail}</div>
                        <div className="text-slate-400">{c.contactPhone}</div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
