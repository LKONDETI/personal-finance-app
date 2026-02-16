import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { loans } from '@/services/api';
import type { Loan } from '@/services/api';

export default function AllLoans() {
  const router = useRouter();
  const [loansList, setLoansList] = useState<Loan[]>([]);
  const [filteredLoans, setFilteredLoans] = useState<Loan[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState<'all' | 'active' | 'pending' | 'completed'>('all');

  const fetchLoans = async () => {
    try {
      setLoading(true);
      const data = await loans.getAll();
      setLoansList(data);
      filterLoans(data, activeFilter);
    } catch (error) {
      console.error('Failed to fetch loans:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLoans();
  }, []);

  const filterLoans = (data: Loan[], filter: typeof activeFilter) => {
    if (filter === 'all') {
      setFilteredLoans(data);
    } else {
      setFilteredLoans(data.filter(loan => loan.status.toLowerCase() === filter));
    }
  };

  const handleFilterChange = (filter: typeof activeFilter) => {
    setActiveFilter(filter);
    filterLoans(loansList, filter);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchLoans();
    setRefreshing(false);
  };

  const getStatusColor = (status: string) => {
    const statusLower = status.toLowerCase();
    if (statusLower === 'pending') return { bg: 'bg-amber-100', text: 'text-amber-700', icon: 'time-outline' as const };
    if (statusLower === 'approved') return { bg: 'bg-green-100', text: 'text-green-700', icon: 'checkmark-circle-outline' as const };
    if (statusLower === 'active') return { bg: 'bg-blue-100', text: 'text-blue-700', icon: 'trending-up-outline' as const };
    if (statusLower === 'rejected') return { bg: 'bg-red-100', text: 'text-red-700', icon: 'close-circle-outline' as const };
    if (statusLower === 'completed') return { bg: 'bg-gray-100', text: 'text-gray-700', icon: 'checkmark-done-outline' as const };
    return { bg: 'bg-gray-100', text: 'text-gray-700', icon: 'help-circle-outline' as const };
  };

  const getLoanIcon = (loanType: string) => {
    const type = loanType.toLowerCase();
    if (type.includes('personal')) return 'person-outline';
    if (type.includes('auto') || type.includes('car')) return 'car-outline';
    if (type.includes('home') || type.includes('mortgage')) return 'home-outline';
    if (type.includes('education') || type.includes('student')) return 'school-outline';
    return 'briefcase-outline';
  };

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white pt-12 pb-4 px-6 shadow-sm">
        <View className="flex-row items-center justify-between mb-4">
          <View className="flex-row items-center">
            <TouchableOpacity 
              onPress={() => router.back()}
              className="bg-gray-100 rounded-full p-2 border border-gray-200 mr-3"
            >
              <Ionicons name="arrow-back" size={24} color="black" />
            </TouchableOpacity>
            <Text className="text-2xl font-bold">My Loans</Text>
          </View>
        </View>

        {/* Filter Tabs */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row">
          {['all', 'active', 'pending', 'completed'].map((filter) => (
            <TouchableOpacity
              key={filter}
              onPress={() => handleFilterChange(filter as typeof activeFilter)}
              className={`px-4 py-2 rounded-full mr-2 ${
                activeFilter === filter ? 'bg-purple-600' : 'bg-gray-100'
              }`}
            >
              <Text className={`font-semibold capitalize ${
                activeFilter === filter ? 'text-white' : 'text-gray-700'
              }`}>
                {filter}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Loans List */}
      <ScrollView
        className="flex-1 px-4 pt-4"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {loading ? (
          <ActivityIndicator size="large" color="#8B5CF6" className="mt-10" />
        ) : filteredLoans.length === 0 ? (
          <View className="items-center justify-center py-20">
            <Ionicons name="document-text-outline" size={64} color="#D1D5DB" />
            <Text className="text-gray-400 text-lg mt-4">No loans found</Text>
            <Text className="text-gray-400 text-sm">Try adjusting your filter</Text>
          </View>
        ) : (
          filteredLoans.map((loan) => {
            const statusColors = getStatusColor(loan.status);
            const loanIcon = getLoanIcon(loan.loanType);
            
            return (
              <TouchableOpacity
                key={loan.id}
                className="bg-white rounded-2xl shadow-md p-5 mb-4 border border-gray-100"
                onPress={() => router.push({
                  pathname: '/(tabs)/(Transactions)/loanDetails',
                  params: { loanId: loan.id.toString() }
                })}
              >
                {/* Header */}
                <View className="flex-row items-center justify-between mb-4">
                  <View className="flex-row items-center flex-1">
                    <View className="bg-purple-100 rounded-full p-3 mr-3">
                      <Ionicons name={loanIcon as any} size={24} color="#8B5CF6" />
                    </View>
                    <View className="flex-1">
                      <Text className="font-bold text-lg">{loan.loanType}</Text>
                      <Text className="text-gray-500 text-sm">{loan.loanPurpose}</Text>
                    </View>
                  </View>
                  <View className={`${statusColors.bg} px-3 py-1 rounded-full flex-row items-center`}>
                    <Ionicons name={statusColors.icon} size={14} color={statusColors.text.replace('text-', '')} />
                    <Text className={`${statusColors.text} font-semibold text-xs ml-1`}>
                      {loan.status}
                    </Text>
                  </View>
                </View>

                {/* Amount & Interest */}
                <View className="flex-row items-center justify-between mb-3 pb-3 border-b border-gray-100">
                  <View>
                    <Text className="text-gray-500 text-xs">Loan Amount</Text>
                    <Text className="font-bold text-xl">${loan.amount.toLocaleString()}</Text>
                  </View>
                  <View className="bg-purple-50 px-3 py-2 rounded-lg">
                    <Text className="text-purple-700 font-bold text-sm">{loan.interestRate}% APR</Text>
                    <Text className="text-purple-600 text-xs">{loan.termMonths} months</Text>
                  </View>
                </View>

                {/* Payment Details */}
                <View className="flex-row justify-between">
                  <View>
                    <Text className="text-gray-500 text-xs">Outstanding Balance</Text>
                    <Text className="font-bold text-base">${loan.outstandingBalance.toLocaleString()}</Text>
                  </View>
                  <View className="items-end">
                    <Text className="text-gray-500 text-xs">Monthly Payment</Text>
                    <Text className="font-bold text-base text-purple-600">${loan.monthlyPayment.toLocaleString()}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>

      {/* Floating Action Button */}
      <TouchableOpacity
        className="absolute bottom-6 right-6 bg-purple-600 rounded-full p-4 shadow-lg"
        onPress={() => router.push('/(tabs)/(Transactions)/applyLoan')}
        style={{
          shadowColor: '#8B5CF6',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 8,
          elevation: 8,
        }}
      >
        <Ionicons name="add" size={32} color="white" />
      </TouchableOpacity>
    </View>
  );
}
