import mongoose from 'mongoose';
import { config } from '../config/index';
import UserModel from '../models/User';
import CustomerModel from '../models/Customer';
import CustomerTierModel from '../models/CustomerTier';
import ProductModel from '../models/Product';
import QuotationModel from '../models/Quotation';
import { SEED_USERS, SEED_CUSTOMER_TIERS, SEED_CUSTOMERS, SEED_PRODUCTS, SEED_QUOTATIONS } from './seed-data';

const mapToMongo = (items: any[]) => items.map(item => {
  const { id, lines, ...rest } = item;
  let newLines = lines;
  if (lines) {
    newLines = lines.map((l: any) => {
      const { id: lineId, ...lRest } = l;
      return { _id: lineId, ...lRest };
    });
  }

  if (newLines) {
    return { _id: id, lines: newLines, ...rest };
  } else {
    return { _id: id, ...rest };
  }
});

async function main() {
  console.log('[Seed] Connecting to MongoDB...');
  await mongoose.connect(config.mongoUri);
  console.log(`[Seed] Connected to ${config.mongoUri}`);

  console.log('[Seed] Clearing existing data...');
  await Promise.all([
    UserModel.deleteMany({}),
    CustomerTierModel.deleteMany({}),
    CustomerModel.deleteMany({}),
    ProductModel.deleteMany({}),
    QuotationModel.deleteMany({}),
  ]);

  console.log('[Seed] Inserting Flow 1 entities...');
  await UserModel.insertMany(mapToMongo(SEED_USERS));
  await CustomerTierModel.insertMany(mapToMongo(SEED_CUSTOMER_TIERS));
  await CustomerModel.insertMany(mapToMongo(SEED_CUSTOMERS));
  await ProductModel.insertMany(mapToMongo(SEED_PRODUCTS));
  await QuotationModel.insertMany(mapToMongo(SEED_QUOTATIONS));

  console.log(`[Seed] Loaded:
    - ${SEED_USERS.length} Users
    - ${SEED_CUSTOMER_TIERS.length} Customer Tiers
    - ${SEED_CUSTOMERS.length} Customers
    - ${SEED_PRODUCTS.length} Products
    - ${SEED_QUOTATIONS.length} Quotations
  `);
  console.log('[Seed] Seed completed successfully.');
}

if (require.main === module) {
  main().then(() => {
    mongoose.disconnect();
    process.exit(0);
  }).catch(err => {
    console.error(err);
    process.exit(1);
  });
}

export { main as runSeed };
