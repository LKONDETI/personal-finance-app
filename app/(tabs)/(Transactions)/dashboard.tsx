import React, { useMemo, useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import Icon from 'react-native-vector-icons/Feather';

interface Transaction {
  id: number;
  name: string;
  date: string;
  amount: string;
}

interface TransactionsData {
  transactions: Transaction[];
}

const API_URL = 'http://127.0.0.1:8000/accounts';

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
  const router = useRouter();
  const { party_id } = useLocalSearchParams<{ party_id: string }>();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);

  console.log('Dashboard party_id:', party_id);

  useEffect(() => {
    let isMounted = true;
    if (!party_id) return;
    const fetchAccounts = async () => {
      try {
        const response = await fetch(`http://127.0.0.1:8000/accounts?party_id=${party_id}`);
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
        const response = await fetch(`http://127.0.0.1:8000/transactions?party_id=${party_id}`);
        const data = await response.json();
        console.log('Transactions data:', data);

        // Map backend data to expected structure
        const mapped = data.map((txn: any) => ({
          id: txn.id,
          name: txn.transaction_type || 'Transaction',
          date: txn.transaction_time || '',
          amount: txn.credit_amount != null
            ? txn.credit_amount.toString()
            : txn.debit_amount != null
              ? (-txn.debit_amount).toString()
              : '0'
        }));
      
        if (isMounted) setTransactions(mapped);
      } catch (error) {
        if (isMounted) console.error("Failed to fetch transactions:", error);
      }
    };
    fetchTransactions();
    return () => { isMounted = false; };
  }, [party_id]);
  
  const handleAccountPress = (accountId: number) => {
    router.push({
      pathname: '/(tabs)/(Transactions)/accountDetails',
      params: { accountId, party_id }
    });
  };

  if (!party_id) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50">
        <Text className="text-red-500">No party_id provided. Please log in again.</Text>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="flex-row items-center justify-between mb-6 pt-12 px-6">
        <Text className="text-3xl font-extrabold tracking-tight">Dashboard</Text>
        <TouchableOpacity 
          onPress={() => router.push(`/(tabs)/(Settings)/settings`)}
          className="bg-white rounded-full p-2 shadow-sm border border-gray-200"
        >
          <Icon name="settings" size={24} />
        </TouchableOpacity>
      </View>
      {/* Accounts Section */}
      <Text className="text-xl font-bold mb-3 px-6">Accounts</Text>
      <View className="px-4">
        {loading ? (
          <ActivityIndicator size="large" color="#4B7BF5" />
        ) : accounts.length === 0 ? (
          <Text className="text-gray-500 text-center">No accounts found.</Text>
        ) : (
          accounts.map((account) => (
            <TouchableOpacity
              key={account.id}
              className="mb-4 bg-white rounded-2xl shadow p-5 border border-blue-100 flex-row items-center justify-between"
              onPress={() => handleAccountPress(account.id)}
            >
              <View>
                <Text className="text-lg font-bold mb-1">{account.account_name}</Text>
                <Text className="text-xs text-gray-400">Available balance</Text>
              </View>
              <Text className="text-2xl font-extrabold text-blue-600">
                ${account.balance?.toFixed(2) ?? '0.00'}
              </Text>
            </TouchableOpacity>
          ))
        )}
      </View>
      {/* Recent Transactions */}
      <Text className="text-xl font-bold mb-3 mt-8 px-6">Recent Transactions</Text>
      <View className="bg-white rounded-2xl shadow mx-4 mb-8 border border-gray-100">
        {transactions.length === 0 ? (
          <Text className="text-gray-400 text-center py-6">No transactions found.</Text>
        ) : (
          transactions.slice(-5).map((txn, idx) => (
            <View key={txn.id} className={`flex-row items-center justify-between px-6 py-4 border-b border-gray-100 ${idx === transactions.slice(-5).length - 1 ? 'border-b-0' : ''}`}>
              <View>
                <Text className="font-medium text-base">{txn.name}</Text>
                <Text className="text-gray-400 text-xs mt-1">{txn.date}</Text>
              </View>
              <Text className={`font-semibold text-base ${parseFloat(txn.amount) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                ${Math.abs(parseFloat(txn.amount)).toLocaleString()}
              </Text>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
}