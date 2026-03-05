import { Stack } from "expo-router";
import React from 'react';

export default function RootLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="dashboard" />
      <Stack.Screen name="accountDetails" />
      <Stack.Screen name="allLoans" />
      <Stack.Screen name="applyLoan" />
      <Stack.Screen name="loanSelect" />
      <Stack.Screen name="loanDetails" />
    </Stack>
  );
}
