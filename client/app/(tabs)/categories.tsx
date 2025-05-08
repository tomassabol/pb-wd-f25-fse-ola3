import { Text, View, Pressable, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useGetCategoriesQuery } from "~/service/category/category-api";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

export default function CategoriesScreen() {
  const router = useRouter();
  const { data: categories, isLoading } = useGetCategoriesQuery();

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <View className="flex-1 items-center justify-center">
          <Text className="text-lg text-gray-500">Loading categories...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!categories?.categories || categories.categories.length === 0) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50 pb-24">
        <ScrollView className="flex-1 px-4 py-6">
          <View className="flex items-center justify-center h-64">
            <Ionicons name="folder-outline" size={56} color="#9CA3AF" />
            <Text className="text-xl font-medium text-gray-400 mt-4">
              No categories found
            </Text>
            <Text className="mt-2 text-sm text-gray-400 text-center px-8">
              Create your first category to organize your entries
            </Text>
            <Pressable
              className="mt-6 bg-blue-500 px-6 py-3 rounded-full"
              onPress={() => router.navigate("/new-category")}
            >
              <Text className="text-white font-semibold">Create Category</Text>
            </Pressable>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="flex-1">
        <View className="px-4 py-4 flex-row items-center justify-between bg-white border-b border-gray-200">
          <Text className="text-2xl font-bold text-gray-800">Categories</Text>
          <Pressable
            className="w-10 h-10 rounded-full bg-blue-50 items-center justify-center"
            onPress={() => router.navigate("/new-category")}
          >
            <Ionicons name="add" size={24} color="#3B82F6" />
          </Pressable>
        </View>

        <ScrollView className="flex-1 px-4 py-4">
          <View className="space-y-3 gap-y-2">
            {categories.categories.map((category) => (
              <Pressable
                key={category.id}
                className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 active:bg-gray-50"
                onPress={() => router.navigate(`/category/${category.id}`)}
              >
                <View className="flex-row justify-between items-center">
                  <View className="flex-1">
                    <Text className="text-base font-medium text-gray-800">
                      {category.name}
                    </Text>
                    <View className="flex-row items-center mt-2">
                      <Ionicons name="time-outline" size={14} color="#9CA3AF" />
                      <Text className="text-xs text-gray-400 ml-1">
                        {category.createdAt
                          ? new Date(category.createdAt).toLocaleDateString()
                          : "Recently added"}
                      </Text>
                    </View>
                  </View>
                  <View className="flex-row items-center">
                    <View className="bg-blue-100 px-2 py-1 rounded-md mr-2">
                      <Text className="text-xs text-blue-500 font-medium">
                        {category.entryCount} entries
                      </Text>
                    </View>
                    <Ionicons
                      name="chevron-forward"
                      size={20}
                      color="#D1D5DB"
                    />
                  </View>
                </View>
              </Pressable>
            ))}
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}
