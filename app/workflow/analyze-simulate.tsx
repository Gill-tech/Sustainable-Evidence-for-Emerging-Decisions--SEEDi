import React, { useMemo } from "react";
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
import Colors from "@/constants/colors";
import { useSeed } from "@/contexts/SeedContext";
import { MOCK_INNOVATIONS } from "@/constants/data";

function MetricCard({
  icon,
  iconColor,
  iconBg,
  label,
  value,
  unit,
  trend,
}: {
  icon: string;
  iconColor: string;
  iconBg: string;
  label: string;
  value: string;
  unit: string;
  trend?: "up" | "down";
}) {
  return (
    <View style={styles.metricCard}>
      <View style={[styles.metricIcon, { backgroundColor: iconBg }]}>
        <Ionicons name={icon as any} size={18} color={iconColor} />
      </View>
      <Text style={styles.metricLabel}>{label}</Text>
      <View style={styles.metricValueRow}>
        <Text style={styles.metricValue}>{value}</Text>
        <Text style={styles.metricUnit}>{unit}</Text>
        {trend && (
          <Ionicons
            name={trend === "up" ? "trending-up" : "trending-down"}
            size={14}
            color={trend === "up" ? Colors.success : Colors.danger}
          />
        )}
      </View>
    </View>
  );
}

