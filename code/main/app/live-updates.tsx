import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import { Image, ScrollView, Text, TouchableOpacity, View } from 'react-native'
import NumberBadge from '../components/NumberBadge'

const LiveUpdates = () => {
  const router = useRouter()

  return (
    <ScrollView className="flex-1 bg-[#FFF1EF] p-4">
      <View className="mt-8 mb-6">
        <View className="flex-row">
          <Ionicons name="newspaper" size={28} color="#111827" />
          <View className="mx-3">
            <Text className="text-2xl font-bold">Live Updates</Text>
            <Text className="text-sm text-gray-500">Get Live updates about the weather and local news about your vacation destination</Text>
          </View>
        </View>
      </View>

      {/* Updates list */}
      <View className="gap-10">
        {/* Item 1 */}
        <View className="flex-row items-start gap-4">
          <NumberBadge n={1} />
          <View className="flex-1">
            <Text className="text-xl font-bold">
              Flood 
              <Text className="text-red-600"> Red Alert </Text>
              <Ionicons name="warning" size={20} color="red" />
            </Text>
            <Text className="text-md text-gray-500 mt-1">Find below the evacuation drill for floods in Uttarakhand</Text>

            <View className="mt-3 bg-white rounded-3xl shadow-2xl overflow-hidden">
              <Image source={require('../assets/images/flood.png')} className="w-full h-60" resizeMode="cover" />
              <View className="absolute left-4 right-4 bottom-4 bg-black/60 rounded-md p-2">
                <Text className="text-md text-white">Weather Office Issues Red Alert For Uttarakhand, Schools Shut</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Item 2 */}
        <View className="flex-row items-start gap-4">
          <NumberBadge n={2} />
          <View className="flex-1">
            <Text className="text-xl font-bold">Evacuation plan</Text>
            <Text className="text-md text-gray-500 mt-1">View Evacuation plan for disaster management</Text>
            <TouchableOpacity className="mt-3 items-start" onPress={() => router.push('/evacuation-plan')}>
              <Text className="text-pink-500 font-semibold">See Evacuation Plan</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Item 3 */}
        <View className="flex-row items-start gap-4">
          <NumberBadge n={3} />
          <View className="flex-1">
            <Text className="text-xl font-bold">Weather updates & Warnings</Text>
            <Text className="text-md text-gray-500 mt-1">Excessive Rain, Potential Flooding in your area</Text>
            <TouchableOpacity className="mt-3 items-start" onPress={() => router.push('/weather-updates')}>
              <Text className="text-pink-500 font-semibold">See Live Weather Updates</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </ScrollView>
  )
}

export default LiveUpdates
