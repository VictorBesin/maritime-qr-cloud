import { openDB } from 'idb';
import axios from 'axios';

const DB_NAME = 'maritime-qr-db';
const STORE_NAME = 'offline-logs';

const initDB = async () => {
  return openDB(DB_NAME, 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'clientId' });
      }
    },
  });
};

export const saveLogOffline = async (log) => {
  const db = await initDB();
  await db.put(STORE_NAME, log);
};

export const syncOfflineLogs = async () => {
  if (!navigator.onLine) return;
  
  const db = await initDB();
  const logs = await db.getAll(STORE_NAME);
  
  if (logs.length === 0) return;

  try {
    const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
    await axios.post(`${API_URL}/clock/sync`, { logs });
    
    // Clear out synced logs
    const tx = db.transaction(STORE_NAME, 'readwrite');
    await Promise.all(logs.map(log => tx.store.delete(log.clientId)));
    await tx.done;
    
    console.log(`Successfully synced ${logs.length} offline logs.`);
  } catch (error) {
    console.error('Failed to sync offline logs', error);
  }
};
