import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { ArrowLeft, ChevronRight } from "lucide-react-native";
import categoryMappings from '@/data/categoryMappings.json';

interface CategoryAmounts {
  [key: string]: number;
}

interface Transaction {
  id: number;
  name: string;
  date: string;
  amount: string;
}

export default function SettingsView() {
  const router = useRouter();
  const [categoryAmounts, setCategoryAmounts] = useState<CategoryAmounts>({});

  useEffect(() => {
    fetch('http://localhost:3000/transactions')
      .then(response => response.json())
      .then((data: Transaction[]) => {
        const amounts: CategoryAmounts = {};

        data.forEach((transaction: Transaction) => {
          const category = categoryMappings.categories.find(cat =>
            cat.transactions.includes(transaction.name)
          );

          if (category) {
            if (!amounts[category.label]) {
              amounts[category.label] = 0;
            }
            amounts[category.label] += parseFloat(transaction.amount);
          }
        });

        setCategoryAmounts(amounts);
      })
      .catch(error => console.error('Error fetching transactions:', error));
  }, []);

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
        {Object.entries(categoryAmounts).map(([label, amount]) => (
          <View key={label} className="py-3 flex-row justify-between items-center">
            <Text className="text-xl">{label}</Text>
            <Text className="text-xl">${amount.toFixed(2)}</Text>
          </View>
        ))}
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
