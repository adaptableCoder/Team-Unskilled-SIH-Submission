import { Ionicons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import { ImageBackground, ImageSourcePropType, Text, TouchableOpacity, View } from 'react-native'

type Props = {
  image: ImageSourcePropType
  heading: string
  subtitle: string
  onPress?: () => void
}

export default function ExploreCard({ image, heading, subtitle, onPress }: Props) {
  return (
    <TouchableOpacity activeOpacity={0.85} onPress={onPress} className="mr-3">
      <ImageBackground source={image} className="w-64 h-80 overflow-hidden rounded-2xl">
        <View className="flex-1">
          <View className="p-3">
            <Ionicons name="map" size={20} color="#FDF2E2" />
          </View>

          <LinearGradient
            colors={["transparent", '#FCF1E1']}
            start={{ x: 0, y: 0.5 }}
            end={{ x: 0, y: 1 }}
            style={{ position: 'absolute', left: 0, right: 0, bottom: -1, height: '200%', justifyContent: 'flex-end', padding: 12 }}
          >
            <Text className="text-md font-bold text-gray-800">{heading}</Text>
            <Text className="text-xs text-gray-600 mt-1">{subtitle}</Text>

            <TouchableOpacity onPress={onPress} activeOpacity={0.8} className="mt-3 bg-white px-3 py-2 rounded-full self-start">
              <Text className="text-sm text-gray-900 font-semibold">Explore</Text>
            </TouchableOpacity>
          </LinearGradient>
        </View>
      </ImageBackground>
    </TouchableOpacity>
  )
}
 