function ComparisonRow({
  label,
  values,
  colors,
  names,
}: {
  label: string;
  values: number[];
  colors: string[];
  names: string[];
}) {
  return (
    <View style={styles.compRow}>
      <Text style={styles.compLabel}>{label}</Text>
      <View style={styles.compBars}>
        {values.map((v, i) => (
          <View key={i} style={styles.compBarWrap}>
            <View style={styles.compBarTrack}>
              <View
                style={[styles.compBarFill, { width: `${v}%`, backgroundColor: colors[i] }]}
              />
            </View>
            <Text style={styles.compBarValue}>{v}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

export default function AnalyzeSimulateScreen() {
  const insets = useSafeAreaInsets();
  const { currentProject, advanceStage, soilHealth, waterEfficiency, biodiversityIndex, postHarvestLoss } = useSeed();
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
  const projectedWater = Math.min(95, waterEfficiency + Math.round(avgSustainability * 0.2));
  const projectedSoil = Math.min(95, soilHealth + Math.round(avgFeasibility * 0.15));

  const barColors = [Colors.primary, Colors.info, Colors.accent, Colors.success, Colors.warning];

  const handleContinue = async () => {
    if (!currentProject) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await advanceStage(currentProject.id);
    router.push("/workflow/generate-action" as any);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top + webTopInset }]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </Pressable>
        <View style={styles.headerCenter}>
          <Text style={styles.headerStage}>Stage 3 of 4</Text>
          <Text style={styles.headerTitle}>Analyze & Simulate</Text>
        </View>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.stepIndicator}>
        {[1, 2, 3, 4].map((step) => (
          <View key={step} style={styles.stepRow}>
            <View
              style={[
                styles.stepDot,
                step <= 3 ? styles.stepDotActive : styles.stepDotInactive,
              ]}
            >
              {step < 3 ? (
                <Ionicons name="checkmark" size={14} color={Colors.textInverse} />
              ) : (
                <Text
                  style={[
                    styles.stepDotText,
                    step <= 3 ? styles.stepDotTextActive : styles.stepDotTextInactive,
                  ]}
                >
                  {step}
                </Text>
              )}
            </View>
            {step < 4 && (
              <View
                style={[styles.stepLine, step < 3 && { backgroundColor: Colors.primary }]}
              />
            )}
          </View>
        ))}
      </View>

      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 100 }]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.sectionTitle}>Projected Impact</Text>
        <View style={styles.metricsGrid}>
          <MetricCard
            icon="trending-up"
            iconColor={Colors.primary}
            iconBg={Colors.primaryLight}
            label="Avg Impact Score"
            value={avgImpact.toString()}
            unit="/100"
            trend="up"
          />
          <MetricCard
            icon="construct"
            iconColor={Colors.info}
            iconBg={Colors.infoLight}
            label="Avg Feasibility"
            value={avgFeasibility.toString()}
            unit="/100"
          />
          <MetricCard
            icon="leaf"
            iconColor={Colors.success}
            iconBg={Colors.successLight}
            label="Sustainability"
            value={avgSustainability.toString()}
            unit="/100"
            trend="up"
          />
          <MetricCard
            icon="warning"
            iconColor={Colors.danger}
            iconBg={Colors.dangerLight}
            label="Projected Loss"
            value={`${projectedLoss}%`}
            unit=""
            trend="down"
          />
        </View>

        <Text style={styles.sectionTitle}>Before vs After Simulation</Text>
        <View style={styles.simCard}>
          <View style={styles.simRow}>
            <Text style={styles.simLabel}>Post-Harvest Loss</Text>
            <View style={styles.simValues}>
              <View style={styles.simBefore}>
                <Text style={styles.simBeforeText}>{postHarvestLoss}%</Text>
              </View>
              <Ionicons name="arrow-forward" size={14} color={Colors.textMuted} />
              <View style={styles.simAfter}>
                <Text style={styles.simAfterText}>{projectedLoss}%</Text>
              </View>
            </View>
          </View>
          <View style={styles.simDivider} />
          <View style={styles.simRow}>
            <Text style={styles.simLabel}>Water Efficiency</Text>
            <View style={styles.simValues}>
              <View style={styles.simBefore}>
                <Text style={styles.simBeforeText}>{waterEfficiency}%</Text>
              </View>
              <Ionicons name="arrow-forward" size={14} color={Colors.textMuted} />
              <View style={styles.simAfter}>
                <Text style={styles.simAfterText}>{projectedWater}%</Text>
              </View>
            </View>
          </View>
          <View style={styles.simDivider} />
          <View style={styles.simRow}>
            <Text style={styles.simLabel}>Soil Health</Text>
            <View style={styles.simValues}>
              <View style={styles.simBefore}>
                <Text style={styles.simBeforeText}>{soilHealth}%</Text>
              </View>
              <Ionicons name="arrow-forward" size={14} color={Colors.textMuted} />
              <View style={styles.simAfter}>
                <Text style={styles.simAfterText}>{projectedSoil}%</Text>
              </View>
            </View>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Innovation Comparison</Text>
        <View style={styles.compCard}>
          <View style={styles.compLegend}>
            {selectedInnovations.slice(0, 5).map((inn, i) => (
              <View key={inn.id} style={styles.legendItem}>
                <View
                  style={[styles.legendDot, { backgroundColor: barColors[i % barColors.length] }]}
                />
                <Text style={styles.legendText} numberOfLines={1}>
                  {inn.name}
                </Text>
              </View>
            ))}
          </View>
          <ComparisonRow
            label="Impact"
            values={selectedInnovations.slice(0, 5).map((i) => i.impactScore)}
            colors={barColors}
            names={selectedInnovations.map((i) => i.name)}
          />
          <ComparisonRow
            label="Feasibility"
            values={selectedInnovations.slice(0, 5).map((i) => i.feasibilityScore)}
            colors={barColors}
            names={selectedInnovations.map((i) => i.name)}
          />
          <ComparisonRow
            label="Sustainability"
            values={selectedInnovations.slice(0, 5).map((i) => i.sustainabilityScore)}
            colors={barColors}
            names={selectedInnovations.map((i) => i.name)}
          />
        </View>

        <Text style={styles.sectionTitle}>SDG Alignment</Text>
        <View style={styles.sdgCard}>
          {Array.from(
            new Set(selectedInnovations.flatMap((i) => i.sdgAlignment))
          )
            .sort((a, b) => a - b)
            .map((sdg) => {
              const count = selectedInnovations.filter((i) =>
                i.sdgAlignment.includes(sdg)
              ).length;
              return (
                <View key={sdg} style={styles.sdgRow}>
                  <View style={styles.sdgBadge}>
                    <Text style={styles.sdgNum}>{sdg}</Text>
                  </View>
                  <Text style={styles.sdgLabel}>SDG {sdg}</Text>
                  <Text style={styles.sdgCount}>
                    {count} innovation{count > 1 ? "s" : ""}
                  </Text>
                </View>
              );
            })}
        </View>
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
          style={({ pressed }) => [styles.continueBtn, pressed && { opacity: 0.9 }]}
          onPress={handleContinue}
        >
          <Text style={styles.continueText}>Generate Action</Text>
          <Ionicons name="arrow-forward" size={16} color={Colors.textInverse} />
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
  sectionTitle: { fontSize: 17, fontFamily: "DMSans_600SemiBold", color: Colors.text, marginBottom: 12, marginTop: 8 },
  metricsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 12 },
  metricCard: {
    flexBasis: "47%",
    flexGrow: 1,
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  metricIcon: { width: 34, height: 34, borderRadius: 10, alignItems: "center", justifyContent: "center", marginBottom: 8 },
  metricLabel: { fontSize: 12, fontFamily: "DMSans_400Regular", color: Colors.textSecondary },
  metricValueRow: { flexDirection: "row", alignItems: "baseline", gap: 2, marginTop: 4 },
  metricValue: { fontSize: 22, fontFamily: "DMSans_700Bold", color: Colors.text },
  metricUnit: { fontSize: 12, fontFamily: "DMSans_400Regular", color: Colors.textMuted },
  simCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  simRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 8 },
  simLabel: { fontSize: 14, fontFamily: "DMSans_500Medium", color: Colors.text },
  simValues: { flexDirection: "row", alignItems: "center", gap: 8 },
  simBefore: { backgroundColor: Colors.dangerLight, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  simBeforeText: { fontSize: 13, fontFamily: "DMSans_600SemiBold", color: Colors.danger },
  simAfter: { backgroundColor: Colors.successLight, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  simAfterText: { fontSize: 13, fontFamily: "DMSans_600SemiBold", color: Colors.success },
  simDivider: { height: 1, backgroundColor: Colors.divider },
  compCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  compLegend: { marginBottom: 12, gap: 4 },
  legendItem: { flexDirection: "row", alignItems: "center", gap: 6 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendText: { fontSize: 12, fontFamily: "DMSans_400Regular", color: Colors.textSecondary, flex: 1 },
  compRow: { marginBottom: 10 },
  compLabel: { fontSize: 12, fontFamily: "DMSans_500Medium", color: Colors.textMuted, marginBottom: 4 },
  compBars: { gap: 3 },
  compBarWrap: { flexDirection: "row", alignItems: "center", gap: 6 },
  compBarTrack: { flex: 1, height: 6, backgroundColor: Colors.borderLight, borderRadius: 3 },
  compBarFill: { height: 6, borderRadius: 3 },
  compBarValue: { fontSize: 11, fontFamily: "DMSans_600SemiBold", color: Colors.text, width: 24, textAlign: "right" as const },
  sdgCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    gap: 8,
  },
  sdgRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  sdgBadge: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: Colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
  },
  sdgNum: { fontSize: 13, fontFamily: "DMSans_700Bold", color: Colors.primary },
  sdgLabel: { flex: 1, fontSize: 14, fontFamily: "DMSans_500Medium", color: Colors.text },
  sdgCount: { fontSize: 12, fontFamily: "DMSans_400Regular", color: Colors.textMuted },
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
  continueBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: Colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
  },
  continueText: { fontSize: 14, fontFamily: "DMSans_600SemiBold", color: Colors.textInverse },
});
