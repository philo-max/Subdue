import AsyncStorage from "@react-native-async-storage/async-storage";
import { calculateNextBilling } from "./billingCalculator";

const SUBS_STORAGE_KEY = "@subdue_subscriptions";
const DEVICE_INFO_KEY = "@subdue_device_name";

export interface MobileSubscription {
  uuid: string;
  name: string;
  amount: number;
  currency: string;
  cycle: string;
  category: string;
  status: "active" | "cancelled";
  firstBilledAt: string;
  nextBilledAt?: string;
  daysLeft?: number;
  notes?: string;
  isDeleted: number; // 0 = active, 1 = deleted
  createdAt: string;
  updatedAt: string;
}

export const syncClient = {
  // Get device name for pairing identity
  getDeviceName: async (): Promise<string> => {
    const name = await AsyncStorage.getItem(DEVICE_INFO_KEY);
    return name || "iPhone 15 Pro (My Mobile)";
  },

  // Save device name
  setDeviceName: async (name: string): Promise<void> => {
    await AsyncStorage.setItem(DEVICE_INFO_KEY, name);
  },

  // Fetch local subscriptions on mobile
  getLocalSubscriptions: async (): Promise<MobileSubscription[]> => {
    try {
      const data = await AsyncStorage.getItem(SUBS_STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error("Failed to load local mobile subscriptions", e);
      return [];
    }
  },

  // Save full list of subscriptions locally on mobile
  saveLocalSubscriptions: async (subs: MobileSubscription[]): Promise<void> => {
    await AsyncStorage.setItem(SUBS_STORAGE_KEY, JSON.stringify(subs));
  },

  /**
   * Mobile side double-directional LWW (Last-Write-Wins) merging engine.
   * Merges remote PC records into mobile AsyncStorage database.
   * 
   * @param {Array<MobileSubscription>} remoteRecords - Subscriptions received from PC client
   * @returns {Promise<Object>} { mergedCount: number, localUpdatesToSend: Array }
   */
  mergeWithPCRecords: async (remoteRecords: MobileSubscription[]) => {
    const localRecords = await syncClient.getLocalSubscriptions();
    const localMap = new Map(localRecords.map(r => [r.uuid, r]));
    const remoteMap = new Map(remoteRecords.map(r => [r.uuid, r]));

    const mergedList = [...localRecords];
    let mergedCount = 0;
    const localUpdatesToSend: MobileSubscription[] = [];

    // 1. Process remote records
    for (const remote of remoteRecords) {
      const localIndex = mergedList.findIndex(l => l.uuid === remote.uuid);
      const local = localIndex >= 0 ? mergedList[localIndex] : null;

      if (!local) {
        // Not found locally -> Add it
        mergedList.push(remote);
        mergedCount++;
      } else {
        // Exists on both sides -> compare timestamps
        const localTime = new Date(local.updatedAt).getTime();
        const remoteTime = new Date(remote.updatedAt).getTime();

        if (remoteTime > localTime) {
          // Remote is newer -> Overwrite local
          mergedList[localIndex] = remote;
          mergedCount++;
        } else if (localTime > remoteTime) {
          // Local is newer -> Queue local updates to send back to PC
          localUpdatesToSend.push(local);
        }
      }
    }

    // 2. Process local records -> check if remote is missing them
    for (const local of localRecords) {
      const remote = remoteMap.get(local.uuid);
      if (!remote) {
        // PC doesn't have this record -> Send it to PC
        localUpdatesToSend.push(local);
      }
    }

    // 3. Save merged results in mobile database
    await syncClient.saveLocalSubscriptions(mergedList);

    return {
      mergedCount,
      localUpdatesToSend,
    };
  },

  /**
   * Simulates scanning a QR Code presented by the PC client.
   * Resolves the IP address and begins pairing.
   * 
   * @param {string} code - The QR passcode, e.g. "489-021"
   * @returns {Promise<string>} Paired target PC device info
   */
  simulateQRPairing: async (code: string): Promise<{ success: boolean, pcDevice: string }> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        if (code === "489-021") {
          resolve({ success: true, pcDevice: "Subdue Dashboard (My Desktop)" });
        } else {
          resolve({ success: false, pcDevice: "" });
        }
      }, 1000);
    });
  }
};
