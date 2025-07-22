import { View, Text, ScrollView, TouchableOpacity, Pressable, ActivityIndicator, Modal } from "react-native";
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
  party_id?: number;
}

export default function BankAccounts() {
  const router = useRouter();
  const { party_id } = useLocalSearchParams<{ party_id: string }>();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  console.log('BankAccounts party_id:', party_id);

  useEffect(() => {
    let isMounted = true;
    if (!party_id) {
      setError('No party ID found. Please log in again.');
      setLoading(false);
      return;
    }
    fetchAccounts();
    return () => { isMounted = false; };
  }, [party_id]);

  const fetchAccounts = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`http://127.0.0.1:8000/accounts?party_id=${party_id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch accounts');
      }
      const data = await response.json();
      console.log('Accounts data:', data);
      setAccounts(data);
    } catch (error) {
      console.error('Error fetching accounts:', error);
      setError('Failed to load accounts. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!party_id) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <Text className="text-red-500 text-lg">Please log in to view your accounts</Text>
        <TouchableOpacity 
          onPress={() => router.replace('/')}
          className="mt-4 bg-blue-500 px-4 py-2 rounded-full"
        >
          <Text className="text-white font-medium">Go to Login</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-col pt-16 px-4 bg-white">
        <View className="flex-row items-center justify-between mb-4">
          <View className="flex-row items-center">
            <TouchableOpacity className="bg-gray-100 rounded-full p-2 border border-gray-200" onPress={() => router.back()}>
              <ArrowLeft size={24} color="black" />
            </TouchableOpacity>
            <Text className="text-2xl font-bold ml-4">Bank Accounts</Text>
          </View>
          <TouchableOpacity 
          onPress={() => setModalVisible(true)}
          className="bg-blue-500 px-4 py-2 rounded-full flex-row items-center gap-2"
        >
          <Plus size={20} color="white" />
          <Text className="text-white font-medium">Add Account</Text>
        </TouchableOpacity>
        </View>
      </View>

      {/* Modal for Contact the bank */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'center', alignItems: 'center' }}>
          <View style={{ backgroundColor: 'white', padding: 24, borderRadius: 16, alignItems: 'center', minWidth: 250 }}>
            <Text className="text-lg font-semibold mb-4">Contact the bank</Text>
            <Text className="text-gray-600 mb-6">To add a new account, please contact your bank directly.</Text>
            <TouchableOpacity
              onPress={() => setModalVisible(false)}
              className="bg-blue-500 px-6 py-2 rounded-full"
            >
              <Text className="text-white font-medium">OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Account List */}
      <View className="p-4">
        {loading ? (
          <ActivityIndicator size="large" color="#4B7BF5" />
        ) : error ? (
          <View className="items-center justify-center py-8">
            <Text className="text-red-500 text-lg mb-2">{error}</Text>
            <TouchableOpacity 
              onPress={fetchAccounts}
              className="bg-blue-500 px-4 py-2 rounded-full mt-2"
            >
              <Text className="text-white font-medium">Retry</Text>
            </TouchableOpacity>
          </View>
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
              className="bg-white rounded-2xl shadow p-4 mx-4 mb-4 border border-gray-100"
              onPress={() => router.push({
                pathname: '/(tabs)/(Transactions)/dashboard',
                params: { accountId: account.id, party_id }
              })}
            >
              <Text className="text-lg font-semibold mb-1">{account.account_name}</Text>
              <Text className="text-gray-500 text-xs mb-2">Account #{account.account_number} • {account.currency}</Text>
              <Text className="text-gray-500 text-xs mb-2">Created: {account.created_at}</Text>
              <Text className="text-gray-500 mb-1">Available balance</Text>
              <Text className="text-3xl font-bold text-blue-600 mb-1 text-right">
                ${account.available_balance?.toFixed(2) ?? account.balance?.toFixed(2) ?? '0'}
              </Text>
            </TouchableOpacity>
          ))
        )}
      </View>
    </ScrollView>
  );
} 