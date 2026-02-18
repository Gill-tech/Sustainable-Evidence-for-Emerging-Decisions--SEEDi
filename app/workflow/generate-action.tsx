import React, { useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Platform,
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import Colors from "@/constants/colors";
import { useSeed } from "@/contexts/SeedContext";
import { MOCK_INNOVATIONS, STAGE_NAMES } from "@/constants/data";

function BriefSection({
  title,
  icon,
  children,
}: {
  title: string;
  icon: string;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.briefSection}>
      <View style={styles.briefHeader}>
        <Ionicons name={icon as any} size={18} color={Colors.primary} />
        <Text style={styles.briefTitle}>{title}</Text>
      </View>
      {children}
    </View>
  );
}

function KeyIndicator({
  label,
  value,
  trend,
}: {
  label: string;
  value: string;
  trend?: "positive" | "negative" | "neutral";
}) {
  const trendColor =
    trend === "positive"
      ? Colors.success
      : trend === "negative"
      ? Colors.danger
      : Colors.textSecondary;
  return (
    <View style={styles.indicatorItem}>
      <Text style={styles.indicatorLabel}>{label}</Text>
      <Text style={[styles.indicatorValue, { color: trendColor }]}>{value}</Text>
    </View>
  );
}

export default function GenerateActionScreen() {
  const insets = useSafeAreaInsets();
  const { currentProject, completeProject, soilHealth, waterEfficiency, biodiversityIndex, postHarvestLoss } = useSeed();
  const webTopInset = Platform.OS === "web" ? 67 : 0;

  const selectedInnovations = useMemo(() => {
    const ids = currentProject?.selectedInnovations || [];
    return MOCK_INNOVATIONS.filter((i) => ids.includes(i.id));
  }, [currentProject]);

  const avgImpact = selectedInnovations.length
    ? Math.round(selectedInnovations.reduce((s, i) => s + i.impactScore, 0) / selectedInnovations.length)
    : 0;
  const avgFeasibility = selectedInnovations.length
    ? Math.round(selectedInnovations.reduce((s, i) => s + i.feasibilityScore, 0) / selectedInnovations.length)
    : 0;
  const avgSustainability = selectedInnovations.length
    ? Math.round(selectedInnovations.reduce((s, i) => s + i.sustainabilityScore, 0) / selectedInnovations.length)
    : 0;
  const projectedLoss = Math.max(2, postHarvestLoss - Math.round(avgImpact * 0.15));

  const handleExport = async () => {
    if (!currentProject) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    await completeProject(currentProject.id);
    if (Platform.OS === "web") {
      router.replace("/(tabs)" as any);
    } else {
      Alert.alert(
        "Action Brief Exported",
        "Your decision brief has been saved. You can find it in the Reports tab.",
        [{ text: "OK", onPress: () => router.replace("/(tabs)" as any) }]
      );
    }
  };

  const ctx = currentProject?.context;

  return (
    <View style={[styles.container, { paddingTop: insets.top + webTopInset }]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </Pressable>
        <View style={styles.headerCenter}>
          <Text style={styles.headerStage}>Stage 4 of 4</Text>
          <Text style={styles.headerTitle}>Action Brief</Text>
        </View>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.stepIndicator}>
        {[1, 2, 3, 4].map((step) => (
          <View key={step} style={styles.stepRow}>
            <View style={[styles.stepDot, styles.stepDotActive]}>
              {step < 4 ? (
                <Ionicons name="checkmark" size={14} color={Colors.textInverse} />
              ) : (
                <Text style={[styles.stepDotText, styles.stepDotTextActive]}>4</Text>
              )}
            </View>
            {step < 4 && (
              <View style={[styles.stepLine, { backgroundColor: Colors.primary }]} />
            )}
          </View>
        ))}
      </View>

      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 100 }]}
        showsVerticalScrollIndicator={false}
      >
        <LinearGradient
          colors={[Colors.primary, Colors.primaryDark]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.summaryBanner}
        >
          <Text style={styles.summaryTitle}>SEEDi Action Brief</Text>
          <Text style={styles.summarySubtitle}>
            {currentProject?.title || "Decision Project"}
          </Text>
          <View style={styles.summaryMeta}>
            <View style={styles.summaryPill}>
              <Ionicons name="bulb" size={14} color={Colors.primary} />
              <Text style={styles.summaryPillText}>
                {selectedInnovations.length} Innovations
              </Text>
            </View>
            <View style={styles.summaryPill}>
              <Ionicons name="calendar" size={14} color={Colors.primary} />
              <Text style={styles.summaryPillText}>
                {currentProject?.updatedAt || new Date().toISOString().split("T")[0]}
              </Text>
            </View>
          </View>
        </LinearGradient>

        <BriefSection title="Context Summary" icon="person">
          <View style={styles.contextGrid}>
            {ctx && (
              <>
                <View style={styles.contextItem}>
                  <Text style={styles.contextLabel}>Role</Text>
                  <Text style={styles.contextValue}>{ctx.role}</Text>
                </View>
                <View style={styles.contextItem}>
                  <Text style={styles.contextLabel}>Objective</Text>
                  <Text style={styles.contextValue}>{ctx.primaryObjective}</Text>
                </View>
                <View style={styles.contextItem}>
                  <Text style={styles.contextLabel}>Region</Text>
                  <Text style={styles.contextValue}>{ctx.region}</Text>
                </View>
                {ctx.primaryCrop ? (
                  <View style={styles.contextItem}>
                    <Text style={styles.contextLabel}>Crop</Text>
                    <Text style={styles.contextValue}>{ctx.primaryCrop}</Text>
                  </View>
                ) : null}
              </>
            )}
          </View>
        </BriefSection>

        <BriefSection title="Key Indicators" icon="analytics">
          <View style={styles.indicatorGrid}>
            <KeyIndicator label="Impact Score" value={`${avgImpact}/100`} trend="positive" />
            <KeyIndicator label="Feasibility" value={`${avgFeasibility}/100`} trend="positive" />
            <KeyIndicator label="Sustainability" value={`${avgSustainability}/100`} trend="positive" />
            <KeyIndicator label="Post-Harvest Loss" value={`${projectedLoss}%`} trend="positive" />
            <KeyIndicator label="Soil Health" value={`${soilHealth}/100`} trend="neutral" />
            <KeyIndicator label="Water Efficiency" value={`${waterEfficiency}/100`} trend="neutral" />
            <KeyIndicator label="Biodiversity" value={`${biodiversityIndex}/100`} trend="neutral" />
          </View>
        </BriefSection>

        <BriefSection title="Recommended Innovations" icon="bulb">
          {selectedInnovations.map((inn, idx) => (
            <View key={inn.id} style={styles.innItem}>
              <View style={styles.innRank}>
                <Text style={styles.innRankText}>{idx + 1}</Text>
              </View>
              <View style={styles.innInfo}>
                <Text style={styles.innName}>{inn.name}</Text>
                <Text style={styles.innCategory}>{inn.category}</Text>
                <View style={styles.innScores}>
                  <Text style={styles.innScore}>
                    Impact: {inn.impactScore}
                  </Text>
                  <Text style={styles.innScore}>
                    Feasibility: {inn.feasibilityScore}
                  </Text>
                </View>
              </View>
            </View>
          ))}
        </BriefSection>

        <BriefSection title="Risk Notes" icon="warning">
          <View style={styles.riskList}>
            <View style={styles.riskItem}>
              <Ionicons name="alert-circle" size={16} color={Colors.warning} />
              <Text style={styles.riskText}>
                Climate variability may affect projected outcomes. Monitor seasonal forecasts.
              </Text>
            </View>
            <View style={styles.riskItem}>
              <Ionicons name="alert-circle" size={16} color={Colors.warning} />
              <Text style={styles.riskText}>
                Adoption rates vary by region. Local extension services recommended for implementation support.
              </Text>
            </View>
            <View style={styles.riskItem}>
              <Ionicons name="information-circle" size={16} color={Colors.info} />
              <Text style={styles.riskText}>
                Budget and infrastructure requirements should be verified against local conditions.
              </Text>
            </View>
          </View>
        </BriefSection>
      </ScrollView>

      <View
        style={[styles.bottomBar, { paddingBottom: insets.bottom + (Platform.OS === "web" ? 34 : 10) }]}
      >
        <Pressable
          style={({ pressed }) => [styles.backBtn, pressed && { opacity: 0.8 }]}
          onPress={() => router.back()}
        >
          <Text style={styles.backText}>Back</Text>
        </Pressable>
        <Pressable
          style={({ pressed }) => [styles.exportBtn, pressed && { opacity: 0.9, transform: [{ scale: 0.97 }] }]}
          onPress={handleExport}
        >
          <Ionicons name="download" size={16} color={Colors.textInverse} />
          <Text style={styles.exportText}>Export Brief</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  headerCenter: { alignItems: "center" },
  headerStage: { fontSize: 12, fontFamily: "DMSans_500Medium", color: Colors.textMuted },
  headerTitle: { fontSize: 18, fontFamily: "DMSans_700Bold", color: Colors.text, marginTop: 2 },
  stepIndicator: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 40,
    paddingBottom: 8,
  },
  stepRow: { flexDirection: "row", alignItems: "center" },
  stepDot: { width: 28, height: 28, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  stepDotActive: { backgroundColor: Colors.primary },
  stepDotInactive: { backgroundColor: Colors.borderLight },
  stepDotText: { fontSize: 13, fontFamily: "DMSans_600SemiBold" },
  stepDotTextActive: { color: Colors.textInverse },
  stepDotTextInactive: { color: Colors.textMuted },
  stepLine: { width: 40, height: 2, backgroundColor: Colors.borderLight, marginHorizontal: 4 },
  scrollContent: { paddingHorizontal: 20, paddingTop: 8 },
  summaryBanner: {
    borderRadius: 20,
    padding: 22,
    marginBottom: 20,
  },
  summaryTitle: { fontSize: 22, fontFamily: "DMSans_700Bold", color: Colors.textInverse },
  summarySubtitle: { fontSize: 14, fontFamily: "DMSans_400Regular", color: "rgba(255,255,255,0.8)", marginTop: 4 },
  summaryMeta: { flexDirection: "row", gap: 10, marginTop: 14 },
  summaryPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: Colors.textInverse,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  summaryPillText: { fontSize: 12, fontFamily: "DMSans_600SemiBold", color: Colors.primary },
  briefSection: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  briefHeader: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 14 },
  briefTitle: { fontSize: 16, fontFamily: "DMSans_600SemiBold", color: Colors.text },
  contextGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  contextItem: {
    flexBasis: "47%",
    flexGrow: 1,
    backgroundColor: Colors.background,
    borderRadius: 10,
    padding: 10,
  },
  contextLabel: { fontSize: 11, fontFamily: "DMSans_500Medium", color: Colors.textMuted },
  contextValue: { fontSize: 14, fontFamily: "DMSans_600SemiBold", color: Colors.text, marginTop: 2 },
  indicatorGrid: { gap: 6 },
  indicatorItem: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 6 },
  indicatorLabel: { fontSize: 14, fontFamily: "DMSans_400Regular", color: Colors.textSecondary },
  indicatorValue: { fontSize: 14, fontFamily: "DMSans_700Bold" },
  innItem: {
    flexDirection: "row",
    gap: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  innRank: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
  },
  innRankText: { fontSize: 13, fontFamily: "DMSans_700Bold", color: Colors.primary },
  innInfo: { flex: 1 },
  innName: { fontSize: 14, fontFamily: "DMSans_600SemiBold", color: Colors.text },
  innCategory: { fontSize: 12, fontFamily: "DMSans_400Regular", color: Colors.textMuted, marginTop: 2 },
  innScores: { flexDirection: "row", gap: 12, marginTop: 4 },
  innScore: { fontSize: 11, fontFamily: "DMSans_500Medium", color: Colors.textSecondary },
  riskList: { gap: 10 },
  riskItem: { flexDirection: "row", gap: 8, alignItems: "flex-start" },
  riskText: { flex: 1, fontSize: 13, fontFamily: "DMSans_400Regular", color: Colors.textSecondary, lineHeight: 18 },
  bottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 12,
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.cardBorder,
  },
  backBtn: { paddingHorizontal: 20, paddingVertical: 12 },
  backText: { fontSize: 14, fontFamily: "DMSans_500Medium", color: Colors.textSecondary },
  exportBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: Colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
  },
  exportText: { fontSize: 14, fontFamily: "DMSans_600SemiBold", color: Colors.textInverse },
});
