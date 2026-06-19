import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Platform,
  Alert,
  Modal,
  TextInput,
} from "react-native";
import { useIsFocused } from "@react-navigation/native";
import { syncClient, MobileSubscription } from "../../services/syncClient";
import { calculateNextBilling } from "../../services/billingCalculator";
import { SymbolView } from "expo-symbols";
import { notificationHelper } from "../../services/notificationHelper";

const CATEGORIES = ["流媒体", "软件服务", "AI工具", "日常打卡", "其他"];
const CURRENCIES = ["CNY", "USD", "HKD"];
const CYCLES = ["月", "年", "周", "季"];

// Built-in presets for quick autocomplete
const SERVICE_PRESETS = [
  { name: "Netflix", category: "流媒体", defaultAmount: 35, currency: "CNY", cycle: "月" },
  { name: "Spotify", category: "流媒体", defaultAmount: 15, currency: "CNY", cycle: "月" },
  { name: "iCloud", category: "软件服务", defaultAmount: 6, currency: "CNY", cycle: "月" },
  { name: "ChatGPT Plus", category: "AI工具", defaultAmount: 20, currency: "USD", cycle: "月" },
  { name: "YouTube Premium", category: "流媒体", defaultAmount: 22, currency: "USD", cycle: "月" },
  { name: "Nintendo Switch Online", category: "其他", defaultAmount: 155, currency: "HKD", cycle: "年" },
];

