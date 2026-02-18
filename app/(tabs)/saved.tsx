import React from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  Platform,
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons, Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import * as Haptics from "expo-haptics";
import Colors from "@/constants/colors";
import { useSeed } from "@/contexts/SeedContext";
import { STAGE_NAMES } from "@/constants/data";

export default function SavedScreen() {
  const insets = useSafeAreaInsets();
  const { projects, deleteProject, setCurrentProject } = useSeed();
  const webTopInset = Platform.OS === "web" ? 67 : 0;

  const handleDelete = (id: string) => {
    if (Platform.OS === "web") {
      deleteProject(id);
      return;
    }
    Alert.alert("Delete Project", "Are you sure you want to delete this decision project?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => deleteProject(id),
      },
    ]);
  };

  const handleResume = (project: any) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setCurrentProject(project);
    const routes = [
      "workflow/define-context",
      "workflow/explore-compare",
      "workflow/analyze-simulate",
      "workflow/generate-action",
    ] as const;
    router.push(routes[project.currentStage - 1] as any);
  };

  const renderItem = ({ item }: any) => (
    <Pressable
      style={({ pressed }) => [styles.projectCard, pressed && { opacity: 0.95, transform: [{ scale: 0.98 }] }]}
      onPress={() => handleResume(item)}
    >
      <View style={styles.projectHeader}>
        <View style={styles.projectInfo}>
          <Text style={styles.projectTitle}>{item.title}</Text>
          <Text style={styles.projectDate}>{item.updatedAt}</Text>
        </View>
        <View style={styles.projectActions}>
          <View
            style={[
              styles.statusBadge,
              item.status === "completed" ? styles.statusCompleted : styles.statusActive,
            ]}
          >
            <Text
              style={[
                styles.statusText,
                item.status === "completed" ? styles.statusTextCompleted : styles.statusTextActive,
              ]}
            >
              {item.status === "completed" ? "Done" : "Active"}
            </Text>
          </View>
          <Pressable onPress={() => handleDelete(item.id)} hitSlop={12}>
            <Ionicons name="trash-outline" size={18} color={Colors.danger} />
          </Pressable>
        </View>
      </View>
      <View style={styles.projectMeta}>
        <View style={styles.stagePill}>
          <Ionicons name="layers-outline" size={13} color={Colors.primary} />
          <Text style={styles.stageText}>{STAGE_NAMES[item.currentStage - 1]}</Text>
        </View>
        <View style={styles.innovationPill}>
          <Ionicons name="bulb-outline" size={13} color={Colors.accent} />
          <Text style={styles.innovationText}>{item.innovationCount} innovations</Text>
        </View>
      </View>
      <View style={styles.progressRow}>
        {STAGE_NAMES.map((_, i) => (
          <View
            key={i}
            style={[
              styles.progressDot,
              i < item.currentStage ? styles.progressDotActive : styles.progressDotInactive,
            ]}
          />
        ))}
      </View>
    </Pressable>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top + webTopInset }]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Saved Decisions</Text>
        <Text style={styles.headerSub}>{projects.length} projects</Text>
      </View>
      <FlatList
        data={projects}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={[styles.list, { paddingBottom: insets.bottom + 100 }]}
        scrollEnabled={projects.length > 0}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="bookmark-outline" size={48} color={Colors.textMuted} />
            <Text style={styles.emptyTitle}>No saved decisions</Text>
            <Text style={styles.emptyText}>
              Start a new decision from the dashboard to see your projects here.
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { paddingHorizontal: 20, paddingBottom: 12, paddingTop: 8 },
  headerTitle: { fontSize: 28, fontFamily: "DMSans_700Bold", color: Colors.text },
  headerSub: { fontSize: 14, fontFamily: "DMSans_400Regular", color: Colors.textSecondary, marginTop: 2 },
  list: { paddingHorizontal: 20, paddingTop: 8 },
  projectCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  projectHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  projectInfo: { flex: 1 },
  projectTitle: { fontSize: 16, fontFamily: "DMSans_600SemiBold", color: Colors.text },
  projectDate: { fontSize: 12, fontFamily: "DMSans_400Regular", color: Colors.textMuted, marginTop: 2 },
  projectActions: { flexDirection: "row", alignItems: "center", gap: 12 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 12 },
  statusActive: { backgroundColor: Colors.primaryLight },
  statusCompleted: { backgroundColor: Colors.successLight },
  statusText: { fontSize: 11, fontFamily: "DMSans_600SemiBold" },
  statusTextActive: { color: Colors.primary },
  statusTextCompleted: { color: Colors.success },
  projectMeta: { flexDirection: "row", gap: 12, marginTop: 12 },
  stagePill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  stageText: { fontSize: 12, fontFamily: "DMSans_500Medium", color: Colors.primary },
  innovationPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: Colors.accentLight,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  innovationText: { fontSize: 12, fontFamily: "DMSans_500Medium", color: Colors.accent },
  progressRow: { flexDirection: "row", gap: 6, marginTop: 14 },
  progressDot: { flex: 1, height: 4, borderRadius: 2 },
  progressDotActive: { backgroundColor: Colors.primary },
  progressDotInactive: { backgroundColor: Colors.borderLight },
  emptyState: { alignItems: "center", justifyContent: "center", paddingTop: 100, gap: 12 },
  emptyTitle: { fontSize: 18, fontFamily: "DMSans_600SemiBold", color: Colors.text },
  emptyText: { fontSize: 14, fontFamily: "DMSans_400Regular", color: Colors.textSecondary, textAlign: "center", paddingHorizontal: 40 },
});
