import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import * as Haptics from "expo-haptics";
import Colors from "@/constants/colors";
import { useSeed } from "@/contexts/SeedContext";
import {
  ROLES,
  OBJECTIVES,
  REGIONS,
  AGRO_ZONES,
  BUDGET_LEVELS,
  FARM_SIZES,
  CLIMATE_RISK_LEVELS,
  UserContext,
} from "@/constants/data";

function Dropdown({
  label,
  required,
  options,
  value,
  onSelect,
  placeholder,
}: {
  label: string;
  required?: boolean;
  options: string[];
  value: string;
  onSelect: (v: string) => void;
  placeholder: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <View style={styles.fieldWrap}>
      <Text style={styles.fieldLabel}>
        {label}
        {required && <Text style={styles.required}> *</Text>}
      </Text>
      <Pressable
        style={[styles.dropdown, open && styles.dropdownOpen]}
        onPress={() => setOpen(!open)}
      >
        <Text style={[styles.dropdownText, !value && styles.dropdownPlaceholder]}>
          {value || placeholder}
        </Text>
        <Ionicons
          name={open ? "chevron-up" : "chevron-down"}
          size={16}
          color={Colors.textMuted}
        />
      </Pressable>
      {open && (
        <View style={styles.optionsList}>
          {options.map((opt) => (
            <Pressable
              key={opt}
              style={[styles.option, value === opt && styles.optionSelected]}
              onPress={() => {
                onSelect(opt);
                setOpen(false);
                Haptics.selectionAsync();
              }}
            >
              <Text
                style={[styles.optionText, value === opt && styles.optionTextSelected]}
              >
                {opt}
              </Text>
              {value === opt && (
                <Ionicons name="checkmark" size={16} color={Colors.primary} />
              )}
            </Pressable>
          ))}
        </View>
      )}
    </View>
  );
}

