import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { Suspense, useCallback, useState } from "react";
import { ErrorBoundary } from "react-error-boundary";
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

import {
  useCategory,
  useUpdateCategory,
} from "~/service/category/category-api";

export default function UpdateCategoryScreen() {
  const router = useRouter();
  return (
    <ErrorBoundary
      fallback={
        <SafeAreaView className="flex-1 bg-gray-50">
          <View className="flex-1 items-center justify-center">
            <Ionicons name="alert-circle-outline" size={56} color="#9CA3AF" />
            <Text className="text-xl font-medium text-gray-400 mt-4">
              Category not found
            </Text>
            <Pressable
              className="mt-6 bg-blue-500 px-6 py-3 rounded-full"
              onPress={() => router.back()}
            >
              <Text className="text-white font-semibold">Go Back</Text>
            </Pressable>
          </View>
        </SafeAreaView>
      }
    >
      <Suspense
        fallback={
          <SafeAreaView className="flex-1 bg-gray-50">
            <View className="flex-1 items-center justify-center">
              <ActivityIndicator size="large" color="#3B82F6" />
              <Text className="text-gray-500 mt-4">Loading category...</Text>
            </View>
          </SafeAreaView>
        }
      >
        <UpdateCategoryView />
      </Suspense>
    </ErrorBoundary>
  );
}

function UpdateCategoryView() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: category } = useCategory(id);
  const { mutateAsync: updateCategory, isPending: isUpdating } =
    useUpdateCategory();

  const [name, setName] = useState(category.name);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = useCallback(async () => {
    if (!name.trim()) {
      setError("Category name is required");
      return;
    }

    if (isUpdating) {
      return; // Prevent multiple submissions
    }

    try {
      setError(null);
      await updateCategory({
        id,
        name: name.trim(),
      });

      setSuccess(true);

      // Go back after a short delay to show success state
      setTimeout(() => {
        router.back();
      }, 1500);
    } catch (err) {
      console.error("Failed to update category:", err);
      setError("Failed to update category. Please try again.");
    }
  }, [name, isUpdating, updateCategory, id, router]);

  return (
    <SafeAreaView className="flex-1 bg-gray-50 pb-14">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <View className="flex-1">
          <View className="px-4 py-4 flex-row items-center justify-between bg-white border-b border-gray-200">
            <View className="flex-row items-center">
              <Pressable
                className="mr-2 w-10 h-10 rounded-full bg-gray-50 items-center justify-center"
                onPress={() => router.back()}
                disabled={isUpdating || success}
              >
                <Ionicons name="chevron-back" size={24} color="#6B7280" />
              </Pressable>
              <Text className="text-xl font-bold text-gray-800">
                Update Category
              </Text>
            </View>
          </View>

          <ScrollView className="flex-1 px-4 py-4">
            {success ? (
              <View className="flex items-center justify-center py-10">
                <View className="w-16 h-16 rounded-full bg-green-100 items-center justify-center mb-4">
                  <Ionicons name="checkmark-circle" size={40} color="#10B981" />
                </View>
                <Text className="text-xl font-semibold text-gray-800 mb-2">
                  Category Updated!
                </Text>
                <Text className="text-gray-500 text-center">
                  Your category "{name}" has been updated successfully.
                </Text>
              </View>
            ) : (
              <View className="space-y-6">
                {error && (
                  <View className="mb-4 p-3 bg-red-50 rounded-lg border border-red-100">
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
                          groups. Renaming a category will affect all entries
                          assigned to it.
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
                  isUpdating ? "bg-blue-400" : "bg-blue-500"
                }`}
                onPress={handleSubmit}
                disabled={isUpdating}
              >
                {isUpdating ? (
                  <>
                    <ActivityIndicator size="small" color="white" />
                    <Text className="text-white font-semibold ml-2">
                      Updating...
                    </Text>
                  </>
                ) : (
                  <>
                    <Ionicons name="save-outline" size={20} color="white" />
                    <Text className="text-white font-semibold ml-2">
                      Update Category
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
