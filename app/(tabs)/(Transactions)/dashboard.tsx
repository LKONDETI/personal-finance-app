import React, { useMemo, useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
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



export default function Dashboard() {
  const route = useRoute();
  const party_id = (route.params as { party_id?: number })?.party_id;

  const navigation = useNavigation();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);

  console.log('Dashboard party_id:', party_id);

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
        {transactions.map((txn, idx) => (
          <View key={txn.id} className="flex-row items-center justify-between px-4 py-3 border-b border-gray-100">
            <View className="flex-row items-center">
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