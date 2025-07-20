import { View, Text, TouchableOpacity, ScrollView, TextInput } from "react-native";
import { useRouter } from "expo-router";
import { ArrowLeft } from "lucide-react-native";
import { useState, useEffect } from "react";
import categoryMappings from '@/data/categoryMappings.json';

interface BudgetItem {
  categoryId: number;
  value: number;
  amount: string;
  status: string;
  textColor?: string;
  limit: string;
  spent: string;
  label: string;
  color: string;
  icon: string;
}

export default function BudgetLimits() {
  const router = useRouter();
  const [budgetItems, setBudgetItems] = useState<BudgetItem[]>(
    // Initialize with data from categoryMappings.json
    categoryMappings.categories.map(item => ({
      categoryId: item.id,
      label: item.label,
      icon: item.icon,
      limit: item.limit,
      color: item.color,
      value: 0,
      amount: `$0 / $${item.limit}`,
      status: 'Under',
      spent: '0',
      textColor: undefined,
    }))
  );

  const handleLimitChange = (index: number, value: string) => {
    const newItems = [...budgetItems];
    const spent = parseInt(newItems[index].spent);
    const newLimit = parseInt(value) || 0;
    
    newItems[index] = {
      ...newItems[index],
      limit: value,
      amount: `$${spent} / $${value}`,
      value: spent / newLimit,
      textColor: spent >= newLimit ? "text-red-500" : undefined
    };
    
    setBudgetItems(newItems);
  };

  return (
    <ScrollView className="flex-1 bg-white">
      {/* Header */}
      <View className="p-4 flex-row items-center gap-4 pt-20">
        <View className="flex-row items-center">
          <TouchableOpacity className="bg-gray-100 rounded-full p-2 border border-gray-200" onPress={() => router.back()}>
            <ArrowLeft size={24} color="black" />
          </TouchableOpacity>
          <Text className="text-2xl font-bold ml-4">Budget Limits</Text>
        </View>
      </View>

      {/* Budget Limits List */}
      <View className="p-4">
        {budgetItems.map((item, index) => (
          <View 
            key={index} 
            className="mb-6 bg-gray-50 rounded-lg p-4 border border-gray-200"
          >
            <View className="flex-row items-center justify-between mb-2">
              <View className="flex-row items-center gap-2">
                <View 
                  className="h-3 w-3 rounded-full" 
                  style={{ backgroundColor: item.color }} 
                />
                <Text className="text-lg font-medium">{item.label}</Text>
              </View>
              <Text className="text-sm text-gray-500">Current: ${item.limit}</Text>
            </View>
            
            <View className="mt-2">
              <Text className="text-gray-600 mb-1">Monthly Limit</Text>
              <View className="flex-row items-center bg-white border border-gray-200 rounded-lg p-2">
                <Text className="text-lg mr-1">$</Text>
                <TextInput
                  className="text-lg flex-1"
                  keyboardType="numeric"
                  value={item.limit}
                  onChangeText={(value) => handleLimitChange(index, value)}
                  placeholder="Enter limit"
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
          onPress={() => router.back()}
        >
          <Text className="text-white text-center text-lg font-medium">
            Save Limits
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
