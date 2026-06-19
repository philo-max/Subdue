import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  Platform,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { syncClient, MobileSubscription } from "../../services/syncClient";
import { SymbolView } from "expo-symbols";

const SUBS_STORAGE_KEY = "@subdue_subscriptions";

const INITIAL_MOCK_SUBS: MobileSubscription[] = [];

export default function TabTwoScreen() {
  const [pairingCode, setPairingCode] = useState("");
  const [syncStatus, setSyncStatus] = useState("disconnected"); // disconnected, pairing, connected
  const [pairedPC, setPairedPC] = useState("");
  const [deviceName, setDeviceName] = useState("iPhone 15 Pro (My Mobile)");
  const [ocrLoading, setOcrLoading] = useState(false);
  const [ocrStep, setOcrStep] = useState("");

  useEffect(() => {
    const loadInfo = async () => {
      const name = await syncClient.getDeviceName();
      setDeviceName(name);
    };
    loadInfo();
  }, []);

  const handlePairing = async () => {
    if (!pairingCode) {
      Alert.alert("提示", "请输入PC端显示的配对码");
      return;
    }
    setSyncStatus("pairing");
    const result = await syncClient.simulateQRPairing(pairingCode);
    if (result.success) {
      setSyncStatus("connected");
      setPairedPC(result.pcDevice);
      Alert.alert("🎉 配对成功", `已成功与 PC 客户端建立局域网安全加密同步通道！\n设备名：${result.pcDevice}`);
    } else {
      setSyncStatus("disconnected");
      Alert.alert("❌ 配对失败", "配对码错误或连接超时，请在PC设置中核对并重试");
    }
  };

  const handleDisconnect = () => {
    setSyncStatus("disconnected");
    setPairedPC("");
    setPairingCode("");
  };

  const handleSimulateScreenshotOCR = () => {
    setOcrLoading(true);
    setOcrStep("正在分析图片元数据...");
    
    // Step 1
    setTimeout(() => {
      setOcrStep("正在提取图像文字 (OCR)...");
      
      // Step 2
      setTimeout(() => {
        setOcrStep("正在匹配账单名、额与扣款周期...");
        
        // Step 3
        setTimeout(async () => {
          setOcrLoading(false);
          setOcrStep("");
          
          const nowStr = new Date().toISOString();
          const newSub: MobileSubscription = {
            uuid: `mobile-ocr-${Date.now()}`,
            name: "YouTube Premium (截图录入)",
            amount: 22,
            currency: "USD",
            cycle: "月",
            category: "流媒体",
            status: "active",
            firstBilledAt: nowStr.split("T")[0],
            isDeleted: 0,
            createdAt: nowStr,
            updatedAt: nowStr,
            notes: "通过微信扣费管理截图本地智能解析录入"
          };

          const current = await syncClient.getLocalSubscriptions();
          // Avoid duplicates
          if (current.some(s => s.name === newSub.name && s.isDeleted === 0)) {
            Alert.alert("提示", "检测到该服务已存在，未重复添加");
            return;
          }

          const updated = [newSub, ...current];
          await syncClient.saveLocalSubscriptions(updated);
          
          Alert.alert(
            "🎉 截图智能识别成功", 
            "自动检测到账单截图，已录入本地：\n\n📌 服务：YouTube Premium\n💰 金额：$22.00/月\n💡 方式：微信扣费协议解析"
          );
        }, 1200);
      }, 1000);
    }, 800); // Small realistic delays
  };

  const handleResetLocalData = async () => {
    Alert.alert(
      "确认清空",
      "您确定要清除所有手机本地账单并还原为空白状态吗？",
      [
        { text: "取消", style: "cancel" },
        {
          text: "确定清空",
          style: "destructive",
          onPress: async () => {
            await AsyncStorage.setItem(SUBS_STORAGE_KEY, JSON.stringify(INITIAL_MOCK_SUBS));
            Alert.alert("清空成功", "已成功清空本地所有账单数据。");
          }
        }
      ]
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Device Info */}
      <View style={styles.glassCard}>
        <View style={styles.deviceHeader}>
          <SymbolView name="phone.fill" tintColor="#8B93A1" size={18} />
          <Text style={styles.cardSubtitle}>当前设备标识</Text>
        </View>
        <Text style={styles.deviceNameText}>{deviceName}</Text>
      </View>

      {/* Sync pairing panel */}
      <View style={styles.glassCard}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>📡 局域网配对同步</Text>
          <View style={[styles.badge, syncStatus === "connected" ? styles.badgeGreen : styles.badgeAmber]}>
            <Text style={styles.badgeText}>
              {syncStatus === "connected" ? "已连接" : "未配对"}
            </Text>
          </View>
        </View>

        {syncStatus !== "connected" ? (
          <View style={styles.sectionBody}>
            <Text style={styles.helperText}>
              在下方输入桌面网页端 [系统设置 ⇄ 局域网同步] 提供的 6 位安全配对码完成连接。局域网同步无需数据上传云端，保证绝对隐私：
            </Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="输入配对码 (如 489-021)"
                placeholderTextColor="#54596A"
                value={pairingCode}
                onChangeText={setPairingCode}
                keyboardType="numeric"
              />
              <TouchableOpacity
                style={styles.btnConnect}
                onPress={handlePairing}
                disabled={syncStatus === "pairing"}
              >
                {syncStatus === "pairing" ? (
                  <ActivityIndicator size="small" color="#07090F" />
                ) : (
                  <Text style={styles.btnConnectText}>配对</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View style={styles.pairedContainer}>
            <SymbolView name="checkmark.circle.fill" tintColor="#2ED573" size={32} />
            <Text style={styles.pairedText}>局域网通道已加密建立</Text>
            <Text style={styles.pairedDevice}>{pairedPC}</Text>
            <TouchableOpacity style={styles.btnDisconnect} onPress={handleDisconnect}>
              <Text style={styles.btnDisconnectText}>断开配对</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Screenshot Assistant */}
      <View style={styles.glassCard}>
        <Text style={styles.cardTitle}>📸 降低门槛：智能截图录入</Text>
        <Text style={styles.helperText}>
          直接将您微信或支付宝的“自动扣费管理协议”页面截图。App 将在本地运行智能解析，自动提取账单并填充，避免繁琐的手动输入：
        </Text>

        {ocrLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#F5A623" />
            <Text style={styles.loadingStepText}>{ocrStep}</Text>
          </View>
        ) : (
          <TouchableOpacity style={styles.btnOcr} onPress={handleSimulateScreenshotOCR}>
            <SymbolView name="photo.fill.on.rectangle.fill" tintColor="#07090F" size={18} />
            <Text style={styles.btnOcrText}>📸 模拟上传微信自动扣款截图</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Danger Zone */}
      <View style={[styles.glassCard, styles.dangerCard]}>
        <Text style={styles.dangerTitle}>⚠️ 危险区域</Text>
        <Text style={styles.helperText}>清除手机本地 AsyncStorage 中的所有账单数据，恢复纯净空白状态：</Text>
        <TouchableOpacity style={styles.btnReset} onPress={handleResetLocalData}>
          <Text style={styles.btnResetText}>清空本地数据库</Text>
        </TouchableOpacity>
      </View>
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
    gap: 12,
  },
  dangerCard: {
    borderColor: "rgba(255, 71, 87, 0.15)",
    backgroundColor: "rgba(255, 71, 87, 0.02)",
  },
  deviceHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  cardSubtitle: {
    fontSize: 12,
    color: "#8B93A1",
    fontWeight: "500",
  },
  deviceNameText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#E2E6EF",
    marginTop: 2,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#E2E6EF",
  },
  dangerTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#FF4757",
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  badgeGreen: {
    backgroundColor: "rgba(46, 213, 115, 0.15)",
  },
  badgeAmber: {
    backgroundColor: "rgba(245, 166, 35, 0.15)",
  },
  badgeText: {
    fontSize: 10,
    fontWeight: "600",
    color: "#E2E6EF",
  },
  sectionBody: {
    gap: 12,
  },
  helperText: {
    fontSize: 12,
    color: "#8B93A1",
    lineHeight: 18,
  },
  inputContainer: {
    flexDirection: "row",
    gap: 10,
    marginTop: 4,
  },
  input: {
    flex: 1,
    height: 44,
    backgroundColor: "#111520",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    borderRadius: 10,
    color: "#E2E6EF",
    paddingHorizontal: 14,
    fontSize: 14,
  },
  btnConnect: {
    backgroundColor: "#F5A623",
    borderRadius: 10,
    paddingHorizontal: 20,
    justifyContent: "center",
    alignItems: "center",
    height: 44,
  },
  btnConnectText: {
    color: "#07090F",
    fontSize: 13,
    fontWeight: "bold",
  },
  pairedContainer: {
    backgroundColor: "#111520",
    borderWidth: 1,
    borderColor: "rgba(46,213,115,0.15)",
    borderRadius: 10,
    padding: 20,
    alignItems: "center",
    gap: 8,
    marginTop: 4,
  },
  pairedText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#2ED573",
  },
  pairedDevice: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#E2E6EF",
  },
  btnDisconnect: {
    marginTop: 8,
    paddingVertical: 6,
    paddingHorizontal: 16,
    backgroundColor: "rgba(255, 71, 87, 0.1)",
    borderRadius: 8,
  },
  btnDisconnectText: {
    color: "#FF4757",
    fontSize: 12,
    fontWeight: "bold",
  },
  loadingContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 20,
    gap: 12,
  },
  loadingStepText: {
    fontSize: 13,
    color: "#F5A623",
    fontWeight: "600",
  },
  btnOcr: {
    backgroundColor: "#F5A623",
    borderRadius: 10,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 6,
  },
  btnOcrText: {
    color: "#07090F",
    fontSize: 14,
    fontWeight: "bold",
  },
  btnReset: {
    borderWidth: 1,
    borderColor: "#FF4757",
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 4,
  },
  btnResetText: {
    color: "#FF4757",
    fontSize: 13,
    fontWeight: "bold",
  },
});
