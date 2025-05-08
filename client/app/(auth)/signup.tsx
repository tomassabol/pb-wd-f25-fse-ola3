import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useCallback, useState } from "react";
import { Alert, Text, TextInput, TouchableOpacity, View } from "react-native";

import { useAuth } from "../../store/auth";

export default function SignupScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { signup, isAuthenticated } = useAuth();

  const handleSignup = useCallback(async () => {
    try {
      await signup({ email, password });
      if (isAuthenticated) {
        router.replace("/(tabs)");
      }
    } catch {
      Alert.alert("Error", "Failed to create account");
    }
  }, [email, password, signup, isAuthenticated]);

  return (
    <View className="flex-1 bg-gray-50 justify-center">
      {/* Header */}
      <View className="bg-white py-12 px-4">
        <View className="items-center">
          <View className="w-24 h-24 bg-blue-100 rounded-full items-center justify-center mb-4">
            <Ionicons name="person-add" size={48} color="#3b82f6" />
          </View>
          <Text className="text-2xl font-bold text-gray-900">
            Create Account
          </Text>
          <Text className="text-gray-500">Sign up to get started</Text>
        </View>
      </View>

      {/* Form */}
      <View className="px-4 pt-6">
        <View className="bg-white rounded-xl shadow-sm p-4">
          <View className="space-y-4">
            <View>
              <Text className="text-gray-500 text-sm mb-2">Email</Text>
              <View className="flex-row items-center border border-gray-200 rounded-lg px-4">
                <Ionicons name="mail-outline" size={20} color="#6b7280" />
                <TextInput
                  className="flex-1 p-4"
                  placeholder="Enter your email"
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                />
              </View>
            </View>

            <View>
              <Text className="text-gray-500 text-sm mb-2">Password</Text>
              <View className="flex-row items-center border border-gray-200 rounded-lg px-4">
                <Ionicons
                  name="lock-closed-outline"
                  size={20}
                  color="#6b7280"
                />
                <TextInput
                  className="flex-1 p-4"
                  placeholder="Create a password"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                />
              </View>
            </View>

            <TouchableOpacity
              className="bg-blue-500 rounded-lg p-4 mt-6"
              onPress={handleSignup}
            >
              <Text className="text-white text-center font-semibold text-lg">
                Create Account
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => router.push("/(auth)/login")}
              className="mt-4"
            >
              <Text className="text-blue-500 text-center">
                Already have an account?{" "}
                <Text className="font-semibold">Sign in</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
}
