import { View, Text, TouchableOpacity, ScrollView, TextInput } from "react-native";
import { useRouter } from "expo-router";
import { ArrowLeft } from "lucide-react-native";
import { useState } from "react";
import * as FileSystem from 'expo-file-system';
import { Platform } from 'react-native';
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

export default function BudgetLimitsView() {
  const router = useRouter();
  const [budgetItems, setBudgetItems] = useState<BudgetItem[]>(
    categoryMappings.categories.map(item => ({
      categoryId: item.id,
      label: item.label,
      icon: item.icon,
      limit: item.limit,
      color: item.color,
      value: 0,
      amount: '',
      status: '',
      spent: '0',
      textColor: undefined,
    }))
  );

  const handleLimitChange = async (index: number, value: string) => {
    const newItems = [...budgetItems];
    const spent = parseInt(newItems[index].spent);
    const newLimit = parseInt(value) || 0;
    
    newItems[index] = {
      ...newItems[index],
      limit: value,
      amount: `$${spent} / $${value}`,
      status: getStatus(spent, newLimit),
      value: spent / newLimit,
      textColor: spent >= newLimit ? "text-red-500" : undefined
    };
    
    setBudgetItems(newItems);
  };

  const getStatus = (spent: number, limit: number): string => {
    if (spent >= limit) return "Over";
    if (spent === limit) return "On track";
    return "Under";
  };

  const handleSave = async () => {
    try {
      if (Platform.OS === 'web') {
        localStorage.setItem('budgetData', JSON.stringify({ categories: budgetItems }));
      } else {
        const jsonPath = FileSystem.documentDirectory + 'budgetData.json';
        await FileSystem.writeAsStringAsync(
          jsonPath,
          JSON.stringify({ categories: budgetItems }, null, 2)
        );
      }
      router.back();
    } catch (error) {
      console.error('Error saving budget data:', error);
    }
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
        {budgetItems.map((item, index) => (
          <View 
            key={index} 
            className="mb-6 bg-gray-50 rounded-lg p-4 border border-gray-200"
          >
            <View className="flex-row items-center gap-2 mb-2">
              <View 
                className="h-3 w-3 rounded-full" 
                style={{ backgroundColor: item.color }} 
              />
              <Text className="text-lg font-medium">{item.label}</Text>
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
