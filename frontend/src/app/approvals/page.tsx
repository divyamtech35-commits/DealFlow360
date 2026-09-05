'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { CheckSquare, CheckCircle2, XCircle, ArrowRight, ShieldCheck } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { RiskBadge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { ApiClient } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import { ApprovalRequest } from '../../types';

export default function ApprovalDashboardPage() {
  const { currentUser, isManager, isFinance, isAdmin } = useAuth();
  const [requests, setRequests] = useState<ApprovalRequest[]>([]);
  const [loading, setLoading] = useState(true);

  const [activeRequest, setActiveRequest] = useState<ApprovalRequest | null>(null);
  const [actionType, setActionType] = useState<'APPROVE' | 'REJECT'>('APPROVE');
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadApprovals();
  }, []);

  async function loadApprovals() {
    try {
      setLoading(true);
      const data = await ApiClient.get<ApprovalRequest[]>('/approvals?status=PENDING');
      setRequests(data);
    } catch (err) {
      console.error('Failed to load approvals:', err);
    } finally {
      setLoading(false);
    }
  }

  const openActionModal = (req: ApprovalRequest, type: 'APPROVE' | 'REJECT') => {
    setActiveRequest(req);
    setActionType(type);
    setComment(type === 'APPROVE' ? 'Approved for account closing' : 'Discount exceeds acceptable margin threshold');
  };

  const handleAction = async () => {
    if (!activeRequest) return;
    try {
      setSubmitting(true);
      const endpoint = actionType === 'APPROVE' ? 'approve' : 'reject';
      await ApiClient.post(`/approvals/${activeRequest.id}/${endpoint}`, {
        comment,
      });

      alert(`Quotation ${actionType === 'APPROVE' ? 'approved' : 'rejected'} successfully!`);
      setActiveRequest(null);
      loadApprovals();
    } catch (err: any) {
      alert(`Approval error: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <CheckSquare className="w-6 h-6 text-blue-600" /> Approval Governance Dashboard
        </h1>
        <p className="text-slate-500 text-sm mt-0.5">
          Review commercial discount exceptions, margin deviations, and elevated risk quotations requiring executive sign-off.
        </p>
      </div>

      <Card
        title="Pending Approval Queue"
        subtitle={`${requests.length} quotations awaiting review`}
      >
        {loading ? (
          <div className="text-center py-12 text-slate-400">Loading pending requests...</div>
        ) : requests.length === 0 ? (
          <div className="text-center py-12 text-slate-500 text-sm">
            <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2 opacity-80" />
            <p className="font-semibold text-slate-700">All Approvals Cleared</p>
            <p className="text-xs text-slate-400 mt-0.5">No pending quotation approval requests in queue.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-xs text-slate-400 uppercase border-b border-slate-100 font-semibold">
                <tr>
                  <th className="pb-3">Quotation #</th>
                  <th className="pb-3">Customer</th>
                  <th className="pb-3">Total Value</th>
                  <th className="pb-3">Requested Disc</th>
                  <th className="pb-3">Risk Assessment</th>
                  <th className="pb-3">Required Authority</th>
                  <th className="pb-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {requests.map((req) => (
                  <tr key={req.id} className="hover:bg-slate-50/50">
                    <td className="py-4 font-bold text-blue-600">
                      <Link href={`/quotations/${req.quotationId}`} className="hover:underline">
                        {req.quotationNumber}
                      </Link>
                    </td>
                    <td className="py-4 font-medium text-slate-900">{req.customerName}</td>
                    <td className="py-4 font-bold text-slate-900">${(req.totalAmount || 0).toLocaleString()}</td>
                    <td className="py-4 font-semibold text-amber-700">{req.discountPct}%</td>
                    <td className="py-4">
                      <RiskBadge level={req.riskLevel || 'HIGH'} score={req.riskScore} />
                    </td>
                    <td className="py-4">
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                        {req.requiredRole.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          size="sm"
                          variant="success"
                          onClick={() => openActionModal(req, 'APPROVE')}
                          className="gap-1 shadow-sm"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" /> Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="danger"
                          onClick={() => openActionModal(req, 'REJECT')}
                          className="gap-1"
                        >
                          <XCircle className="w-3.5 h-3.5" /> Reject
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Action Dialog */}
      <Modal
        isOpen={Boolean(activeRequest)}
        onClose={() => setActiveRequest(null)}
        title={`Confirm ${actionType === 'APPROVE' ? 'Approval' : 'Rejection'}`}
        footer={
          <>
            <Button variant="outline" onClick={() => setActiveRequest(null)}>
              Cancel
            </Button>
            <Button
              variant={actionType === 'APPROVE' ? 'success' : 'danger'}
              onClick={handleAction}
              isLoading={submitting}
            >
              Confirm {actionType === 'APPROVE' ? 'Approval' : 'Rejection'}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-600">
            You are {actionType === 'APPROVE' ? 'approving' : 'rejecting'} quotation{' '}
            <strong className="text-slate-900">{activeRequest?.quotationNumber}</strong> for{' '}
            <strong className="text-slate-900">{activeRequest?.customerName}</strong>.
          </p>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Audit Comment (Recorded in permanent ledger):
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={3}
              className="w-full text-xs p-2.5 border border-slate-200 rounded-lg focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>
      </Modal>
    </div>
  );
}
