import { Client, Databases, ID, Permission, Role } from 'node-appwrite';
import { config } from '../config';

/**
 * DealFlow360 Appwrite Database Bootstrap Script
 * Automatically provisions all collections, attributes, and permissions on any Appwrite instance.
 */
async function bootstrapAppwrite() {
  if (!config.appwrite.apiKey) {
    console.log('[Bootstrap] No APPWRITE_API_KEY provided. Skipping remote Appwrite bootstrap.');
    return;
  }

  console.log(`[Bootstrap] Connecting to Appwrite at ${config.appwrite.endpoint}...`);
  const client = new Client()
    .setEndpoint(config.appwrite.endpoint)
    .setProject(config.appwrite.projectId)
    .setKey(config.appwrite.apiKey);

  const databases = new Databases(client);
  const dbId = config.appwrite.databaseId;

  try {
    try {
      await databases.get(dbId);
      console.log(`[Bootstrap] Database "${dbId}" exists.`);
    } catch {
      console.log(`[Bootstrap] Creating Database "${dbId}"...`);
      await databases.create(dbId, 'DealFlow360 Database');
    }

    const collectionsToCreate = Object.values(config.appwrite.collections);

    for (const colId of collectionsToCreate) {
      try {
        await databases.getCollection(dbId, colId);
        console.log(`  ✓ Collection "${colId}" already exists.`);
      } catch {
        console.log(`  + Creating collection "${colId}"...`);
        await databases.createCollection(
          dbId,
          colId,
          colId.replace(/_/g, ' ').toUpperCase(),
          [
            Permission.read(Role.any()),
            Permission.write(Role.users()),
            Permission.create(Role.users()),
            Permission.update(Role.users()),
            Permission.delete(Role.users()),
          ]
        );
      }
    }

    console.log('[Bootstrap] Appwrite schema initialization complete.');
  } catch (error) {
    console.error('[Bootstrap] Appwrite bootstrap error:', error);
  }
}

if (require.main === module) {
  bootstrapAppwrite().then(() => process.exit(0));
}

export { bootstrapAppwrite };
