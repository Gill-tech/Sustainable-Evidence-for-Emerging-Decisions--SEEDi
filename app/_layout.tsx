import { QueryClientProvider } from "@tanstack/react-query";
import { Stack, router, useSegments } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { queryClient } from "@/lib/query-client";
import { SeedProvider, useSeed } from "@/contexts/SeedContext";
import {
  useFonts,
  DMSans_400Regular,
  DMSans_500Medium,
  DMSans_600SemiBold,
  DMSans_700Bold,
} from "@expo-google-fonts/dm-sans";

SplashScreen.preventAutoHideAsync();

function RootLayoutNav() {
  const { isOnboarded, isLoading } = useSeed();
  const segments = useSegments();

  useEffect(() => {
    if (isLoading) return;

    const inTabs = segments[0] === "(tabs)";
    const inWorkflow = segments[0] === "workflow";

    if (!isOnboarded && (inTabs || inWorkflow)) {
      router.replace("/onboarding");
    } else if (isOnboarded && segments[0] === "onboarding") {
      router.replace("/(tabs)");
    }
  }, [isOnboarded, isLoading, segments]);

  return (
    <Stack screenOptions={{ headerBackTitle: "Back" }}>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen
        name="onboarding"
        options={{ headerShown: false, animation: "fade" }}
      />
      <Stack.Screen
        name="workflow/define-context"
        options={{ headerShown: false, animation: "slide_from_right" }}
      />
      <Stack.Screen
        name="workflow/explore-compare"
        options={{ headerShown: false, animation: "slide_from_right" }}
      />
      <Stack.Screen
        name="workflow/analyze-simulate"
        options={{ headerShown: false, animation: "slide_from_right" }}
      />
      <Stack.Screen
        name="workflow/generate-action"
        options={{ headerShown: false, animation: "slide_from_right" }}
      />
    </Stack>
  );
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    DMSans_400Regular,
    DMSans_500Medium,
    DMSans_600SemiBold,
    DMSans_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <KeyboardProvider>
            <SeedProvider>
              <RootLayoutNav />
            </SeedProvider>
          </KeyboardProvider>
        </GestureHandlerRootView>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
