'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  ShieldAlert,
  FileCheck,
  Send,
  Truck,
  CreditCard,
  MessageSquare,
  AlertTriangle,
  History,
} from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { StatusBadge, RiskBadge, Badge } from '../../../components/ui/Badge';
import { Modal } from '../../../components/ui/Modal';
import { ApiClient } from '../../../lib/api';
import { useAuth } from '../../../context/AuthContext';
import { Quotation, QuotationStatus } from '../../../types';

export default function QuotationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const quotationId = params.id as string;
  const { currentUser, isManager, isFinance, isCustomer } = useAuth();

  const [quotation, setQuotation] = useState<Quotation | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [approvals, setApprovals] = useState<any[]>([]);

  // Approval modal state
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [approvalAction, setApprovalAction] = useState<'APPROVE' | 'REJECT'>('APPROVE');
  const [approvalComment, setApprovalComment] = useState('');

  // Negotiation modal state
  const [showNegotiationModal, setShowNegotiationModal] = useState(false);
  const [counterDiscountPct, setCounterDiscountPct] = useState(15);
  const [negotiationMessage, setNegotiationMessage] = useState('');

  useEffect(() => {
    async function loadQuotation() {
      try {
        setLoading(true);
        const [q, appr] = await Promise.all([
          ApiClient.get<Quotation>(`/quotations/${quotationId}`),
          ApiClient.get<any[]>(`/quotations/${quotationId}/approvals`).catch(() => []),
        ]);
        setQuotation(q);
        setApprovals(appr);
      } catch (err) {
        console.error('Failed to load quotation:', err);
      } finally {
        setLoading(false);
      }
    }
    loadQuotation();
  }, [quotationId]);

  if (loading) {
    return <div className="text-center py-20 text-slate-500">Loading quotation details...</div>;
  }

  if (!quotation) {
    return (
      <div className="text-center py-20">
        <p className="text-slate-600 font-semibold">Quotation not found.</p>
        <Link href="/quotations">
          <Button variant="outline" className="mt-4">
            Back to Quotations
          </Button>
        </Link>
      </div>
    );
  }

  const handleConfirmDeal = async () => {
    try {
      setActionLoading(true);
      const res = await ApiClient.post<any>(`/quotations/${quotation.id}/confirm`);
      setQuotation(res.quotation);
      alert('Deal successfully confirmed! Warehouse stock allocated and invoice generated.');
    } catch (err: any) {
      alert(`Error confirming deal: ${err.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  const handleApprovalSubmit = async () => {
    try {
      setActionLoading(true);
      // Find pending approval request for this quotation
      const requests = await ApiClient.get<any[]>('/approvals?status=PENDING');
      const targetReq = requests.find((r) => r.quotationId === quotation.id);

      if (targetReq) {
        const endpoint = approvalAction === 'APPROVE' ? 'approve' : 'reject';
        await ApiClient.post(`/approvals/${targetReq.id}/${endpoint}`, {
          comment: approvalComment,
        });
      }

      // Reload quotation
      const updated = await ApiClient.get<Quotation>(`/quotations/${quotation.id}`);
      setQuotation(updated);
      setShowApprovalModal(false);
    } catch (err: any) {
      alert(`Approval error: ${err.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  const handleStartNegotiation = async () => {
    try {
      setActionLoading(true);
      await ApiClient.post('/negotiations', {
        quotationId: quotation.id,
        requestedDiscountPct: counterDiscountPct,
        initialMessage: negotiationMessage || 'Customer submitted counter-offer',
      });

      const updated = await ApiClient.get<Quotation>(`/quotations/${quotation.id}`);
      setQuotation(updated);
      setShowNegotiationModal(false);
      alert('Counter offer submitted! Commercial terms and risk recalculated.');
    } catch (err: any) {
      alert(`Negotiation error: ${err.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  // Stepper logic
  const steps: { label: string; key: QuotationStatus }[] = [
    { label: 'Draft', key: 'DRAFT' },
    { label: 'Approval', key: 'PENDING_APPROVAL' },
    { label: 'Approved', key: 'APPROVED' },
    { label: 'Negotiation', key: 'UNDER_NEGOTIATION' },
    { label: 'Confirmed', key: 'CONFIRMED' },
  ];

  const getStepIndex = (status: QuotationStatus) => {
    switch (status) {
      case 'DRAFT':
        return 0;
      case 'PENDING_APPROVAL':
        return 1;
      case 'APPROVED':
        return 2;
      case 'UNDER_NEGOTIATION':
        return 3;
      case 'CONFIRMED':
        return 4;
      default:
        return 0;
    }
  };

  const currentStepIdx = getStepIndex(quotation.status);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Back button and title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link href="/quotations">
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-1" /> Back
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-slate-900">{quotation.quotationNumber}</h1>
              <StatusBadge status={quotation.status} />
              <RiskBadge level={quotation.riskLevel} score={quotation.riskScore} />
            </div>
            <p className="text-slate-500 text-xs mt-0.5">
              Customer: <strong className="text-slate-700">{quotation.customerName}</strong> | Sales Rep:{' '}
              <strong className="text-slate-700">{quotation.salesRepName}</strong>
            </p>
          </div>
        </div>

        {/* Action Buttons Header */}
        <div className="flex flex-wrap items-center gap-2">
          {/* If Manager and Pending Approval */}
          {(isManager || isFinance) && quotation.status === 'PENDING_APPROVAL' && (
            <Button
              onClick={() => {
                setApprovalAction('APPROVE');
                setShowApprovalModal(true);
              }}
              variant="success"
              className="gap-1.5 shadow-sm"
            >
              <FileCheck className="w-4 h-4" /> Review & Approve
            </Button>
          )}

          {/* Customer Negotiate Button */}
          {quotation.status !== 'CONFIRMED' && quotation.status !== 'CANCELLED' && (
            <Button
              variant="outline"
              onClick={() => setShowNegotiationModal(true)}
              className="gap-1.5"
            >
              <MessageSquare className="w-4 h-4 text-purple-600" /> Negotiate / Counter Offer
            </Button>
          )}

          {/* Confirm Deal Action */}
          {['APPROVED', 'UNDER_NEGOTIATION'].includes(quotation.status) && (
            <Button
              onClick={handleConfirmDeal}
              isLoading={actionLoading}
              className="gap-1.5 bg-blue-600 hover:bg-blue-700 shadow-md font-semibold"
            >
              <CheckCircle2 className="w-4 h-4" /> Confirm & Close Deal
            </Button>
          )}
        </div>
      </div>

      {/* Visual Deal Lifecycle Stepper */}
      <Card bodyClassName="p-4">
        <div className="flex items-center justify-between relative">
          <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-slate-200 -translate-y-1/2 z-0" />
          {steps.map((step, idx) => {
            const isCompleted = idx < currentStepIdx || quotation.status === 'CONFIRMED';
            const isCurrent = idx === currentStepIdx && quotation.status !== 'CONFIRMED';

            return (
              <div key={step.label} className="relative z-10 flex flex-col items-center bg-white px-3">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-colors ${
                    isCompleted
                      ? 'bg-emerald-600 text-white shadow-md'
                      : isCurrent
                      ? 'bg-blue-600 text-white ring-4 ring-blue-100'
                      : 'bg-slate-100 text-slate-400 border border-slate-300'
                  }`}
                >
                  {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                </div>
                <span
                  className={`text-xs font-semibold mt-1.5 ${
                    isCurrent ? 'text-blue-600 font-bold' : isCompleted ? 'text-slate-800' : 'text-slate-400'
                  }`}
                >
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Grid: Lines and Financials */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Line Items (2 Cols) */}
        <div className="lg:col-span-2 space-y-6">
          <Card title="Agreed Line Items">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="text-xs text-slate-400 uppercase border-b border-slate-100 font-semibold">
                  <tr>
                    <th className="pb-3">Product</th>
                    <th className="pb-3 text-center">Qty</th>
                    <th className="pb-3">Unit Price</th>
                    <th className="pb-3">Discount</th>
                    <th className="pb-3">Margin</th>
                    <th className="pb-3 text-right">Line Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {quotation.lines.map((l) => (
                    <tr key={l.id}>
                      <td className="py-3.5 font-medium text-slate-900">{l.productName}</td>
                      <td className="py-3.5 text-center font-semibold">{l.quantity}</td>
                      <td className="py-3.5 text-slate-700">${l.unitPrice}</td>
                      <td className="py-3.5 font-medium text-amber-700">
                        {l.discountPct}% (-${l.discountAmount})
                      </td>
                      <td className="py-3.5 font-semibold text-emerald-700">{l.lineMarginPct}%</td>
                      <td className="py-3.5 font-bold text-slate-900 text-right">${l.lineTotal.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {quotation.notes && (
              <div className="mt-4 pt-4 border-t border-slate-100">
                <span className="text-xs font-semibold text-slate-500 uppercase">Commercial Notes:</span>
                <p className="text-xs text-slate-700 mt-1 italic">{quotation.notes}</p>
              </div>
            )}
          </Card>

          {/* Connected Operational Objects if Confirmed */}
          {quotation.status === 'CONFIRMED' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-blue-900 uppercase tracking-wider flex items-center gap-1.5">
                    <Truck className="w-4 h-4 text-blue-700" /> Fulfillment Order
                  </span>
                  <p className="text-xs text-blue-700 mt-1">Inventory reserved & allocated across warehouses.</p>
                </div>
                <Link href="/fulfillment">
                  <Button size="sm" variant="outline" className="bg-white text-blue-900">
                    Track Stock
                  </Button>
                </Link>
              </div>

              <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200 rounded-xl p-4 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-emerald-900 uppercase tracking-wider flex items-center gap-1.5">
                    <CreditCard className="w-4 h-4 text-emerald-700" /> Invoice Generated
                  </span>
                  <p className="text-xs text-emerald-700 mt-1">Invoice issued for payment collection.</p>
                </div>
                <Link href="/billing">
                  <Button size="sm" variant="outline" className="bg-white text-emerald-900">
                    View Invoices
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Commercial Summary & Risk Evaluation (1 Col) */}
        <div className="space-y-6">
          <Card title="Commercial Breakdown">
            <div className="space-y-3 text-sm">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal:</span>
                <span className="font-semibold text-slate-900">${quotation.subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-emerald-600 font-medium">
                <span>Discount:</span>
                <span>-${quotation.discountAmount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Tax Amount:</span>
                <span className="font-semibold text-slate-900">${quotation.taxAmount.toLocaleString()}</span>
              </div>
              <div className="pt-2 border-t border-slate-100 flex justify-between text-base font-bold text-slate-900">
                <span>Total Contract:</span>
                <span className="text-blue-600 text-lg">${quotation.total.toLocaleString()}</span>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-slate-100 space-y-3">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500 font-medium">Gross Profit Margin:</span>
                <span className="font-bold text-emerald-700 text-sm">{quotation.marginPct}%</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500 font-medium">Risk Score:</span>
                <span className="font-bold text-slate-800">{quotation.riskScore} / 100</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500 font-medium">Approval Status:</span>
                <span className="font-semibold text-slate-800">
                  {quotation.approvalStatus?.replace('_', ' ') || 'NONE'}
                </span>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Approval Modal */}
      <Modal
        isOpen={showApprovalModal}
        onClose={() => setShowApprovalModal(false)}
        title="Manager Approval Review"
        footer={
          <>
            <Button variant="outline" onClick={() => setShowApprovalModal(false)}>
              Cancel
            </Button>
            <Button
              variant={approvalAction === 'APPROVE' ? 'success' : 'danger'}
              onClick={handleApprovalSubmit}
              isLoading={actionLoading}
            >
              Confirm {approvalAction === 'APPROVE' ? 'Approval' : 'Rejection'}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-600">
            Reviewing quotation <strong className="text-slate-900">{quotation.quotationNumber}</strong> for{' '}
            <strong className="text-slate-900">{quotation.customerName}</strong>.
          </p>

          <div className="flex gap-3">
            <Button
              type="button"
              variant={approvalAction === 'APPROVE' ? 'success' : 'outline'}
              className="flex-1"
              onClick={() => setApprovalAction('APPROVE')}
            >
              Approve Deal
            </Button>
            <Button
              type="button"
              variant={approvalAction === 'REJECT' ? 'danger' : 'outline'}
              className="flex-1"
              onClick={() => setApprovalAction('REJECT')}
            >
              Reject Deal
            </Button>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Audit Comment / Reason:
            </label>
            <textarea
              value={approvalComment}
              onChange={(e) => setApprovalComment(e.target.value)}
              placeholder="e.g. Approved for strategic key account expansion..."
              rows={3}
              className="w-full text-xs p-2.5 border border-slate-200 rounded-lg focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>
      </Modal>

      {/* Negotiation Counter-Offer Modal */}
      <Modal
        isOpen={showNegotiationModal}
        onClose={() => setShowNegotiationModal(false)}
        title="Commercial Negotiation Counter-Offer"
        footer={
          <>
            <Button variant="outline" onClick={() => setShowNegotiationModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleStartNegotiation} isLoading={actionLoading} className="gap-1.5">
              <Send className="w-3.5 h-3.5" /> Submit Counter-Offer
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-600">
            Propose revised commercial terms. The system will automatically recalculate pricing, discount compliance,
            risk scoring, and re-evaluate approval requirements.
          </p>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Requested Counter Discount %:
            </label>
            <input
              type="number"
              min="0"
              max="100"
              value={counterDiscountPct}
              onChange={(e) => setCounterDiscountPct(parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 text-sm border rounded-lg focus:ring-1 focus:ring-blue-500 font-bold"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Negotiation Message / Counter Justification:
            </label>
            <textarea
              value={negotiationMessage}
              onChange={(e) => setNegotiationMessage(e.target.value)}
              placeholder="e.g. We are ready to sign immediately if discount is adjusted to 18%..."
              rows={3}
              className="w-full text-xs p-2.5 border border-slate-200 rounded-lg focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>
      </Modal>
    </div>
  );
}
