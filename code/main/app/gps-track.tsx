import { useState } from 'react'
import { Ionicons } from '@expo/vector-icons'
import {
  ScrollView,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  Platform,
} from 'react-native'

export default function GPSTrack() {
  const [destination, setDestination] = useState('')

  // Example props (in real use these would come from parent or state)
  const sample = {
    dateTime: "18 Sep'25 at 7am",
    fromLocation: 'Sector 21A, Gurgaon',
    transport: 'Car',
    workplace: 'Gurgaon, Sec 21A, Block 534C',
  }

  return (
    <ScrollView className="flex-1 bg-[#FFF1EF] p-4">
      <View className="mt-10 mx-4 flex-row items-center gap-3">
        <Ionicons name="location-outline" size={32} color="black" />
        <View className="flex-1 flex-col items-start justify-center">
          <Text className="text-3xl font-extrabold text-gray-900">GPS Tracking</Text>
          <Text className="text-sm text-gray-600 leading-tight">Track your location to ensure your location{"'"}s saved to ensure your safety at all times</Text>
        </View>
      </View>

      <View className="mt-6 mx-4 gap-4">
        <View className="bg-white rounded-2xl shadow-2xl p-4">
          <Text className="text-lg font-extrabold text-gray-900">Trip Start detected</Text>
          <Text className="text-2xl mt-1">{sample.dateTime}</Text>

          <View className="mt-4">
            <View className="flex-row items-start">
              <Text className="text-md font-medium text-gray-700 w-24">From:</Text>
              <Text className="text-md text-gray-800 flex-1">{sample.fromLocation}</Text>
            </View>

            <View className="flex-row items-start mt-2">
              <Text className="text-md font-medium text-gray-700 w-24">Mode:</Text>
              <Text className="text-md text-gray-800 flex-1">{sample.transport}</Text>
            </View>
          </View>
        </View>

        <View className="p-4">
          <Text className="text-lg font-extrabold text-gray-900">Was this a trip to work?</Text>
          <Text className="text-2xl text-gray-500 mt-1">{sample.workplace}</Text>

          <View className="flex-row mt-4 gap-3">
            <TouchableOpacity
              accessible
              accessibilityRole="button"
              className="flex-1 bg-[#6B6BFF] rounded-md py-3 items-center justify-center"
              onPress={() => {}}
            >
              <Text className="text-white font-medium">Yes</Text>
            </TouchableOpacity>

            <TouchableOpacity
              accessible
              accessibilityRole="button"
              className="flex-1 bg-white rounded-md py-3 items-center justify-center"
              onPress={() => {}}
            >
              <Text className="text-gray-800 font-medium">No, Add Details</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View className="p-1">
          <Text className="text-lg font-extrabold text-gray-900 mb-2">Where are you headed?</Text>

          <View className="bg-white rounded-lg shadow-2xl px-3 py-2">
            <TextInput
              placeholder="Enter Destination"
              value={destination}
              onChangeText={setDestination}
              className="text-base text-gray-800 p-0"
              placeholderTextColor={Platform.OS === 'ios' ? '#9CA3AF' : '#9CA3AF'}
              underlineColorAndroid="transparent"
            />
          </View>
        </View>
      </View>
    </ScrollView>
  )
}
