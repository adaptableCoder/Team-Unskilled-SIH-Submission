import { View, Text } from 'react-native'
import React from 'react'

const Analytics = ({
    heading,
    data,
}: {
    heading: string;
    data: Array<{ month?: string; mode?: string; cost?: string; percentage?: number }>;

}) => {
  return (
    <View className='w-full bg-white rounded-2xl p-4 shadow-md'>
      <Text className='text-xl font-semibold'>{heading}</Text>
      <View className='mt-2'>
        {data.map((item: any, index: number) => (
          <View key={index} className='flex-row justify-between py-2'>
            <Text className='text-base text-blue-500'>{item.month || item.mode}</Text>
            <Text className='text-base'>{item.cost || item.percentage + '%'}</Text>
          </View>
        ))}
      </View>
    </View>
  )
}

export default Analytics