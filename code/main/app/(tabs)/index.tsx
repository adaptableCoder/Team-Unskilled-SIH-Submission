import { ImageBackground, Modal, ScrollView, Text, TouchableOpacity, View, Alert, ActivityIndicator } from 'react-native'
import { useState, useEffect } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient'
import ExpoCheckbox from 'expo-checkbox'
import { useDispatch, useSelector } from 'react-redux'
import type { RootState, AppDispatch } from '@/store/store'
import {
  requestAllPermissions,
  getCurrentLocation,
  hidePermissionModal,
} from '@/store/slices/permissionsSlice'
import { Link } from 'expo-router'
import ExploreCard from '@/components/plan/ExploreCard'
import OneWay from '@/components/home/OneWay'
import RoundTrip from '@/components/home/RoundTrip'
import MultiTrip from '@/components/home/MultiTrip'
import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import WeatherUpdates from '@/components/home/WeatherUpdates'
import LocationTrackingMap from '@/components/home/LocationTrackingMap'

const Home = () => {
  const dispatch = useDispatch<AppDispatch>()
  const router = useRouter()

  // Get permissions state from Redux store
  const locationAddress = useSelector((state: RootState) => state.permissions.address)
  const isLoadingPermissions = useSelector((state: RootState) => state.permissions.isLoading)
  const showPermissionModal = useSelector((state: RootState) => state.permissions.showPermissionModal)

  const [travelMethod, settravelMethod] = useState("oneWay")
  const [firstName, setFirstName] = useState<string | null>(null)

  const card_details = [
    { 
      image: require('@/assets/images/card1.png'), 
      heading: 'Goa', 
      subtitle: 'Baga Beach, Baga, Bardez, North Goa, Goa 403516, India Baga Beach is a vibrant seaside destination known for water sports, beach shacks, and nightlife.' 
    },
    { 
      image: require('@/assets/images/card2.jpg'), 
      heading: 'Candolim Beach', 
      subtitle: 'Candolim Beach, Candolim, Bardez, North Goa, Goa 403515, India Candolim Beach offers a quieter escape with upscale resorts and scenic sunset views.' 
    },
    { 
      image: require('@/assets/images/card3.jpg'), 
      heading: 'Fontainhas', 
      subtitle: 'Fontainhas, Panaji, North Goa, India is Goa\'s Latin Quarter, known for its colorful Portuguese houses, art galleries, and old-world charm.' 
    }
  ]

  // Handle all permissions request
  const handleAllPermissionsRequest = async () => {
    console.log('Starting permission request from UI...')
    try {
      const result = await dispatch(requestAllPermissions()).unwrap()
      console.log('Permission request result:', result)

      // Check if ALL essential permissions are granted (backgroundLocation is optional)
      const allPermissionsGranted =
        result.permissions.location.granted &&
        result.permissions.camera.granted &&
        result.permissions.mediaLibrary.granted &&
        result.permissions.microphone.granted &&
        result.permissions.contacts.granted

      if (allPermissionsGranted) {
        console.log('All permissions granted! Getting location...')

        // Get current location since location permission was granted
        const locationResult = await dispatch(getCurrentLocation())

        if (getCurrentLocation.fulfilled.match(locationResult)) {
          console.log('Location obtained:', locationResult.payload?.address)
        } else {
          console.log('Failed to get location:', locationResult.payload)
        }

        // Hide modal only after ALL permissions granted
        dispatch(hidePermissionModal())
      } else {
        console.log('Not all permissions granted. Modal will stay open.')
        // Show specific message about which permissions are missing
        const missingPermissions = []
        if (!result.permissions.location.granted) missingPermissions.push('Location')
        if (!result.permissions.camera.granted) missingPermissions.push('Camera')
        if (!result.permissions.mediaLibrary.granted) missingPermissions.push('Media Library')
        if (!result.permissions.microphone.granted) missingPermissions.push('Microphone')
        if (!result.permissions.contacts.granted) missingPermissions.push('Contacts')

        Alert.alert(
          'Permissions Required',
          `Please grant these permissions to continue: ${missingPermissions.join(', ')}`,
          [{ text: 'Try Again' }]
        )
      }
    } catch (error) {
      console.error('Permission request error:', error)
      Alert.alert(
        'Permission Error',
        'Failed to request permissions. Please try again.',
        [{ text: 'Retry' }]
      )
    }
  }
  // Auto-request permissions on app startup
  useEffect(() => {
    console.log('App started, checking if permissions modal should show...');
    (async () => {
      try {
        // Prefer current_user's stored profile
        const current = await AsyncStorage.getItem('current_user')
        let name = null
        if (current) {
          const profileStr = await AsyncStorage.getItem(`user_profile:${current}`)
          if (profileStr) {
            try {
              const up = JSON.parse(profileStr)
              name = up?.firstName || up?.username || null
            } catch (e) {
              // ignore parse error
            }
          }
        }
        if (!name) {
          name = await AsyncStorage.getItem('firstName')
        }
        console.log('Loaded firstName on Home mount:', name)
        if (name) setFirstName(name)
      } catch (err) {
        console.warn('Failed to load firstName on Home mount', err)
      }
    })()
    // Modal will show automatically based on Redux state
    // The modal is controlled by showPermissionModal in the permissions slice
  }, [])

  const debugName = async () => {
    try {
      const name = await AsyncStorage.getItem('firstName')
      const token = await AsyncStorage.getItem('jwt')
      console.log('DEBUG: AsyncStorage firstName:', name)
      console.log('DEBUG: AsyncStorage jwt:', token)
      if (token) {
        try {
          const res = await fetch('https://yatra-backend-cb67.onrender.com/auth/auth/profile', { headers: { Authorization: `Bearer ${token}` } })
          console.log('DEBUG: profile status', res.status)
          const body = await res.text()
          console.log('DEBUG: profile body', body)
          Alert.alert('Debug', `profile status: ${res.status}`)
        } catch (e) {
          console.warn('DEBUG: profile fetch failed', e)
          Alert.alert('Debug', 'profile fetch failed (see console)')
        }
      } else {
        Alert.alert('Debug', 'No jwt saved')
      }
    } catch (e) {
      console.warn('DEBUG: read AsyncStorage failed', e)
      Alert.alert('Debug', 'Failed to read AsyncStorage (see console)')
    }
  }

  return (
    <>
      {/* Permissions Modal */}
      <Modal
        visible={showPermissionModal}
        animationType="slide"
        transparent={true}
        presentationStyle="overFullScreen"
        onRequestClose={() => {
          // Prevent modal from being dismissed by hardware back button
          // User must grant all permissions to continue
        }}
      >
        <View className="flex-1 justify-center items-center bg-black/60">
          <View className="bg-white rounded-2xl p-6 w-[85%] shadow-lg">
            <View className="items-center mb-6">
              <Text className="text-3xl font-bold text-[#1F2937] mb-2">App Permissions</Text>
              <Text className="text-base text-[#6B7280] text-center leading-tight">
                Yatra needs these permissions to provide you with the best experience. All data remains secure and private.
              </Text>
            </View>

            {/* Permission List */}
            <View className="mb-6 gap-3">
              {/* Location Permission */}
              <View className="flex-row items-center bg-[#F8FAFC] p-3 rounded-lg border-l-4 border-l-blue-500">
                <Text className="text-2xl mr-3">📍</Text>
                <View className="flex-1">
                  <Text className="text-base font-semibold text-[#1F2937]">Location & Background Tracking</Text>
                  <Text className="text-sm text-[#6B7280]">Auto-detect your city and track journeys even when app is closed</Text>
                </View>
              </View>

              {/* Camera Permission */}
              <View className="flex-row items-center bg-[#F8FAFC] p-3 rounded-lg border-l-4 border-l-emerald-500">
                <Text className="text-2xl mr-3">📷</Text>
                <View className="flex-1">
                  <Text className="text-base font-semibold text-[#1F2937]">Camera</Text>
                  <Text className="text-sm text-[#6B7280]">Scan QR codes and capture travel moments</Text>
                </View>
              </View>

              {/* Media Library Permission */}
              <View className="flex-row items-center bg-[#F8FAFC] p-3 rounded-lg border-l-4 border-l-violet-500">
                <Text className="text-2xl mr-3">🖼️</Text>
                <View className="flex-1">
                  <Text className="text-base font-semibold text-[#1F2937]">Photos & Videos</Text>
                  <Text className="text-sm text-[#6B7280]">Save and share your travel memories</Text>
                </View>
              </View>

              {/* Microphone Permission */}
              <View className="flex-row items-center bg-[#F8FAFC] p-3 rounded-lg border-l-4 border-l-amber-500">
                <Text className="text-2xl mr-3">🎤</Text>
                <View className="flex-1">
                  <Text className="text-base font-semibold text-[#1F2937]">Microphone</Text>
                  <Text className="text-sm text-[#6B7280]">Voice search and audio recording features</Text>
                </View>
              </View>

              {/* Contacts Permission */}
              <View className="flex-row items-center bg-[#F8FAFC] p-3 rounded-lg border-l-4 border-l-red-500">
                <Text className="text-2xl mr-3">👥</Text>
                <View className="flex-1">
                  <Text className="text-base font-semibold text-[#1F2937]">Contacts</Text>
                  <Text className="text-sm text-[#6B7280]">Share trip details with friends and family</Text>
                </View>
              </View>
            </View>

            {isLoadingPermissions ? (
              <View className="items-center py-5">
                <ActivityIndicator size="large" color="#3B82F6" />
                <Text className="text-base text-[#6B7280] mt-3 text-center">Requesting permissions...</Text>
              </View>
            ) : (
              <View className="space-y-3">
                <TouchableOpacity onPress={handleAllPermissionsRequest} className="bg-[#6B6BFF] py-4 px-6 rounded-xl">
                  <Text className="text-white text-base font-semibold text-center">Allow All Permissions</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </Modal>

      <ScrollView showsVerticalScrollIndicator={false} className="flex-1 bg-[#FFF1EF] px-5 py-4">
        <View className="mt-6 flex-row gap-2 items-start">
          <View className="mt-1">
            <Ionicons name="person-circle-outline" size={44} color="black" />
          </View>
          <View className="flex-col">
            <Text className="text-3xl font-extrabold">Welcome Back, {firstName || 'Jay'}!</Text>
            <Text className="text-[#3f3f3f]">Auto-track your next Trip with Yatra</Text>
          </View>
        </View>

        <View className="mt-4 flex-row items-center bg-white absolute top-20 left-5 right-5 rounded-full shadow-2xl z-10">
          <View className="w-1/3">
            <TouchableOpacity className="flex-row items-center justify-center py-3" onPress={() => router.push('../sos')}>
              <Ionicons name="alert-circle-outline" size={24} color="red" className="" />
              <Text className="text-md font-semibold text-red-500">SOS</Text>
            </TouchableOpacity>
          </View>
          <View className="w-1/3">
            <TouchableOpacity className="flex-row items-center justify-center py-3" onPress={() => router.push('../live-updates')}>
              <Ionicons name="notifications-outline" size={24} color="black" className="" />
              <Text className="text-md font-semibold">Live{'\n'}Updates</Text>
            </TouchableOpacity>
          </View>
          <View className="w-1/3">
            <TouchableOpacity className="flex-row items-center justify-center py-3" onPress={() => router.push('../gps-track')}>
              <Ionicons name="location-outline" size={24} color="black" className="" />
              <Text className="text-md font-semibold">GPS{'\n'}Tracking</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View className="mt-12">
          <ImageBackground source={require('@/assets/images/home-bg.png')} className="w-full h-48" resizeMode="cover">
            <LinearGradient colors={['#FFF1EF', 'transparent']} className="absolute top-0 left-0 right-0 h-20" />
            <LinearGradient colors={['transparent', '#FFF1EF']} className="absolute bottom-0 left-0 right-0 h-20" />
          </ImageBackground>
        </View>
        
        {/* Smart GPS Tracking */}
        <View className='bg-white w-[90vw] mx-auto flex flex-col rounded-xl mt-6 py-6 px-6 shadow'>
          <Text className='font-bold text-2xl mb-4 text-[#6B6BFF]'>Smart GPS Tracking</Text>
          
          {/* Location Tracking Map */}
          <LocationTrackingMap height={250} />
        </View>
        
        {/* Weather updates component (converted from page) */}
        <View className="mt-6 w-[90vw] mx-auto">
          <WeatherUpdates />
        </View>
        
        {/* Past Trips & AI Trip Planner */}
        <View className='w-[100%] flex flex-row items-center mt-6 gap-4'>
          <View className='w-[48%] shadow-2xl'>
            <Link href="/tripHistory" asChild>
              <TouchableOpacity className='bg-white rounded-2xl shadow-2xl px-4 py-3 w-full h-32 flex-col justify-between'>
                <View className='flex-row items-center'>
                  <Text className='font-semibold text-xl leading-tight'>View Past {'\n'}Trip Details</Text>
                  <View className="absolute right-0 top-2">
                    <Ionicons name="receipt-outline" size={25} color="black" />
                  </View>
                </View>
                <Text className='text-md mt-2'>Download Past Trip Transcripts</Text>
              </TouchableOpacity>
            </Link>
          </View>

          <View className='w-[48%] shadow-2xl'>
            <Link href="/plan" asChild>
              <TouchableOpacity className='bg-white rounded-2xl shadow-2xl px-4 py-3 w-full h-32 flex-col justify-between'>
                <View className='flex-row items-center  gap-4'>
                  <Text className='font-semibold text-xl'>AI Trip {'\n'}Planner</Text>
                  <View className="absolute right-0 top-2">
                    <Ionicons name="globe" size={25} color="black" />
                  </View>
                </View>
                <Text className='text-md mt-2'>Plan your dream Trips in seconds</Text>
              </TouchableOpacity>
            </Link>
          </View>
        </View>

        <Text className="mt-6 text-2xl font-bold">Suggested for you</Text>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mt-4 w-[90vw] mx-auto py-4 mb-3">
          {card_details.map((c, i) => (
            <ExploreCard key={i} image={c.image} heading={c.heading} subtitle={c.subtitle} onPress={() => { }} />
          ))}
        </ScrollView>

      </ScrollView>
    </>
  )
}

export default Home
