import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput, ActivityIndicator, Alert } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft, User, Phone, Mail } from "lucide-react-native";
import { users as usersApi, User as UserType } from '@/services/api';

export default function ProfileView() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      const profile = await usersApi.getCurrentProfile();

      setName(profile.name || '');
      setPhone(profile.phone || '');
      setEmail(profile.email || '');

    } catch (err) {
      console.error('Failed to load profile:', err);
      setError('Failed to load your profile information. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Validation Error', 'Name cannot be empty.');
      return;
    }

    try {
      setSaving(true);
      await usersApi.updateProfile({ name, phone });
      Alert.alert('Success', 'Your profile has been updated successfully.');
      router.back();
    } catch (err) {
      console.error('Failed to update profile:', err);
      Alert.alert('Error', 'Failed to save changes. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View className="flex-1 bg-white items-center justify-center">
        <ActivityIndicator size="large" color="#4B7BF5" />
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row items-center px-4 mb-6 border-b border-gray-100 pb-4" style={{ paddingTop: insets.top + 8 }}>
        <TouchableOpacity
          className="bg-gray-100 rounded-full p-2 border border-gray-200"
          onPress={() => router.back()}
        >
          <ArrowLeft size={24} color="black" />
        </TouchableOpacity>
        <Text className="text-2xl font-bold ml-4">Personal Information</Text>
      </View>

      {error ? (
        <View className="px-6 py-10 items-center justify-center">
          <Text className="text-red-500 text-center mb-4 text-base">{error}</Text>
          <TouchableOpacity
            className="bg-blue-500 px-6 py-2 rounded-full"
            onPress={loadProfile}
          >
            <Text className="text-white font-medium">Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View className="px-6">
          <View className="items-center mb-8">
            <View className="w-24 h-24 bg-blue-100 rounded-full items-center justify-center mb-4">
              <User size={40} color="#4B7BF5" />
            </View>
            <Text className="text-xl font-semibold">{name || 'User Profile'}</Text>
            <Text className="text-gray-500">{email}</Text>
          </View>

          {/* Form Fields */}
          <View className="space-y-6">
            <View>
              <Text className="text-gray-600 font-medium mb-2 ml-1">Full Name</Text>
              <View className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 flex-row items-center">
                <User size={20} color="#9CA3AF" className="mr-3" />
                <TextInput
                  value={name}
                  onChangeText={setName}
                  className="flex-1 text-base text-gray-800"
                  placeholder="Enter your full name"
                  placeholderTextColor="#9CA3AF"
                />
              </View>
            </View>

            <View>
              <Text className="text-gray-600 font-medium mb-2 ml-1">Phone Number</Text>
              <View className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 flex-row items-center">
                <Phone size={20} color="#9CA3AF" className="mr-3" />
                <TextInput
                  value={phone}
                  onChangeText={setPhone}
                  className="flex-1 text-base text-gray-800"
                  placeholder="Enter your phone number"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="phone-pad"
                />
              </View>
            </View>

            <View>
              <Text className="text-gray-600 font-medium mb-2 ml-1">Email Address</Text>
              <View className="bg-gray-100 border border-gray-200 rounded-xl px-4 py-3 flex-row items-center opacity-70">
                <Mail size={20} color="#9CA3AF" className="mr-3" />
                <TextInput
                  value={email}
                  editable={false}
                  className="flex-1 text-base text-gray-800"
                />
              </View>
              <Text className="text-gray-400 text-xs mt-2 ml-1">Email address cannot be changed currently.</Text>
            </View>
          </View>

          {/* Save Button */}
          <View className="mt-10 mb-8">
            <TouchableOpacity
              className={`py-4 rounded-xl ${saving ? 'bg-blue-300' : 'bg-blue-500'}`}
              onPress={handleSave}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className="text-white text-center font-bold text-lg">Save Changes</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      )}
    </ScrollView>
  );
}