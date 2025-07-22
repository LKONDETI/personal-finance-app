import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import { ArrowLeft } from 'lucide-react-native';
import { useRouter } from 'expo-router';

interface Customer {
  id: number;
  customer_name: string;
  customer_mnemonic: string;
  gender: string;
  date_of_birth: string;
  nationality_id: number;
  nationality_name: string;
  residence_id: number;
  residence_name: string;
  language_name: string;
  customer_status: string;
  status_name: string;
  industry_id: number;
  industry_name: string;
  sector_id: number;
  sector_name: string;
  account_officer_id: number;
  account_officer_name: string;
  target: string;
  target_name: string;
  email: string;
  phone_number: string;
  profile_type: string;
  profile_type_name: string;
  profile_name: string;
  profile: string;
  version_number: number;
  company_id: number;
}

export default function Profile() {
  const router = useRouter();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCustomer = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch('http://127.0.0.1:8000/customers/1');
        if (!response.ok) throw new Error('Failed to fetch customer');
        const data = await response.json();
        setCustomer(data);
      } catch (err) {
        setError('Failed to load customer details.');
      } finally {
        setLoading(false);
      }
    };
    fetchCustomer();
  }, []);

  if (loading) {
    return <ActivityIndicator size="large" color="#4B7BF5" style={{ marginTop: 40 }} />;
  }

  if (error) {
    return <View className="flex-1 items-center justify-center"><Text className="text-red-500">{error}</Text></View>;
  }

  if (!customer) {
    return <View className="flex-1 items-center justify-center"><Text>No customer found.</Text></View>;
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
            <Text className="text-2xl font-bold ml-4">Personal Information</Text>
          </View>
        </View>
      </View>
     
      <View className="p-4">
        <View className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
          <Text className="text-xl font-bold mb-2">{customer.customer_name}</Text>
          <Text className="mb-1"><Text className="font-semibold">Mnemonic:</Text> {customer.customer_mnemonic}</Text>
          <Text className="mb-1"><Text className="font-semibold">Gender:</Text> {customer.gender}</Text>
          <Text className="mb-1"><Text className="font-semibold">Date of Birth:</Text> {customer.date_of_birth}</Text>
          <Text className="mb-1"><Text className="font-semibold">Nationality:</Text> {customer.nationality_name} (ID: {customer.nationality_id})</Text>
          <Text className="mb-1"><Text className="font-semibold">Residence:</Text> {customer.residence_name} (ID: {customer.residence_id})</Text>
          <Text className="mb-1"><Text className="font-semibold">Language:</Text> {customer.language_name}</Text>
          <Text className="mb-1"><Text className="font-semibold">Status:</Text> {customer.customer_status} ({customer.status_name})</Text>
          <Text className="mb-1"><Text className="font-semibold">Industry:</Text> {customer.industry_name} (ID: {customer.industry_id})</Text>
          <Text className="mb-1"><Text className="font-semibold">Sector:</Text> {customer.sector_name} (ID: {customer.sector_id})</Text>
          <Text className="mb-1"><Text className="font-semibold">Account Officer:</Text> {customer.account_officer_name} (ID: {customer.account_officer_id})</Text>
          <Text className="mb-1"><Text className="font-semibold">Target:</Text> {customer.target_name} ({customer.target})</Text>
          <Text className="mb-1"><Text className="font-semibold">Email:</Text> {customer.email}</Text>
          <Text className="mb-1"><Text className="font-semibold">Phone Number:</Text> {customer.phone_number}</Text>
          <Text className="mb-1"><Text className="font-semibold">Profile Type:</Text> {customer.profile_type_name} ({customer.profile_type})</Text>
          <Text className="mb-1"><Text className="font-semibold">Profile Name:</Text> {customer.profile_name}</Text>
          <Text className="mb-1"><Text className="font-semibold">Profile:</Text> {customer.profile}</Text>
          <Text className="mb-1"><Text className="font-semibold">Version Number:</Text> {customer.version_number}</Text>
          <Text className="mb-1"><Text className="font-semibold">Company ID:</Text> {customer.company_id}</Text>
        </View>
      </View>
    </ScrollView>
  );
} 