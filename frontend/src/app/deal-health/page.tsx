'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Activity, AlertTriangle, CheckCircle2, ShieldAlert, ArrowRight } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { RiskBadge } from '../../components/ui/Badge';
import { ApiClient } from '../../lib/api';
import { DealHealthAlert } from '../../types';

export default function DealHealthPage() {
  const [alerts, setAlerts] = useState<DealHealthAlert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAlerts();
  }, []);

  async function loadAlerts() {
    try {
      setLoading(true);
      const data = await ApiClient.get<DealHealthAlert[]>('/deal-health');
      setAlerts(data);
    } catch (err) {
      console.error('Failed to load deal health alerts:', err);
    } finally {
      setLoading(false);
    }
  }

  const handleResolve = async (id: string) => {
    try {
      await ApiClient.post(`/deal-health/${id}/resolve`);
      loadAlerts();
    } catch (err: any) {
      alert(`Error resolving alert: ${err.message}`);
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <Activity className="w-6 h-6 text-blue-600" /> Proactive Deal Health & Risk Alerts
        </h1>
        <p className="text-slate-500 text-sm mt-0.5">
          Real-time anomaly monitoring for stalled pipelines, aggressive discount leakage, margin compression, and fulfillment bottlenecks.
        </p>
      </div>

      <Card title="Active Operational Anomalies" subtitle={`${alerts.length} total monitored alerts`}>
        {loading ? (
          <div className="text-center py-12 text-slate-400">Loading alerts...</div>
        ) : alerts.length === 0 ? (
          <div className="text-center py-12 text-slate-500 text-sm">
            <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2 opacity-80" />
            <p className="font-semibold text-slate-700">Pipeline In Optimal Health</p>
            <p className="text-xs text-slate-400 mt-0.5">No active commercial or fulfillment alerts detected.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {alerts.map((alert) => (
              <div
                key={alert.id}
                className="p-5 rounded-2xl border border-slate-200 bg-white hover:border-slate-300 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2.5">
                    <RiskBadge level={alert.severity} />
                    <span className="font-bold text-slate-900 text-sm">
                      {alert.quotationNumber ? (
                        <Link href={`/quotations/${alert.quotationId}`} className="text-blue-600 hover:underline">
                          {alert.quotationNumber}
                        </Link>
                      ) : (
                        alert.type.replace('_', ' ')
                      )}
                    </span>
                    <span className="text-xs text-slate-400">| {alert.customerName}</span>
                  </div>
                  <p className="text-sm text-slate-700 font-medium">{alert.message}</p>
                  <div className="flex items-center gap-4 text-xs text-slate-400 pt-0.5">
                    <span>Category: <strong>{alert.type}</strong></span>
                    {alert.thresholdValue !== undefined && (
                      <span>Threshold: <strong>{alert.thresholdValue}</strong> | Current: <strong>{alert.currentValue}</strong></span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {alert.quotationId && (
                    <Link href={`/quotations/${alert.quotationId}`}>
                      <Button size="sm" variant="outline" className="text-xs gap-1">
                        View Quotation <ArrowRight className="w-3 h-3" />
                      </Button>
                    </Link>
                  )}
                  {alert.status === 'ACTIVE' && (
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => handleResolve(alert.id)}
                      className="text-xs"
                    >
                      Dismiss
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
