import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, RefreshControl } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { accounts, transactions, loans } from '@/services/api';
import type { Account, Transaction, Loan } from '@/services/api';

export default function Dashboard() {
  const router = useRouter();
  const { party_id, user_name } = useLocalSearchParams<{ party_id: string; user_name?: string }>();
  
  const [accountsList, setAccountsList] = useState<Account[]>([]);
  const [transactionsList, setTransactionsList] = useState<Transaction[]>([]);
  const [loansList, setLoansList] = useState<Loan[]>([]);
  
  const [accountsLoading, setAccountsLoading] = useState(true);
  const [transactionsLoading, setTransactionsLoading] = useState(true);
  const [loansLoading, setLoansLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    if (!party_id) return;

    try {
      // Fetch accounts
      setAccountsLoading(true);
      const accountsData = await accounts.getAll();
      setAccountsList(accountsData);
    } catch (error) {
      console.error('Failed to fetch accounts:', error);
    } finally {
      setAccountsLoading(false);
    }

    try {
      // Fetch recent transactions
      setTransactionsLoading(true);
      const transactionsData = await transactions.getAll();
      setTransactionsList(transactionsData.slice(-5)); // Get last 5
    } catch (error) {
      console.error('Failed to fetch transactions:', error);
    } finally {
      setTransactionsLoading(false);
    }

    try {
      // Fetch loans
      setLoansLoading(true);
      const loansData = await loans.getAll();
      setLoansList(loansData.filter(l => l.status.toLowerCase() !== 'rejected' && l.status.toLowerCase() !== 'completed'));
    } catch (error) {
      console.error('Failed to fetch loans:', error);
    } finally {
      setLoansLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [party_id]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  const handleAccountPress = (accountId: number) => {
    router.push({
      pathname: '/(tabs)/(Transactions)/accountDetails',
      params: { accountId, party_id }
    });
  };

  const getStatusColor = (status: string) => {
    const statusLower = status.toLowerCase();
    if (statusLower === 'pending') return { bg: 'bg-amber-100', text: 'text-amber-700', border: 'border-amber-200' };
    if (statusLower === 'approved') return { bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-200' };
    if (statusLower === 'active') return { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-200' };
    if (statusLower === 'rejected') return { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-200' };
    return { bg: 'bg-gray-100', text: 'text-gray-700', border: 'border-gray-200' };
  };

  if (!party_id) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50">
        <Text className="text-red-500">No party_id provided. Please log in again.</Text>
      </View>
    );
  }

  return (
    <ScrollView 
      className="flex-1 bg-gray-50"
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Header */}
      <View className="flex-row items-center justify-between mb-6 pt-12 px-6">
        <View>
          <Text className="text-3xl font-extrabold tracking-tight">Dashboard</Text>
          {user_name && <Text className="text-gray-500 mt-1">Welcome, {user_name}</Text>}
        </View>
        <TouchableOpacity 
          onPress={() => router.push('/(tabs)/(Settings)/settings')}
          className="bg-white rounded-full p-2 shadow-sm border border-gray-200"
        >
          <Ionicons name="settings-outline" size={24} color="#000" />
        </TouchableOpacity>
      </View>

      {/* Accounts Section */}
      <Text className="text-xl font-bold mb-3 px-6">Accounts</Text>
      <View className="px-4">
        {accountsLoading ? (
          <ActivityIndicator size="large" color="#4B7BF5" />
        ) : accountsList.length === 0 ? (
          <Text className="text-gray-500 text-center py-6">No accounts found.</Text>
        ) : (
          accountsList.map((account) => (
            <TouchableOpacity
              key={account.id}
              className="mb-4 bg-white rounded-2xl shadow p-5 border border-blue-100 flex-row items-center justify-between"
              onPress={() => handleAccountPress(account.id)}
            >
              <View>
                <Text className="text-lg font-bold mb-1">{account.accountName}</Text>
                <Text className="text-xs text-gray-400">Available balance</Text>
              </View>
              <Text className="text-2xl font-extrabold text-blue-600">
                ${account.balance.toFixed(2)}
              </Text>
            </TouchableOpacity>
          ))
        )}
      </View>

      {/* Loans Section */}
      <Text className="text-xl font-bold mb-3 mt-6 px-6">My Loans</Text>
      <View className="px-4">
        {loansLoading ? (
          <ActivityIndicator size="small" color="#8B5CF6" />
        ) : loansList.length === 0 ? (
          <TouchableOpacity
            className="bg-purple-600 rounded-2xl p-6 flex-row items-center justify-between shadow-lg mb-4"
            onPress={() => router.push('/(tabs)/(Transactions)/applyLoan')}
            style={{
              shadowColor: '#8B5CF6',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 5,
            }}
          >
            <View>
              <Text className="text-white font-bold text-lg mb-1">Need a Loan?</Text>
              <Text className="text-purple-100 text-sm">Apply now for quick approval</Text>
            </View>
            <Ionicons name="add-circle" size={32} color="white" />
          </TouchableOpacity>
        ) : (
          <>
            {loansList.slice(0, 2).map((loan) => {
              const statusColors = getStatusColor(loan.status);
              return (
                <TouchableOpacity
                  key={loan.id}
                  className="mb-4 bg-white rounded-2xl shadow p-5 border border-purple-100"
                  onPress={() => router.push({
                    pathname: '/(tabs)/(Transactions)/loanDetails',
                    params: { loanId: loan.id.toString() }
                  })}
                >
                  <View className="flex-row items-center justify-between mb-3">
                    <View className="flex-row items-center">
                      <View className="bg-purple-100 rounded-full p-2 mr-3">
                        <Ionicons name="briefcase-outline" size={20} color="#8B5CF6" />
                      </View>
                      <View>
                        <Text className="font-bold text-base">{loan.loanType}</Text>
                        <View className={`${statusColors.bg} px-2 py-1 rounded-full mt-1`}>
                          <Text className={`${statusColors.text} font-semibold text-xs`}>
                            {loan.status}
                          </Text>
                        </View>
                      </View>
                    </View>
                    <View className="bg-purple-50 px-3 py-1 rounded-full">
                      <Text className="text-purple-700 font-semibold text-xs">
                        {loan.interestRate}% APR
                      </Text>
                    </View>
                  </View>
                  <View className="flex-row justify-between">
                    <View>
                      <Text className="text-gray-500 text-xs">Outstanding</Text>
                      <Text className="font-bold text-lg">${loan.outstandingBalance.toLocaleString()}</Text>
                    </View>
                    <View className="items-end">
                      <Text className="text-gray-500 text-xs">Monthly Payment</Text>
                      <Text className="font-bold text-lg text-purple-600">${loan.monthlyPayment.toLocaleString()}</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
            
            {loansList.length > 2 && (
              <TouchableOpacity
                className="flex-row items-center justify-center py-3"
                onPress={() => router.push('/(tabs)/(Transactions)/allLoans')}
              >
                <Text className="text-purple-600 font-semibold mr-2">View All Loans</Text>
                <Ionicons name="arrow-forward" size={16} color="#8B5CF6" />
              </TouchableOpacity>
            )}
          </>
        )}
      </View>

      {/* Recent Transactions */}
      <Text className="text-xl font-bold mb-3 mt-8 px-6">Recent Transactions</Text>
      <View className="bg-white rounded-2xl shadow mx-4 mb-8 border border-gray-100">
        {transactionsLoading ? (
          <ActivityIndicator size="small" color="#4B7BF5" className="py-6" />
        ) : transactionsList.length === 0 ? (
          <Text className="text-gray-400 text-center py-6">No transactions found.</Text>
        ) : (
          transactionsList.map((txn, idx) => {
            const isCredit = txn.transactionType === 'Credit';
            const formattedDate = new Date(txn.transactionDate).toLocaleDateString();
            
            return (
              <View 
                key={txn.id} 
                className={`flex-row items-center justify-between px-6 py-4 ${
                  idx < transactionsList.length - 1 ? 'border-b border-gray-100' : ''
                }`}
              >
                <View>
                  <Text className="font-medium text-base">{txn.category}</Text>
                  <Text className="text-gray-400 text-xs mt-1">{formattedDate}</Text>
                </View>
                <Text className={`font-semibold text-base ${isCredit ? 'text-green-500' : 'text-red-500'}`}>
                  {isCredit ? '+' : '-'}${txn.amount.toFixed(2)}
                </Text>
              </View>
            );
          })
        )}
      </View>
    </ScrollView>
  );
}