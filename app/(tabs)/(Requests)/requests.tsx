import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert, RefreshControl } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft, Wifi, Phone, ShoppingBag, Receipt } from "lucide-react-native";
import { useState, useEffect, useCallback } from "react";
import { paymentRequests as prApi, accounts as accountsApi } from "@/services/api";
import type { PaymentRequest, Account } from "@/services/api";

// Status enum mapping (matches backend)
const STATUS = { Pending: 0, Paid: 1, PartiallyPaid: 2, Declined: 3, Overdue: 4 };

// Tab component
const Tab = ({ label, isActive, onPress }: { label: string; isActive: boolean; onPress: () => void }) => (
  <TouchableOpacity 
    onPress={onPress} 
    className={`flex-1 py-3 ${isActive ? "border-b-2 border-blue-500" : ""}`}
  >
    <Text className={`text-center ${isActive ? "text-blue-500 font-medium" : "text-gray-500"}`}>
      {label}
    </Text>
  </TouchableOpacity>
);

// Badge component
const Badge = ({ variant, children }: { variant: 'due3days' | 'dueToday' | 'due7days' | 'paid' | 'partial' | 'declined'; children: string }) => {
  const styles: Record<string, string> = {
    due3days: "bg-yellow-50 text-yellow-700 border border-yellow-200",
    dueToday: "bg-red-50 text-red-700 border border-red-200",
    due7days: "bg-blue-50 text-blue-700 border border-blue-200",
    paid: "bg-green-50 text-green-700 border border-green-200",
    partial: "bg-orange-50 text-orange-700 border border-orange-200",
    declined: "bg-gray-50 text-gray-500 border border-gray-200",
  };

  return (
    <View className={`px-2 py-1 rounded-full ${styles[variant] || styles.due7days}`}>
      <Text className="text-xs font-medium">{children}</Text>
    </View>
  );
};

// Get icon and badge info based on payee category
const getPayeeIcon = (category: string) => {
  if (category.toLowerCase().includes('electric') || category.toLowerCase().includes('water'))
    return { icon: Wifi, bg: "bg-blue-100", color: "#3B82F6" };
  if (category.toLowerCase().includes('plan') || category.toLowerCase().includes('phone'))
    return { icon: Phone, bg: "bg-purple-100", color: "#8B5CF6" };
  if (category.toLowerCase().includes('subscription') || category.toLowerCase().includes('box'))
    return { icon: ShoppingBag, bg: "bg-green-100", color: "#10B981" };
  return { icon: Receipt, bg: "bg-gray-100", color: "#6B7280" };
};

const getDueBadge = (request: PaymentRequest): { text: string; variant: 'due3days' | 'dueToday' | 'due7days' | 'paid' | 'partial' | 'declined' } => {
  if (request.status === STATUS.Paid) return { text: "Paid", variant: "paid" };
  if (request.status === STATUS.PartiallyPaid) return { text: "Partially Paid", variant: "partial" };
  if (request.status === STATUS.Declined) return { text: "Declined", variant: "declined" };

  const now = new Date();
  const due = new Date(request.dueDate);
  const diffDays = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays <= 0) return { text: "Due today", variant: "dueToday" };
  if (diffDays <= 3) return { text: `Due in ${diffDays} day${diffDays > 1 ? 's' : ''}`, variant: "due3days" };
  return { text: `Due in ${diffDays} days`, variant: "due7days" };
};

