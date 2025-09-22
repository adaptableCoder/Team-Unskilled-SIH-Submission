"use client"
import { useState } from 'react'
import { useSelector } from 'react-redux'
import { Text, TouchableOpacity, View } from 'react-native'
import OneWay from '../home/OneWay'
import RoundTrip from '../home/RoundTrip'
import MultiTrip from '../home/MultiTrip'


const TripForm = () => {
  const [tripType, setTripType] = useState<'oneway' | 'round' | 'multi'>('oneway')

  // Get permissions state from Redux store
  const locationAddress = useSelector((state: any) => state.permissions.address)
  const isLoadingPermissions = useSelector((state: any) => state.permissions.isLoading)
  const showPermissionModal = useSelector((state: any) => state.permissions.showPermissionModal)
  return (
    <View>
      <View className="mt-4 bg-white p-3 rounded-2xl shadow-2xl">
        <View className="rounded-full p-3 flex-row items-center justify-between">
            <TouchableOpacity activeOpacity={0.85} onPress={() => setTripType('oneway')} className={`flex-1 items-center py-3 rounded-full ${tripType === 'oneway' ? 'bg-[#6B6BFF]' : ''}`}>
              <Text className={`${tripType === 'oneway' ? 'font-semibold text-white' : 'text-[#3f3f3f]'}`}>One Way</Text>
            </TouchableOpacity>
            <TouchableOpacity activeOpacity={0.85} onPress={() => setTripType('round')} className={`flex-1 items-center py-3 rounded-full ${tripType === 'round' ? 'bg-[#6B6BFF]' : ''}`}>
              <Text className={`${tripType === 'round' ? 'font-semibold text-white' : 'text-[#3f3f3f]'}`}>Round Trip</Text>
            </TouchableOpacity>
            <TouchableOpacity activeOpacity={0.85} onPress={() => setTripType('multi')} className={`flex-1 items-center py-3 rounded-full ${tripType === 'multi' ? 'bg-[#6B6BFF]' : ''}`}>
              <Text className={`${tripType === 'multi' ? 'font-semibold text-white' : 'text-[#3f3f3f]'}`}>Multi City</Text>
            </TouchableOpacity>
        </View>

        {tripType === "oneway" && (
          <OneWay locationAddress={locationAddress} />
        )}

        {tripType === "round" && (
          <RoundTrip locationAddress={locationAddress} />
        )}


        {tripType === "multi" && (
          <MultiTrip locationAddress={locationAddress} />
        )}
      </View>
      
    </View>
  )
}

export default TripForm