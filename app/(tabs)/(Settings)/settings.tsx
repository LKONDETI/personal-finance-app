import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert, Pressable, Modal } from "react-native";
import { useRouter } from "expo-router";
import { ArrowLeft, ChevronRight, LogOut, CreditCard, Settings as SettingsIcon, MessageCircle, User, Bell, Shield } from "lucide-react-native";

export default function SettingsView() {
  const router = useRouter();
  const [securityModalVisible, setSecurityModalVisible] = useState(false);
  const [notificationsModalVisible, setNotificationsModalVisible] = useState(false);

  const handleLogout = async () => {
    try {
      console.log('Attempting logout...');
      const response = await fetch('http://192.168.1.183:8000/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });
      
      console.log('Logout response status:', response.status);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Logout successful:', data);
      
      router.replace('/');
    } catch (error) {
      console.error('Logout error:', error);
      // Still navigate to login even if logout fails
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
      <View className="bg-gray-100 rounded-full p-1 border border-gray-200">
        <ChevronRight size={20} color="#9CA3AF" />
      </View>
    </TouchableOpacity>
  );

  return (
    <ScrollView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="flex-col pt-11 px-4 bg-white">
        <View className="flex-row items-center justify-between mb-4">
          <View className="flex-row items-center">
            <TouchableOpacity className="bg-gray-100 rounded-full p-2 border border-gray-200" onPress={() => router.push('/dashboard?party_id=1')}>
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
          () => router.push({ pathname: '/(tabs)/(Settings)/profile' }),
          "bg-blue-100",
          "#4B7BF5"
        )}

        {/* Bank Accounts */}
        {renderMenuItem(
          <CreditCard size={20} color="#34D399" />,
          "Bank Accounts",
          "Connect your bank to import transactions",
          () => router.push('/bankAccounts?party_id=1'),
          "bg-green-100",
          "#34D399"
        )}

        {/* Budget Limits */}
        {renderMenuItem(
          <SettingsIcon size={20} color="#F59E0B" />,
          "Budget Limits",
          "Set spending limits for categories",
          () => router.push('/budgetLimits?party_id=1'),
          "bg-yellow-100",
          "#F59E0B"
        )}

        {/* Notifications */}
        {renderMenuItem(
          <Bell size={20} color="#8B5CF6" />,
          "Notifications",
          "Manage your notification preferences",
          () => setNotificationsModalVisible(true),
          "bg-purple-100",
          "#8B5CF6"
        )}

        {/* Security - show modal instead of routing */}
        {renderMenuItem(
          <Shield size={20} color="#EF4444" />,
          "Security",
          "Manage your security settings",
          () => setSecurityModalVisible(true),
          "bg-red-100",
          "#EF4444"
        )}

        {/* Chat with us */}
        {renderMenuItem(
          <MessageCircle size={20} color="#A78BFA" />,
          "Chat with us",
          "Get help from our AI assistant",
          () => router.push('/chatbot?party_id=1'),
          "bg-purple-100",
          "#A78BFA"
        )}
      </View>

      {/* Security Modal */}
      <Modal
        visible={securityModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setSecurityModalVisible(false)}
      >
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'center', alignItems: 'center' }}>
          <View style={{ backgroundColor: 'white', padding: 24, borderRadius: 16, alignItems: 'center', minWidth: 250 }}>
            <Text className="text-lg font-semibold mb-4">Contact the bank</Text>
            <Text className="text-gray-600 mb-6">To manage your security settings, please contact your bank directly.</Text>
            <TouchableOpacity
              onPress={() => setSecurityModalVisible(false)}
              className="bg-blue-500 px-6 py-2 rounded-full"
            >
              <Text className="text-white font-medium">OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Notifications Modal */}
      <Modal
        visible={notificationsModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setNotificationsModalVisible(false)}
      >
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'center', alignItems: 'center' }}>
          <View style={{ backgroundColor: 'white', padding: 24, borderRadius: 16, alignItems: 'center', minWidth: 250 }}>
            <Text className="text-lg font-semibold mb-4">Notifications</Text>
            <Text className="text-gray-600 mb-6">No notifications at this time.</Text>
            <TouchableOpacity
              onPress={() => setNotificationsModalVisible(false)}
              className="bg-blue-500 px-6 py-2 rounded-full"
            >
              <Text className="text-white font-medium">OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}
