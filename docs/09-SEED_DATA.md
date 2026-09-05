# DealFlow360 - Seed Data Specification

## Users
- **Admin**: `admin@dealflow360.com` / `password123` (ADMIN)
- **Sales Rep**: `alex.sales@dealflow360.com` / `password123` (SALES_REP)
- **Sales Manager**: `sarah.manager@dealflow360.com` / `password123` (SALES_MANAGER)
- **Finance**: `frank.finance@dealflow360.com` / `password123` (FINANCE)
- **Customer (Acme)**: `john.customer@acme.com` / `password123` (CUSTOMER, customerId: `cust_acme`)

## Customer Tiers
- `tier_bronze`: Bronze (Max Discount: 5%, Net 15)
- `tier_silver`: Silver (Max Discount: 10%, Net 30)
- `tier_gold`: Gold (Max Discount: 15%, Net 45)
- `tier_enterprise`: Enterprise (Max Discount: 25%, Net 60)

## Customers
- `cust_acme`: Acme Corporation (Gold, Rep: Alex, Credit Limit: $150,000)
- `cust_technova`: TechNova Ltd (Silver, Rep: Alex, Credit Limit: $75,000)
- `cust_global`: Global Retail (Enterprise, Rep: Alex, Credit Limit: $500,000)

## Products
- `prod_laptop_pro`: Laptop Pro (SKU: LP-100, Base Price: $1,499.00, Cost: $950.00, Physical)
- `prod_ent_support`: Enterprise Support (SKU: SUP-247, Base Price: $499.00/mo, Cost: $120.00, Subscription)
- `prod_cloud_backup`: Cloud Backup Pro (SKU: CB-001, Base Price: $199.00/mo, Cost: $40.00, Subscription)
- `prod_install_service`: Installation Service (SKU: SRV-INST, Base Price: $750.00, Cost: $300.00, Service)
- `prod_ext_warranty`: Extended Warranty (SKU: WRN-3YR, Base Price: $299.00, Cost: $50.00, Addon)

## Warehouses
- `wh_main`: Main Warehouse (Location: Chicago, IL, Priority: 1)
- `wh_east`: East Warehouse (Location: Newark, NJ, Priority: 2)

## Upsell Rules
- `prod_laptop_pro` → `prod_ext_warranty` (Add-on, 10% bundle discount incentive)
- `prod_laptop_pro` → `prod_ent_support` (Cross-sell, 5% bundle discount incentive)
- `prod_laptop_pro` → `prod_install_service` (Service Add-on)
