import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { Suspense, useCallback, useMemo, useState } from "react";
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

import { useCategories } from "~/service/category/category-api";
import { useEntry, useUpdateEntry } from "~/service/entry/entry-api";

export default function UpdateEntryScreen() {
  const router = useRouter();
  return (
    <ErrorBoundary
      fallback={
        <SafeAreaView className="flex-1 bg-gray-50">
          <View className="flex-1 items-center justify-center">
            <Ionicons name="alert-circle-outline" size={56} color="#9CA3AF" />
            <Text className="text-xl font-medium text-gray-400 mt-4">
              Entry not found
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
              <Text className="text-gray-500 mt-4">Loading entry...</Text>
            </View>
          </SafeAreaView>
        }
      >
        <UpdateEntryview />
      </Suspense>
    </ErrorBoundary>
  );
}

function UpdateEntryview() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: entry } = useEntry(id);
  const { mutateAsync: updateEntry, isPending: isUpdating } = useUpdateEntry();
  const { data: categoriesData } = useCategories();

  const [name, setName] = useState(entry.name);
  const [description, setDescription] = useState(entry.description);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(
    entry.categoryId
  );
  const [showCategorySelector, setShowCategorySelector] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const selectedCategory = useMemo(
    () => categoriesData.categories.find(({ id }) => id === selectedCategoryId),
    [categoriesData.categories, selectedCategoryId]
  );

  const handleSubmit = useCallback(async () => {
    if (!name.trim()) {
      setError("Entry name is required");
      return;
    }

    if (!selectedCategoryId) {
      setError("Please select a category");
      return;
    }

    if (isUpdating) {
      return; // Prevent multiple submissions
    }

    try {
      setError(null);
      await updateEntry({
        categoryId: selectedCategoryId,
        description: description?.trim() ?? null,
        id,
        name: name.trim(),
      });

      setSuccess(true);

      // Go back after a short delay to show success state
      setTimeout(() => {
        router.back();
      }, 1500);
    } catch (err) {
      console.error("Failed to update entry:", err);
      setError("Failed to update entry. Please try again.");
    }
  }, [
    name,
    selectedCategoryId,
    isUpdating,
    updateEntry,
    id,
    description,
    router,
  ]);

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
                onPress={() => router.back()}
                disabled={isUpdating || success}
              >
                <Ionicons name="chevron-back" size={24} color="#6B7280" />
              </Pressable>
              <Text className="text-xl font-bold text-gray-800">
                Update Entry
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
                  Entry Updated!
                </Text>
                <Text className="text-gray-500 text-center">
                  Your entry "{name}" has been updated successfully.
                </Text>
                {selectedCategory && (
                  <Text className="text-gray-500 text-center mt-1">
                    It belongs to the "{selectedCategory.name}" category.
                  </Text>
                )}
              </View>
            ) : (
              <View className="space-y-6">
                {error && (
                  <View className="mb-4 p-3 bg-red-50 rounded-lg border border-red-100">
                    <Text className="text-red-600">{error}</Text>
                  </View>
                )}

                <View className="space-y-6">
                  {/* Name field */}
                  <View>
                    <Text className="text-sm font-medium text-gray-700 mb-1">
                      Name
                    </Text>
                    <TextInput
                      className="bg-white border border-gray-200 rounded-lg px-4 py-3 text-gray-800"
                      placeholder="Enter entry name"
                      value={name}
                      onChangeText={setName}
                    />
                  </View>

                  {/* Description field */}
                  <View>
                    <Text className="text-sm font-medium text-gray-700 mb-1">
                      Description (optional)
                    </Text>
                    <TextInput
                      className="bg-white border border-gray-200 rounded-lg px-4 py-3 text-gray-800 min-h-[100px]"
                      placeholder="Enter description"
                      value={description ?? ""}
                      onChangeText={setDescription}
                      multiline
                      textAlignVertical="top"
                    />
                  </View>

                  {/* Category selector */}
                  <View>
                    <Text className="text-sm font-medium text-gray-700 mb-1">
                      Category
                    </Text>
                    <Pressable
                      className="bg-white border border-gray-200 rounded-lg px-4 py-3 flex-row justify-between items-center"
                      onPress={() =>
                        setShowCategorySelector(!showCategorySelector)
                      }
                    >
                      <Text
                        className={
                          selectedCategory ? "text-gray-800" : "text-gray-400"
                        }
                      >
                        {selectedCategory
                          ? selectedCategory.name
                          : "Select a category"}
                      </Text>
                      <Ionicons
                        name={
                          showCategorySelector ? "chevron-up" : "chevron-down"
                        }
                        size={20}
                        color="#9CA3AF"
                      />
                    </Pressable>

                    {showCategorySelector && (
                      <View className="mt-2 bg-white border border-gray-200 rounded-lg overflow-hidden">
                        {categoriesData.categories.length === 0 ? (
                          <View className="p-4 items-center">
                            <Text className="text-gray-500">
                              No categories available
                            </Text>
                          </View>
                        ) : (
                          categoriesData.categories.map((category) => (
                            <Pressable
                              key={category.id}
                              className={`p-3 border-b border-gray-100 flex-row justify-between items-center ${
                                selectedCategoryId === category.id
                                  ? "bg-blue-50"
                                  : ""
                              }`}
                              onPress={() => {
                                setSelectedCategoryId(category.id);
                                setShowCategorySelector(false);
                              }}
                            >
                              <Text
                                className={`${selectedCategoryId === category.id ? "text-blue-600 font-medium" : "text-gray-800"}`}
                              >
                                {category.name}
                              </Text>
                              {selectedCategoryId === category.id && (
                                <Ionicons
                                  name="checkmark"
                                  size={20}
                                  color="#3B82F6"
                                />
                              )}
                            </Pressable>
                          ))
                        )}
                      </View>
                    )}
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
                      Update Entry
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
