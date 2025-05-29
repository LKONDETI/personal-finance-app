import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert, Pressable } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { ArrowLeft, ChevronRight, LogOut, CreditCard, Settings as SettingsIcon, MessageCircle, User, Bell, Shield } from "lucide-react-native";

export default function SettingsView() {
  const router = useRouter();
  const { party_id } = useLocalSearchParams<{ party_id: string }>();
  const [partyId, setPartyId] = useState<string | null>(party_id || null);

  useEffect(() => {
    const fetchPartyId = async () => {
      try {
        // If we already have party_id from params, use it
        if (party_id) {
          console.log('Using party_id from URL:', party_id);
          setPartyId(party_id);
          return;
        }

        // Otherwise try to get it from the dashboard
        const response = await fetch(`http://localhost:8081/dashboard?party_id=1`);
        if (!response.ok) {
          throw new Error('Failed to fetch dashboard data');
        }
        const data = await response.json();
        console.log('Dashboard data:', data);
        if (data.party_id) {
          setPartyId(data.party_id.toString());
        }
      } catch (error) {
        console.error('Error fetching party_id:', error);
        // Don't show alert if we're already on the settings page
        if (!party_id) {
          Alert.alert('Error', 'Failed to load user data. Please try again.');
        }
      }
    };

    fetchPartyId();
  }, [party_id]);

  const handleLogout = async () => {
    try {
      // First, try to clear any session data
      const response = await fetch('http://localhost:8000/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Include cookies if any
      });

      // Even if the server request fails, we'll still log the user out locally
      console.log('Logging out user...');
      
      // Clear any local storage or state
      // Navigate to login page
      router.replace('/');
      
    } catch (error) {
      console.error('Logout error:', error);
      // Still navigate to login page even if there's an error
      router.replace('/');
    }
  };

  const renderMenuItem = (
    icon: React.ReactNode,
    title: string,
    description: string,
    onPress: () => void,
    iconBgColor: string,
    iconColor: string
  ) => (
    <TouchableOpacity 
      className="bg-white px-4 py-4 border-b border-gray-100 flex-row items-center"
      onPress={onPress}
    >
      <View className={`w-10 h-10 ${iconBgColor} rounded-full items-center justify-center mr-4`}>
        {icon}
      </View>
      <View className="flex-1">
        <Text className="text-lg font-semibold">{title}</Text>
        <Text className="text-gray-500">{description}</Text>
      </View>
      <ChevronRight size={20} color="#9CA3AF" />
    </TouchableOpacity>
  );

  if (!partyId) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50">
        <Text className="text-gray-500">Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="flex-col pt-11 px-4 bg-white">
        <View className="flex-row items-center justify-between mb-4">
          <View className="flex-row items-center">
            <TouchableOpacity onPress={() => {
              console.log('Navigating back to dashboard with party_id:', partyId);
              router.push(`/dashboard?party_id=${partyId}`);
            }}>
              <ArrowLeft size={24} color="black" />
            </TouchableOpacity>
            <Text className="text-2xl font-bold ml-4">Settings</Text>
          </View>
          <Pressable onPress={handleLogout}>
            <Text className="text-sm text-gray-500">Log out</Text>
          </Pressable>
        </View>
      </View>

      {/* Menu Items */}
      <View className="mt-4">
        {/* Personal Information */}
        {renderMenuItem(
          <User size={20} color="#4B7BF5" />,
          "Personal Information",
          "Update your profile and preferences",
          () => router.push(`/bankAccounts?party_id=${partyId}`),
          "bg-blue-100",
          "#4B7BF5"
        )}

        {/* Bank Accounts */}
        {renderMenuItem(
          <CreditCard size={20} color="#34D399" />,
          "Bank Accounts",
          "Connect your bank to import transactions",
          () => {
            console.log('Navigating to bank accounts with party_id:', partyId);
            router.push(`/bankAccounts?party_id=${partyId}`);
          },
          "bg-green-100",
          "#34D399"
        )}

        {/* Budget Limits */}
        {renderMenuItem(
          <SettingsIcon size={20} color="#F59E0B" />,
          "Budget Limits",
          "Set spending limits for categories",
          () => router.push(`/budgetLimits?party_id=${partyId}`),
          "bg-yellow-100",
          "#F59E0B"
        )}

        {/* Notifications */}
        {renderMenuItem(
          <Bell size={20} color="#8B5CF6" />,
          "Notifications",
          "Manage your notification preferences",
          () => router.push(`/bankAccounts?party_id=${partyId}`),
          "bg-purple-100",
          "#8B5CF6"
        )}

        {/* Security */}
        {renderMenuItem(
          <Shield size={20} color="#EF4444" />,
          "Security",
          "Manage your security settings",
          () => router.push(`/bankAccounts?party_id=${partyId}`),
          "bg-red-100",
          "#EF4444"
        )}

        {/* Chat with us */}
        {renderMenuItem(
          <MessageCircle size={20} color="#A78BFA" />,
          "Chat with us",
          "Get help from our AI assistant",
          () => router.push(`/chatbot?party_id=${partyId}`),
          "bg-purple-100",
          "#A78BFA"
        )}
      </View>
    </ScrollView>
  );
}
