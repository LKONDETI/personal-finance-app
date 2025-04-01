import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import Svg, { Circle } from "react-native-svg";
import * as Progress from "react-native-progress";
import { ArrowLeft } from "lucide-react-native";

interface BudgetItem {
  label: string;
  color: string;
  value: number;
  amount: string;
  status: string;
  textColor?: string;
  strokeDasharray?: string;
  strokeDashoffset?: number;
}

const budgetData: BudgetItem[] = [
  { label: "Food", color: "#4285F4", value: 0.6, amount: "$100 / $300", status: "Under" },
  { label: "Rent", color: "#8AB4F8", value: 1, amount: "$1,200 / $1,200", status: "On track" },
  { label: "Entertainment", color: "#F25C54", value: 1, amount: "$250 / $300", status: "Over", textColor: "text-red-500" },
  { label: "Other", color: "#9AA0A6", value: 0.4, amount: "$400 / $500", status: "Under" },
];

const calculatePieChartData = (data: BudgetItem[]): BudgetItem[] => {
  const total = data.length;
  const circumference = 251.2; // 2 * π * 40 (radius)
  let currentOffset = 0;
  
  return data.map((item: BudgetItem, index: number) => {
    const percentage = item.value;
    const strokeDasharray = `${(percentage * circumference) / total} ${circumference}`;
    const strokeDashoffset = -currentOffset;
    currentOffset += (percentage * circumference) / total;
    return {
      ...item,
      strokeDasharray,
      strokeDashoffset
    };
  });
};

export default function BudgetView() {
  const router = useRouter();
  const pieChartData = calculatePieChartData(budgetData);

  return (
    <ScrollView className="flex-1 p-4 bg-white">
      {/* Header */}
      <View className="flex-row items-center gap-2 mb-4">
        <TouchableOpacity onPress={() => router.back()} className="p-2"> 
          <ArrowLeft size={24} color="black" />
        </TouchableOpacity>
        <Text className="text-2xl font-bold">Budget</Text>
      </View>

      {/* Circular Progress Chart */}
      <View className="items-center py-4">
        <Svg height="150" width="150" viewBox="0 0 100 100">
          <Circle cx="50" cy="50" r="40" stroke="#e6e6e6" strokeWidth="10" fill="none" />
          {pieChartData.map((item: BudgetItem, index: number) => (
            <Circle
              key={index}
              cx="50"
              cy="50"
              r="40"
              stroke={item.color}
              strokeWidth="10"
              strokeDasharray={item.strokeDasharray}
              strokeDashoffset={item.strokeDashoffset}
              fill="none"
            />
          ))}
        </Svg>
      </View>

      {/* Budget Categories */}
      {budgetData.map((item: BudgetItem, index: number) => (
        <View key={index} className="mb-4 p-4 bg-gray-100 rounded-lg shadow-md">
          <View className="flex-row items-center gap-2 mb-2">
            <View className="h-3 w-3 rounded-full" style={{ backgroundColor: item.color }} />
            <Text className="font-medium">{item.label}</Text>
            <Text className={`ml-auto font-medium ${item.textColor || "text-black"}`}>{item.status}</Text>
          </View>
          <Progress.Bar progress={item.value} width={null} height={8} color={item.color} />
          <View className="flex-row justify-between mt-2">
            <Text className="text-sm text-gray-500">Budget</Text>
            <Text className="font-medium">{item.amount}</Text>
          </View>
        </View>
      ))}
    </ScrollView>
  );
}