export default function RequestsView() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState("pending");
  const [pendingRequests, setPendingRequests] = useState<PaymentRequest[]>([]);
  const [completedRequests, setCompletedRequests] = useState<PaymentRequest[]>([]);
  const [userAccounts, setUserAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const [pending, paid, declined, partial, accts] = await Promise.all([
        prApi.getAll("Pending"),
        prApi.getAll("Paid"),
        prApi.getAll("Declined"),
        prApi.getAll("PartiallyPaid"),
        accountsApi.getAll(),
      ]);
      setPendingRequests([...pending, ...partial]);
      setCompletedRequests([...paid, ...declined]);
      setUserAccounts(accts);
    } catch (error) {
      console.error("Error fetching payment requests:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchData();
  }, [fetchData]);

  const getDefaultAccountId = (): number | null => {
    const active = userAccounts.filter(a => a.status === 'Active' || a.status === '0');
    return active.length > 0 ? active[0].id : null;
  };

  const handlePayFull = async (request: PaymentRequest) => {
    const accountId = getDefaultAccountId();
    if (!accountId) {
      Alert.alert("Error", "No active account found to make payment.");
      return;
    }

    Alert.alert(
      "Confirm Payment",
      `Pay $${(request.amount - request.amountPaid).toFixed(2)} to ${request.payeeName}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Pay Now",
          onPress: async () => {
            setActionLoading(request.id);
            try {
              await prApi.payFull(request.id, accountId);
              Alert.alert("Success", `Payment of $${(request.amount - request.amountPaid).toFixed(2)} to ${request.payeeName} completed!`);
              fetchData();
            } catch (error: any) {
              Alert.alert("Payment Failed", error.response?.data?.message || error.message || "Something went wrong");
            } finally {
              setActionLoading(null);
            }
          },
        },
      ]
    );
  };

  const handlePayPartial = async (request: PaymentRequest) => {
    const accountId = getDefaultAccountId();
    if (!accountId) {
      Alert.alert("Error", "No active account found to make payment.");
      return;
    }

    const remaining = request.amount - request.amountPaid;
    const halfAmount = Math.round(remaining * 50) / 100; // 50% rounded to cents

    Alert.alert(
      "Partial Payment",
      `Pay 50% ($${halfAmount.toFixed(2)}) of the remaining $${remaining.toFixed(2)} to ${request.payeeName}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Pay Half",
          onPress: async () => {
            setActionLoading(request.id);
            try {
              await prApi.payPartial(request.id, accountId, halfAmount);
              Alert.alert("Success", `Partial payment of $${halfAmount.toFixed(2)} to ${request.payeeName} completed!`);
              fetchData();
            } catch (error: any) {
              Alert.alert("Payment Failed", error.response?.data?.message || error.message || "Something went wrong");
            } finally {
              setActionLoading(null);
            }
          },
        },
      ]
    );
  };

  const handleDecline = async (request: PaymentRequest) => {
    Alert.alert(
      "Decline Request",
      `Are you sure you want to decline the payment to ${request.payeeName}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Decline",
          style: "destructive",
          onPress: async () => {
            setActionLoading(request.id);
            try {
              await prApi.decline(request.id);
              Alert.alert("Declined", `Payment request from ${request.payeeName} has been declined.`);
              fetchData();
            } catch (error: any) {
              Alert.alert("Error", error.response?.data?.message || error.message || "Something went wrong");
            } finally {
              setActionLoading(null);
            }
          },
        },
      ]
    );
  };

  const renderRequestCard = (request: PaymentRequest, showActions: boolean) => {
    const { icon: Icon, bg, color } = getPayeeIcon(request.payeeCategory);
    const badge = getDueBadge(request);
    const isProcessing = actionLoading === request.id;
    const remaining = request.amount - request.amountPaid;
    const dateLabel = request.status === STATUS.Paid ? "Paid on" : "Due Date";
    const dateValue = request.status === STATUS.Paid && request.paidDate
      ? new Date(request.paidDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
      : new Date(request.dueDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

    return (
      <View key={request.id} className="bg-white rounded-xl overflow-hidden mb-4 shadow-sm">
        <View className="p-4 flex-row items-center justify-between">
          <View className="flex-row items-center gap-3">
            <View className={`h-10 w-10 items-center justify-center rounded-md ${bg}`}>
              <Icon size={20} color={color} />
            </View>
            <View>
              <Text className="font-medium text-base">{request.payeeName}</Text>
              <Text className="text-sm text-gray-500">{request.payeeCategory}</Text>
            </View>
          </View>
          <Badge variant={badge.variant}>{badge.text}</Badge>
        </View>

        <View className="bg-gray-50 p-4">
          <View className="flex-row justify-between mb-2">
            <Text className="text-sm text-gray-500">Amount</Text>
            <Text className="font-medium">${request.amount.toFixed(2)}</Text>
          </View>
          {request.amountPaid > 0 && request.status !== STATUS.Paid && (
            <View className="flex-row justify-between mb-2">
              <Text className="text-sm text-gray-500">Remaining</Text>
              <Text className="font-medium text-orange-600">${remaining.toFixed(2)}</Text>
            </View>
          )}
          <View className="flex-row justify-between mb-4">
            <Text className="text-sm text-gray-500">{dateLabel}</Text>
            <Text className="font-medium">{dateValue}</Text>
          </View>

          {showActions && !isProcessing && (
            <View className="flex-row gap-2">
              <TouchableOpacity
                className="flex-1 bg-blue-500 py-2 rounded-lg"
                onPress={() => router.push(`/payNow?requestId=${request.id}`)}
              >
                <Text className="text-white text-center text-xs font-medium">Pay Now</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="flex-1 border border-gray-200 py-2 rounded-lg"
                onPress={() => handlePayPartial(request)}
              >
                <Text className="text-center text-xs">Partial Pay</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="flex-1 border border-gray-200 py-2 rounded-lg"
                onPress={() => handleDecline(request)}
              >
                <Text className="text-red-500 text-center text-xs">Decline</Text>
              </TouchableOpacity>
            </View>
          )}
          {isProcessing && (
            <View className="py-2">
              <ActivityIndicator size="small" color="#3B82F6" />
            </View>
          )}
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text className="mt-4 text-gray-500">Loading requests...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      className="flex-1 bg-white"
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <View className="p-4">
        {/* Header */}
        <View className="flex-row items-center" style={{ paddingTop: insets.top + 8 }}>
          <TouchableOpacity className="bg-gray-100 rounded-full p-2 border border-gray-200" onPress={() => router.back()}>
            <ArrowLeft size={24} color="black" />
          </TouchableOpacity>
          <Text className="text-2xl font-bold ml-4">Requests</Text>
        </View>

        {/* Tabs */}
        <View className="flex-row mb-4 border-b border-gray-200">
          <Tab
            label={`Pending (${pendingRequests.length})`}
            isActive={activeTab === "pending"}
            onPress={() => setActiveTab("pending")}
          />
          <Tab
            label={`Completed (${completedRequests.length})`}
            isActive={activeTab === "completed"}
            onPress={() => setActiveTab("completed")}
          />
        </View>

        {/* Content */}
        {activeTab === "pending" ? (
          <View>
            {pendingRequests.length === 0 ? (
              <View className="py-12 items-center">
                <Text className="text-gray-400 text-lg">No pending requests</Text>
                <Text className="text-gray-400 text-sm mt-1">You're all caught up! 🎉</Text>
              </View>
            ) : (
              pendingRequests.map(r => renderRequestCard(r, true))
            )}
          </View>
        ) : (
          <View>
            {completedRequests.length === 0 ? (
              <View className="py-12 items-center">
                <Text className="text-gray-400 text-lg">No completed requests yet</Text>
              </View>
            ) : (
              completedRequests.map(r => renderRequestCard(r, false))
            )}
          </View>
        )}
      </View>
    </ScrollView>
  );
}
