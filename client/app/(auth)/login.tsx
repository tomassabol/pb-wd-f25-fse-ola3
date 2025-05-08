import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useCallback, useState } from "react";
import { Alert, Text, TextInput, TouchableOpacity, View } from "react-native";

import { useAuth } from "../../store/auth";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login, isAuthenticated } = useAuth();

  const handleLogin = useCallback(async () => {
    try {
      await login({ email, password });

      if (isAuthenticated) {
        router.replace("/(tabs)");
      }
    } catch {
      Alert.alert("Error", "Invalid credentials");
    }
  }, [email, password, login, isAuthenticated]);

  return (
    <View className="flex-1 bg-gray-50 justify-center">
      {/* Header */}
      <View className="bg-white py-12 px-4">
        <View className="items-center">
          <View className="w-24 h-24 bg-blue-100 rounded-full items-center justify-center mb-4">
            <Ionicons name="log-in" size={48} color="#3b82f6" />
          </View>
          <Text className="text-2xl font-bold text-gray-900">Welcome Back</Text>
          <Text className="text-gray-500">Sign in to continue</Text>
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
                  placeholder="Enter your password"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                />
              </View>
            </View>

            <TouchableOpacity
              className="bg-blue-500 rounded-lg p-4 mt-6"
              onPress={handleLogin}
            >
              <Text className="text-white text-center font-semibold text-lg">
                Sign In
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => router.push("/(auth)/signup")}
              className="mt-4"
            >
              <Text className="text-blue-500 text-center">
                Don't have an account?{" "}
                <Text className="font-semibold">Sign up</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
}
