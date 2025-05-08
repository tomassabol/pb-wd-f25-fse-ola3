import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useCreateCategory } from "~/service/category/category-api";

export default function NewCategoryScreen() {
  const router = useRouter();
  const { mutateAsync: createCategory, isPending: isCreating } =
    useCreateCategory();

  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = useCallback(async () => {
    if (!name.trim()) {
      setError("Category name is required");
      return;
    }

    if (isCreating) {
      return; // Prevent multiple submissions
    }

    try {
      setError(null);
      await createCategory(
        { name: name.trim() },
        {
          onSuccess: () => {
            setSuccess(true);
            setName("");

            // Go back after a short delay to show success state
            setTimeout(() => {
              setSuccess(false);
              setError(null);
              setName("");
              router.navigate("/categories");
            }, 1500);
          },
          onError: (err) => {
            console.error("Failed to create category:", err);
            setError("Failed to create category. Please try again.");
          },
        }
      );
    } catch (err) {
      console.error("Failed to create category:", err);
      setError("Failed to create category. Please try again.");
    }
  }, [createCategory, name, router, isCreating]);

  return (
    <SafeAreaView className="flex-1 bg-gray-50 pb-14">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <View className="flex-1">
          <View className="px-4 py-4 flex-row items-center justify-between bg-white border-b border-gray-200">
            <View className="flex-row items-center">
              <Pressable
                className="mr-2 w-10 h-10 rounded-full bg-gray-50 items-center justify-center"
                onPress={() => router.navigate("/categories")}
                disabled={isCreating}
              >
                <Ionicons name="chevron-back" size={24} color="#6B7280" />
              </Pressable>
              <Text className="text-xl font-bold text-gray-800">
                New Category
              </Text>
            </View>
          </View>

          <ScrollView className="flex-1 px-4 py-6">
            {success ? (
              <View className="flex items-center justify-center py-10">
                <View className="w-16 h-16 rounded-full bg-green-100 items-center justify-center mb-4">
                  <Ionicons name="checkmark-circle" size={40} color="#10B981" />
                </View>
                <Text className="text-xl font-semibold text-gray-800 mb-2">
                  Category Created!
                </Text>
                <Text className="text-gray-500 text-center">
                  Your new category "{name}" has been created successfully.
                </Text>
              </View>
            ) : (
              <View className="space-y-6">
                {error && (
                  <View className="p-3 bg-red-50 rounded-lg border border-red-100">
                    <Text className="text-red-600">{error}</Text>
                  </View>
                )}

                <View>
                  <View className="mb-6">
                    <View className="flex-row justify-between items-center mb-1">
                      <Text className="text-sm font-medium text-gray-700">
                        Category Name
                      </Text>
                      <Text className="text-xs text-gray-400">Required</Text>
                    </View>
                    <TextInput
                      className="bg-white border border-gray-200 rounded-lg px-4 py-3 text-gray-800"
                      placeholder="Enter category name"
                      value={name}
                      onChangeText={setName}
                      autoFocus
                    />
                  </View>

                  <View className="p-4 bg-blue-50 rounded-lg mb-6">
                    <View className="flex-row items-start">
                      <Ionicons
                        name="information-circle"
                        size={24}
                        color="#3B82F6"
                      />
                      <View className="ml-3 flex-1">
                        <Text className="text-sm font-medium text-blue-700 mb-1">
                          About Categories
                        </Text>
                        <Text className="text-sm text-blue-600">
                          Categories help you organize your entries into logical
                          groups. You can create as many categories as you need.
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>
              </View>
            )}
          </ScrollView>

          {!success && (
            <View className="p-4 bg-white border-t border-gray-200">
              <Pressable
                className={`rounded-lg py-3 flex-row justify-center items-center ${
                  isCreating ? "bg-blue-400" : "bg-blue-500"
                }`}
                onPress={handleSubmit}
                disabled={isCreating}
              >
                {isCreating ? (
                  <>
                    <ActivityIndicator size="small" color="white" />
                    <Text className="text-white font-semibold ml-2">
                      Creating...
                    </Text>
                  </>
                ) : (
                  <>
                    <Ionicons
                      name="add-circle-outline"
                      size={20}
                      color="white"
                    />
                    <Text className="text-white font-semibold ml-2">
                      Create Category
                    </Text>
                  </>
                )}
              </Pressable>
            </View>
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
