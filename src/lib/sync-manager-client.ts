// Client-only sync manager to prevent SSR issues
import { syncManager } from './sync-manager';

// Only export the sync manager if we're in the browser
export const clientSyncManager = typeof window !== 'undefined' ? syncManager : null;
