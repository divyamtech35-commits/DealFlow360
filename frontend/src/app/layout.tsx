import './globals.css';
import type { Metadata } from 'next';
import { AuthProvider } from '../context/AuthContext';
import { Sidebar } from '../components/Sidebar';
import { Header } from '../components/Header';

export const metadata: Metadata = {
  title: 'DealFlow360 - Enterprise B2B Sales & Deal Lifecycle Platform',
  description:
    'Manage the complete deal lifecycle: Customer -> Quotation -> Pricing -> Discount -> Risk -> Approval -> Negotiation -> Fulfillment -> Billing.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased font-sans text-slate-900 bg-slate-50 flex h-screen overflow-hidden">
        <AuthProvider>
          <Sidebar />
          <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
            <Header />
            <main className="flex-1 overflow-y-auto p-8">{children}</main>
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
