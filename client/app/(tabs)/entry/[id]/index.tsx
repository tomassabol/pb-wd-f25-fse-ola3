import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Suspense, useCallback, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useDeleteEntry, useEntry } from "~/service/entry/entry-api";

export default function EntryScreen() {
  return (
    <Suspense fallback={<Text>Loading...</Text>}>
      <EntryView />
    </Suspense>
  );
}

function EntryView() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: entry, refetch, isFetching } = useEntry(id);
  const { mutateAsync: deleteEntry } = useDeleteEntry();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [showRefreshMessage, setShowRefreshMessage] = useState(false);

  const handleDeleteEntry = useCallback(async () => {
    await deleteEntry(id, {
      onSuccess: () => {
        setConfirmDelete(false);
        router.back();
      },
    });
  }, [deleteEntry, id, router]);

  const handleRefetch = useCallback(async () => {
    setShowRefreshMessage(true);
    await refetch();

    // Hide the message after 2 seconds
    setTimeout(() => {
      setShowRefreshMessage(false);
    }, 2000);
  }, [refetch]);

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
                    Created: {new Date(entry.createdAt).toLocaleDateString()}
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
                    Updated: {new Date(entry.updatedAt).toLocaleDateString()}
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
                  Refresh Entry
                </Text>
              </Pressable>
            </View>
          </View>
        </ScrollView>
      </View>

      <Modal
        visible={confirmDelete}
        transparent
        animationType="fade"
        onRequestClose={() => setConfirmDelete(false)}
      >
        <View className="flex-1 bg-black/50 items-center justify-center px-4">
          <View className="bg-white rounded-xl w-full max-w-sm p-6">
            <View className="items-center mb-4">
              <View className="w-12 h-12 rounded-full bg-red-100 items-center justify-center mb-3">
                <Ionicons name="alert-circle" size={24} color="#EF4444" />
              </View>
              <Text className="text-xl font-bold text-gray-800 text-center">
                Delete Entry
              </Text>
              <Text className="text-gray-500 text-center mt-2">
                Are you sure you want to delete this entry? This action cannot
                be undone.
              </Text>
            </View>

            <View className="flex-row space-x-3">
              <Pressable
                className="flex-1 py-3 rounded-lg border border-gray-200"
                onPress={() => setConfirmDelete(false)}
              >
                <Text className="text-center font-medium text-gray-600">
                  Cancel
                </Text>
              </Pressable>
              <Pressable
                className="flex-1 py-3 rounded-lg bg-red-500"
                onPress={handleDeleteEntry}
              >
                <Text className="text-center font-medium text-white">
                  Delete
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
