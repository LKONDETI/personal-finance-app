import React, { useMemo, useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Feather';
import categoryMappings from '@/data/categoryMappings.json';
import transactionsData from '@/data/transactions.json';

const findCategoryForTransaction = (transactionName: string) => {
  return categoryMappings.categories.find(category => 
    category.transactions.some(t => t.toLowerCase() === transactionName.toLowerCase())
  ) || categoryMappings.categories.find(category => category.label === 'Other');
};

interface Transaction {
  id: number;
  name: string;
  date: string;
  amount: string;
}

interface TransactionsData {
  transactions: Transaction[];
}

export default function Dashboard() {
  const navigation = useNavigation();
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    // Use local transactions data directly
    setTransactions((transactionsData as TransactionsData).transactions);
  }, []);

  // Calculate totals by category and overall
  const { categoryTotals, totalExpenses } = useMemo(() => {
    const totals = new Map();
    let total = 0;

    transactions.forEach(transaction => {
      const amount = parseFloat(transaction.amount);
      const category = findCategoryForTransaction(transaction.name);
      
      if (category) {
        const currentTotal = totals.get(category.id) || 0;
        totals.set(category.id, currentTotal + amount);
      }
      total += amount;
    });

    return {
      categoryTotals: totals,
      totalExpenses: total
    };
  }, [transactions]);

  return (
    <ScrollView className="p-4 bg-white">
      <View className="flex-row items-center justify-between mb-4 pt-9">
        <Text className="text-2xl font-bold">Dashboard</Text>
        <Icon name="file-text" size={24} />
      </View>
      
      <View className="mb-4">
        <Text className="text-sm text-gray-500">Total balance</Text>
        <Text className="text-4xl font-bold">$900</Text>
      </View>
      
      <View className="flex-row justify-between mb-4">
        <View>
          <Text className="text-sm text-gray-500">Income</Text>
          <Text className="text-xl font-bold">$1,800</Text>
        </View>
        <View>
          <Text className="text-sm text-gray-500">Expenses</Text>
          <Text className="text-xl font-bold">${totalExpenses.toFixed(2)}</Text>
        </View>
      </View>


      <Text className="text-lg font-semibold mb-2">Recent Transactions</Text>
      {transactions.map((item) => {
        const category = findCategoryForTransaction(item.name);
        return (
          <View key={item.id} className="p-4 flex-row justify-between items-center border-b border-gray-200">
            <View className="flex-row items-center">
              <View 
                className="h-10 w-10 items-center justify-center rounded-md"
                style={{ backgroundColor: `${category?.color}20` }}
              >
                <Icon 
                  name={category?.icon || 'grid'} 
                  size={20} 
                  color={category?.color} 
                />
              </View>
              <View className="ml-3">
                <Text className="font-medium">{item.name}</Text>
                <Text className="text-sm text-gray-500">{item.date}</Text>
              </View>
            </View>
            <Text className="font-semibold">${parseFloat(item.amount).toFixed(2)}</Text>
          </View>
        );
      })}
    </ScrollView>
  );
}