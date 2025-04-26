import { View, Text, TextInput, FlatList, TouchableOpacity, ActivityIndicator } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { ArrowLeft, MoreVertical } from "lucide-react-native";
import React, { useEffect, useState } from "react";

interface Transaction {
  id: number;
  debit_account_number: number;
  debit_currency: string;
  debit_account: string;
  transaction_type: string;
  transaction_time: string;
  credit_account_number: number;
}

export default function TransactionsView() {
  const navigation = useNavigation();
  const route = useRoute();
  const { accountId } = (route.params || {}) as { accountId?: number };

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!accountId) return;
    const fetchTransactions = async () => {
      try {
        const response = await fetch(`http://localhost:8000/transactions?account_id=${accountId}`);
        const data = await response.json();
        setTransactions(data);
      } catch (error) {
        console.error("Failed to fetch transactions:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchTransactions();
  }, [accountId]);

  return (
    <View className="p-4 space-y-6">
      <View className="flex-row justify-between items-center">
        <TouchableOpacity onPress={() => navigation.navigate('dashboard')}>
          <ArrowLeft size={24} />
        </TouchableOpacity>
        <Text className="text-2xl font-bold">Transactions</Text>
        <MoreVertical size={24} />
      </View>

      <TextInput
        placeholder="Search transactions"
        className="border rounded-full px-4 py-2 bg-gray-100"
      />

      {loading ? (
        <ActivityIndicator size="large" color="#4B7BF5" />
      ) : (
        <FlatList
          data={transactions}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity className="flex-row justify-between items-center p-4 border-b">
              <View>
                <Text className="font-medium">{item.transaction_type}</Text>
                <Text className="text-gray-500 text-sm">{item.transaction_time}</Text>
                <Text className="text-gray-500 text-xs">Debit: {item.debit_account_number} | Credit: {item.credit_account_number}</Text>
              </View>
              <Text className="font-semibold">{item.debit_amount}</Text>
              <Text className="font-semibold">{item.debit_currency}</Text>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}
