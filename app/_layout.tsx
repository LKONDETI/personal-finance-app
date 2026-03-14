import { Stack, useRouter } from "expo-router";
import { useColorScheme } from '@/hooks/useColorScheme';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useEffect } from 'react';
import * as Notifications from 'expo-notifications';
import { requestNotificationPermissions } from '@/services/NotificationService';
import { PrivacyProvider } from '@/context/PrivacyContext';
import '../global.css';

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const router = useRouter();

  useEffect(() => {
    // Request notification permissions once on app launch
    requestNotificationPermissions();

    // Navigate when user taps a notification
    const sub = Notifications.addNotificationResponseReceivedListener(response => {
      const data = response.notification.request.content.data as Record<string, string>;
      if (data?.screen === 'budget') router.push('/(tabs)/(Budget)/budget' as any);
      else if (data?.screen === 'accountDetails') router.push('/(tabs)/(Transactions)/accountDetails' as any);
      else if (data?.screen === 'allLoans') router.push('/(tabs)/(Transactions)/allLoans' as any);
    });

    return () => sub.remove();
  }, []);

  return (
    <PrivacyProvider>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack>
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="+not-found" />
        </Stack>
      </ThemeProvider>
    </PrivacyProvider>
  );
}
