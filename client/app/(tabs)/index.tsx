import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useEntriesByCategory } from "~/service/entry/entry-api";

export default function EntriesScreen() {
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
              <Text className="text-lg text-gray-500">Loading entries...</Text>
            </View>
          </SafeAreaView>
        }
      >
        <EntriesView />
      </Suspense>
    </ErrorBoundary>
  );
}

function EntriesView() {
  const router = useRouter();
  const { data: entriesByCategory } = useEntriesByCategory();

  if (Object.keys(entriesByCategory.entries).length === 0) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <ScrollView className="flex-1 px-4 py-6">
          <View className="flex items-center justify-center h-64">
            <Ionicons name="document-text-outline" size={56} color="#9CA3AF" />
            <Text className="text-xl font-medium text-gray-400 mt-4">
              No entries found
            </Text>
            <Text className="mt-2 text-sm text-gray-400 text-center px-8">
              Create your first entry to get started
            </Text>
            <Pressable
              className="mt-6 bg-blue-500 px-6 py-3 rounded-full"
              onPress={() => router.navigate("/new-entry")}
            >
              <Text className="text-white font-semibold">Create Entry</Text>
            </Pressable>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50 pb-24">
      <View className="flex-1">
        <View className="px-4 py-4 flex-row items-center justify-between bg-white border-b border-gray-200">
          <Text className="text-2xl font-bold text-gray-800">My Entries</Text>
          <Pressable
            className="w-10 h-10 rounded-full bg-blue-50 items-center justify-center"
            onPress={() => router.navigate("/new-entry")}
          >
            <Ionicons name="add" size={24} color="#3B82F6" />
          </Pressable>
        </View>

        <ScrollView className="flex-1 px-4 py-4">
          <View className="space-y-8">
            {Object.entries(entriesByCategory.entries).map(
              ([category, entries]) => (
                <View key={category} className="space-y-3">
                  <View className="flex-row items-center">
                    <View className="w-1 h-6 bg-blue-500 rounded-full mr-2" />
                    <Text className="text-lg font-semibold text-gray-700">
                      {category}
                    </Text>
                    <Text className="text-sm text-gray-400 ml-2">
                      ({entries.length})
                    </Text>
                  </View>
                  <View className="space-y-3 gap-2">
                    {entries.map((entry) => (
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
                    ))}
                  </View>
                </View>
              )
            )}
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}
