'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search,
  Plus,
  Trash2,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  ShieldAlert,
  ArrowRight,
  Info,
  DollarSign,
  TrendingUp,
} from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge, RiskBadge } from '../../components/ui/Badge';
import { ApiClient } from '../../lib/api';
import { Customer, CustomerTier, Product, Quotation } from '../../types';

interface WorkspaceLineItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  unitCost: number;
  discountPct: number;
  lineTotal: number;
  lineMarginPct: number;
}

export default function SalesWorkspacePage() {
  const router = useRouter();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [tiers, setTiers] = useState<CustomerTier[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
  const [lines, setLines] = useState<WorkspaceLineItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Live calculation results from backend
  const [calculation, setCalculation] = useState<{
    subtotal: number;
    discountAmount: number;
    taxAmount: number;
    total: number;
    marginPct: number;
    riskScore: number;
    riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    requiresApproval: boolean;
    approvalRole?: string;
    discountReasons: string[];
    riskFactors: string[];
  } | null>(null);

  const [recommendations, setRecommendations] = useState<any[]>([]);

  useEffect(() => {
    async function loadMasterData() {
      try {
        const [custs, tierList, prods] = await Promise.all([
          ApiClient.get<Customer[]>('/customers'),
          ApiClient.get<CustomerTier[]>('/customers/tiers'),
          ApiClient.get<Product[]>('/products'),
        ]);
        setCustomers(custs);
        setTiers(tierList);
        setProducts(prods);

        if (custs.length > 0) {
          setSelectedCustomerId(custs[0].id);
        }
      } catch (err) {
        console.error('Failed to load master data:', err);
      }
    }
    loadMasterData();
  }, []);

  const selectedCustomer = customers.find((c) => c.id === selectedCustomerId);
  const customerTier = tiers.find((t) => t.id === selectedCustomer?.tierId);

  // Recalculate metrics whenever lines or selected customer changes
  useEffect(() => {
    if (!selectedCustomerId || lines.length === 0) {
      setCalculation(null);
      setRecommendations([]);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const payload = {
          customerId: selectedCustomerId,
          lines: lines.map((l) => ({
            productId: l.productId,
            quantity: l.quantity,
            discountPct: l.discountPct,
          })),
        };

        const res = await ApiClient.post<any>('/quotations/calculate', payload);
        const { pricing, discountEvaluation, riskEvaluation, approvalDecision } = res;

        setCalculation({
          subtotal: pricing.subtotal,
          discountAmount: pricing.discountAmount,
          taxAmount: pricing.taxAmount,
          total: pricing.total,
          marginPct: pricing.marginPct,
          riskScore: riskEvaluation.riskScore,
          riskLevel: riskEvaluation.riskLevel,
          requiresApproval: approvalDecision.requiresApproval,
          approvalRole: approvalDecision.requiredRole,
          discountReasons: discountEvaluation.reasons,
          riskFactors: riskEvaluation.factors,
        });

        // Recommendations
        const lineProductIds = new Set(lines.map((l) => l.productId));
        const recs: any[] = [];
        if (lineProductIds.has('prod_laptop_pro')) {
          if (!lineProductIds.has('prod_ext_warranty')) {
            const p = products.find((x) => x.id === 'prod_ext_warranty');
            if (p) recs.push({ product: p, type: 'ADDON', reason: 'Recommended 3-year warranty for Laptop Pro' });
          }
          if (!lineProductIds.has('prod_ent_support')) {
            const p = products.find((x) => x.id === 'prod_ent_support');
            if (p) recs.push({ product: p, type: 'CROSS_SELL', reason: 'Enterprise 24/7 SLA Support coverage' });
          }
        }
        setRecommendations(recs);
      } catch (err) {
        console.error('Calculation failed:', err);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [selectedCustomerId, lines, products]);

  const addProductToQuotation = (product: Product) => {
    const existingIndex = lines.findIndex((l) => l.productId === product.id);
    if (existingIndex >= 0) {
      const updated = [...lines];
      updated[existingIndex].quantity += 1;
      setLines(updated);
    } else {
      setLines([
        ...lines,
        {
          productId: product.id,
          productName: product.name,
          quantity: 1,
          unitPrice: product.basePrice,
          unitCost: product.unitCost,
          discountPct: 0,
          lineTotal: product.basePrice,
          lineMarginPct: Math.round(((product.basePrice - product.unitCost) / product.basePrice) * 100),
        },
      ]);
    }
  };

  const updateLine = (index: number, partial: Partial<WorkspaceLineItem>) => {
    const updated = [...lines];
    updated[index] = { ...updated[index], ...partial };
    setLines(updated);
  };

  const removeLine = (index: number) => {
    setLines(lines.filter((_, i) => i !== index));
  };

  const handleSubmit = async (autoSubmitForApproval = false) => {
    if (!selectedCustomerId || lines.length === 0) return;
    try {
      setIsSubmitting(true);
      const created = await ApiClient.post<Quotation>('/quotations', {
        customerId: selectedCustomerId,
        lines: lines.map((l) => ({
          productId: l.productId,
          quantity: l.quantity,
          discountPct: l.discountPct,
        })),
        notes,
      });

      if (autoSubmitForApproval) {
        await ApiClient.post(`/quotations/${created.id}/submit`);
      }

      router.push(`/quotations/${created.id}`);
    } catch (err: any) {
      alert(`Error submitting quotation: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-blue-600" /> Sales Workspace
          </h1>
          <p className="text-slate-500 text-sm mt-0.5">
            Configure line items, apply governed discounts, and evaluate real-time pricing and risk.
          </p>
        </div>

        {/* Customer Selector */}
        <div className="flex items-center gap-3 bg-white p-2.5 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider pl-2">Customer:</span>
          <select
            value={selectedCustomerId}
            onChange={(e) => setSelectedCustomerId(e.target.value)}
            className="text-sm font-medium bg-transparent border-0 focus:ring-0 text-slate-900 pr-4 cursor-pointer font-semibold"
          >
            {customers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({tiers.find((t) => t.id === c.tierId)?.name} Tier)
              </option>
            ))}
          </select>
          {customerTier && (
            <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 border border-blue-200">
              Max {customerTier.baseDiscountLimitPct}% Disc
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Quotation Line Items & Builder (2 Cols) */}
        <div className="lg:col-span-2 space-y-6">
          <Card
            title="Quotation Line Items"
            subtitle={`${lines.length} items currently configured`}
            action={
              <span className="text-xs text-slate-500 font-medium">
                Authorized Tier Cap: <strong className="text-slate-800">{customerTier?.baseDiscountLimitPct || 10}%</strong>
              </span>
            }
          >
            {lines.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-xl">
                <AlertCircle className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-700 font-medium text-sm">Quotation is currently empty</p>
                <p className="text-slate-400 text-xs mt-1">Select products from the catalog below to begin building your deal.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="text-xs text-slate-400 uppercase border-b border-slate-100 font-semibold">
                    <tr>
                      <th className="pb-3">Product</th>
                      <th className="pb-3 w-20">Qty</th>
                      <th className="pb-3 w-28">Unit Price</th>
                      <th className="pb-3 w-28">Discount %</th>
                      <th className="pb-3 w-24">Margin</th>
                      <th className="pb-3 w-28 text-right">Line Total</th>
                      <th className="pb-3 w-10"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {lines.map((line, idx) => {
                      const exceedsLimit = line.discountPct > (customerTier?.baseDiscountLimitPct || 10);
                      return (
                        <tr key={idx} className="hover:bg-slate-50/50">
                          <td className="py-3 font-medium text-slate-900">
                            <div>{line.productName}</div>
                            <span className="text-[11px] text-slate-400">Cost: ${line.unitCost}</span>
                          </td>
                          <td className="py-3">
                            <input
                              type="number"
                              min="1"
                              value={line.quantity}
                              onChange={(e) => updateLine(idx, { quantity: Math.max(1, parseInt(e.target.value) || 1) })}
                              className="w-16 px-2 py-1 text-sm border rounded-lg focus:ring-1 focus:ring-blue-500 font-medium"
                            />
                          </td>
                          <td className="py-3 font-semibold text-slate-700">${line.unitPrice}</td>
                          <td className="py-3">
                            <div className="flex items-center gap-1">
                              <input
                                type="number"
                                min="0"
                                max="100"
                                value={line.discountPct}
                                onChange={(e) =>
                                  updateLine(idx, { discountPct: Math.min(100, Math.max(0, parseFloat(e.target.value) || 0)) })
                                }
                                className={`w-16 px-2 py-1 text-sm border rounded-lg focus:ring-1 font-semibold ${
                                  exceedsLimit ? 'border-amber-400 text-amber-900 bg-amber-50/40' : 'border-slate-200'
                                }`}
                              />
                              <span className="text-xs text-slate-400">%</span>
                            </div>
                          </td>
                          <td className="py-3">
                            <span
                              className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                                line.lineMarginPct < 25 ? 'bg-rose-50 text-rose-700' : 'bg-emerald-50 text-emerald-700'
                              }`}
                            >
                              {line.lineMarginPct}%
                            </span>
                          </td>
                          <td className="py-3 font-bold text-slate-900 text-right">
                            ${Math.round(line.unitPrice * line.quantity * (1 - line.discountPct / 100)).toLocaleString()}
                          </td>
                          <td className="py-3 text-right">
                            <button
                              onClick={() => removeLine(idx)}
                              className="text-slate-400 hover:text-rose-600 p-1 rounded-lg transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            <div className="mt-4 pt-4 border-t border-slate-100">
              <label className="block text-xs font-semibold text-slate-600 mb-1">Commercial Notes / Terms:</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                placeholder="Add customer-specific terms, delivery conditions, or deal justification..."
                className="w-full text-xs p-2.5 border border-slate-200 rounded-lg focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </Card>

          {/* Product Catalog */}
          <Card
            title="Catalog & Products"
            subtitle="Search and add products to the quotation"
            action={
              <div className="relative w-64">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search products or SKU..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            }
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {filteredProducts.map((p) => (
                <div
                  key={p.id}
                  className="p-3 rounded-xl border border-slate-200/80 hover:border-blue-300 hover:bg-blue-50/20 transition-all flex items-center justify-between"
                >
                  <div className="pr-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900">{p.name}</span>
                      {p.isSubscription && (
                        <span className="text-[10px] bg-purple-50 text-purple-700 px-1.5 py-0.5 rounded border border-purple-200">
                          Sub
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">{p.description}</p>
                    <div className="text-xs font-bold text-slate-900 mt-1">
                      ${p.basePrice.toLocaleString()} {p.isSubscription ? '/mo' : ''}
                    </div>
                  </div>
                  <Button size="sm" variant="secondary" onClick={() => addProductToQuotation(p)} className="shrink-0 gap-1">
                    <Plus className="w-3.5 h-3.5" /> Add
                  </Button>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Right Column: Pricing Breakdown, Risk Scoring & Recommendations (1 Col) */}
        <div className="space-y-6">
          {/* Real-time Pricing Summary */}
          <Card title="Pricing & Margin Engine" subtitle="Backend calculated live totals">
            {calculation ? (
              <div className="space-y-4">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between text-slate-600">
                    <span>Subtotal:</span>
                    <span className="font-semibold text-slate-900">${calculation.subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-emerald-600 font-medium">
                    <span>Discount Applied:</span>
                    <span>-${calculation.discountAmount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Estimated Tax (8.5%):</span>
                    <span className="font-semibold text-slate-900">${calculation.taxAmount.toLocaleString()}</span>
                  </div>
                  <div className="pt-2 border-t border-slate-100 flex justify-between text-base font-bold text-slate-900">
                    <span>Total Deal:</span>
                    <span className="text-blue-600">${calculation.total.toLocaleString()}</span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-600">Gross Margin:</span>
                  <span
                    className={`text-sm font-bold ${
                      calculation.marginPct < 25 ? 'text-rose-600' : 'text-emerald-600'
                    }`}
                  >
                    {calculation.marginPct}%
                  </span>
                </div>

                {/* Risk Score & Level */}
                <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Risk Assessment:</span>
                    <RiskBadge level={calculation.riskLevel} score={calculation.riskScore} />
                  </div>

                  {calculation.riskFactors.length > 0 && (
                    <div className="space-y-1 pt-1">
                      {calculation.riskFactors.map((factor, i) => (
                        <p key={i} className="text-[11px] text-slate-600 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3 text-amber-500 shrink-0" />
                          {factor}
                        </p>
                      ))}
                    </div>
                  )}
                </div>

                {/* Approval Routing Notice */}
                {calculation.requiresApproval ? (
                  <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs space-y-1">
                    <div className="font-bold flex items-center gap-1.5">
                      <ShieldAlert className="w-4 h-4 text-amber-600" />
                      Approval Required ({calculation.approvalRole?.replace('_', ' ')})
                    </div>
                    <p className="text-[11px] text-amber-800">
                      This quotation exceeds tier discount limit or risk threshold. Will be queued for manager review upon submission.
                    </p>
                  </div>
                ) : (
                  <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Complies with all commercial pricing and discount rules.</span>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="pt-2 space-y-2">
                  <Button
                    onClick={() => handleSubmit(true)}
                    isLoading={isSubmitting}
                    className="w-full gap-2 text-sm font-semibold shadow-md shadow-blue-500/20"
                  >
                    Submit Quotation <ArrowRight className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleSubmit(false)}
                    isLoading={isSubmitting}
                    className="w-full text-xs"
                  >
                    Save as Draft
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-6 text-slate-400 text-xs">
                Add products to the quotation to see dynamic pricing, margin, and risk evaluation.
              </div>
            )}
          </Card>

          {/* Recommendation Engine Rail */}
          {recommendations.length > 0 && (
            <Card
              title="Recommended Add-ons"
              subtitle="Complementary products for this basket"
            >
              <div className="space-y-2.5">
                {recommendations.map((rec, i) => (
                  <div
                    key={i}
                    className="p-3 rounded-xl bg-gradient-to-r from-blue-50/60 to-indigo-50/40 border border-blue-100 flex items-center justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-slate-900">{rec.product.name}</span>
                        <span className="text-[10px] bg-blue-100 text-blue-800 font-semibold px-1.5 rounded">
                          {rec.type}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">{rec.reason}</p>
                      <p className="text-xs font-bold text-slate-900 mt-1">${rec.product.basePrice}</p>
                    </div>
                    <Button size="sm" onClick={() => addProductToQuotation(rec.product)} className="shrink-0">
                      Add
                    </Button>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
