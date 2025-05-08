import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useCallback, useEffect } from "react";
import { Alert, Text, TouchableOpacity, View } from "react-native";

import { useAuth } from "../../store/auth";

export default function ProfileScreen() {
  const { user, logout } = useAuth();

  useEffect(() => {
    if (!user) {
      router.replace("/(auth)/login");
    }
  }, [user]);

  const handleLogout = useCallback(() => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Logout",
        style: "destructive",
        onPress: () => {
          logout();
          router.replace("/(auth)/login");
        },
      },
    ]);
  }, [logout]);

  if (!user) return null;

  return (
    <View className="flex-1 bg-gray-50 pt-24">
      {/* Header */}
      <View className="bg-white pt-12 pb-6 px-4">
        <View className="items-center">
          <View className="w-24 h-24 bg-blue-100 rounded-full items-center justify-center mb-4">
            <Ionicons name="person" size={48} color="#3b82f6" />
          </View>
          <Text className="text-2xl font-bold text-gray-900">{user.email}</Text>
          <Text className="text-gray-500 capitalize">{user.role}</Text>
        </View>
      </View>

      {/* Content */}
      <View className="flex-1 px-4 pt-6">
        <View className="bg-white rounded-xl shadow-sm">
          {/* Account Info Section */}
          <View className="p-4 border-b border-gray-100">
            <Text className="text-lg font-semibold text-gray-900 mb-4">
              Account Information
            </Text>
            <View className="space-y-4">
              <View className="flex-row items-center">
                <Ionicons name="mail-outline" size={20} color="#6b7280" />
                <View className="ml-3">
                  <Text className="text-gray-500 text-sm">Email</Text>
                  <Text className="text-gray-900">{user.email}</Text>
                </View>
              </View>
              <View className="flex-row items-center">
                <Ionicons name="shield-outline" size={20} color="#6b7280" />
                <View className="ml-3">
                  <Text className="text-gray-500 text-sm">Role</Text>
                  <Text className="text-gray-900 capitalize">{user.role}</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Actions Section */}
          <View className="p-4">
            <TouchableOpacity
              className="flex-row items-center justify-between bg-red-50 p-4 rounded-lg"
              onPress={handleLogout}
            >
              <View className="flex-row items-center">
                <Ionicons name="log-out-outline" size={20} color="#ef4444" />
                <Text className="text-red-500 font-semibold ml-3">Logout</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#ef4444" />
            </TouchableOpacity>
          </View>
        </View>

        {/* App Info */}
        <View className="mt-6 items-center">
          <Text className="text-gray-400 text-sm">Version 1.0.0</Text>
        </View>
      </View>
    </View>
  );
}
