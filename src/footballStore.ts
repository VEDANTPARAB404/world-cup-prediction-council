import { useState, useEffect } from "react";
import { Contender } from "./types";
import { LiveFootballData } from "./liveFootballService";

type StoreSubscriber = (data: LiveFootballData) => void;

class ClientFootballStore {
  private data: LiveFootballData | null = null;
  private subscribers: Set<StoreSubscriber> = new Set();
  private isSyncing = false;
  private syncStatus = "";
  private currentSyncPromise: Promise<LiveFootballData> | null = null;

  constructor() {
    // Hydrate store from localStorage to ensure instant client-side offline persistence on reload
    try {
      const saved = localStorage.getItem("football_global_store");
      if (saved) {
        this.data = JSON.parse(saved);
        console.log("[Client Store] Hydrated client-side store from localStorage cache");
      }
    } catch (err) {
      console.warn("[Client Store] Failed to hydrate cache from localStorage:", err);
    }
  }

  public getData(): LiveFootballData | null {
    return this.data;
  }

  public getIsSyncing(): boolean {
    return this.isSyncing;
  }

  public getSyncStatus(): string {
    return this.syncStatus;
  }

  /**
   * Subscribe a React component or engine to the Global Store.
   * Returns an unsubscribe cleanup function.
   */
  public subscribe(callback: StoreSubscriber): () => void {
    this.subscribers.add(callback);
    // Notify immediately with current data on subscription
    if (this.data) {
      callback(this.data);
    }
    return () => {
      this.subscribers.delete(callback);
    };
  }

  /**
   * Replace the entire dataset in the store and notify every subscriber instantly.
   */
  public updateStore(newData: LiveFootballData) {
    this.data = newData;
    this.isSyncing = false;
    
    try {
      localStorage.setItem("football_global_store", JSON.stringify(newData));
    } catch (err) {
      console.warn("[Client Store] Failed to write store to localStorage:", err);
    }

    console.log("[Client Store] Global store refreshed. Notifying all subscribers...");
    console.log("Subscribers updated"); // Match required logs
    
    this.subscribers.forEach((callback) => {
      try {
        callback(newData);
      } catch (err) {
        console.error("[Client Store] Error notifying subscriber:", err);
      }
    });
  }

  /**
   * Starts a single synchronized Search Sync process.
   * Returns a promise. Implements Request Deduplication and Concurrent Protection.
   */
  public async sync(contenders: Contender[], setClientStatus?: (status: string) => void): Promise<LiveFootballData> {
    // Concurrent Protection: Reject new requests if already syncing
    if (this.isSyncing && !this.currentSyncPromise) {
      console.log("API requests prevented (Concurrent protection on client side)");
      throw new Error("Football data is already synchronizing...");
    }

    // Request Deduplication: Return active promise to any simultaneous callers
    if (this.currentSyncPromise) {
      console.log("API requests prevented (Client-side request deduplication returned active promise)");
      return this.currentSyncPromise;
    }

    const updateStatus = (status: string) => {
      this.syncStatus = status;
      if (setClientStatus) setClientStatus(status);
    };

    this.isSyncing = true;
    updateStatus("🛰️ Establishing live crawler connection to Football-Data.org...");

    this.currentSyncPromise = (async () => {
      try {
        await new Promise(r => setTimeout(r, 600));
        updateStatus("⚡ Fetching live match outcomes from Football-Data.org as of June 2026...");

        const response = await fetch(`/api/fetch-live-data?contenders=${encodeURIComponent(JSON.stringify(contenders))}`);
        if (!response.ok) {
          throw new Error("Football data API Sync could not be reached.");
        }

        const result: LiveFootballData = await response.json();
        
        // Populate the client store with the newly fetched data
        this.updateStore(result);
        
        return result;
      } catch (err: any) {
        this.isSyncing = false;
        console.error("[Client Store] Sync failed:", err);
        throw err;
      } finally {
        this.currentSyncPromise = null;
        this.isSyncing = false;
      }
    })();

    return this.currentSyncPromise;
  }
}

// Global Singleton instance of Client Football Store
export const footballStore = new ClientFootballStore();

/**
 * React Hook for subscribing any component/widget to the Global Football Store.
 * Triggers automatic re-render when the synchronized dataset updates.
 */
export function useFootballStore() {
  const [data, setData] = useState<LiveFootballData | null>(footballStore.getData());
  const [isSyncing, setIsSyncing] = useState(footballStore.getIsSyncing());
  const [syncStatus, setSyncStatus] = useState(footballStore.getSyncStatus());

  useEffect(() => {
    // Subscribe to store updates
    const unsubscribe = footballStore.subscribe((newData) => {
      setData(newData);
    });

    // We can also poll or set up an interval to check states if needed
    const interval = setInterval(() => {
      setIsSyncing(footballStore.getIsSyncing());
      setSyncStatus(footballStore.getSyncStatus());
    }, 100);

    return () => {
      unsubscribe();
      clearInterval(interval);
    };
  }, []);

  return { data, isSyncing, syncStatus };
}
