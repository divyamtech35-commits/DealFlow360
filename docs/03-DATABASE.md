# DealFlow360 - Database Schema Specification (Appwrite)

## Database ID: `dealflow360_db`

### 1. Identity
- **users**: `id`, `name`, `email`, `role` (ADMIN, SALES_REP, SALES_MANAGER, FINANCE, CUSTOMER), `customerId` (optional), `createdAt`, `updatedAt`

### 2. Master Data
- **customer_tiers**: `id`, `name` (Bronze, Silver, Gold, Enterprise), `baseDiscountLimitPct`, `priorityLevel`, `paymentTermsDays`
- **customers**: `id`, `name`, `tierId`, `salesRepId`, `contactEmail`, `contactPhone`, `address`, `creditLimit`, `creditStatus`, `riskProfile`
- **categories**: `id`, `name`, `description`, `maxCategoryDiscountPct`
- **products**: `id`, `sku`, `name`, `categoryId`, `basePrice`, `unitCost`, `isSubscription`, `subscriptionInterval`, `stockTrackable`, `status`
- **product_variants**: `id`, `productId`, `sku`, `name`, `additionalPrice`
- **price_lists**: `id`, `name`, `currency`, `isDefault`, `effectiveFrom`, `effectiveTo`
- **price_list_items**: `id`, `priceListId`, `productId`, `customPrice`
- **discount_rules**: `id`, `tierId`, `categoryId`, `maxDiscountPct`, `requiresManagerApproval`, `requiresFinanceApproval`

### 3. Sales & Quotations
- **quotations**: `id`, `quotationNumber`, `customerId`, `salesRepId`, `status` (DRAFT, PENDING_APPROVAL, APPROVED, REJECTED, UNDER_NEGOTIATION, CONFIRMED, CANCELLED), `subtotal`, `discountAmount`, `taxAmount`, `total`, `marginPct`, `riskScore`, `riskLevel` (LOW, MEDIUM, HIGH, CRITICAL), `validityDate`, `notes`, `createdAt`, `updatedAt`
- **quotation_lines**: `id`, `quotationId`, `productId`, `variantId`, `quantity`, `unitPrice`, `unitCost`, `discountPct`, `discountAmount`, `taxRate`, `taxAmount`, `lineTotal`, `lineMarginPct`

### 4. Risk & Approvals
- **risk_assessments**: `id`, `quotationId`, `riskScore`, `riskLevel`, `discountRisk`, `marginRisk`, `customerRisk`, `evaluationDetails` (JSON string), `assessedAt`
- **approval_requests**: `id`, `quotationId`, `requiredRole` (SALES_MANAGER, FINANCE), `status` (PENDING, APPROVED, REJECTED), `requestedAt`, `resolvedAt`, `reason`
- **approval_actions**: `id`, `approvalRequestId`, `quotationId`, `approverId`, `action` (APPROVE, REJECT), `comment`, `actedAt`

### 5. Inventory & Fulfillment
- **warehouses**: `id`, `code`, `name`, `location`, `priority`
- **warehouse_stock**: `id`, `warehouseId`, `productId`, `variantId`, `totalQuantity`, `reservedQuantity`, `allocatedQuantity`
- **fulfillment_orders**: `id`, `orderNumber`, `quotationId`, `customerId`, `status` (PENDING, ALLOCATED, PARTIALLY_ALLOCATED, SHIPPED, DELIVERED, CANCELLED), `createdAt`, `updatedAt`
- **fulfillment_allocations**: `id`, `fulfillmentOrderId`, `warehouseId`, `productId`, `allocatedQuantity`, `allocatedAt`
- **backorders**: `id`, `fulfillmentOrderId`, `productId`, `backorderQuantity`, `status` (PENDING, RESOLVED), `expectedDate`, `createdAt`

### 6. Subscriptions & Billing
- **subscription_plans**: `id`, `name`, `code`, `billingInterval` (MONTHLY, ANNUAL), `price`, `features`
- **subscriptions**: `id`, `customerId`, `quotationId`, `planId`, `status` (ACTIVE, PAUSED, CANCELLED, EXPIRED), `currentPeriodStart`, `currentPeriodEnd`, `billingInterval`, `amount`
- **subscription_items**: `id`, `subscriptionId`, `productId`, `quantity`, `unitPrice`
- **invoices**: `id`, `invoiceNumber`, `customerId`, `quotationId`, `subscriptionId`, `type` (ONE_TIME, RECURRING), `status` (DRAFT, ISSUED, PAID, OVERDUE, CANCELLED), `subtotal`, `taxAmount`, `total`, `amountPaid`, `balanceDue`, `dueDate`, `issuedAt`, `paidAt`
- **invoice_lines**: `id`, `invoiceId`, `description`, `quantity`, `unitPrice`, `lineTotal`
- **payments**: `id`, `invoiceId`, `amount`, `paymentMethod`, `referenceNumber`, `paidAt`, `status`
- **credit_notes**: `id`, `invoiceId`, `amount`, `reason`, `issuedAt`

### 7. Negotiation, Health & Audit
- **negotiations**: `id`, `quotationId`, `customerId`, `status` (OPEN, ACCEPTED, REJECTED, SUPERSEDED), `originalDiscountPct`, `requestedDiscountPct`, `counterDiscountPct`, `createdAt`, `updatedAt`
- **negotiation_messages**: `id`, `negotiationId`, `senderId`, `senderRole`, `message`, `timestamp`
- **upsell_rules**: `id`, `triggerProductId`, `recommendedProductId`, `ruleType` (UPSELL, CROSS_SELL, ADDON), `discountIncentivePct`
- **deal_health_alerts**: `id`, `quotationId`, `type` (STALLED_DEAL, EXCESSIVE_DISCOUNT, FULFILLMENT_RISK, MARGIN_EROSION), `severity` (LOW, MEDIUM, HIGH, CRITICAL), `message`, `thresholdValue`, `currentValue`, `status` (ACTIVE, RESOLVED), `createdAt`
- **audit_logs**: `id`, `actorId`, `actorRole`, `entityType`, `entityId`, `action`, `oldValues` (JSON string), `newValues` (JSON string), `timestamp`, `comment`
