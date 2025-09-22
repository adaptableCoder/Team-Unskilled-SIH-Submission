import { Ionicons } from '@expo/vector-icons'
import { Text, TouchableOpacity, View } from 'react-native'

interface LanguageSelectorProps {
  leftLabel?: string
  leftFlag?: string
  rightLabel?: string
  rightFlag?: string
  onSwap?: () => void
}

export default function LanguageSelector({
  leftLabel = 'English',
  leftFlag = '🇺🇸',
  rightLabel = 'हिन्दी',
  rightFlag = '🇮🇳',
  onSwap,
}: LanguageSelectorProps) {
  return (
    <View className="flex-row items-center justify-between bg-white rounded-full p-2 shadow-2xl">
      <TouchableOpacity className="flex-row items-center px-3">
        <Text className="text-lg">{leftFlag}</Text>
        <Text className="ml-2 font-medium">{leftLabel}</Text>
        <Ionicons name="chevron-down" size={16} color="#C4B5FD" style={{ marginLeft: 8 }} />
      </TouchableOpacity>
      
      <TouchableOpacity onPress={onSwap} className="p-2 rounded-full bg-white/6">
        <Ionicons name="swap-horizontal" size={20} />
      </TouchableOpacity>
      
      <TouchableOpacity className="flex-row items-center px-3">
        <Text className="text-lg">{rightFlag}</Text>
        <Text className="ml-2 font-medium">{rightLabel}</Text>
        <Ionicons name="chevron-down" size={16} color="#C4B5FD" style={{ marginLeft: 8 }} />
      </TouchableOpacity>
    </View>
  )
}