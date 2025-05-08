import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import React from "react";
import { Platform, useColorScheme } from "react-native";

import Colors from "../../constants/Colors";

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: Platform.select({
          ios: {
            // Use a transparent background on iOS to show the blur effect
            position: "absolute",
          },
          default: {},
        }),
        tabBarActiveTintColor: Colors[colorScheme ?? "light"].tint,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color }) => (
            <Ionicons name="home" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="categories"
        options={{
          title: "Categories",
          tabBarIcon: ({ color }) => (
            <Ionicons name="list" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color }) => (
            <Ionicons name="person" size={24} color={color} />
          ),
        }}
      />

      {/* Screens to hide */}
      <Tabs.Screen
        name="category/[id]/index"
        options={{
          tabBarItemStyle: {
            display: "none",
          },
          tabBarButton: () => null,
        }}
      />
      <Tabs.Screen
        name="entry/[id]/index"
        options={{
          tabBarItemStyle: {
            display: "none",
          },
          tabBarButton: () => null,
        }}
      />
      <Tabs.Screen
        name="entry/[id]/update"
        options={{
          tabBarItemStyle: {
            display: "none",
          },
          tabBarButton: () => null,
        }}
      />
      <Tabs.Screen
        name="category/[id]/update"
        options={{
          tabBarItemStyle: {
            display: "none",
          },
          tabBarButton: () => null,
        }}
      />
      <Tabs.Screen
        name="new-entry"
        options={{
          tabBarItemStyle: {
            display: "none",
          },
          tabBarButton: () => null,
        }}
      />
      <Tabs.Screen
        name="new-category"
        options={{
          tabBarItemStyle: {
            display: "none",
          },
          tabBarButton: () => null,
        }}
      />
    </Tabs>
  );
}
