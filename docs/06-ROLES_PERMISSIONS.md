# DealFlow360 - Roles & Permissions

## Roles
1. **ADMIN**: Full system control (Users, Master Data, Tiers, Products, Rules, System Configuration).
2. **SALES_REP**: Manages assigned customers, creates/edits quotations, submits for approval, participates in negotiations, tracks deals.
3. **SALES_MANAGER**: Views team deals, reviews approval requests, approves or rejects quotations, monitors pipeline risks.
4. **FINANCE**: Reviews high-discount/margin exceptions, issues/tracks invoices, records payments, handles subscriptions and credit notes.
5. **CUSTOMER**: Accesses Customer Self-Service Portal to review quotations, submit counter-offers, exchange negotiation messages, accept quotations, view fulfillment status, and track invoices.

All role authorization is enforced on Express backend routes via RBAC middleware (`role.guard.ts`).
