import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, TextInput, Alert } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowDownRight, ArrowLeft, ArrowUpRight, MoreVertical } from "lucide-react-native";
import { accounts, transactions as transactionsApi } from "@/services/api";
import type { Account, Transaction } from "@/services/api";
import { sendLargeTransactionAlert } from '@/services/NotificationService';

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
        // Alert for any large debit transactions (>$200)
        txData
          .filter(tx => tx.transactionType === 'Debit' && tx.amount >= 200)
          .forEach(tx => sendLargeTransactionAlert(
            tx.description ?? 'Unknown',
            tx.amount,
            accData.accountName
          ));
      } catch (error) {
        console.error("Failed to fetch account details or transactions:", error);
        Alert.alert("Error", "Failed to load account details. Make sure the backend is running.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [accountId]);

  const processedTransactions = React.useMemo(() => {
    if (!account || transactions.length === 0) return [];

    // Sort descending by date (newest first)
    const sorted = [...transactions].sort(
      // @ts-ignore
      (a, b) => new Date(b.transactionTime || b.transactionDate || '').getTime() - new Date(a.transactionTime || a.transactionDate || '').getTime()
    );

    let currentBalance = account.balance;
    const withBalance = sorted.map(tx => {
      const balanceAfterTx = currentBalance;
      // Revert this transaction for the previous running balance
      if (tx.transactionType === 'Credit') {
        currentBalance -= tx.amount;
      } else {
        currentBalance += tx.amount;
      }
      return {
        ...tx,
        balanceAfterTx
      };
    });

    return withBalance;
  }, [transactions, account]);

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
        {processedTransactions.length === 0 ? (
          <Text className="text-gray-500 text-center py-6">No transactions found.</Text>
        ) : (
          processedTransactions
            .filter(tx =>
              tx.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
              tx.transactionType?.toLowerCase().includes(searchQuery.toLowerCase()) ||
              tx.description?.toLowerCase().includes(searchQuery.toLowerCase())
            )
            .map((tx, idx, arr) => {
              const isCredit = tx.transactionType === 'Credit';
              // Check for either transactionTime or transactionDate (one will always be passed back, default to empty string for TS)
              const dateString = tx.transactionTime || tx.transactionDate || '';
              const dateObj = new Date(dateString);
              const formattedDate = isNaN(dateObj.getTime())
                ? '—'
                : dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

              return (
                <View
                  key={tx.id}
                  className={`flex-row justify-between items-center px-4 py-4 ${idx < arr.length - 1 ? 'border-b border-gray-100' : ''
                    }`}
                >
                  <View className="flex-row items-center flex-1">
                    {isCredit ? (
                      <View className="bg-green-100 p-2 rounded-full mr-3">
                        <ArrowDownRight size={20} color="#22c55e" />
                      </View>
                    ) : (
                      <View className="bg-red-100 p-2 rounded-full mr-3">
                        <ArrowUpRight size={20} color="#ef4444" />
                      </View>
                    )}
                    <View className="flex-1 pr-2">
                      {/* Show description if available, fallback to category/type */}
                      <Text className="font-medium text-base flex-wrap" numberOfLines={2}>
                        {tx.description || tx.category || tx.transactionType}
                      </Text>
                      <Text className="text-gray-500 text-xs mt-1">{formattedDate}</Text>
                      <Text className="text-gray-500 text-xs mt-0.5">Balance: ${tx.balanceAfterTx.toFixed(2)}</Text>
                    </View>
                  </View>
                  <Text className={`font-semibold text-base whitespace-nowrap ${isCredit ? 'text-green-500' : 'text-red-500'}`}>
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
