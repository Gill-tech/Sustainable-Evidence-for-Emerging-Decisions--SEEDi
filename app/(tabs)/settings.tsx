import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, Pressable, Switch, Platform, Alert } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import Colors from "@/constants/colors";
import { useSeed } from "@/contexts/SeedContext";

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const webTopInset = Platform.OS === "web" ? 67 : 0;
  const { userProfile, logout } = useSeed();
  const [notifications, setNotifications] = useState(true);
  const [regionAlerts, setRegionAlerts] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  const handleLogout = () => {
    Alert.alert(
      "Log Out",
      "Are you sure you want to log out?",
      [
        { text: "Cancel", style: "cancel" as const },
        {
          text: "Log Out",
          style: "destructive" as const,
          onPress: async () => {
            await logout();
            router.replace("/onboarding");
          },
        },
      ]
    );
  };

  const roleName = userProfile?.role
    ? userProfile.role.charAt(0).toUpperCase() + userProfile.role.slice(1)
    : "User";

  const sections = [
    {
      title: "Preferences",
      items: [
        {
          icon: "notifications" as const,
          label: "Push Notifications",
          toggle: true,
          value: notifications,
          onToggle: setNotifications,
        },
        {
          icon: "location" as const,
          label: "Regional Alerts",
          toggle: true,
          value: regionAlerts,
          onToggle: setRegionAlerts,
        },
        {
          icon: "moon" as const,
          label: "Dark Mode",
          toggle: true,
          value: darkMode,
          onToggle: setDarkMode,
        },
      ],
    },
    {
      title: "Account",
      items: [
        { icon: "person" as const, label: "Profile" },
        { icon: "shield-checkmark" as const, label: "Privacy" },
        { icon: "language" as const, label: "Language" },
      ],
    },
    {
      title: "About",
      items: [
        { icon: "information-circle" as const, label: "About SEEDi" },
        { icon: "help-circle" as const, label: "Help & Support" },
        { icon: "document-text" as const, label: "Terms of Service" },
        { icon: "lock-closed" as const, label: "Privacy Policy" },
      ],
    },
  ];

  return (
    <View style={[styles.container, { paddingTop: insets.top + webTopInset }]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Settings</Text>
      </View>
      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 100 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {(userProfile?.name || "U").charAt(0).toUpperCase()}
            </Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{userProfile?.name || "SEEDi User"}</Text>
            <Text style={styles.profileRole}>{roleName}</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={Colors.textMuted} />
        </View>

        {sections.map((section) => (
          <View key={section.title} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <View style={styles.sectionCard}>
              {section.items.map((item, idx) => (
                <Pressable
                  key={item.label}
                  style={[
                    styles.settingItem,
                    idx < section.items.length - 1 && styles.settingItemBorder,
                  ]}
                >
                  <View style={styles.settingLeft}>
                    <View style={styles.settingIcon}>
                      <Ionicons name={item.icon} size={18} color={Colors.primary} />
                    </View>
                    <Text style={styles.settingLabel}>{item.label}</Text>
                  </View>
                  {item.toggle ? (
                    <Switch
                      value={item.value}
                      onValueChange={item.onToggle}
                      trackColor={{ false: Colors.border, true: Colors.primaryMuted }}
                      thumbColor={item.value ? Colors.primary : "#f4f3f4"}
                    />
                  ) : (
                    <Ionicons name="chevron-forward" size={16} color={Colors.textMuted} />
                  )}
                </Pressable>
              ))}
            </View>
          </View>
        ))}

        <Pressable
          style={({ pressed }) => [styles.logoutBtn, pressed && { opacity: 0.85, transform: [{ scale: 0.98 }] }]}
          onPress={handleLogout}
        >
          <Ionicons name="log-out-outline" size={20} color={Colors.danger} />
          <Text style={styles.logoutText}>Log Out</Text>
        </Pressable>

        <Text style={styles.version}>SEEDi v1.0.0</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { paddingHorizontal: 20, paddingBottom: 12, paddingTop: 8 },
  headerTitle: { fontSize: 28, fontFamily: "DMSans_700Bold", color: Colors.text },
  content: { paddingHorizontal: 20 },
  profileCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { fontSize: 22, fontFamily: "DMSans_700Bold", color: "#fff" },
  profileInfo: { flex: 1 },
  profileName: { fontSize: 17, fontFamily: "DMSans_600SemiBold", color: Colors.text },
  profileRole: { fontSize: 13, fontFamily: "DMSans_400Regular", color: Colors.textSecondary, marginTop: 2 },
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 13, fontFamily: "DMSans_600SemiBold", color: Colors.textMuted, textTransform: "uppercase" as const, letterSpacing: 0.5, marginBottom: 8, paddingLeft: 4 },
  sectionCard: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    overflow: "hidden" as const,
  },
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 14,
  },
  settingItemBorder: { borderBottomWidth: 1, borderBottomColor: Colors.divider },
  settingLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
  settingIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: Colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
  },
  settingLabel: { fontSize: 15, fontFamily: "DMSans_500Medium", color: Colors.text },
  logoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    backgroundColor: Colors.dangerLight,
    paddingVertical: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(231,76,60,0.15)",
    marginTop: 8,
  },
  logoutText: { fontSize: 16, fontFamily: "DMSans_600SemiBold", color: Colors.danger },
  version: { textAlign: "center" as const, fontSize: 12, fontFamily: "DMSans_400Regular", color: Colors.textMuted, marginTop: 20, marginBottom: 40 },
});
