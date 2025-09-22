import { Ionicons } from '@expo/vector-icons'
import { ScrollView, Text, View } from 'react-native'
import NumberBadge from '../components/NumberBadge'

export default function EvacuationPlan() {
  return (
    <ScrollView className="flex-1 bg-[#FFF1EF] p-4">
      <View className="mt-16 flex-row items-center gap-3">
        <Ionicons name="warning" size={32} />
        <Text className="text-3xl font-extrabold">Evacuation Plan</Text>
      </View>

      <View className="gap-6 mt-14 px-2">
        <View className="flex-row items-start gap-2">
          <NumberBadge n={1} />
          <View className="flex-1">
            <Text className="text-xl font-bold">Move To Higher Ground</Text>
            <Text className="text-md text-gray-600 mt-1">Head uphill, avoid valleys and riverbeds. {'\n'}Think Tehri, Chamoli high areas.</Text>
          </View>
        </View>

        <View className="flex-row items-start gap-2">
          <NumberBadge n={2} />
          <View className="flex-1">
            <Text className="text-xl font-bold">Go To Designated Camps</Text>
            <Text className="text-md text-gray-600 mt-1">Use relief or transit camps (e.g., Harsil, Dharasu, Guptakashi, Joshimath).</Text>
          </View>
        </View>

        <View className="flex-row items-start gap-2">
          <NumberBadge n={3} />
          <View className="flex-1">
            <Text className="text-xl font-bold">Find Secure Government Sites</Text>
            <Text className="text-md text-gray-600 mt-1">Look for army bases, community halls or helipads, they often become relief hubs.</Text>
          </View>
        </View>

        <View className="flex-row items-start gap-2">
          <NumberBadge n={4} />
          <View className="flex-1">
            <Text className="text-xl font-bold">Avoid Risky Low Areas</Text>
            <Text className="text-md text-gray-600 mt-1">Stay away from low-lying settlements, riverbeds, and debris fans (e.g., Dharali-market zones).</Text>
          </View>
        </View>

      </View>
    </ScrollView>
  )
}
