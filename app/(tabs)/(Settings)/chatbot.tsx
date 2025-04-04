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
    <View style={{ flex: 1, padding: 20 }}>
      <ScrollView>
        <View className="p-4 flex-row items-center justify-row pt-10">
          <View className="flex-row items-center mb-4">
            <TouchableOpacity onPress={() => router.push('/(tabs)/(Settings)/settings')}>
              <ArrowLeft size={24} color="black" />
            </TouchableOpacity>
            <Bot size={24} color="black" />
          </View>
          <Text className="text-xl font-bold mb-4"> Chat with us</Text>
        </View>

        {messages.map((msg, index) => (
          <View key={index}>
            <Text style={{ fontWeight: 'bold' }}>You: {msg.user}</Text>
            <View style={{ 
              backgroundColor: '#f0f0f0',
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
        style={{ borderWidth: 1, borderColor: 'gray', padding: 10, marginBottom: 10 }}
      />
      <Button title="Send" onPress={handleSend} />
    </View>
  );
};

export default Chatbot;