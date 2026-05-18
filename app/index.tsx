import { Text, View } from "react-native";
import { Link } from "expo-router";

export default function Index() {
  return (
    <View className="flex-1 justify-center items-center gap-6">
      <Text className="h1 color-lingua-purple text-center">Lingua</Text>
      <Link href="/onboarding" className="text-lingua-green h4">
        Open Onboarding Screen
      </Link>
    </View>
  );
}
