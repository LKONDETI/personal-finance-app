import { Stack } from 'expo-router';

export default function Layout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}>
     
      <Stack.Screen name="requests" options={{}}/>
      <Stack.Screen name="payNow" options={{}}/>
    </Stack>
  );
}