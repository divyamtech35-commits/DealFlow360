import { Client, Databases, Users } from 'node-appwrite';
import { config } from './index';

let appwriteClient: Client | null = null;
let appwriteDatabases: Databases | null = null;
let appwriteUsers: Users | null = null;

const isAppwriteConfigured = Boolean(
  config.appwrite.endpoint &&
  config.appwrite.projectId &&
  config.appwrite.apiKey
);

if (isAppwriteConfigured) {
  try {
    appwriteClient = new Client()
      .setEndpoint(config.appwrite.endpoint)
      .setProject(config.appwrite.projectId)
      .setKey(config.appwrite.apiKey);

    appwriteDatabases = new Databases(appwriteClient);
    appwriteUsers = new Users(appwriteClient);
    console.log('[Appwrite] Initialized official SDK client connection.');
  } catch (err) {
    console.warn('[Appwrite] Failed to initialize Appwrite client. Falling back to in-memory store:', err);
  }
} else {
  console.log('[Appwrite] No APPWRITE_API_KEY detected. Running in seamless mock/in-memory store mode for hackathon demo.');
}

export { appwriteClient, appwriteDatabases, appwriteUsers, isAppwriteConfigured };