export default function DefineContextScreen() {
  const insets = useSafeAreaInsets();
  const { currentProject, updateProjectContext, advanceStage } = useSeed();
  const webTopInset = Platform.OS === "web" ? 67 : 0;

  const existing = currentProject?.context;
  const [role, setRole] = useState(existing?.role || "");
  const [objective, setObjective] = useState(existing?.primaryObjective || "");
  const [region, setRegion] = useState(existing?.region || "");
  const [subRegion, setSubRegion] = useState(existing?.subRegion || "");
  const [agroZone, setAgroZone] = useState(existing?.agroEcologicalZone || "");
  const [primaryCrop, setPrimaryCrop] = useState(existing?.primaryCrop || "");
  const [budget, setBudget] = useState(existing?.budgetLevel || "");
  const [farmSize, setFarmSize] = useState(existing?.farmSize || "");
  const [climateRisk, setClimateRisk] = useState(existing?.climateRiskLevel || "");

  const canContinue = role && objective && region;

  const handleSave = async () => {
    if (!currentProject || !canContinue) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const context: UserContext = {
      role,
      primaryObjective: objective,
      region,
      subRegion,
      agroEcologicalZone: agroZone,
      primaryCrop,
      budgetLevel: budget,
      farmSize,
      climateRiskLevel: climateRisk,
    };
    await updateProjectContext(currentProject.id, context);
    await advanceStage(currentProject.id);
    router.push("/workflow/explore-compare" as any);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top + webTopInset }]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </Pressable>
        <View style={styles.headerCenter}>
          <Text style={styles.headerStage}>Stage 1 of 4</Text>
          <Text style={styles.headerTitle}>Define Your Context</Text>
        </View>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.stepIndicator}>
        {[1, 2, 3, 4].map((step) => (
          <View key={step} style={styles.stepRow}>
            <View
              style={[
                styles.stepDot,
                step === 1 ? styles.stepDotActive : styles.stepDotInactive,
              ]}
            >
              <Text
                style={[
                  styles.stepDotText,
                  step === 1 ? styles.stepDotTextActive : styles.stepDotTextInactive,
                ]}
              >
                {step}
              </Text>
            </View>
            {step < 4 && <View style={styles.stepLine} />}
          </View>
        ))}
      </View>

      <ScrollView
        contentContainerStyle={[styles.form, { paddingBottom: insets.bottom + 40 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="person" size={18} color={Colors.primary} />
            <Text style={styles.sectionTitle}>Basic Information</Text>
          </View>
          <Dropdown
            label="Role"
            required
            options={ROLES}
            value={role}
            onSelect={setRole}
            placeholder="Select role..."
          />
          <Dropdown
            label="Primary Objective"
            required
            options={OBJECTIVES}
            value={objective}
            onSelect={setObjective}
            placeholder="Select objective..."
          />
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="globe" size={18} color={Colors.primary} />
            <Text style={styles.sectionTitle}>Geographic Context</Text>
          </View>
          <Dropdown
            label="Region"
            required
            options={REGIONS}
            value={region}
            onSelect={setRegion}
            placeholder="Select region..."
          />
          <View style={styles.fieldWrap}>
            <Text style={styles.fieldLabel}>Sub-Region</Text>
            <TextInput
              style={styles.textInput}
              value={subRegion}
              onChangeText={setSubRegion}
              placeholder="e.g. Rift Valley, Punjab"
              placeholderTextColor={Colors.textMuted}
            />
          </View>
          <Dropdown
            label="Agro-Ecological Zone"
            options={AGRO_ZONES}
            value={agroZone}
            onSelect={setAgroZone}
            placeholder="Select zone..."
          />
          <View style={styles.fieldWrap}>
            <Text style={styles.fieldLabel}>Primary Crop (Optional)</Text>
            <TextInput
              style={styles.textInput}
              value={primaryCrop}
              onChangeText={setPrimaryCrop}
              placeholder="e.g. Maize, Rice, Wheat"
              placeholderTextColor={Colors.textMuted}
            />
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="options" size={18} color={Colors.primary} />
            <Text style={styles.sectionTitle}>Additional Context (Optional)</Text>
          </View>
          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Dropdown
                label="Budget Level"
                options={BUDGET_LEVELS}
                value={budget}
                onSelect={setBudget}
                placeholder="Select..."
              />
            </View>
            <View style={{ flex: 1 }}>
              <Dropdown
                label="Farm Size"
                options={FARM_SIZES}
                value={farmSize}
                onSelect={setFarmSize}
                placeholder="Select..."
              />
            </View>
          </View>
          <Dropdown
            label="Climate Risk Level"
            options={CLIMATE_RISK_LEVELS}
            value={climateRisk}
            onSelect={setClimateRisk}
            placeholder="Select risk..."
          />
        </View>

        <View style={styles.footer}>
          <Pressable
            style={({ pressed }) => [styles.cancelBtn, pressed && { opacity: 0.8 }]}
            onPress={() => router.back()}
          >
            <Text style={styles.cancelText}>Cancel</Text>
          </Pressable>
          <Pressable
            style={({ pressed }) => [
              styles.continueBtn,
              !canContinue && styles.continueBtnDisabled,
              pressed && canContinue && { opacity: 0.9, transform: [{ scale: 0.97 }] },
            ]}
            onPress={handleSave}
            disabled={!canContinue}
          >
            <Text style={[styles.continueText, !canContinue && styles.continueTextDisabled]}>
              Save & Continue
            </Text>
            <Ionicons
              name="arrow-forward"
              size={16}
              color={canContinue ? Colors.textInverse : Colors.textMuted}
            />
          </Pressable>
        </View>
      </ScrollView>
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
    paddingBottom: 12,
  },
  stepRow: { flexDirection: "row", alignItems: "center" },
  stepDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  stepDotActive: { backgroundColor: Colors.primary },
  stepDotInactive: { backgroundColor: Colors.borderLight },
  stepDotText: { fontSize: 13, fontFamily: "DMSans_600SemiBold" },
  stepDotTextActive: { color: Colors.textInverse },
  stepDotTextInactive: { color: Colors.textMuted },
  stepLine: { width: 40, height: 2, backgroundColor: Colors.borderLight, marginHorizontal: 4 },
  form: { paddingHorizontal: 20 },
  section: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  sectionHeader: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 14 },
  sectionTitle: { fontSize: 16, fontFamily: "DMSans_600SemiBold", color: Colors.text },
  fieldWrap: { marginBottom: 14 },
  fieldLabel: { fontSize: 13, fontFamily: "DMSans_500Medium", color: Colors.textSecondary, marginBottom: 6 },
  required: { color: Colors.danger },
  dropdown: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: Colors.background,
  },
  dropdownOpen: { borderColor: Colors.primary, borderBottomLeftRadius: 0, borderBottomRightRadius: 0 },
  dropdownText: { fontSize: 14, fontFamily: "DMSans_400Regular", color: Colors.text },
  dropdownPlaceholder: { color: Colors.textMuted },
  optionsList: {
    borderWidth: 1,
    borderTopWidth: 0,
    borderColor: Colors.primary,
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
    backgroundColor: Colors.surface,
    maxHeight: 200,
  },
  option: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  optionSelected: { backgroundColor: Colors.primaryLight },
  optionText: { fontSize: 14, fontFamily: "DMSans_400Regular", color: Colors.text },
  optionTextSelected: { fontFamily: "DMSans_600SemiBold", color: Colors.primary },
  textInput: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    fontFamily: "DMSans_400Regular",
    color: Colors.text,
    backgroundColor: Colors.background,
  },
  row: { flexDirection: "row", gap: 12 },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
    gap: 12,
  },
  cancelBtn: {
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  cancelText: { fontSize: 15, fontFamily: "DMSans_500Medium", color: Colors.textSecondary },
  continueBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    borderRadius: 14,
  },
  continueBtnDisabled: { backgroundColor: Colors.borderLight },
  continueText: { fontSize: 15, fontFamily: "DMSans_600SemiBold", color: Colors.textInverse },
  continueTextDisabled: { color: Colors.textMuted },
});
