import { images } from "@/constants/images";
import { languages } from "@/data/languages";
import { lessons } from "@/data/lessons";
import { units } from "@/data/units";
import { useLanguageStore } from "@/store/language-store";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Image } from "expo-image";
import { router } from "expo-router";
import { styled } from "nativewind";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const StyledImage = styled(Image);

export default function LearnScreen() {
  const { selectedLanguageId } = useLanguageStore();

  const selectedLanguage =
    languages.find((l) => l.id === selectedLanguageId) || languages[0];

  const currentUnit =
    units.find((u) => u.languageId === selectedLanguage.id) || units[0];

  const currentLanguageLessons = lessons.filter(
    (l) => l.unitId === currentUnit.id
  );

  // Mock active lesson index
  const activeLessonIndex = 2; // 3rd lesson is active

  return (
    <SafeAreaView className="flex-1 bg-[#f9fafb]" edges={["top"]}>
      {/* Header */}
      <View className="flex-row items-center justify-between px-6 py-4 bg-[#f9fafb] z-10">
        <Pressable
          accessibilityRole="button"
          onPress={() => router.back()}
          className="h-10 w-10 items-center justify-center -ml-2"
        >
          <Ionicons name="chevron-back" size={28} color="#001328" />
        </Pressable>
        <View className="flex-1 items-start pl-2">
          <Text className="font-poppins-bold text-[18px] text-text-primary leading-tight">
            {currentLanguageLessons[activeLessonIndex]?.title || currentUnit.title}
          </Text>
          <Text className="font-poppins-medium text-[13px] text-text-secondary mt-0.5">
            Unit {currentUnit.order} • {activeLessonIndex + 1} / {currentLanguageLessons.length} lessons
          </Text>
        </View>
        <Pressable 
          accessibilityRole="button"
          className="h-10 w-10 items-center justify-center -mr-2"
        >
          <Ionicons name="bookmark" size={24} color="#FBBF24" />
        </Pressable>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerClassName="pb-36"
      >
        {/* Banner Image Area */}
        <View className="w-full h-[240px] bg-[#eef5ff] relative overflow-hidden">
          <StyledImage
            source={{ uri: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?q=80&w=1000&auto=format&fit=crop" }} 
            className="w-full h-full absolute opacity-85"
            contentFit="cover"
          />
          <StyledImage
            source={images.mascotWelcome}
            className="w-[170px] h-[170px] absolute bottom-2 left-6 z-10"
            contentFit="contain"
          />
        </View>

        {/* Tabs - Overlapping the banner */}
        <View className="px-6 mt-[-30px] z-20">
          <View className="flex-row bg-white/95 p-1.5 rounded-[20px] shadow-[0_8px_16px_rgba(0,0,0,0.06)] border border-gray-100">
            <View className="flex-1 bg-white py-3 rounded-xl items-center justify-center shadow-sm border-b-2 border-lingua-purple">
              <Text className="font-poppins-bold text-[15px] text-lingua-purple">
                Lessons
              </Text>
            </View>
            <View className="flex-1 py-3 rounded-xl items-center justify-center">
              <Text className="font-poppins-medium text-[15px] text-text-secondary">
                Practice
              </Text>
            </View>
          </View>
        </View>

        {/* Lesson List */}
        <View className="px-6 pt-8 gap-4">
          {currentLanguageLessons.map((lesson, index) => {
            const isCompleted = index < activeLessonIndex;
            const isActive = index === activeLessonIndex;
            const isUpcoming = index > activeLessonIndex;

            return (
              <Pressable
                key={lesson.id}
                accessibilityRole="button"
                onPress={() =>
                  router.push({
                    pathname: "/audio-lesson/[id]",
                    params: { id: lesson.id },
                  })
                }
                className={`bg-white rounded-[20px] p-5 border ${
                  isActive
                    ? "border-lingua-purple shadow-[0_4px_16px_rgba(108,78,245,0.12)]"
                    : "border-gray-100 shadow-[0_2px_8px_rgba(0,0,0,0.02)]"
                } flex-row items-center justify-between active:opacity-90`}
              >
                <View className="flex-1 pr-4">
                  <Text
                    className={`font-poppins-semibold text-[13px] ${
                      isActive ? "text-lingua-purple" : "text-text-secondary"
                    }`}
                  >
                    Lesson {index + 1}
                  </Text>
                  <Text className="font-poppins-bold text-[18px] mt-1 text-text-primary">
                    {lesson.title}
                  </Text>
                  {isActive && (
                    <Text className="font-poppins-medium text-[14px] text-lingua-purple mt-1">
                      In progress
                    </Text>
                  )}
                </View>

                {/* Status Indicator */}
                <View className="items-center justify-center">
                  {isCompleted && (
                    <View className="w-[30px] h-[30px] rounded-full bg-[#22c55e] items-center justify-center shadow-sm">
                      <Ionicons name="checkmark" size={18} color="white" />
                    </View>
                  )}
                  {(isActive || isUpcoming) && (
                    <StyledImage
                      source={{ uri: `https://picsum.photos/seed/${lesson.id}/120` }}
                      className="w-[56px] h-[56px] rounded-xl"
                      contentFit="cover"
                      style={isUpcoming ? { opacity: 0.6 } : undefined}
                    />
                  )}
                </View>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
