import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Platform,
  Alert,
} from "react-native";
import { useIsFocused } from "@react-navigation/native";
import { syncClient, MobileSubscription } from "../../services/syncClient";
import { calculateNextBilling } from "../../services/billingCalculator";
import { SymbolView } from "expo-symbols";

export default function TabOneScreen() {
  const [subscriptions, setSubscriptions] = useState<MobileSubscription[]>([]);
  const isFocused = useIsFocused();

  const loadData = async () => {
    const subs = await syncClient.getLocalSubscriptions();
    
    // Compute billing dates and sorting parameter
    const updated = subs.map(sub => {
      const calc = calculateNextBilling(sub.firstBilledAt, sub.cycle);
      return {
        ...sub,
        nextBilledAt: calc.nextBilledAt,
        daysLeft: calc.daysLeft
      };
    });
    
    // Filter out deleted and sort by daysLeft ascending
    const active = updated
      .filter(s => s.isDeleted !== 1)
      .sort((a, b) => (a.daysLeft ?? 999) - (b.daysLeft ?? 999));
      
    setSubscriptions(active);
  };

  // Reload data when screen is focused (so screenshot OCR updates list automatically)
  useEffect(() => {
    if (isFocused) {
      loadData();
    }
  }, [isFocused]);

  const getMonthlyTotalCNY = () => {
    let total = 0;
    subscriptions.forEach(sub => {
      let monthlyAmount = sub.amount;
      if (sub.cycle === "年") {
        monthlyAmount = sub.amount / 12;
      } else if (sub.cycle === "周") {
        monthlyAmount = sub.amount * 4.33;
      }
      
      if (sub.currency === "USD") {
        total += monthlyAmount * 7.25; // 7.25 exchange rate
      } else {
        total += monthlyAmount;
      }
    });
    return total.toFixed(2);
  };

  const getMonthlyTotalUSD = () => {
    return (parseFloat(getMonthlyTotalCNY()) / 7.25).toFixed(2);
  };

  const handleDelete = (sub: MobileSubscription) => {
    Alert.alert(
      "删除订阅",
      `您确定要删除 ${sub.name} 吗？`,
      [
        { text: "取消", style: "cancel" },
        {
          text: "确定删除",
          style: "destructive",
          onPress: async () => {
            const allSubs = await syncClient.getLocalSubscriptions();
            const index = allSubs.findIndex(s => s.uuid === sub.uuid);
            if (index >= 0) {
              allSubs[index].isDeleted = 1;
              allSubs[index].updatedAt = new Date().toISOString();
              await syncClient.saveLocalSubscriptions(allSubs);
              await loadData();
            }
          }
        }
      ]
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Estimated Expenses Card */}
      <View style={styles.glassCard}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardSubtitle}>🗓️ 本月预计订阅支出 (已折算月付)</Text>
          <SymbolView name="chart.pie.fill" tintColor="#F5A623" size={16} />
        </View>
        <View style={styles.statsContainer}>
          <Text style={styles.primaryAmountText}>¥ {getMonthlyTotalCNY()}</Text>
          <Text style={styles.secondaryAmountText}>≈ $ {getMonthlyTotalUSD()}</Text>
        </View>
        <View style={styles.statsDivider} />
        <View style={styles.metaRow}>
          <Text style={styles.metaText}>共监控 {subscriptions.length} 笔服务</Text>
          <Text style={styles.metaText}>
            {subscriptions.filter(s => s.currency === "USD").length} 笔外币支出
          </Text>
        </View>
      </View>

      {/* Category distribution */}
      {subscriptions.length > 0 && (
        <View style={styles.categoryContainer}>
          {Array.from(new Set(subscriptions.map(s => s.category))).map(cat => {
            const count = subscriptions.filter(s => s.category === cat).length;
            return (
              <View key={cat} style={styles.categoryBadge}>
                <Text style={styles.categoryBadgeText}>{cat} ({count})</Text>
              </View>
            );
          })}
        </View>
      )}

      {/* Subscriptions detail list */}
      <View style={styles.glassCard}>
        <Text style={styles.cardTitle}>🗂 手机本地账单明细 ({subscriptions.length})</Text>
        
        {subscriptions.map(item => {
          const isUrgent = (item.daysLeft ?? 99) <= 5;
          return (
            <TouchableOpacity 
              key={item.uuid} 
              style={styles.subRow} 
              onLongPress={() => handleDelete(item)}
              activeOpacity={0.7}
            >
              <View style={styles.subInfo}>
                <Text style={styles.subName}>{item.name}</Text>
                <View style={styles.subMetaContainer}>
                  <View style={[styles.dotIndicator, { backgroundColor: item.currency === "USD" ? "#5B8DEF" : "#2ED573" }]} />
                  <Text style={styles.subMeta}>{item.category} · {item.cycle}付</Text>
                </View>
              </View>
              <View style={styles.subPrice}>
                <Text style={styles.subAmount}>
                  {item.currency === "USD" ? "$" : "¥"}{item.amount}
                </Text>
                <View style={[styles.daysBadge, isUrgent ? styles.daysBadgeUrgent : styles.daysBadgeNormal]}>
                  <Text style={[styles.daysBadgeText, isUrgent ? styles.daysTextUrgent : styles.daysTextNormal]}>
                    {item.daysLeft === 0 ? "今天到期" : `${item.daysLeft}天后扣款`}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          );
        })}

        {subscriptions.length === 0 && (
          <View style={styles.emptyContainer}>
            <SymbolView name="creditcard" tintColor="#54596A" size={40} />
            <Text style={styles.emptyText}>手机端暂无订阅账单</Text>
            <Text style={styles.emptySubtext}>请在 [同步与助手] 选项卡中上传截图或连接电脑同步账单</Text>
          </View>
        )}
      </View>
      
      <Text style={styles.footerHint}>💡 长按账单行可以删除该订阅</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#07090F",
  },
  content: {
    padding: 20,
    paddingTop: 16,
    paddingBottom: 40,
    gap: 16,
  },
  glassCard: {
    backgroundColor: "#0D1018",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
    borderRadius: 16,
    padding: 18,
    gap: 14,
  },
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
  cardTitle: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#E2E6EF",
    marginBottom: 4,
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
    fontFamily: Platform.OS === 'ios' ? "Courier-Bold" : "System",
  },
  secondaryAmountText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#8B93A1",
  },
  statsDivider: {
    height: 1,
    backgroundColor: "rgba(255,255,255,0.06)",
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
  categoryContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    paddingHorizontal: 2,
  },
  categoryBadge: {
    backgroundColor: "#111520",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  categoryBadgeText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#8B93A1",
  },
  subRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.06)",
  },
  subInfo: {
    gap: 5,
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
    backgroundColor: "rgba(255,255,255,0.04)",
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
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
    gap: 12,
  },
  emptyText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#E2E6EF",
  },
  emptySubtext: {
    fontSize: 11,
    color: "#54596A",
    textAlign: "center",
    lineHeight: 16,
    paddingHorizontal: 20,
  },
  footerHint: {
    textAlign: "center",
    color: "#54596A",
    fontSize: 11,
    marginTop: 8,
  },
});
