import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert, Pressable, Modal, Switch } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft, ChevronRight, LogOut, CreditCard, Settings as SettingsIcon, MessageCircle, User, Bell, Shield } from "lucide-react-native";
import { auth } from '@/services/api';
import { areNotificationsEnabled, setNotificationsEnabled, requestNotificationPermissions } from '@/services/NotificationService';

export default function SettingsView() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [securityModalVisible, setSecurityModalVisible] = useState(false);
  const [notificationsModalVisible, setNotificationsModalVisible] = useState(false);
  const [notificationsOn, setNotificationsOn] = useState(true);

  useEffect(() => {
    areNotificationsEnabled().then(setNotificationsOn);
  }, []);

  const handleNotificationToggle = async (value: boolean) => {
    setNotificationsOn(value);
    await setNotificationsEnabled(value);
    if (value) {
      const granted = await requestNotificationPermissions();
      if (!granted) Alert.alert('Permission Required', 'Please enable notifications in your device settings.');
    }
  };

  const handleLogout = async () => {
    try {
      console.log('Attempting logout...');
      await auth.logout();
      console.log('Logout successful');
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
      <View className="flex-col px-4 bg-white" style={{ paddingTop: insets.top + 8 }}>
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

        {/* Security */}
        {renderMenuItem(
          <Shield size={20} color="#EF4444" />,
          "Security",
          "Manage your security settings",
          () => router.push('/securitySettings'),
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

      {/* Notifications Modal */}
      <Modal
        visible={notificationsModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setNotificationsModalVisible(false)}
      >
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'flex-end' }}>
          <View style={{ backgroundColor: 'white', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24 }}>
            <Text className="text-xl font-bold mb-1">Notifications</Text>
            <Text className="text-gray-400 text-sm mb-6">Manage what alerts you receive</Text>

            {/* Master toggle */}
            <View className="flex-row items-center justify-between bg-purple-50 rounded-2xl px-4 py-4 mb-5">
              <View className="flex-row items-center">
                <View className="bg-purple-100 rounded-full p-2 mr-3">
                  <Bell size={18} color="#8B5CF6" />
                </View>
                <View>
                  <Text className="font-semibold text-gray-800">Enable Notifications</Text>
                  <Text className="text-xs text-gray-400">{notificationsOn ? 'Active' : 'Disabled'}</Text>
                </View>
              </View>
              <Switch
                value={notificationsOn}
                onValueChange={handleNotificationToggle}
                trackColor={{ true: '#8B5CF6', false: '#E5E7EB' }}
                thumbColor="white"
              />
            </View>

            {/* Notification types */}
            {[
              { emoji: '🚨', title: 'Over-Budget Alerts', desc: 'When a category reaches 80%+ of its limit' },
              { emoji: '💸', title: 'Large Transactions', desc: 'When a debit over $200 hits your account' },
              { emoji: '📅', title: 'Loan Reminders', desc: 'Payment due in 3 days for active loans' },
            ].map(item => (
              <View key={item.title} className="flex-row items-center py-3 border-b border-gray-100">
                <Text className="text-2xl mr-3">{item.emoji}</Text>
                <View className="flex-1">
                  <Text className="font-medium text-gray-800">{item.title}</Text>
                  <Text className="text-xs text-gray-400">{item.desc}</Text>
                </View>
                <View className={`w-2 h-2 rounded-full ${notificationsOn ? 'bg-green-400' : 'bg-gray-300'}`} />
              </View>
            ))}

            <TouchableOpacity
              onPress={() => setNotificationsModalVisible(false)}
              className="bg-purple-600 mt-6 py-3 rounded-2xl items-center"
            >
              <Text className="text-white font-semibold">Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}
