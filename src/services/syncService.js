import { storage } from "../db/storage";

// Simulated remote device profiles
export const MOCK_DEVICES = [
  { id: "dev-iphone15", name: "iPhone 15 Pro (My Mobile)", type: "iOS", lastSynced: null },
  { id: "dev-pad", name: "iPad Air", type: "iOS", lastSynced: null }
];

export const syncService = {
  // Sync status state managers
  getSyncStatus: () => {
    const isPaired = localStorage.getItem("subdue_sync_paired") === "true";
    const pairedDevice = localStorage.getItem("subdue_sync_device_name") || "";
    return {
      isPaired,
      pairedDevice,
      pairingCode: isPaired ? null : "489-021",
    };
  },

  setPaired: (deviceName) => {
    localStorage.setItem("subdue_sync_paired", "true");
    localStorage.setItem("subdue_sync_device_name", deviceName);
  },

  disconnect: () => {
    localStorage.removeItem("subdue_sync_paired");
    localStorage.removeItem("subdue_sync_device_name");
  },

  /**
   * Dual-directional sync merging algorithm
   * Merges remote records into local database, and outputs the updated local records to send back.
   * Uses "Last-Write-Wins" (LWW) based on updatedAt timestamps.
   * 
   * @param {Array} remoteRecords - List of remote records
   * @returns {Promise<Object>} { mergedCount: number, localUpdatesToSend: Array }
   */
  mergeRecords: async (remoteRecords) => {
    const localRecords = await storage.getSyncRecords();
    const localMap = new Map(localRecords.map(r => [r.uuid, r]));
    const remoteMap = new Map(remoteRecords.map(r => [r.uuid, r]));
    
    let mergedCount = 0;
    const localUpdatesToSend = [];

    // 1. Process Remote Records -> Apply to Local
    for (const remote of remoteRecords) {
      const local = localMap.get(remote.uuid);

      if (!local) {
        // Record does not exist locally -> Save it
        await storage.saveRawRecord(remote);
        mergedCount++;
      } else {
        // Record exists on both sides -> Compare timestamps
        const localTime = new Date(local.updatedAt).getTime();
        const remoteTime = new Date(remote.updatedAt).getTime();

        if (remoteTime > localTime) {
          // Remote is newer -> Overwrite local
          await storage.saveRawRecord(remote);
          mergedCount++;
        } else if (localTime > remoteTime) {
          // Local is newer -> Queue local updates to send to remote
          localUpdatesToSend.push(local);
        }
      }
    }

    // 2. Process Local Records -> Find what the remote side doesn't have
    for (const local of localRecords) {
      const remote = remoteMap.get(local.uuid);
      if (!remote) {
        // Remote does not have this local record -> Send it to remote
        localUpdatesToSend.push(local);
      }
    }

    return {
      mergedCount,
      localUpdatesToSend,
    };
  },

  /**
   * Generates mock remote update datasets to simulate a sync event.
   * 
   * @param {string} scenarioType - 'added' | 'modified' | 'deleted' | 'both'
   * @param {Array} currentLocalSubs - The current active local subs to base modifications on
   * @returns {Array} Mock remote subscriptions array
   */
  generateMockRemoteData: (scenarioType, currentLocalSubs) => {
    const now = new Date();
    // Simulate mobile update happening 2 minutes after local updates
    const remoteUpdateStr = new Date(now.getTime() + 120000).toISOString(); 
    
    const mockList = [];

    // Always include a few existing records unchanged to simulate static items
    const unchangedCount = Math.min(currentLocalSubs.length, 2);
    for (let i = 0; i < unchangedCount; i++) {
      mockList.push({ ...currentLocalSubs[i] });
    }

    if (scenarioType === "added" || scenarioType === "both") {
      // 1. Mock Added: Mobile user added YouTube Premium
      mockList.push({
        uuid: "mock-uuid-ytpremium-1111",
        name: "YouTube Premium (Mobile Added)",
        amount: 22,
        currency: "USD",
        cycle: "月",
        category: "流媒体",
        status: "active",
        firstBilledAt: now.toISOString().split("T")[0],
        isDeleted: 0,
        createdAt: remoteUpdateStr,
        updatedAt: remoteUpdateStr,
      });
    }

    if (scenarioType === "modified" || scenarioType === "both") {
      // 2. Mock Modified: ChatGPT Plus price changed to 25 USD on mobile
      const chatGPTOpt = currentLocalSubs.find(s => s.name.toLowerCase().includes("chatgpt"));
      if (chatGPTOpt) {
        mockList.push({
          ...chatGPTOpt,
          amount: 25, // Updated price
          currency: "USD",
          notes: "手机端同步更新：价格从 $20 涨到了 $25",
          updatedAt: remoteUpdateStr,
        });
      } else {
        // Fallback mockup if ChatGPT doesn't exist
        mockList.push({
          uuid: "mock-uuid-chatgpt-2222",
          name: "ChatGPT Plus (Mobile Price Change)",
          amount: 25,
          currency: "USD",
          cycle: "月",
          category: "AI工具",
          status: "active",
          firstBilledAt: now.toISOString().split("T")[0],
          isDeleted: 0,
          createdAt: now.toISOString(),
          updatedAt: remoteUpdateStr,
        });
      }
    }

    if (scenarioType === "deleted" || scenarioType === "both") {
      // 3. Mock Deleted: Netflix soft-deleted on mobile
      const netflixOpt = currentLocalSubs.find(s => s.name.toLowerCase().includes("netflix"));
      if (netflixOpt) {
        mockList.push({
          ...netflixOpt,
          isDeleted: 1, // Soft-deleted
          status: "cancelled",
          updatedAt: remoteUpdateStr,
        });
      } else {
        // Fallback mockup if Netflix doesn't exist
        mockList.push({
          uuid: "mock-uuid-netflix-3333",
          name: "Netflix (Mobile Deleted)",
          amount: 35,
          currency: "CNY",
          cycle: "月",
          category: "流媒体",
          status: "cancelled",
          firstBilledAt: now.toISOString().split("T")[0],
          isDeleted: 1,
          createdAt: now.toISOString(),
          updatedAt: remoteUpdateStr,
        });
      }
    }

    return mockList;
  }
};
