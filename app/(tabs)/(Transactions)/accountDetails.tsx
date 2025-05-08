import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, TextInput } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { ArrowDownRight, ArrowLeft, ArrowUpRight, MoreVertical } from "lucide-react-native";

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
  const { accountId, party_id } = route.params as { accountId: number, party_id: number };
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const balance = calculateBalance(transactions);
  const [searchQuery, setSearchQuery] = useState("");
  
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

        // Fetch all transactions for this account
        const txRes = await fetch(`http://localhost:8000/transactions?account_id=${accountId}&party_id=${party_id}`);
        const txData = await txRes.json();
        setTransactions(txData);
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
    <ScrollView className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row justify-between items-center px-4 pt-8 pb-4 bg-white">
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <ArrowLeft size={24} />
        </TouchableOpacity>
        
        <TouchableOpacity>
          <MoreVertical size={24} />
        </TouchableOpacity>
      </View>

      {/* Account Card */}
      <View className="bg-white rounded-2xl shadow p-4 mx-4 mb-4 mt-2 border border-gray-100">
        <Text className="text-lg font-semibold mb-1">{account.account_name}</Text>
        <Text className="text-gray-500 text-xs mb-2">Account #{account.account_number} • {account.currency}</Text>
        <Text className="text-gray-500 text-xs mb-2">Created: {account.created_at}</Text>
        <Text className="text-gray-500 mb-1">Available balance</Text>
        <Text className="text-3xl font-bold text-blue-600 mb-1">
          {transactions.length === 0 ? '$--' : `$${balance.toFixed(2)}`}
        </Text>
      </View>

      {/* Search Bar */}
      <View className="px-4 mb-2">
        <TextInput
          placeholder="Search transactions"
          className="border rounded-full px-4 py-2 bg-gray-100"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Transactions List */}
      <Text className="text-lg font-semibold px-4 mb-2 mt-2">All Transactions</Text>
      <View className="bg-white rounded-2xl shadow mx-4 mb-8 border border-gray-100">
        {transactions.length === 0 ? (
          <Text className="text-gray-500 p-4">No transactions found.</Text>
        ) : (
          [...transactions]
            .filter(tx =>
              tx.transaction_type?.toLowerCase().includes(searchQuery.toLowerCase()) ||
              tx.transaction_time?.toLowerCase().includes(searchQuery.toLowerCase())
            )
            .reverse()
            .map((tx) => {
              const { amount, isPositive, currency } = getTransactionAmount(tx);
              return (
                <View key={tx.id} className="flex-row justify-between items-center border-b border-gray-100 px-4 py-3">
                  <View className="flex-row items-center">
                    {isPositive ? (
                      <ArrowDownRight size={20} color="#22c55e" style={{ marginRight: 8 }} />
                    ) : (
                      <ArrowUpRight size={20} color="#ef4444" style={{ marginRight: 8 }} />
                    )}
                    <View>
                      <Text className="font-medium">{tx.transaction_type}</Text>
                      <Text className="text-gray-500 text-xs">{tx.transaction_time}</Text>
                    </View>
                  </View>
                  <Text className={`font-semibold ${isPositive ? 'text-green-500' : 'text-red-500'}`}>${amount}</Text>
                </View>
              );
            })
        )}
      </View>
    </ScrollView>
  );
}
