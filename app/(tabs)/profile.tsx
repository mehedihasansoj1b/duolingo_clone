import { images } from "@/constants/images";
import { languages } from "@/data/languages";
import { useLanguageStore } from "@/store/language-store";
import { useAuth, useUser } from "@clerk/expo";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Image } from "expo-image";
import { router } from "expo-router";
import { styled } from "nativewind";
import { Alert, Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const StyledImage = styled(Image);

export default function ProfileScreen() {
  const { signOut } = useAuth();
  const { user } = useUser();
  const { selectedLanguageId } = useLanguageStore();

  const selectedLanguage =
    languages.find((l) => l.id === selectedLanguageId) || languages[0];

  const fullName = user?.fullName ?? "Alex Carter";
  const emailAddress = user?.primaryEmailAddress?.emailAddress ?? "alex@example.com";
  
  // Format joined date beautifully
  const joinedDate = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      })
    : "May 2026";

  const handleSignOut = async () => {
    try {
      await signOut();
      router.replace("/onboarding");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-[#FAFBFD]" edges={["top"]}>
      {/* Top Header Bar */}
      <View className="flex-row items-center justify-between px-6 py-4 bg-white border-b border-gray-100">
        <Text className="font-poppins-bold text-[24px] text-text-primary">
          Profile
        </Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Settings"
          className="h-10 w-10 items-center justify-center rounded-full bg-[#FAFBFD] border border-gray-100 active:opacity-75"
        >
          <Ionicons name="settings-outline" size={20} color="#001328" />
        </Pressable>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerClassName="px-6 pt-6 pb-36"
      >
        {/* User Card */}
        <View className="bg-white rounded-[24px] p-6 items-center shadow-[0_4px_16px_rgba(0,0,0,0.02)] border border-gray-100 mb-6">
          <View className="relative">
            {user?.imageUrl ? (
              <StyledImage
                source={{ uri: user.imageUrl }}
                className="w-24 h-24 rounded-full border-4 border-[#F0EEFF]"
                contentFit="cover"
              />
            ) : (
              <View className="w-24 h-24 rounded-full bg-lingua-purple/10 items-center justify-center border-4 border-[#F0EEFF]">
                <Ionicons name="person" size={44} color="#6c4ef5" />
              </View>
            )}
            {/* Edit Avatar Badge */}
            <View className="absolute right-0 bottom-0 bg-lingua-purple border-2 border-white rounded-full p-1.5 shadow-md">
              <Ionicons name="camera" size={14} color="#ffffff" />
            </View>
          </View>

          <Text className="font-poppins-bold text-[22px] text-text-primary mt-4 text-center">
            {fullName}
          </Text>
          <Text className="font-poppins text-[14px] text-text-secondary mt-0.5 text-center">
            {emailAddress}
          </Text>

          {/* Member Badge */}
          <View className="flex-row items-center gap-1.5 bg-[#F0EEFF] px-4 py-1.5 rounded-full mt-4">
            <Ionicons name="calendar-outline" size={14} color="#6c4ef5" />
            <Text className="font-poppins-medium text-[12px] text-lingua-purple leading-[16px]">
              Member since {joinedDate}
            </Text>
          </View>
        </View>

        {/* Statistics Section */}
        <View className="mb-6">
          <Text className="font-poppins-bold text-[18px] text-text-primary mb-3">
            My Statistics
          </Text>

          {/* 2x2 Grid */}
          <View className="flex-row flex-wrap gap-4">
            {/* Streak Tile */}
            <View className="bg-white rounded-[20px] p-4 flex-1 min-w-[140px] border border-gray-100 shadow-[0_2px_8px_rgba(0,0,0,0.01)]">
              <View className="flex-row items-center justify-between mb-2">
                <StyledImage
                  source={images.streakFire}
                  className="w-[28px] h-[30px]"
                  contentFit="contain"
                />
                <Text className="font-poppins-bold text-[24px] text-streak">
                  12
                </Text>
              </View>
              <Text className="font-poppins-bold text-[14px] text-text-primary">
                Day Streak
              </Text>
              <Text className="font-poppins text-[11px] text-text-secondary mt-0.5">
                Active learning days
              </Text>
            </View>

            {/* Language Tile */}
            <View className="bg-white rounded-[20px] p-4 flex-1 min-w-[140px] border border-gray-100 shadow-[0_2px_8px_rgba(0,0,0,0.01)]">
              <View className="flex-row items-center justify-between mb-2">
                <Text className="text-[28px] leading-[34px]">
                  {selectedLanguage.flagEmoji}
                </Text>
                <Ionicons name="school" size={22} color="#6c4ef5" />
              </View>
              <Text className="font-poppins-bold text-[14px] text-text-primary">
                {selectedLanguage.name}
              </Text>
              <Text className="font-poppins text-[11px] text-text-secondary mt-0.5">
                Unit 3 • Beginner
              </Text>
            </View>
          </View>

          <View className="flex-row flex-wrap gap-4 mt-4">
            {/* XP Goal Tile */}
            <View className="bg-white rounded-[20px] p-4 flex-1 min-w-[140px] border border-gray-100 shadow-[0_2px_8px_rgba(0,0,0,0.01)]">
              <View className="flex-row items-center justify-between mb-1">
                <Ionicons name="flash" size={24} color="#ffcb00" />
                <Text className="font-poppins-bold text-[18px] text-text-primary">
                  15/20 XP
                </Text>
              </View>
              <Text className="font-poppins-bold text-[14px] text-text-primary">
                Daily Goal
              </Text>
              {/* Progress Bar Container */}
              <View className="h-2 w-full bg-[#FFEAD0] rounded-full overflow-hidden mt-1.5 mb-1">
                <View className="h-full bg-streak w-[75%] rounded-full" />
              </View>
              <Text className="font-poppins text-[11px] text-text-secondary">
                75% Completed
              </Text>
            </View>

            {/* League Rank Tile */}
            <View className="bg-white rounded-[20px] p-4 flex-1 min-w-[140px] border border-gray-100 shadow-[0_2px_8px_rgba(0,0,0,0.01)]">
              <View className="flex-row items-center justify-between mb-2">
                <Ionicons name="trophy" size={24} color="#21c16b" />
                <Text className="font-poppins-bold text-[18px] text-[#21c16b]">
                  #3
                </Text>
              </View>
              <Text className="font-poppins-bold text-[14px] text-text-primary">
                Gold League
              </Text>
              <Text className="font-poppins text-[11px] text-text-secondary mt-0.5">
                Top 10% this week
              </Text>
            </View>
          </View>
        </View>

        {/* Gamified Achievements/Badges */}
        <View className="mb-6">
          <Text className="font-poppins-bold text-[18px] text-text-primary mb-3">
            Achievements
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerClassName="gap-3.5 pr-6"
          >
            {/* Badge 1 */}
            <View className="bg-white rounded-[20px] p-4 items-center w-[120px] border border-gray-100 shadow-[0_2px_8px_rgba(0,0,0,0.01)]">
              <View className="h-12 w-12 rounded-full bg-[#FFE8C5] items-center justify-center mb-2.5">
                <Text className="text-[22px]">🔥</Text>
              </View>
              <Text className="font-poppins-bold text-[13px] text-text-primary text-center">
                Streak Hero
              </Text>
              <Text className="font-poppins text-[10px] text-text-secondary mt-0.5 text-center">
                7+ Days
              </Text>
            </View>

            {/* Badge 2 */}
            <View className="bg-white rounded-[20px] p-4 items-center w-[120px] border border-gray-100 shadow-[0_2px_8px_rgba(0,0,0,0.01)]">
              <View className="h-12 w-12 rounded-full bg-[#E0D8FF] items-center justify-center mb-2.5">
                <Text className="text-[22px]">🦉</Text>
              </View>
              <Text className="font-poppins-bold text-[13px] text-text-primary text-center">
                Sage Owl
              </Text>
              <Text className="font-poppins text-[10px] text-text-secondary mt-0.5 text-center">
                50+ Words
              </Text>
            </View>

            {/* Badge 3 */}
            <View className="bg-white rounded-[20px] p-4 items-center w-[120px] border border-gray-100 shadow-[0_2px_8px_rgba(0,0,0,0.01)]">
              <View className="h-12 w-12 rounded-full bg-[#D4F7E6] items-center justify-center mb-2.5">
                <Text className="text-[22px]">🏆</Text>
              </View>
              <Text className="font-poppins-bold text-[13px] text-text-primary text-center">
                Champion
              </Text>
              <Text className="font-poppins text-[10px] text-text-secondary mt-0.5 text-center">
                Top 3 Place
              </Text>
            </View>

            {/* Badge 4 - Locked */}
            <View className="bg-white rounded-[20px] p-4 items-center w-[120px] border border-gray-100 shadow-[0_2px_8px_rgba(0,0,0,0.01)] opacity-50">
              <View className="h-12 w-12 rounded-full bg-gray-100 items-center justify-center mb-2.5">
                <Ionicons name="lock-closed" size={18} color="#6b7280" />
              </View>
              <Text className="font-poppins-bold text-[13px] text-text-primary text-center">
                Early Bird
              </Text>
              <Text className="font-poppins text-[10px] text-text-secondary mt-0.5 text-center">
                Before 9 AM
              </Text>
            </View>
          </ScrollView>
        </View>

        {/* Account settings / Action list */}
        <View className="bg-white rounded-[24px] overflow-hidden border border-gray-100 shadow-[0_4px_16px_rgba(0,0,0,0.02)] mb-8">
          {/* Action 1: Change Language */}
          <Pressable
            accessibilityRole="button"
            onPress={() => router.push("/language-selection")}
            className="flex-row items-center justify-between p-4.5 border-b border-gray-100 active:bg-gray-50/50"
          >
            <View className="flex-row items-center gap-3.5">
              <View className="h-9 w-9 rounded-xl bg-lingua-purple/10 items-center justify-center">
                <Ionicons name="language" size={18} color="#6c4ef5" />
              </View>
              <Text className="font-poppins-semibold text-[15px] text-text-primary">
                Change Learning Language
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
          </Pressable>

          {/* Action 2: Notifications settings */}
          <Pressable
            accessibilityRole="button"
            onPress={() => Alert.alert("Notifications Settings", "Notification settings will be available in the next release.")}
            className="flex-row items-center justify-between p-4.5 border-b border-gray-100 active:bg-gray-50/50"
          >
            <View className="flex-row items-center gap-3.5">
              <View className="h-9 w-9 rounded-xl bg-[#E6F0FF] items-center justify-center">
                <Ionicons name="notifications-outline" size={18} color="#3B82F6" />
              </View>
              <Text className="font-poppins-semibold text-[15px] text-text-primary">
                Notifications Settings
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
          </Pressable>

          {/* Action 3: Help & Support */}
          <Pressable
            accessibilityRole="button"
            onPress={() => Alert.alert("Help & Support", "Please contact our support team at support@lingua.com.")}
            className="flex-row items-center justify-between p-4.5 active:bg-gray-50/50"
          >
            <View className="flex-row items-center gap-3.5">
              <View className="h-9 w-9 rounded-xl bg-[#E8F8F0] items-center justify-center">
                <Ionicons name="help-circle-outline" size={18} color="#21c16b" />
              </View>
              <Text className="font-poppins-semibold text-[15px] text-text-primary">
                Help & Support
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
          </Pressable>
        </View>

        {/* Premium Log Out Button */}
        <Pressable
          accessibilityRole="button"
          onPress={handleSignOut}
          className="flex-row items-center justify-center gap-2 bg-[#FFF1F2] border border-[#FECDD3] rounded-[20px] py-4.5 px-6 shadow-sm active:bg-[#FFE4E6]"
        >
          <Ionicons name="log-out-outline" size={20} color="#F43F5E" />
          <Text className="font-poppins-bold text-[16px] text-[#E11D48] leading-[22px]">
            Sign Out
          </Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}
