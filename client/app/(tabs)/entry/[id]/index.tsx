import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useState } from "react";
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
  useDeleteEntryMutation,
  useGetEntryByIdQuery,
} from "~/service/entry/entry-api";

export default function EntryScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const {
    data: entry,
    isLoading,
    refetch,
    isFetching,
  } = useGetEntryByIdQuery(id);
  const [deleteEntry] = useDeleteEntryMutation();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [showRefreshMessage, setShowRefreshMessage] = useState(false);

  const handleDeleteEntry = useCallback(async () => {
    await deleteEntry(id);
    router.back();
  }, [deleteEntry, id, router]);

  const handleRefetch = useCallback(async () => {
    setShowRefreshMessage(true);
    await refetch();

    // Hide the message after 2 seconds
    setTimeout(() => {
      setShowRefreshMessage(false);
    }, 2000);
  }, [refetch]);

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <View className="flex-1 items-center justify-center">
          <Text className="text-lg text-gray-500">Loading entry...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!entry) {
    return (
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
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
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
              Entry Details
            </Text>
          </View>

          <Pressable
            className="w-10 h-10 rounded-full bg-blue-50 items-center justify-center"
            onPress={() => router.navigate(`/entry/${id}/update`)}
          >
            <Ionicons name="pencil" size={20} color="#3B82F6" />
          </Pressable>
        </View>

        <ScrollView className="flex-1 px-4 py-4">
          <View className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <View className="p-5 space-y-3">
              <View className="flex-row items-center">
                <View className="w-2 h-2 rounded-full bg-blue-500 mr-2" />
                <Text className="text-sm text-blue-500 font-medium mr-2">
                  {entry.categoryId ? "Categorized" : "Uncategorized"}
                </Text>
                <Text className="text-sm text-gray-500 font-medium">
                  {entry.category.name}
                </Text>
              </View>

              <Text className="text-2xl font-bold text-gray-800">
                {entry.name}
              </Text>

              {entry.description && (
                <Text className="text-base text-gray-600 leading-relaxed mt-2">
                  {entry.description}
                </Text>
              )}

              <View className="flex-row items-center justify-between mt-4 pt-4 border-t border-gray-100">
                <View className="flex-row items-center">
                  <Ionicons name="time-outline" size={16} color="#9CA3AF" />
                  <Text className="text-xs text-gray-400 ml-1">
                    Created: {entry.createdAt.toLocaleDateString()}
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
                    Updated: {entry.updatedAt.toLocaleDateString()}
                  </Text>
                </Pressable>
              </View>

              {showRefreshMessage && (
                <View className="bg-blue-50 rounded-md p-2 mt-3 flex-row items-center justify-center">
                  <Ionicons name="checkmark-circle" size={16} color="#3B82F6" />
                  <Text className="text-blue-600 text-xs ml-1">
                    Entry refreshed successfully!
                  </Text>
                </View>
              )}
            </View>
          </View>

          <View className="mt-6">
            <Text className="text-lg font-semibold text-gray-700 mb-3">
              Actions
            </Text>

            <View className="space-y-2 gap-y-2">
              <Pressable
                className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex-row items-center"
                onPress={() => setConfirmDelete(true)}
              >
                <View className="w-8 h-8 rounded-full bg-red-100 mr-3 items-center justify-center">
                  <Ionicons name="trash-outline" size={18} color="#EF4444" />
                </View>
                <Text className="text-base font-medium text-gray-800">
                  Delete Entry
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
                  {isFetching ? "Refreshing..." : "Refresh Entry"}
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
                  Delete Entry?
                </Text>
                <Text className="text-gray-500 text-center mt-2">
                  Are you sure you want to delete "{entry.name}"? This action
                  cannot be undone.
                </Text>
              </View>

              <View className="space-y-3 mt-2">
                <Pressable
                  className="bg-gray-100 py-3 rounded-lg items-center"
                  onPress={() => setConfirmDelete(false)}
                >
                  <Text className="font-medium text-gray-700">Cancel</Text>
                </Pressable>
                <Pressable
                  className="bg-red-500 py-3 rounded-lg items-center"
                  onPress={handleDeleteEntry}
                >
                  <Text className="font-medium text-white">Delete</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    </SafeAreaView>
  );
}
