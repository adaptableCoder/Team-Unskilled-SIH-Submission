import type { ComponentProps } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { View, Text } from 'react-native'

const DetailCard = ({
    heading,
    value,
    icon
}: {
    heading: string;
    value: string;
    icon: ComponentProps<typeof Ionicons>['name'];
}) => {
  return (
    <View className='w-full bg-white rounded-xl shadow-lg flex-col justify-center items-center py-3'>
      <Text className='text-gray-500'>{heading}</Text>
      <View className='flex-row items-center gap-2 mt-2'>
        <Ionicons name={icon} size={24} color="#6C63FF" />
        <Text className='text-2xl font-bold mt-2'>{value}</Text>
      </View>
    </View>
  )
}

export default DetailCard