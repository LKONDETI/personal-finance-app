import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import Svg, { Circle } from "react-native-svg";
import * as Progress from "react-native-progress";
import tw from "twrnc";
import { ArrowLeft } from "lucide-react-native";

export default function BudgetView() {
  const router = useRouter();

  return (
    <ScrollView style={tw`flex-1 p-4 bg-white`}>
      {/* Header */}
      <View style={tw`flex-row items-center gap-2 mb-4`}>
        <TouchableOpacity onPress={() => router.back()} style={tw`p-2`}> 
          <ArrowLeft size={24} color="black" />
        </TouchableOpacity>
        <Text style={tw`text-2xl font-bold`}>Budget</Text>
      </View>

      {/* Circular Progress Chart */}
      <View style={tw`items-center py-4`}>
        <Svg height="150" width="150" viewBox="0 0 100 100">
          <Circle cx="50" cy="50" r="40" stroke="#e6e6e6" strokeWidth="10" fill="none" />
          <Circle cx="50" cy="50" r="40" stroke="#4285F4" strokeWidth="10" strokeDasharray="150 251" fill="none" />
          <Circle cx="50" cy="50" r="40" stroke="#8AB4F8" strokeWidth="10" strokeDasharray="75 251" strokeDashoffset="-150" fill="none" />
          <Circle cx="50" cy="50" r="40" stroke="#F25C54" strokeWidth="10" strokeDasharray="25 251" strokeDashoffset="-225" fill="none" />
        </Svg>
      </View>

      {/* Budget Categories */}
      {[
        { label: "Food", color: "blue-500", value: 0.6, amount: "$400 / $300", status: "Under" },
        { label: "Rent", color: "blue-300", value: 1, amount: "$1,200 / $1,200", status: "On track" },
        { label: "Entertainment", color: "orange-500", value: 1, amount: "$250 / $300", status: "Over", textColor: "text-red-500" },
        { label: "Other", color: "gray-400", value: 0.4, amount: "$200 / $500", status: "Under" },
      ].map((item, index) => (
        <View key={index} style={tw`mb-4 p-4 bg-gray-100 rounded-lg shadow-md`}>
          <View style={tw`flex-row items-center gap-2 mb-2`}>
            <View style={tw`h-3 w-3 rounded-full bg-${item.color}`} />
            <Text style={tw`font-medium`}>{item.label}</Text>
            <Text style={tw`ml-auto font-medium ${item.textColor || "text-black"}`}>{item.status}</Text>
          </View>
          <Progress.Bar progress={item.value} width={null} height={8} color={tw.color(item.color)} />
          <View style={tw`flex-row justify-between mt-2`}>
            <Text style={tw`text-sm text-gray-500`}>Budget</Text>
            <Text style={tw`font-medium`}>{item.amount}</Text>
          </View>
        </View>
      ))}
    </ScrollView>
  );
}
