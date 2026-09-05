import { InMemoryStore } from '../repositories/in_memory_store';

async function main() {
  console.log('[Seed] Resetting and re-initializing deterministic seed data...');
  InMemoryStore.reset();
  console.log(`[Seed] Loaded:
    - ${InMemoryStore.users.length} Users
    - ${InMemoryStore.customerTiers.length} Customer Tiers
    - ${InMemoryStore.customers.length} Customers
    - ${InMemoryStore.products.length} Products
    - ${InMemoryStore.warehouses.length} Warehouses
    - ${InMemoryStore.quotations.length} Quotations
  `);
  console.log('[Seed] Seed completed successfully.');
}

if (require.main === module) {
  main().then(() => process.exit(0));
}

export { main as runSeed };