export default function TabOneScreen() {
  const [subscriptions, setSubscriptions] = useState<MobileSubscription[]>([]);
  const isFocused = useIsFocused();

  // Add Form Modal States
  const [modalVisible, setModalVisible] = useState(false);
  const [formName, setFormName] = useState("");
  const [formAmount, setFormAmount] = useState("");
  const [formCurrency, setFormCurrency] = useState("CNY");
  const [formCycle, setFormCycle] = useState("月");
  const [formCategory, setFormCategory] = useState("流媒体");
  const [formDate, setFormDate] = useState("");
  const [formNotes, setFormNotes] = useState("");

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
    
    // Automatically reschedule all notifications for active subs to keep scheduling in sync
    await notificationHelper.rescheduleAll(active);
  };

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

  // Autocomplete auto-fill when input matches presets
  const handleNameChange = (text: string) => {
    setFormName(text);
    const match = SERVICE_PRESETS.find(p => p.name.toLowerCase() === text.trim().toLowerCase());
    if (match) {
      setFormCategory(match.category);
      setFormAmount(match.defaultAmount.toString());
      setFormCurrency(match.currency);
      setFormCycle(match.cycle);
    }
  };

  const resetForm = () => {
    setFormName("");
    setFormAmount("");
    setFormCurrency("CNY");
    setFormCycle("月");
    setFormCategory("流媒体");
    
    // Default date to today in YYYY-MM-DD
    const today = new Date().toISOString().split("T")[0];
    setFormDate(today);
    setFormNotes("");
  };

  const handleOpenAddModal = () => {
    resetForm();
    setModalVisible(true);
  };

  const handleSave = async () => {
    if (!formName.trim()) {
      Alert.alert("输入错误", "请输入服务名称");
      return;
    }
    const parsedAmount = parseFloat(formAmount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      Alert.alert("输入错误", "请输入有效的扣款金额");
      return;
    }
    
    // Date regex check YYYY-MM-DD
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(formDate)) {
      Alert.alert("输入错误", "首次扣款日期格式必须为 YYYY-MM-DD (例如 2026-06-19)");
      return;
    }

    const uuid = `mobile-manual-${Date.now()}`;
    const newSub: MobileSubscription = {
      uuid,
      name: formName.trim(),
      amount: parsedAmount,
      currency: formCurrency,
      cycle: formCycle,
      category: formCategory,
      firstBilledAt: formDate,
      status: "active",
      isDeleted: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      notes: formNotes.trim() || undefined,
    };

    try {
      const allSubs = await syncClient.getLocalSubscriptions();
      const updated = [newSub, ...allSubs];
      await syncClient.saveLocalSubscriptions(updated);
      
      // Schedule local notification immediately for the new subscription
      const calc = calculateNextBilling(newSub.firstBilledAt, newSub.cycle);
      const subWithNextBilling = { ...newSub, nextBilledAt: calc.nextBilledAt };
      await notificationHelper.scheduleNotification(subWithNextBilling, 3);

      await loadData();
      setModalVisible(false);
      Alert.alert("🎉 保存成功", `已成功添加订阅：${newSub.name}`);
    } catch (e) {
      console.error("Failed to save subscription", e);
      Alert.alert("错误", "保存失败，请重试");
    }
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
              
              // Physically cancel the scheduled notification
              await notificationHelper.cancelNotification(sub.uuid);

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
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>🗂 手机本地账单明细 ({subscriptions.length})</Text>
          <View style={styles.actionHeaderButtons}>
            <TouchableOpacity style={styles.btnHeaderAdd} onPress={handleOpenAddModal}>
              <Text style={styles.btnHeaderAddText}>+ 新增</Text>
            </TouchableOpacity>
          </View>
        </View>
        
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
            <Text style={styles.emptySubtext}>点击右上角 [+ 新增] 手动录入，或在 [同步与助手] 选项卡中上传截图及连接电脑同步</Text>
          </View>
        )}
      </View>
      
      <Text style={styles.footerHint}>💡 长按账单行可以删除该订阅并取消到期推送</Text>

      {/* Manual记账 Add Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>💸 新增订阅账单</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <SymbolView name="xmark" tintColor="#8B93A1" size={18} />
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.modalForm} keyboardShouldPersistTaps="handled">
              {/* Name */}
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>服务名称</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="例如 Netflix, ChatGPT (支持输入补全)"
                  placeholderTextColor="#54596A"
                  value={formName}
                  onChangeText={handleNameChange}
                />
              </View>

              {/* Amount & Currency */}
              <View style={styles.formRow}>
                <View style={[styles.formGroup, { flex: 2 }]}>
                  <Text style={styles.formLabel}>扣款金额</Text>
                  <TextInput
                    style={styles.formInput}
                    placeholder="输入金额 (如 35)"
                    placeholderTextColor="#54596A"
                    value={formAmount}
                    onChangeText={setFormAmount}
                    keyboardType="numeric"
                  />
                </View>
                <View style={[styles.formGroup, { flex: 1.2 }]}>
                  <Text style={styles.formLabel}>币种</Text>
                  <View style={styles.toggleRow}>
                    {CURRENCIES.map(curr => (
                      <TouchableOpacity
                        key={curr}
                        style={[styles.toggleBtn, formCurrency === curr ? styles.toggleBtnActive : null]}
                        onPress={() => setFormCurrency(curr)}
                      >
                        <Text style={[styles.toggleText, formCurrency === curr ? styles.toggleTextActive : null]}>
                          {curr}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              </View>

              {/* Cycle & Category */}
              <View style={styles.formRow}>
                <View style={{ flex: 1.3 }}>
                  <Text style={styles.formLabel}>扣款周期</Text>
                  <View style={styles.toggleRow}>
                    {CYCLES.map(c => (
                      <TouchableOpacity
                        key={c}
                        style={[styles.toggleBtn, formCycle === c ? styles.toggleBtnActive : null]}
                        onPress={() => setFormCycle(c)}
                      >
                        <Text style={[styles.toggleText, formCycle === c ? styles.toggleTextActive : null]}>
                          {c}付
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                <View style={{ flex: 1.7 }}>
                  <Text style={styles.formLabel}>首次扣款日</Text>
                  <TextInput
                    style={styles.formInput}
                    placeholder="YYYY-MM-DD"
                    placeholderTextColor="#54596A"
                    value={formDate}
                    onChangeText={setFormDate}
                  />
                </View>
              </View>

              {/* Category selector */}
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>账单分类</Text>
                <View style={styles.toggleRow}>
                  {CATEGORIES.map(cat => (
                    <TouchableOpacity
                      key={cat}
                      style={[styles.toggleBtn, formCategory === cat ? styles.toggleBtnActive : null, { paddingHorizontal: 10 }]}
                      onPress={() => setFormCategory(cat)}
                    >
                      <Text style={[styles.toggleText, formCategory === cat ? styles.toggleTextActive : null]}>
                        {cat}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Notes */}
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>备注 (选填)</Text>
                <TextInput
                  style={[styles.formInput, { height: 60, textAlignVertical: "top", paddingTop: 10 }]}
                  placeholder="填写备注信息..."
                  placeholderTextColor="#54596A"
                  value={formNotes}
                  onChangeText={setFormNotes}
                  multiline={true}
                />
              </View>

              {/* Save Button */}
              <TouchableOpacity style={styles.btnSave} onPress={handleSave}>
                <Text style={styles.btnSaveText}>📥 保存账单并开启到期提醒</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
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
  actionHeaderButtons: {
    flexDirection: "row",
    gap: 12,
  },
  btnHeaderAdd: {
    backgroundColor: "#F5A623",
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 6,
  },
  btnHeaderAddText: {
    color: "#07090F",
    fontSize: 11,
    fontWeight: "bold",
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

  // Modal styling
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(7, 9, 15, 0.8)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#0D1018",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    maxHeight: "85%",
    padding: 20,
    gap: 16,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.06)",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#E2E6EF",
  },
  modalForm: {
    gap: 14,
    paddingBottom: 24,
  },
  formGroup: {
    gap: 6,
  },
  formRow: {
    flexDirection: "row",
    gap: 14,
  },
  formLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#8B93A1",
  },
  formInput: {
    backgroundColor: "#111520",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    borderRadius: 10,
    color: "#E2E6EF",
    height: 44,
    paddingHorizontal: 12,
    fontSize: 14,
  },
  toggleRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    backgroundColor: "#111520",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    borderRadius: 10,
    padding: 2,
    gap: 2,
  },
  toggleBtn: {
    flex: 1,
    minWidth: 40,
    height: 38,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  toggleBtnActive: {
    backgroundColor: "#F5A623",
  },
  toggleText: {
    color: "#8B93A1",
    fontSize: 12,
    fontWeight: "600",
  },
  toggleTextActive: {
    color: "#07090F",
  },
  btnSave: {
    backgroundColor: "#F5A623",
    borderRadius: 12,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
  },
  btnSaveText: {
    color: "#07090F",
    fontSize: 14,
    fontWeight: "bold",
  },
});
