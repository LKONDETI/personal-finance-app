import { View, Text, TextInput, FlatList, TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { ArrowLeft, MoreVertical, ShoppingBag, Home, ShoppingCart, Coffee } from "lucide-react-native";

const transactions = [
  { id: "1", category: "Groceries", date: "Apr 21", amount: "$150", icon: ShoppingBag, bg: "bg-gray-100", color: "text-gray-500" },
  { id: "2", category: "Rent", date: "Apr 20", amount: "$1,200", icon: Home, bg: "bg-orange-100", color: "text-orange-500" },
  { id: "3", category: "Shopping", date: "Apr 16", amount: "$80", icon: ShoppingCart, bg: "bg-blue-100", color: "text-blue-500" },
  { id: "4", category: "Coffee", date: "Apr 14", amount: "$12", icon: Coffee, bg: "bg-purple-100", color: "text-purple-500" }
];

export default function TransactionsView() {
  const navigation = useNavigation();
  
  return (
    <View className="p-4 space-y-6"> 
      <View className="flex-row justify-between items-center"> 
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <ArrowLeft size={24} />
        </TouchableOpacity>
        <Text className="text-2xl font-bold">Transactions</Text>
        <MoreVertical size={24} />
      </View>
      
      <TextInput
        placeholder="Search transactions"
        className="border rounded-full px-4 py-2 bg-gray-100"
      />
      
      <FlatList
        data={transactions}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity className="flex-row justify-between items-center p-4 border-b"> 
            <View className="flex-row items-center gap-3"> 
              <View className={`${item.bg} p-2 rounded-md`}>
                <item.icon size={24} className={item.color} />
              </View>
              <View>
                <Text className="font-medium">{item.category}</Text>
                <Text className="text-gray-500 text-sm">{item.date}</Text>
              </View>
            </View>
            <Text className="font-semibold">{item.amount}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}
