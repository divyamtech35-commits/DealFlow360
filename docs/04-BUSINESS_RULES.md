# DealFlow360 - Business Rules & Engine Specifications

## 1. Pricing Engine
- `LineSubtotal = UnitPrice * Quantity`
- `LineDiscountAmount = LineSubtotal * (DiscountPct / 100)`
- `LineTaxAmount = (LineSubtotal - LineDiscountAmount) * (TaxRate / 100)`
- `LineTotal = (LineSubtotal - LineDiscountAmount) + LineTaxAmount`
- `QuotationSubtotal = Sum(LineSubtotal)`
- `QuotationTotal = Sum(LineTotal)`
- `QuotationMargin = ((QuotationTotalExTax - QuotationTotalCost) / QuotationTotalExTax) * 100`

## 2. Discount Governance Engine
- **Bronze Tier**: Max discount 5%
- **Silver Tier**: Max discount 10%
- **Gold Tier**: Max discount 15%
- **Enterprise Tier**: Max discount 25%
- If requested discount <= Tier max: `ALLOWED`
- If requested discount > Tier max and <= Tier max + 10%: `REQUIRES_SALES_MANAGER_APPROVAL`
- If requested discount > Tier max + 10% or margin < 20%: `REQUIRES_FINANCE_APPROVAL`

## 3. Risk Engine
- Risk Score from 0 to 100:
  - Base risk: 10
  - Excess discount penalty: `(RequestedDiscount - MaxAllowedDiscount) * 4` (if positive)
  - Low margin penalty: If margin < 30%, penalty `(30 - margin) * 2`
  - Customer risk factor: Low (0), Medium (+15), High (+30)
- Risk Levels:
  - `0 - 25`: LOW
  - `26 - 50`: MEDIUM
  - `51 - 75`: HIGH
  - `76 - 100`: CRITICAL

## 4. Approval Engine
- Determines whether approval is mandatory before quotation confirmation.
- Any quotation with `riskLevel` in [`HIGH`, `CRITICAL`] or discount violation requires approval.
- Quotation transitions to `PENDING_APPROVAL`.
- Approver actions: `APPROVE` (advances to `APPROVED`) or `REJECT` (transitions to `REJECTED`).
- Any material commercial modification (line item changes, discount revisions) resets approval status.

## 5. Fulfillment & Warehouse Engine
- Available stock: `Available = TotalQuantity - ReservedQuantity`
- Warehouses ordered by priority (`Main Warehouse` priority 1, `East Warehouse` priority 2).
- Allocation logic:
  - Fulfill from Primary Warehouse first.
  - If shortfall, check Secondary Warehouse.
  - If combined stock < required quantity: allocate what is available and generate a `Backorder` record for the shortfall.
  - Order status set to `ALLOCATED` or `PARTIALLY_ALLOCATED`.

## 6. Billing Engine
- Confirmed quotation generates Invoice with status `ISSUED`.
- Payment recording:
  - Deducts from `BalanceDue`.
  - Once `AmountPaid >= Total`, status changes to `PAID`.
- Subscriptions:
  - Monthly or annual recurring billing interval.
  - Statuses: `ACTIVE`, `PAUSED`, `CANCELLED`, `EXPIRED`.
