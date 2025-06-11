import { View, Text, ScrollView, TouchableOpacity, Pressable } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import Svg, { Path, G, Text as SvgText } from "react-native-svg";
import * as Progress from "react-native-progress";
import { ArrowLeft } from "lucide-react-native";
import { useState, useEffect } from "react";
import categoryMappings from '@/data/categoryMappings.json';
import transactionsData from '@/data/transactions.json';

interface CategoryMapping {
  id: number;
  label: string;
  icon: string;
  color: string;
  limit: string;
  transactions: string[];
}

interface BudgetItem {
  label: string;
  color: string;
  value: number;
  amount: string;
  status: string;
  textColor?: string;
  limit: string;
  spent: string;
  startAngle?: number;
  endAngle?: number;
}

interface Transaction {
  id: number;
  name: string;
  date: string;
  amount: string;
  type: 'credit' | 'debit';
}

interface TransactionsData {
  transactions: Transaction[];
}

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
  const [budgetItems, setBudgetItems] = useState<BudgetItem[]>([]);
  const { party_id } = useLocalSearchParams();

  useEffect(() => {
    if (!party_id) {
      router.replace({ pathname: "/(tabs)/(Budget)/budget", params: { party_id: 1 } });
      return;
    }

    const processTransactions = () => {
      // Calculate category spending
      const amounts: { [key: string]: number } = {};
      
      (transactionsData as TransactionsData).transactions.forEach((transaction: Transaction) => {
        // Only process debit transactions for budget tracking
        if (transaction.type === 'debit') {
          const category = categoryMappings.categories.find(cat =>
            cat.transactions.some(t => 
              transaction.name.toLowerCase().includes(t.toLowerCase())
            )
          );

          if (category) {
            if (!amounts[category.label]) amounts[category.label] = 0;
            // Use absolute value for spending calculations
            amounts[category.label] += Math.abs(parseFloat(transaction.amount));
          }
        }
      });

      // Build budget items for the pie chart
      const updatedBudgetItems = categoryMappings.categories.map(cat => {
        const spent = amounts[cat.label] || 0;
        const limit = parseFloat(cat.limit);
        return {
          label: cat.label,
          color: cat.color,
          value: spent / limit,
          amount: `$${spent.toFixed(2)} / $${limit.toFixed(2)}`,
          status: spent >= limit ? 'Over' : 'Under',
          limit: limit.toString(),
          spent: spent.toString(),
          textColor: spent >= limit ? '#ef4444' : '#22c55e'
        };
      });

      setBudgetItems(updatedBudgetItems);
    };

    processTransactions();
  }, [party_id]);

  const calculatePieChartData = (data: BudgetItem[]): BudgetItem[] => {
    // Calculate total spent across all categories
    const totalSpent = data.reduce((sum, item) => sum + parseFloat(item.spent), 0);
    
    let currentAngle = 0;
    return data.map((item) => {
      const startAngle = currentAngle;
      // Calculate slice angle based on proportion of total spent
      const sliceAngle = (parseFloat(item.spent) / totalSpent) * 2 * Math.PI;
      const endAngle = startAngle + sliceAngle;
      currentAngle = endAngle;
      
      return {
        ...item,
        startAngle,
        endAngle
      };
    });
  };

  const pieChartData = calculatePieChartData(budgetItems);
  const totalSpent = budgetItems.reduce((sum, item) => sum + parseFloat(item.spent), 0);

  if (!party_id) {
    return <Text>Please select a party or log in.</Text>;
  }

  return (
    <ScrollView className="flex-1 p-4 bg-white">
      {/* Header */}
      <View className="flex-row items-center justify-between mb-4 pt-8">
        <View className="flex-row items-center gap-2">
          <TouchableOpacity onPress={() => router.back()} className="p-2"> 
            <ArrowLeft size={24} color="black" />
          </TouchableOpacity>
          <Text className="text-2xl font-bold">Budget</Text>
        </View>
      </View>
      <Text className="text-xl font-bold text-center text-gray-700">Total Spent: ${totalSpent.toFixed(2)}</Text>

      {/* Pie Chart */}
      {totalSpent > 0 && (
        <View className="items-center py-4">
          <Svg height="300" width="300" viewBox="-150 -150 300 300">
            <G>
              {pieChartData.map((item, index) => (
                <G key={index}>
                  <PieSlice
                    cx={0}
                    cy={0}
                    radius={120} 
                    startAngle={item.startAngle!}
                    endAngle={item.endAngle!}
                    color={item.color}
                    onPress={() => setActiveSlice(index)}
                    isActive={activeSlice === index}
                  />
                </G>
              ))}
            </G>
          </Svg>
          {/* Legend */}
          <View className="flex-row flex-wrap justify-center gap-2 mt-4 px-4">
            {pieChartData.map((item, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => setActiveSlice(index)}
                className="flex-row items-center px-3 py-1 rounded-full"
                style={{ 
                  backgroundColor: activeSlice === index ? item.color + '20' : 'transparent',
                  borderWidth: 1,
                  borderColor: item.color
                }}
              >
                <View className="h-3 w-3 rounded-full mr-2" style={{ backgroundColor: item.color }} />
                <Text className="text-sm" style={{ color: item.color }}>{item.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {/* Budget Categories */}
      {budgetItems.map((item: BudgetItem, index: number) => (
        <Pressable 
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
          <Progress.Bar 
            progress={parseFloat(item.spent) / parseFloat(item.limit)} 
            width={null} 
            height={8} 
            color={item.color} 
          />
          <View className="flex-row justify-between mt-2">
            <Text className="text-sm text-gray-500">Budget</Text>
            <Text className="font-medium">${parseFloat(item.spent).toFixed(2)} / ${parseFloat(item.limit).toFixed(2)}</Text>
          </View>
        </Pressable>
      ))}
    </ScrollView>
  );
}
