import React, { useEffect, useState } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView, ActivityIndicator,
  Modal, TextInput, Alert, KeyboardAvoidingView, Platform
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { loans } from '@/services/api';
import type { Loan } from '@/services/api';

export default function LoanDetails() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { loanId } = useLocalSearchParams<{ loanId: string }>();
  const [loan, setLoan] = useState<Loan | null>(null);
  const [loading, setLoading] = useState(true);

  // Withdrawal modal state
  const [withdrawModalVisible, setWithdrawModalVisible] = useState(false);
  const [withdrawReason, setWithdrawReason] = useState('');
  const [withdrawing, setWithdrawing] = useState(false);

  useEffect(() => {
    if (!loanId) return;
    const fetchLoanDetails = async () => {
      try {
        setLoading(true);
        const data = await loans.getById(parseInt(loanId));
        setLoan(data);
      } catch (error) {
        console.error('Failed to fetch loan details:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchLoanDetails();
  }, [loanId]);

  const getStatusColor = (status: string) => {
    const s = status.toLowerCase();
    if (s === 'pending')   return { bg: 'bg-amber-100',  text: 'text-amber-700',  border: 'border-amber-200' };
    if (s === 'approved')  return { bg: 'bg-green-100',  text: 'text-green-700',  border: 'border-green-200' };
    if (s === 'active')    return { bg: 'bg-blue-100',   text: 'text-blue-700',   border: 'border-blue-200' };
    if (s === 'rejected')  return { bg: 'bg-red-100',    text: 'text-red-700',    border: 'border-red-200' };
    if (s === 'withdrawn') return { bg: 'bg-gray-100',   text: 'text-gray-500',   border: 'border-gray-200' };
    if (s === 'completed') return { bg: 'bg-gray-100',   text: 'text-gray-700',   border: 'border-gray-200' };
    return { bg: 'bg-gray-100', text: 'text-gray-700', border: 'border-gray-200' };
  };

  const formatDate = (date?: string) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  const calculateProgress = () => {
    if (!loan) return 0;
    const paid = loan.loanAmount - loan.outstandingBalance;
    return (paid / loan.loanAmount) * 100;
  };

  const handleWithdraw = async () => {
    if (!withdrawReason.trim() || withdrawReason.trim().length < 5) {
      Alert.alert('Reason Required', 'Please enter a reason for withdrawing (at least 5 characters).');
      return;
    }
    try {
      setWithdrawing(true);
      await loans.withdraw(parseInt(loanId!), withdrawReason.trim());
      setWithdrawModalVisible(false);
      Alert.alert(
        'Application Withdrawn',
        'Your loan application has been withdrawn successfully.',
        [{ text: 'OK', onPress: () => router.back() }]
      );
    } catch (error: any) {
      Alert.alert('Error', error?.response?.data?.message || 'Failed to withdraw application. Please try again.');
    } finally {
      setWithdrawing(false);
    }
  };

  if (loading) {
    return (
      <View className="flex-1 bg-gray-50 items-center justify-center">
        <ActivityIndicator size="large" color="#8B5CF6" />
      </View>
    );
  }

  if (!loan) {
    return (
      <View className="flex-1 bg-gray-50 items-center justify-center">
        <Text className="text-gray-500">Loan not found</Text>
        <TouchableOpacity onPress={() => router.back()} className="mt-4">
          <Text className="text-purple-600 font-semibold">Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const statusColors = getStatusColor(loan.status);
  const progress = calculateProgress();
  const isPending = loan.status.toLowerCase() === 'pending';

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-purple-600 pb-6 px-6" style={{ paddingTop: insets.top + 8 }}>
        <TouchableOpacity
          onPress={() => router.back()}
          className="bg-purple-700 rounded-full p-2 mb-4 self-start"
        >
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>

        <Text className="text-white text-3xl font-bold mb-2">{loan.loanType}</Text>
        <Text className="text-purple-200">{loan.purpose}</Text>

        <View className={`${statusColors.bg} ${statusColors.border} border px-4 py-2 rounded-full self-start mt-4`}>
          <Text className={`${statusColors.text} font-semibold`}>{loan.status}</Text>
        </View>
      </View>

      <ScrollView className="flex-1 -mt-4">
        {/* Amount Card */}
        <View className="bg-white mx-4 rounded-2xl shadow-lg p-6 mb-4">
          <View className="flex-row justify-between items-center mb-4">
            <View>
              <Text className="text-gray-500 text-sm">Loan Amount</Text>
              <Text className="text-3xl font-bold text-gray-900">${loan.loanAmount.toLocaleString()}</Text>
            </View>
            <View className="bg-purple-100 px-4 py-2 rounded-lg">
              <Text className="text-purple-700 font-bold text-lg">{loan.interestRate}%</Text>
              <Text className="text-purple-600 text-xs">APR</Text>
            </View>
          </View>

          {/* Progress Bar */}
          <View className="mt-4">
            <View className="flex-row justify-between mb-2">
              <Text className="text-gray-600 text-sm">Repayment Progress</Text>
              <Text className="text-gray-600 text-sm font-semibold">{progress.toFixed(1)}%</Text>
            </View>
            <View className="bg-gray-200 h-3 rounded-full overflow-hidden">
              <View
                className="bg-purple-600 h-full rounded-full"
                style={{ width: `${progress}%` }}
              />
            </View>
          </View>
        </View>

        {/* Payment Details */}
        <View className="bg-white mx-4 rounded-2xl shadow p-6 mb-4">
          <Text className="text-lg font-bold mb-4">Payment Details</Text>

          <View className="flex-row justify-between py-3 border-b border-gray-100">
            <Text className="text-gray-600">Monthly Payment</Text>
            <Text className="font-bold text-purple-600">${loan.monthlyPayment.toLocaleString()}</Text>
          </View>

          <View className="flex-row justify-between py-3 border-b border-gray-100">
            <Text className="text-gray-600">Outstanding Balance</Text>
            <Text className="font-bold">${loan.outstandingBalance.toLocaleString()}</Text>
          </View>

          <View className="flex-row justify-between py-3 border-b border-gray-100">
            <Text className="text-gray-600">Loan Term</Text>
            <Text className="font-bold">{loan.loanTermMonths} months</Text>
          </View>

          <View className="flex-row justify-between py-3">
            <Text className="text-gray-600">Total Interest</Text>
            <Text className="font-bold">${((loan.monthlyPayment * loan.loanTermMonths) - loan.loanAmount).toFixed(2)}</Text>
          </View>
        </View>

        {/* Timeline */}
        <View className="bg-white mx-4 rounded-2xl shadow p-6 mb-4">
          <Text className="text-lg font-bold mb-4">Timeline</Text>

          <View className="space-y-4">
            <View className="flex-row items-start">
              <View className="bg-purple-100 rounded-full p-2 mr-3">
                <Ionicons name="document-text-outline" size={20} color="#8B5CF6" />
              </View>
              <View className="flex-1">
                <Text className="font-semibold">Application Submitted</Text>
                <Text className="text-gray-500 text-sm">{formatDate(loan.applicationDate)}</Text>
              </View>
            </View>

            {loan.approvalDate && (
              <View className="flex-row items-start">
                <View className="bg-green-100 rounded-full p-2 mr-3">
                  <Ionicons name="checkmark-circle-outline" size={20} color="#10B981" />
                </View>
                <View className="flex-1">
                  <Text className="font-semibold">Approved</Text>
                  <Text className="text-gray-500 text-sm">{formatDate(loan.approvalDate)}</Text>
                </View>
              </View>
            )}

            {loan.disbursementDate && (
              <View className="flex-row items-start">
                <View className="bg-blue-100 rounded-full p-2 mr-3">
                  <Ionicons name="cash-outline" size={20} color="#3B82F6" />
                </View>
                <View className="flex-1">
                  <Text className="font-semibold">Disbursed</Text>
                  <Text className="text-gray-500 text-sm">{formatDate(loan.disbursementDate)}</Text>
                </View>
              </View>
            )}
          </View>
        </View>

        {/* Withdraw Button — only for Pending loans */}
        {isPending && (
          <TouchableOpacity
            className="mx-4 mb-6 border-2 border-red-300 bg-red-50 rounded-2xl p-4 flex-row items-center justify-center"
            onPress={() => setWithdrawModalVisible(true)}
          >
            <Ionicons name="close-circle-outline" size={20} color="#EF4444" />
            <Text className="text-red-500 font-semibold ml-2">Withdraw Application</Text>
          </TouchableOpacity>
        )}

        {!isPending && <View className="h-6" />}
      </ScrollView>

      {/* Withdrawal Reason Modal */}
      <Modal
        visible={withdrawModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => !withdrawing && setWithdrawModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1, justifyContent: 'flex-end' }}
        >
          <View style={{ backgroundColor: 'rgba(0,0,0,0.4)', flex: 1, justifyContent: 'flex-end' }}>
            <View className="bg-white rounded-t-3xl px-6 pt-6 pb-10">
              {/* Handle bar */}
              <View className="w-10 h-1 bg-gray-200 rounded-full self-center mb-5" />

              <View className="flex-row items-center mb-2">
                <View className="bg-red-100 rounded-full p-2 mr-3">
                  <Ionicons name="close-circle-outline" size={22} color="#EF4444" />
                </View>
                <Text className="text-xl font-bold text-gray-900">Withdraw Application</Text>
              </View>
              <Text className="text-gray-500 text-sm mb-5 ml-1">
                Please tell us why you're withdrawing this {loan?.loanType} loan application.
              </Text>

              <TextInput
                className="bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-gray-800 text-sm min-h-[100px]"
                placeholder="Enter your reason here..."
                placeholderTextColor="#9CA3AF"
                multiline
                textAlignVertical="top"
                value={withdrawReason}
                onChangeText={setWithdrawReason}
                editable={!withdrawing}
              />

              <View className="flex-row gap-3 mt-5">
                <TouchableOpacity
                  className="flex-1 bg-gray-100 rounded-2xl py-4 items-center"
                  onPress={() => {
                    setWithdrawModalVisible(false);
                    setWithdrawReason('');
                  }}
                  disabled={withdrawing}
                >
                  <Text className="text-gray-600 font-semibold">Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  className="flex-1 bg-red-500 rounded-2xl py-4 items-center"
                  onPress={handleWithdraw}
                  disabled={withdrawing}
                  style={{ opacity: withdrawing ? 0.6 : 1 }}
                >
                  {withdrawing
                    ? <ActivityIndicator size="small" color="white" />
                    : <Text className="text-white font-semibold">Confirm Withdrawal</Text>
                  }
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}
