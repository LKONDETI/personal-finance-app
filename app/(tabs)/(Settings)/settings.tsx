import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { ArrowLeft, ChevronRight } from "lucide-react-native";
import { Button } from "react-native-paper";

export default function SettingsView() {
  const router = useRouter();

  return (
    <ScrollView className="p-4 space-y-6">
      <View className="flex-row items-center gap-2">
        <TouchableOpacity onPress={() => router.back()} className="p-2">
          <ArrowLeft size={24} color="black" />
        </TouchableOpacity>
        <Text className="text-2xl font-bold">Settings</Text>
      </View>

      <View className="space-y-4">
        {[
          { title: "Bank Accounts", subtitle: "Connect your bank to import transactions" },
          { title: "Manage Categories" },
          { title: "Budget Limits" },
          { title: "Notifications" },
        ].map((item, index) => (
          <TouchableOpacity key={index} className="p-4 bg-gray-100 rounded-lg flex-row justify-between items-center">
            <View>
              <Text className="font-medium text-lg">{item.title}</Text>
              {item.subtitle && <Text className="text-sm text-gray-500">{item.subtitle}</Text>}
            </View>
            <ChevronRight size={24} color="gray" />
          </TouchableOpacity>
        ))}
      </View>

      <View className="border-t border-gray-300 my-4" />

      <View className="space-y-4">
        {[
          { category: "Food", amount: "$500" },
          { category: "Rent", amount: "$1,200" },
          { category: "Entertainment", amount: "$200" },
        ].map((item, index) => (
          <View key={index} className="flex-row justify-between">
            <Text className="font-medium text-lg">{item.category}</Text>
            <Text className="font-medium text-lg">{item.amount}</Text>
          </View>
        ))}
      </View>

      <Button 
        className="bg-blue-500 p-4 rounded-lg mt-6"
        onPress={() => console.log("Settings Saved")}
      >
        SAVE
      </Button>
    </ScrollView>
  );
}
