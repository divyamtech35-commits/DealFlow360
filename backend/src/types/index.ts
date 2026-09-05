export type UserRole = 'ADMIN' | 'SALES_REP' | 'SALES_MANAGER' | 'FINANCE' | 'CUSTOMER';

export interface User {
  id: string;
  name: string;
  email: string;
  passwordHash?: string;
  role: UserRole;
  customerId?: string;
  createdAt: string;
  updatedAt: string;
}

export type CustomerTierName = 'Bronze' | 'Silver' | 'Gold' | 'Enterprise';

export interface CustomerTier {
  id: string;
  name: CustomerTierName;
  baseDiscountLimitPct: number;
  priorityLevel: number;
  paymentTermsDays: number;
}

export interface Customer {
  id: string;
  name: string;
  tierId: string;
  salesRepId: string;
  contactEmail: string;
  contactPhone: string;
  address: string;
  creditLimit: number;
  creditStatus: 'GOOD' | 'WARNING' | 'BLOCKED';
  riskProfile: 'LOW' | 'MEDIUM' | 'HIGH';
  createdAt: string;
  updatedAt: string;
}

export interface ProductCategory {
  id: string;
  name: string;
  description: string;
  maxCategoryDiscountPct: number;
}

export interface Product {
  id: string;
  sku: string;
  name: string;
  categoryId: string;
  basePrice: number;
  unitCost: number;
  isSubscription: boolean;
  subscriptionInterval?: 'MONTHLY' | 'ANNUAL';
  stockTrackable: boolean;
  status: 'ACTIVE' | 'ARCHIVED';
  description?: string;
}

export interface ProductVariant {
  id: string;
  productId: string;
  sku: string;
  name: string;
  additionalPrice: number;
}

export interface DiscountRule {
  id: string;
  tierId?: string;
  categoryId?: string;
  maxDiscountPct: number;
  requiresManagerApproval: boolean;
  requiresFinanceApproval: boolean;
}

export type QuotationStatus =
  | 'DRAFT'
  | 'PENDING_APPROVAL'
  | 'APPROVED'
  | 'REJECTED'
  | 'UNDER_NEGOTIATION'
  | 'CONFIRMED'
  | 'CANCELLED';

export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface QuotationLine {
  id: string;
  quotationId: string;
  productId: string;
  productName?: string;
  variantId?: string;
  quantity: number;
  unitPrice: number;
  unitCost: number;
  discountPct: number;
  discountAmount: number;
  taxRate: number;
  taxAmount: number;
  lineTotal: number;
  lineMarginPct: number;
}

