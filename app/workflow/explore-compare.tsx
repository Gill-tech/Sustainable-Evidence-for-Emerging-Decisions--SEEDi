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

function InnovationCard({
  innovation,
  selected,
  onToggle,
}: {
  innovation: Innovation;
  selected: boolean;
  onToggle: () => void;
}) {
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
      <View style={innStyles.scores}>
        <View style={innStyles.scoreRow}>
          <Text style={innStyles.scoreLabel}>Impact</Text>
          <ScoreBar value={innovation.impactScore} color={Colors.primary} />
          <Text style={innStyles.scoreValue}>{innovation.impactScore}</Text>
        </View>
        <View style={innStyles.scoreRow}>
          <Text style={innStyles.scoreLabel}>Feasibility</Text>
          <ScoreBar value={innovation.feasibilityScore} color={Colors.info} />
          <Text style={innStyles.scoreValue}>{innovation.feasibilityScore}</Text>
        </View>
        <View style={innStyles.scoreRow}>
          <Text style={innStyles.scoreLabel}>Sustainability</Text>
          <ScoreBar value={innovation.sustainabilityScore} color={Colors.success} />
          <Text style={innStyles.scoreValue}>{innovation.sustainabilityScore}</Text>
        </View>
      </View>
      <View style={innStyles.cardFooter}>
        <View style={innStyles.tagRow}>
          {innovation.sdgAlignment.slice(0, 3).map((sdg) => (
            <View key={sdg} style={innStyles.sdgTag}>
              <Text style={innStyles.sdgText}>SDG {sdg}</Text>
            </View>
          ))}
        </View>
        <Text style={innStyles.readiness}>
          TRL {innovation.readinessLevel}/9
        </Text>
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
          i.category.toLowerCase().includes(q)
      );
    }
    return list;
  }, [filteredInnovations, activeCategory, search]);

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
        <Text style={styles.bottomText}>{selectedIds.length} selected</Text>
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
            Continue to Analyze
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
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginHorizontal: 20,
    marginVertical: 8,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  searchInput: { flex: 1, fontSize: 14, fontFamily: "DMSans_400Regular", color: Colors.text },
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
  bottomText: { fontSize: 14, fontFamily: "DMSans_500Medium", color: Colors.textSecondary },
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
  cardDesc: { fontSize: 13, fontFamily: "DMSans_400Regular", color: Colors.textSecondary, lineHeight: 18, marginBottom: 12 },
  scores: { gap: 6, marginBottom: 12 },
  scoreRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  scoreLabel: { fontSize: 11, fontFamily: "DMSans_500Medium", color: Colors.textMuted, width: 80 },
  scoreTrack: { flex: 1, height: 5, backgroundColor: Colors.borderLight, borderRadius: 3 },
  scoreFill: { height: 5, borderRadius: 3 },
  scoreValue: { fontSize: 11, fontFamily: "DMSans_600SemiBold", color: Colors.text, width: 24, textAlign: "right" as const },
  cardFooter: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  tagRow: { flexDirection: "row", gap: 4 },
  sdgTag: { backgroundColor: Colors.successLight, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  sdgText: { fontSize: 10, fontFamily: "DMSans_600SemiBold", color: Colors.success },
  readiness: { fontSize: 11, fontFamily: "DMSans_500Medium", color: Colors.textMuted },
});
