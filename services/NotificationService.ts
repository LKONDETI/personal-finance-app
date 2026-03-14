import * as Notifications from 'expo-notifications';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import type { Loan } from '@/services/api';

const NOTIFICATIONS_ENABLED_KEY = 'notifications_enabled';

// Configure how notifications appear when the app is in the foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

// ─── Permission ───────────────────────────────────────────────────────────────

export async function requestNotificationPermissions(): Promise<boolean> {
  if (Platform.OS === 'web') return false;

  const { status: existing } = await Notifications.getPermissionsAsync();
  if (existing === 'granted') return true;

  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

// ─── Preferences ─────────────────────────────────────────────────────────────

export async function areNotificationsEnabled(): Promise<boolean> {
  try {
    const stored = await SecureStore.getItemAsync(NOTIFICATIONS_ENABLED_KEY);
    return stored !== 'false'; // default to true
  } catch {
    return true;
  }
}

export async function setNotificationsEnabled(enabled: boolean): Promise<void> {
  await SecureStore.setItemAsync(NOTIFICATIONS_ENABLED_KEY, enabled ? 'true' : 'false');
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

async function sendNotification(title: string, body: string, data?: Record<string, string>) {
  const enabled = await areNotificationsEnabled();
  if (!enabled) return;

  await Notifications.scheduleNotificationAsync({
    content: { title, body, data: data ?? {}, sound: true },
    trigger: null, // fire immediately
  });
}

// ─── Notification Types ───────────────────────────────────────────────────────

/**
 * Over-budget alert — fires when a category reaches >= threshold% of its limit.
 * Call after computing category spending. Pass threshold as 0.8 for 80%.
 */
export async function checkAndSendBudgetAlert(
  category: string,
  spent: number,
  limit: number,
  threshold = 0.8
) {
  if (limit <= 0 || spent <= 0) return;
  const ratio = spent / limit;

  if (ratio >= 1) {
    await sendNotification(
      '🚨 Budget Exceeded!',
      `${category} is over budget — $${spent.toFixed(2)} spent of $${limit.toFixed(2)} limit.`,
      { screen: 'budget', category }
    );
  } else if (ratio >= threshold) {
    await sendNotification(
      `⚠️ ${category} Budget Alert`,
      `You've used ${Math.round(ratio * 100)}% of your ${category} budget ($${spent.toFixed(2)} of $${limit.toFixed(2)}).`,
      { screen: 'budget', category }
    );
  }
}

/**
 * Large transaction alert — fires when a single debit exceeds the threshold.
 * Default threshold: $200.
 */
export async function sendLargeTransactionAlert(
  description: string,
  amount: number,
  accountName: string,
  threshold = 200
) {
  if (amount < threshold) return;
  await sendNotification(
    '💸 Large Transaction Detected',
    `$${amount.toFixed(2)} debited for "${description}" from ${accountName}.`,
    { screen: 'accountDetails' }
  );
}

/**
 * Loan payment reminder — fires if the next payment is due within `daysAhead` days.
 * Assumes monthly payments; uses the application date's day-of-month as recurring day.
 */
export async function checkAndSendLoanReminder(loan: Loan, daysAhead = 3) {
  if (loan.status.toLowerCase() !== 'active') return;

  const today = new Date();
  const dueDay = new Date(loan.applicationDate).getDate();

  // Find the next due date
  const nextDue = new Date(today.getFullYear(), today.getMonth(), dueDay);
  if (nextDue < today) nextDue.setMonth(nextDue.getMonth() + 1);

  const diffMs = nextDue.getTime() - today.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays <= daysAhead) {
    await sendNotification(
      '📅 Loan Payment Due Soon',
      `Your ${loan.loanType} loan payment of $${loan.monthlyPayment.toFixed(2)} is due in ${diffDays} day${diffDays !== 1 ? 's' : ''}.`,
      { screen: 'allLoans', loanId: loan.id.toString() }
    );
  }
}
