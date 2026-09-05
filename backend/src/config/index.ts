import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '5000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  jwtSecret: process.env.JWT_SECRET || 'dealflow360_hackathon_super_secret_jwt_key_2026',
  appwrite: {
    endpoint: process.env.APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1',
    projectId: process.env.APPWRITE_PROJECT_ID || 'dealflow360',
    apiKey: process.env.APPWRITE_API_KEY || '',
    databaseId: process.env.APPWRITE_DATABASE_ID || 'dealflow360_db',
    collections: {
      users: process.env.APPWRITE_USERS_COLLECTION_ID || 'users',
      customers: process.env.APPWRITE_CUSTOMERS_COLLECTION_ID || 'customers',
      customerTiers: process.env.APPWRITE_CUSTOMER_TIERS_COLLECTION_ID || 'customer_tiers',
      categories: process.env.APPWRITE_CATEGORIES_COLLECTION_ID || 'categories',
      products: process.env.APPWRITE_PRODUCTS_COLLECTION_ID || 'products',
      productVariants: process.env.APPWRITE_PRODUCT_VARIANTS_COLLECTION_ID || 'product_variants',
      priceLists: process.env.APPWRITE_PRICE_LISTS_COLLECTION_ID || 'price_lists',
      priceListItems: process.env.APPWRITE_PRICE_LIST_ITEMS_COLLECTION_ID || 'price_list_items',
      discountRules: process.env.APPWRITE_DISCOUNT_RULES_COLLECTION_ID || 'discount_rules',
      quotations: process.env.APPWRITE_QUOTATIONS_COLLECTION_ID || 'quotations',
      quotationLines: process.env.APPWRITE_QUOTATION_LINES_COLLECTION_ID || 'quotation_lines',
      riskAssessments: process.env.APPWRITE_RISK_ASSESSMENTS_COLLECTION_ID || 'risk_assessments',
      approvalRequests: process.env.APPWRITE_APPROVAL_REQUESTS_COLLECTION_ID || 'approval_requests',
      approvalActions: process.env.APPWRITE_APPROVAL_ACTIONS_COLLECTION_ID || 'approval_actions',
      warehouses: process.env.APPWRITE_WAREHOUSES_COLLECTION_ID || 'warehouses',
      warehouseStock: process.env.APPWRITE_WAREHOUSE_STOCK_COLLECTION_ID || 'warehouse_stock',
      fulfillmentOrders: process.env.APPWRITE_FULFILLMENT_ORDERS_COLLECTION_ID || 'fulfillment_orders',
      fulfillmentAllocations: process.env.APPWRITE_FULFILLMENT_ALLOCATIONS_COLLECTION_ID || 'fulfillment_allocations',
      backorders: process.env.APPWRITE_BACKORDERS_COLLECTION_ID || 'backorders',
      subscriptionPlans: process.env.APPWRITE_SUBSCRIPTION_PLANS_COLLECTION_ID || 'subscription_plans',
      subscriptions: process.env.APPWRITE_SUBSCRIPTIONS_COLLECTION_ID || 'subscriptions',
      subscriptionItems: process.env.APPWRITE_SUBSCRIPTION_ITEMS_COLLECTION_ID || 'subscription_items',
      invoices: process.env.APPWRITE_INVOICES_COLLECTION_ID || 'invoices',
      invoiceLines: process.env.APPWRITE_INVOICE_LINES_COLLECTION_ID || 'invoice_lines',
      payments: process.env.APPWRITE_PAYMENTS_COLLECTION_ID || 'payments',
      creditNotes: process.env.APPWRITE_CREDIT_NOTES_COLLECTION_ID || 'credit_notes',
      negotiations: process.env.APPWRITE_NEGOTIATIONS_COLLECTION_ID || 'negotiations',
      negotiationMessages: process.env.APPWRITE_NEGOTIATION_MESSAGES_COLLECTION_ID || 'negotiation_messages',
      upsellRules: process.env.APPWRITE_UPSELL_RULES_COLLECTION_ID || 'upsell_rules',
      dealHealthAlerts: process.env.APPWRITE_DEAL_HEALTH_ALERTS_COLLECTION_ID || 'deal_health_alerts',
      auditLogs: process.env.APPWRITE_AUDIT_LOGS_COLLECTION_ID || 'audit_logs',
    }
  }
};
