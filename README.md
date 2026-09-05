# DealFlow360 - Enterprise B2B Sales & Deal Lifecycle Platform

DealFlow360 is a full-stack, enterprise-grade B2B sales and deal governance platform that manages the complete deal lifecycle:
**Customer → Quotation → Pricing → Discount Governance → Risk Evaluation → Approval → Negotiation → Re-evaluation → Confirmation → Fulfillment (Stock/Backorder) → Billing (Invoice/Payment) → Subscriptions & Deal Health**.

Built with:
- **Frontend**: Next.js 14 (App Router), React, TypeScript, Tailwind CSS, Lucide Icons, shadcn UI design patterns
- **Backend**: Node.js, Express.js, TypeScript, REST API, Zod Validation
- **Infrastructure**: Appwrite (Database, Auth, SDK integration with automated bootstrap & seamless mock store fallback for zero-friction demo execution)

---

## Quick Start Guide

### 1. Install & Build
Both backend and frontend can be built and tested from the project root:
```bash
# Install root dependencies
npm install

# Run backend unit tests (All 8 domain engines)
npm test

# Build both applications
npm run build
```

### 2. Start Development Servers
Run both backend (`http://localhost:5000`) and frontend (`http://localhost:3000`) concurrently:
```bash
npm run dev
```

Or run them individually:
```bash
# Terminal 1: Express Backend
cd backend && npm run dev

# Terminal 2: Next.js Frontend
cd frontend && npm run dev
```

---

## 5 Demo Roles & Instant Switcher

The application includes a 1-click **Demo Role Switcher** in the top navigation header to test end-to-end multi-role workflows without manual relogging:

| Role | Name | Email | Permissions & Focus |
|---|---|---|---|
| **SALES_REP** | Alex Rivera | `alex.sales@dealflow360.com` | Build quotations, apply discounts, view risk & recommendations |
| **SALES_MANAGER** | Sarah Jenkins | `sarah.manager@dealflow360.com` | Review approval queue, sign-off on discount exceptions |
| **CUSTOMER** | John Vance (Acme) | `john.customer@acme.com` | Self-Service portal, counter-offer negotiations, confirm deals |
| **FINANCE** | Frank Miller | `frank.finance@dealflow360.com` | Review critical risk, process invoices, record payments |
| **ADMIN** | Alexander Admin | `admin@dealflow360.com` | System configuration, master data, tier policies |

---

## Golden Hackathon Demonstration Journey

Follow this sequence for the primary end-to-end demo:

1. **Sales Workspace**:
   - As **Sales Rep**, navigate to `/sales`.
   - Select **Acme Corporation** (Gold Tier, 15% discount limit).
   - Add **Laptop Pro 16" Enterprise** (Qty: 10) and **Enterprise Support**.
   - Notice the **Recommendation Engine** automatically suggesting **3-Year Complete Care Warranty**. Click **Add**.
   - Apply a **20% discount** (exceeding Gold Tier's 15% limit).
   - The **Risk Engine** flags **HIGH Risk** and the **Discount Engine** displays: *"Requested discount exceeds tier limit by 5%; requires Sales Manager sign-off"*.
   - Click **Submit Quotation**. Quotation status advances to `PENDING_APPROVAL`.

2. **Approval Workflow**:
   - In the top header role switcher, click **Manager**.
   - Navigate to **Approvals** (`/approvals`).
   - The newly submitted quotation appears in the queue with risk score, reason, and requested discount.
   - Click **Approve**, enter comment *"Approved for strategic Q4 closing"*, and confirm. Status transitions to `APPROVED`.

3. **Customer Portal & Negotiation**:
   - In the top header role switcher, click **Customer**.
   - Navigate to **Customer Portal** (`/portal`).
   - View the approved quotation. Click **Counter Offer / Negotiate**.
   - Request a revised discount of **22%** with message *"We can sign today if discount is 22%"*.
   - **Crucial Engine Re-evaluation**: DealFlow360 recalculates pricing, discount compliance, and re-triggers approval requirements without skipping domain rules!

4. **Deal Confirmation**:
   - As Customer, click **Accept & Confirm**.
   - Deal status transitions to `CONFIRMED`.

5. **Multi-Warehouse Fulfillment & Backorder**:
   - Switch role to **Finance** or **Sales Rep** and navigate to **Fulfillment & Stock** (`/fulfillment`).
   - View the auto-created Fulfillment Order:
     - **Main Distribution Center**: 8 units allocated.
     - **East Coast Logistics Hub**: 2 units allocated.
     - If quantity exceeds total available stock across both warehouses, an automated **Backorder** record is generated!
   - Click **Ship Dispatch** $\to$ status advances to `SHIPPED`.

6. **Billing, Invoicing & Payment**:
   - Navigate to **Billing & Invoices** (`/billing`).
   - The auto-generated invoice for the confirmed quotation is listed with balance due.
   - Click **Record Payment**, enter payment amount and wire reference.
   - Balance due reconciles to `$0` and invoice status advances to `PAID`.

7. **Deal Health & Executive Reports**:
   - Visit **Deal Health** (`/deal-health`) to observe proactive anomaly alerts.
   - Visit **Reports & KPIs** (`/reports`) to inspect sales conversion win rate and revenue analytics.

---

## Appwrite Integration

The backend is pre-configured with the official Appwrite SDK (`node-appwrite`):
- To connect to a live Appwrite instance, update `backend/.env` with your `APPWRITE_ENDPOINT`, `APPWRITE_PROJECT_ID`, and `APPWRITE_API_KEY`.
- Run `npx ts-node-dev src/scripts/bootstrap-appwrite.ts` to automatically provision all 25+ database collections and attributes.
- When run without an external key, DealFlow360 runs seamlessly in offline-ready in-memory mode, ensuring zero crashes or setup friction.
