import { Tabs } from 'expo-router';
import React from 'react';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import Ionicons from '@expo/vector-icons/Ionicons';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  return (
    <Tabs screenOptions={{
      tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
      headerShown: false,
      }}>
      <Tabs.Screen name="(Transactions)"
      options={{title: 'Transactions', tabBarIcon: ({ color, focused }) => (
        <Ionicons name={focused ? 'briefcase-outline' : 'briefcase-outline'} color={color} size={24} />
      )}}
       />
      <Tabs.Screen name="(Budget)"
      options={{title: 'Budget', tabBarIcon: ({ color, focused }) => (
        <Ionicons name={focused ? 'document-text-outline' : 'document-text-outline'} color={color} size={24}/>
      )}}
      />
      <Tabs.Screen name="(Requests)"
      options={{title: 'Requests', tabBarIcon: ({ color, focused }) => (
        <Ionicons name={focused ? 'notifications-outline' : 'notifications-outline'} color={color} size={24}/>
      )}}
      />
      <Tabs.Screen name="(Settings)"
      options={{title: 'Settings', tabBarIcon: ({ color, focused }) => (
        <Ionicons name={focused ? 'settings-outline' : 'settings-outline'} color={color} size={24}/>
      )}}
      />
    </Tabs>
  );
}


