import {
  ApprovalAction,
  ApprovalRequest,
  AuditLog,
  Backorder,
  CreditNote,
  Customer,
  CustomerTier,
  DealHealthAlert,
  DiscountRule,
  FulfillmentAllocation,
  FulfillmentOrder,
  Invoice,
  Negotiation,
  Product,
  ProductCategory,
  Quotation,
  Subscription,
  UpsellRule,
  User,
  Warehouse,
  WarehouseStock,
} from '../types';
import {
  SEED_CATEGORIES,
  SEED_CUSTOMERS,
  SEED_CUSTOMER_TIERS,
  SEED_DISCOUNT_RULES,
  SEED_PRODUCTS,
  SEED_QUOTATIONS,
  SEED_UPSELL_RULES,
  SEED_USERS,
  SEED_WAREHOUSES,
  SEED_WAREHOUSE_STOCK,
} from '../seeds/seed-data';

export class InMemoryStore {
  public static users: User[] = [...SEED_USERS];
  public static customerTiers: CustomerTier[] = [...SEED_CUSTOMER_TIERS];
  public static customers: Customer[] = [...SEED_CUSTOMERS];
  public static categories: ProductCategory[] = [...SEED_CATEGORIES];
  public static products: Product[] = [...SEED_PRODUCTS];
  public static discountRules: DiscountRule[] = [...SEED_DISCOUNT_RULES];
  public static quotations: Quotation[] = [...SEED_QUOTATIONS];
  public static warehouses: Warehouse[] = [...SEED_WAREHOUSES];
  public static warehouseStock: WarehouseStock[] = [...SEED_WAREHOUSE_STOCK];
  public static upsellRules: UpsellRule[] = [...SEED_UPSELL_RULES];
  public static approvalRequests: ApprovalRequest[] = [];
  public static approvalActions: ApprovalAction[] = [];
  public static fulfillmentOrders: FulfillmentOrder[] = [];
  public static fulfillmentAllocations: FulfillmentAllocation[] = [];
  public static backorders: Backorder[] = [];
  public static invoices: Invoice[] = [];
  public static subscriptions: Subscription[] = [];
  public static creditNotes: CreditNote[] = [];
  public static negotiations: Negotiation[] = [];
  public static dealHealthAlerts: DealHealthAlert[] = [];
  public static auditLogs: AuditLog[] = [];

  public static reset() {
    this.users = [...SEED_USERS];
    this.customerTiers = [...SEED_CUSTOMER_TIERS];
    this.customers = [...SEED_CUSTOMERS];
    this.categories = [...SEED_CATEGORIES];
    this.products = [...SEED_PRODUCTS];
    this.discountRules = [...SEED_DISCOUNT_RULES];
    this.quotations = [...SEED_QUOTATIONS];
    this.warehouses = [...SEED_WAREHOUSES];
    this.warehouseStock = [...SEED_WAREHOUSE_STOCK];
    this.upsellRules = [...SEED_UPSELL_RULES];
    this.approvalRequests = [];
    this.approvalActions = [];
    this.fulfillmentOrders = [];
    this.fulfillmentAllocations = [];
    this.backorders = [];
    this.invoices = [];
    this.subscriptions = [];
    this.creditNotes = [];
    this.negotiations = [];
    this.dealHealthAlerts = [];
    this.auditLogs = [];
  }
}
