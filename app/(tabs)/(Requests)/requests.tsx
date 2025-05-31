import { View, Text, ScrollView, TouchableOpacity, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { ArrowLeft, Wifi, Phone, ShoppingBag } from "lucide-react-native";
import { useState } from "react";

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
const Badge = ({ variant, children }: { variant: 'due3days' | 'dueToday' | 'due7days' | 'paid'; children: string }) => {
  const styles = {
    due3days: "bg-yellow-50 text-yellow-700 border border-yellow-200",
    dueToday: "bg-red-50 text-red-700 border border-red-200",
    due7days: "bg-blue-50 text-blue-700 border border-blue-200",
    paid: "bg-green-50 text-green-700 border border-green-200",
  };

  return (
    <View className={`px-2 py-1 rounded-full ${styles[variant]}`}>
      <Text className="text-xs font-medium">{children}</Text>
    </View>
  );
};

// Request Card component
const RequestCard = ({ 
  icon: Icon, 
  iconBg, 
  iconColor, 
  title, 
  subtitle, 
  status, 
  statusVariant, 
  amount, 
  date, 
  dateLabel, 
  showActions,
  router 
}: {
  icon: any;
  iconBg: string;
  iconColor: string;
  title: string;
  subtitle: string;
  status: string;
  statusVariant: 'due3days' | 'dueToday' | 'due7days' | 'paid';
  amount: string;
  date: string;
  dateLabel: string;
  showActions?: boolean;
  router?: any;
}) => (
  <View className="bg-white rounded-xl overflow-hidden mb-4 shadow-sm">
    <View className="p-4 flex-row items-center justify-between">
      <View className="flex-row items-center gap-3">
        <View className={`h-10 w-10 items-center justify-center rounded-md ${iconBg}`}>
          <Icon size={20} color={iconColor} />
        </View>
        <View>
          <Text className="font-medium text-base">{title}</Text>
          <Text className="text-sm text-gray-500">{subtitle}</Text>
        </View>
      </View>
      <Badge variant={statusVariant}>{status}</Badge>
    </View>
    
    <View className="bg-gray-50 p-4">
      <View className="flex-row justify-between mb-2">
        <Text className="text-sm text-gray-500">Amount</Text>
        <Text className="font-medium">{amount}</Text>
      </View>
      <View className="flex-row justify-between mb-4">
        <Text className="text-sm text-gray-500">{dateLabel}</Text>
        <Text className="font-medium">{date}</Text>
      </View>
      
      {showActions && (
        <View className="flex-row gap-2">
          <TouchableOpacity 
            className="flex-1 bg-blue-500 py-2 rounded-lg"
            onPress={() => router?.push('/payNow')}
          >
            <Text className="text-white text-center text-xs font-medium">Pay Now</Text>
          </TouchableOpacity>
          <TouchableOpacity className="flex-1 border border-gray-200 py-2 rounded-lg">
            <Text className="text-center text-xs">Partial Pay</Text>
          </TouchableOpacity>
          <TouchableOpacity className="flex-1 border border-gray-200 py-2 rounded-lg">
            <Text className="text-red-500 text-center text-xs">Decline</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  </View>
);

export default function RequestsView() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("pending");

  type RequestData = {
    icon: any;
    iconBg: string;
    iconColor: string;
    title: string;
    subtitle: string;
    status: string;
    statusVariant: 'due3days' | 'dueToday' | 'due7days' | 'paid';
    amount: string;
    date: string;
    dateLabel: string;
  };

  const pendingRequests: RequestData[] = [
    {
      icon: Wifi,
      iconBg: "bg-blue-100",
      iconColor: "#3B82F6",
      title: "City Utilities",
      subtitle: "Water & Electricity",
      status: "Due in 3 days",
      statusVariant: "due3days",
      amount: "$142.50",
      date: "June 25, 2025",
      dateLabel: "Due Date",
    },
    {
      icon: Phone,
      iconBg: "bg-purple-100",
      iconColor: "#8B5CF6",
      title: "MobileNet",
      subtitle: "Monthly Plan",
      status: "Due today",
      statusVariant: "dueToday",
      amount: "$79.99",
      date: "June 22, 2025",
      dateLabel: "Due Date",
    },
    {
      icon: ShoppingBag,
      iconBg: "bg-green-100",
      iconColor: "#10B981",
      title: "EcoMarket",
      subtitle: "Subscription Box",
      status: "Due in 7 days",
      statusVariant: "due7days",
      amount: "$45.00",
      date: "June 29, 2025",
      dateLabel: "Due Date",
    },
  ];

  const paidRequests: RequestData[] = [
    {
      icon: Wifi,
      iconBg: "bg-gray-100",
      iconColor: "#6B7280",
      title: "City Utilities",
      subtitle: "Water & Electricity",
      status: "Paid",
      statusVariant: "paid",
      amount: "$138.75",
      date: "May 25, 2025",
      dateLabel: "Paid on",
    },
    {
      icon: Phone,
      iconBg: "bg-gray-100",
      iconColor: "#6B7280",
      title: "MobileNet",
      subtitle: "Monthly Plan",
      status: "Paid",
      statusVariant: "paid",
      amount: "$79.99",
      date: "May 22, 2025",
      dateLabel: "Paid on",
    },
  ];

  return (
    <ScrollView className="flex-1 bg-white">
      <View className="p-4">
        {/* Header */}
        <View className="flex-row items-center gap-2 mb-6 pt-8">
          <TouchableOpacity onPress={() => router.back()} className="p-2">
            <ArrowLeft size={24} color="black" />
          </TouchableOpacity>
          <Text className="text-2xl font-bold">Requests</Text>
        </View>

        {/* Tabs */}
        <View className="flex-row mb-4 border-b border-gray-200">
          <Tab 
            label="Pending" 
            isActive={activeTab === "pending"} 
            onPress={() => setActiveTab("pending")} 
          />
          <Tab 
            label="Paid" 
            isActive={activeTab === "paid"} 
            onPress={() => setActiveTab("paid")} 
          />
        </View>

        {/* Content */}
        {activeTab === "pending" ? (
          <View>
            {pendingRequests.map((request, index) => (
              <RequestCard key={index} {...request} showActions router={router} />
            ))}
          </View>
        ) : (
          <View>
            {paidRequests.map((request, index) => (
              <RequestCard key={index} {...request} router={router} />
            ))}
          </View>
        )}
      </View>
    </ScrollView>
  );
}
