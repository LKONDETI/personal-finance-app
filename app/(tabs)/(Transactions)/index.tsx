import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Card } from 'react-native-paper';
import Icon from 'react-native-vector-icons/Feather';

export default function Dashboard() {
  const navigation = useNavigation();

  return (
    <ScrollView className="p-4 bg-white">
      <View className="flex-row items-center justify-between mb-4">
        <Text className="text-2xl font-bold">Dashboard</Text>
        <Icon name="file-text" size={24} />
      </View>
      
      <View className="mb-4">
        <Text className="text-sm text-gray-500">Total balance</Text>
        <Text className="text-4xl font-bold">$3,200</Text>
      </View>
      
      <View className="flex-row justify-between mb-4">
        <View>
          <Text className="text-sm text-gray-500">Income</Text>
          <Text className="text-xl font-bold">$1,800</Text>
        </View>
        <View>
          <Text className="text-sm text-gray-500">Expenses</Text>
          <Text className="text-xl font-bold">$1,800</Text>
        </View>
      </View>

      <Text className="text-lg font-semibold mb-2">Recent Transactions</Text>
      {[ 
        { id: 1, name: 'Groceries', date: 'Apr 21', amount: '$150', icon: 'shopping-bag', color: 'orange' },
        { id: 2, name: 'Rent', date: 'Apr 20', amount: '$1,200', icon: 'home', color: 'blue' },
        { id: 3, name: 'Movies', date: 'Apr 16', amount: '$40', icon: 'film', color: 'teal' },
        { id: 4, name: 'Electric Bill', date: 'Apr 18', amount: '$100', icon: 'zap', color: 'yellow' },
      ].map((item) => (
        <Card key={item.id} className="mb-2 p-4 flex-row justify-between items-center">
          <View className="flex-row items-center gap-3">
            <View className={`h-10 w-10 items-center justify-center rounded-md bg-${item.color}-100`}>
              <Icon name={item.icon} size={20} color={item.color} />
            </View>
            <View>
              <Text className="font-medium">{item.name}</Text>
              <Text className="text-sm text-gray-500">{item.date}</Text>
            </View>
          </View>
          <Text className="font-semibold">{item.amount}</Text>
        </Card>
      ))}
      
    </ScrollView>
  );
}