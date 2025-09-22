import { View, Text } from 'react-native'
import React from 'react'
import { Ionicons } from '@expo/vector-icons'

const TripUpdate = ({
  heading,
  fromAddress,
  toAddress,
  dateDay,
  date,
  tripStartTime,
  purpose,
  tripReturnTime,
  returnDate,
  modeOfTransport,
  className,
}: {
  heading: string
  fromAddress: string
  toAddress: string
  dateDay: string
  date: string
  tripStartTime: string
  purpose: string
  tripReturnTime: string
  returnDate: string
  modeOfTransport: string
  className?: string
}) => {
  return (
    <View className={`w-full rounded-2xl p-6 border border-blue-300 bg-[#EFF8FF] ${className || ''}`}>

      <Text className="text-2xl font-extrabold text-[#0f172a] mb-4">{heading}</Text>

      <View className="flex-row items-center px-5">
        <View className=" w-[45%] flex-row flex-wrap items-start">
          <Text className="text-base font-semibold text-[#111827]">{fromAddress.split(',').slice(0, 2).join(',')}</Text>
          <Text className="text-base font-semibold text-[#111827] mt-1">{fromAddress.split(',').slice(2).join(',')}</Text>
        </View>

        <Ionicons name="swap-horizontal" size={20} color="#0f172a" />


        <View className="w-[45%] flex-col items-end">
          <Text className="text-base font-bold text-[#0f172a]">{purpose}</Text>
          <Text className="text-sm text-[#0f172a] mt-1 text-right">{toAddress}</Text>
        </View>
      </View>

      {/* Middle row: big date on left, details on the right (stacked) */}
      <View className="flex-col items-start mt-3">
        {/* Date block */}
        <View className="flex-row items-end gap-2">
          <Text className="text-4xl font-extrabold text-[#0f172a] leading-none ">{dateDay}</Text>
          <Text className="text-xl font-medium text-[#374151] mt-1">{date}</Text>
        </View>

        {/* Details block */}
        <View className="flex-col gap-1 mt-4 w-full text-[13px">
          <View className="flex-row items-center gap-2">
            <Text className=" text-[#374151]">Trip Started:</Text>
            <Text className=" font-medium text-[#111827]">{tripStartTime}</Text>
          </View>

          <View className="flex-row items-center gap-2">
            <Text className=" text-[#374151]">Return:</Text>
            <Text className=" font-medium text-[#111827]">{returnDate || tripReturnTime}</Text>
          </View>

          <View className='flex-row items-center gap-2'>
            <Text className=" text-[#374151]">Mode of Transport:</Text>
            <Text className=" font-medium text-[#111827]">{modeOfTransport}</Text>
          </View>
        </View>
      </View>
    </View>
  )
}

export default TripUpdate
