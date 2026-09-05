import React from 'react';
import { QuotationStatus, RiskLevel } from '../../types';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'purple' | 'outline';
  className?: string;
}

export function Badge({ children, variant = 'default', className = '' }: BadgeProps) {
  const variantStyles = {
    default: 'bg-slate-100 text-slate-800 border-slate-200',
    success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    warning: 'bg-amber-50 text-amber-700 border-amber-200',
    danger: 'bg-rose-50 text-rose-700 border-rose-200',
    info: 'bg-sky-50 text-sky-700 border-sky-200',
    purple: 'bg-purple-50 text-purple-700 border-purple-200',
    outline: 'border-slate-300 text-slate-700 bg-white',
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${variantStyles[variant]} ${className}`}
    >
      {children}
    </span>
  );
}

export function StatusBadge({ status }: { status: QuotationStatus }) {
  switch (status) {
    case 'DRAFT':
      return <Badge variant="default">Draft</Badge>;
    case 'PENDING_APPROVAL':
      return <Badge variant="warning">Pending Approval</Badge>;
    case 'APPROVED':
      return <Badge variant="success">Approved</Badge>;
    case 'REJECTED':
      return <Badge variant="danger">Rejected</Badge>;
    case 'UNDER_NEGOTIATION':
      return <Badge variant="purple">Under Negotiation</Badge>;
    case 'CONFIRMED':
      return <Badge variant="success">Confirmed Deal</Badge>;
    case 'CANCELLED':
      return <Badge variant="danger">Cancelled</Badge>;
    default:
      return <Badge>{status}</Badge>;
  }
}

export function RiskBadge({ level, score }: { level: RiskLevel; score?: number }) {
  let variant: 'success' | 'warning' | 'danger' | 'info' = 'info';
  if (level === 'LOW') variant = 'success';
  if (level === 'MEDIUM') variant = 'info';
  if (level === 'HIGH') variant = 'warning';
  if (level === 'CRITICAL') variant = 'danger';

  return (
    <Badge variant={variant}>
      {level} Risk {score !== undefined ? `(${score})` : ''}
    </Badge>
  );
}
