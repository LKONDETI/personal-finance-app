import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";

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

interface Transaction {
  id: number;
  transaction_type: string;
  transaction_time: string;
  debit_amount: number | null;
  credit_amount: number | null;
  debit_currency: string | null;
  // add other fields as needed
}

const getTransactionAmount = (transaction: Transaction) => {
  if (transaction.credit_amount !== null) {
    return {
      amount: transaction.credit_amount.toFixed(2),
      isPositive: true,
      currency: transaction.debit_currency || '$'
    };
  }
  if (transaction.debit_amount !== null) {
    return {
      amount: transaction.debit_amount.toFixed(2),
      isPositive: false,
      currency: transaction.debit_currency || '$'
    };
  }
  return {
    amount: "0.00",
    isPositive: true,
    currency: '$'
  };
};

const calculateBalance = (transactions: Transaction[]) => {
  let balance = 0;
  transactions.forEach((txn) => {
    balance += txn.credit_amount || 0;
    balance -= txn.debit_amount || 0;
  });
  return balance;
};

export default function AccountDetails() {
  const navigation = useNavigation();
  const route = useRoute();
  const { accountId } = (route.params || {}) as { accountId?: number };
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const balance = calculateBalance(transactions);
  
  const [account, setAccount] = useState<Account | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!accountId) return;
    const fetchData = async () => {
      try {
        // Fetch account details
        const accRes = await fetch(`http://localhost:8000/accounts`);
        const accData = await accRes.json();
        const found = accData.find((a: Account) => a.id === accountId);
        setAccount(found);

        // Fetch recent transactions (limit 3 for preview)
        const txRes = await fetch(`http://localhost:8000/transactions?account_id=${accountId}`);
        const txData = await txRes.json();
        setTransactions(txData.slice(0, 3));
      } catch (error) {
        console.error("Failed to fetch account details or transactions:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [accountId]);

  if (loading) {
    return <ActivityIndicator size="large" color="#4B7BF5" style={{ marginTop: 40 }} />;
  }

  if (!account) {
    return <Text className="p-4">Account not found.</Text>;
  }

  return (
    <ScrollView className="p-4 bg-white">
      {/* Account Details */}
      <Text className="text-2xl font-bold mb-2">{account.account_name}</Text>
      <Text className="text-gray-500 mb-1">Available balance</Text>
      <Text className="text-3xl font-bold mb-2">
        {transactions.length === 0 ? '$--' : `$${balance.toFixed(2)}`}
      </Text>
      <View className="mb-4">
        <Text className="text-gray-500">Account number: {account.account_number}</Text>
        <Text className="text-gray-500">Currency: {account.currency}</Text>
        <Text className="text-gray-500">Created: {account.created_at}</Text>
      </View>

      {/* Recent Transactions Preview */}
      <Text className="text-lg font-semibold mb-2">Recent Transactions</Text>
      {transactions.length === 0 ? (
        <Text className="text-gray-500">No transactions found.</Text>
      ) : (
        transactions.map((tx) => {
          const { amount, isPositive, currency } = getTransactionAmount(tx);
          return (
            <View key={tx.id} className="flex-row justify-between items-center border-b py-2">
              <View>
                <Text className="font-medium">{tx.transaction_type}</Text>
                <Text className="text-gray-500 text-xs">{tx.transaction_time}</Text>
              </View>
              <Text className={`font-semibold ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
                {isPositive ? '+' : '-'}{currency}{amount}
              </Text>
            </View>
          );
        })
      )}

      {/* See all transactions button */}
      <TouchableOpacity
        className="mt-4 bg-blue-500 py-3 rounded-lg"
        onPress={() => (navigation as any).navigate('transaction', { accountId })}
      >
        <Text className="text-white text-center text-lg font-medium">See all transactions</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
