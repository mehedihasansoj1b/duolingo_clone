import { useAuth } from "@clerk/expo";
import { Pressable, Text, View } from "react-native";
import { Link, Redirect } from "expo-router";

export default function Index() {
  const { isLoaded, isSignedIn, signOut } = useAuth();

  if (!isLoaded) {
    return null;
  }

  if (!isSignedIn) {
    return <Redirect href="/onboarding" />;
  }

  return (
    <View className="flex-1 justify-center items-center gap-6">
      <Text className="h1 color-lingua-purple text-center">Lingua</Text>
      <Link href="/onboarding" className="text-lingua-green h4">
        Open Onboarding Screen
      </Link>
      <Pressable
        accessibilityRole="button"
        onPress={() => signOut()}
        className="rounded-2xl bg-lingua-purple px-6 py-4"
      >
        <Text className="font-poppins-semibold text-[16px] leading-[22px] text-white">
          Log Out
        </Text>
      </Pressable>
    </View>
  );
}
