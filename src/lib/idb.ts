// Lightweight IndexedDB helper without external deps

export type OutboxOperation = {
  id: string; // uuid
  entity: 'transactions' | 'crops' | 'properties';
  action: 'create' | 'update' | 'delete';
  payload: Record<string, unknown>; // normalized object
  timestamp: number;
};

const DB_NAME = 'agroflow-db';
const DB_VERSION = 1;
const STORES = {
  transactions: 'transactions',
  crops: 'crops',
  properties: 'properties',
  outbox: 'outbox',
} as const;

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORES.transactions)) {
        db.createObjectStore(STORES.transactions, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(STORES.crops)) {
        db.createObjectStore(STORES.crops, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(STORES.properties)) {
        db.createObjectStore(STORES.properties, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(STORES.outbox)) {
        db.createObjectStore(STORES.outbox, { keyPath: 'id' });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function withStore<T>(storeName: string, mode: IDBTransactionMode, fn: (store: IDBObjectStore) => Promise<T> | T): Promise<T> {
  const db = await openDB();
  return new Promise<T>((resolve, reject) => {
    const tx = db.transaction(storeName, mode);
    const store = tx.objectStore(storeName);
    Promise.resolve(fn(store))
      .then((result) => {
        tx.oncomplete = () => resolve(result);
      })
      .catch((err) => reject(err));
    tx.onerror = () => reject(tx.error);
  });
}

export const idb = {
  async getAll<T>(storeName: keyof typeof STORES): Promise<T[]> {
    return withStore(STORES[storeName], 'readonly', (store) => {
      return new Promise<T[]>((resolve, reject) => {
        const request = store.getAll();
        request.onsuccess = () => resolve(request.result as T[]);
        request.onerror = () => reject(request.error);
      });
    });
  },
  async put<T extends { id: string }>(storeName: keyof typeof STORES, value: T): Promise<void> {
    return withStore(STORES[storeName], 'readwrite', (store) => {
      return new Promise<void>((resolve, reject) => {
        const request = store.put(value);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    });
  },
  async bulkPut<T extends { id: string }>(storeName: keyof typeof STORES, values: T[]): Promise<void> {
    if (values.length === 0) return;
    return withStore(STORES[storeName], 'readwrite', async (store) => {
      await Promise.all(values.map((v) => new Promise<void>((resolve, reject) => {
        const request = store.put(v);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      })));
    });
  },
  async delete(storeName: keyof typeof STORES, id: string): Promise<void> {
    return withStore(STORES[storeName], 'readwrite', (store) => {
      return new Promise<void>((resolve, reject) => {
        const request = store.delete(id);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    });
  },
  async clear(storeName: keyof typeof STORES): Promise<void> {
    return withStore(STORES[storeName], 'readwrite', (store) => {
      return new Promise<void>((resolve, reject) => {
        const request = store.clear();
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    });
  },
  // Outbox helpers
  async enqueue(op: OutboxOperation): Promise<void> {
    return this.put('outbox', op);
  },
  async peekAll(): Promise<OutboxOperation[]> {
    return this.getAll('outbox') as Promise<OutboxOperation[]>;
  },
  async removeFromOutbox(id: string): Promise<void> {
    return this.delete('outbox', id);
  },
};


