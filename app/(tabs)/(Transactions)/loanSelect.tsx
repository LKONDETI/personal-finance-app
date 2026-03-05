import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

const LOAN_TYPES = [
    {
        type: 'Personal',
        icon: 'person-outline' as const,
        rate: '~8% APR',
        description: 'Quick cash for any personal need — no collateral required.',
        color: '#8B5CF6',
        bg: '#F3E8FF',
    },
    {
        type: 'Auto',
        icon: 'car-outline' as const,
        rate: '~6% APR',
        description: 'Finance your new or used vehicle with competitive rates.',
        color: '#3B82F6',
        bg: '#EFF6FF',
    },
    {
        type: 'Home',
        icon: 'home-outline' as const,
        rate: '~4.5% APR',
        description: 'Mortgage or home renovation — our lowest rates.',
        color: '#10B981',
        bg: '#ECFDF5',
    },
    {
        type: 'Education',
        icon: 'school-outline' as const,
        rate: '~5.5% APR',
        description: 'Invest in your future with flexible student loan terms.',
        color: '#F59E0B',
        bg: '#FFFBEB',
    },
    {
        type: 'Business',
        icon: 'briefcase-outline' as const,
        rate: '~9% APR',
        description: 'Fuel your business growth or cover operational costs.',
        color: '#EF4444',
        bg: '#FEF2F2',
    },
];

export default function LoanSelect() {
    const router = useRouter();
    const insets = useSafeAreaInsets();

    return (
        <View className="flex-1 bg-gray-50">
            {/* Header */}
            <View
                className="bg-purple-600 px-6 pb-8"
                style={{ paddingTop: insets.top + 8 }}
            >
                <TouchableOpacity
                    onPress={() => router.back()}
                    className="bg-purple-700 rounded-full p-2 mb-5 self-start"
                >
                    <Ionicons name="arrow-back" size={24} color="white" />
                </TouchableOpacity>
                <Text className="text-white text-3xl font-bold mb-1">Request a Loan</Text>
                <Text className="text-purple-200 text-base">
                    Choose the type of loan you need
                </Text>
            </View>

            {/* Cards */}
            <ScrollView
                className="flex-1 -mt-4 px-4 pt-2"
                showsVerticalScrollIndicator={false}
            >
                {LOAN_TYPES.map((item) => (
                    <TouchableOpacity
                        key={item.type}
                        onPress={() =>
                            router.push({
                                pathname: '/(tabs)/(Transactions)/applyLoan',
                                params: { type: item.type },
                            })
                        }
                        className="bg-white rounded-2xl shadow-sm border border-gray-100 mb-4 overflow-hidden"
                        style={{
                            shadowColor: item.color,
                            shadowOffset: { width: 0, height: 2 },
                            shadowOpacity: 0.12,
                            shadowRadius: 8,
                            elevation: 3,
                        }}
                        activeOpacity={0.82}
                    >
                        <View className="flex-row items-center p-5">
                            {/* Icon circle */}
                            <View
                                className="rounded-2xl p-4 mr-4"
                                style={{ backgroundColor: item.bg }}
                            >
                                <Ionicons name={item.icon} size={28} color={item.color} />
                            </View>

                            {/* Text */}
                            <View className="flex-1">
                                <View className="flex-row items-center justify-between mb-1">
                                    <Text className="text-lg font-bold text-gray-900">
                                        {item.type} Loan
                                    </Text>
                                    <View
                                        className="px-3 py-1 rounded-full"
                                        style={{ backgroundColor: item.bg }}
                                    >
                                        <Text className="text-xs font-semibold" style={{ color: item.color }}>
                                            {item.rate}
                                        </Text>
                                    </View>
                                </View>
                                <Text className="text-gray-500 text-sm leading-5">
                                    {item.description}
                                </Text>
                            </View>
                        </View>

                        {/* Bottom strip */}
                        <View
                            className="h-1 w-full"
                            style={{ backgroundColor: item.color, opacity: 0.25 }}
                        />
                    </TouchableOpacity>
                ))}

                <View className="h-6" />
            </ScrollView>
        </View>
    );
}
