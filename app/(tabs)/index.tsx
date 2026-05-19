import { languages } from "@/data/languages";
import { useLanguageStore } from "@/store/language-store";
import { useAuth } from "@clerk/expo";
import { router, Stack } from "expo-router";
import { Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function HomePlaceholder() {
  const { signOut } = useAuth();
  const { clearSelectedLanguage, selectedLanguageId } = useLanguageStore();

  const selectedLanguage = languages.find((l) => l.id === selectedLanguageId);

  return (
    <SafeAreaView className="flex-1 bg-[#f6f7fb]">
      <View className="flex-1 items-center px-6 pt-16">
        <Text className="font-poppins-bold text-[32px] text-lingua-purple mb-12">
          Home Placeholder
        </Text>

        {selectedLanguage && (
          <View className="items-center mb-12">
            <View className="h-[100px] w-[100px] items-center justify-center rounded-full bg-white shadow-[0_4px_20px_rgba(0,19,40,0.08)] mb-6">
              <Text style={{ fontSize: 55, lineHeight: 65, textAlign: "center", color: "#000" }}>
                {selectedLanguage.flagEmoji}
              </Text>
            </View>

            <Text className="font-poppins-bold text-[24px] text-text-primary mb-1">
              {selectedLanguage.name}
            </Text>
            <Text className="font-poppins-medium text-[16px] text-[#68728d]">
              {selectedLanguage.nativeName}
            </Text>
          </View>
        )}

        <Pressable
          accessibilityRole="button"
          onPress={() => router.push("/language-selection")}
          className="w-[80%] h-[56px] items-center justify-center rounded-3xl bg-lingua-purple mb-auto shadow-[0_4px_0_#5B3BF6]"
        >
          <Text className="font-poppins-semibold text-[16px] text-white">
            Choose a Language
          </Text>
        </Pressable>

        <Pressable
          accessibilityRole="button"
          onPress={() => signOut()}
          className="mb-6 p-2"
        >
          <Text className="font-poppins-medium text-[16px] text-[#68728d]">
            Sign Out
          </Text>
        </Pressable>

        <Pressable
          accessibilityRole="button"
          onPress={clearSelectedLanguage}
          className="mb-8 p-2"
        >
          <Text className="font-poppins-medium text-[14px] text-error">
            Clear Language (Test)
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
