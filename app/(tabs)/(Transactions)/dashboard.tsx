import React, { useMemo, useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
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

const API_URL = 'http://localhost:8000/accounts';

interface Account {
  id: number;
  account_name: string;
  account_number: number;
  product_id: string;
  currency: string;
  created_at: string;
  balance?: number;
  available_balance?: number;
  // add other fields as needed
}

export default function Dashboard() {
  const navigation = useNavigation();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Use local transactions data directly
    setTransactions((transactionsData as TransactionsData).transactions);
  }, []);

  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const response = await fetch(API_URL);
        const data = await response.json();
        setAccounts(data);
      } catch (error) {
        console.error('Failed to fetch accounts:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchAccounts();
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

  const handleAccountPress = (accountId: number) => {
    (navigation as any).navigate('transaction', { accountId: accountId });
  };

  return (
    <ScrollView className="p-4 bg-white">
      <View className="flex-row items-center justify-between mb-4 pt-9">
        <Text className="text-2xl font-bold">Dashboard</Text>
        <Icon name="file-text" size={24} />
      </View>

      {/* Accounts Section */}
      <Text className="text-lg font-semibold mb-2">Accounts</Text>
      {loading ? (
        <ActivityIndicator size="large" color="#4B7BF5" />
      ) : accounts.length === 0 ? (
        <Text className="text-gray-500">No accounts found.</Text>
      ) : (
        accounts.map((account) => (
          <TouchableOpacity
            key={account.id}
            className="mb-4 bg-white rounded-xl shadow p-4 border border-blue-100"
            onPress={() => handleAccountPress(account.id)}
          >
            
            <View className="flex-row items-center justify-between">
              <Text className="text-xl font-bold">{account.account_name}</Text>
              <Text className="text-2xl font-bold">
                ${account.available_balance?.toFixed(2) ?? account.balance?.toFixed(2) ?? '--'}
              </Text>
            </View>
            <Text className="text-xs text-gray-500 mt-1">Available balance</Text>
          </TouchableOpacity>
        ))
      )}

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