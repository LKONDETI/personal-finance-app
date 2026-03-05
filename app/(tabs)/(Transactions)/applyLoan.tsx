import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { loans } from '@/services/api';
import showAlert from '@/components/utility/ShowAlert';

const LOAN_TYPES = ['Personal', 'Auto', 'Home', 'Education', 'Business'];
const TERM_OPTIONS = [12, 24, 36, 48, 60];

export default function ApplyLoan() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { type } = useLocalSearchParams<{ type?: string }>();
  const [loanType, setLoanType] = useState(type || 'Personal');
  const [amount, setAmount] = useState('');
  const [termMonths, setTermMonths] = useState(36);
  const [purpose, setPurpose] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const calculateMonthlyPayment = (): number => {
    const principal = parseFloat(amount) || 0;
    if (principal === 0) return 0;

    // Simplified interest rate calculation (varies by loan type)
    let annualRate = 0.08; // Default 8% (Personal)
    if (loanType === 'Home') annualRate = 0.045;
    if (loanType === 'Auto') annualRate = 0.06;
    if (loanType === 'Education') annualRate = 0.055;
    if (loanType === 'Business') annualRate = 0.09;

    const monthlyRate = annualRate / 12;
    const monthlyPayment = (principal * monthlyRate * Math.pow(1 + monthlyRate, termMonths)) /
      (Math.pow(1 + monthlyRate, termMonths) - 1);

    return monthlyPayment;
  };

  const handleSubmit = async () => {
    // Validation
    if (!loanType) {
      showAlert('Error', 'Please select a loan type');
      return;
    }

    const amountNum = parseFloat(amount);
    if (!amount || isNaN(amountNum) || amountNum <= 0) {
      showAlert('Error', 'Please enter a valid loan amount');
      return;
    }

    if (amountNum < 1000) {
      showAlert('Error', 'Minimum loan amount is $1,000');
      return;
    }

    if (amountNum > 500000) {
      showAlert('Error', 'Maximum loan amount is $500,000');
      return;
    }

    if (!purpose.trim()) {
      showAlert('Error', 'Please enter the loan purpose');
      return;
    }

    setSubmitting(true);
    try {
      await loans.apply({
        loanType,
        amount: amountNum,
        termMonths,
        loanPurpose: purpose.trim(),
      });

      showAlert(
        'Success',
        'Your loan application has been submitted successfully! We will review it and get back to you soon.',
        [
          {
            text: 'OK',
            onPress: () => router.back(),
          },
        ]
      );
    } catch (error: any) {
      console.error('Failed to submit loan application:', error);
      showAlert(
        'Error',
        error.response?.data?.message || 'Failed to submit loan application. Please try again.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const monthlyPayment = calculateMonthlyPayment();

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-gray-50"
    >
      {/* Header */}
      <View className="bg-purple-600 pb-6 px-6" style={{ paddingTop: insets.top + 8 }}>
        <TouchableOpacity
          onPress={() => router.back()}
          className="bg-purple-700 rounded-full p-2 mb-4 self-start"
        >
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>

        <Text className="text-white text-3xl font-bold mb-2">Apply for Loan</Text>
        <Text className="text-purple-200">Complete the form below to submit your application</Text>
      </View>

      <ScrollView className="flex-1 -mt-4 px-4">
        {/* Loan Type Selection */}
        <View className="bg-white rounded-2xl shadow p-6 mb-4">
          <Text className="text-lg font-bold mb-3">Loan Type</Text>
          <View className="flex-row flex-wrap">
            {LOAN_TYPES.map((type) => (
              <TouchableOpacity
                key={type}
                onPress={() => setLoanType(type)}
                className={`px-4 py-2 rounded-full mr-2 mb-2 ${loanType === type ? 'bg-purple-600' : 'bg-gray-100'
                  }`}
              >
                <Text className={`font-semibold ${loanType === type ? 'text-white' : 'text-gray-700'
                  }`}>
                  {type}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Amount Input */}
        <View className="bg-white rounded-2xl shadow p-6 mb-4">
          <Text className="text-lg font-bold mb-3">Loan Amount</Text>
          <View className="flex-row items-center bg-gray-50 rounded-xl border border-gray-200 px-4 py-3">
            <Text className="text-2xl font-bold text-gray-700 mr-2">$</Text>
            <TextInput
              className="flex-1 text-2xl font-bold"
              placeholder="0"
              keyboardType="numeric"
              value={amount}
              onChangeText={setAmount}
              editable={!submitting}
            />
          </View>
          <Text className="text-gray-500 text-sm mt-2">Min: $1,000 • Max: $500,000</Text>
        </View>

        {/* Term Selection */}
        <View className="bg-white rounded-2xl shadow p-6 mb-4">
          <Text className="text-lg font-bold mb-3">Loan Term</Text>
          <View className="flex-row flex-wrap">
            {TERM_OPTIONS.map((term) => (
              <TouchableOpacity
                key={term}
                onPress={() => setTermMonths(term)}
                className={`px-4 py-2 rounded-full mr-2 mb-2 ${termMonths === term ? 'bg-purple-600' : 'bg-gray-100'
                  }`}
              >
                <Text className={`font-semibold ${termMonths === term ? 'text-white' : 'text-gray-700'
                  }`}>
                  {term} months
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Purpose Input */}
        <View className="bg-white rounded-2xl shadow p-6 mb-4">
          <Text className="text-lg font-bold mb-3">Loan Purpose</Text>
          <TextInput
            className="bg-gray-50 rounded-xl border border-gray-200 px-4 py-3 text-base"
            placeholder="e.g., Home renovation, Car purchase, Education expenses"
            value={purpose}
            onChangeText={setPurpose}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
            editable={!submitting}
          />
        </View>

        {/* Monthly Payment Preview */}
        {amount && parseFloat(amount) > 0 && (
          <View className="bg-purple-50 rounded-2xl border-2 border-purple-200 p-6 mb-4">
            <View className="flex-row items-center mb-2">
              <Ionicons name="calculator-outline" size={24} color="#8B5CF6" />
              <Text className="text-purple-900 font-bold text-lg ml-2">Estimated Monthly Payment</Text>
            </View>
            <Text className="text-purple-600 text-4xl font-bold">${monthlyPayment.toFixed(2)}</Text>
            <Text className="text-purple-700 text-sm mt-2">
              Based on estimated interest rate for {loanType} loan
            </Text>
          </View>
        )}

        {/* Submit Button */}
        <TouchableOpacity
          onPress={handleSubmit}
          disabled={submitting}
          className={`${submitting ? 'bg-purple-400' : 'bg-purple-600'} rounded-2xl p-4 mb-6 shadow-lg`}
          style={{
            shadowColor: '#8B5CF6',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 8,
            elevation: 5,
          }}
        >
          <Text className="text-white text-center font-bold text-lg">
            {submitting ? 'Submitting...' : 'Submit Application'}
          </Text>
        </TouchableOpacity>

        <View className="pb-6">
          <Text className="text-gray-500 text-xs text-center">
            By submitting this application, you agree to our terms and conditions.
            {'\n'}Your application will be reviewed within 1-2 business days.
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
