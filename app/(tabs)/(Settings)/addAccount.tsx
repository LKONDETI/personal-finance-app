import { View, Text, ScrollView, TouchableOpacity, TextInput } from "react-native";
import { useRouter } from "expo-router";
import { ArrowLeft } from "lucide-react-native";
import { useState } from "react";

export default function AddAccount() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    account_name: '',
    account_number: '',
    bank_name: '',
    currency: 'USD',
  });

  const handleSubmit = async () => {
    try {
      const response = await fetch('http://localhost:8000/accounts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          balance: 0, // Initial balance
        }),
      });

      if (response.ok) {
        router.back();
      } else {
        console.error('Failed to add account');
      }
    } catch (error) {
      console.error('Error adding account:', error);
    }
  };

  return (
    <ScrollView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="flex-row items-center p-4 bg-white border-b border-gray-200">
        <TouchableOpacity onPress={() => router.back()} className="p-2">
          <ArrowLeft size={24} color="black" />
        </TouchableOpacity>
        <Text className="text-2xl font-bold ml-2">Add Bank Account</Text>
      </View>

      {/* Form */}
      <View className="p-4">
        <View className="bg-white rounded-lg p-4 shadow-sm">
          <View className="mb-4">
            <Text className="text-gray-700 mb-2">Account Name</Text>
            <TextInput
              className="border border-gray-300 rounded-lg p-3"
              placeholder="e.g., Checking Account"
              value={formData.account_name}
              onChangeText={(text) => setFormData({ ...formData, account_name: text })}
            />
          </View>

          <View className="mb-4">
            <Text className="text-gray-700 mb-2">Account Number</Text>
            <TextInput
              className="border border-gray-300 rounded-lg p-3"
              placeholder="Enter account number"
              value={formData.account_number}
              onChangeText={(text) => setFormData({ ...formData, account_number: text })}
              keyboardType="numeric"
            />
          </View>

          <View className="mb-4">
            <Text className="text-gray-700 mb-2">Bank Name</Text>
            <TextInput
              className="border border-gray-300 rounded-lg p-3"
              placeholder="e.g., Chase, Bank of America"
              value={formData.bank_name}
              onChangeText={(text) => setFormData({ ...formData, bank_name: text })}
            />
          </View>

          <View className="mb-4">
            <Text className="text-gray-700 mb-2">Currency</Text>
            <TextInput
              className="border border-gray-300 rounded-lg p-3"
              placeholder="e.g., USD"
              value={formData.currency}
              onChangeText={(text) => setFormData({ ...formData, currency: text })}
            />
          </View>

          <TouchableOpacity
            onPress={handleSubmit}
            className="bg-blue-500 py-3 rounded-lg mt-4"
          >
            <Text className="text-white text-center font-medium text-lg">
              Add Account
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
} 