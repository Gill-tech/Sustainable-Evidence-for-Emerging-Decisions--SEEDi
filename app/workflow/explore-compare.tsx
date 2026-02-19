import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  TextInput,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import * as Haptics from "expo-haptics";
import Colors from "@/constants/colors";
import { useSeed } from "@/contexts/SeedContext";
import { Innovation, CATEGORIES } from "@/constants/data";

function ScoreBar({ value, color }: { value: number; color: string }) {
  return (
    <View style={innStyles.scoreTrack}>
      <View
        style={[innStyles.scoreFill, { width: `${value}%`, backgroundColor: color }]}
      />
    </View>
  );
}

function RiskBadge({ level }: { level: string }) {
  const color = level === "low" ? Colors.success : level === "medium" ? Colors.warning : Colors.danger;
  const bg = level === "low" ? Colors.successLight : level === "medium" ? Colors.warningLight : Colors.dangerLight;
  return (
    <View style={[innStyles.riskBadge, { backgroundColor: bg }]}>
      <View style={[innStyles.riskDot, { backgroundColor: color }]} />
      <Text style={[innStyles.riskText, { color }]}>{level}</Text>
    </View>
  );
}

function InnovationCard({
  innovation,
  selected,
  onToggle,
  userRole,
}: {
  innovation: Innovation;
  selected: boolean;
  onToggle: () => void;
  userRole?: string;
}) {
  const relevanceText = userRole && innovation.roleRelevance?.[userRole]
    ? innovation.roleRelevance[userRole]
    : null;

  return (
    <Pressable
      style={[innStyles.card, selected && innStyles.cardSelected]}
      onPress={onToggle}
    >
      <View style={innStyles.cardHeader}>
        <View style={innStyles.categoryPill}>
          <Text style={innStyles.categoryText}>{innovation.category}</Text>
        </View>
        <Pressable onPress={onToggle} hitSlop={10}>
          <Ionicons
            name={selected ? "checkmark-circle" : "add-circle-outline"}
            size={24}
            color={selected ? Colors.primary : Colors.textMuted}
          />
        </Pressable>
      </View>
      <Text style={innStyles.cardTitle}>{innovation.name}</Text>
      <Text style={innStyles.cardDesc} numberOfLines={2}>
        {innovation.description}
      </Text>

      {relevanceText && (
        <View style={innStyles.relevanceBox}>
          <View style={innStyles.relevanceHeader}>
            <Ionicons name="bulb" size={13} color={Colors.accent} />
            <Text style={innStyles.relevanceLabel}>
              Why this matters for you as {userRole}
            </Text>
          </View>
          <Text style={innStyles.relevanceText}>{relevanceText}</Text>
        </View>
      )}

      <View style={innStyles.scoreSection}>
        <View style={innStyles.scoreBigRow}>
          <View style={innStyles.scoreBig}>
            <Text style={innStyles.scoreBigValue}>{innovation.impactScore}</Text>
            <Text style={innStyles.scoreBigLabel}>Score</Text>
          </View>
          <View style={innStyles.scoreDetails}>
            <View style={innStyles.scoreRow}>
              <Text style={innStyles.scoreLabel}>Readiness</Text>
              <ScoreBar value={(innovation.readinessLevel / 9) * 100} color={Colors.primary} />
              <Text style={innStyles.scoreValue}>{innovation.readinessLevel}/9</Text>
            </View>
            <View style={innStyles.scoreRow}>
              <Text style={innStyles.scoreLabel}>Adoption</Text>
              <ScoreBar value={(innovation.adoptionLevel / 9) * 100} color={Colors.info} />
              <Text style={innStyles.scoreValue}>{innovation.adoptionLevel}/9</Text>
            </View>
          </View>
        </View>
      </View>

      <View style={innStyles.tagsRow}>
        {innovation.challenges.slice(0, 3).map((tag) => (
          <View key={tag} style={innStyles.challengeTag}>
            <Text style={innStyles.challengeText}>{tag}</Text>
          </View>
        ))}
      </View>

      <View style={innStyles.cardFooter}>
        <View style={innStyles.tagRow}>
          <Text style={innStyles.sdgLabel}>SDG:</Text>
          {innovation.sdgAlignment.slice(0, 4).map((sdg) => (
            <View key={sdg} style={innStyles.sdgTag}>
              <Text style={innStyles.sdgText}>{sdg}</Text>
            </View>
          ))}
        </View>
        <View style={innStyles.metaRow}>
          <RiskBadge level={innovation.riskLevel} />
          <View style={innStyles.scalabilityBadge}>
            <Ionicons
              name="resize"
              size={11}
              color={Colors.info}
            />
            <Text style={innStyles.scalabilityText}>{innovation.scalability}</Text>
          </View>
        </View>
      </View>

      <View style={innStyles.providerRow}>
        <Text style={innStyles.providerText}>{innovation.provider}</Text>
        <Text style={innStyles.sourceText}>{innovation.source}</Text>
      </View>

      <View style={innStyles.actionRow}>
        <Pressable
          style={innStyles.detailsBtn}
          onPress={() => {}}
          hitSlop={8}
        >
          <Ionicons name="information-circle-outline" size={15} color={Colors.primary} />
          <Text style={innStyles.detailsBtnText}>Details</Text>
        </Pressable>
        <Pressable
          style={[innStyles.compareBtn, selected && innStyles.compareBtnActive]}
          onPress={onToggle}
          hitSlop={8}
        >
          <Ionicons
            name={selected ? "checkmark" : "git-compare-outline"}
            size={15}
            color={selected ? Colors.textInverse : Colors.primary}
          />
          <Text style={[innStyles.compareBtnText, selected && innStyles.compareBtnTextActive]}>
            {selected ? "Selected" : "Compare"}
          </Text>
        </Pressable>
      </View>
    </Pressable>
  );
}

