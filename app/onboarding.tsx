import React, { useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  Platform,
  KeyboardAvoidingView,
  ScrollView,
  Image,
  Dimensions,
  ActivityIndicator,
  Animated,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons, MaterialCommunityIcons, Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import Colors from "@/constants/colors";
import { useSeed } from "@/contexts/SeedContext";
import { apiRequest, getApiUrl } from "@/lib/query-client";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

const ROLES = [
  { id: "farmer", label: "Farmer", icon: "leaf" as const },
  { id: "policymaker", label: "Policymaker", icon: "business" as const },
  { id: "sme", label: "SME", icon: "briefcase" as const },
  { id: "researcher", label: "Researcher", icon: "flask" as const },
  { id: "investor", label: "Investor", icon: "trending-up" as const },
  { id: "extension", label: "Extension Worker", icon: "people" as const },
];

const FEATURES = [
  { icon: "search" as const, title: "Smart Search", desc: "Find innovations by region, SDG, or type" },
  { icon: "bar-chart" as const, title: "Impact Analysis", desc: "Simulate outcomes before investing" },
  { icon: "file-text" as const, title: "Action Briefs", desc: "Export professional reports" },
];

type ScreenMode = "landing" | "signup" | "login" | "role";

export default function OnboardingScreen() {
  const insets = useSafeAreaInsets();
  const { setUserProfile } = useSeed();
  const [mode, setMode] = useState<ScreenMode>("landing");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [selectedRole, setSelectedRole] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const webTopInset = Platform.OS === "web" ? 67 : 0;
  const scrollRef = useRef<ScrollView>(null);

  const scrollToTop = () => {
    scrollRef.current?.scrollTo({ y: 0, animated: true });
  };

  const handleAuthSubmit = async () => {
    setErrorMsg("");
    if (mode === "signup" && !name.trim()) { setErrorMsg("Please enter your name"); return; }
    if (!email.trim()) { setErrorMsg("Please enter your email"); return; }
    if (!password || password.length < 6) { setErrorMsg("Password must be at least 6 characters"); return; }

    setIsSubmitting(true);
    try {
      const endpoint = mode === "login" ? "/api/auth/login" : "/api/auth/signup";
      const body = mode === "login" ? { email, password } : { name: name.trim(), email, password };
      const baseUrl = getApiUrl();
      const url = new URL(endpoint, baseUrl);

      const res = await fetch(url.toString(), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data.message || "Something went wrong");
        setIsSubmitting(false);
        return;
      }

      if (mode === "signup") {
        setMode("role");
        scrollToTop();
      } else {
        const userName = data.user?.name || "User";
        const userRole = data.user?.role || "farmer";
        await setUserProfile({ name: userName, role: userRole });
        router.replace("/(tabs)");
      }
    } catch (err) {
      setErrorMsg("Connection error. Please try again.");
    }
    setIsSubmitting(false);
  };

  const handleGoogleAuth = () => {
    setErrorMsg("Google sign-in coming soon. Please use email for now.");
  };

  const handleRoleComplete = async () => {
    if (!selectedRole) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await setUserProfile({ name: name.trim() || "User", role: selectedRole });
    router.replace("/(tabs)");
  };

  if (mode === "role") {
    return (
      <View style={[styles.container, { paddingTop: insets.top + webTopInset }]}>
        <ScrollView
          ref={scrollRef}
          contentContainerStyle={[styles.roleScrollContent, { paddingBottom: insets.bottom + 40 }]}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.roleHeader}>
            <View style={styles.logoRow}>
              <View style={styles.logoMark}>
                <MaterialCommunityIcons name="sprout" size={22} color="#fff" />
              </View>
              <Text style={styles.logoText}>SEED<Text style={styles.logoAccent}>i</Text></Text>
            </View>
          </View>

          <Text style={styles.roleTitle}>Welcome, {name.trim()}!</Text>
          <Text style={styles.roleSubtitle}>Select your role so we can personalize your experience</Text>

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
                    <Ionicons name={role.icon} size={22} color={isSelected ? "#fff" : Colors.primary} />
                  </View>
                  <Text style={[styles.roleLabel, isSelected && styles.roleLabelSelected]}>{role.label}</Text>
                  {isSelected && (
                    <View style={styles.checkMark}>
                      <Ionicons name="checkmark" size={14} color="#fff" />
                    </View>
                  )}
                </Pressable>
              );
            })}
          </View>

          <Pressable
            style={({ pressed }) => [
              styles.primaryBtn,
              !selectedRole && styles.btnDisabled,
              pressed && selectedRole ? { opacity: 0.9, transform: [{ scale: 0.98 }] } : {},
            ]}
            onPress={handleRoleComplete}
            disabled={!selectedRole}
          >
            <Text style={styles.primaryBtnText}>Start Using SEEDi</Text>
            <Ionicons name="arrow-forward" size={18} color="#fff" />
          </Pressable>
        </ScrollView>
      </View>
    );
  }

  if (mode === "signup" || mode === "login") {
    const isLogin = mode === "login";
    return (
      <View style={[styles.container, { paddingTop: insets.top + webTopInset }]}>
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"} keyboardVerticalOffset={90}>
          <ScrollView
            ref={scrollRef}
            contentContainerStyle={[styles.authScrollContent, { paddingBottom: insets.bottom + 40 }]}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <Pressable style={styles.backRow} onPress={() => { setMode("landing"); setErrorMsg(""); scrollToTop(); }}>
              <Ionicons name="arrow-back" size={22} color={Colors.text} />
            </Pressable>

            <View style={styles.authHeader}>
              <View style={styles.logoRow}>
                <View style={styles.logoMark}>
                  <MaterialCommunityIcons name="sprout" size={22} color="#fff" />
                </View>
                <Text style={styles.logoText}>SEED<Text style={styles.logoAccent}>i</Text></Text>
              </View>
              <Text style={styles.authTitle}>{isLogin ? "Welcome Back" : "Create Your Account"}</Text>
              <Text style={styles.authSubtitle}>{isLogin ? "Log in to continue your journey" : "Join thousands using evidence-based agriculture"}</Text>
            </View>

            <Pressable
              style={({ pressed }) => [styles.googleBtn, pressed && { opacity: 0.9, transform: [{ scale: 0.98 }] }]}
              onPress={handleGoogleAuth}
            >
              <View style={styles.googleIconWrap}>
                <Text style={{ fontSize: 18, fontWeight: "700" as const }}>G</Text>
              </View>
              <Text style={styles.googleBtnText}>Continue with Google</Text>
            </Pressable>

            <View style={styles.dividerRow}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>or continue with email</Text>
              <View style={styles.dividerLine} />
            </View>

            {!isLogin && (
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Full Name</Text>
                <View style={styles.inputWrap}>
                  <Ionicons name="person-outline" size={18} color={Colors.textMuted} style={styles.inputIcon} />
                  <TextInput
                    style={styles.formInput}
                    placeholder="Grace Wanjiku"
                    placeholderTextColor={Colors.textMuted}
                    value={name}
                    onChangeText={setName}
                    autoCapitalize="words"
                  />
                </View>
              </View>
            )}

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Email</Text>
              <View style={styles.inputWrap}>
                <Ionicons name="mail-outline" size={18} color={Colors.textMuted} style={styles.inputIcon} />
                <TextInput
                  style={styles.formInput}
                  placeholder="grace@example.com"
                  placeholderTextColor={Colors.textMuted}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Password</Text>
              <View style={styles.inputWrap}>
                <Ionicons name="lock-closed-outline" size={18} color={Colors.textMuted} style={styles.inputIcon} />
                <TextInput
                  style={[styles.formInput, { flex: 1 }]}
                  placeholder={isLogin ? "Enter your password" : "Create a password"}
                  placeholderTextColor={Colors.textMuted}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                />
                <Pressable onPress={() => setShowPassword(!showPassword)} style={styles.eyeBtn}>
                  <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={20} color={Colors.textMuted} />
                </Pressable>
              </View>
            </View>

            {!!errorMsg && (
              <View style={styles.errorRow}>
                <Ionicons name="alert-circle" size={16} color={Colors.danger} />
                <Text style={styles.errorText}>{errorMsg}</Text>
              </View>
            )}

            <Pressable
              style={({ pressed }) => [
                styles.primaryBtn,
                isSubmitting && styles.btnDisabled,
                pressed && !isSubmitting ? { opacity: 0.9, transform: [{ scale: 0.98 }] } : {},
              ]}
              onPress={handleAuthSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <>
                  <Text style={styles.primaryBtnText}>{isLogin ? "Log In" : "Create Account"}</Text>
                  <Ionicons name="arrow-forward" size={18} color="#fff" />
                </>
              )}
            </Pressable>

            <Pressable
              style={styles.switchRow}
              onPress={() => {
                setMode(isLogin ? "signup" : "login");
                setErrorMsg("");
              }}
            >
              <Text style={styles.switchText}>
                {isLogin ? "Don't have an account? " : "Already have an account? "}
                <Text style={styles.switchLink}>{isLogin ? "Sign Up" : "Log In"}</Text>
              </Text>
            </Pressable>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top + webTopInset }]}>
      <ScrollView
        ref={scrollRef}
        contentContainerStyle={[styles.landingScrollContent, { paddingBottom: insets.bottom + 40 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.landingHeader}>
          <View style={styles.logoRow}>
            <View style={styles.logoMark}>
              <MaterialCommunityIcons name="sprout" size={22} color="#fff" />
            </View>
            <Text style={styles.logoText}>SEED<Text style={styles.logoAccent}>i</Text></Text>
          </View>
        </View>

        <View style={styles.heroSection}>
          <View style={styles.heroBadge}>
            <View style={styles.heroBadgeDot} />
            <Text style={styles.heroBadgeText}>Agricultural Intelligence Platform</Text>
          </View>
          <Text style={styles.heroTitle}>Grow Smarter{"\n"}with <Text style={styles.heroAccent}>Evidence</Text></Text>
          <Text style={styles.heroSubtitle}>
            Find the right agricultural innovations for your farm, region, and goals -- backed by real data from 3,075+ verified solutions.
          </Text>
        </View>

        <View style={styles.imageRow}>
          <Image
            source={{ uri: `${getApiUrl()}images/smart-farming.jpg` }}
            style={styles.heroImageLarge}
            resizeMode="cover"
          />
          <View style={styles.imageCol}>
            <Image
              source={{ uri: `${getApiUrl()}images/wheat-sunset.jpg` }}
              style={styles.heroImageSmall}
              resizeMode="cover"
            />
            <Image
              source={{ uri: `${getApiUrl()}images/seedling-grow.jpg` }}
              style={styles.heroImageSmall}
              resizeMode="cover"
            />
          </View>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statNum}>3,075+</Text>
            <Text style={styles.statLabel}>Innovations</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNum}>200+</Text>
            <Text style={styles.statLabel}>Countries</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNum}>17</Text>
            <Text style={styles.statLabel}>SDGs</Text>
          </View>
        </View>

        <View style={styles.ctaSection}>
          <Pressable
            style={({ pressed }) => [styles.primaryBtn, pressed && { opacity: 0.9, transform: [{ scale: 0.98 }] }]}
            onPress={() => { setMode("signup"); scrollToTop(); }}
          >
            <Text style={styles.primaryBtnText}>Get Started Free</Text>
            <Ionicons name="arrow-forward" size={18} color="#fff" />
          </Pressable>

          <Pressable
            style={({ pressed }) => [styles.outlineBtn, pressed && { opacity: 0.8 }]}
            onPress={() => { setMode("login"); scrollToTop(); }}
          >
            <Text style={styles.outlineBtnText}>I already have an account</Text>
          </Pressable>
        </View>

        <View style={styles.featuresSection}>
          <Text style={styles.sectionTitle}>What SEEDi Does</Text>
          {FEATURES.map((f, i) => (
            <View key={i} style={styles.featureRow}>
              <View style={styles.featureIconWrap}>
                <Feather name={f.icon} size={20} color={Colors.primary} />
              </View>
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>{f.title}</Text>
                <Text style={styles.featureDesc}>{f.desc}</Text>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.howSection}>
          <Text style={styles.sectionTitle}>4 Simple Steps</Text>
          <View style={styles.stepsCol}>
            {[
              { num: "1", title: "Define Context", desc: "Your farm, region & goals" },
              { num: "2", title: "Explore & Compare", desc: "Browse ranked innovations" },
              { num: "3", title: "Analyze & Simulate", desc: "Project outcomes & costs" },
              { num: "4", title: "Generate Action", desc: "Get your action brief" },
            ].map((s, i) => (
              <View key={i} style={styles.stepRow}>
                <View style={styles.stepNumWrap}>
                  <Text style={styles.stepNumText}>{s.num}</Text>
                </View>
                <View style={styles.stepContent}>
                  <Text style={styles.stepTitle}>{s.title}</Text>
                  <Text style={styles.stepDesc}>{s.desc}</Text>
                </View>
                {i < 3 && <View style={styles.stepConnector} />}
              </View>
            ))}
          </View>
        </View>

        <View style={styles.bottomCta}>
          <LinearGradient
            colors={[Colors.primary, Colors.primaryDark]}
            style={styles.bottomCtaGrad}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Text style={styles.bottomCtaTitle}>Ready to grow smarter?</Text>
            <Text style={styles.bottomCtaDesc}>Create your free account and start exploring innovations today.</Text>
            <Pressable
              style={({ pressed }) => [styles.whiteBtn, pressed && { opacity: 0.9 }]}
              onPress={() => { setMode("signup"); scrollToTop(); }}
            >
              <Text style={styles.whiteBtnText}>Sign Up Free</Text>
              <Ionicons name="arrow-forward" size={16} color={Colors.primary} />
            </Pressable>
          </LinearGradient>
        </View>

        <View style={styles.footer}>
          <View style={styles.footerLogoRow}>
            <MaterialCommunityIcons name="sprout" size={18} color={Colors.primary} />
            <Text style={styles.footerLogoText}>SEEDi</Text>
          </View>
          <Text style={styles.footerText}>Sustainable Evidence for Emerging Decisions</Text>
          <Text style={styles.footerCopy}>Powered by ATIO Knowledge Base</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },

  landingScrollContent: { flexGrow: 1, paddingHorizontal: 24 },
  authScrollContent: { flexGrow: 1, paddingHorizontal: 24 },
  roleScrollContent: { flexGrow: 1, paddingHorizontal: 24 },

  landingHeader: { alignItems: "center", marginTop: 20, marginBottom: 8 },
  logoRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  logoMark: {
    width: 36, height: 36, borderRadius: 10, backgroundColor: Colors.primary,
    alignItems: "center", justifyContent: "center",
    boxShadow: "0 3px 8px rgba(45,139,78,0.3)",
  },
  logoText: { fontSize: 26, fontFamily: "DMSans_700Bold", color: Colors.text, letterSpacing: -1 },
  logoAccent: { color: Colors.primary },

  heroSection: { alignItems: "center", marginTop: 32, marginBottom: 28 },
  heroBadge: {
    flexDirection: "row", alignItems: "center", gap: 8,
    backgroundColor: Colors.primaryLight, paddingHorizontal: 16, paddingVertical: 8,
    borderRadius: 100, marginBottom: 20,
    borderWidth: 1, borderColor: "rgba(45,139,78,0.12)",
  },
  heroBadgeDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.primary },
  heroBadgeText: { fontSize: 12, fontFamily: "DMSans_600SemiBold", color: Colors.primary },
  heroTitle: {
    fontSize: 36, fontFamily: "DMSans_700Bold", color: Colors.text,
    textAlign: "center", letterSpacing: -1.5, lineHeight: 42, marginBottom: 16,
  },
  heroAccent: { color: Colors.primary },
  heroSubtitle: {
    fontSize: 16, fontFamily: "DMSans_400Regular", color: Colors.textSecondary,
    textAlign: "center", lineHeight: 24, maxWidth: 340,
  },

  imageRow: {
    flexDirection: "row", gap: 12, marginBottom: 28, height: 180,
  },
  heroImageLarge: { flex: 1.5, borderRadius: 20 },
  imageCol: { flex: 1, gap: 12 },
  heroImageSmall: { flex: 1, borderRadius: 16 },

  statsRow: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    backgroundColor: Colors.surface, borderRadius: 20, padding: 20,
    marginBottom: 28, borderWidth: 1, borderColor: Colors.cardBorder,
  },
  statItem: { flex: 1, alignItems: "center" },
  statNum: { fontSize: 22, fontFamily: "DMSans_700Bold", color: Colors.primary, letterSpacing: -0.5 },
  statLabel: { fontSize: 12, fontFamily: "DMSans_500Medium", color: Colors.textMuted, marginTop: 2 },
  statDivider: { width: 1, height: 36, backgroundColor: Colors.borderLight },

  ctaSection: { gap: 14, marginBottom: 40 },
  primaryBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10,
    backgroundColor: Colors.primary, paddingVertical: 17, borderRadius: 16,
    boxShadow: "0 4px 16px rgba(45,139,78,0.25)",
  },
  primaryBtnText: { fontSize: 17, fontFamily: "DMSans_700Bold", color: "#fff" },
  btnDisabled: { opacity: 0.5 },
  outlineBtn: {
    alignItems: "center", justifyContent: "center",
    paddingVertical: 17, borderRadius: 16,
    borderWidth: 2, borderColor: "rgba(45,139,78,0.2)",
  },
  outlineBtnText: { fontSize: 16, fontFamily: "DMSans_600SemiBold", color: Colors.text },

  featuresSection: { marginBottom: 40 },
  sectionTitle: {
    fontSize: 20, fontFamily: "DMSans_700Bold", color: Colors.text,
    letterSpacing: -0.5, marginBottom: 20,
  },
  featureRow: {
    flexDirection: "row", alignItems: "center", gap: 16,
    backgroundColor: Colors.surface, borderRadius: 16, padding: 18,
    marginBottom: 12, borderWidth: 1, borderColor: Colors.cardBorder,
  },
  featureIconWrap: {
    width: 48, height: 48, borderRadius: 14, backgroundColor: Colors.primaryLight,
    alignItems: "center", justifyContent: "center",
  },
  featureContent: { flex: 1 },
  featureTitle: { fontSize: 16, fontFamily: "DMSans_600SemiBold", color: Colors.text, marginBottom: 2 },
  featureDesc: { fontSize: 14, fontFamily: "DMSans_400Regular", color: Colors.textMuted },

  howSection: { marginBottom: 40 },
  stepsCol: { gap: 0 },
  stepRow: { flexDirection: "row", alignItems: "flex-start", gap: 16, position: "relative" as const, paddingBottom: 20 },
  stepNumWrap: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.primary,
    alignItems: "center", justifyContent: "center",
    boxShadow: "0 3px 10px rgba(45,139,78,0.3)",
  },
  stepNumText: { fontSize: 16, fontFamily: "DMSans_700Bold", color: "#fff" },
  stepContent: { flex: 1, paddingTop: 4 },
  stepTitle: { fontSize: 16, fontFamily: "DMSans_700Bold", color: Colors.text, marginBottom: 2 },
  stepDesc: { fontSize: 14, fontFamily: "DMSans_400Regular", color: Colors.textMuted },
  stepConnector: {
    position: "absolute" as const, left: 19, top: 42, width: 2, height: 18,
    backgroundColor: Colors.primaryLight,
  },

  bottomCta: { marginBottom: 32 },
  bottomCtaGrad: { borderRadius: 24, padding: 28, alignItems: "center" },
  bottomCtaTitle: { fontSize: 22, fontFamily: "DMSans_700Bold", color: "#fff", marginBottom: 8, textAlign: "center" },
  bottomCtaDesc: { fontSize: 14, fontFamily: "DMSans_400Regular", color: "rgba(255,255,255,0.75)", textAlign: "center", marginBottom: 24, lineHeight: 20 },
  whiteBtn: {
    flexDirection: "row", alignItems: "center", gap: 8,
    backgroundColor: "#fff", paddingHorizontal: 28, paddingVertical: 14,
    borderRadius: 14,
  },
  whiteBtnText: { fontSize: 15, fontFamily: "DMSans_700Bold", color: Colors.primary },

  footer: { alignItems: "center", paddingVertical: 24, borderTopWidth: 1, borderTopColor: Colors.borderLight },
  footerLogoRow: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 4 },
  footerLogoText: { fontSize: 16, fontFamily: "DMSans_700Bold", color: Colors.text },
  footerText: { fontSize: 13, fontFamily: "DMSans_400Regular", color: Colors.textMuted, marginBottom: 2 },
  footerCopy: { fontSize: 12, fontFamily: "DMSans_400Regular", color: Colors.textMuted },

  backRow: {
    marginTop: 12, marginBottom: 8, width: 44, height: 44,
    borderRadius: 14, backgroundColor: Colors.surface,
    borderWidth: 1, borderColor: Colors.cardBorder,
    alignItems: "center", justifyContent: "center",
  },

  authHeader: { alignItems: "center", marginBottom: 32, marginTop: 8 },
  authTitle: { fontSize: 26, fontFamily: "DMSans_700Bold", color: Colors.text, letterSpacing: -0.5, marginTop: 20, marginBottom: 6 },
  authSubtitle: { fontSize: 15, fontFamily: "DMSans_400Regular", color: Colors.textSecondary, textAlign: "center" },

  googleBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 12,
    paddingVertical: 15, borderRadius: 14, borderWidth: 1.5,
    borderColor: Colors.cardBorder, backgroundColor: Colors.surface, marginBottom: 24,
  },
  googleIconWrap: {
    width: 24, height: 24, borderRadius: 12, backgroundColor: "#f1f1f1",
    alignItems: "center", justifyContent: "center",
  },
  googleBtnText: { fontSize: 16, fontFamily: "DMSans_600SemiBold", color: Colors.text },

  dividerRow: { flexDirection: "row", alignItems: "center", gap: 14, marginBottom: 24 },
  dividerLine: { flex: 1, height: 1, backgroundColor: Colors.borderLight },
  dividerText: { fontSize: 13, fontFamily: "DMSans_500Medium", color: Colors.textMuted },

  formGroup: { marginBottom: 18 },
  formLabel: { fontSize: 14, fontFamily: "DMSans_600SemiBold", color: Colors.text, marginBottom: 8 },
  inputWrap: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: Colors.surface, borderRadius: 14, borderWidth: 1.5,
    borderColor: Colors.cardBorder, paddingHorizontal: 14,
  },
  inputIcon: { marginRight: 10 },
  formInput: {
    flex: 1, fontSize: 16, fontFamily: "DMSans_500Medium", color: Colors.text,
    paddingVertical: 15,
  },
  eyeBtn: { padding: 6 },

  errorRow: {
    flexDirection: "row", alignItems: "center", gap: 8,
    backgroundColor: Colors.dangerLight, padding: 14, borderRadius: 12, marginBottom: 16,
  },
  errorText: { fontSize: 14, fontFamily: "DMSans_500Medium", color: Colors.danger, flex: 1 },

  switchRow: { alignItems: "center", marginTop: 24 },
  switchText: { fontSize: 15, fontFamily: "DMSans_400Regular", color: Colors.textMuted },
  switchLink: { color: Colors.primary, fontFamily: "DMSans_600SemiBold" },

  roleHeader: { alignItems: "center", marginTop: 20, marginBottom: 12 },
  roleTitle: { fontSize: 28, fontFamily: "DMSans_700Bold", color: Colors.text, textAlign: "center", letterSpacing: -0.5, marginBottom: 8 },
  roleSubtitle: { fontSize: 15, fontFamily: "DMSans_400Regular", color: Colors.textSecondary, textAlign: "center", marginBottom: 32, lineHeight: 22 },
  rolesGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12, marginBottom: 32 },
  roleCard: {
    flexBasis: "47%", flexGrow: 1,
    backgroundColor: Colors.surface, borderRadius: 16, padding: 16,
    alignItems: "center", borderWidth: 1.5, borderColor: Colors.cardBorder,
    position: "relative" as const,
  },
  roleCardSelected: { borderColor: Colors.primary, backgroundColor: Colors.primaryLight },
  roleIconWrap: {
    width: 48, height: 48, borderRadius: 14, backgroundColor: Colors.primaryLight,
    alignItems: "center", justifyContent: "center", marginBottom: 10,
  },
  roleIconWrapSelected: { backgroundColor: Colors.primary },
  roleLabel: { fontSize: 14, fontFamily: "DMSans_600SemiBold", color: Colors.text },
  roleLabelSelected: { color: Colors.primary },
  checkMark: {
    position: "absolute" as const, top: 10, right: 10,
    width: 22, height: 22, borderRadius: 11, backgroundColor: Colors.primary,
    alignItems: "center", justifyContent: "center",
  },
});
