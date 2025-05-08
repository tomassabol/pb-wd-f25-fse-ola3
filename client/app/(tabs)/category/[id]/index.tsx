import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Suspense, useCallback, useState } from "react";
import { ErrorBoundary } from "react-error-boundary";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import {
  useCategory,
  useDeleteCategory,
} from "~/service/category/category-api";
import { useEntriesByCategoryId } from "~/service/entry/entry-api";

export default function CategoryScreen() {
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
              <Text className="text-lg text-gray-500">Loading category...</Text>
            </View>
          </SafeAreaView>
        }
      >
        <CategoryView />
      </Suspense>
    </ErrorBoundary>
  );
}

function CategoryView() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: category, refetch } = useCategory(id);
  const { data: entriesData } = useEntriesByCategoryId(id);
  const { mutateAsync: deleteCategory, isPending: isDeleting } =
    useDeleteCategory();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [showRefreshMessage, setShowRefreshMessage] = useState(false);

  const handleDeleteCategory = useCallback(async () => {
    await deleteCategory(id);
    setConfirmDelete(false);
    router.back();
  }, [deleteCategory, id, router]);

  const handleRefetch = useCallback(async () => {
    setIsFetching(true);
    setShowRefreshMessage(true);
    await refetch();
    setIsFetching(false);

    // Hide the message after 2 seconds
    setTimeout(() => {
      setShowRefreshMessage(false);
    }, 2000);
  }, [refetch]);

  return (
    <SafeAreaView className="flex-1 bg-gray-50 pb-14">
      <View className="flex-1">
        <View className="px-4 py-4 flex-row items-center justify-between bg-white border-b border-gray-200">
          <View className="flex-row items-center">
            <Pressable
              className="mr-2 w-10 h-10 rounded-full bg-gray-50 items-center justify-center"
              onPress={() => router.back()}
            >
              <Ionicons name="chevron-back" size={24} color="#6B7280" />
            </Pressable>
            <Text className="text-xl font-bold text-gray-800">
              Category Details
            </Text>
          </View>

          <Pressable
            className="w-10 h-10 rounded-full bg-blue-50 items-center justify-center"
            onPress={() => router.navigate(`/category/${id}/update`)}
          >
            <Ionicons name="pencil" size={20} color="#3B82F6" />
          </Pressable>
        </View>

        <ScrollView className="flex-1 px-4 py-4">
          {/* Category info card */}
          <View className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <View className="p-5 space-y-3">
              <View className="flex-row items-center">
                <View className="w-2 h-2 rounded-full bg-blue-500 mr-2" />
                <Text className="text-sm text-blue-500 font-medium">
                  {entriesData.total > 0 ? "Has entries" : "No entries"}
                </Text>
              </View>

              <Text className="text-2xl font-bold text-gray-800">
                {category.name}
              </Text>

              <View className="flex-row items-center justify-between mt-4 pt-4 border-t border-gray-100">
                <View className="flex-row items-center">
                  <Ionicons name="time-outline" size={16} color="#9CA3AF" />
                  <Text className="text-xs text-gray-400 ml-1">
                    Created: {new Date(category.createdAt).toLocaleDateString()}
                  </Text>
                </View>

                <Pressable
                  className="flex-row items-center"
                  onPress={handleRefetch}
                  disabled={isFetching}
                >
                  {isFetching ? (
                    <ActivityIndicator
                      size="small"
                      color="#3B82F6"
                      style={{ marginRight: 4 }}
                    />
                  ) : (
                    <Ionicons
                      name="refresh-outline"
                      size={16}
                      color="#9CA3AF"
                    />
                  )}
                  <Text className="text-xs text-gray-400 ml-1">
                    Updated: {new Date(category.updatedAt).toLocaleDateString()}
                  </Text>
                </Pressable>
              </View>

              {showRefreshMessage && (
                <View className="bg-blue-50 rounded-md p-2 mt-3 flex-row items-center justify-center">
                  <Ionicons name="checkmark-circle" size={16} color="#3B82F6" />
                  <Text className="text-blue-600 text-xs ml-1">
                    Category refreshed successfully!
                  </Text>
                </View>
              )}
            </View>
          </View>

          <View className="mt-6">
            <View className="flex-row items-center justify-between mb-3">
              <Text className="text-lg font-semibold text-gray-700">
                Entries
              </Text>
              <Text className="text-sm text-gray-400">
                {entriesData.total > 0 ? entriesData.total : 0}{" "}
                {entriesData.total === 1 ? "entry" : "entries"}
              </Text>
            </View>

            <View className="space-y-2 gap-y-2">
              {entriesData.entries.length > 0 ? (
                entriesData.entries.map((entry) => (
                  <Pressable
                    key={entry.id}
                    className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 active:bg-gray-50"
                    onPress={() => router.navigate(`/entry/${entry.id}`)}
                  >
                    <View className="flex-row justify-between items-center">
                      <View className="flex-1">
                        <Text className="text-base font-medium text-gray-800 mb-1">
                          {entry.name}
                        </Text>
                        {entry.description && (
                          <Text
                            className="text-sm text-gray-500 mb-2"
                            numberOfLines={2}
                          >
                            {entry.description}
                          </Text>
                        )}
                        <View className="flex-row items-center mt-1">
                          <Ionicons
                            name="time-outline"
                            size={14}
                            color="#9CA3AF"
                          />
                          <Text className="text-xs text-gray-400 ml-1">
                            {new Date(entry.createdAt).toLocaleDateString()}
                          </Text>
                        </View>
                      </View>
                      <Ionicons
                        name="chevron-forward"
                        size={20}
                        color="#D1D5DB"
                      />
                    </View>
                  </Pressable>
                ))
              ) : (
                <View className="bg-white rounded-xl p-6 items-center justify-center border border-gray-100">
                  <Ionicons name="document-outline" size={40} color="#D1D5DB" />
                  <Text className="text-base text-gray-400 mt-3">
                    No entries in this category
                  </Text>
                  <Pressable
                    className="mt-4 bg-blue-500 px-5 py-2 rounded-lg"
                    onPress={() => router.navigate("/new-entry")}
                  >
                    <Text className="text-white font-medium">Add Entry</Text>
                  </Pressable>
                </View>
              )}
            </View>
          </View>

          <View className="mt-6 mb-4">
            <Text className="text-lg font-semibold text-gray-700 mb-3">
              Actions
            </Text>

            <View className="space-y-2 gap-y-2">
              <Pressable
                className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex-row items-center"
                onPress={() => router.navigate("/new-entry")}
              >
                <View className="w-8 h-8 rounded-full bg-green-100 mr-3 items-center justify-center">
                  <Ionicons
                    name="add-circle-outline"
                    size={18}
                    color="#10B981"
                  />
                </View>
                <Text className="text-base font-medium text-gray-800">
                  Add New Entry
                </Text>
              </Pressable>

              <Pressable
                className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex-row items-center"
                onPress={() => setConfirmDelete(true)}
              >
                <View className="w-8 h-8 rounded-full bg-red-100 mr-3 items-center justify-center">
                  <Ionicons name="trash-outline" size={18} color="#EF4444" />
                </View>
                <Text className="text-base font-medium text-gray-800">
                  Delete Category
                </Text>
              </Pressable>

              <Pressable
                className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex-row items-center"
                onPress={handleRefetch}
                disabled={isFetching}
              >
                <View className="w-8 h-8 rounded-full bg-blue-100 mr-3 items-center justify-center">
                  {isFetching ? (
                    <ActivityIndicator size="small" color="#3B82F6" />
                  ) : (
                    <Ionicons
                      name="refresh-outline"
                      size={18}
                      color="#3B82F6"
                    />
                  )}
                </View>
                <Text className="text-base font-medium text-gray-800">
                  {isFetching ? "Refreshing..." : "Refresh Category"}
                </Text>
              </Pressable>
            </View>
          </View>
        </ScrollView>

        <Modal visible={confirmDelete} transparent={true} animationType="fade">
          <View className="flex-1 bg-black/50 items-center justify-center">
            <View className="bg-white rounded-xl p-6 m-5 w-[85%] shadow-lg">
              <View className="items-center mb-4">
                <View className="w-12 h-12 rounded-full bg-red-100 items-center justify-center mb-2">
                  <Ionicons name="alert-circle" size={28} color="#EF4444" />
                </View>
                <Text className="text-xl font-bold text-gray-800">
                  Delete Category?
                </Text>
                <Text className="text-gray-500 text-center mt-2">
                  Are you sure you want to delete "{category.name}"?
                  {entriesData.total && entriesData.total > 0
                    ? ` This will affect ${entriesData.total} ${entriesData.total === 1 ? "entry" : "entries"}.`
                    : " This action cannot be undone."}
                </Text>
              </View>

              <View className="space-y-3 mt-2 gap-y-2">
                <Pressable
                  className="bg-gray-100 py-3 rounded-lg items-center"
                  onPress={() => setConfirmDelete(false)}
                >
                  <Text className="font-medium text-gray-700">Cancel</Text>
                </Pressable>
                <Pressable
                  className="bg-red-500 py-3 rounded-lg items-center"
                  onPress={handleDeleteCategory}
                  disabled={isDeleting}
                >
                  {isDeleting ? (
                    <ActivityIndicator size="small" color="white" />
                  ) : (
                    <Text className="font-medium text-white">Delete</Text>
                  )}
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    </SafeAreaView>
  );
}
