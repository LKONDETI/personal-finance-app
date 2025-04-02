import { View, Text, TouchableOpacity, ScrollView, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import { Avatar } from '@/components/ui/avatar';

export default function PayNowScreen() {
  const router = useRouter();
  const currentDate = new Date();
  const futureDate = new Date();
  futureDate.setDate(currentDate.getDate() + 7); // Set to 7 days from now

  return (
    <ScrollView className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row items-center justify-between p-4 border-b border-gray-200">
        <Pressable onPress={() => router.push('/requests')}>
          <ArrowLeft size={24} color="black" />
        </Pressable>
        <Text className="text-xl font-semibold">Review</Text>
        <Pressable onPress={() => router.push('/requests')}>
          <Text className="text-blue-500">Cancel</Text>
        </Pressable>
      </View>

      {/* Recipient Info */}
      <View className="p-4">
        <View className="flex-row items-center space-x-3">
          <Avatar
            size="large"
            label="P"
            className="bg-gray-400 w-16 h-16 rounded-full items-center justify-center"
          />
          <View>
            <Text className="text-gray-600">Registered as</Text>
            <Text className="text-lg font-medium">Personal account</Text>
          </View>
        </View>

        {/* Amount */}
        <View className="my-8">
          <Text className="text-center text-gray-600 mb-2">Amount</Text>
          <Text className="text-center text-4xl font-semibold">$142.50</Text>
        </View>

        {/* Payment Details */}
        <View className="space-y-4">
          <View className="flex-row justify-between">
            <Text className="text-gray-600">Sending as</Text>
            <Text className="font-medium">John Doe</Text>
          </View>

          <View className="flex-row justify-between">
            <Text className="text-gray-600">Pay from</Text>
            <Text className="font-medium">Checking Account (...1234)</Text>
          </View>

          <View className="flex-row justify-between">
            <Text className="text-gray-600">Send on</Text>
            <Text className="font-medium">{futureDate.toLocaleDateString('en-US', {
              month: 'short',
              day: '2-digit',
              year: 'numeric'
            })}</Text>
          </View>

          <View className="flex-row justify-between">
            <Text className="text-gray-600">Message to recipient</Text>
            <Text className="font-medium">Optional</Text>
          </View>
        </View>

        {/* Warning Message */}
        <View className="mt-8 mb-4">
          <Text className="text-gray-600 text-sm">
            Only send money to people and businesses you trust. We don't offer protection for payments you authorize, so you might not be able to get your money back once you send it.
          </Text>
        </View>

        {/* Send Button */}
        <TouchableOpacity 
          className="bg-blue-600 rounded-lg py-4 mt-4"
          onPress={() => {
            // Handle payment submission
            console.log('Payment submitted');
            router.back();
          }}
        >
          <Text className="text-white text-center text-lg font-semibold">
            Send it now
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
