import { Client, Databases, IndexType, Permission, Role } from 'node-appwrite';
import { config } from '../config';

/**
 * Attribute definition for Appwrite schema bootstrapping
 */
export interface AttributeDefinition {
  key: string;
  type: 'string' | 'integer' | 'float' | 'boolean' | 'email' | 'enum' | 'datetime';
  size?: number;
  elements?: string[];
  required: boolean;
  default?: any;
  array?: boolean;
}

/**
 * Index definition for Appwrite schema bootstrapping
 */
export interface IndexDefinition {
  key: string;
  type: IndexType;
  attributes: string[];
  orders?: string[];
}

/**
 * Collection schema configuration
 */
export interface CollectionSchema {
  collectionId: string;
  name: string;
  permissions: string[];
  attributes: AttributeDefinition[];
  indexes: IndexDefinition[];
}

// Standardized permission tiers aligned with docs/06-ROLES_PERMISSIONS.md
const PERMISSION_PRESETS = {
  // Master Catalog: Read by authenticated users; modifications restricted to Admin
  MASTER_DATA: [
    Permission.read(Role.users()),
    Permission.create(Role.team('admin')),
    Permission.update(Role.team('admin')),
    Permission.delete(Role.team('admin')),
  ],
  // Commercial & Sales: Read/Write by authenticated users (Sales/Customer); deletion restricted to Admin
  OPERATIONAL: [
    Permission.read(Role.users()),
    Permission.create(Role.users()),
    Permission.update(Role.users()),
    Permission.delete(Role.team('admin')),
  ],
  // Governance & Approvals: Read for authenticated users; modifications by Admin / Approvers
  GOVERNED: [
    Permission.read(Role.users()),
    Permission.create(Role.users()),
    Permission.update(Role.team('admin')),
    Permission.delete(Role.team('admin')),
  ],
  // Immutable Audit Trail: Read & Append only; no update or deletion permitted
  IMMUTABLE_AUDIT: [
    Permission.read(Role.users()),
    Permission.create(Role.users()),
  ],
};

/**
 * Complete schema definitions for all 31 collections based on DATABASE.md and application types
 */
