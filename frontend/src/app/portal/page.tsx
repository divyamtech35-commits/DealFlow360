'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Globe,
  FileText,
  MessageSquare,
  CheckCircle2,
  Truck,
  CreditCard,
  Send,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { StatusBadge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { ApiClient } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import { Quotation, Invoice, FulfillmentOrder, Negotiation } from '../../types';

export default function CustomerPortalPage() {
  const { currentUser } = useAuth();
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [fulfillmentOrders, setFulfillmentOrders] = useState<FulfillmentOrder[]>([]);
  const [loading, setLoading] = useState(true);

  // Negotiation state
  const [selectedQuotation, setSelectedQuotation] = useState<Quotation | null>(null);
  const [negotiation, setNegotiation] = useState<Negotiation | null>(null);
  const [counterDiscount, setCounterDiscount] = useState(12);
  const [messageText, setMessageText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadPortalData();
  }, [currentUser]);

  async function loadPortalData() {
    try {
      setLoading(true);
      const [quotes, invs, orders] = await Promise.all([
        ApiClient.get<Quotation[]>('/quotations'),
        ApiClient.get<Invoice[]>('/invoices'),
        ApiClient.get<FulfillmentOrder[]>('/fulfillment'),
      ]);
      setQuotations(quotes);
      setInvoices(invs);
      setFulfillmentOrders(orders);
    } catch (err) {
      console.error('Failed to load portal data:', err);
    } finally {
      setLoading(false);
    }
  }

  const openNegotiate = async (q: Quotation) => {
    setSelectedQuotation(q);
    try {
      const neg = await ApiClient.get<Negotiation | null>(`/negotiations/quotation/${q.id}`);
      setNegotiation(neg);
    } catch (e) {
      setNegotiation(null);
    }
  };

  const handleSendCounter = async () => {
    if (!selectedQuotation) return;
    try {
      setSubmitting(true);
      if (negotiation) {
        await ApiClient.post(`/negotiations/${negotiation.id}/counter`, {
          counterDiscountPct: counterDiscount,
          message: messageText || `Proposed discount: ${counterDiscount}%`,
        });
      } else {
        await ApiClient.post('/negotiations', {
          quotationId: selectedQuotation.id,
          requestedDiscountPct: counterDiscount,
          initialMessage: messageText || `Requested discount of ${counterDiscount}%`,
        });
      }

      alert('Counter-offer transmitted to DealFlow360 engine! Terms recalculated.');
      setSelectedQuotation(null);
      loadPortalData();
    } catch (err: any) {
      alert(`Error submitting counter: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleAcceptQuotation = async (q: Quotation) => {
    try {
      setSubmitting(true);
      await ApiClient.post(`/quotations/${q.id}/confirm`);
      alert('Quotation accepted and confirmed! Order fulfillment initiated.');
      loadPortalData();
    } catch (err: any) {
      alert(`Error accepting quotation: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-900 rounded-2xl p-8 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
            Customer Self-Service Portal
          </span>
          <h1 className="text-2xl font-bold tracking-tight mt-2">
            {currentUser.name}
          </h1>
          <p className="text-slate-300 text-xs mt-1">
            Review commercial proposals, negotiate deal terms, monitor shipment fulfillment, and access billing.
          </p>
        </div>
        <div className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-xl border border-white/10 text-xs">
          <span className="text-slate-400">Account ID:</span>{' '}
          <strong className="text-white">{currentUser.customerId || 'Acme Corp'}</strong>
        </div>
      </div>

      {/* Quotations for Customer Review */}
      <Card
        title="Your Commercial Proposals & Quotations"
        subtitle="Review, counter-offer, or confirm deals directly"
      >
        {quotations.length === 0 ? (
          <div className="text-center py-8 text-slate-400 text-xs">No quotations currently available for review.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-xs text-slate-400 uppercase border-b border-slate-100 font-semibold">
                <tr>
                  <th className="pb-3">Quotation #</th>
                  <th className="pb-3">Line Items</th>
                  <th className="pb-3">Total Amount</th>
                  <th className="pb-3">Applied Discount</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {quotations.map((q) => (
                  <tr key={q.id} className="hover:bg-slate-50/50">
                    <td className="py-4 font-bold text-blue-600">
                      <Link href={`/quotations/${q.id}`} className="hover:underline">
                        {q.quotationNumber}
                      </Link>
                    </td>
                    <td className="py-4 text-slate-700 text-xs">
                      {q.lines.map((l) => `${l.productName} (x${l.quantity})`).join(', ')}
                    </td>
                    <td className="py-4 font-bold text-slate-900">${q.total.toLocaleString()}</td>
                    <td className="py-4 text-emerald-600 font-semibold">-${q.discountAmount.toLocaleString()}</td>
                    <td className="py-4">
                      <StatusBadge status={q.status} />
                    </td>
                    <td className="py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {['APPROVED', 'UNDER_NEGOTIATION'].includes(q.status) && (
                          <Button
                            size="sm"
                            variant="success"
                            onClick={() => handleAcceptQuotation(q)}
                            className="gap-1 shadow-sm text-xs"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" /> Accept & Confirm
                          </Button>
                        )}
                        {q.status !== 'CONFIRMED' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openNegotiate(q)}
                            className="gap-1 text-xs"
                          >
                            <MessageSquare className="w-3.5 h-3.5 text-purple-600" /> Counter Offer
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

      {/* Fulfillment Status & Invoices Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Fulfillment Tracking */}
        <Card
          title="Order Fulfillment & Shipments"
          subtitle="Warehouse stock reservation and backorder tracking"
          action={
            <Link href="/fulfillment" className="text-xs font-semibold text-blue-600 hover:text-blue-700">
              Details
            </Link>
          }
        >
          {fulfillmentOrders.length === 0 ? (
            <div className="text-center py-8 text-slate-400 text-xs">No active shipments in transit.</div>
          ) : (
            <div className="space-y-3">
              {fulfillmentOrders.map((ord) => (
                <div key={ord.id} className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 text-sm">{ord.orderNumber}</span>
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                      {ord.status.replace('_', ' ')}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600">
                    Allocations: {ord.allocations.length} items reserved across warehouses.
                  </p>
                  {ord.backorders?.length > 0 && (
                    <p className="text-xs text-amber-700 font-medium">
                      ⚠️ {ord.backorders.length} backordered items scheduled for restock.
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Invoices & Payment Status */}
        <Card
          title="Invoices & Statements"
          subtitle="View invoices and settle balances"
          action={
            <Link href="/billing" className="text-xs font-semibold text-blue-600 hover:text-blue-700">
              Billing Center
            </Link>
          }
        >
          {invoices.length === 0 ? (
            <div className="text-center py-8 text-slate-400 text-xs">No invoices currently billed.</div>
          ) : (
            <div className="space-y-3">
              {invoices.map((inv) => (
                <div key={inv.id} className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-slate-900 text-sm">{inv.invoiceNumber}</span>
                    <p className="text-xs text-slate-500 mt-0.5">Total: ${inv.total.toLocaleString()} | Due: {new Date(inv.dueDate).toLocaleDateString()}</p>
                    <div className="mt-1">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        inv.status === 'PAID' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {inv.status}
                      </span>
                    </div>
                  </div>
                  <Link href="/billing">
                    <Button size="sm" variant="outline">
                      View Invoice
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Counter-Offer Negotiation Modal */}
      <Modal
        isOpen={Boolean(selectedQuotation)}
        onClose={() => setSelectedQuotation(null)}
        title="Negotiate Commercial Proposal"
        footer={
          <>
            <Button variant="outline" onClick={() => setSelectedQuotation(null)}>
              Cancel
            </Button>
            <Button onClick={handleSendCounter} isLoading={submitting} className="gap-1.5">
              <Send className="w-3.5 h-3.5" /> Submit Counter Offer
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-600">
            Submit a revised discount request for quotation{' '}
            <strong className="text-slate-900">{selectedQuotation?.quotationNumber}</strong>. The DealFlow360 engine will
            recalculate margin, evaluate risk, and re-route for approval if necessary.
          </p>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Target Discount Requested (%):
            </label>
            <input
              type="number"
              min="0"
              max="100"
              value={counterDiscount}
              onChange={(e) => setCounterDiscount(parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 text-sm border rounded-lg focus:ring-1 focus:ring-blue-500 font-bold"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Message to Sales Representative:
            </label>
            <textarea
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              rows={3}
              placeholder="State reasons, volume commitments, or accelerated closing timelines..."
              className="w-full text-xs p-2.5 border border-slate-200 rounded-lg focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>
      </Modal>
    </div>
  );
}
