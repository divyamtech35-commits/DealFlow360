'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { ApiClient } from '../lib/api';

export const DEMO_USERS: User[] = [
  {
    id: 'user_sales_rep',
    name: 'Alex Rivera',
    email: 'alex.sales@dealflow360.com',
    role: 'SALES_REP',
  },
  {
    id: 'user_sales_manager',
    name: 'Sarah Jenkins',
    email: 'sarah.manager@dealflow360.com',
    role: 'SALES_MANAGER',
  },
  {
    id: 'user_finance',
    name: 'Frank Miller',
    email: 'frank.finance@dealflow360.com',
    role: 'FINANCE',
  },
  {
    id: 'user_customer_acme',
    name: 'John Vance (Acme Corp)',
    email: 'john.customer@acme.com',
    role: 'CUSTOMER',
    customerId: 'cust_acme',
  },
  {
    id: 'user_admin',
    name: 'Alexander Admin',
    email: 'admin@dealflow360.com',
    role: 'ADMIN',
  },
];

interface AuthContextType {
  currentUser: User;
  switchUser: (user: User) => void;
  demoUsers: User[];
  isCustomer: boolean;
  isManager: boolean;
  isFinance: boolean;
  isSalesRep: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User>(DEMO_USERS[0]); // default to Sales Rep

  useEffect(() => {
    const savedId = localStorage.getItem('dealflow_active_user_id');
    if (savedId) {
      const found = DEMO_USERS.find((u) => u.id === savedId);
      if (found) setCurrentUser(found);
    } else {
      localStorage.setItem('dealflow_active_user_id', DEMO_USERS[0].id);
    }
  }, []);

  const switchUser = (user: User) => {
    setCurrentUser(user);
    localStorage.setItem('dealflow_active_user_id', user.id);
  };

  const value: AuthContextType = {
    currentUser,
    switchUser,
    demoUsers: DEMO_USERS,
    isCustomer: currentUser.role === 'CUSTOMER',
    isManager: currentUser.role === 'SALES_MANAGER',
    isFinance: currentUser.role === 'FINANCE',
    isSalesRep: currentUser.role === 'SALES_REP',
    isAdmin: currentUser.role === 'ADMIN',
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
