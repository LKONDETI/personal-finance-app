import { router } from 'expo-router';
import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft, BotMessageSquare, Send, User } from 'lucide-react-native';
import { aiAdvisor } from '@/services/api';

// ── Types ─────────────────────────────────────────────────────────────────────

interface ChatMessage {
  user: string;
  bot: string;
  isMock?: boolean;
  isError?: boolean;
}

// ── Component ─────────────────────────────────────────────────────────────────

const Chatbot = () => {
  const insets = useSafeAreaInsets();
  const scrollRef = useRef<ScrollView>(null);

  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Auto-scroll to bottom whenever messages update
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setIsLoading(true);

    // Optimistically add the message with an empty bot slot
    setMessages(prev => [...prev, { user: userMessage, bot: '' }]);

    try {
      const result = await aiAdvisor.ask(userMessage);

      setMessages(prev => {
        const updated = [...prev];
        updated[updated.length - 1] = {
          user: userMessage,
          bot: result.answer,
          isMock: result.isMockResponse,
        };
        return updated;
      });
    } catch {
      setMessages(prev => {
        const updated = [...prev];
        updated[updated.length - 1] = {
          user: userMessage,
          bot: "I'm having trouble connecting right now. Please check your connection and try again.",
          isError: true,
        };
        return updated;
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-white"
    >
      <ScrollView
        ref={scrollRef}
        className="flex-1 px-4"
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View className="flex-row items-center" style={{ paddingTop: insets.top + 8 }}>
          <TouchableOpacity
            className="bg-gray-100 rounded-full p-2 border border-gray-200"
            onPress={() => router.back()}
            testID="back-button"
          >
            <ArrowLeft size={24} color="black" />
          </TouchableOpacity>
          <Text className="text-2xl font-bold ml-4">AI Advisor</Text>
        </View>

        {/* Info Box */}
        <View className="bg-blue-50 rounded-xl p-4 mb-6 mt-4 shadow-sm">
          <Text className="text-lg font-semibold mb-2">How can I help you?</Text>
          <Text className="text-gray-600 mb-1">Ask me about your finances:</Text>
          <View className="ml-2">
            <Text className="text-gray-600">• How am I doing this month?</Text>
            <Text className="text-gray-600">• Which category am I overspending in?</Text>
            <Text className="text-gray-600">• What's my net cash flow?</Text>
            <Text className="text-gray-600">• Tips for improving my budget</Text>
          </View>
        </View>

        {/* Messages */}
        {messages.map((msg, index) => (
          <View key={index} className="mb-4" testID={`message-${index}`}>
            {/* User bubble */}
            <View className="flex-row items-start justify-end mb-2">
              <View className="bg-blue-500 rounded-2xl px-4 py-2 max-w-[80%]">
                <Text className="text-white">{msg.user}</Text>
              </View>
              <View className="w-8 h-8 bg-gray-200 rounded-full ml-2 items-center justify-center">
                <User size={20} color="gray" />
              </View>
            </View>

            {/* Bot bubble */}
            <View className="flex-row items-start">
              <View className="w-8 h-8 bg-blue-100 rounded-full mr-2 items-center justify-center">
                <BotMessageSquare size={20} color="#3b82f6" />
              </View>
              <View
                className={`rounded-2xl px-4 py-2 max-w-[80%] ${msg.isError ? 'bg-red-50' : 'bg-gray-100'}`}
                testID={`bot-bubble-${index}`}
              >
                {/* Bot reply or loading indicator */}
                {!msg.bot && isLoading && index === messages.length - 1 ? (
                  <ActivityIndicator size="small" color="#3b82f6" testID="loading-indicator" />
                ) : (
                  <Text className={`${msg.isError ? 'text-red-600' : 'text-gray-800'}`}>
                    {msg.bot}
                  </Text>
                )}

                {/* Mock mode badge */}
                {msg.isMock && !msg.isError && (
                  <View className="mt-1 bg-yellow-100 rounded-md px-2 py-0.5 self-start">
                    <Text className="text-yellow-700 text-xs" testID={`mock-badge-${index}`}>
                      Demo mode
                    </Text>
                  </View>
                )}
              </View>
            </View>
          </View>
        ))}

        {/* Bottom padding so last message clears the input bar */}
        <View className="h-4" />
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
            maxLength={1000}
            onSubmitEditing={handleSend}
            testID="chat-input"
          />
          <TouchableOpacity
            onPress={handleSend}
            disabled={isLoading || !input.trim()}
            className={`p-2 rounded-full ${(!input.trim() || isLoading) ? 'opacity-40' : ''}`}
            testID="send-button"
          >
            <Send size={24} color="#3b82f6" />
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

export default Chatbot;