import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
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
import { useCreateEntry } from "~/service/entry/entry-api";

export default function NewEntryScreen() {
  const router = useRouter();
  return (
    <ErrorBoundary
      fallback={
        <SafeAreaView className="flex-1 bg-gray-50">
          <View className="flex-1 items-center justify-center">
            <Ionicons name="alert-circle-outline" size={56} color="#9CA3AF" />
            <Text className="text-xl font-medium text-gray-400 mt-4">
              Error loading entries
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
            </View>
          </SafeAreaView>
        }
      >
        <NewEntryView />
      </Suspense>
    </ErrorBoundary>
  );
}

function NewEntryView() {
  const router = useRouter();
  const { mutateAsync: createEntry, isPending: isCreating } = useCreateEntry();
  const { data: categoriesData } = useCategories();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(
    null
  );
  const [showCategorySelector, setShowCategorySelector] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const selectedCategory = useMemo(
    () => categoriesData.categories.find((c) => c.id === selectedCategoryId),
    [categoriesData.categories, selectedCategoryId]
  );

  const handleSubmit = useCallback(async () => {
    if (!name.trim()) {
      return setError("Entry name is required");
    }

    if (!selectedCategoryId) {
      return setError("Please select a category");
    }

    if (isCreating) {
      return; // Prevent multiple submissions
    }

    try {
      setError(null);
      await createEntry(
        {
          name: name.trim(),
          categoryId: selectedCategoryId,
          description: description.trim() || null,
        },
        {
          onSuccess: () => {
            setSuccess(true);

            // Go back after a short delay to show success state
            setTimeout(() => {
              setSuccess(false);
              setError(null);
              setName("");
              setDescription("");
              setSelectedCategoryId(null);
              router.back();
            }, 1500);
          },
          onError: (err) => {
            console.error("Failed to create entry:", err);
            setError("Failed to create entry. Please try again.");
          },
        }
      );
    } catch (err) {
      console.error("Failed to create entry:", err);
      setError("Failed to create entry. Please try again.");
    }
  }, [createEntry, description, name, router, selectedCategoryId, isCreating]);

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
                disabled={isCreating}
              >
                <Ionicons name="chevron-back" size={24} color="#6B7280" />
              </Pressable>
              <Text className="text-xl font-bold text-gray-800">New Entry</Text>
            </View>
          </View>

          <ScrollView className="flex-1 px-4 py-4">
            {success ? (
              <View className="flex items-center justify-center py-10">
                <View className="w-16 h-16 rounded-full bg-green-100 items-center justify-center mb-4">
                  <Ionicons name="checkmark-circle" size={40} color="#10B981" />
                </View>
                <Text className="text-xl font-semibold text-gray-800 mb-2">
                  Entry Created!
                </Text>
                <Text className="text-gray-500 text-center">
                  Your new entry "{name}" has been created successfully.
                </Text>
                {selectedCategory && (
                  <Text className="text-gray-500 text-center mt-1">
                    It has been added to the "{selectedCategory.name}" category.
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
                      value={description}
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
                              className="px-4 py-3 border-b border-gray-100 active:bg-gray-50"
                              onPress={() => {
                                setSelectedCategoryId(category.id);
                                setShowCategorySelector(false);
                              }}
                            >
                              <Text className="text-gray-800">
                                {category.name}
                              </Text>
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
                      Create Entry
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
