import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import { MobileSubscription } from "./syncClient";

// Configure how notifications are handled when the app is active/foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  } as any),
});

export const notificationHelper = {
  // Request notifications permission from the user
  requestPermission: async (): Promise<boolean> => {
    if (Platform.OS === "web") return false;

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    return finalStatus === "granted";
  },

  // Cancel any scheduled notification for a subscription using its UUID
  cancelNotification: async (uuid: string): Promise<void> => {
    try {
      await Notifications.cancelScheduledNotificationAsync(uuid);
    } catch (e) {
      console.warn("Failed to cancel notification for UUID:", uuid, e);
    }
  },

  // Schedule a renewal alert for a subscription
  scheduleNotification: async (
    sub: MobileSubscription,
    leadDays: number = 3
  ): Promise<string | null> => {
    try {
      if (Platform.OS === "web") return null;

      // 1. Ensure permissions are granted
      const hasPermission = await notificationHelper.requestPermission();
      if (!hasPermission) return null;

      // 2. First cancel any existing schedule for this subscription to avoid duplicates
      await notificationHelper.cancelNotification(sub.uuid);

      if (!sub.nextBilledAt) return null;

      // 3. Calculate target notification date
      // nextBilledAt is in YYYY-MM-DD format
      const billingDate = new Date(`${sub.nextBilledAt}T09:00:00`);
      
      // Subtract leadDays (default 3 days)
      const notifyDate = new Date(billingDate);
      notifyDate.setDate(notifyDate.getDate() - leadDays);

      const now = new Date();

      // If the target notification date is in the past, let's adjust it.
      // If the subscription is due soon (e.g. in 1-2 days) and the "3-day warning" is already in the past,
      // but the billing date itself is still in the future, let's notify tomorrow morning (or now)
      if (notifyDate.getTime() <= now.getTime()) {
        if (billingDate.getTime() > now.getTime()) {
          // Notify 10 seconds from now as a catch-up alert if it's due soon
          notifyDate.setTime(now.getTime() + 10000);
        } else {
          // Already fully in the past, skip scheduling
          return null;
        }
      }

      // 4. Schedule local notification
      const symbolSymbol = sub.currency === "USD" ? "$" : "¥";
      const identifier = await Notifications.scheduleNotificationAsync({
        identifier: sub.uuid, // Use the sub's UUID as notification ID
        content: {
          title: "💸 Subdue 自动扣费提醒",
          body: `${sub.name} 将在 ${leadDays === 0 ? "今天" : `${leadDays}天后`}自动续费 ${symbolSymbol}${sub.amount}，如需退订请及时管理！`,
          sound: true,
          data: { subscriptionId: sub.uuid },
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date: notifyDate,
        } as any,
      });

      console.log(`Scheduled alert for ${sub.name} at ${notifyDate.toISOString()}`);
      return identifier;
    } catch (e) {
      console.error("Error scheduling notification for subscription:", sub.name, e);
      return null;
    }
  },

  // Reschedule all active subscriptions
  rescheduleAll: async (subs: MobileSubscription[], leadDays: number = 3): Promise<void> => {
    if (Platform.OS === "web") return;
    
    // Cancel all existing scheduled notifications
    await Notifications.cancelAllScheduledNotificationsAsync();
    
    // Filter active (non-deleted, active status)
    const active = subs.filter(s => s.isDeleted === 0 && s.status === "active");
    
    for (const sub of active) {
      await notificationHelper.scheduleNotification(sub, leadDays);
    }
  }
};
