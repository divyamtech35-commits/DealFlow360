'use client';

import React, { useEffect, useState } from 'react';
import { CreditCard, DollarSign, CheckCircle2, Clock, Pause, Play, XCircle, ArrowRight } from 'lucide-react';
import { Card, StatCard } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { ApiClient } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import { Invoice, Subscription } from '../../types';

export default function BillingPage() {
  const { currentUser, isFinance, isAdmin } = useAuth();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);

  // Payment modal
  const [activeInvoice, setActiveInvoice] = useState<Invoice | null>(null);
  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<'WIRE_TRANSFER' | 'CREDIT_CARD' | 'ACH' | 'CHECK'>('WIRE_TRANSFER');
  const [refNumber, setRefNumber] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadBillingData();
  }, [currentUser]);

  async function loadBillingData() {
    try {
      setLoading(true);
      const [invList, subList] = await Promise.all([
        ApiClient.get<Invoice[]>('/invoices'),
        ApiClient.get<Subscription[]>('/subscriptions').catch(() => []),
      ]);
      setInvoices(invList);
      setSubscriptions(subList);
    } catch (err) {
      console.error('Failed to load billing:', err);
    } finally {
      setLoading(false);
    }
  }

  const openPaymentModal = (inv: Invoice) => {
    setActiveInvoice(inv);
    setPaymentAmount(inv.balanceDue);
    setRefNumber(`WIRE-${Math.floor(100000 + Math.random() * 900000)}`);
  };

  const handleRecordPayment = async () => {
    if (!activeInvoice) return;
    try {
      setSubmitting(true);
      await ApiClient.post(`/invoices/${activeInvoice.id}/pay`, {
        amount: paymentAmount,
        paymentMethod,
        referenceNumber: refNumber,
      });

      alert('Payment recorded successfully!');
      setActiveInvoice(null);
      loadBillingData();
    } catch (err: any) {
      alert(`Payment error: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubscriptionAction = async (subId: string, action: 'PAUSE' | 'RESUME' | 'CANCEL') => {
    try {
      await ApiClient.post(`/subscriptions/${subId}/${action.toLowerCase()}`);
      alert(`Subscription ${action.toLowerCase()}d!`);
      loadBillingData();
    } catch (err: any) {
      alert(`Subscription action error: ${err.message}`);
    }
  };

  const totalInvoiced = invoices.reduce((acc, i) => acc + i.total, 0);
  const totalPaid = invoices.reduce((acc, i) => acc + i.amountPaid, 0);
  const totalBalanceDue = invoices.reduce((acc, i) => acc + i.balanceDue, 0);

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <CreditCard className="w-6 h-6 text-blue-600" /> Billing & Revenue Management
        </h1>
        <p className="text-slate-500 text-sm mt-0.5">
          Automated customer invoicing, cash collection recording, payment reconciliation, and subscription lifecycle management.
        </p>
      </div>

      {/* Financial Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="Total Contracted Invoices"
          value={`$${totalInvoiced.toLocaleString()}`}
          change={`${invoices.length} total generated invoices`}
          icon={<DollarSign className="w-5 h-5 text-blue-600" />}
          trend="neutral"
        />
        <StatCard
          title="Collected Cash"
          value={`$${totalPaid.toLocaleString()}`}
          change="Funds settled in corporate account"
          icon={<CheckCircle2 className="w-5 h-5 text-emerald-600" />}
          trend="up"
        />
        <StatCard
          title="Outstanding Receivables"
          value={`$${totalBalanceDue.toLocaleString()}`}
          change="Awaiting payment settlement"
          icon={<Clock className="w-5 h-5 text-amber-600" />}
          trend={totalBalanceDue > 0 ? "down" : "up"}
        />
      </div>

      {/* Invoices Table */}
      <Card title="Customer Invoices & Statements" subtitle="One-time and deal-generated invoices">
        {loading ? (
          <div className="text-center py-12 text-slate-400">Loading invoices...</div>
        ) : invoices.length === 0 ? (
          <div className="text-center py-12 text-slate-500 text-sm">
            No invoices currently recorded. Confirm a deal to generate an invoice automatically!
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-xs text-slate-400 uppercase border-b border-slate-100 font-semibold">
                <tr>
                  <th className="pb-3">Invoice #</th>
                  <th className="pb-3">Customer</th>
                  <th className="pb-3">Invoice Total</th>
                  <th className="pb-3">Amount Settled</th>
                  <th className="pb-3">Balance Due</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {invoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-50/50">
                    <td className="py-4 font-bold text-blue-600">{inv.invoiceNumber}</td>
                    <td className="py-4 font-medium text-slate-900">{inv.customerName}</td>
                    <td className="py-4 font-bold text-slate-900">${inv.total.toLocaleString()}</td>
                    <td className="py-4 font-semibold text-emerald-600">${inv.amountPaid.toLocaleString()}</td>
                    <td className="py-4 font-bold text-slate-900">
                      ${inv.balanceDue.toLocaleString()}
                    </td>
                    <td className="py-4">
                      <span
                        className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                          inv.status === 'PAID'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {inv.status}
                      </span>
                    </td>
                    <td className="py-4 text-right">
                      {inv.balanceDue > 0 && (
                        <Button
                          size="sm"
                          variant="success"
                          onClick={() => openPaymentModal(inv)}
                          className="gap-1 shadow-sm text-xs"
                        >
                          <CreditCard className="w-3.5 h-3.5" /> Record Payment
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Subscriptions Section */}
      <Card title="Recurring Subscriptions" subtitle="SaaS platform & recurring support contracts">
        {subscriptions.length === 0 ? (
          <div className="text-center py-8 text-slate-400 text-xs">
            No active subscriptions. (Subscriptions are created for recurring software/support line items).
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-xs text-slate-400 uppercase border-b border-slate-100 font-semibold">
                <tr>
                  <th className="pb-3">Customer</th>
                  <th className="pb-3">Plan / Product</th>
                  <th className="pb-3">Billing Cadence</th>
                  <th className="pb-3">Recurring Price</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {subscriptions.map((sub) => (
                  <tr key={sub.id}>
                    <td className="py-3 font-medium text-slate-900">{sub.customerName}</td>
                    <td className="py-3 font-semibold text-slate-800">{sub.productName}</td>
                    <td className="py-3 text-xs text-slate-600">{sub.billingInterval}</td>
                    <td className="py-3 font-bold text-slate-900">${sub.amount}/mo</td>
                    <td className="py-3">
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                        {sub.status}
                      </span>
                    </td>
                    <td className="py-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {sub.status === 'ACTIVE' && (
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => handleSubscriptionAction(sub.id, 'PAUSE')}
                            className="text-xs"
                          >
                            <Pause className="w-3 h-3 mr-1" /> Pause
                          </Button>
                        )}
                        {sub.status === 'PAUSED' && (
                          <Button
                            size="sm"
                            variant="success"
                            onClick={() => handleSubscriptionAction(sub.id, 'RESUME')}
                            className="text-xs"
                          >
                            <Play className="w-3 h-3 mr-1" /> Resume
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Record Payment Modal */}
      <Modal
        isOpen={Boolean(activeInvoice)}
        onClose={() => setActiveInvoice(null)}
        title="Record Customer Payment"
        footer={
          <>
            <Button variant="outline" onClick={() => setActiveInvoice(null)}>
              Cancel
            </Button>
            <Button variant="success" onClick={handleRecordPayment} isLoading={submitting}>
              Confirm Payment Entry
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-600">
            Applying payment towards Invoice <strong className="text-slate-900">{activeInvoice?.invoiceNumber}</strong>.
            Total balance due: <strong className="text-slate-900">${activeInvoice?.balanceDue.toLocaleString()}</strong>.
          </p>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Payment Amount ($):
            </label>
            <input
              type="number"
              min="1"
              max={activeInvoice?.balanceDue}
              value={paymentAmount}
              onChange={(e) => setPaymentAmount(parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 text-sm border rounded-lg focus:ring-1 focus:ring-blue-500 font-bold"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Payment Method:
            </label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value as any)}
              className="w-full px-3 py-2 text-xs border rounded-lg focus:ring-1 focus:ring-blue-500"
            >
              <option value="WIRE_TRANSFER">Wire Transfer (Fedwire / SWIFT)</option>
              <option value="CREDIT_CARD">Credit Card (Corporate Visa/Mastercard)</option>
              <option value="ACH">ACH Direct Debit</option>
              <option value="CHECK">Corporate Check</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Bank Reference / Confirmation Number:
            </label>
            <input
              type="text"
              value={refNumber}
              onChange={(e) => setRefNumber(e.target.value)}
              className="w-full px-3 py-2 text-xs border rounded-lg focus:ring-1 focus:ring-blue-500 font-mono"
            />
          </div>
        </div>
      </Modal>
    </div>
  );
}
