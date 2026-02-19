import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, Pressable, Switch, Platform, Modal } from "react-native";
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

  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const handleLogout = () => {
    setShowLogoutConfirm(true);
  };

  const confirmLogout = async () => {
    setShowLogoutConfirm(false);
    await logout();
    router.replace("/onboarding");
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

      <Modal
        visible={showLogoutConfirm}
        transparent
        animationType="fade"
        onRequestClose={() => setShowLogoutConfirm(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setShowLogoutConfirm(false)}>
          <Pressable style={styles.modalCard} onPress={() => {}}>
            <View style={styles.modalIconWrap}>
              <Ionicons name="log-out-outline" size={28} color={Colors.danger} />
            </View>
            <Text style={styles.modalTitle}>Log Out?</Text>
            <Text style={styles.modalDesc}>Are you sure you want to log out of SEEDi?</Text>
            <View style={styles.modalActions}>
              <Pressable
                style={({ pressed }) => [styles.modalCancelBtn, pressed && { opacity: 0.8 }]}
                onPress={() => setShowLogoutConfirm(false)}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </Pressable>
              <Pressable
                style={({ pressed }) => [styles.modalLogoutBtn, pressed && { opacity: 0.8 }]}
                onPress={confirmLogout}
              >
                <Text style={styles.modalLogoutText}>Log Out</Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
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
  modalOverlay: {
    flex: 1, backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center", alignItems: "center", padding: 32,
  },
  modalCard: {
    backgroundColor: "#fff", borderRadius: 24, padding: 28,
    width: "100%", maxWidth: 340, alignItems: "center",
  },
  modalIconWrap: {
    width: 56, height: 56, borderRadius: 28, backgroundColor: Colors.dangerLight,
    alignItems: "center", justifyContent: "center", marginBottom: 16,
  },
  modalTitle: { fontSize: 20, fontFamily: "DMSans_700Bold", color: Colors.text, marginBottom: 8 },
  modalDesc: { fontSize: 15, fontFamily: "DMSans_400Regular", color: Colors.textSecondary, textAlign: "center", marginBottom: 24, lineHeight: 22 },
  modalActions: { flexDirection: "row", gap: 12, width: "100%" },
  modalCancelBtn: {
    flex: 1, paddingVertical: 14, borderRadius: 14,
    backgroundColor: Colors.background, alignItems: "center",
    borderWidth: 1, borderColor: Colors.cardBorder,
  },
  modalCancelText: { fontSize: 15, fontFamily: "DMSans_600SemiBold", color: Colors.text },
  modalLogoutBtn: {
    flex: 1, paddingVertical: 14, borderRadius: 14,
    backgroundColor: Colors.danger, alignItems: "center",
  },
  modalLogoutText: { fontSize: 15, fontFamily: "DMSans_600SemiBold", color: "#fff" },
});
