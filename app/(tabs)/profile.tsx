import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ProfilePlaceholder() {
  return (
    <SafeAreaView className="flex-1 bg-[#f6f7fb] justify-center items-center">
      <Text className="font-poppins-bold text-[32px] text-lingua-purple">
        Profile Placeholder
      </Text>
    </SafeAreaView>
  );
}
