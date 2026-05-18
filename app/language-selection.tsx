import { images } from "@/constants/images";
import { languages } from "@/data/languages";
import type { LanguageCode } from "@/types/learning";
import { FontAwesome } from "@expo/vector-icons";
import { Image } from "expo-image";
import { router, Stack } from "expo-router";
import { styled } from "nativewind";
import { useMemo, useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const StyledImage = styled(Image);

const learnerCounts: Record<LanguageCode, string> = {
  es: "28.4M learners",
  fr: "19.4M learners",
  ja: "12.7M learners",
};

export default function LanguageSelectionScreen() {
  const { height } = useWindowDimensions();
  const earthHeight = Math.max(150, Math.min(220, height * 0.22));
  const [selectedLanguageId, setSelectedLanguageId] =
    useState<LanguageCode>("es");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredLanguages = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    if (!normalizedQuery) {
      return languages;
    }

    return languages.filter((language) => {
      const searchableText =
        `${language.name} ${language.nativeName}`.toLowerCase();

      return searchableText.includes(normalizedQuery);
    });
  }, [searchQuery]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <Stack.Screen options={{ headerShown: false }} />

      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View className="px-7 pt-3">
          <View className="relative h-10 flex-row items-center justify-center">
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Go back"
              onPress={() => router.back()}
              className="absolute left-0 h-10 w-10 items-start justify-center"
            >
              <FontAwesome name="angle-left" size={32} color="#001328" />
            </Pressable>

            <Text className="font-poppins-semibold text-[21px] leading-[28px] text-text-primary">
              Choose a language
            </Text>
          </View>

          <View className="mt-5 h-[58px] flex-row items-center gap-4 rounded-[28px] border border-border bg-[#fbfbfd] px-6">
            <FontAwesome name="search" size={22} color="#69738f" />
            <TextInput
              autoCapitalize="none"
              autoCorrect={false}
              onChangeText={setSearchQuery}
              placeholder="Search languages"
              placeholderTextColor="#69738f"
              returnKeyType="search"
              style={styles.searchInput}
              value={searchQuery}
            />
          </View>

          <View className="mt-6 gap-4">
            <Text className="font-poppins-semibold text-[15px] leading-[22px] text-text-primary">
              Popular
            </Text>

            <View className="gap-0">
              {filteredLanguages.map((language) => {
                const isSelected = language.id === selectedLanguageId;

                return (
                  <Pressable
                    accessibilityRole="button"
                    accessibilityState={{ selected: isSelected }}
                    key={language.id}
                    onPress={() => setSelectedLanguageId(language.id)}
                    className={[
                      "h-[92px] flex-row items-center rounded-[24px] bg-background px-5",
                      isSelected
                        ? "border-2 border-[#8b62ff] bg-[#fbfaff]"
                        : "border border-[#f0f2f7]",
                    ].join(" ")}
                  >
                    <View className="h-[54px] w-[54px] items-center justify-center rounded-full bg-white shadow-[0_2px_10px_rgba(0,19,40,0.08)]">
                      <Text className="text-[30px] leading-[38px]">
                        {language.flagEmoji}
                      </Text>
                    </View>

                    <View className="ml-5 flex-1">
                      <Text className="font-poppins-semibold text-[20px] leading-[27px] text-text-primary">
                        {language.name}
                      </Text>
                      <Text className="mt-1 font-poppins text-[15px] leading-[22px] text-[#68728d]">
                        {learnerCounts[language.id]}
                      </Text>
                    </View>

                    <View className="h-11 w-11 items-center justify-center">
                      {isSelected ? (
                        <View className="h-9 w-9 items-center justify-center rounded-full bg-lingua-purple shadow-[0_4px_10px_rgba(108,78,245,0.25)]">
                          <FontAwesome name="check" size={17} color="#ffffff" />
                        </View>
                      ) : (
                        <FontAwesome
                          name="angle-right"
                          size={30}
                          color="#68728d"
                        />
                      )}
                    </View>
                  </Pressable>
                );
              })}
            </View>
          </View>

          <Pressable
            accessibilityRole="button"
            onPress={() => router.replace("/")}
            className="mt-5 h-[66px] flex-row items-center justify-center rounded-[22px] bg-success shadow-[0_4px_0_#16A34A]"
          >
            <Text className="font-poppins-semibold text-[18px] leading-[26px] text-white">
              Continue
            </Text>
          </Pressable>
        </View>

        <View style={[styles.earthFrame, { height: earthHeight }]}>
          <StyledImage
            source={images.earth}
            style={styles.earthImage}
            contentFit="cover"
            contentPosition="center"
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 0,
  },
  searchInput: {
    flex: 1,
    color: "#001328",
    fontFamily: "Poppins-Regular",
    fontSize: 18,
    lineHeight: 24,
    padding: 0,
  },
  earthImage: {
    height: "145%",
    width: "100%",
  },
  earthFrame: {
    marginTop: 40,
    overflow: "hidden",
    width: "100%",
  },
});
