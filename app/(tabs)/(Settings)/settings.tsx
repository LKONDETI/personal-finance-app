import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { ArrowLeft, ChevronRight } from "lucide-react-native";

export default function SettingsView() {
  const router = useRouter();

  return (
    <ScrollView className="flex-1 bg-white ">
      {/* Header */}
      <View className="p-4 flex-row items-center justify-row pt-10">
        <View className="flex-row items-center mb-4">
          <TouchableOpacity onPress={() => router.back()}>
            <ArrowLeft size={24} color="black" />
          </TouchableOpacity>
        </View>
        <Text className="text-3xl font-bold mb-4">Settings</Text>
      </View>

      {/* Menu Items */}
      <View>
        {/* Bank Accounts */}
        <TouchableOpacity className="bg-white px-4 py-3 border-b border-gray-100">
          <Text className="text-xl mb-1">Bank Accounts</Text>
          <Text className="text-gray-500">Connect your bank to import transactions</Text>
          <View className="absolute right-4 top-1/2 -translate-y-1/2">
            <ChevronRight size={20} color="#9CA3AF" />
          </View>
        </TouchableOpacity>

        {/* Manage Categories */}
        <TouchableOpacity className="bg-white px-4 py-4 border-b border-gray-100 flex-row justify-between items-center">
          <Text className="text-xl">Manage Categories</Text>
          <ChevronRight size={20} color="#9CA3AF" />
        </TouchableOpacity>

        {/* Budget Limits */}
        <TouchableOpacity 
          className="bg-white px-4 py-4 border-b border-gray-100 flex-row justify-between items-center"
          onPress={() => router.push('/(tabs)/(Settings)/budgetLimits')}
        >
          <Text className="text-xl">Budget Limits</Text>
          <ChevronRight size={20} color="#9CA3AF" />
        </TouchableOpacity>

        {/* Notifications */}
        <TouchableOpacity className="bg-white px-4 py-4 border-b border-gray-100 flex-row justify-between items-center">
          <Text className="text-xl">Notifications</Text>
          <ChevronRight size={20} color="#9CA3AF" />
        </TouchableOpacity>
      </View>

      {/* Divider */}
      <View className="h-4" />

      {/* Budget Items */}
      <View className="px-4">
        <View className="py-3 flex-row justify-between items-center">
          <Text className="text-xl">Food</Text>
          <Text className="text-xl">$500</Text>
        </View>
        <View className="py-3 flex-row justify-between items-center">
          <Text className="text-xl">Rent</Text>
          <Text className="text-xl">$1,200</Text>
        </View>
        <View className="py-3 flex-row justify-between items-center">
          <Text className="text-xl">Entertainment</Text>
          <Text className="text-xl">$200</Text>
        </View>
      </View>

      {/* Save Button */}
      <View className="px-4 py-6">
        <TouchableOpacity 
          className="bg-[#4B7BF5] py-3 rounded-lg"
          onPress={() => console.log("Settings Saved")}
        >
          <Text className="text-white text-center text-lg font-medium">SAVE</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
