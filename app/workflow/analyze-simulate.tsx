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
import Animated, {
  useAnimatedStyle,
  withTiming,
  useSharedValue,
} from "react-native-reanimated";
import Colors from "@/constants/colors";
import { useSeed } from "@/contexts/SeedContext";
import { MOCK_INNOVATIONS } from "@/constants/data";

function ProjectionCard({
  value,
  label,
  subtitle,
  color,
  icon,
  prefix,
  suffix,
}: {
  value: string;
  label: string;
  subtitle: string;
  color: string;
  icon: string;
  prefix?: string;
  suffix?: string;
}) {
  return (
    <View style={[styles.projCard, { borderTopColor: color, borderTopWidth: 3 }]}>
      <View style={[styles.projIconWrap, { backgroundColor: color + "18" }]}>
        <Ionicons name={icon as any} size={20} color={color} />
      </View>
      <Text style={[styles.projValue, { color }]}>
        {prefix}{value}{suffix}
      </Text>
      <Text style={styles.projLabel}>{label}</Text>
      <Text style={styles.projSub}>{subtitle}</Text>
    </View>
  );
}

function BarChart({
  data,
  colors,
  maxVal,
  label,
}: {
  data: { name: string; value: number }[];
  colors: string[];
  maxVal: number;
  label: string;
}) {
  return (
    <View style={styles.barChartWrap}>
      <Text style={styles.barChartLabel}>{label}</Text>
      {data.map((item, i) => (
        <View key={item.name} style={styles.barRow}>
          <Text style={styles.barName} numberOfLines={1}>{item.name}</Text>
          <View style={styles.barTrack}>
            <View
              style={[
                styles.barFill,
                {
                  width: `${Math.min((item.value / maxVal) * 100, 100)}%`,
                  backgroundColor: colors[i % colors.length],
                },
              ]}
            />
          </View>
          <Text style={styles.barValue}>{item.value}</Text>
        </View>
      ))}
    </View>
  );
}

function RadarPoint({
  label,
  value,
  maxValue,
  angle,
  radius,
  color,
}: {
  label: string;
  value: number;
  maxValue: number;
  angle: number;
  radius: number;
  color: string;
}) {
  const normalizedValue = (value / maxValue) * radius;
  const x = normalizedValue * Math.cos((angle * Math.PI) / 180);
  const y = normalizedValue * Math.sin((angle * Math.PI) / 180);
  const labelX = (radius + 24) * Math.cos((angle * Math.PI) / 180);
  const labelY = (radius + 24) * Math.sin((angle * Math.PI) / 180);

  return (
    <>
      <View
        style={[
          styles.radarDot,
          {
            left: 120 + x - 5,
            top: 120 + y - 5,
            backgroundColor: color,
          },
        ]}
      />
      <View
        style={[
          styles.radarLine,
          {
            left: 120,
            top: 120,
            width: normalizedValue,
            transform: [{ rotate: `${angle}deg` }],
            backgroundColor: color + "60",
          },
        ]}
      />
      <Text
        style={[
          styles.radarLabel,
          {
            left: 120 + labelX - 30,
            top: 120 + labelY - 8,
          },
        ]}
        numberOfLines={1}
      >
        {label}
      </Text>
    </>
  );
}

function SimpleRadarChart({
  data,
  color,
}: {
  data: { label: string; value: number }[];
  color: string;
}) {
  const radius = 70;
  const angleStep = 360 / data.length;

  return (
    <View style={styles.radarContainer}>
      <View style={[styles.radarCircle, { width: radius * 2, height: radius * 2, borderRadius: radius }]} />
      <View style={[styles.radarCircle, { width: radius * 1.4, height: radius * 1.4, borderRadius: radius * 0.7, left: 120 - radius * 0.7, top: 120 - radius * 0.7 }]} />
      <View style={[styles.radarCircle, { width: radius * 0.7, height: radius * 0.7, borderRadius: radius * 0.35, left: 120 - radius * 0.35, top: 120 - radius * 0.35 }]} />
      {data.map((item, i) => (
        <RadarPoint
          key={item.label}
          label={item.label}
          value={item.value}
          maxValue={100}
          angle={i * angleStep - 90}
          radius={radius}
          color={color}
        />
      ))}
    </View>
  );
}

