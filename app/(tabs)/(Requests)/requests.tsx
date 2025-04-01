import React from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";
import { Button, Card, Badge } from "react-native-paper";

const RequestsView = () => {
  const navigation = useNavigation();
  return (
    <ScrollView style={{ padding: 16 }}>
      <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 16 }}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Feather name="arrow-left" size={24} color="black" />
        </TouchableOpacity>
        <Text style={{ fontSize: 20, fontWeight: "bold", marginLeft: 8 }}>Requests</Text>
      </View>

      <Card style={{ marginBottom: 16 }}>
        <Card.Content>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Feather name="wifi" size={24} color="#007AFF" style={{ marginRight: 8 }} />
              <View>
                <Text style={{ fontWeight: "bold" }}>City Utilities</Text>
                <Text style={{ color: "gray" }}>Water & Electricity</Text>
              </View>
            </View>
            <Badge style={{ backgroundColor: "#FFEB3B" }}>Due in 3 days</Badge>
          </View>
          <View style={{ marginTop: 16, backgroundColor: "#F3F4F6", padding: 10, borderRadius: 5 }}>
            <Text>Amount: $142.50</Text>
            <Text>Due Date: Apr 25, 2024</Text>
          </View>
          <View style={{ flexDirection: "row", marginTop: 10, justifyContent: "space-between" }}>
            <Button mode="contained" onPress={() => {}}>Pay Now</Button>
            <Button mode="outlined" onPress={() => {}}>Partial Pay</Button>
            <Button mode="outlined" color="red" onPress={() => {}}>Decline</Button>
          </View>
        </Card.Content>
      </Card>

      {/* Add more cards for other requests similarly */}
    </ScrollView>
  );
};

export default RequestsView;
