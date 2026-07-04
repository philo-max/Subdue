import React from "react";
import { StatusBar } from "expo-status-bar";
import { Platform, StyleSheet, Text, View, ScrollView, TouchableOpacity, Linking } from "react-native";
import { SymbolView } from "expo-symbols";

export default function AboutModalScreen() {
  const handleOpenGitHub = () => {
    Linking.openURL("https://github.com/philo-max/Subdue");
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* App Logo & Header */}
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <SymbolView name="creditcard.and.123" tintColor="#F5A623" size={48} />
        </View>
        <Text style={styles.appName}>Subdue</Text>
        <Text style={styles.appTagline}>💸 驯服你的订阅账单</Text>
        <Text style={styles.versionText}>版本 v0.2.0 (MVP)</Text>
      </View>

      {/* Core Values Section */}
      <Text style={styles.sectionTitle}>🛡️ 核心承诺</Text>
      
      <View style={styles.card}>
        <View style={styles.valueRow}>
          <SymbolView name="lock.shield.fill" tintColor="#2ED573" size={24} style={styles.valueIcon} />
          <View style={styles.valueContent}>
            <Text style={styles.valueTitle}>隐私绝对优先</Text>
            <Text style={styles.valueDesc}>
              所有订阅数据默认本地加密存储，不经过任何云端服务器，完全由您掌控。
            </Text>
          </View>
        </View>

        <View style={styles.valueRow}>
          <SymbolView name="hand.raised.slash.fill" tintColor="#FF4757" size={24} style={styles.valueIcon} />
          <View style={styles.valueContent}>
            <Text style={styles.valueTitle}>永久零广告</Text>
            <Text style={styles.valueDesc}>
              绝不引入任何商业广告 SDK，提供纯净、无打扰的记账与提醒体验。
            </Text>
          </View>
        </View>

        <View style={styles.valueRow}>
          <SymbolView name="curlybraces" tintColor="#5B8DEF" size={24} style={styles.valueIcon} />
          <View style={styles.valueContent}>
            <Text style={styles.valueTitle}>开源与可审计</Text>
            <Text style={styles.valueDesc}>
              核心引擎与 UI 代码全部开源。任何极客均可自行审计代码或在个人服务器上自部署。
            </Text>
          </View>
        </View>
      </View>

      {/* Synchronize Guide */}
      <Text style={styles.sectionTitle}>📱 离线与同步</Text>
      <View style={styles.card}>
        <Text style={styles.paragraph}>
          Subdue 采用**离线优先 (Offline-First)** 架构。即使在完全断网的情况下，您依然能正常记录、查询和接收本地通知提醒。
        </Text>
        <Text style={styles.paragraph}>
          需要多端查看时，可通过局域网配对，在手机与 PC 客户端之间通过安全加密的本地通道直接传输数据。
        </Text>
      </View>

      {/* Developer and License Info */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.githubButton} onPress={handleOpenGitHub}>
          <SymbolView name="network" tintColor="#E2E6EF" size={16} />
          <Text style={styles.githubButtonText}>访问 GitHub 仓库</Text>
        </TouchableOpacity>
        
        <Text style={styles.licenseText}>Released under the MIT License</Text>
        <Text style={styles.copyrightText}>Copyright © 2026 Subdue Project. All Rights Reserved.</Text>
      </View>

      <StatusBar style={Platform.OS === "ios" ? "light" : "auto"} />
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
    paddingTop: 30,
    paddingBottom: 40,
  },
  header: {
    alignItems: "center",
    marginBottom: 30,
  },
  logoContainer: {
    width: 90,
    height: 90,
    borderRadius: 24,
    backgroundColor: "#0D1018",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
    shadowColor: "#F5A623",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
  },
  appName: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#E2E6EF",
    letterSpacing: 0.5,
  },
  appTagline: {
    fontSize: 16,
    color: "#F5A623",
    marginTop: 6,
    fontWeight: "500",
  },
  versionText: {
    fontSize: 13,
    color: "#54596A",
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#E2E6EF",
    marginBottom: 10,
    marginTop: 10,
    paddingLeft: 4,
  },
  card: {
    backgroundColor: "#0D1018",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.06)",
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    gap: 16,
  },
  valueRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  valueIcon: {
    marginTop: 2,
  },
  valueContent: {
    flex: 1,
  },
  valueTitle: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#E2E6EF",
    marginBottom: 4,
  },
  valueDesc: {
    fontSize: 13,
    color: "#8B93A1",
    lineHeight: 18,
  },
  paragraph: {
    fontSize: 13,
    color: "#8B93A1",
    lineHeight: 19,
  },
  footer: {
    alignItems: "center",
    marginTop: 10,
    gap: 12,
  },
  githubButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#161B26",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    gap: 8,
  },
  githubButtonText: {
    color: "#E2E6EF",
    fontSize: 14,
    fontWeight: "600",
  },
  licenseText: {
    fontSize: 12,
    color: "#54596A",
    marginTop: 10,
  },
  copyrightText: {
    fontSize: 11,
    color: "#54596A",
    textAlign: "center",
  },
});

