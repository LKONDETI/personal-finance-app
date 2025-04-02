import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import Svg, { Path, G, Text as SvgText } from "react-native-svg";
import * as Progress from "react-native-progress";
import { ArrowLeft } from "lucide-react-native";
import { useState } from "react";

interface BudgetItem {
  label: string;
  color: string;
  value: number;
  amount: string;
  status: string;
  textColor?: string;
  startAngle?: number;
  endAngle?: number;
}

const budgetData: BudgetItem[] = [
  { label: "Food", color: "#4285F4", value: 0.2, amount: "$100 / $300", status: "Under" },
  { label: "Rent", color: "#8AB4F8", value: 0.4, amount: "$1,200 / $1,200", status: "On track" },
  { label: "Entertainment", color: "#F25C54", value: 0.15, amount: "$250 / $300", status: "Over", textColor: "text-red-500" },
  { label: "Other", color: "#9AA0A6", value: 0.25, amount: "$400 / $500", status: "Under" },
];

const calculatePieChartData = (data: BudgetItem[]): BudgetItem[] => {
  let currentAngle = 0;
  return data.map((item) => {
    const startAngle = currentAngle;
    const sliceAngle = item.value * 2 * Math.PI;
    const endAngle = startAngle + sliceAngle;
    currentAngle = endAngle;
    
    return {
      ...item,
      startAngle,
      endAngle
    };
  });
};

const PieSlice = ({ 
  cx, 
  cy, 
  radius, 
  startAngle, 
  endAngle, 
  color, 
  onPress,
  isActive
}: { 
  cx: number; 
  cy: number; 
  radius: number; 
  startAngle: number; 
  endAngle: number; 
  color: string;
  onPress: () => void;
  isActive: boolean;
}) => {
  const largeArcFlag = endAngle - startAngle <= Math.PI ? "0" : "1";
  
  const x1 = cx + radius * Math.cos(startAngle);
  const y1 = cy + radius * Math.sin(startAngle);
  const x2 = cx + radius * Math.cos(endAngle);
  const y2 = cy + radius * Math.sin(endAngle);
  
  const d = `
    M ${cx} ${cy}
    L ${x1} ${y1}
    A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}
    Z
  `;

  return (
    <Path
      d={d}
      fill={color}
      opacity={isActive ? 1 : 0.7}
      onPress={onPress}
    />
  );
};

export default function BudgetView() {
  const router = useRouter();
  const [activeSlice, setActiveSlice] = useState<number | null>(null);
  const pieChartData = calculatePieChartData(budgetData);

  return (
    <ScrollView className="flex-1 p-4 bg-white">
      {/* Header */}
      <View className="flex-row items-center gap-2 mb-4 pt-8">
        <TouchableOpacity onPress={() => router.back()} className="p-2"> 
          <ArrowLeft size={24} color="black" />
        </TouchableOpacity>
        <Text className="text-2xl font-bold">Budget</Text>
      </View>

      {/* Pie Chart */}
      <View className="items-center py-4">
        <Svg height="200" width="200" viewBox="-100 -100 200 200">
          <G>
            {pieChartData.map((item, index) => (
              <PieSlice
                key={index}
                cx={0}
                cy={0}
                radius={80}
                startAngle={item.startAngle!}
                endAngle={item.endAngle!}
                color={item.color}
                onPress={() => setActiveSlice(index)}
                isActive={activeSlice === index}
              />
            ))}
            {activeSlice !== null && (
              <SvgText
                x="0"
                y="0"
                fontSize="12"
                fill="white"
                textAnchor="middle"
                alignmentBaseline="middle"
              >
                {pieChartData[activeSlice].label}
              </SvgText>
            )}
          </G>
        </Svg>
      </View>

      {/* Budget Categories */}
      {budgetData.map((item: BudgetItem, index: number) => (
        <TouchableOpacity 
          key={index} 
          className="mb-4 p-4 bg-gray-100 rounded-lg shadow-md"
          onPress={() => setActiveSlice(index)}
          style={{ opacity: activeSlice === null || activeSlice === index ? 1 : 0.7 }}
        >
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
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}
