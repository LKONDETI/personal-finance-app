import { View, Text, TextInput, FlatList, TouchableOpacity, ActivityIndicator } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { ArrowLeft, MoreVertical, Home, ShoppingBag, Coffee, ArrowUpRight, ArrowDownRight } from "lucide-react-native";
import React, { useEffect, useState } from "react";

interface Transaction {
  id: number;
  transaction_type: string;
  transaction_time: string;
  debit_amount: number | null;
  credit_amount: number | null;
  debit_currency: string | null;
  description?: string;
}

const getTransactionIcon = (type: string) => {
  switch (type.toLowerCase()) {
    case 'groceries':
      return <Home size={24} className="text-gray-600" />;
    case 'shopping':
      return <ShoppingBag size={24} className="text-blue-600" />;
    case 'coffee':
      return <Coffee size={24} className="text-orange-600" />;
    default:
      return <Home size={24} className="text-gray-600" />;
  }
};

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

export default function TransactionsView() {
  const navigation = useNavigation();
  const route = useRoute();
  const { accountId } = (route.params || {}) as { accountId?: number };

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const month = date.toLocaleString('default', { month: 'short' });
    return `${month} ${date.getDate()}`;
  };

  return (
    <View className="flex-1 bg-white">
      <View className="p-4 space-y-6">
        {/* Header */}
        <View className="flex-row justify-between items-center">
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <ArrowLeft size={24} />
          </TouchableOpacity>
          <Text className="text-2xl font-bold">Transactions</Text>
          <TouchableOpacity>
            <MoreVertical size={24} />
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <TextInput
          placeholder="Search transactions"
          className="border rounded-full px-4 py-2 bg-gray-100"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />

        {/* Transactions List */}
        {loading ? (
          <ActivityIndicator size="large" color="#4B7BF5" />
        ) : (
          <FlatList
            data={transactions}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => {
              const { amount, isPositive, currency } = getTransactionAmount(item);
              return (
                <TouchableOpacity className="flex-row items-center py-4 border-b border-gray-100">
                  <View className="w-12 h-12 rounded-full bg-gray-100 items-center justify-center mr-4">
                    {isPositive ? 
                      <ArrowDownRight size={24} className="text-green-600" /> :
                      <ArrowUpRight size={24} className="text-red-600" />
                    }
                  </View>
                  <View className="flex-1">
                    <Text className="font-medium text-base">{item.transaction_type}</Text>
                    <Text className="text-gray-500 text-sm">{formatDate(item.transaction_time)}</Text>
                  </View>
                  <Text className={`font-semibold text-lg ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                    {isPositive ? '+' : '-'}{currency}{amount}
                  </Text>
                </TouchableOpacity>
              );
            }}
          />
        )}
      </View>
    </View>
  );
}
