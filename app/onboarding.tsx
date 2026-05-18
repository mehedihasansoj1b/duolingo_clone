import { images } from "@/constants/images";
import { Image } from "expo-image";
import { Stack, router } from "expo-router";
import { styled } from "nativewind";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const StyledImage = styled(Image);

export default function OnboardingScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <Stack.Screen options={{ headerShown: false }} />

      <View className="flex-1 bg-background px-6 pt-4 pb-12">
        {/* Header */}
        <View className="flex-row items-center justify-center gap-2 mt-4">
          <StyledImage
            source={images.mascotLogo}
            className="size-10"
            contentFit="contain"
          />
          <Text className="h2 text-text-primary mt-1">muolingo</Text>
        </View>

        {/* Center Content */}
        <Text className="h1 text-text-primary mt-10">Your AI language</Text>
        <Text className="h1 text-lingua-purple">teacher.</Text>
        <Text className="h3 text-text-primary text-left mt-2.5 opacity-50">
          Real conversations, personalized lessons, anytime, anywhere.
        </Text>
        <View className="flex-1 items-center justify-center mt-8">
          <View className="relative w-[280px] h-[280px] items-center justify-center">
            <StyledImage
              source={images.mascotWelcome}
              className="size-[220px] z-10"
              contentFit="contain"
            />

            {/* Bubble 1: Top Left */}
            <View className="absolute top-2 left-0 bg-background rounded-full py-2 px-4 z-0 border border-border shadow-[0_8px_16px_rgba(0,0,0,0.05)]">
              <Text className="h4 text-text-primary">Hello!</Text>
            </View>

            {/* Bubble 2: Top Right */}
            <View className="absolute top-12 -right-4 bg-background rounded-full py-2 px-4 z-20 border border-border shadow-[0_8px_16px_rgba(0,0,0,0.05)]">
              <Text className="h4 text-text-primary">!Hola!</Text>
            </View>

            {/* Bubble 3: Bottom Left */}
            <View className="absolute bottom-10 left-2 bg-background rounded-full py-2 px-4 z-20 border border-border shadow-[0_8px_16px_rgba(0,0,0,0.05)]">
              <Text className="h4 text-text-primary">你好!</Text>
            </View>
          </View>
        </View>

        {/* Footer Buttons */}
        <View className="gap-4 w-full mt-auto">
          <Pressable
            accessibilityRole="button"
            onPress={() => router.push("/sign-up")}
            className="bg-success rounded-2xl py-4 items-center justify-center shadow-[0_4px_0_#16A34A]"
          >
            <Text className="h4 text-background uppercase">Get Started</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#fff",
  },
});
