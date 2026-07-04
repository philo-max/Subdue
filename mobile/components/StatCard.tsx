import React from "react";
import { StyleSheet, Text, View, Platform } from "react-native";
import { SymbolView } from "expo-symbols";
import { GlassCard } from "./GlassCard";

interface StatCardProps {
  totalCNY: string;
  totalUSD: string;
  totalCount: number;
  foreignCount: number;
}

export function StatCard({ totalCNY, totalUSD, totalCount, foreignCount }: StatCardProps) {
  return (
    <GlassCard>
      <View style={styles.cardHeader}>
        <Text style={styles.cardSubtitle}>🗓️ 本月预计订阅支出 (已折算月付)</Text>
        <SymbolView name="chart.pie.fill" tintColor="#F5A623" size={16} />
      </View>
      <View style={styles.statsContainer}>
        <Text style={styles.primaryAmountText}>¥ {totalCNY}</Text>
        <Text style={styles.secondaryAmountText}>≈ $ {totalUSD}</Text>
      </View>
      <View style={styles.statsDivider} />
      <View style={styles.metaRow}>
        <Text style={styles.metaText}>共监控 {totalCount} 笔服务</Text>
        <Text style={styles.metaText}>
          {foreignCount} 笔外币支出
        </Text>
      </View>
    </GlassCard>
  );
}

const styles = StyleSheet.create({
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cardSubtitle: {
    fontSize: 11,
    fontWeight: "600",
    color: "#8B93A1",
    letterSpacing: 0.5,
  },
  statsContainer: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 10,
    marginVertical: 4,
  },
  primaryAmountText: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#F5A623",
    fontFamily: Platform.OS === "ios" ? "Courier-Bold" : "System",
  },
  secondaryAmountText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#8B93A1",
  },
  statsDivider: {
    height: 1,
    backgroundColor: "rgba(255, 255, 255, 0.06)",
  },
  metaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  metaText: {
    fontSize: 11,
    color: "#54596A",
    fontWeight: "500",
  },
});
