import React from "react";
import { StyleSheet, Text, View, TouchableOpacity } from "react-native";
import { MobileSubscription } from "../services/syncClient";

interface SubscriptionRowProps {
  item: MobileSubscription;
  onLongPress: (sub: MobileSubscription) => void;
  onPress?: (sub: MobileSubscription) => void;
}

export function SubscriptionRow({ item, onLongPress, onPress }: SubscriptionRowProps) {
  const isUrgent = (item.daysLeft ?? 99) <= 5;
  const currencySymbol = item.currency === "USD" ? "$" : item.currency === "HKD" ? "HK$" : "¥";
  const indicatorColor = item.currency === "USD" ? "#5B8DEF" : item.currency === "HKD" ? "#A55EEA" : "#2ED573";

  return (
    <TouchableOpacity
      style={styles.subRow}
      onLongPress={() => onLongPress(item)}
      onPress={onPress ? () => onPress(item) : undefined}
      activeOpacity={0.7}
      delayLongPress={600}
    >
      <View style={styles.subInfo}>
        <Text style={styles.subName}>{item.name}</Text>
        <View style={styles.subMetaContainer}>
          <View style={[styles.dotIndicator, { backgroundColor: indicatorColor }]} />
          <Text style={styles.subMeta}>
            {item.category} · {item.cycle}付
          </Text>
        </View>
      </View>
      <View style={styles.subPrice}>
        <Text style={styles.subAmount}>
          {currencySymbol}
          {item.amount}
        </Text>
        <View style={[styles.daysBadge, isUrgent ? styles.daysBadgeUrgent : styles.daysBadgeNormal]}>
          <Text style={[styles.daysBadgeText, isUrgent ? styles.daysTextUrgent : styles.daysTextNormal]}>
            {item.daysLeft === 0 ? "今天到期" : `${item.daysLeft}天后扣款`}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  subRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.06)",
  },
  subInfo: {
    gap: 5,
    flex: 1,
  },
  subName: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#E2E6EF",
  },
  subMetaContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  dotIndicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  subMeta: {
    fontSize: 12,
    color: "#6B7280",
  },
  subPrice: {
    alignItems: "flex-end",
    gap: 5,
  },
  subAmount: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#E2E6EF",
  },
  daysBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  daysBadgeNormal: {
    backgroundColor: "rgba(255, 255, 255, 0.04)",
  },
  daysBadgeUrgent: {
    backgroundColor: "rgba(255, 71, 87, 0.12)",
  },
  daysBadgeText: {
    fontSize: 10,
    fontWeight: "700",
  },
  daysTextNormal: {
    color: "#8B93A1",
  },
  daysTextUrgent: {
    color: "#FF4757",
  },
});
