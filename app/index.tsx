import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { router } from 'expo-router';
import axios from 'axios';
import showAlert from '@/components/utility/ShowAlert';

// API endpoint from FastAPI
const API_URL = 'http://127.0.0.1:8000/customer';

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
      // Make request to FastAPI server
      const response = await axios.get(`${API_URL}?email=${email}`);
      
      // Check if we have valid customer data
      if (response.data && response.data.customer) {
        const party_id = response.data.customer.id;
        router.replace({
          pathname: '/(tabs)/(Transactions)/dashboard',
          params: { party_id }
        });
      } else {
        showAlert('Error', 'Customer not found');
      }
    } catch (error: any) {
      console.error('Login Error:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      
      // Handle different error status codes
      if (error.response?.status === 404) {
        // Customer not found - show a more helpful message
        showAlert(
          'Customer Not Found', 
          'No account found with this email. Please check your email or create a new account.'
        );
      } else {
        // Other errors
        const errorMessage = error.response?.data?.detail?.message || 
                            error.response?.data?.detail?.details || 
                          error.message || 
                          'Failed to login. Please try again.';
      showAlert('Error', errorMessage);
      }
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

            <View className="pt-4"> 
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
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
