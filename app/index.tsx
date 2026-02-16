import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { auth } from '@/services/api';
import showAlert from '@/components/utility/ShowAlert';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    // Validation
    if (!email.trim()) {
      showAlert('Error', 'Please enter your email');
      return;
    }

    if (!password.trim()) {
      showAlert('Error', 'Please enter your password');
      return;
    }

    // Basic email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      showAlert('Error', 'Please enter a valid email address');
      return;
    }

    setIsLoading(true);
    try {
      // Call .NET Backend API
      const response = await auth.login(email, password);
      
      // Navigate to dashboard with user data
      router.replace({
        pathname: '/(tabs)/(Transactions)/dashboard',
        params: { 
          party_id: response.user.id.toString(),
          user_name: response.user.name 
        }
      });
    } catch (error: any) {
      console.error('Login Error:', error);
      
      // Handle different error scenarios
      let errorMessage = 'Failed to login. Please try again.';
      
      if (error.response?.status === 401) {
        errorMessage = 'Invalid email or password. Please check your credentials.';
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      showAlert('Login Failed', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1"
      style={{ backgroundColor: '#f0f4f8' }}
    >
      <BlurView intensity={20} tint="light" style={{ flex: 1 }}>
        <ScrollView className="flex-1">
          <View className="flex-1 px-6 pt-20 pb-6">
            {/* Header */}
            <View className="mb-12">
              <Text className="text-4xl font-bold text-gray-900 mb-2">Welcome Back</Text>
              <Text className="text-gray-600 text-lg">Sign in to continue to your account</Text>
            </View>

            {/* Login Form */}
            <BlurView intensity={80} tint="light" className="rounded-3xl overflow-hidden border border-gray-200/50">
              <View className="p-6 space-y-6" style={{ backgroundColor: 'rgba(255,255,255,0.7)' }}>
                {/* Email Input */}
                <View>
                  <Text className="text-sm font-semibold text-gray-700 mb-2">Email Address</Text>
                  <View className="flex-row items-center bg-white rounded-xl border border-gray-300 px-4 py-3">
                    <Ionicons name="mail-outline" size={20} color="#6B7280" style={{ marginRight: 10 }} />
                    <TextInput
                      className="flex-1 text-base"
                      placeholder="Enter your email"
                      value={email}
                      onChangeText={setEmail}
                      autoCapitalize="none"
                      keyboardType="email-address"
                      editable={!isLoading}
                    />
                  </View>
                </View>

                {/* Password Input */}
                <View>
                  <Text className="text-sm font-semibold text-gray-700 mb-2">Password</Text>
                  <View className="flex-row items-center bg-white rounded-xl border border-gray-300 px-4 py-3">
                    <Ionicons name="lock-closed-outline" size={20} color="#6B7280" style={{ marginRight: 10 }} />
                    <TextInput
                      className="flex-1 text-base"
                      placeholder="Enter your password"
                      value={password}
                      onChangeText={setPassword}
                      secureTextEntry={!showPassword}
                      autoCapitalize="none"
                      editable={!isLoading}
                    />
                    <TouchableOpacity 
                      onPress={() => setShowPassword(!showPassword)}
                      disabled={isLoading}
                      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                      <Ionicons 
                        name={showPassword ? "eye-outline" : "eye-off-outline"} 
                        size={20} 
                        color="#6B7280" 
                      />
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Login Button */}
                <View className="pt-4">
                  <TouchableOpacity
                    onPress={handleLogin}
                    disabled={isLoading}
                    className={`w-full py-4 rounded-xl ${isLoading ? 'bg-blue-400' : 'bg-blue-600'} shadow-lg`}
                    style={{
                      shadowColor: '#3B82F6',
                      shadowOffset: { width: 0, height: 4 },
                      shadowOpacity: 0.3,
                      shadowRadius: 8,
                      elevation: 5,
                    }}
                  >
                    {isLoading ? (
                      <ActivityIndicator color="white" />
                    ) : (
                      <Text className="text-white text-center font-semibold text-lg">
                        Sign In
                      </Text>
                    )}
                  </TouchableOpacity>
                </View>

                {/* Test Credentials Hint */}
                <View className="pt-4 border-t border-gray-200">
                  <Text className="text-xs text-gray-500 text-center">
                    Test: john.doe@example.com / Test123!
                  </Text>
                </View>
              </View>
            </BlurView>

            {/* Footer */}
            <View className="mt-8">
              <Text className="text-sm text-gray-600 text-center">
                Powered by .NET 9.0 Backend
              </Text>
            </View>
          </View>
        </ScrollView>
      </BlurView>
    </KeyboardAvoidingView>
  );
}