export const SCHEMA_DEFINITIONS: CollectionSchema[] = [
  // 1. users
  {
    collectionId: config.appwrite.collections.users,
    name: 'Users',
    permissions: PERMISSION_PRESETS.GOVERNED,
    attributes: [
      { key: 'name', type: 'string', size: 128, required: true },
      { key: 'email', type: 'email', required: true },
      { key: 'passwordHash', type: 'string', size: 255, required: false },
      { key: 'role', type: 'enum', elements: ['ADMIN', 'SALES_REP', 'SALES_MANAGER', 'FINANCE', 'CUSTOMER'], required: true },
      { key: 'customerId', type: 'string', size: 64, required: false },
      { key: 'createdAt', type: 'string', size: 64, required: false },
      { key: 'updatedAt', type: 'string', size: 64, required: false },
    ],
    indexes: [
      { key: 'idx_users_email', type: IndexType.Unique, attributes: ['email'] },
      { key: 'idx_users_role', type: IndexType.Key, attributes: ['role'] },
      { key: 'idx_users_customerId', type: IndexType.Key, attributes: ['customerId'] },
    ],
  },

  // 2. customer_tiers
  {
    collectionId: config.appwrite.collections.customerTiers,
    name: 'Customer Tiers',
    permissions: PERMISSION_PRESETS.MASTER_DATA,
    attributes: [
      { key: 'name', type: 'enum', elements: ['Bronze', 'Silver', 'Gold', 'Enterprise'], required: true },
      { key: 'baseDiscountLimitPct', type: 'float', required: true },
      { key: 'priorityLevel', type: 'integer', required: true },
      { key: 'paymentTermsDays', type: 'integer', required: true },
    ],
    indexes: [
      { key: 'idx_tiers_name', type: IndexType.Unique, attributes: ['name'] },
      { key: 'idx_tiers_priority', type: IndexType.Key, attributes: ['priorityLevel'] },
    ],
  },

  // 3. customers
  {
    collectionId: config.appwrite.collections.customers,
    name: 'Customers',
    permissions: PERMISSION_PRESETS.OPERATIONAL,
    attributes: [
      { key: 'name', type: 'string', size: 255, required: true },
      { key: 'tierId', type: 'string', size: 64, required: true },
      { key: 'salesRepId', type: 'string', size: 64, required: true },
      { key: 'contactEmail', type: 'email', required: true },
      { key: 'contactPhone', type: 'string', size: 32, required: true },
      { key: 'address', type: 'string', size: 500, required: true },
      { key: 'creditLimit', type: 'float', required: true },
      { key: 'creditStatus', type: 'enum', elements: ['GOOD', 'WARNING', 'BLOCKED'], required: true },
      { key: 'riskProfile', type: 'enum', elements: ['LOW', 'MEDIUM', 'HIGH'], required: true },
      { key: 'createdAt', type: 'string', size: 64, required: false },
      { key: 'updatedAt', type: 'string', size: 64, required: false },
    ],
    indexes: [
      { key: 'idx_customers_tierId', type: IndexType.Key, attributes: ['tierId'] },
      { key: 'idx_customers_salesRepId', type: IndexType.Key, attributes: ['salesRepId'] },
      { key: 'idx_customers_creditStatus', type: IndexType.Key, attributes: ['creditStatus'] },
    ],
  },

  // 4. categories
  {
    collectionId: config.appwrite.collections.categories,
    name: 'Product Categories',
    permissions: PERMISSION_PRESETS.MASTER_DATA,
    attributes: [
      { key: 'name', type: 'string', size: 128, required: true },
      { key: 'description', type: 'string', size: 1000, required: false },
      { key: 'maxCategoryDiscountPct', type: 'float', required: true },
    ],
    indexes: [
      { key: 'idx_categories_name', type: IndexType.Unique, attributes: ['name'] },
    ],
  },

  // 5. products
  {
    collectionId: config.appwrite.collections.products,
    name: 'Products',
    permissions: PERMISSION_PRESETS.MASTER_DATA,
    attributes: [
      { key: 'sku', type: 'string', size: 64, required: true },
      { key: 'name', type: 'string', size: 255, required: true },
      { key: 'categoryId', type: 'string', size: 64, required: true },
      { key: 'basePrice', type: 'float', required: true },
      { key: 'unitCost', type: 'float', required: true },
      { key: 'isSubscription', type: 'boolean', required: true },
      { key: 'subscriptionInterval', type: 'enum', elements: ['MONTHLY', 'ANNUAL'], required: false },
      { key: 'stockTrackable', type: 'boolean', required: true },
      { key: 'status', type: 'enum', elements: ['ACTIVE', 'ARCHIVED'], required: true },
      { key: 'description', type: 'string', size: 2000, required: false },
    ],
    indexes: [
      { key: 'idx_products_sku', type: IndexType.Unique, attributes: ['sku'] },
      { key: 'idx_products_category', type: IndexType.Key, attributes: ['categoryId'] },
      { key: 'idx_products_status', type: IndexType.Key, attributes: ['status'] },
    ],
  },

  // 6. product_variants
  {
    collectionId: config.appwrite.collections.productVariants,
    name: 'Product Variants',
    permissions: PERMISSION_PRESETS.MASTER_DATA,
    attributes: [
      { key: 'productId', type: 'string', size: 64, required: true },
      { key: 'sku', type: 'string', size: 64, required: true },
      { key: 'name', type: 'string', size: 255, required: true },
      { key: 'additionalPrice', type: 'float', required: true },
    ],
    indexes: [
      { key: 'idx_variants_productId', type: IndexType.Key, attributes: ['productId'] },
      { key: 'idx_variants_sku', type: IndexType.Unique, attributes: ['sku'] },
    ],
  },

  // 7. price_lists
  {
    collectionId: config.appwrite.collections.priceLists,
    name: 'Price Lists',
    permissions: PERMISSION_PRESETS.MASTER_DATA,
    attributes: [
      { key: 'name', type: 'string', size: 128, required: true },
      { key: 'currency', type: 'string', size: 10, required: true },
      { key: 'isDefault', type: 'boolean', required: true },
      { key: 'effectiveFrom', type: 'string', size: 64, required: false },
      { key: 'effectiveTo', type: 'string', size: 64, required: false },
    ],
    indexes: [
      { key: 'idx_price_lists_isDefault', type: IndexType.Key, attributes: ['isDefault'] },
    ],
  },

  // 8. price_list_items
  {
    collectionId: config.appwrite.collections.priceListItems,
    name: 'Price List Items',
    permissions: PERMISSION_PRESETS.MASTER_DATA,
    attributes: [
      { key: 'priceListId', type: 'string', size: 64, required: true },
      { key: 'productId', type: 'string', size: 64, required: true },
      { key: 'customPrice', type: 'float', required: true },
    ],
    indexes: [
      { key: 'idx_pli_priceListId', type: IndexType.Key, attributes: ['priceListId'] },
      { key: 'idx_pli_productId', type: IndexType.Key, attributes: ['productId'] },
    ],
  },

  // 9. discount_rules
  {
    collectionId: config.appwrite.collections.discountRules,
    name: 'Discount Rules',
    permissions: PERMISSION_PRESETS.MASTER_DATA,
    attributes: [
      { key: 'tierId', type: 'string', size: 64, required: false },
      { key: 'categoryId', type: 'string', size: 64, required: false },
      { key: 'maxDiscountPct', type: 'float', required: true },
      { key: 'requiresManagerApproval', type: 'boolean', required: true },
      { key: 'requiresFinanceApproval', type: 'boolean', required: true },
    ],
    indexes: [
      { key: 'idx_disc_tierId', type: IndexType.Key, attributes: ['tierId'] },
      { key: 'idx_disc_categoryId', type: IndexType.Key, attributes: ['categoryId'] },
    ],
  },

  // 10. quotations
  {
    collectionId: config.appwrite.collections.quotations,
    name: 'Quotations',
    permissions: PERMISSION_PRESETS.OPERATIONAL,
    attributes: [
      { key: 'quotationNumber', type: 'string', size: 64, required: true },
      { key: 'customerId', type: 'string', size: 64, required: true },
      { key: 'customerName', type: 'string', size: 255, required: false },
      { key: 'salesRepId', type: 'string', size: 64, required: true },
      { key: 'salesRepName', type: 'string', size: 255, required: false },
      { key: 'status', type: 'enum', elements: ['DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'REJECTED', 'UNDER_NEGOTIATION', 'CONFIRMED', 'CANCELLED'], required: true },
      { key: 'subtotal', type: 'float', required: true },
      { key: 'discountAmount', type: 'float', required: true },
      { key: 'taxAmount', type: 'float', required: true },
      { key: 'total', type: 'float', required: true },
      { key: 'totalCost', type: 'float', required: true },
      { key: 'marginPct', type: 'float', required: true },
      { key: 'riskScore', type: 'integer', required: true },
      { key: 'riskLevel', type: 'enum', elements: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'], required: true },
      { key: 'approvalRequired', type: 'boolean', required: true },
      { key: 'approvalRoleRequired', type: 'enum', elements: ['SALES_MANAGER', 'FINANCE'], required: false },
      { key: 'approvalStatus', type: 'enum', elements: ['NOT_REQUIRED', 'PENDING', 'APPROVED', 'REJECTED'], required: false },
      { key: 'validityDate', type: 'string', size: 64, required: true },
      { key: 'notes', type: 'string', size: 2000, required: false },
      { key: 'createdAt', type: 'string', size: 64, required: false },
      { key: 'updatedAt', type: 'string', size: 64, required: false },
    ],
    indexes: [
      { key: 'idx_quot_number', type: IndexType.Unique, attributes: ['quotationNumber'] },
      { key: 'idx_quot_customerId', type: IndexType.Key, attributes: ['customerId'] },
      { key: 'idx_quot_salesRepId', type: IndexType.Key, attributes: ['salesRepId'] },
      { key: 'idx_quot_status', type: IndexType.Key, attributes: ['status'] },
      { key: 'idx_quot_riskLevel', type: IndexType.Key, attributes: ['riskLevel'] },
    ],
  },

  // 11. quotation_lines
  {
    collectionId: config.appwrite.collections.quotationLines,
    name: 'Quotation Lines',
    permissions: PERMISSION_PRESETS.OPERATIONAL,
    attributes: [
      { key: 'quotationId', type: 'string', size: 64, required: true },
      { key: 'productId', type: 'string', size: 64, required: true },
      { key: 'productName', type: 'string', size: 255, required: false },
      { key: 'variantId', type: 'string', size: 64, required: false },
      { key: 'quantity', type: 'integer', required: true },
      { key: 'unitPrice', type: 'float', required: true },
      { key: 'unitCost', type: 'float', required: true },
      { key: 'discountPct', type: 'float', required: true },
      { key: 'discountAmount', type: 'float', required: true },
      { key: 'taxRate', type: 'float', required: true },
      { key: 'taxAmount', type: 'float', required: true },
      { key: 'lineTotal', type: 'float', required: true },
      { key: 'lineMarginPct', type: 'float', required: true },
    ],
    indexes: [
      { key: 'idx_ql_quotationId', type: IndexType.Key, attributes: ['quotationId'] },
      { key: 'idx_ql_productId', type: IndexType.Key, attributes: ['productId'] },
    ],
  },

  // 12. risk_assessments
  {
    collectionId: config.appwrite.collections.riskAssessments,
    name: 'Risk Assessments',
    permissions: PERMISSION_PRESETS.GOVERNED,
    attributes: [
      { key: 'quotationId', type: 'string', size: 64, required: true },
      { key: 'riskScore', type: 'integer', required: true },
      { key: 'riskLevel', type: 'enum', elements: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'], required: true },
      { key: 'discountRisk', type: 'integer', required: true },
      { key: 'marginRisk', type: 'integer', required: true },
      { key: 'customerRisk', type: 'integer', required: true },
      { key: 'evaluationDetails', type: 'string', size: 5000, required: false },
      { key: 'assessedAt', type: 'string', size: 64, required: true },
    ],
    indexes: [
      { key: 'idx_ra_quotationId', type: IndexType.Key, attributes: ['quotationId'] },
    ],
  },

  // 13. approval_requests
  {
    collectionId: config.appwrite.collections.approvalRequests,
    name: 'Approval Requests',
    permissions: PERMISSION_PRESETS.GOVERNED,
    attributes: [
      { key: 'quotationId', type: 'string', size: 64, required: true },
      { key: 'quotationNumber', type: 'string', size: 64, required: false },
      { key: 'customerName', type: 'string', size: 255, required: false },
      { key: 'totalAmount', type: 'float', required: false },
      { key: 'discountPct', type: 'float', required: false },
      { key: 'riskLevel', type: 'enum', elements: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'], required: false },
      { key: 'riskScore', type: 'integer', required: false },
      { key: 'requiredRole', type: 'enum', elements: ['SALES_MANAGER', 'FINANCE'], required: true },
      { key: 'status', type: 'enum', elements: ['PENDING', 'APPROVED', 'REJECTED'], required: true },
      { key: 'requestedAt', type: 'string', size: 64, required: true },
      { key: 'resolvedAt', type: 'string', size: 64, required: false },
      { key: 'reason', type: 'string', size: 1000, required: true },
    ],
    indexes: [
      { key: 'idx_ar_quotationId', type: IndexType.Key, attributes: ['quotationId'] },
      { key: 'idx_ar_status', type: IndexType.Key, attributes: ['status'] },
      { key: 'idx_ar_requiredRole', type: IndexType.Key, attributes: ['requiredRole'] },
    ],
  },

  // 14. approval_actions
  {
    collectionId: config.appwrite.collections.approvalActions,
    name: 'Approval Actions',
    permissions: PERMISSION_PRESETS.GOVERNED,
    attributes: [
      { key: 'approvalRequestId', type: 'string', size: 64, required: true },
      { key: 'quotationId', type: 'string', size: 64, required: true },
      { key: 'approverId', type: 'string', size: 64, required: true },
      { key: 'approverName', type: 'string', size: 255, required: false },
      { key: 'action', type: 'enum', elements: ['APPROVE', 'REJECT'], required: true },
      { key: 'comment', type: 'string', size: 1000, required: true },
      { key: 'actedAt', type: 'string', size: 64, required: true },
    ],
    indexes: [
      { key: 'idx_aa_requestId', type: IndexType.Key, attributes: ['approvalRequestId'] },
      { key: 'idx_aa_quotationId', type: IndexType.Key, attributes: ['quotationId'] },
      { key: 'idx_aa_approverId', type: IndexType.Key, attributes: ['approverId'] },
    ],
  },

  // 15. warehouses
  {
    collectionId: config.appwrite.collections.warehouses,
    name: 'Warehouses',
    permissions: PERMISSION_PRESETS.MASTER_DATA,
    attributes: [
      { key: 'code', type: 'string', size: 32, required: true },
      { key: 'name', type: 'string', size: 128, required: true },
      { key: 'location', type: 'string', size: 255, required: true },
      { key: 'priority', type: 'integer', required: true },
    ],
    indexes: [
      { key: 'idx_wh_code', type: IndexType.Unique, attributes: ['code'] },
      { key: 'idx_wh_priority', type: IndexType.Key, attributes: ['priority'] },
    ],
  },

  // 16. warehouse_stock
  {
    collectionId: config.appwrite.collections.warehouseStock,
    name: 'Warehouse Stock',
    permissions: PERMISSION_PRESETS.OPERATIONAL,
    attributes: [
      { key: 'warehouseId', type: 'string', size: 64, required: true },
      { key: 'productId', type: 'string', size: 64, required: true },
      { key: 'variantId', type: 'string', size: 64, required: false },
      { key: 'totalQuantity', type: 'integer', required: true },
      { key: 'reservedQuantity', type: 'integer', required: true },
      { key: 'availableQuantity', type: 'integer', required: true },
    ],
    indexes: [
      { key: 'idx_ws_warehouseId', type: IndexType.Key, attributes: ['warehouseId'] },
      { key: 'idx_ws_productId', type: IndexType.Key, attributes: ['productId'] },
    ],
  },

  // 17. fulfillment_orders
  {
    collectionId: config.appwrite.collections.fulfillmentOrders,
    name: 'Fulfillment Orders',
    permissions: PERMISSION_PRESETS.OPERATIONAL,
    attributes: [
      { key: 'orderNumber', type: 'string', size: 64, required: true },
      { key: 'quotationId', type: 'string', size: 64, required: true },
      { key: 'customerId', type: 'string', size: 64, required: true },
      { key: 'customerName', type: 'string', size: 255, required: false },
      { key: 'status', type: 'enum', elements: ['PENDING', 'ALLOCATED', 'PARTIALLY_ALLOCATED', 'SHIPPED', 'DELIVERED', 'CANCELLED'], required: true },
      { key: 'createdAt', type: 'string', size: 64, required: false },
      { key: 'updatedAt', type: 'string', size: 64, required: false },
    ],
    indexes: [
      { key: 'idx_fo_orderNumber', type: IndexType.Unique, attributes: ['orderNumber'] },
      { key: 'idx_fo_quotationId', type: IndexType.Key, attributes: ['quotationId'] },
      { key: 'idx_fo_customerId', type: IndexType.Key, attributes: ['customerId'] },
      { key: 'idx_fo_status', type: IndexType.Key, attributes: ['status'] },
    ],
  },

  // 18. fulfillment_allocations
  {
    collectionId: config.appwrite.collections.fulfillmentAllocations,
    name: 'Fulfillment Allocations',
    permissions: PERMISSION_PRESETS.OPERATIONAL,
    attributes: [
      { key: 'fulfillmentOrderId', type: 'string', size: 64, required: true },
      { key: 'warehouseId', type: 'string', size: 64, required: true },
      { key: 'warehouseName', type: 'string', size: 128, required: false },
      { key: 'productId', type: 'string', size: 64, required: true },
      { key: 'productName', type: 'string', size: 255, required: false },
      { key: 'allocatedQuantity', type: 'integer', required: true },
      { key: 'allocatedAt', type: 'string', size: 64, required: true },
    ],
    indexes: [
      { key: 'idx_fa_orderId', type: IndexType.Key, attributes: ['fulfillmentOrderId'] },
      { key: 'idx_fa_warehouseId', type: IndexType.Key, attributes: ['warehouseId'] },
      { key: 'idx_fa_productId', type: IndexType.Key, attributes: ['productId'] },
    ],
  },

  // 19. backorders
  {
    collectionId: config.appwrite.collections.backorders,
    name: 'Backorders',
    permissions: PERMISSION_PRESETS.OPERATIONAL,
    attributes: [
      { key: 'fulfillmentOrderId', type: 'string', size: 64, required: true },
      { key: 'productId', type: 'string', size: 64, required: true },
      { key: 'productName', type: 'string', size: 255, required: false },
      { key: 'backorderQuantity', type: 'integer', required: true },
      { key: 'status', type: 'enum', elements: ['PENDING', 'RESOLVED'], required: true },
      { key: 'expectedDate', type: 'string', size: 64, required: true },
      { key: 'createdAt', type: 'string', size: 64, required: true },
    ],
    indexes: [
      { key: 'idx_bo_orderId', type: IndexType.Key, attributes: ['fulfillmentOrderId'] },
      { key: 'idx_bo_productId', type: IndexType.Key, attributes: ['productId'] },
      { key: 'idx_bo_status', type: IndexType.Key, attributes: ['status'] },
    ],
  },

  // 20. subscription_plans
  {
    collectionId: config.appwrite.collections.subscriptionPlans,
    name: 'Subscription Plans',
    permissions: PERMISSION_PRESETS.MASTER_DATA,
    attributes: [
      { key: 'name', type: 'string', size: 128, required: true },
      { key: 'code', type: 'string', size: 64, required: true },
      { key: 'billingInterval', type: 'enum', elements: ['MONTHLY', 'ANNUAL'], required: true },
      { key: 'price', type: 'float', required: true },
      { key: 'features', type: 'string', size: 2000, required: false },
    ],
    indexes: [
      { key: 'idx_sp_code', type: IndexType.Unique, attributes: ['code'] },
    ],
  },

  // 21. subscriptions
  {
    collectionId: config.appwrite.collections.subscriptions,
    name: 'Subscriptions',
    permissions: PERMISSION_PRESETS.OPERATIONAL,
    attributes: [
      { key: 'customerId', type: 'string', size: 64, required: true },
      { key: 'customerName', type: 'string', size: 255, required: false },
      { key: 'quotationId', type: 'string', size: 64, required: false },
      { key: 'planId', type: 'string', size: 64, required: false },
      { key: 'productName', type: 'string', size: 255, required: true },
      { key: 'status', type: 'enum', elements: ['ACTIVE', 'PAUSED', 'CANCELLED', 'EXPIRED'], required: true },
      { key: 'currentPeriodStart', type: 'string', size: 64, required: true },
      { key: 'currentPeriodEnd', type: 'string', size: 64, required: true },
      { key: 'billingInterval', type: 'enum', elements: ['MONTHLY', 'ANNUAL'], required: true },
      { key: 'amount', type: 'float', required: true },
      { key: 'createdAt', type: 'string', size: 64, required: true },
    ],
    indexes: [
      { key: 'idx_sub_customerId', type: IndexType.Key, attributes: ['customerId'] },
      { key: 'idx_sub_quotationId', type: IndexType.Key, attributes: ['quotationId'] },
      { key: 'idx_sub_status', type: IndexType.Key, attributes: ['status'] },
    ],
  },

  // 22. subscription_items
  {
    collectionId: config.appwrite.collections.subscriptionItems,
    name: 'Subscription Items',
    permissions: PERMISSION_PRESETS.OPERATIONAL,
    attributes: [
      { key: 'subscriptionId', type: 'string', size: 64, required: true },
      { key: 'productId', type: 'string', size: 64, required: true },
      { key: 'quantity', type: 'integer', required: true },
      { key: 'unitPrice', type: 'float', required: true },
    ],
    indexes: [
      { key: 'idx_si_subscriptionId', type: IndexType.Key, attributes: ['subscriptionId'] },
      { key: 'idx_si_productId', type: IndexType.Key, attributes: ['productId'] },
    ],
  },

  // 23. invoices
  {
    collectionId: config.appwrite.collections.invoices,
    name: 'Invoices',
    permissions: PERMISSION_PRESETS.OPERATIONAL,
    attributes: [
      { key: 'invoiceNumber', type: 'string', size: 64, required: true },
      { key: 'customerId', type: 'string', size: 64, required: true },
      { key: 'customerName', type: 'string', size: 255, required: false },
      { key: 'quotationId', type: 'string', size: 64, required: false },
      { key: 'subscriptionId', type: 'string', size: 64, required: false },
      { key: 'type', type: 'enum', elements: ['ONE_TIME', 'RECURRING'], required: true },
      { key: 'status', type: 'enum', elements: ['DRAFT', 'ISSUED', 'PAID', 'OVERDUE', 'CANCELLED'], required: true },
      { key: 'subtotal', type: 'float', required: true },
      { key: 'taxAmount', type: 'float', required: true },
      { key: 'total', type: 'float', required: true },
      { key: 'amountPaid', type: 'float', required: true },
      { key: 'balanceDue', type: 'float', required: true },
      { key: 'dueDate', type: 'string', size: 64, required: true },
      { key: 'issuedAt', type: 'string', size: 64, required: true },
      { key: 'paidAt', type: 'string', size: 64, required: false },
    ],
    indexes: [
      { key: 'idx_inv_number', type: IndexType.Unique, attributes: ['invoiceNumber'] },
      { key: 'idx_inv_customerId', type: IndexType.Key, attributes: ['customerId'] },
      { key: 'idx_inv_quotationId', type: IndexType.Key, attributes: ['quotationId'] },
      { key: 'idx_inv_status', type: IndexType.Key, attributes: ['status'] },
    ],
  },

  // 24. invoice_lines
  {
    collectionId: config.appwrite.collections.invoiceLines,
    name: 'Invoice Lines',
    permissions: PERMISSION_PRESETS.OPERATIONAL,
    attributes: [
      { key: 'invoiceId', type: 'string', size: 64, required: true },
      { key: 'description', type: 'string', size: 255, required: true },
      { key: 'quantity', type: 'integer', required: true },
      { key: 'unitPrice', type: 'float', required: true },
      { key: 'lineTotal', type: 'float', required: true },
    ],
    indexes: [
      { key: 'idx_il_invoiceId', type: IndexType.Key, attributes: ['invoiceId'] },
    ],
  },

  // 25. payments
  {
    collectionId: config.appwrite.collections.payments,
    name: 'Payments',
    permissions: PERMISSION_PRESETS.OPERATIONAL,
    attributes: [
      { key: 'invoiceId', type: 'string', size: 64, required: true },
      { key: 'amount', type: 'float', required: true },
      { key: 'paymentMethod', type: 'enum', elements: ['CREDIT_CARD', 'WIRE_TRANSFER', 'ACH', 'CHECK'], required: true },
      { key: 'referenceNumber', type: 'string', size: 128, required: true },
      { key: 'paidAt', type: 'string', size: 64, required: true },
      { key: 'status', type: 'enum', elements: ['SUCCESS', 'FAILED'], required: true },
    ],
    indexes: [
      { key: 'idx_pay_invoiceId', type: IndexType.Key, attributes: ['invoiceId'] },
      { key: 'idx_pay_ref', type: IndexType.Key, attributes: ['referenceNumber'] },
    ],
  },

  // 26. credit_notes
  {
    collectionId: config.appwrite.collections.creditNotes,
    name: 'Credit Notes',
    permissions: PERMISSION_PRESETS.OPERATIONAL,
    attributes: [
      { key: 'invoiceId', type: 'string', size: 64, required: true },
      { key: 'amount', type: 'float', required: true },
      { key: 'reason', type: 'string', size: 500, required: true },
      { key: 'issuedAt', type: 'string', size: 64, required: true },
    ],
    indexes: [
      { key: 'idx_cn_invoiceId', type: IndexType.Key, attributes: ['invoiceId'] },
    ],
  },

  // 27. negotiations
  {
    collectionId: config.appwrite.collections.negotiations,
    name: 'Negotiations',
    permissions: PERMISSION_PRESETS.OPERATIONAL,
    attributes: [
      { key: 'quotationId', type: 'string', size: 64, required: true },
      { key: 'quotationNumber', type: 'string', size: 64, required: false },
      { key: 'customerId', type: 'string', size: 64, required: true },
      { key: 'customerName', type: 'string', size: 255, required: false },
      { key: 'status', type: 'enum', elements: ['OPEN', 'ACCEPTED', 'REJECTED', 'SUPERSEDED'], required: true },
      { key: 'originalDiscountPct', type: 'float', required: true },
      { key: 'requestedDiscountPct', type: 'float', required: true },
      { key: 'counterDiscountPct', type: 'float', required: false },
      { key: 'createdAt', type: 'string', size: 64, required: false },
      { key: 'updatedAt', type: 'string', size: 64, required: false },
    ],
    indexes: [
      { key: 'idx_neg_quotationId', type: IndexType.Key, attributes: ['quotationId'] },
      { key: 'idx_neg_customerId', type: IndexType.Key, attributes: ['customerId'] },
      { key: 'idx_neg_status', type: IndexType.Key, attributes: ['status'] },
    ],
  },

  // 28. negotiation_messages
  {
    collectionId: config.appwrite.collections.negotiationMessages,
    name: 'Negotiation Messages',
    permissions: PERMISSION_PRESETS.OPERATIONAL,
    attributes: [
      { key: 'negotiationId', type: 'string', size: 64, required: true },
      { key: 'senderId', type: 'string', size: 64, required: true },
      { key: 'senderName', type: 'string', size: 128, required: true },
      { key: 'senderRole', type: 'enum', elements: ['ADMIN', 'SALES_REP', 'SALES_MANAGER', 'FINANCE', 'CUSTOMER'], required: true },
      { key: 'message', type: 'string', size: 2000, required: true },
      { key: 'timestamp', type: 'string', size: 64, required: true },
    ],
    indexes: [
      { key: 'idx_nm_negotiationId', type: IndexType.Key, attributes: ['negotiationId'] },
    ],
  },

  // 29. upsell_rules
  {
    collectionId: config.appwrite.collections.upsellRules,
    name: 'Upsell Rules',
    permissions: PERMISSION_PRESETS.MASTER_DATA,
    attributes: [
      { key: 'triggerProductId', type: 'string', size: 64, required: true },
      { key: 'recommendedProductId', type: 'string', size: 64, required: true },
      { key: 'ruleType', type: 'enum', elements: ['UPSELL', 'CROSS_SELL', 'ADDON'], required: true },
      { key: 'discountIncentivePct', type: 'float', required: true },
      { key: 'reason', type: 'string', size: 500, required: false },
    ],
    indexes: [
      { key: 'idx_ur_trigger', type: IndexType.Key, attributes: ['triggerProductId'] },
      { key: 'idx_ur_recommended', type: IndexType.Key, attributes: ['recommendedProductId'] },
    ],
  },

  // 30. deal_health_alerts
  {
    collectionId: config.appwrite.collections.dealHealthAlerts,
    name: 'Deal Health Alerts',
    permissions: PERMISSION_PRESETS.GOVERNED,
    attributes: [
      { key: 'quotationId', type: 'string', size: 64, required: true },
      { key: 'quotationNumber', type: 'string', size: 64, required: false },
      { key: 'customerName', type: 'string', size: 255, required: false },
      { key: 'type', type: 'enum', elements: ['STALLED_DEAL', 'EXCESSIVE_DISCOUNT', 'FULFILLMENT_RISK', 'MARGIN_EROSION'], required: true },
      { key: 'severity', type: 'enum', elements: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'], required: true },
      { key: 'message', type: 'string', size: 500, required: true },
      { key: 'thresholdValue', type: 'float', required: false },
      { key: 'currentValue', type: 'float', required: false },
      { key: 'status', type: 'enum', elements: ['ACTIVE', 'RESOLVED'], required: true },
      { key: 'createdAt', type: 'string', size: 64, required: true },
    ],
    indexes: [
      { key: 'idx_dha_quotationId', type: IndexType.Key, attributes: ['quotationId'] },
      { key: 'idx_dha_status', type: IndexType.Key, attributes: ['status'] },
      { key: 'idx_dha_severity', type: IndexType.Key, attributes: ['severity'] },
    ],
  },

  // 31. audit_logs
  {
    collectionId: config.appwrite.collections.auditLogs,
    name: 'Audit Logs',
    permissions: PERMISSION_PRESETS.IMMUTABLE_AUDIT,
    attributes: [
      { key: 'actorId', type: 'string', size: 64, required: true },
      { key: 'actorName', type: 'string', size: 128, required: true },
      { key: 'actorRole', type: 'enum', elements: ['ADMIN', 'SALES_REP', 'SALES_MANAGER', 'FINANCE', 'CUSTOMER'], required: true },
      { key: 'entityType', type: 'string', size: 64, required: true },
      { key: 'entityId', type: 'string', size: 64, required: true },
      { key: 'action', type: 'string', size: 128, required: true },
      { key: 'oldValues', type: 'string', size: 5000, required: false },
      { key: 'newValues', type: 'string', size: 5000, required: false },
      { key: 'timestamp', type: 'string', size: 64, required: true },
      { key: 'comment', type: 'string', size: 1000, required: false },
    ],
    indexes: [
      { key: 'idx_audit_entityType', type: IndexType.Key, attributes: ['entityType'] },
      { key: 'idx_audit_entityId', type: IndexType.Key, attributes: ['entityId'] },
      { key: 'idx_audit_actorId', type: IndexType.Key, attributes: ['actorId'] },
      { key: 'idx_audit_timestamp', type: IndexType.Key, attributes: ['timestamp'] },
    ],
  },
];

/**
 * Helper to pause execution for a given duration
 */
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Waits for all attributes in a collection to become 'available' (finished processing in Appwrite)
 */
async function waitForAttributesReady(databases: Databases, dbId: string, colId: string, maxWaitSeconds = 25): Promise<void> {
  const start = Date.now();
  while ((Date.now() - start) < maxWaitSeconds * 1000) {
    try {
      const res = await databases.listAttributes(dbId, colId);
      const pending = res.attributes.filter((a: any) => a.status !== 'available' && a.status !== 'failed');
      if (pending.length === 0) {
        return;
      }
    } catch {
      // transient network or rate-limit retry
    }
    await sleep(1000);
  }
}

/**
 * DealFlow360 Comprehensive Appwrite Schema Bootstrap
 * Fully idempotent: safely creates and updates Database, Collections, Attributes, and Indexes.
 */
async function bootstrapAppwrite(): Promise<{
  collectionsCreated: number;
  collectionsFound: number;
  attributesCreated: number;
  attributesFound: number;
  indexesCreated: number;
  indexesFound: number;
}> {
  const stats = {
    collectionsCreated: 0,
    collectionsFound: 0,
    attributesCreated: 0,
    attributesFound: 0,
    indexesCreated: 0,
    indexesFound: 0,
  };

  if (!config.appwrite.apiKey) {
    console.log('[Bootstrap] No APPWRITE_API_KEY detected in environment.');
    console.log('[Bootstrap] Operating in offline in-memory fallback store mode. Bootstrap skipped.');
    return stats;
  }

  console.log('================================================================');
  console.log('        DealFlow360 Appwrite Cloud Schema Provisioner           ');
  console.log('================================================================');
  console.log(`Endpoint:   ${config.appwrite.endpoint}`);
  console.log(`Project ID: ${config.appwrite.projectId}`);
  console.log(`Database:   ${config.appwrite.databaseId}`);
  console.log('----------------------------------------------------------------');

  const client = new Client()
    .setEndpoint(config.appwrite.endpoint)
    .setProject(config.appwrite.projectId)
    .setKey(config.appwrite.apiKey);

  const databases = new Databases(client);
  const dbId = config.appwrite.databaseId;

  try {
    await databases.get(dbId);
    console.log(`✓ Database "${dbId}" exists.`);
  } catch (err: any) {
    if (err.code === 404 || err.message?.includes('could not be found')) {
      console.log(`+ Creating Database "${dbId}"...`);
      await databases.create(dbId, 'DealFlow360 Database');
      console.log(`✓ Database "${dbId}" created successfully.`);
    } else if (err.type === 'general_unauthorized_scope' || err.message?.includes('missing scopes')) {
      console.error('\n================================================================');
      console.error('              Appwrite API Key Scope Required                   ');
      console.error('================================================================');
      console.error('The provided APPWRITE_API_KEY is missing database scopes in Appwrite Cloud.');
      console.error(`Details: ${err.message}`);
      console.error('\nTo resolve:');
      console.error('1. Open your Appwrite Cloud Console: https://cloud.appwrite.io');
      console.error(`2. Select project: ${config.appwrite.projectId}`);
      console.error('3. Go to Project Settings -> API Keys (or Overview -> Integrations -> API Keys)');
      console.error('4. Edit or create a Secret API Key with the following scopes checked:');
      console.error('   • Databases (read & write)');
      console.error('   • Collections (read & write)');
      console.error('   • Attributes (read & write)');
      console.error('   • Indexes (read & write)');
      console.error('   • Documents (read & write)');
      console.error('5. Save and paste the Secret Key into backend/.env (APPWRITE_API_KEY=...)');
      console.error('================================================================\n');
      return stats;
    } else {
      throw err;
    }
  }

  // 2. Provision each collection and its attributes
  for (const schema of SCHEMA_DEFINITIONS) {
    const colId = schema.collectionId;
    console.log(`\n[Collection: ${schema.name} (${colId})]`);

    // Ensure Collection exists & update permissions
    try {
      await databases.getCollection(dbId, colId);
      stats.collectionsFound++;
      console.log(`  ✓ Collection exists.`);
      // Update permissions to ensure strict role governance
      try {
        await databases.updateCollection(dbId, colId, schema.name, schema.permissions);
      } catch {
        // Continue if permissions update is identical or not modified
      }
    } catch (err: any) {
      if (err.code === 404 || err.message?.includes('could not be found')) {
        console.log(`  + Creating collection with role-based permissions...`);
        await databases.createCollection(dbId, colId, schema.name, schema.permissions);
        stats.collectionsCreated++;
        console.log(`  ✓ Created collection.`);
      } else {
        console.error(`  ✗ Error accessing collection "${colId}":`, err.message);
        continue;
      }
    }

    // Inspect existing attributes for idempotency
    let existingAttributes = new Map<string, any>();
    try {
      const attrRes = await databases.listAttributes(dbId, colId);
      existingAttributes = new Map(attrRes.attributes.map((a: any) => [a.key, a]));
    } catch (err: any) {
      console.warn(`  ! Could not list attributes for "${colId}": ${err.message}`);
    }

    let createdAnyAttr = false;

    // Create required attributes
    for (const attr of schema.attributes) {
      if (existingAttributes.has(attr.key)) {
        stats.attributesFound++;
        continue;
      }

      try {
        console.log(`    + Adding attribute: ${attr.key} (${attr.type})`);
        switch (attr.type) {
          case 'string':
            await databases.createStringAttribute(
              dbId,
              colId,
              attr.key,
              attr.size || 255,
              attr.required,
              attr.default,
              attr.array
            );
            break;
          case 'integer':
            await databases.createIntegerAttribute(
              dbId,
              colId,
              attr.key,
              attr.required,
              undefined,
              undefined,
              attr.default,
              attr.array
            );
            break;
          case 'float':
            await databases.createFloatAttribute(
              dbId,
              colId,
              attr.key,
              attr.required,
              undefined,
              undefined,
              attr.default,
              attr.array
            );
            break;
          case 'boolean':
            await databases.createBooleanAttribute(
              dbId,
              colId,
              attr.key,
              attr.required,
              attr.default,
              attr.array
            );
            break;
          case 'email':
            await databases.createEmailAttribute(
              dbId,
              colId,
              attr.key,
              attr.required,
              attr.default,
              attr.array
            );
            break;
          case 'datetime':
            await databases.createDatetimeAttribute(
              dbId,
              colId,
              attr.key,
              attr.required,
              attr.default,
              attr.array
            );
            break;
          case 'enum':
            await databases.createEnumAttribute(
              dbId,
              colId,
              attr.key,
              attr.elements || [],
              attr.required,
              attr.default,
              attr.array
            );
            break;
        }
        stats.attributesCreated++;
        createdAnyAttr = true;
      } catch (err: any) {
        if (err.code === 409 || err.message?.includes('already exists')) {
          stats.attributesFound++;
        } else {
          console.error(`    ✗ Failed to create attribute "${attr.key}": ${err.message}`);
        }
      }
    }

    // If new attributes were created, wait until they finish background processing before indexing
    if (createdAnyAttr) {
      process.stdout.write(`    ⏳ Waiting for attributes to process in Appwrite... `);
      await waitForAttributesReady(databases, dbId, colId);
      console.log('Ready.');
    }

    // Inspect existing indexes for idempotency
    let existingIndexes = new Map<string, any>();
    try {
      const idxRes = await databases.listIndexes(dbId, colId);
      existingIndexes = new Map(idxRes.indexes.map((i: any) => [i.key, i]));
    } catch (err: any) {
      console.warn(`  ! Could not list indexes for "${colId}": ${err.message}`);
    }

    // Create required indexes
    for (const idx of schema.indexes) {
      if (existingIndexes.has(idx.key)) {
        stats.indexesFound++;
        continue;
      }

      try {
        console.log(`    + Adding index: ${idx.key} on [${idx.attributes.join(', ')}]`);
        await databases.createIndex(
          dbId,
          colId,
          idx.key,
          idx.type,
          idx.attributes,
          idx.orders
        );
        stats.indexesCreated++;
      } catch (err: any) {
        if (err.code === 409 || err.message?.includes('already exists')) {
          stats.indexesFound++;
        } else {
          console.error(`    ✗ Failed to create index "${idx.key}": ${err.message}`);
        }
      }
    }
  }

  console.log('\n================================================================');
  console.log('                Appwrite Provisioning Summary                   ');
  console.log('================================================================');
  console.log(`Collections: ${stats.collectionsCreated} created | ${stats.collectionsFound} already existed (Total: ${SCHEMA_DEFINITIONS.length})`);
  console.log(`Attributes:  ${stats.attributesCreated} created | ${stats.attributesFound} already existed`);
  console.log(`Indexes:     ${stats.indexesCreated} created | ${stats.indexesFound} already existed`);
  console.log('================================================================\n');

  return stats;
}

if (require.main === module) {
  bootstrapAppwrite()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('[Bootstrap] Fatal error during schema initialization:', err);
      process.exit(1);
    });
}

export { bootstrapAppwrite };
