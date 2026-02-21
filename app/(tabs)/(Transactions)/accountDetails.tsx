import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, TextInput, Alert } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowDownRight, ArrowLeft, ArrowUpRight, MoreVertical } from "lucide-react-native";
import { accounts, transactions as transactionsApi } from "@/services/api";
import type { Account, Transaction } from "@/services/api";

export default function AccountDetails() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { accountId, party_id } = useLocalSearchParams<{ accountId: string, party_id: string }>();
  const accountIdNum = Number(accountId);

  const [account, setAccount] = useState<Account | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (!accountId) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch account details
        const accData = await accounts.getById(accountIdNum);
        setAccount(accData);

        // Fetch all transactions for this account
        const txData = await transactionsApi.getAll(accountIdNum);
        setTransactions(txData);
      } catch (error) {
        console.error("Failed to fetch account details or transactions:", error);
        Alert.alert("Error", "Failed to load account details. Make sure the backend is running.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [accountId]);

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#4B7BF5" />
      </View>
    );
  }

  if (!account) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <Text className="text-gray-500">Account not found.</Text>
        <TouchableOpacity className="mt-4 bg-blue-500 px-4 py-2 rounded-lg" onPress={() => router.back()}>
          <Text className="text-white font-medium">Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row justify-between items-center px-4 pb-4 bg-white" style={{ paddingTop: insets.top + 8 }}>
        <TouchableOpacity className="bg-gray-100 rounded-full p-2 border border-gray-200" onPress={() => router.back()}>
          <ArrowLeft size={24} color="black" />
        </TouchableOpacity>

        <TouchableOpacity className="bg-gray-100 rounded-full p-2 border border-gray-200">
          <MoreVertical size={24} color="black" />
        </TouchableOpacity>
      </View>

      {/* Account Card */}
      <View className="bg-white rounded-2xl shadow p-4 mx-4 mb-4 mt-2 border border-gray-100">
        <Text className="text-lg font-semibold mb-1">{account.accountName}</Text>
        <Text className="text-gray-500 text-xs mb-2">Account #{account.accountNumber} • {account.currency}</Text>
        <Text className="text-gray-500 text-xs mb-2">Created: {new Date(account.createdAt).toLocaleDateString()}</Text>
        <Text className="text-gray-500 mb-1">Available balance</Text>
        <Text className="text-3xl font-bold text-blue-600 mb-1">
          ${account.balance.toFixed(2)}
        </Text>
      </View>

      {/* Search Bar */}
      <View className="px-4 mb-4">
        <TextInput
          placeholder="Search transactions"
          className="border border-gray-200 rounded-full px-4 py-2 bg-gray-50"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Transactions List */}
      <Text className="text-lg font-bold px-4 mb-3 mt-2">All Transactions</Text>
      <View className="bg-white rounded-2xl shadow mx-4 mb-8 border border-gray-100">
        {transactions.length === 0 ? (
          <Text className="text-gray-500 text-center py-6">No transactions found.</Text>
        ) : (
          [...transactions]
            .filter(tx =>
              tx.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
              tx.transactionType?.toLowerCase().includes(searchQuery.toLowerCase())
            )
            .sort((a, b) => new Date(b.transactionDate).getTime() - new Date(a.transactionDate).getTime())
            .map((tx, idx) => {
              const isCredit = tx.transactionType === 'Credit';
              const dateObj = new Date(tx.transactionDate);
              const formattedDate = isNaN(dateObj.getTime())
                ? '—'
                : dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

              return (
                <View
                  key={tx.id}
                  className={`flex-row justify-between items-center px-4 py-4 ${idx < transactions.length - 1 ? 'border-b border-gray-100' : ''
                    }`}
                >
                  <View className="flex-row items-center">
                    {isCredit ? (
                      <View className="bg-green-100 p-2 rounded-full mr-3">
                        <ArrowDownRight size={20} color="#22c55e" />
                      </View>
                    ) : (
                      <View className="bg-red-100 p-2 rounded-full mr-3">
                        <ArrowUpRight size={20} color="#ef4444" />
                      </View>
                    )}
                    <View>
                      <Text className="font-medium text-base">{tx.category || tx.transactionType}</Text>
                      <Text className="text-gray-500 text-xs mt-1">{formattedDate}</Text>
                    </View>
                  </View>
                  <Text className={`font-semibold text-base ${isCredit ? 'text-green-500' : 'text-red-500'}`}>
                    {isCredit ? '+' : '-'}${tx.amount.toFixed(2)}
                  </Text>
                </View>
              );
            })
        )}
      </View>
    </ScrollView>
  );
}
