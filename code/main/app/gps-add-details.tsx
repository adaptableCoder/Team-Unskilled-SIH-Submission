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

import TripForm from '../components/plan/TripForm'

export default function GPSaddDetails() {
  const [destination, setDestination] = useState('')
  const [tripType, setTripType] = useState<'regular' | 'vacation'>('regular')
  const [returnTime, setReturnTime] = useState('')

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
          <Text className="text-sm text-gray-600 leading-tight">Track your location to ensure your location's saved to ensure your safety at all times</Text>
        </View>
      </View>

      <View className="mt-6 mx-4 gap-4 pb-20">
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

        {/* Trip Details Card */}
        <View className="bg-white rounded-2xl shadow-2xl p-6 mt-4">
          <Text className="text-lg font-extrabold text-gray-900">Add Trip Details</Text>

          {/* Trip type selector */}
          <View className="mt-3">
            <Text className="text-md font-bold text-gray-800 mb-2">Trip Type</Text>

            <View className="flex-row items-center gap-6">
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => setTripType('regular')}
                style={{
                  backgroundColor: tripType === 'regular' ? '#DAD8FF' : '#ECECEC',
                }}
                  className="flex-1 py-2 rounded-full items-center justify-center"
              >
                <Text className="font-medium text-lg">Regular Trip</Text>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => setTripType('vacation')}
                style={{
                  backgroundColor: tripType === 'vacation' ? '#DAD8FF' : '#ECECEC',
                }}
                  className="flex-1 py-2 rounded-full items-center justify-center"
              >
                <Text className="font-medium text-lg">Vacation</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Inputs or TripForm (for vacation) */}
          {tripType === 'regular' ? (
            <>
              <View className="mt-4 gap-3">
                <View>
                  <Text className="text-md font-bold text-gray-800 mb-2">Where are you headed?</Text>
                  <TextInput
                    value={destination}
                    onChangeText={setDestination}
                    placeholder="Enter Destination"
                    placeholderTextColor="#6B7280"
                    className="bg-white rounded-xl p-3 border border-gray-200 shadow-sm mb-4"
                  />
                </View>

                <View>
                  <Text className="text-md font-bold text-gray-800 mb-2">Expected Return Time</Text>
                  <TextInput
                    value={returnTime}
                    onChangeText={setReturnTime}
                    placeholder="Enter Return Time"
                    placeholderTextColor="#6B7280"
                    className="bg-white rounded-xl p-3 border border-gray-200 shadow-sm"
                  />
                </View>
              </View>

              {/* Submit button */}
              <TouchableOpacity
                activeOpacity={0.9}
                onPress={() => {
                  // Placeholder submit handler
                  console.log('Add trip:', { tripType, destination, returnTime })
                }}
                style={{ backgroundColor: '#6B6BFF' }}
                className="mt-4 rounded-full w-full px-4 py-4 items-center justify-center"
              >
                <Text className="text-white font-bold text-center">Add to Regular trip/ Smart GPS detections</Text>
              </TouchableOpacity>
            </>
          ) : (
            <TripForm />
          )}
        </View>
      </View>
    </ScrollView>
  )
}