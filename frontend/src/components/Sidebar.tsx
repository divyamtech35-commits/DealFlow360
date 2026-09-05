'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  ShoppingCart,
  FileText,
  CheckSquare,
  Truck,
  CreditCard,
  Users,
  Activity,
  BarChart3,
  Globe,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export function Sidebar() {
  const pathname = usePathname();
  const { currentUser, isCustomer, isManager, isFinance, isSalesRep, isAdmin } = useAuth();

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, show: true },
    { name: 'Sales Workspace', href: '/sales', icon: ShoppingCart, show: isSalesRep || isAdmin },
    { name: 'Quotations', href: '/quotations', icon: FileText, show: !isCustomer },
    { name: 'Approvals', href: '/approvals', icon: CheckSquare, show: isManager || isFinance || isAdmin },
    { name: 'Customer Portal', href: '/portal', icon: Globe, show: isCustomer || isAdmin },
    { name: 'Fulfillment & Stock', href: '/fulfillment', icon: Truck, show: !isCustomer },
    { name: 'Billing & Invoices', href: '/billing', icon: CreditCard, show: isFinance || isAdmin || isCustomer },
    { name: 'Customers & Tiers', href: '/customers', icon: Users, show: !isCustomer },
    { name: 'Deal Health', href: '/deal-health', icon: Activity, show: !isCustomer },
    { name: 'Reports & KPIs', href: '/reports', icon: BarChart3, show: !isCustomer },
  ];

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col shrink-0 border-r border-slate-800 min-h-screen">
      {/* Brand Header */}
      <div className="h-16 flex items-center gap-3 px-6 border-b border-slate-800/80">
        <div className="h-9 w-9 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white font-bold shadow-md shadow-blue-500/20">
          <Sparkles className="w-5 h-5 text-white" />
        </div>
        <div>
          <span className="font-bold text-base text-white tracking-tight">DealFlow360</span>
          <span className="block text-[10px] text-blue-400 font-medium uppercase tracking-wider">Enterprise B2B</span>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navigation
          .filter((item) => item.show)
          .map((item) => {
            const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname?.startsWith(item.href));
            const Icon = item.icon;

            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                {item.name}
              </Link>
            );
          })}
      </nav>

      {/* Active User Card & Mode */}
      <div className="p-4 border-t border-slate-800">
        <div className="bg-slate-800/60 rounded-xl p-3 border border-slate-700/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-xs border border-blue-500/30">
              {currentUser.name.charAt(0)}
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-semibold text-white truncate">{currentUser.name}</p>
              <div className="flex items-center gap-1 mt-0.5">
                <ShieldCheck className="w-3 h-3 text-emerald-400" />
                <span className="text-[10px] text-emerald-400 font-medium uppercase tracking-wider">
                  {currentUser.role.replace('_', ' ')}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
