# DealFlow360 - API Contract

Prefix: `/api/v1`

## Envelopes
Success:
```json
{
  "success": true,
  "data": {},
  "message": "Operation successful"
}
```
Error:
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable message"
  }
}
```

## Endpoints
- **Auth**: `POST /auth/login`, `POST /auth/logout`, `GET /auth/me`
- **Customers**: `GET /customers`, `GET /customers/:id`, `POST /customers`, `PATCH /customers/:id`, `DELETE /customers/:id`
- **Customer Tiers**: `GET /customers/tiers`
- **Products**: `GET /products`, `GET /products/:id`, `POST /products`, `PATCH /products/:id`
- **Quotations**:
  - `GET /quotations`, `GET /quotations/:id`, `POST /quotations`, `PATCH /quotations/:id`, `DELETE /quotations/:id`
  - `POST /quotations/:id/calculate` (calculates pricing, discount compliance, and risk preview)
  - `POST /quotations/:id/submit` (submits for approval or advances status)
  - `POST /quotations/:id/confirm` (finalizes deal, triggers fulfillment and invoicing)
  - `POST /quotations/:id/cancel`
- **Approvals**:
  - `GET /approvals`, `GET /approvals/:id`
  - `POST /approvals/:id/approve`
  - `POST /approvals/:id/reject`
- **Fulfillment**:
  - `GET /fulfillment`, `GET /fulfillment/:id`
  - `POST /fulfillment/:id/allocate`
  - `POST /fulfillment/:id/ship`
  - `POST /fulfillment/:id/complete`
- **Invoices & Billing**:
  - `GET /invoices`, `GET /invoices/:id`, `POST /invoices`
  - `POST /invoices/:id/pay`
  - `GET /invoices/:id/credit-notes`
- **Subscriptions**:
  - `GET /subscriptions`, `GET /subscriptions/:id`, `POST /subscriptions`
  - `POST /subscriptions/:id/pause`, `POST /subscriptions/:id/resume`, `POST /subscriptions/:id/cancel`
- **Negotiations**:
  - `GET /negotiations`, `GET /negotiations/:id`, `POST /negotiations`
  - `POST /negotiations/:id/messages`
  - `POST /negotiations/:id/counter`
  - `POST /negotiations/:id/accept`
  - `POST /negotiations/:id/reject`
- **Recommendations**: `GET /quotations/:id/recommendations`
- **Deal Health**: `GET /deal-health`, `GET /quotations/:id/deal-health`
- **Reports**: `GET /reports/sales`, `GET /reports/revenue`, `GET /reports/fulfillment`, `GET /reports/billing`
- **Audit Logs**: `GET /audit-logs`