export default function ExploreCompareScreen() {
  const insets = useSafeAreaInsets();
  const { currentProject, filteredInnovations, toggleInnovation, advanceStage } = useSeed();
  const webTopInset = Platform.OS === "web" ? 67 : 0;
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [sortBy, setSortBy] = useState<"score" | "readiness" | "adoption">("score");

  const userRole = currentProject?.context?.role;
  const categories = ["All", ...CATEGORIES];

  const displayedInnovations = useMemo(() => {
    let list = filteredInnovations;
    if (activeCategory !== "All") {
      list = list.filter((i) => i.category === activeCategory);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (i) =>
          i.name.toLowerCase().includes(q) ||
          i.description.toLowerCase().includes(q) ||
          i.category.toLowerCase().includes(q) ||
          i.challenges.some((c) => c.toLowerCase().includes(q))
      );
    }
    list = [...list].sort((a, b) => {
      if (sortBy === "readiness") return b.readinessLevel - a.readinessLevel;
      if (sortBy === "adoption") return b.adoptionLevel - a.adoptionLevel;
      return b.impactScore - a.impactScore;
    });
    return list;
  }, [filteredInnovations, activeCategory, search, sortBy]);

  const selectedIds = currentProject?.selectedInnovations || [];

  const handleContinue = async () => {
    if (!currentProject) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await advanceStage(currentProject.id);
    router.push("/workflow/analyze-simulate" as any);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top + webTopInset }]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </Pressable>
        <View style={styles.headerCenter}>
          <Text style={styles.headerStage}>Stage 2 of 4</Text>
          <Text style={styles.headerTitle}>Explore & Compare</Text>
        </View>
        <View style={styles.selectedBadge}>
          <Text style={styles.selectedCount}>{selectedIds.length}</Text>
        </View>
      </View>

      <View style={styles.stepIndicator}>
        {[1, 2, 3, 4].map((step) => (
          <View key={step} style={styles.stepRow}>
            <View
              style={[
                styles.stepDot,
                step <= 2 ? styles.stepDotActive : styles.stepDotInactive,
              ]}
            >
              {step < 2 ? (
                <Ionicons name="checkmark" size={14} color={Colors.textInverse} />
              ) : (
                <Text
                  style={[
                    styles.stepDotText,
                    step <= 2 ? styles.stepDotTextActive : styles.stepDotTextInactive,
                  ]}
                >
                  {step}
                </Text>
              )}
            </View>
            {step < 4 && (
              <View
                style={[styles.stepLine, step < 2 && { backgroundColor: Colors.primary }]}
              />
            )}
          </View>
        ))}
      </View>

      <Text style={styles.browseLabel}>
        Browse {displayedInnovations.length} innovations ranked for your context
      </Text>

      <View style={styles.controlsRow}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={18} color={Colors.textMuted} />
          <TextInput
            style={styles.searchInput}
            value={search}
            onChangeText={setSearch}
            placeholder="Search innovations..."
            placeholderTextColor={Colors.textMuted}
          />
          {search.length > 0 && (
            <Pressable onPress={() => setSearch("")}>
              <Ionicons name="close-circle" size={18} color={Colors.textMuted} />
            </Pressable>
          )}
        </View>
        <Pressable
          style={styles.sortBtn}
          onPress={() => {
            const next = sortBy === "score" ? "readiness" : sortBy === "readiness" ? "adoption" : "score";
            setSortBy(next);
            Haptics.selectionAsync();
          }}
        >
          <Ionicons name="swap-vertical" size={16} color={Colors.primary} />
          <Text style={styles.sortText}>
            {sortBy === "score" ? "Score" : sortBy === "readiness" ? "TRL" : "Adoption"}
          </Text>
        </Pressable>
      </View>

      <FlatList
        horizontal
        data={categories}
        keyExtractor={(item) => item}
        renderItem={({ item }) => (
          <Pressable
            style={[
              styles.filterPill,
              activeCategory === item && styles.filterPillActive,
            ]}
            onPress={() => {
              setActiveCategory(item);
              Haptics.selectionAsync();
            }}
          >
            <Text
              style={[
                styles.filterText,
                activeCategory === item && styles.filterTextActive,
              ]}
            >
              {item}
            </Text>
          </Pressable>
        )}
        contentContainerStyle={styles.filterRow}
        showsHorizontalScrollIndicator={false}
        style={styles.filterList}
      />

      <FlatList
        data={displayedInnovations}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <InnovationCard
            innovation={item}
            selected={selectedIds.includes(item.id)}
            userRole={userRole}
            onToggle={() => {
              if (!currentProject) return;
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              toggleInnovation(currentProject.id, item.id);
            }}
          />
        )}
        contentContainerStyle={[styles.list, { paddingBottom: insets.bottom + 100 }]}
        showsVerticalScrollIndicator={false}
        scrollEnabled={displayedInnovations.length > 0}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="search-outline" size={40} color={Colors.textMuted} />
            <Text style={styles.emptyText}>No innovations found for this filter</Text>
          </View>
        }
      />

      <View
        style={[styles.bottomBar, { paddingBottom: insets.bottom + (Platform.OS === "web" ? 34 : 10) }]}
      >
        <Pressable
          style={styles.backBtnBottom}
          onPress={() => router.back()}
        >
          <Text style={styles.backTextBottom}>Back to Context</Text>
        </Pressable>
        <Pressable
          style={({ pressed }) => [
            styles.continueBtn,
            selectedIds.length === 0 && styles.continueBtnDisabled,
            pressed && selectedIds.length > 0 && { opacity: 0.9 },
          ]}
          onPress={handleContinue}
          disabled={selectedIds.length === 0}
        >
          <Text
            style={[
              styles.continueText,
              selectedIds.length === 0 && styles.continueTextDisabled,
            ]}
          >
            Continue to Analysis
          </Text>
          <Ionicons
            name="arrow-forward"
            size={16}
            color={selectedIds.length > 0 ? Colors.textInverse : Colors.textMuted}
          />
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
  selectedBadge: {
    backgroundColor: Colors.primary,
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  selectedCount: { fontSize: 13, fontFamily: "DMSans_700Bold", color: Colors.textInverse },
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
  browseLabel: {
    fontSize: 13,
    fontFamily: "DMSans_400Regular",
    color: Colors.textSecondary,
    textAlign: "center",
    marginBottom: 8,
  },
  controlsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginHorizontal: 20,
    marginBottom: 8,
  },
  searchBar: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  searchInput: { flex: 1, fontSize: 14, fontFamily: "DMSans_400Regular", color: Colors.text },
  sortBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
  },
  sortText: { fontSize: 12, fontFamily: "DMSans_600SemiBold", color: Colors.primary },
  filterList: { maxHeight: 44 },
  filterRow: { paddingHorizontal: 20, gap: 8, paddingBottom: 8 },
  filterPill: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  filterPillActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  filterText: { fontSize: 12, fontFamily: "DMSans_500Medium", color: Colors.textSecondary },
  filterTextActive: { color: Colors.textInverse },
  list: { paddingHorizontal: 20, paddingTop: 8 },
  emptyState: { alignItems: "center", paddingTop: 60, gap: 12 },
  emptyText: { fontSize: 14, fontFamily: "DMSans_400Regular", color: Colors.textMuted },
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
  backBtnBottom: { paddingVertical: 12 },
  backTextBottom: { fontSize: 13, fontFamily: "DMSans_500Medium", color: Colors.textSecondary },
  continueBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: Colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
  },
  continueBtnDisabled: { backgroundColor: Colors.borderLight },
  continueText: { fontSize: 14, fontFamily: "DMSans_600SemiBold", color: Colors.textInverse },
  continueTextDisabled: { color: Colors.textMuted },
});

