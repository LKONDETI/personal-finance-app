import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator, ViewProps } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { GlassView, isLiquidGlassAvailable } from 'expo-glass-effect';
import type { GlassStyle } from 'expo-glass-effect';
import { Ionicons } from '@expo/vector-icons';
import { auth } from '@/services/api';
import showAlert from '@/components/utility/ShowAlert';

const glassAvailable = isLiquidGlassAvailable();

// Conditional wrapper: uses GlassView on iOS 26+, plain View elsewhere
function GlassWrapper({ glassStyle = 'regular', tintColor, children, ...viewProps }: ViewProps & { glassStyle?: GlassStyle; tintColor?: string; children: React.ReactNode }) {
  if (glassAvailable) {
    return (
      <GlassView glassEffectStyle={glassStyle} tintColor={tintColor} colorScheme="light" {...viewProps}>
        {children}
      </GlassView>
    );
  }
  return <View {...viewProps}>{children}</View>;
}

export default function LoginScreen() {
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    if (!email.trim()) {
      showAlert('Error', 'Please enter your email');
      return;
    }

    if (!password.trim()) {
      showAlert('Error', 'Please enter your password');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      showAlert('Error', 'Please enter a valid email address');
      return;
    }

    setIsLoading(true);
    try {
      const response = await auth.login(email, password);

      router.replace({
        pathname: '/(tabs)/(Transactions)/dashboard',
        params: {
          party_id: response.user.id.toString(),
          user_name: response.user.name
        }
      });
    } catch (error: any) {
      console.error('Login Error:', error);

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
      <GlassWrapper glassStyle="regular" style={{ flex: 1 }}>
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
        >
          <View style={{ flex: 1, paddingHorizontal: 24, paddingTop: insets.top + 40, paddingBottom: insets.bottom + 24 }}>
            {/* Header */}
            <View style={{ marginBottom: 40 }}>
              <Text style={{ fontSize: 36, fontWeight: '800', color: '#111827', marginBottom: 8 }}>Welcome Back</Text>
              <Text style={{ fontSize: 17, color: '#6B7280' }}>Sign in to continue to your account</Text>
            </View>

            {/* Login Form */}
            <GlassWrapper
              glassStyle="clear"
              tintColor="rgba(255,255,255,0.6)"
              style={{
                borderRadius: 24,
                overflow: 'hidden',
                borderWidth: 1,
                borderColor: 'rgba(209,213,219,0.5)',
              }}
            >
              <View style={[
                { padding: 24 },
                !glassAvailable && { backgroundColor: 'rgba(255,255,255,0.85)' }
              ]}>
                {/* Email Input */}
                <View style={{ marginBottom: 20 }}>
                  <Text style={{ fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 8 }}>Email Address</Text>
                  <View style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    backgroundColor: '#fff',
                    borderRadius: 12,
                    borderWidth: 1,
                    borderColor: '#D1D5DB',
                    paddingHorizontal: 16,
                    height: 52,
                  }}>
                    <Ionicons name="mail-outline" size={20} color="#6B7280" style={{ marginRight: 12 }} />
                    <TextInput
                      style={{ flex: 1, fontSize: 16, color: '#111827', height: '100%' }}
                      placeholder="Enter your email"
                      placeholderTextColor="#9CA3AF"
                      value={email}
                      onChangeText={setEmail}
                      autoCapitalize="none"
                      keyboardType="email-address"
                      editable={!isLoading}
                      testID="email-input"
                    />
                  </View>
                </View>

                {/* Password Input */}
                <View style={{ marginBottom: 24 }}>
                  <Text style={{ fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 8 }}>Password</Text>
                  <View style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    backgroundColor: '#fff',
                    borderRadius: 12,
                    borderWidth: 1,
                    borderColor: '#D1D5DB',
                    paddingHorizontal: 16,
                    height: 52,
                  }}>
                    <Ionicons name="lock-closed-outline" size={20} color="#6B7280" style={{ marginRight: 12 }} />
                    <TextInput
                      style={{ flex: 1, fontSize: 16, color: '#111827', height: '100%' }}
                      placeholder="Enter your password"
                      placeholderTextColor="#9CA3AF"
                      value={password}
                      onChangeText={setPassword}
                      secureTextEntry={!showPassword}
                      autoCapitalize="none"
                      editable={!isLoading}
                      testID="password-input"
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
                <TouchableOpacity
                  onPress={handleLogin}
                  disabled={isLoading}
                  testID="login-button"
                  style={{
                    backgroundColor: isLoading ? '#93C5FD' : '#2563EB',
                    paddingVertical: 16,
                    borderRadius: 14,
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
                    <Text style={{ color: '#fff', textAlign: 'center', fontWeight: '700', fontSize: 17 }}>
                      Sign In
                    </Text>
                  )}
                </TouchableOpacity>

                {/* Test Credentials Hint */}
                <View style={{ marginTop: 20, paddingTop: 16, borderTopWidth: 1, borderTopColor: '#E5E7EB' }}>
                  <Text style={{ fontSize: 12, color: '#9CA3AF', textAlign: 'center' }}>
                    Test: john.doe@example.com / Test123!
                  </Text>
                </View>
              </View>
            </GlassWrapper>

            {/* Footer */}
            <View style={{ marginTop: 32 }}>
            </View>
          </View>
        </ScrollView>
      </GlassWrapper>
    </KeyboardAvoidingView>
  );
}
