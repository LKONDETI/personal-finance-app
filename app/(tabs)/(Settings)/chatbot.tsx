import { router } from 'expo-router';
import React, { useState } from 'react';
import { View, Text, TextInput, Button, ScrollView, TouchableOpacity } from 'react-native';
import { ArrowLeft, Bot, BotMessageSquare } from 'lucide-react-native';
import axios from 'axios';

const Chatbot = () => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<{ user: string; bot: string }[]>([]);

  const handleSend = async () => {
    const userMessage = input;
    setMessages([...messages, { user: userMessage, bot: '' }]);
    setInput('');

    // chatbot API endpoint and with the correct API key from the .env file
    const apiKey = process.env.EXPO_PUBLIC_CHATBOT_API_KEY;
    const apiUrl = process.env.EXPO_PUBLIC_CHATBOT_API_URL;
    
    const response = await axios.post('YOUR_CHATBOT_API_URL', { message: userMessage });
    const botMessage = response.data.reply; 

    setMessages(prev => {
      const updatedMessages = [...prev];
      updatedMessages[updatedMessages.length - 1].bot = botMessage;
      return updatedMessages;
    });
  };

  return (
    <View className="flex-1 p-5 bg-white">
        <View className="flex-row items-center justify-row pt-10">
          <View className="flex-row items-center mb-4">
            <TouchableOpacity onPress={() => router.push('/(tabs)/(Settings)/settings')}>
              <ArrowLeft size={24} color="black" />
            </TouchableOpacity>
            <Bot size={24} color="black" />
          </View>
          <Text className="text-xl font-bold mb-4"> Chat with us</Text>
        </View>

      <ScrollView>
        <View className="border border-gray-300 rounded-lg p-4 mb-4 shadow-md">
        <Text className="font-bold text-lg">Ask Me Anything!</Text>
          <Text className="mt-2">This chatbot has limited access to the information in the app. It can help you with budgeting tips, expense tracking, financial advice, setting up limits, and general inquiries about personal finance</Text>
          <Text className="mt-2">Frequently asked questions:</Text>
          <Text className="mt-1">Tips on how to save money?</Text>
          <Text className="mt-1">How to track my expenses?</Text>
          <Text className="mt-1">How to set up limits?</Text>
          <Text className="mt-1">General inquiries about personal finance?</Text>
        </View>

        {messages.map((msg, index) => (
          <View key={index}>
            <Text style={{ fontWeight: 'bold' }}>You: {msg.user}</Text>
            <View style={{ 
              borderRadius: 8,
              padding: 10,
              marginVertical: 5,
              flexDirection: 'row',
              alignItems: 'center'
            }}>
              <BotMessageSquare size={20} color="gray" style={{ marginRight: 8 }} />
              <Text style={{ color: 'gray', flex: 1 }}>Bot: {msg.bot}</Text>
            </View>
          </View>
        ))}
      </ScrollView>
      <TextInput
        value={input}
        onChangeText={setInput}
        placeholder="Type your message..."
        className="border border-gray-300 p-2 mb-2"
      />
      <Button title="Send" onPress={handleSend} />
    </View>
  );
};

export default Chatbot;