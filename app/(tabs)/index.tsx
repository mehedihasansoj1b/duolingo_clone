import { images } from "@/constants/images";
import { languages } from "@/data/languages";
import { lessons } from "@/data/lessons";
import { useLanguageStore } from "@/store/language-store";
import { useAuth, useUser } from "@clerk/expo";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Image } from "expo-image";
import { router } from "expo-router";
import { styled } from "nativewind";
import { useEffect, useState } from "react";
import { Alert, NativeSyntheticEvent, Pressable, ScrollView, Text, TextLayoutEventData, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const StyledImage = styled(Image);

export default function HomeScreen() {
  const { signOut } = useAuth();
  const { user } = useUser();
  const { clearSelectedLanguage, selectedLanguageId } = useLanguageStore();
  const [showEmoji, setShowEmoji] = useState(true);

  const selectedLanguage = languages.find((l) => l.id === selectedLanguageId) || languages[0];
  const firstName = user?.firstName ?? "Alex";

  // Reset showEmoji to true whenever name or language changes to re-measure layout
  useEffect(() => {
    setShowEmoji(true);
  }, [selectedLanguageId, firstName]);

  const handleTextLayout = (e: NativeSyntheticEvent<TextLayoutEventData>) => {
    // If text wraps to 2+ lines, hide the emoji to make it fit on 1 line
    if (e.nativeEvent.lines.length > 1 && showEmoji) {
      setShowEmoji(false);
    }
  };

  // Get language specific greeting
  const getGreeting = (langId: string) => {
    switch (langId) {
      case "es":
        return "Hola";
      case "fr":
        return "Bonjour";
      case "ja":
        return "こんにちは";
      default:
        return "Hello";
    }
  };

  const greeting = getGreeting(selectedLanguage.id);

  // Get lessons for the current language
  const currentLanguageLessons = lessons.filter(
    (l) => l.languageId === selectedLanguage.id
  );
  // "At the Cafe" (spanish-cafe) is index 1 for Spanish.
  // In general, we display the second lesson for the unit as completed/active.
  const currentLesson = currentLanguageLessons[1] || currentLanguageLessons[0];

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      {/* Scrollable Content */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerClassName="px-6 pt-2 pb-10"
      >
        {/* Header Bar */}
        <View className="flex-row items-center justify-between mb-6">
          <View className="flex-row items-center gap-2.5 flex-1 mr-3">
            {/* Flag Button - allows changing language */}
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Change language"
              onPress={() => router.push("/language-selection")}
              className="h-11 w-11 items-center justify-center rounded-full bg-white shadow-[0_4px_12px_rgba(0,19,40,0.08)] border border-gray-100 shrink-0"
            >
              <Text className="text-[26px] leading-[32px] text-center">
                {selectedLanguage.flagEmoji}
              </Text>
            </Pressable>

            {/* Greeting */}
            <Text 
              onTextLayout={handleTextLayout}
              className="font-poppins-bold text-[18px] text-text-primary flex-1"
            >
              {greeting}, {firstName}!{showEmoji ? " 👋" : ""}
            </Text>
          </View>

          {/* Right Side Indicators */}
          <View className="flex-row items-center gap-2.5 shrink-0">
            {/* Streak Counter */}
            <View className="flex-row items-center gap-1.5 bg-white px-3 py-1.5 rounded-full border border-gray-100 shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
              <StyledImage
                source={images.streakFire}
                className="w-[20px] h-[22px]"
                contentFit="contain"
              />
              <Text className="font-poppins-bold text-[16px] text-text-primary">
                12
              </Text>
            </View>

            {/* Notification Bell */}
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Notifications"
              onPress={() => Alert.alert("Notifications", "You have no new notifications.")}
              className="h-10 w-10 items-center justify-center rounded-full bg-white border border-gray-100 shadow-[0_2px_8px_rgba(0,0,0,0.02)] active:opacity-85"
            >
              <Ionicons name="notifications-outline" size={22} color="#001328" />
            </Pressable>
          </View>
        </View>

        {/* Daily Goal Card */}
        <View className="bg-[#FFFDF4] border border-[#FFE8C5] rounded-[24px] p-5 flex-row items-center justify-between mb-5 shadow-[0_4px_12px_rgba(255,160,0,0.02)]">
          <View className="flex-1 mr-4">
            <Text className="font-poppins-medium text-[14px] text-[#68728d]">
              Daily goal
            </Text>
            <View className="flex-row items-baseline mt-1 mb-3">
              <Text className="font-poppins-bold text-[28px] text-text-primary leading-[34px]">
                15
              </Text>
              <Text className="font-poppins-semibold text-[16px] text-text-secondary ml-1.5">
                / 20 XP
              </Text>
            </View>
            {/* Progress Bar Container */}
            <View className="h-2.5 w-full bg-[#FFEAD0] rounded-full overflow-hidden">
              {/* Progress Bar Fill */}
              <View className="h-full bg-streak w-[75%] rounded-full" />
            </View>
          </View>

          {/* Treasure Chest */}
          <StyledImage
            source={images.treasure}
            className="w-[84px] h-[84px]"
            contentFit="contain"
          />
        </View>

        {/* Continue Learning Card */}
        <View className="bg-lingua-purple rounded-[24px] p-6 relative overflow-hidden min-h-[160px] justify-between shadow-[0_8px_20px_rgba(108,78,245,0.15)] mb-6">
          <View className="flex-1 pr-[110px]">
            <Text className="font-poppins-semibold text-[12px] text-[#E0D8FF] tracking-wider uppercase">
              Continue learning
            </Text>
            <Text className="font-poppins-bold text-[26px] text-white mt-1 leading-[32px]">
              {selectedLanguage.name}
            </Text>
            <Text className="font-poppins-medium text-[14px] text-[#E0D8FF] mt-1">
              A1 • Unit 3
            </Text>
            <Pressable
              accessibilityRole="button"
              onPress={() => router.push("/(tabs)/learn")}
              className="bg-white rounded-2xl py-2 px-6 mt-4 self-start shadow-sm active:opacity-90"
            >
              <Text className="text-lingua-purple font-poppins-bold text-[14px]">
                Continue
              </Text>
            </Pressable>
          </View>

          {/* Palace/Castle Image */}
          <StyledImage
            source={images.palace}
            className="w-[124px] h-[124px] absolute right-2 bottom-0"
            contentFit="contain"
          />
        </View>

        {/* Today's Plan Section */}
        <View className="mb-6">
          <View className="flex-row justify-between items-center mb-3">
            <Text className="font-poppins-bold text-[20px] text-text-primary">
              Today's plan
            </Text>
            <Pressable
              accessibilityRole="button"
              onPress={() => router.push("/(tabs)/learn")}
            >
              <Text className="font-poppins-semibold text-[14px] text-lingua-purple">
                View all
              </Text>
            </Pressable>
          </View>

          {/* Plan Items */}
          <View className="gap-3">
            {/* Item 1: Lesson */}
            <Pressable
              accessibilityRole="button"
              onPress={() => router.push("/(tabs)/learn")}
              className="flex-row items-center justify-between bg-white rounded-2xl p-4 border border-gray-100 shadow-[0_2px_8px_rgba(0,0,0,0.01)] active:opacity-90"
            >
              <View className="flex-row items-center flex-1 mr-4">
                <View className="h-12 w-12 rounded-2xl bg-[#5b3bf6] items-center justify-center mr-4">
                  <Ionicons name="book" size={22} color="#ffffff" />
                </View>
                <View className="flex-1">
                  <Text className="font-poppins-bold text-[16px] text-text-primary">
                    Lesson
                  </Text>
                  <Text className="font-poppins text-[14px] text-text-secondary mt-0.5" numberOfLines={1}>
                    {currentLesson?.title ?? "At the café"}
                  </Text>
                </View>
              </View>
              {/* Checkmark */}
              <Ionicons name="checkmark-circle" size={26} color="#6c4ef5" />
            </Pressable>

            {/* Item 2: AI Conversation */}
            <Pressable
              accessibilityRole="button"
              onPress={() => router.push("/(tabs)/chat")}
              className="flex-row items-center justify-between bg-white rounded-2xl p-4 border border-gray-100 shadow-[0_2px_8px_rgba(0,0,0,0.01)] active:opacity-90"
            >
              <View className="flex-row items-center flex-1 mr-4">
                <View className="h-12 w-12 rounded-2xl bg-[#5b3bf6] items-center justify-center mr-4">
                  <Ionicons name="headset" size={22} color="#ffffff" />
                </View>
                <View className="flex-1">
                  <Text className="font-poppins-bold text-[16px] text-text-primary">
                    AI Conversation
                  </Text>
                  <Text className="font-poppins text-[14px] text-text-secondary mt-0.5" numberOfLines={1}>
                    Talk about your day
                  </Text>
                </View>
              </View>
              {/* Outline Circle */}
              <View className="w-[24px] h-[24px] rounded-full border-2 border-[#CBD5E1]" />
            </Pressable>

            {/* Item 3: New Words */}
            <Pressable
              accessibilityRole="button"
              onPress={() => router.push("/(tabs)/learn")}
              className="flex-row items-center justify-between bg-white rounded-2xl p-4 border border-gray-100 shadow-[0_2px_8px_rgba(0,0,0,0.01)] active:opacity-90"
            >
              <View className="flex-row items-center flex-1 mr-4">
                <View className="h-12 w-12 rounded-2xl bg-[#FF6B6B] items-center justify-center mr-4">
                  <Ionicons name="language" size={22} color="#ffffff" />
                </View>
                <View className="flex-1">
                  <Text className="font-poppins-bold text-[16px] text-text-primary">
                    New words
                  </Text>
                  <Text className="font-poppins text-[14px] text-text-secondary mt-0.5" numberOfLines={1}>
                    10 words
                  </Text>
                </View>
              </View>
              {/* Outline Circle */}
              <View className="w-[24px] h-[24px] rounded-full border-2 border-[#CBD5E1]" />
            </Pressable>
          </View>
        </View>


        {/* Developer / Testing Section (Subtly styled at the very bottom) */}
        <View className="border-t border-gray-100 pt-8 mt-4 items-center">
          <Text className="font-poppins-semibold text-[12px] text-[#6b7280] uppercase tracking-wider mb-4">
            Developer Controls
          </Text>
          <View className="flex-row gap-4 w-full justify-center">
            <Pressable
              accessibilityRole="button"
              onPress={() => router.push("/language-selection")}
              className="px-4 py-2.5 rounded-xl border border-gray-200 bg-[#FAFBFD] items-center justify-center flex-1 active:opacity-90"
            >
              <Text className="font-poppins-semibold text-[13px] text-text-primary">
                Change Language
              </Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              onPress={clearSelectedLanguage}
              className="px-4 py-2.5 rounded-xl border border-gray-200 bg-[#FAFBFD] items-center justify-center flex-1 active:opacity-90"
            >
              <Text className="font-poppins-semibold text-[13px] text-error">
                Clear Language
              </Text>
            </Pressable>
          </View>
          <Pressable
            accessibilityRole="button"
            onPress={() => signOut()}
            className="mt-4 px-6 py-2.5 rounded-xl border border-gray-200 bg-[#FAFBFD] items-center justify-center w-full active:opacity-90"
          >
            <Text className="font-poppins-semibold text-[13px] text-text-secondary">
              Sign Out
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
