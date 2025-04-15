import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { router } from 'expo-router';
import axios from 'axios';
import showAlert from '@/components/utility/ShowAlert';

// API endpoint from server.js
const API_URL = 'http://localhost:3000/api/customers';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  //const [customerMnemonic, setCustomerMnemonic] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    if (!email.trim()) {
      showAlert('Error', 'Please enter your email');
      return;
    }

    setIsLoading(true);
    try {
      // Make request to our proxy server
      const response = await axios.get(`${API_URL}?email=${email}`);
      
      // Check if we have valid customer data
      if (response.data && response.data.customer) {
        // Store customer data if needed
        // For now, just navigate to dashboard
        router.replace('/(tabs)/(Transactions)/dashboard');
      } else {
        showAlert('Error', 'Customer not found');
      }
    } catch (error: any) {
      console.error('Login Error:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      
      // Show more detailed error message
      const errorMessage = error.response?.data?.details || 
                          error.response?.data?.message || 
                          error.message || 
                          'Failed to login. Please try again.';
      showAlert('Error', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-white"
    >
      <ScrollView className="flex-1">
        <View className="flex-1 px-6 pt-20 pb-6">
          {/* Header */}
          <View className="mb-12">
            <Text className="text-3xl font-bold text-gray-900 mb-2">Welcome Back</Text>
            <Text className="text-gray-600">Sign in to continue to your account</Text>
          </View>

          {/* Login Form */}
          <View className="space-y-6">
            {/* Email Input */}
            <View>
              <Text className="text-sm font-medium text-gray-700 mb-2">Email</Text>
              <TextInput
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                placeholder="Enter your email"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
              />
            </View>

            {/* Customer Mnemonic Input 
            <View>
              <Text className="text-sm font-medium text-gray-700 mb-2">Customer Mnemonic</Text>
              <TextInput
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                placeholder="Enter your customer mnemonic"
                value={customerMnemonic}
                onChangeText={setCustomerMnemonic}
                secureTextEntry
              />
            </View>*/}

            {/* Login Button */}
            <TouchableOpacity
              onPress={handleLogin}
              disabled={isLoading}
              className={`w-full py-4 rounded-lg ${isLoading ? 'bg-blue-400' : 'bg-blue-600'}`}
            >
              <Text className="text-white text-center font-semibold text-lg">
                {isLoading ? 'Signing in...' : 'Sign In'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
