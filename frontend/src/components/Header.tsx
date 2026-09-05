'use client';

import React from 'react';
import { useAuth } from '../context/AuthContext';
import { UserCheck, RefreshCw } from 'lucide-react';

export function Header() {
  const { currentUser, switchUser, demoUsers } = useAuth();

  return (
    <header className="h-16 bg-white border-b border-slate-200/80 px-8 flex items-center justify-between sticky top-0 z-30 shadow-sm">
      <div className="flex items-center gap-3">
        <h1 className="text-lg font-bold text-slate-900 tracking-tight">DealFlow360</h1>
        <span className="text-slate-300 font-light">|</span>
        <span className="text-xs font-semibold px-2.5 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200/60">
          Live B2B Engine
        </span>
      </div>

      {/* 1-Click Interactive Demo Role Switcher */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs">
          <span className="px-2 py-1 text-[11px] font-semibold text-slate-500 uppercase flex items-center gap-1">
            <UserCheck className="w-3.5 h-3.5 text-blue-600" /> Demo Role:
          </span>
          {demoUsers.map((user) => {
            const isSelected = currentUser.id === user.id;
            return (
              <button
                key={user.id}
                onClick={() => switchUser(user)}
                className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                  isSelected
                    ? 'bg-blue-600 text-white shadow-sm font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/70'
                }`}
                title={`${user.name} (${user.email})`}
              >
                {user.role === 'SALES_REP'
                  ? 'Sales Rep'
                  : user.role === 'SALES_MANAGER'
                  ? 'Manager'
                  : user.role === 'FINANCE'
                  ? 'Finance'
                  : user.role === 'CUSTOMER'
                  ? 'Customer'
                  : 'Admin'}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
}
