import { router } from 'expo-router';
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { ArrowLeft, Bot, Send, BotMessageSquare, User } from 'lucide-react-native';
import axios from 'axios';

const Chatbot = () => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<{ user: string; bot: string }[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim()) return;
    
    const userMessage = input;
    setMessages(prev => [...prev, { user: userMessage, bot: '' }]);
    setInput('');
    setIsLoading(true);

    try {
      const apiKey = process.env.EXPO_PUBLIC_CHATBOT_API_KEY;
      const apiUrl = process.env.EXPO_PUBLIC_CHATBOT_API_URL;
      
      if (!apiUrl) {
        throw new Error('API URL not configured');
      }
      
      const response = await axios.post(apiUrl, { 
        message: userMessage,
        context: "You are a financial advisor AI assistant. Help users with budgeting, savings, and investment advice."
      });
      
      setMessages(prev => {
        const updatedMessages = [...prev];
        updatedMessages[updatedMessages.length - 1].bot = response.data.reply;
        return updatedMessages;
      });
    } catch (error) {
      setMessages(prev => {
        const updatedMessages = [...prev];
        updatedMessages[updatedMessages.length - 1].bot = "I apologize, but I'm having trouble connecting right now. Please try again later.";
        return updatedMessages;
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-white"
    >
      <ScrollView className="flex-1 px-4">
        {/* Header */}
        <View className="flex-row items-center pt-16">
          <TouchableOpacity className="bg-gray-100 rounded-full p-2 border border-gray-200" onPress={() => router.back()}>
            <ArrowLeft size={24} color="black" />
          </TouchableOpacity>
          <Text className="text-2xl font-bold ml-4">AI Assistant</Text>
        </View>

        {/* Info Box */}
        <View className="bg-blue-50 rounded-xl p-4 mb-6 shadow-sm">
          <Text className="text-lg font-semibold mb-2">How can I help you?</Text>
          <Text className="text-gray-600 mb-1">Ask me about:</Text>
          <View className="ml-2">
            <Text className="text-gray-600">• Budgeting tips and strategies</Text>
            <Text className="text-gray-600">• Expense tracking and categorization</Text>
            <Text className="text-gray-600">• Savings goals and recommendations</Text>
            <Text className="text-gray-600">• Investment basics and advice</Text>
            <Text className="text-gray-600">• Debt management strategies</Text>
          </View>
        </View>

        {/* Messages */}
        {messages.map((msg, index) => (
          <View key={index} className="mb-4">
            {/* User Message */}
            <View className="flex-row items-start justify-end mb-2">
              <View className="bg-blue-500 rounded-2xl px-4 py-2 max-w-[80%]">
                <Text className="text-white">{msg.user}</Text>
              </View>
              <View className="w-8 h-8 bg-gray-200 rounded-full ml-2 items-center justify-center">
                <User size={20} color="gray" />
              </View>
            </View>

            {/* Bot Message */}
            <View className="flex-row items-start">
              <View className="w-8 h-8 bg-blue-100 rounded-full mr-2 items-center justify-center">
                <BotMessageSquare size={20} color="#3b82f6" />
              </View>
              <View className="bg-gray-100 rounded-2xl px-4 py-2 max-w-[80%]">
                <Text className="text-gray-800">
                  {msg.bot || (isLoading ? "Thinking..." : "...")}
                </Text>
              </View>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Input Area */}
      <View className="p-4 border-t border-gray-200">
        <View className="flex-row items-center bg-gray-100 rounded-full px-4 py-2">
          <TextInput
            value={input}
            onChangeText={setInput}
            placeholder="Ask about your finances..."
            className="flex-1 mr-2"
            multiline
            maxLength={500}
            onSubmitEditing={handleSend}
          />
          <TouchableOpacity 
            onPress={handleSend}
            disabled={isLoading || !input.trim()}
            className={`p-2 rounded-full ${!input.trim() ? 'opacity-50' : ''}`}
          >
            <Send size={24} color="#3b82f6" />
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

export default Chatbot;