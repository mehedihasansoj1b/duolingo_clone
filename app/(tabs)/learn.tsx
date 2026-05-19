import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function LearnPlaceholder() {
  return (
    <SafeAreaView className="flex-1 bg-[#f6f7fb] justify-center items-center">
      <Text className="font-poppins-bold text-[32px] text-lingua-purple">
        Learn Placeholder
      </Text>
    </SafeAreaView>
  );
}
