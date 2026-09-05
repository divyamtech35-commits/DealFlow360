export type UserRole = 'ADMIN' | 'SALES_REP' | 'SALES_MANAGER' | 'FINANCE' | 'CUSTOMER';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  customerId?: string;
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
  productName: string;
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
  customerName: string;
  salesRepId: string;
  salesRepName: string;
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
  reason: string;
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
  totalQuantity: number;
  reservedQuantity: number;
  availableQuantity: number;
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

export interface FulfillmentOrder {
  id: string;
  orderNumber: string;
  quotationId: string;
  customerId: string;
  customerName?: string;
  status: 'PENDING' | 'ALLOCATED' | 'PARTIALLY_ALLOCATED' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
  allocations: FulfillmentAllocation[];
  backorders: Backorder[];
  createdAt: string;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  customerId: string;
  customerName?: string;
  quotationId?: string;
  type: 'ONE_TIME' | 'RECURRING';
  status: 'DRAFT' | 'ISSUED' | 'PAID' | 'OVERDUE' | 'CANCELLED';
  subtotal: number;
  taxAmount: number;
  total: number;
  amountPaid: number;
  balanceDue: number;
  dueDate: string;
  issuedAt: string;
  paidAt?: string;
}

export interface Subscription {
  id: string;
  customerId: string;
  customerName?: string;
  quotationId?: string;
  productName: string;
  status: 'ACTIVE' | 'PAUSED' | 'CANCELLED' | 'EXPIRED';
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

export interface RecommendationItem {
  recommendedProduct: Product;
  triggerProductName: string;
  ruleType: 'UPSELL' | 'CROSS_SELL' | 'ADDON';
  discountIncentivePct: number;
  reason: string;
}

export interface DealHealthAlert {
  id: string;
  quotationId: string;
  quotationNumber?: string;
  customerName?: string;
  type: 'STALLED_DEAL' | 'EXCESSIVE_DISCOUNT' | 'FULFILLMENT_RISK' | 'MARGIN_EROSION';
  severity: RiskLevel;
  message: string;
  thresholdValue?: number;
  currentValue?: number;
  status: 'ACTIVE' | 'RESOLVED';
  createdAt: string;
}
