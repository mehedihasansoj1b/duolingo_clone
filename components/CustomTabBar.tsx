import React, { useEffect, useState } from "react";
import { View, Pressable, Text, useWindowDimensions } from "react-native";
import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  Easing,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export function CustomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const TAB_BAR_WIDTH = width;
  const tabWidth = TAB_BAR_WIDTH / state.routes.length;
  
  const translateX = useSharedValue(0);

  useEffect(() => {
    translateX.value = withTiming(state.index * tabWidth, {
      duration: 250,
      easing: Easing.out(Easing.cubic),
    });
  }, [state.index, tabWidth]);

  const animatedIndicatorStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: translateX.value }],
    };
  });

  return (
    <View
      className="flex-row bg-white border-t border-gray-100 shadow-[0_-4px_20px_rgba(0,19,40,0.05)] relative"
      style={{ paddingBottom: insets.bottom > 0 ? insets.bottom : 16, paddingTop: 16 }}
    >
      {/* Animated Circle Indicator */}
      <Animated.View
        style={[
          {
            position: "absolute",
            top: 16,
            left: 0,
            width: tabWidth,
            height: 56,
            alignItems: "center",
            justifyContent: "center",
            zIndex: 0,
          },
          animatedIndicatorStyle,
        ]}
      >
        <View className="w-14 h-14 bg-lingua-purple rounded-full" />
      </Animated.View>

      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const label =
          options.tabBarLabel !== undefined
            ? options.tabBarLabel
            : options.title !== undefined
            ? options.title
            : route.name;

        const isFocused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({
            type: "tabPress",
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name, route.params);
          }
        };

        const onLongPress = () => {
          navigation.emit({
            type: "tabLongPress",
            target: route.key,
          });
        };

        return (
          <Pressable
            key={route.key}
            accessibilityRole="button"
            accessibilityState={isFocused ? { selected: true } : {}}
            accessibilityLabel={options.tabBarAccessibilityLabel}
            testID={options.tabBarTestID}
            onPress={onPress}
            onLongPress={onLongPress}
            className="flex-1 items-center justify-center z-10"
            style={{ height: 56 }}
          >
            <View className="items-center justify-center h-full">
              {options.tabBarIcon &&
                options.tabBarIcon({
                  focused: isFocused,
                  color: isFocused ? "#ffffff" : "#68728d",
                  size: 24,
                })}
              {!isFocused && (
                <Text
                  className="font-poppins-medium text-[10px] mt-1"
                  style={{ color: "#68728d" }}
                >
                  {typeof label === "string" ? label : ""}
                </Text>
              )}
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}
