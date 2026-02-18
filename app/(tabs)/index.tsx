import React, { useEffect } from "react";
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
import { MOCK_ALERTS, STAGE_NAMES } from "@/constants/data";

function TopBar({ userName }: { userName: string }) {
  return (
    <View style={styles.topBar}>
      <View style={styles.topBarLeft}>
        <MaterialCommunityIcons name="sprout" size={22} color={Colors.primary} />
        <Text style={styles.topBarBrand}>SEEDi</Text>
      </View>
      <View style={styles.topBarRight}>
        <View style={styles.avatarCircle}>
          <Text style={styles.avatarText}>
            {userName.charAt(0).toUpperCase()}
          </Text>
        </View>
      </View>
    </View>
  );
}

const WORKFLOW_STEPS = [
  { key: 1, label: "Define Context", icon: "create-outline" as const, route: "/workflow/define-context" },
  { key: 2, label: "Explore & Compare", icon: "search-outline" as const, route: "/workflow/explore-compare" },
  { key: 3, label: "Analyze & Simulate", icon: "analytics-outline" as const, route: "/workflow/analyze-simulate" },
  { key: 4, label: "Generate Action", icon: "document-text-outline" as const, route: "/workflow/generate-action" },
];

function WorkflowProgress({ currentStage }: { currentStage: number }) {
  return (
    <View style={styles.workflowCard}>
      <Text style={styles.workflowTitle}>Decision Workflow</Text>
      <View style={styles.workflowSteps}>
        {WORKFLOW_STEPS.map((step, index) => {
          const isActive = step.key === currentStage;
          const isDone = step.key < currentStage;
          return (
            <View key={step.key} style={styles.workflowStep}>
              <View style={styles.workflowStepRow}>
                <View
                  style={[
                    styles.workflowDot,
                    isDone && styles.workflowDotDone,
                    isActive && styles.workflowDotActive,
                  ]}
                >
                  {isDone ? (
                    <Ionicons name="checkmark" size={12} color="#fff" />
                  ) : (
                    <Text
                      style={[
                        styles.workflowDotNum,
                        (isActive || isDone) && { color: "#fff" },
                      ]}
                    >
                      {step.key}
                    </Text>
                  )}
                </View>
                <View style={styles.workflowStepInfo}>
                  <Text
                    style={[
                      styles.workflowStepLabel,
                      isActive && styles.workflowStepLabelActive,
                    ]}
                  >
                    {step.label}
                  </Text>
                  <Text style={styles.workflowStepStatus}>
                    {isDone ? "Completed" : isActive ? "In Progress" : "Upcoming"}
                  </Text>
                </View>
              </View>
              {index < WORKFLOW_STEPS.length - 1 && (
                <View
                  style={[
                    styles.workflowLine,
                    isDone && styles.workflowLineDone,
                  ]}
                />
              )}
            </View>
          );
        })}
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

export default function DashboardScreen() {
  const insets = useSafeAreaInsets();
  const {
    projects,
    userProfile,
    isOnboarded,
    isLoading,
    createProject,
    setCurrentProject,
  } = useSeed();
  const webTopInset = Platform.OS === "web" ? 67 : 0;

  useEffect(() => {
    if (!isLoading && !isOnboarded) {
      router.replace("/onboarding");
    }
  }, [isLoading, isOnboarded]);

  const activeProjects = projects.filter((p) => p.status === "active");
  const recentProjects = projects.slice(0, 3);
  const currentStage = activeProjects.length > 0 ? activeProjects[0].currentStage : 1;
  const firstName = userProfile?.name?.split(" ")[0] || "there";

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

  if (isLoading) return null;

  return (
    <View style={[styles.container, { paddingTop: insets.top + webTopInset }]}>
      <TopBar userName={firstName} />
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
          <Text style={styles.welcomeTitle}>Welcome, {firstName}</Text>
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

        <WorkflowProgress currentStage={currentStage} />

        <View style={styles.statsGrid}>
          <StatCard
            icon="bulb"
            iconColor={Colors.info}
            iconBg={Colors.infoLight}
            value="3,075"
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
            icon="globe"
            iconColor={Colors.primary}
            iconBg={Colors.primaryLight}
            value="150+"
            label="Countries"
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
  topBarRight: { flexDirection: "row", alignItems: "center" },
  avatarCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: Colors.primaryLight,
    borderWidth: 2,
    borderColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontSize: 14,
    fontFamily: "DMSans_700Bold",
    color: Colors.primary,
  },
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
  workflowCard: {
    backgroundColor: Colors.surface,
    borderRadius: 18,
    padding: 18,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  workflowTitle: {
    fontSize: 16,
    fontFamily: "DMSans_600SemiBold",
    color: Colors.text,
    marginBottom: 16,
  },
  workflowSteps: { gap: 0 },
  workflowStep: {},
  workflowStepRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  workflowDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.borderLight,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: Colors.border,
  },
  workflowDotActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  workflowDotDone: {
    backgroundColor: Colors.success,
    borderColor: Colors.success,
  },
  workflowDotNum: {
    fontSize: 12,
    fontFamily: "DMSans_700Bold",
    color: Colors.textMuted,
  },
  workflowStepInfo: { flex: 1 },
  workflowStepLabel: {
    fontSize: 14,
    fontFamily: "DMSans_600SemiBold",
    color: Colors.text,
  },
  workflowStepLabelActive: { color: Colors.primary },
  workflowStepStatus: {
    fontSize: 12,
    fontFamily: "DMSans_400Regular",
    color: Colors.textMuted,
  },
  workflowLine: {
    width: 2,
    height: 18,
    backgroundColor: Colors.borderLight,
    marginLeft: 13,
    marginVertical: 2,
  },
  workflowLineDone: { backgroundColor: Colors.success },
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
