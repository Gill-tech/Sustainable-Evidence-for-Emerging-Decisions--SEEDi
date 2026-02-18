import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import Colors from "@/constants/colors";
import { useSeed } from "@/contexts/SeedContext";
import { MOCK_ALERTS, STAGE_NAMES, MOCK_INNOVATIONS } from "@/constants/data";

function TopBar({
  waterEfficiency,
  soilHealth,
  postHarvestLoss,
}: {
  waterEfficiency: number;
  soilHealth: number;
  postHarvestLoss: number;
}) {
  return (
    <View style={styles.topBar}>
      <View style={styles.topBarLeft}>
        <MaterialCommunityIcons name="sprout" size={22} color={Colors.primary} />
        <Text style={styles.topBarBrand}>SEEDi</Text>
      </View>
      <View style={styles.topBarMetrics}>
        <View style={styles.metric}>
          <Ionicons name="water" size={13} color={Colors.info} />
          <Text style={styles.metricText}>{waterEfficiency}%</Text>
        </View>
        <View style={styles.metric}>
          <MaterialCommunityIcons name="terrain" size={13} color="#8B6914" />
          <Text style={styles.metricText}>{soilHealth}%</Text>
        </View>
        <View style={styles.metric}>
          <Ionicons name="warning" size={13} color={Colors.danger} />
          <Text style={styles.metricText}>{postHarvestLoss}%</Text>
        </View>
      </View>
    </View>
  );
}

