import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft, ChevronDown, CheckCircle } from 'lucide-react-native';
import { useState, useEffect } from 'react';
import { paymentRequests as prApi, accounts as accountsApi } from '@/services/api';
import type { PaymentRequest, Account } from '@/services/api';

export default function PayNowScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { requestId } = useLocalSearchParams<{ requestId: string }>();

  const [request, setRequest] = useState<PaymentRequest | null>(null);
  const [userAccounts, setUserAccounts] = useState<Account[]>([]);
  const [selectedAccountId, setSelectedAccountId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [paid, setPaid] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const id = Number(requestId);
        if (isNaN(id)) throw new Error('Invalid request ID');

        const [req, accts] = await Promise.all([
          prApi.getById(id),
          accountsApi.getAll(),
        ]);
        setRequest(req);
        setUserAccounts(accts.filter(a => a.status === 'Active' || a.status === '0'));
        // Default to first active account
        if (accts.length > 0) {
          const active = accts.filter(a => a.status === 'Active' || a.status === '0');
          if (active.length > 0) setSelectedAccountId(active[0].id);
        }
      } catch (error) {
        console.error('Error fetching payment request:', error);
        Alert.alert('Error', 'Failed to load payment request.');
        router.back();
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [requestId]);

  const handlePay = async () => {
    if (!request || !selectedAccountId) return;

    const selectedAccount = userAccounts.find(a => a.id === selectedAccountId);
    const remaining = request.amount - request.amountPaid;

    if (selectedAccount && selectedAccount.balance < remaining) {
      Alert.alert("Insufficient Balance", `Your account balance ($${selectedAccount.balance.toFixed(2)}) is less than the payment amount ($${remaining.toFixed(2)}).`);
      return;
    }

    setPaying(true);
    try {
      await prApi.payFull(request.id, selectedAccountId);
      setPaid(true);
      // Show success briefly, then go back
      setTimeout(() => {
        router.back();
      }, 2000);
    } catch (error: any) {
      Alert.alert("Payment Failed", error.response?.data?.message || error.message || "Something went wrong");
    } finally {
      setPaying(false);
    }
  };

  const selectAccount = () => {
    const options = userAccounts.map(a => ({
      text: `${a.accountName} (...${a.accountNumber.slice(-4)}) - $${a.balance.toFixed(2)}`,
      onPress: () => setSelectedAccountId(a.id),
    }));
    options.push({ text: "Cancel", onPress: () => {} });

    Alert.alert("Select Account", "Choose an account to pay from:", options);
  };

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text className="mt-4 text-gray-500">Loading payment details...</Text>
      </View>
    );
  }

  if (!request) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <Text className="text-gray-500">Payment request not found</Text>
      </View>
    );
  }

  if (paid) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <CheckCircle size={64} color="#10B981" />
        <Text className="text-2xl font-bold mt-4 text-green-600">Payment Sent!</Text>
        <Text className="text-gray-500 mt-2">${(request.amount - request.amountPaid).toFixed(2)} to {request.payeeName}</Text>
        <Text className="text-gray-400 mt-1">Redirecting...</Text>
      </View>
    );
  }

  const remaining = request.amount - request.amountPaid;
  const selectedAccount = userAccounts.find(a => a.id === selectedAccountId);
  const sendDate = new Date();
  sendDate.setDate(sendDate.getDate() + 1);

  return (
    <ScrollView className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row items-center px-4" style={{ paddingTop: insets.top + 8 }}>
        <TouchableOpacity className="bg-gray-100 rounded-full p-2 border border-gray-200" onPress={() => router.back()}>
          <ArrowLeft size={24} color="black" />
        </TouchableOpacity>
        <Text className="text-2xl font-bold ml-4">Pay Now</Text>
      </View>

      {/* Payee Info */}
      <View className="p-4">
        <View className="flex-row items-center space-x-3">
          <View className="bg-blue-100 w-16 h-16 rounded-full items-center justify-center">
            <Text className="text-blue-600 text-xl font-bold">{request.payeeName.charAt(0)}</Text>
          </View>
          <View>
            <Text className="text-gray-600">Paying to</Text>
            <Text className="text-lg font-medium">{request.payeeName}</Text>
            <Text className="text-sm text-gray-500">{request.payeeCategory}</Text>
          </View>
        </View>

        {/* Amount */}
        <View className="my-8">
          <Text className="text-center text-gray-600 mb-2">Amount</Text>
          <Text className="text-center text-4xl font-semibold">${remaining.toFixed(2)}</Text>
          {request.amountPaid > 0 && (
            <Text className="text-center text-sm text-gray-400 mt-1">
              (${request.amountPaid.toFixed(2)} already paid of ${request.amount.toFixed(2)} total)
            </Text>
          )}
        </View>

        {/* Payment Details */}
        <View className="space-y-4">
          <View className="flex-row justify-between">
            <Text className="text-gray-600">Pay from</Text>
            <TouchableOpacity onPress={selectAccount} className="flex-row items-center">
              <Text className="font-medium">
                {selectedAccount
                  ? `${selectedAccount.accountName} (...${selectedAccount.accountNumber.slice(-4)})`
                  : 'Select account'}
              </Text>
              <ChevronDown size={16} color="#6B7280" className="ml-1" />
            </TouchableOpacity>
          </View>

          {selectedAccount && (
            <View className="flex-row justify-between">
              <Text className="text-gray-600">Available balance</Text>
              <Text className="font-medium">${selectedAccount.balance.toFixed(2)}</Text>
            </View>
          )}

          <View className="flex-row justify-between">
            <Text className="text-gray-600">Due date</Text>
            <Text className="font-medium">{new Date(request.dueDate).toLocaleDateString('en-US', {
              month: 'short',
              day: '2-digit',
              year: 'numeric'
            })}</Text>
          </View>

          <View className="flex-row justify-between">
            <Text className="text-gray-600">Processing</Text>
            <Text className="font-medium">Instant</Text>
          </View>
        </View>

        {/* Warning Message */}
        <View className="mt-8 mb-4">
          <Text className="text-gray-600 text-sm">
            This payment will be processed immediately. The amount will be debited from your selected account and the request will be marked as paid.
          </Text>
        </View>

        {/* Send Button */}
        <TouchableOpacity
          className={`rounded-lg py-4 mt-4 ${paying || !selectedAccountId ? 'bg-blue-300' : 'bg-blue-600'}`}
          disabled={paying || !selectedAccountId}
          onPress={handlePay}
        >
          {paying ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-white text-center text-lg font-semibold">
              Pay ${remaining.toFixed(2)} Now
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
