import { View, Text, ScrollView, TouchableOpacity, Pressable, ActivityIndicator } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { ArrowLeft, Plus } from "lucide-react-native";
import { useState, useEffect } from "react";

interface Account {
  id: number;
  account_name: string;
  account_number: number;
  product_id: string;
  currency: string;
  created_at: string;
  balance?: number;
  available_balance?: number;
  bank_name?: string;
}

export default function BankAccounts() {
  const router = useRouter();
  const { party_id } = useLocalSearchParams();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAccounts();
  }, [party_id]);

  const fetchAccounts = async () => {
    try {
      const response = await fetch(`http://localhost:8000/accounts?party_id=${party_id}`);
      const data = await response.json();
      setAccounts(data);
    } catch (error) {
      console.error('Error fetching accounts:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row items-center justify-between p-4 border-b border-gray-200">
        <View className="flex-row items-center gap-2">
          <TouchableOpacity onPress={() => router.back()} className="p-2">
            <ArrowLeft size={24} color="black" />
          </TouchableOpacity>
          <Text className="text-2xl font-bold">Bank Accounts</Text>
        </View>
        <TouchableOpacity 
          onPress={() => router.push('/(tabs)/(Settings)/addAccount')}
          className="bg-blue-500 px-4 py-2 rounded-full flex-row items-center gap-2"
        >
          <Plus size={20} color="white" />
          <Text className="text-white font-medium">Add Account</Text>
        </TouchableOpacity>
      </View>

      {/* Account List */}
      <View className="p-4">
        {loading ? (
          <ActivityIndicator size="large" color="#4B7BF5" />
        ) : accounts.length === 0 ? (
          <View className="items-center justify-center py-8">
            <Text className="text-gray-500 text-lg mb-2">No bank accounts added yet</Text>
            <Text className="text-gray-400 text-center">
              Add your first bank account to start tracking your finances
            </Text>
          </View>
        ) : (
          accounts.map((account) => (
            <TouchableOpacity
              key={account.id}
              className="mb-4 bg-white rounded-xl shadow p-4 border border-blue-100"
              onPress={() => router.push({
                pathname: '/(tabs)/(Transactions)/dashboard',
                params: { accountId: account.id, party_id }
              })}
            >
              <View className="flex-row items-center justify-between">
                <Text className="text-xl font-bold">{account.account_name}</Text>
                <Text className="text-2xl font-bold">
                  ${account.available_balance?.toFixed(2) ?? account.balance?.toFixed(2) ?? '0'}
                </Text>
              </View>
              <View className="flex-row justify-between mt-1">
                <Text className="text-xs text-gray-500">Available balance</Text>
                <Text className="text-xs text-gray-500">{account.bank_name || 'Bank Account'}</Text>
              </View>
            </TouchableOpacity>
          ))
        )}
      </View>
    </ScrollView>
  );
} 