function StatCard({
  icon,
  iconColor,
  iconBg,
  value,
  label,
}: {
  icon: string;
  iconColor: string;
  iconBg: string;
  value: string;
  label: string;
}) {
  return (
    <View style={styles.statCard}>
      <View style={[styles.statIcon, { backgroundColor: iconBg }]}>
        <Ionicons name={icon as any} size={18} color={iconColor} />
      </View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function SustainabilityBar({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  return (
    <View style={styles.sustainRow}>
      <View style={styles.sustainHeader}>
        <Text style={styles.sustainLabel}>{label}</Text>
        <Text style={[styles.sustainValue, { color }]}>{value}/100</Text>
      </View>
      <View style={styles.sustainTrack}>
        <View
          style={[styles.sustainFill, { width: `${value}%`, backgroundColor: color }]}
        />
      </View>
    </View>
  );
}

export default function DashboardScreen() {
  const insets = useSafeAreaInsets();
  const {
    projects,
    soilHealth,
    waterEfficiency,
    biodiversityIndex,
    postHarvestLoss,
    createProject,
    setCurrentProject,
  } = useSeed();
  const webTopInset = Platform.OS === "web" ? 67 : 0;

  const activeProjects = projects.filter((p) => p.status === "active");
  const recentProjects = projects.slice(0, 3);

  const handleNewDecision = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const project = await createProject("New Decision Project");
    router.push("/workflow/define-context" as any);
  };

  const handleResumeProject = (project: any) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setCurrentProject(project);
    const routes = [
      "workflow/define-context",
      "workflow/explore-compare",
      "workflow/analyze-simulate",
      "workflow/generate-action",
    ] as const;
    router.push(("/" + routes[project.currentStage - 1]) as any);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top + webTopInset }]}>
      <TopBar
        waterEfficiency={waterEfficiency}
        soilHealth={soilHealth}
        postHarvestLoss={postHarvestLoss}
      />
      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 100 }]}
        showsVerticalScrollIndicator={false}
      >
        <LinearGradient
          colors={[Colors.primary, Colors.primaryDark]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.welcomeBanner}
        >
          <Text style={styles.welcomeTitle}>Welcome back!</Text>
          <Text style={styles.welcomeSub}>Start your agricultural decision journey</Text>
          <View style={styles.welcomeActions}>
            <Pressable
              style={({ pressed }) => [styles.primaryBtn, pressed && { opacity: 0.9, transform: [{ scale: 0.97 }] }]}
              onPress={handleNewDecision}
            >
              <Ionicons name="add" size={18} color={Colors.primary} />
              <Text style={styles.primaryBtnText}>Start New Decision</Text>
            </Pressable>
            {recentProjects.length > 0 && (
              <Pressable
                style={({ pressed }) => [styles.secondaryBtn, pressed && { opacity: 0.9 }]}
                onPress={() => handleResumeProject(recentProjects[0])}
              >
                <Text style={styles.secondaryBtnText}>Resume Last</Text>
              </Pressable>
            )}
          </View>
        </LinearGradient>

        <View style={styles.statsGrid}>
          <StatCard
            icon="bulb"
            iconColor={Colors.info}
            iconBg={Colors.infoLight}
            value={MOCK_INNOVATIONS.length.toLocaleString()}
            label="Innovations"
          />
          <StatCard
            icon="location"
            iconColor={Colors.success}
            iconBg={Colors.successLight}
            value={activeProjects.length > 0 ? (activeProjects[0].context?.region?.split(" ")[0] || "Not Set") : "Not Set"}
            label="Region"
          />
          <StatCard
            icon="download"
            iconColor={Colors.accent}
            iconBg={Colors.accentLight}
            value={projects.filter((p) => p.status === "completed").length.toString()}
            label="Reports"
          />
          <StatCard
            icon="trending-down"
            iconColor={Colors.danger}
            iconBg={Colors.dangerLight}
            value={`${postHarvestLoss}%`}
            label="Post-Harvest Loss"
          />
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Projects</Text>
          <Pressable onPress={() => router.push("/(tabs)/saved" as any)}>
            <Text style={styles.viewAll}>View All</Text>
          </Pressable>
        </View>
        {recentProjects.length > 0 ? (
          recentProjects.map((project) => (
            <Pressable
              key={project.id}
              style={({ pressed }) => [styles.projectItem, pressed && { opacity: 0.95 }]}
              onPress={() => handleResumeProject(project)}
            >
              <View style={styles.projectInfo}>
                <Text style={styles.projectName}>{project.title}</Text>
                <View style={styles.projectMetaRow}>
                  <View style={styles.projectStagePill}>
                    <Text style={styles.projectStageText}>
                      {STAGE_NAMES[project.currentStage - 1]}
                    </Text>
                  </View>
                  <Text style={styles.projectInnCount}>
                    {project.innovationCount} innovations
                  </Text>
                </View>
              </View>
              <Text style={styles.projectDate}>{project.updatedAt}</Text>
            </Pressable>
          ))
        ) : (
          <View style={styles.emptyProjects}>
            <Text style={styles.emptyText}>No projects yet. Start a new decision!</Text>
          </View>
        )}

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Regional Alerts</Text>
        </View>
        <View style={styles.alertsCard}>
          {MOCK_ALERTS.map((alert) => (
            <View
              key={alert.id}
              style={[
                styles.alertItem,
                alert.type === "warning" && styles.alertWarning,
                alert.type === "info" && styles.alertInfo,
                alert.type === "success" && styles.alertSuccess,
              ]}
            >
              <Ionicons
                name={
                  alert.type === "warning"
                    ? "alert-circle"
                    : alert.type === "info"
                    ? "information-circle"
                    : "checkmark-circle"
                }
                size={18}
                color={
                  alert.type === "warning"
                    ? Colors.warning
                    : alert.type === "info"
                    ? Colors.info
                    : Colors.success
                }
              />
              <View style={styles.alertContent}>
                <Text style={styles.alertMessage}>{alert.message}</Text>
                <Text style={styles.alertTime}>{alert.timeAgo}</Text>
              </View>
            </View>
          ))}
        </View>

        <Text style={[styles.sectionTitle, { paddingHorizontal: 0, marginTop: 8 }]}>
          Sustainability Snapshot
        </Text>
        <View style={styles.sustainCard}>
          <SustainabilityBar label="Soil Health" value={soilHealth} color={Colors.primary} />
          <SustainabilityBar label="Water Efficiency" value={waterEfficiency} color={Colors.info} />
          <SustainabilityBar label="Biodiversity" value={biodiversityIndex} color={Colors.success} />
        </View>

        <Text style={[styles.sectionTitle, { paddingHorizontal: 0, marginTop: 8 }]}>
          Quick Actions
        </Text>
        <View style={styles.quickActions}>
          <Pressable
            style={({ pressed }) => [styles.quickAction, pressed && { opacity: 0.9 }]}
            onPress={handleNewDecision}
          >
            <Ionicons name="add-circle" size={20} color={Colors.primary} />
            <Text style={styles.quickActionText}>New Decision</Text>
          </Pressable>
          <Pressable
            style={({ pressed }) => [styles.quickAction, pressed && { opacity: 0.9 }]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              handleNewDecision();
            }}
          >
            <Ionicons name="search" size={20} color={Colors.info} />
            <Text style={styles.quickActionText}>Explore</Text>
          </Pressable>
          <Pressable
            style={({ pressed }) => [styles.quickAction, pressed && { opacity: 0.9 }]}
            onPress={() => router.push("/(tabs)/reports" as any)}
          >
            <Ionicons name="download" size={20} color={Colors.accent} />
            <Text style={styles.quickActionText}>Reports</Text>
          </Pressable>
          <Pressable
            style={({ pressed }) => [styles.quickAction, pressed && { opacity: 0.9 }]}
            onPress={() => router.push("/(tabs)/settings" as any)}
          >
            <Ionicons name="settings" size={20} color={Colors.textSecondary} />
            <Text style={styles.quickActionText}>Settings</Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  topBarLeft: { flexDirection: "row", alignItems: "center", gap: 6 },
  topBarBrand: { fontSize: 20, fontFamily: "DMSans_700Bold", color: Colors.primary },
  topBarMetrics: { flexDirection: "row", gap: 12 },
  metric: { flexDirection: "row", alignItems: "center", gap: 3 },
  metricText: { fontSize: 12, fontFamily: "DMSans_600SemiBold", color: Colors.textSecondary },
  scrollContent: { paddingHorizontal: 20 },
  welcomeBanner: {
    borderRadius: 20,
    padding: 22,
    marginBottom: 20,
  },
  welcomeTitle: {
    fontSize: 24,
    fontFamily: "DMSans_700Bold",
    color: Colors.textInverse,
  },
  welcomeSub: {
    fontSize: 14,
    fontFamily: "DMSans_400Regular",
    color: "rgba(255,255,255,0.8)",
    marginTop: 4,
  },
  welcomeActions: { flexDirection: "row", gap: 10, marginTop: 16 },
  primaryBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: Colors.textInverse,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 12,
  },
  primaryBtnText: { fontSize: 14, fontFamily: "DMSans_600SemiBold", color: Colors.primary },
  secondaryBtn: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.4)",
  },
  secondaryBtnText: { fontSize: 14, fontFamily: "DMSans_500Medium", color: Colors.textInverse },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 20,
  },
  statCard: {
    width: "48%" as any,
    flexBasis: "47%",
    flexGrow: 1,
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  statIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  statValue: { fontSize: 20, fontFamily: "DMSans_700Bold", color: Colors.text },
  statLabel: { fontSize: 12, fontFamily: "DMSans_400Regular", color: Colors.textSecondary, marginTop: 2 },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: { fontSize: 17, fontFamily: "DMSans_600SemiBold", color: Colors.text },
  viewAll: { fontSize: 13, fontFamily: "DMSans_500Medium", color: Colors.primary },
  projectItem: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 14,
    marginBottom: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  projectInfo: { flex: 1 },
  projectName: { fontSize: 15, fontFamily: "DMSans_600SemiBold", color: Colors.text },
  projectMetaRow: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 4 },
  projectStagePill: {
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  projectStageText: { fontSize: 11, fontFamily: "DMSans_500Medium", color: Colors.primary },
  projectInnCount: { fontSize: 11, fontFamily: "DMSans_400Regular", color: Colors.textMuted },
  projectDate: { fontSize: 12, fontFamily: "DMSans_400Regular", color: Colors.textMuted },
  emptyProjects: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 20,
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    marginBottom: 8,
  },
  emptyText: { fontSize: 14, fontFamily: "DMSans_400Regular", color: Colors.textMuted },
  alertsCard: { marginBottom: 20, gap: 8 },
  alertItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    padding: 12,
    borderRadius: 12,
  },
  alertWarning: { backgroundColor: Colors.warningLight },
  alertInfo: { backgroundColor: Colors.infoLight },
  alertSuccess: { backgroundColor: Colors.successLight },
  alertContent: { flex: 1 },
  alertMessage: { fontSize: 13, fontFamily: "DMSans_500Medium", color: Colors.text, lineHeight: 18 },
  alertTime: { fontSize: 11, fontFamily: "DMSans_400Regular", color: Colors.textMuted, marginTop: 2 },
  sustainCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    gap: 14,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  sustainRow: { gap: 6 },
  sustainHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  sustainLabel: { fontSize: 13, fontFamily: "DMSans_500Medium", color: Colors.text },
  sustainValue: { fontSize: 13, fontFamily: "DMSans_600SemiBold" },
  sustainTrack: { height: 6, backgroundColor: Colors.borderLight, borderRadius: 3 },
  sustainFill: { height: 6, borderRadius: 3 },
  quickActions: { flexDirection: "row", gap: 10, marginBottom: 20, flexWrap: "wrap" },
  quickAction: {
    flexBasis: "47%",
    flexGrow: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: Colors.surface,
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  quickActionText: { fontSize: 13, fontFamily: "DMSans_500Medium", color: Colors.text },
});