const innStyles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  cardSelected: { borderColor: Colors.primary, borderWidth: 2 },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 },
  categoryPill: {
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 8,
  },
  categoryText: { fontSize: 11, fontFamily: "DMSans_600SemiBold", color: Colors.primary },
  cardTitle: { fontSize: 16, fontFamily: "DMSans_700Bold", color: Colors.text, marginBottom: 4 },
  cardDesc: { fontSize: 13, fontFamily: "DMSans_400Regular", color: Colors.textSecondary, lineHeight: 18, marginBottom: 10 },
  relevanceBox: {
    backgroundColor: "#FFF8EE",
    borderRadius: 10,
    padding: 10,
    marginBottom: 12,
    borderLeftWidth: 3,
    borderLeftColor: Colors.accent,
  },
  relevanceHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginBottom: 4,
  },
  relevanceLabel: {
    fontSize: 11,
    fontFamily: "DMSans_600SemiBold",
    color: Colors.accent,
  },
  relevanceText: {
    fontSize: 12,
    fontFamily: "DMSans_400Regular",
    color: "#5A4A30",
    lineHeight: 17,
  },
  scoreSection: { marginBottom: 10 },
  scoreBigRow: { flexDirection: "row", alignItems: "center", gap: 14 },
  scoreBig: {
    width: 56,
    height: 56,
    borderRadius: 14,
    backgroundColor: Colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
  },
  scoreBigValue: { fontSize: 20, fontFamily: "DMSans_700Bold", color: Colors.primary },
  scoreBigLabel: { fontSize: 9, fontFamily: "DMSans_500Medium", color: Colors.primary, marginTop: -2 },
  scoreDetails: { flex: 1, gap: 6 },
  scores: { gap: 6, marginBottom: 12 },
  scoreRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  scoreLabel: { fontSize: 11, fontFamily: "DMSans_500Medium", color: Colors.textMuted, width: 64 },
  scoreTrack: { flex: 1, height: 5, backgroundColor: Colors.borderLight, borderRadius: 3 },
  scoreFill: { height: 5, borderRadius: 3 },
  scoreValue: { fontSize: 11, fontFamily: "DMSans_600SemiBold", color: Colors.text, width: 28, textAlign: "right" as const },
  tagsRow: { flexDirection: "row", flexWrap: "wrap", gap: 5, marginBottom: 10 },
  challengeTag: {
    backgroundColor: Colors.infoLight,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  challengeText: { fontSize: 10, fontFamily: "DMSans_500Medium", color: Colors.info },
  cardFooter: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 },
  tagRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  sdgLabel: { fontSize: 10, fontFamily: "DMSans_500Medium", color: Colors.textMuted },
  sdgTag: {
    width: 22,
    height: 22,
    borderRadius: 6,
    backgroundColor: Colors.successLight,
    alignItems: "center",
    justifyContent: "center",
  },
  sdgText: { fontSize: 10, fontFamily: "DMSans_700Bold", color: Colors.success },
  metaRow: { flexDirection: "row", gap: 6 },
  riskBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
  },
  riskDot: { width: 6, height: 6, borderRadius: 3 },
  riskText: { fontSize: 10, fontFamily: "DMSans_600SemiBold", textTransform: "capitalize" as const },
  scalabilityBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    backgroundColor: Colors.infoLight,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
  },
  scalabilityText: { fontSize: 10, fontFamily: "DMSans_600SemiBold", color: Colors.info, textTransform: "capitalize" as const },
  providerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: Colors.divider,
    marginBottom: 8,
  },
  providerText: { fontSize: 11, fontFamily: "DMSans_600SemiBold", color: Colors.textSecondary },
  sourceText: { fontSize: 10, fontFamily: "DMSans_400Regular", color: Colors.textMuted },
  actionRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 10,
  },
  detailsBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  detailsBtnText: { fontSize: 12, fontFamily: "DMSans_500Medium", color: Colors.primary },
  compareBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: Colors.primaryLight,
  },
  compareBtnActive: { backgroundColor: Colors.primary },
  compareBtnText: { fontSize: 12, fontFamily: "DMSans_600SemiBold", color: Colors.primary },
  compareBtnTextActive: { color: Colors.textInverse },
});
