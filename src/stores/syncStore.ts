import { create } from 'zustand';
import { openDB } from 'idb';

interface SyncState {
  isOnline: boolean;
  isSyncing: boolean;
  pendingMutations: Mutation[];
  lastSync: Date | null;
  setOnline: (online: boolean) => void;
  addMutation: (mutation: Mutation) => void;
  removeMutation: (id: string) => void;
  setSyncing: (syncing: boolean) => void;
  setLastSync: (date: Date) => void;
}

interface Mutation {
  id: string;
  type: 'create' | 'update' | 'delete';
  entity: string;
  data: any;
  timestamp: number;
}

const DB_NAME = 'shamash-sync';
const STORE_NAME = 'mutations';

export const useSyncStore = create<SyncState>((set, get) => ({
  isOnline: true,
  isSyncing: false,
  pendingMutations: [],
  lastSync: null,

  setOnline: (online) => set({ isOnline: online }),

  addMutation: async (mutation) => {
    const db = await openDB(DB_NAME, 1, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        }
      },
    });

    await db.put(STORE_NAME, mutation);
    
    set((state) => ({
      pendingMutations: [...state.pendingMutations, mutation],
    }));
  },

  removeMutation: async (id) => {
    const db = await openDB(DB_NAME, 1);
    await db.delete(STORE_NAME, id);
    
    set((state) => ({
      pendingMutations: state.pendingMutations.filter((m) => m.id !== id),
    }));
  },

  setSyncing: (syncing) => set({ isSyncing: syncing }),
  setLastSync: (date) => set({ lastSync: date }),
}));

export async function initOfflineStorage() {
  const db = await openDB('shamash-data', 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains('members')) {
        db.createObjectStore('members', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('aliyot')) {
        db.createObjectStore('aliyot', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('donations')) {
        db.createObjectStore('donations', { keyPath: 'id' });
      }
    },
  });
  return db;
}
