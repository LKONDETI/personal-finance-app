import { View, Text, ScrollView, TouchableOpacity, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { ArrowLeft, Plus, CreditCard, Building2, Wallet } from "lucide-react-native";
import { useState, useEffect } from "react";

interface BankAccount {
  id: number;
  account_name: string;
  account_number: string;
  balance: number;
  currency: string;
  bank_name: string;
}

export default function BankAccounts() {
  const router = useRouter();
  const [accounts, setAccounts] = useState<BankAccount[]>([]);

  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    try {
      const response = await fetch('http://localhost:8000/accounts');
      const data = await response.json();
      setAccounts(data);
    } catch (error) {
      console.error('Error fetching accounts:', error);
    }
  };

  const getBankIcon = (bankName: string) => {
    switch (bankName.toLowerCase()) {
      case 'chase':
        return <CreditCard size={24} color="#117ACA" />;
      case 'bank of america':
        return <Building2 size={24} color="#012169" />;
      default:
        return <Wallet size={24} color="#666" />;
    }
  };

  return (
    <ScrollView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="flex-row items-center justify-between p-4 bg-white border-b border-gray-200">
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
        {accounts.length === 0 ? (
          <View className="items-center justify-center py-8">
            <Text className="text-gray-500 text-lg mb-2">No bank accounts added yet</Text>
            <Text className="text-gray-400 text-center">
              Add your first bank account to start tracking your finances
            </Text>
          </View>
        ) : (
          accounts.map((account) => (
            <Pressable
              key={account.id}
              className="bg-white p-4 rounded-lg mb-4 shadow-sm"
              onPress={() => router.push({
                pathname: '/(tabs)/(Settings)/accountDetails',
                params: { accountId: account.id }
              })}
            >
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center gap-3">
                  {getBankIcon(account.bank_name)}
                  <View>
                    <Text className="text-lg font-medium">{account.account_name}</Text>
                    <Text className="text-gray-500">****{account.account_number.slice(-4)}</Text>
                  </View>
                </View>
                <View className="items-end">
                  <Text className="text-lg font-medium">
                    {account.currency} {account.balance.toFixed(2)}
                  </Text>
                  <Text className="text-gray-500">{account.bank_name}</Text>
                </View>
              </View>
            </Pressable>
          ))
        )}
      </View>
    </ScrollView>
  );
} 