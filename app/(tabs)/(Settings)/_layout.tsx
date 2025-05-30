import { Stack } from 'expo-router';

export default function Layout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}>
      <Stack.Screen name="settings" />
      <Stack.Screen name="bankAccounts" />
      <Stack.Screen name="profile" />
      <Stack.Screen name="chatbot" />
      <Stack.Screen name="budgetLimits" />
    </Stack>
  );
}