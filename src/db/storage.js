import Dexie from "dexie";

// Initialize Dexie Database
export const db = new Dexie("SubdueDatabase");

// Upgrade schema to Version 2 to support sync fields (uuid, isDeleted)
db.version(2).stores({
  subscriptions: "++id, uuid, name, amount, currency, cycle, category, status, firstBilledAt, nextBilledAt, isDeleted, updatedAt",
});

// Helper for generating UUIDs safely
const generateUUID = () => {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  // Fallback simple generator
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0,
      v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

// Helper functions for Subscriptions CRUD (with Soft Delete & Sync Support)
export const storage = {
  // Get all active (non-deleted) subscriptions
  getAllSubscriptions: async () => {
    return await db.subscriptions.where("isDeleted").notEqual(1).toArray();
  },

  // Get all subscriptions (including soft-deleted ones) - for sync purposes
  getSyncRecords: async () => {
    return await db.subscriptions.toArray();
  },

  // Add new subscription
  addSubscription: async (sub) => {
    const nowStr = new Date().toISOString();
    const id = await db.subscriptions.add({
      uuid: sub.uuid || generateUUID(),
      name: sub.name,
      amount: Number(sub.amount),
      currency: sub.currency || "CNY",
      cycle: sub.cycle || "月",
      category: sub.category || "其他",
      status: sub.status || "active",
      firstBilledAt: sub.firstBilledAt || nowStr.split("T")[0],
      nextBilledAt: sub.nextBilledAt || "",
      notes: sub.notes || "",
      isDeleted: 0, // 0 = active, 1 = soft-deleted
      createdAt: sub.createdAt || nowStr,
      updatedAt: sub.updatedAt || nowStr,
    });
    return id;
  },

  // Update subscription details
  updateSubscription: async (id, updates) => {
    return await db.subscriptions.update(id, {
      ...updates,
      updatedAt: new Date().toISOString(),
    });
  },

  // Soft delete a subscription (sets isDeleted to 1) so it propagates on sync
  deleteSubscription: async (id) => {
    return await db.subscriptions.update(id, {
      isDeleted: 1,
      updatedAt: new Date().toISOString(),
    });
  },

  // Directly save or overwrite a raw record (used by sync engine to apply remote records)
  saveRawRecord: async (record) => {
    // Find if a record with the same UUID already exists
    const existing = await db.subscriptions.where("uuid").equals(record.uuid).first();
    if (existing) {
      await db.subscriptions.update(existing.id, {
        ...record,
        id: existing.id, // preserve local primary key
      });
    } else {
      // Clean up primary key if present in remote to avoid conflicts
      const { id, ...cleanRecord } = record;
      await db.subscriptions.add(cleanRecord);
    }
  },

  // Clear all data (physical wipe)
  clearAllData: async () => {
    await db.subscriptions.clear();
  },

  // Import subscriptions from JSON file (wipes and sets up UUIDs)
  importSubscriptions: async (subsList) => {
    await db.subscriptions.clear();
    const nowStr = new Date().toISOString();
    const formatted = subsList.map((sub) => ({
      uuid: sub.uuid || generateUUID(),
      name: sub.name,
      amount: Number(sub.amount),
      currency: sub.currency || "CNY",
      cycle: sub.cycle || "月",
      category: sub.category || "其他",
      status: sub.status || "active",
      firstBilledAt: sub.firstBilledAt || nowStr.split("T")[0],
      nextBilledAt: sub.nextBilledAt || "",
      notes: sub.notes || "",
      isDeleted: sub.isDeleted || 0,
      createdAt: sub.createdAt || nowStr,
      updatedAt: sub.updatedAt || nowStr,
    }));
    await db.subscriptions.bulkAdd(formatted);
  },
};

// System Settings stored in LocalStorage for synchronous startup access
const SETTINGS_KEY = "subdue_settings";
const DEFAULT_SETTINGS = {
  primaryCurrency: "CNY",
  reminderDays: 3,
  theme: "dark",
  locale: "zh",
};

export const settingsStorage = {
  get: () => {
    try {
      const saved = localStorage.getItem(SETTINGS_KEY);
      return saved ? { ...DEFAULT_SETTINGS, ...JSON.parse(saved) } : DEFAULT_SETTINGS;
    } catch (e) {
      console.error("Failed to load settings from localStorage", e);
      return DEFAULT_SETTINGS;
    }
  },

  set: (newSettings) => {
    try {
      const current = settingsStorage.get();
      const updated = { ...current, ...newSettings };
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(updated));
      return updated;
    } catch (e) {
      console.error("Failed to save settings to localStorage", e);
      return DEFAULT_SETTINGS;
    }
  },
};
