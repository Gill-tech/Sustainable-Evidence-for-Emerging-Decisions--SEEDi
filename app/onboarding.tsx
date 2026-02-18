import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  Platform,
  KeyboardAvoidingView,
  ScrollView,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import Colors from "@/constants/colors";
import { useSeed } from "@/contexts/SeedContext";

const ROLES = [
  { id: "farmer", label: "Farmer", icon: "leaf" as const, iconSet: "ion" },
  { id: "policymaker", label: "Policymaker", icon: "business" as const, iconSet: "ion" },
  { id: "sme", label: "SME", icon: "briefcase" as const, iconSet: "ion" },
  { id: "researcher", label: "Researcher", icon: "flask" as const, iconSet: "ion" },
  { id: "investor", label: "Investor", icon: "trending-up" as const, iconSet: "ion" },
  { id: "extension", label: "Extension Worker", icon: "people" as const, iconSet: "ion" },
];

export default function OnboardingScreen() {
  const insets = useSafeAreaInsets();
  const { setUserProfile } = useSeed();
  const [name, setName] = useState("");
  const [selectedRole, setSelectedRole] = useState("");
  const [step, setStep] = useState<1 | 2>(1);
  const webTopInset = Platform.OS === "web" ? 67 : 0;

  const handleNext = () => {
    if (!name.trim()) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setStep(2);
  };

  const handleComplete = async () => {
    if (!selectedRole) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await setUserProfile({ name: name.trim(), role: selectedRole });
    router.replace("/(tabs)");
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top + webTopInset }]}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 40 }]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <View style={styles.logoRow}>
              <MaterialCommunityIcons name="sprout" size={28} color={Colors.primary} />
              <Text style={styles.logoText}>SEEDi</Text>
            </View>
            <Text style={styles.subtitle}>Sustainable Evidence for Emerging Decisions</Text>
          </View>

          {step === 1 ? (
            <View style={styles.stepContainer}>
              <View style={styles.stepIndicator}>
                <View style={[styles.dot, styles.dotActive]} />
                <View style={styles.dotLine} />
                <View style={styles.dot} />
              </View>

              <Text style={styles.stepTitle}>What's your name?</Text>
              <Text style={styles.stepDesc}>
                This helps us personalize your experience
              </Text>

              <View style={styles.inputWrapper}>
                <Ionicons name="person-outline" size={20} color={Colors.textMuted} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Enter your name"
                  placeholderTextColor={Colors.textMuted}
                  value={name}
                  onChangeText={setName}
                  autoFocus
                  returnKeyType="next"
                  onSubmitEditing={handleNext}
                />
              </View>

              <Pressable
                style={({ pressed }) => [
                  styles.continueBtn,
                  !name.trim() && styles.continueBtnDisabled,
                  pressed && name.trim() ? { opacity: 0.9, transform: [{ scale: 0.98 }] } : {},
                ]}
                onPress={handleNext}
                disabled={!name.trim()}
              >
                <Text style={styles.continueBtnText}>Continue</Text>
                <Ionicons name="arrow-forward" size={18} color="#fff" />
              </Pressable>
            </View>
          ) : (
            <View style={styles.stepContainer}>
              <View style={styles.stepIndicator}>
                <View style={[styles.dot, styles.dotDone]} />
                <View style={[styles.dotLine, styles.dotLineActive]} />
                <View style={[styles.dot, styles.dotActive]} />
              </View>

              <Text style={styles.stepTitle}>Hi, {name.trim()}!</Text>
              <Text style={styles.stepDesc}>
                Select your role to tailor recommendations to your needs
              </Text>

              <View style={styles.rolesGrid}>
                {ROLES.map((role) => {
                  const isSelected = selectedRole === role.id;
                  return (
                    <Pressable
                      key={role.id}
                      style={({ pressed }) => [
                        styles.roleCard,
                        isSelected && styles.roleCardSelected,
                        pressed && { opacity: 0.9, transform: [{ scale: 0.97 }] },
                      ]}
                      onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        setSelectedRole(role.id);
                      }}
                    >
                      <View style={[styles.roleIconWrap, isSelected && styles.roleIconWrapSelected]}>
                        <Ionicons
                          name={role.icon}
                          size={22}
                          color={isSelected ? "#fff" : Colors.primary}
                        />
                      </View>
                      <Text style={[styles.roleLabel, isSelected && styles.roleLabelSelected]}>
                        {role.label}
                      </Text>
                      {isSelected && (
                        <View style={styles.checkMark}>
                          <Ionicons name="checkmark" size={14} color="#fff" />
                        </View>
                      )}
                    </Pressable>
                  );
                })}
              </View>

              <View style={styles.bottomActions}>
                <Pressable
                  style={({ pressed }) => [styles.backBtn, pressed && { opacity: 0.7 }]}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setStep(1);
                  }}
                >
                  <Ionicons name="arrow-back" size={18} color={Colors.textSecondary} />
                </Pressable>
                <Pressable
                  style={({ pressed }) => [
                    styles.continueBtn,
                    styles.continueBtnFlex,
                    !selectedRole && styles.continueBtnDisabled,
                    pressed && selectedRole ? { opacity: 0.9, transform: [{ scale: 0.98 }] } : {},
                  ]}
                  onPress={handleComplete}
                  disabled={!selectedRole}
                >
                  <Text style={styles.continueBtnText}>Get Started</Text>
                  <Ionicons name="arrow-forward" size={18} color="#fff" />
                </Pressable>
              </View>
            </View>
          )}

          <LinearGradient
            colors={["rgba(45,139,78,0.04)", "transparent"]}
            style={styles.bgGlow}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scrollContent: { flexGrow: 1, paddingHorizontal: 24 },
  header: { alignItems: "center", marginTop: 40, marginBottom: 48 },
  logoRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 8 },
  logoText: { fontSize: 28, fontFamily: "DMSans_700Bold", color: Colors.primary, letterSpacing: -0.5 },
  subtitle: { fontSize: 14, fontFamily: "DMSans_400Regular", color: Colors.textMuted, textAlign: "center" },
  stepContainer: { flex: 1 },
  stepIndicator: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 0,
    marginBottom: 32,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.borderLight,
    borderWidth: 2,
    borderColor: Colors.border,
  },
  dotActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  dotDone: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  dotLine: { width: 40, height: 2, backgroundColor: Colors.borderLight },
  dotLineActive: { backgroundColor: Colors.primary },
  stepTitle: {
    fontSize: 26,
    fontFamily: "DMSans_700Bold",
    color: Colors.text,
    textAlign: "center",
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  stepDesc: {
    fontSize: 15,
    fontFamily: "DMSans_400Regular",
    color: Colors.textSecondary,
    textAlign: "center",
    marginBottom: 32,
    lineHeight: 22,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.surface,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: Colors.cardBorder,
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  inputIcon: { marginRight: 10 },
  input: {
    flex: 1,
    fontSize: 17,
    fontFamily: "DMSans_500Medium",
    color: Colors.text,
    paddingVertical: 16,
  },
  continueBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    borderRadius: 16,
  },
  continueBtnFlex: { flex: 1 },
  continueBtnDisabled: { backgroundColor: Colors.primaryMuted, opacity: 0.6 },
  continueBtnText: { fontSize: 16, fontFamily: "DMSans_600SemiBold", color: "#fff" },
  rolesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 32,
  },
  roleCard: {
    flexBasis: "47%",
    flexGrow: 1,
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: Colors.cardBorder,
    position: "relative",
  },
  roleCardSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryLight,
  },
  roleIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: Colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  roleIconWrapSelected: {
    backgroundColor: Colors.primary,
  },
  roleLabel: {
    fontSize: 14,
    fontFamily: "DMSans_600SemiBold",
    color: Colors.text,
  },
  roleLabelSelected: { color: Colors.primary },
  checkMark: {
    position: "absolute",
    top: 10,
    right: 10,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  bottomActions: {
    flexDirection: "row",
    gap: 12,
    alignItems: "center",
  },
  backBtn: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    alignItems: "center",
    justifyContent: "center",
  },
  bgGlow: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 200,
    zIndex: -1,
  },
});
