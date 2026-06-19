export const notificationService = {
  // Check if browser notifications are supported
  isSupported: () => {
    return "Notification" in window;
  },

  // Get current permission status
  getPermission: () => {
    if (!notificationService.isSupported()) return "unsupported";
    return Notification.permission;
  },

  // Request browser notification permission
  requestPermission: async () => {
    if (!notificationService.isSupported()) return "unsupported";
    try {
      const permission = await Notification.requestPermission();
      return permission;
    } catch (e) {
      console.error("Failed to request notification permission", e);
      return "default";
    }
  },

  // Trigger standard browser notification
  sendNotification: (title, body) => {
    if (!notificationService.isSupported()) return false;
    
    if (Notification.permission === "granted") {
      try {
        new Notification(title, {
          body,
          icon: "/favicon.ico", // Optional logo fallback
        });
        return true;
      } catch (e) {
        console.error("Failed to trigger browser notification object", e);
      }
    }
    return false;
  },

  // Check subscriptions and send notifications for those expiring soon
  // Typically called during app loading / initialization
  checkAndNotify: (subscriptions, reminderDays) => {
    if (Notification.permission !== "granted") return [];

    const triggered = [];
    subscriptions.forEach((sub) => {
      if (sub.status !== "active") return;

      // Notify if a subscription has exactly reminderDays left
      if (sub.daysLeft === reminderDays) {
        const title = `订阅扣款提醒: ${sub.name}`;
        const body = `${sub.name} 将在 ${reminderDays} 天后扣款 ${sub.currency} ${sub.amount}，请注意账户余额或及时取消。`;
        const success = notificationService.sendNotification(title, body);
        if (success) {
          triggered.push(sub.id);
        }
      } else if (sub.daysLeft === 0) {
        const title = `订阅扣款提醒: ${sub.name}`;
        const body = `${sub.name} 将在今天扣款 ${sub.currency} ${sub.amount}。`;
        const success = notificationService.sendNotification(title, body);
        if (success) {
          triggered.push(sub.id);
        }
      }
    });

    return triggered;
  }
};
