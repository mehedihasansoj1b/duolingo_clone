import { languages } from "@/data/languages";
import { useLanguageStore } from "@/store/language-store";
import { useAuth } from "@clerk/expo";
import { router, Redirect, Stack } from "expo-router";
import { Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Index() {
  const { isLoaded, isSignedIn, signOut } = useAuth();
  const { clearSelectedLanguage, hasHydrated, selectedLanguageId } =
    useLanguageStore();

  if (!isLoaded) {
    return null;
  }

  if (!isSignedIn) {
    return <Redirect href="/onboarding" />;
  }

  if (!hasHydrated) {
    return null;
  }

  if (!selectedLanguageId) {
    return <Redirect href="/language-selection" />;
  }

  return <Redirect href="/(tabs)" />;
}
