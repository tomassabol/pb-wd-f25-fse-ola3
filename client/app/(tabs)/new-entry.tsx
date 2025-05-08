import { useCallback, useMemo, useState } from "react";
import {
  Text,
  View,
  ScrollView,
  Pressable,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useCreateEntryMutation } from "~/service/entry/entry-api";
import { useGetCategoriesQuery } from "~/service/category/category-api";
import React from "react";

export default function NewEntryScreen() {
  const router = useRouter();
  const [createEntry, { isLoading: isCreating }] = useCreateEntryMutation();
  const { data: categoriesData, isLoading: isCategoriesLoading } =
    useGetCategoriesQuery();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(
    null
  );
  const [showCategorySelector, setShowCategorySelector] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const selectedCategory = useMemo(
    () => categoriesData?.categories?.find((c) => c.id === selectedCategoryId),
    [categoriesData?.categories, selectedCategoryId]
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
      await createEntry({
        name: name.trim(),
        categoryId: selectedCategoryId,
        description: description.trim() || null,
      }).unwrap();

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
    } catch (err) {
      console.error("Failed to create entry:", err);
      setError("Failed to create entry. Please try again.");
    }
  }, [createEntry, description, name, router, selectedCategoryId]);

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
                        {isCategoriesLoading ? (
                          <View className="p-4 items-center">
                            <ActivityIndicator color="#3B82F6" />
                            <Text className="text-gray-500 mt-2">
                              Loading categories...
                            </Text>
                          </View>
                        ) : !categoriesData?.categories ||
                          categoriesData.categories.length === 0 ? (
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
