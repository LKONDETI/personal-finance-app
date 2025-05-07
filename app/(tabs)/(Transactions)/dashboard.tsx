import React, { useMemo, useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
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

// Helper to calculate total balance, income, and expenses
const calculateSummary = (transactions: Transaction[]) => {
  let income = 0, expenses = 0;
  transactions.forEach(txn => {
    const amt = parseFloat(txn.amount);
    if (amt > 0) income += amt;
    else expenses += Math.abs(amt);
  });
  return {
    total: income - expenses,
    income,
    expenses
  };
};

// Dummy icon mapping for demo (replace with your own logic/icons)
const getTxnIcon = (name: string) => {
  if (name.toLowerCase().includes('groc')) return <View className="bg-orange-100 rounded-lg p-2 mr-3"><Icon name="shopping-cart" size={20} color="#F59E42" /></View>;
  if (name.toLowerCase().includes('movie')) return <View className="bg-green-100 rounded-lg p-2 mr-3"><Icon name="film" size={20} color="#34D399" /></View>;
  if (name.toLowerCase().includes('electric')) return <View className="bg-yellow-100 rounded-lg p-2 mr-3"><Icon name="zap" size={20} color="#FBBF24" /></View>;
  return <View className="bg-blue-100 rounded-lg p-2 mr-3"><Icon name="grid" size={20} color="#3B82F6" /></View>;
};

export default function Dashboard() {
  const route = useRoute();
  const party_id = (route.params as { party_id?: number })?.party_id;

  const navigation = useNavigation();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    if (!party_id) return;
    const fetchAccounts = async () => {
      try {
        const response = await fetch(`http://localhost:8000/accounts?party_id=${party_id}`);
        const data = await response.json();
        console.log('Accounts data:', data);
        if (isMounted) setAccounts(data);
      } catch (error) {
        if (isMounted) console.error('Failed to fetch accounts:', error);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchAccounts();
    return () => { isMounted = false; };
  }, [party_id]);

  useEffect(() => {
    let isMounted = true;
    if (!party_id) return;
    const fetchTransactions = async () => {
      try {
        const response = await fetch(`http://localhost:8000/transactions?party_id=${party_id}`);
        const data = await response.json();
        console.log('Transactions data:', data);
        if (isMounted) setTransactions(data);
      } catch (error) {
        if (isMounted) console.error("Failed to fetch transactions:", error);
      }
    };
    fetchTransactions();
    return () => { isMounted = false; };
  }, [party_id]);

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

  const summary = calculateSummary(transactions);
  const recentTxns = transactions.slice(0, 4); // Show 4 recent transactions

  const handleAccountPress = (accountId: number) => {
    (navigation as any).navigate('accountDetails', { accountId, party_id });
  };

  if (!party_id) {
    return (
      <View className="flex-1 items-center justify-center">
        <Text className="text-red-500">No party_id provided. Please log in again.</Text>
      </View>
    );
  }

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
                ${account.available_balance?.toFixed(2) ?? account.balance?.toFixed(2) ?? '0'}
              </Text>
            </View>
            <Text className="text-xs text-gray-500 mt-1">Available balance</Text>
          </TouchableOpacity>
        ))
      )}


      {/* Recent Transactions */}
      <Text className="text-lg font-semibold mb-2">Recent transactions</Text>
      <View className="bg-white rounded-2xl shadow mb-6">
        {recentTxns.map((txn, idx) => (
          <View key={txn.id} className="flex-row items-center justify-between px-4 py-3 border-b border-gray-100">
            <View className="flex-row items-center">
              {getTxnIcon(txn.name)}
              <View>
                <Text className="font-medium">{txn.name}</Text>
                <Text className="text-gray-500 text-xs">{txn.date}</Text>
              </View>
            </View>
            <Text className="font-semibold text-base">${parseFloat(txn.amount).toLocaleString()}</Text>
          </View>
        ))}
      </View>



    </ScrollView>
  );
}