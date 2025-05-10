import { Stack } from 'expo-router';

export default function Layout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}>
      {/* No navigation logic or buttons here */}
    </Stack>
  );
}
