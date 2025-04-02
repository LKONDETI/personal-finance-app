import { View, Text, TouchableOpacity, ScrollView, TextInput } from "react-native";
import { useRouter } from "expo-router";
import { ArrowLeft } from "lucide-react-native";
import { useState } from "react";

interface BudgetLimit {
  category: string;
  limit: string;
  spent: string;
  color: string;
}

export default function BudgetLimitsView() {
  const router = useRouter();
  const [budgetLimits, setBudgetLimits] = useState<BudgetLimit[]>([
    { category: "Food", limit: "300", spent: "100", color: "#4285F4" },
    { category: "Rent", limit: "1200", spent: "1200", color: "#8AB4F8" },
    { category: "Entertainment", limit: "300", spent: "250", color: "#F25C54" },
    { category: "Other", limit: "500", spent: "400", color: "#9AA0A6" },
  ]);

  const handleLimitChange = (index: number, value: string) => {
    const newLimits = [...budgetLimits];
    newLimits[index] = { ...newLimits[index], limit: value };
    setBudgetLimits(newLimits);
  };

  const handleSave = () => {
    // Here you would typically save the limits to your storage/backend
    console.log('Saving budget limits:', budgetLimits);
    router.back();
  };

  return (
    <ScrollView className="flex-1 bg-white">
      {/* Header */}
      <View className="p-4 flex-row items-center gap-4 pt-10">
        <TouchableOpacity onPress={() => router.back()}>
          <ArrowLeft size={24} color="black" />
        </TouchableOpacity>
        <Text className="text-2xl font-bold">Budget Limits</Text>
      </View>

      {/* Budget Limits List */}
      <View className="p-4">
        {budgetLimits.map((item, index) => (
          <View 
            key={index} 
            className="mb-6 bg-gray-50 rounded-lg p-4 border border-gray-200"
          >
            <View className="flex-row items-center gap-2 mb-2">
              <View 
                className="h-3 w-3 rounded-full" 
                style={{ backgroundColor: item.color }} 
              />
              <Text className="text-lg font-medium">{item.category}</Text>
            </View>
            
            <View className="mt-2">
              <Text className="text-gray-600 mb-1">Monthly Limit</Text>
              <View className="flex-row items-center bg-white border border-gray-200 rounded-lg p-2">
                <Text className="text-lg mr-1">$</Text>
                <TextInput
                  className="flex-1 text-lg"
                  keyboardType="numeric"
                  value={item.limit}
                  onChangeText={(value) => handleLimitChange(index, value)}
                  placeholder="Enter limit"
                />
              </View>
            </View>

            <View className="mt-4">
              <Text className="text-gray-600">Current Spending</Text>
              <Text className="text-lg mt-1">
                ${item.spent} / ${item.limit}
              </Text>
              <View 
                className="h-2 bg-gray-200 rounded-full mt-2 overflow-hidden"
              >
                <View 
                  className="h-full rounded-full"
                  style={{ 
                    backgroundColor: item.color,
                    width: `${Math.min((parseInt(item.spent) / parseInt(item.limit)) * 100, 100)}%`,
                  }}
                />
              </View>
            </View>
          </View>
        ))}
      </View>

      {/* Save Button */}
      <View className="p-4">
        <TouchableOpacity 
          className="bg-blue-500 py-4 rounded-lg"
          onPress={handleSave}
        >
          <Text className="text-white text-center text-lg font-medium">
            Save Limits
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
