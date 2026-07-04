import React from "react";
import { StyleSheet, View, ViewStyle, StyleProp } from "react-native";

interface GlassCardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

export function GlassCard({ children, style }: GlassCardProps) {
  return <View style={[styles.glassCard, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  glassCard: {
    backgroundColor: "#0D1018",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.06)",
    borderRadius: 16,
    padding: 18,
    gap: 14,
  },
});
