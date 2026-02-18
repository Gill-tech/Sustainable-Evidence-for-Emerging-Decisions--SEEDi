import React from "react";
import { View, Text, StyleSheet, ScrollView, Pressable, Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import Colors from "@/constants/colors";
import { useSeed } from "@/contexts/SeedContext";

export default function ReportsScreen() {
  const insets = useSafeAreaInsets();
  const { projects } = useSeed();
  const webTopInset = Platform.OS === "web" ? 67 : 0;

  const completedProjects = projects.filter((p) => p.status === "completed");
  const reportCount = completedProjects.length;

  const reportItems = [
    {
      id: "overview",
      title: "Portfolio Overview",
      description: "Summary of all decision projects and their outcomes",
      icon: "pie-chart" as const,
      color: Colors.primary,
      bg: Colors.primaryLight,
    },
    {
      id: "sustainability",
      title: "Sustainability Report",
      description: "Environmental impact and SDG alignment metrics",
      icon: "leaf" as const,
      color: Colors.success,
      bg: Colors.successLight,
    },
    {
      id: "innovations",
      title: "Innovation Catalog",
      description: "All explored innovations with feasibility scores",
      icon: "bulb" as const,
      color: Colors.accent,
      bg: Colors.accentLight,
    },
    {
      id: "regional",
      title: "Regional Analysis",
      description: "Climate risk and agricultural performance by region",
      icon: "globe" as const,
      color: Colors.info,
      bg: Colors.infoLight,
    },
  ];

  return (
    <View style={[styles.container, { paddingTop: insets.top + webTopInset }]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Reports</Text>
        <Text style={styles.headerSub}>{reportCount} completed reports</Text>
      </View>
      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 100 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Ionicons name="document-text" size={22} color={Colors.primary} />
            <Text style={styles.statNum}>{projects.length}</Text>
            <Text style={styles.statLabel}>Total Projects</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="checkmark-circle" size={22} color={Colors.success} />
            <Text style={styles.statNum}>{completedProjects.length}</Text>
            <Text style={styles.statLabel}>Completed</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="download" size={22} color={Colors.info} />
            <Text style={styles.statNum}>{completedProjects.length}</Text>
            <Text style={styles.statLabel}>Exported</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Report Templates</Text>
        {reportItems.map((item) => (
          <Pressable
            key={item.id}
            style={({ pressed }) => [styles.reportCard, pressed && { opacity: 0.95, transform: [{ scale: 0.98 }] }]}
          >
            <View style={[styles.reportIcon, { backgroundColor: item.bg }]}>
              <Ionicons name={item.icon} size={22} color={item.color} />
            </View>
            <View style={styles.reportInfo}>
              <Text style={styles.reportTitle}>{item.title}</Text>
              <Text style={styles.reportDesc}>{item.description}</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={Colors.textMuted} />
          </Pressable>
        ))}

        {completedProjects.length > 0 && (
          <>
            <Text style={[styles.sectionTitle, { marginTop: 24 }]}>Recent Exports</Text>
            {completedProjects.map((project) => (
              <View key={project.id} style={styles.exportItem}>
                <View style={styles.exportIconWrap}>
                  <Ionicons name="document" size={18} color={Colors.primary} />
                </View>
                <View style={styles.exportInfo}>
                  <Text style={styles.exportTitle}>{project.title}</Text>
                  <Text style={styles.exportDate}>{project.updatedAt}</Text>
                </View>
                <Ionicons name="cloud-download-outline" size={20} color={Colors.textMuted} />
              </View>
            ))}
          </>
        )}

        {completedProjects.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="document-text-outline" size={40} color={Colors.textMuted} />
            <Text style={styles.emptyText}>
              Complete a decision project to generate reports
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { paddingHorizontal: 20, paddingBottom: 12, paddingTop: 8 },
  headerTitle: { fontSize: 28, fontFamily: "DMSans_700Bold", color: Colors.text },
  headerSub: { fontSize: 14, fontFamily: "DMSans_400Regular", color: Colors.textSecondary, marginTop: 2 },
  content: { paddingHorizontal: 20 },
  statsRow: { flexDirection: "row", gap: 10, marginBottom: 24 },
  statCard: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 14,
    alignItems: "center",
    gap: 6,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  statNum: { fontSize: 22, fontFamily: "DMSans_700Bold", color: Colors.text },
  statLabel: { fontSize: 11, fontFamily: "DMSans_500Medium", color: Colors.textSecondary },
  sectionTitle: { fontSize: 17, fontFamily: "DMSans_600SemiBold", color: Colors.text, marginBottom: 12 },
  reportCard: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  reportIcon: { width: 44, height: 44, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  reportInfo: { flex: 1 },
  reportTitle: { fontSize: 15, fontFamily: "DMSans_600SemiBold", color: Colors.text },
  reportDesc: { fontSize: 12, fontFamily: "DMSans_400Regular", color: Colors.textSecondary, marginTop: 2 },
  exportItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  exportIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: Colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
  },
  exportInfo: { flex: 1 },
  exportTitle: { fontSize: 14, fontFamily: "DMSans_500Medium", color: Colors.text },
  exportDate: { fontSize: 12, fontFamily: "DMSans_400Regular", color: Colors.textMuted },
  emptyState: { alignItems: "center", paddingTop: 40, gap: 12 },
  emptyText: { fontSize: 14, fontFamily: "DMSans_400Regular", color: Colors.textSecondary, textAlign: "center", paddingHorizontal: 40 },
});