export interface Quotation {
  id: string;
  quotationNumber: string;
  customerId: string;
  customerName?: string;
  salesRepId: string;
  salesRepName?: string;
  status: QuotationStatus;
  lines: QuotationLine[];
  subtotal: number;
  discountAmount: number;
  taxAmount: number;
  total: number;
  totalCost: number;
  marginPct: number;
  riskScore: number;
  riskLevel: RiskLevel;
  approvalRequired: boolean;
  approvalRoleRequired?: 'SALES_MANAGER' | 'FINANCE';
  approvalStatus?: 'NOT_REQUIRED' | 'PENDING' | 'APPROVED' | 'REJECTED';
  validityDate: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface RiskAssessment {
  id: string;
  quotationId: string;
  riskScore: number;
  riskLevel: RiskLevel;
  discountRisk: number;
  marginRisk: number;
  customerRisk: number;
  evaluationDetails: string; // JSON string
  assessedAt: string;
}

export interface ApprovalRequest {
  id: string;
  quotationId: string;
  quotationNumber?: string;
  customerName?: string;
  totalAmount?: number;
  discountPct?: number;
  riskLevel?: RiskLevel;
  riskScore?: number;
  requiredRole: 'SALES_MANAGER' | 'FINANCE';
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  requestedAt: string;
  resolvedAt?: string;
  reason: string;
}

export interface ApprovalAction {
  id: string;
  approvalRequestId: string;
  quotationId: string;
  approverId: string;
  approverName?: string;
  action: 'APPROVE' | 'REJECT';
  comment: string;
  actedAt: string;
}

export interface Warehouse {
  id: string;
  code: string;
  name: string;
  location: string;
  priority: number;
}

export interface WarehouseStock {
  id: string;
  warehouseId: string;
  productId: string;
  variantId?: string;
  totalQuantity: number;
  reservedQuantity: number;
  availableQuantity: number;
}

export type FulfillmentStatus =
  | 'PENDING'
  | 'ALLOCATED'
  | 'PARTIALLY_ALLOCATED'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'CANCELLED';

export interface FulfillmentOrder {
  id: string;
  orderNumber: string;
  quotationId: string;
  customerId: string;
  customerName?: string;
  status: FulfillmentStatus;
  allocations: FulfillmentAllocation[];
  backorders: Backorder[];
  createdAt: string;
  updatedAt: string;
}

export interface FulfillmentAllocation {
  id: string;
  fulfillmentOrderId: string;
  warehouseId: string;
  warehouseName?: string;
  productId: string;
  productName?: string;
  allocatedQuantity: number;
  allocatedAt: string;
}

export interface Backorder {
  id: string;
  fulfillmentOrderId: string;
  productId: string;
  productName?: string;
  backorderQuantity: number;
  status: 'PENDING' | 'RESOLVED';
  expectedDate: string;
  createdAt: string;
}

export type InvoiceStatus = 'DRAFT' | 'ISSUED' | 'PAID' | 'OVERDUE' | 'CANCELLED';

export interface InvoiceLine {
  id: string;
  invoiceId: string;
  description: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  customerId: string;
  customerName?: string;
  quotationId?: string;
  subscriptionId?: string;
  type: 'ONE_TIME' | 'RECURRING';
  status: InvoiceStatus;
  lines: InvoiceLine[];
  subtotal: number;
  taxAmount: number;
  total: number;
  amountPaid: number;
  balanceDue: number;
  dueDate: string;
  issuedAt: string;
  paidAt?: string;
}

export interface Payment {
  id: string;
  invoiceId: string;
  amount: number;
  paymentMethod: 'CREDIT_CARD' | 'WIRE_TRANSFER' | 'ACH' | 'CHECK';
  referenceNumber: string;
  paidAt: string;
  status: 'SUCCESS' | 'FAILED';
}

export interface CreditNote {
  id: string;
  invoiceId: string;
  amount: number;
  reason: string;
  issuedAt: string;
}

export type SubscriptionStatus = 'ACTIVE' | 'PAUSED' | 'CANCELLED' | 'EXPIRED';

export interface Subscription {
  id: string;
  customerId: string;
  customerName?: string;
  quotationId?: string;
  productName: string;
  status: SubscriptionStatus;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  billingInterval: 'MONTHLY' | 'ANNUAL';
  amount: number;
  createdAt: string;
}

export interface NegotiationMessage {
  id: string;
  negotiationId: string;
  senderId: string;
  senderName: string;
  senderRole: UserRole;
  message: string;
  timestamp: string;
}

export interface Negotiation {
  id: string;
  quotationId: string;
  quotationNumber?: string;
  customerId: string;
  customerName?: string;
  status: 'OPEN' | 'ACCEPTED' | 'REJECTED' | 'SUPERSEDED';
  originalDiscountPct: number;
  requestedDiscountPct: number;
  counterDiscountPct?: number;
  messages: NegotiationMessage[];
  createdAt: string;
  updatedAt: string;
}

export interface UpsellRule {
  id: string;
  triggerProductId: string;
  recommendedProductId: string;
  ruleType: 'UPSELL' | 'CROSS_SELL' | 'ADDON';
  discountIncentivePct: number;
  reason: string;
}

export type DealHealthAlertType =
  | 'STALLED_DEAL'
  | 'EXCESSIVE_DISCOUNT'
  | 'FULFILLMENT_RISK'
  | 'MARGIN_EROSION';

export interface DealHealthAlert {
  id: string;
  quotationId: string;
  quotationNumber?: string;
  customerName?: string;
  type: DealHealthAlertType;
  severity: RiskLevel;
  message: string;
  thresholdValue?: number;
  currentValue?: number;
  status: 'ACTIVE' | 'RESOLVED';
  createdAt: string;
}

export interface AuditLog {
  id: string;
  actorId: string;
  actorName: string;
  actorRole: UserRole;
  entityType: string;
  entityId: string;
  action: string;
  oldValues?: Record<string, unknown>;
  newValues?: Record<string, unknown>;
  timestamp: string;
  comment?: string;
}