function TimelineChart({
  baselineValues,
  projectedValues,
  labels,
}: {
  baselineValues: number[];
  projectedValues: number[];
  labels: string[];
}) {
  const maxVal = Math.max(...baselineValues, ...projectedValues);
  const chartHeight = 120;

  return (
    <View style={styles.timelineChart}>
      <View style={styles.timelineArea}>
        {labels.map((label, i) => {
          const baseH = (baselineValues[i] / maxVal) * chartHeight;
          const projH = (projectedValues[i] / maxVal) * chartHeight;
          return (
            <View key={label} style={styles.timelineCol}>
              <View style={styles.timelineBars}>
                <View style={[styles.timelineBarBase, { height: baseH }]} />
                <View style={[styles.timelineBarProj, { height: projH }]} />
              </View>
              <Text style={styles.timelineLabel}>{label}</Text>
            </View>
          );
        })}
      </View>
      <View style={styles.timelineLegend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: Colors.borderLight }]} />
          <Text style={styles.legendText}>Current</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: Colors.primary }]} />
          <Text style={styles.legendText}>Projected (5yr)</Text>
        </View>
      </View>
    </View>
  );
}

function ComparisonRow({
  label,
  values,
  colors,
}: {
  label: string;
  values: number[];
  colors: string[];
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

  const projectedYield = selectedInnovations.length
    ? Math.round(selectedInnovations.reduce((s, i) => s + i.yieldImpact, 0) / selectedInnovations.length)
    : 0;
  const projectedLossReduction = selectedInnovations.length
    ? Math.round(selectedInnovations.reduce((s, i) => s + i.lossReduction, 0) / selectedInnovations.length)
    : 0;
  const projectedIncome = selectedInnovations.length
    ? Math.round(selectedInnovations.reduce((s, i) => s + i.incomePerHa, 0) / selectedInnovations.length)
    : 0;
  const projectedSoilImpact = selectedInnovations.length
    ? Math.round(selectedInnovations.reduce((s, i) => s + i.soilHealthImpact, 0) / selectedInnovations.length)
    : 0;

  const avgImpact = selectedInnovations.length
    ? Math.round(selectedInnovations.reduce((s, i) => s + i.impactScore, 0) / selectedInnovations.length)
    : 0;
  const avgFeasibility = selectedInnovations.length
    ? Math.round(selectedInnovations.reduce((s, i) => s + i.feasibilityScore, 0) / selectedInnovations.length)
    : 0;
  const avgSustainability = selectedInnovations.length
    ? Math.round(selectedInnovations.reduce((s, i) => s + i.sustainabilityScore, 0) / selectedInnovations.length)
    : 0;

  const projectedLoss = Math.max(2, postHarvestLoss - Math.round(projectedLossReduction * 0.28));
  const projectedWater = Math.min(95, waterEfficiency + Math.round(avgSustainability * 0.2));
  const projectedSoil = Math.min(95, soilHealth + projectedSoilImpact);

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
        <Text style={styles.analysisIntro}>
          Projected outcomes for {selectedInnovations.length} selected innovation{selectedInnovations.length !== 1 ? "s" : ""}
        </Text>

        <View style={styles.projectionGrid}>
          <ProjectionCard
            value={`${projectedYield}%`}
            label="Yield Increase"
            subtitle="By 2030 (5-year horizon)"
            color={Colors.primary}
            icon="trending-up"
            prefix="+"
          />
          <ProjectionCard
            value={`${projectedLossReduction}%`}
            label="Loss Reduction"
            subtitle="Post-harvest losses"
            color={Colors.danger}
            icon="shield-checkmark"
            prefix="-"
          />
          <ProjectionCard
            value={`$${projectedIncome.toLocaleString()}`}
            label="Income Potential"
            subtitle="Per hectare annually"
            color={Colors.accent}
            icon="cash"
            prefix="+"
          />
          <ProjectionCard
            value={`${projectedSoilImpact}%`}
            label="Soil Health"
            subtitle="Health index improvement"
            color={Colors.success}
            icon="leaf"
            prefix="+"
          />
        </View>

        <Text style={styles.sectionTitle}>Impact Analysis</Text>
        <View style={styles.chartCard}>
          <SimpleRadarChart
            data={[
              { label: "Impact", value: avgImpact },
              { label: "Feasibility", value: avgFeasibility },
              { label: "Sustain.", value: avgSustainability },
              { label: "Readiness", value: selectedInnovations.length ? Math.round(selectedInnovations.reduce((s, i) => s + (i.readinessLevel / 9) * 100, 0) / selectedInnovations.length) : 0 },
              { label: "Adoption", value: selectedInnovations.length ? Math.round(selectedInnovations.reduce((s, i) => s + (i.adoptionLevel / 9) * 100, 0) / selectedInnovations.length) : 0 },
            ]}
            color={Colors.primary}
          />
        </View>

        <Text style={styles.sectionTitle}>Before vs After Projection</Text>
        <View style={styles.chartCard}>
          <TimelineChart
            baselineValues={[postHarvestLoss, waterEfficiency, soilHealth, biodiversityIndex]}
            projectedValues={[projectedLoss, projectedWater, projectedSoil, Math.min(85, biodiversityIndex + projectedSoilImpact)]}
            labels={["Post-Harvest\nLoss", "Water\nEfficiency", "Soil\nHealth", "Biodiversity"]}
          />
        </View>

        <Text style={styles.sectionTitle}>Before vs After Details</Text>
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
          <BarChart
            label="Impact Score"
            data={selectedInnovations.slice(0, 5).map((i) => ({
              name: i.name.length > 18 ? i.name.substring(0, 18) + "..." : i.name,
              value: i.impactScore,
            }))}
            colors={barColors}
            maxVal={100}
          />
          <BarChart
            label="Feasibility Score"
            data={selectedInnovations.slice(0, 5).map((i) => ({
              name: i.name.length > 18 ? i.name.substring(0, 18) + "..." : i.name,
              value: i.feasibilityScore,
            }))}
            colors={barColors}
            maxVal={100}
          />
          <BarChart
            label="Sustainability Score"
            data={selectedInnovations.slice(0, 5).map((i) => ({
              name: i.name.length > 18 ? i.name.substring(0, 18) + "..." : i.name,
              value: i.sustainabilityScore,
            }))}
            colors={barColors}
            maxVal={100}
          />
        </View>

        <Text style={styles.sectionTitle}>Yield & Income Projections</Text>
        <View style={styles.compCard}>
          <BarChart
            label="Projected Yield Increase (%)"
            data={selectedInnovations.slice(0, 5).map((i) => ({
              name: i.name.length > 18 ? i.name.substring(0, 18) + "..." : i.name,
              value: i.yieldImpact,
            }))}
            colors={[Colors.primary, Colors.primary, Colors.primary, Colors.primary, Colors.primary]}
            maxVal={Math.max(...selectedInnovations.map((i) => i.yieldImpact), 60)}
          />
          <View style={{ height: 12 }} />
          <BarChart
            label="Income Per Hectare ($)"
            data={selectedInnovations.slice(0, 5).map((i) => ({
              name: i.name.length > 18 ? i.name.substring(0, 18) + "..." : i.name,
              value: i.incomePerHa,
            }))}
            colors={[Colors.accent, Colors.accent, Colors.accent, Colors.accent, Colors.accent]}
            maxVal={Math.max(...selectedInnovations.map((i) => i.incomePerHa), 1000)}
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
                  <View style={styles.sdgBarTrack}>
                    <View
                      style={[
                        styles.sdgBarFill,
                        { width: `${(count / selectedInnovations.length) * 100}%` },
                      ]}
                    />
                  </View>
                  <Text style={styles.sdgCount}>
                    {count}/{selectedInnovations.length}
                  </Text>
                </View>
              );
            })}
        </View>

        <Text style={styles.sectionTitle}>Risk Assessment</Text>
        <View style={styles.riskCard}>
          {selectedInnovations.slice(0, 5).map((inn) => (
            <View key={inn.id} style={styles.riskRow}>
              <Text style={styles.riskName} numberOfLines={1}>{inn.name}</Text>
              <View style={styles.riskMeta}>
                <View style={[
                  styles.riskPill,
                  {
                    backgroundColor: inn.riskLevel === "low" ? Colors.successLight
                      : inn.riskLevel === "medium" ? Colors.warningLight : Colors.dangerLight,
                  },
                ]}>
                  <Text style={[
                    styles.riskPillText,
                    {
                      color: inn.riskLevel === "low" ? Colors.success
                        : inn.riskLevel === "medium" ? Colors.warning : Colors.danger,
                    },
                  ]}>
                    {inn.riskLevel}
                  </Text>
                </View>
                <View style={[styles.scalePill, { backgroundColor: Colors.infoLight }]}>
                  <Text style={[styles.scalePillText, { color: Colors.info }]}>
                    {inn.scalability} scale
                  </Text>
                </View>
              </View>
            </View>
          ))}
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
  analysisIntro: {
    fontSize: 13,
    fontFamily: "DMSans_400Regular",
    color: Colors.textSecondary,
    textAlign: "center",
    marginBottom: 16,
  },
  projectionGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 16,
  },
  projCard: {
    flexBasis: "47%",
    flexGrow: 1,
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    alignItems: "center",
  },
  projIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  projValue: { fontSize: 22, fontFamily: "DMSans_700Bold", marginBottom: 2 },
  projLabel: { fontSize: 12, fontFamily: "DMSans_600SemiBold", color: Colors.text, textAlign: "center" as const },
  projSub: { fontSize: 10, fontFamily: "DMSans_400Regular", color: Colors.textMuted, textAlign: "center" as const, marginTop: 2 },
  sectionTitle: { fontSize: 17, fontFamily: "DMSans_600SemiBold", color: Colors.text, marginBottom: 12, marginTop: 8 },
  chartCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    alignItems: "center",
  },
  radarContainer: {
    width: 240,
    height: 240,
    position: "relative",
  },
  radarCircle: {
    position: "absolute",
    borderWidth: 1,
    borderColor: Colors.borderLight,
    left: 120 - 70,
    top: 120 - 70,
  },
  radarDot: {
    position: "absolute",
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  radarLine: {
    position: "absolute",
    height: 2,
    borderRadius: 1,
    transformOrigin: "left center",
  },
  radarLabel: {
    position: "absolute",
    fontSize: 10,
    fontFamily: "DMSans_500Medium",
    color: Colors.textSecondary,
    width: 60,
    textAlign: "center" as const,
  },
  timelineChart: {
    width: "100%",
  },
  timelineArea: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "flex-end",
    height: 140,
    paddingBottom: 24,
  },
  timelineCol: {
    alignItems: "center",
    flex: 1,
  },
  timelineBars: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 4,
    marginBottom: 6,
  },
  timelineBarBase: {
    width: 20,
    backgroundColor: Colors.borderLight,
    borderRadius: 4,
    minHeight: 4,
  },
  timelineBarProj: {
    width: 20,
    backgroundColor: Colors.primary,
    borderRadius: 4,
    minHeight: 4,
  },
  timelineLabel: {
    fontSize: 9,
    fontFamily: "DMSans_500Medium",
    color: Colors.textMuted,
    textAlign: "center" as const,
  },
  timelineLegend: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 16,
    marginTop: 4,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    fontSize: 11,
    fontFamily: "DMSans_400Regular",
    color: Colors.textMuted,
  },
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
  compRow: { marginBottom: 10 },
  compLabel: { fontSize: 12, fontFamily: "DMSans_500Medium", color: Colors.textMuted, marginBottom: 4 },
  compBars: { gap: 3 },
  compBarWrap: { flexDirection: "row", alignItems: "center", gap: 6 },
  compBarTrack: { flex: 1, height: 6, backgroundColor: Colors.borderLight, borderRadius: 3 },
  compBarFill: { height: 6, borderRadius: 3 },
  compBarValue: { fontSize: 11, fontFamily: "DMSans_600SemiBold", color: Colors.text, width: 24, textAlign: "right" as const },
  barChartWrap: { marginBottom: 14 },
  barChartLabel: { fontSize: 12, fontFamily: "DMSans_600SemiBold", color: Colors.text, marginBottom: 8 },
  barRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 6 },
  barName: { fontSize: 10, fontFamily: "DMSans_400Regular", color: Colors.textSecondary, width: 80 },
  barTrack: { flex: 1, height: 8, backgroundColor: Colors.borderLight, borderRadius: 4 },
  barFill: { height: 8, borderRadius: 4 },
  barValue: { fontSize: 11, fontFamily: "DMSans_700Bold", color: Colors.text, width: 30, textAlign: "right" as const },
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
  sdgLabel: { fontSize: 13, fontFamily: "DMSans_500Medium", color: Colors.text, width: 50 },
  sdgBarTrack: { flex: 1, height: 6, backgroundColor: Colors.borderLight, borderRadius: 3 },
  sdgBarFill: { height: 6, borderRadius: 3, backgroundColor: Colors.primary },
  sdgCount: { fontSize: 12, fontFamily: "DMSans_500Medium", color: Colors.textMuted, width: 30, textAlign: "right" as const },
  riskCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    gap: 8,
  },
  riskRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 4,
  },
  riskName: { fontSize: 13, fontFamily: "DMSans_500Medium", color: Colors.text, flex: 1, marginRight: 8 },
  riskMeta: { flexDirection: "row", gap: 6 },
  riskPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  riskPillText: { fontSize: 10, fontFamily: "DMSans_600SemiBold", textTransform: "capitalize" as const },
  scalePill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  scalePillText: { fontSize: 10, fontFamily: "DMSans_600SemiBold", textTransform: "capitalize" as const },
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
