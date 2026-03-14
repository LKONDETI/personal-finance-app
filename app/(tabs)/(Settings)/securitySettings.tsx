import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput, ActivityIndicator, Alert, Switch, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft, Shield, Eye, EyeOff, Lock } from 'lucide-react-native';
import { users } from '@/services/api';
import { usePrivacyMode } from '@/context/PrivacyContext';

export default function SecuritySettings() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isPrivacyModeEnabled, togglePrivacyMode } = usePrivacyMode();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  
  const [loading, setLoading] = useState(false);

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all password fields');
      return;
    }

    if (newPassword.length < 6) {
      Alert.alert('Error', 'New password must be at least 6 characters long');
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'New passwords do not match');
      return;
    }

    try {
      setLoading(true);
      await users.changePassword(currentPassword, newPassword);
      Alert.alert('Success', 'Your password has been changed securely.');
      
      // Reset form
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to change password. Make sure your current password is correct.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      className="flex-1 bg-gray-50" 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View className="bg-white border-b border-gray-100" style={{ paddingTop: insets.top }}>
        <View className="p-4 flex-row items-center justify-between">
          <View className="flex-row items-center">
            <TouchableOpacity 
              className="bg-gray-100 rounded-full p-2 border border-gray-200"
              onPress={() => router.back()}
            >
              <ArrowLeft size={24} color="black" />
            </TouchableOpacity>
            <Text className="text-2xl font-bold ml-4">Security</Text>
          </View>
        </View>
      </View>

      <ScrollView className="flex-1 p-4" keyboardShouldPersistTaps="handled">
        <Text className="text-sm font-semibold text-gray-500 uppercase mb-2">Display</Text>
        <View className="bg-white rounded-2xl p-4 mb-8 shadow-sm border border-gray-100 flex-row items-center justify-between">
          <View className="flex-1 pr-4">
            <View className="flex-row items-center gap-2 mb-1">
              <EyeOff size={18} color="#4B5563" />
              <Text className="text-lg font-semibold text-gray-800">Privacy Mode</Text>
            </View>
            <Text className="text-sm text-gray-500 leading-snug">
              Hide account balances and sensitive amounts on your home screen and lists.
            </Text>
          </View>
          <Switch
            value={isPrivacyModeEnabled}
            onValueChange={togglePrivacyMode}
            trackColor={{ false: '#E5E7EB', true: '#3B82F6' }}
            thumbColor={'#FFFFFF'}
          />
        </View>

        <Text className="text-sm font-semibold text-gray-500 uppercase mb-2">Change Password</Text>
        <View className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <View className="mb-4">
            <Text className="text-gray-700 font-medium mb-1 ml-1">Current Password</Text>
            <View className="flex-row items-center bg-gray-50 border border-gray-200 rounded-xl px-3 h-12">
              <Lock size={18} color="#9CA3AF" />
              <TextInput
                className="flex-1 ml-2 text-base text-gray-800 h-full"
                secureTextEntry={!showCurrent}
                value={currentPassword}
                onChangeText={setCurrentPassword}
                placeholder="Enter current password"
                placeholderTextColor="#9CA3AF"
                autoCapitalize="none"
              />
              <TouchableOpacity onPress={() => setShowCurrent(!showCurrent)} className="p-2">
                {showCurrent ? <EyeOff size={20} color="#9CA3AF" /> : <Eye size={20} color="#9CA3AF" />}
              </TouchableOpacity>
            </View>
          </View>

          <View className="mb-4">
            <Text className="text-gray-700 font-medium mb-1 ml-1">New Password</Text>
            <View className="flex-row items-center bg-gray-50 border border-gray-200 rounded-xl px-3 h-12">
              <Lock size={18} color="#9CA3AF" />
              <TextInput
                className="flex-1 ml-2 text-base text-gray-800 h-full"
                secureTextEntry={!showNew}
                value={newPassword}
                onChangeText={setNewPassword}
                placeholder="At least 6 characters"
                placeholderTextColor="#9CA3AF"
                autoCapitalize="none"
              />
              <TouchableOpacity onPress={() => setShowNew(!showNew)} className="p-2">
                {showNew ? <EyeOff size={20} color="#9CA3AF" /> : <Eye size={20} color="#9CA3AF" />}
              </TouchableOpacity>
            </View>
          </View>

          <View className="mb-6">
            <Text className="text-gray-700 font-medium mb-1 ml-1">Confirm New Password</Text>
            <View className="flex-row items-center bg-gray-50 border border-gray-200 rounded-xl px-3 h-12">
              <Lock size={18} color="#9CA3AF" />
              <TextInput
                className="flex-1 ml-2 text-base text-gray-800 h-full"
                secureTextEntry={!showNew}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="Must match new password"
                placeholderTextColor="#9CA3AF"
                autoCapitalize="none"
              />
            </View>
          </View>

          <TouchableOpacity
            className={`h-12 rounded-xl items-center justify-center flex-row ${loading ? 'bg-blue-300' : 'bg-blue-600'}`}
            onPress={handleChangePassword}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <>
                <Shield size={18} color="white" className="mr-2" />
                <Text className="text-white font-semibold text-base">Update Password</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        <View className="h-20" />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
