/**
 * Calculates the next billing date and the number of days left until the next bill.
 * 
 * @param {string} firstBilledAtStr - Date string in format YYYY-MM-DD
 * @param {string} cycle - "周" | "月" | "季" | "年"
 * @returns {Object} { nextBilledAt: "YYYY-MM-DD", daysLeft: number }
 */
export function calculateNextBilling(firstBilledAtStr, cycle) {
  if (!firstBilledAtStr) {
    const todayStr = new Date().toISOString().split("T")[0];
    return { nextBilledAt: todayStr, daysLeft: 0 };
  }

  // Parse date string in local timezone
  const [year, month, day] = firstBilledAtStr.split("-").map(Number);
  // Note: JS Date constructor uses 0-based month, so month - 1
  const firstBilledAt = new Date(year, month - 1, day);
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (firstBilledAt >= today) {
    const timeDiff = firstBilledAt.getTime() - today.getTime();
    const daysLeft = Math.ceil(timeDiff / (24 * 60 * 60 * 1000));
    return {
      nextBilledAt: formatDate(firstBilledAt),
      daysLeft: daysLeft,
    };
  }

  let temp = new Date(firstBilledAt);
  
  // Safe limit to avoid infinite loops in case of any data anomalies
  let limit = 0;
  while (temp < today && limit < 1000) {
    limit++;
    if (cycle === "周") {
      temp.setDate(temp.getDate() + 7);
    } else if (cycle === "月") {
      temp.setMonth(temp.getMonth() + 1);
    } else if (cycle === "季") {
      temp.setMonth(temp.getMonth() + 3);
    } else if (cycle === "年") {
      temp.setFullYear(temp.getFullYear() + 1);
    } else {
      temp.setMonth(temp.getMonth() + 1);
    }
  }

  const timeDiff = temp.getTime() - today.getTime();
  const daysLeft = Math.ceil(timeDiff / (24 * 60 * 60 * 1000));

  return {
    nextBilledAt: formatDate(temp),
    daysLeft: daysLeft,
  };
}

// Helper to format Date object into YYYY-MM-DD
function formatDate(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

// Helper to convert cycle types to Chinese text
export const CYCLE_TEXT = {
  "周": "每周",
  "月": "每月",
  "季": "每季",
  "年": "每年"
};
