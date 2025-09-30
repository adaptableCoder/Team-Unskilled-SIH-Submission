// Profile.tsx
import Analytics from '@/components/profile/Analytics';
import DetailCard from '@/components/profile/DetailCard';
import RecentTrip from '@/components/profile/RecentTrip'
import TripUpdate from '@/components/profile/TripUpdate';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Link } from 'expo-router';
import { useState, useRef, useEffect } from 'react';
import { DeviceEventEmitter } from 'react-native';
import {
  Alert,
  Image,
  Text,
  ScrollView,
  Dimensions,
} from 'react-native';
import { TouchableOpacity, View } from 'react-native';

const { width: screenWidth } = Dimensions.get('window');

const Profile = () => {
  const [userId, setUserId] = useState('Jaymishra@1207');
  useEffect(() => {
    (async () => {
      try {
        const current = await AsyncStorage.getItem('current_user');
        if (current) {
          // try per-user profile first
          const profileStr = await AsyncStorage.getItem(`user_profile:${current}`);
          if (profileStr) {
            try {
              const up = JSON.parse(profileStr);
              const displayId = up?.clientId ? `${up.username}@${up.clientId}` : up?.username || current;
              setUserId(displayId);
              return;
            } catch (e) {
              // ignore parse error
            }
          }
          // fallback to username only
          setUserId(current);
        }
      } catch (e) {
        console.warn('Failed to load current_user for profile', e);
      }
    })();
  }, []);
  const scrollRef = useRef<ScrollView | null>(null);

  const handleLogout = async () => {
    await AsyncStorage.removeItem('jwt');
    Alert.alert('Logged out');
    if (typeof window !== 'undefined') {
      window.location.reload();
    } else {
      // @ts-ignore
      globalThis.reloadApp && globalThis.reloadApp();
    }
  };

  // card sizing to allow next card to peek
  const cardWidth = Math.round(screenWidth * 0.78); // 78% width
  const gap = 16; // spacing between cards

  const [trips, settrips] = useState(110)
  const [hours, sethours] = useState(1100)
  const [costs, setcosts] = useState("26k")
  const [kilometers, setkilometers] = useState(1440)

  const tripsOverviewDetails = [
    { heading: 'Total Trips', value: trips.toString(), icon: 'car-sport' },
    { heading: 'Total Hours', value: hours.toString(), icon: 'time' },
    { heading: 'Total Costs', value: costs.toString(), icon: 'wallet-outline' },
    { heading: 'Total Distance', value: kilometers.toString(), icon: 'trending-up' },
  ]

  const monthlyTravelTrends = [{
    month: 'January',
    cost: "2000"
  },
  { month: 'February', cost: "2500" },
  { month: 'March', cost: "3000" },
  { month: 'April', cost: "2800" },
  { month: 'May', cost: "3200" },
  ]

  const transportModeUsage = [
    { mode: 'Bus', percentage: 45 },
    { mode: 'Train', percentage: 15 },
    { mode: 'Auto', percentage: 5 },
    { mode: 'Metro', percentage: 20 },
    { mode: 'Bike', percentage: 5 },
  ]

  const [recentTripsData, setRecentTripsData] = useState([
    {
      from: 'Delhi',
      to: 'Goa',
      departuredate: '22 Sep 2025',
      returndate: '29 Sep 2025',
      image: require('@/assets/images/recenttripsImage.png')
    },
    {
      from: 'Mumbai',
      to: 'Pune',
      departuredate: '15 Oct 2025',
      returndate: '20 Oct 2025',
      image: require('@/assets/images/recenttripsImage.png')
    }
  ])

  const [upcomingTrips, setUpcomingTrips] = useState<any[]>([])

  const loadUpcoming = async () => {
    try {
      const raw = await AsyncStorage.getItem('upcoming_trips')
      const arr = raw ? JSON.parse(raw) : []
      setUpcomingTrips(arr)
    } catch (e) {
      console.warn('Failed to load upcoming_trips', e)
    }
  }

  const deleteTrip = async (tripId: string) => {
    try {
      const raw = await AsyncStorage.getItem('upcoming_trips')
      const trips = raw ? JSON.parse(raw) : []
      const updatedTrips = trips.filter((trip: any, index: number) => {
        // Use either provided tripId or index as fallback
        const id = trip.id || trip.tripId || index.toString()
        return id !== tripId
      })
      await AsyncStorage.setItem('upcoming_trips', JSON.stringify(updatedTrips))
      setUpcomingTrips(updatedTrips)
      DeviceEventEmitter.emit('upcoming_trips_updated')
    } catch (e) {
      console.warn('Failed to delete trip', e)
      Alert.alert('Error', 'Failed to delete trip. Please try again.')
    }
  }

  useEffect(() => {
    loadUpcoming()
    const sub = DeviceEventEmitter.addListener('upcoming_trips_updated', () => {
      loadUpcoming()
    })
    return () => sub.remove()
  }, [])


  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      className="flex-1 bg-[#FFF1EF]"
      contentContainerStyle={{
        paddingTop: 40,
        paddingHorizontal: 20,
        paddingBottom: 10,
      }}
    >
      <View className="flex-row w-full items-center justify-between">
        <View className="flex-row items-center gap-3 mb-5">
          <Image source={require('@/assets/images/profile.png')} />

          <View className="flex-col">
            <View className="flex-row items-center gap-2 justify-between">
              <Text className="text-[25px] font-bold">Profile</Text>
            </View>

            <View>
              <Text className="text-[15px] font-medium">User ID:</Text>
              <Text className="text-gray-500 font-sm">{userId}</Text>
              <TouchableOpacity
                className="flex-row items-center gap-2 mt-1"
                onPress={() => {
                  try {
                    navigator?.clipboard?.writeText?.(userId);
                  } catch (err) { }
                }}
              >
                <Image source={require('@/assets/images/copy.png')} />
                <Text className="text-[14px]">Copy</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View>
          <TouchableOpacity
            onPress={handleLogout}
            className="bg-[#6C63FF] px-3 rounded-lg py-2 items-center"
          >
            <Text className="text-white font-semibold">Logout</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View className="mt-2">
        <View className="relative">
          <ScrollView
            ref={scrollRef}
            horizontal
            showsHorizontalScrollIndicator={false}
            snapToInterval={cardWidth + gap}
            decelerationRate="fast"
            snapToAlignment="start"
          >
            <View
              style={{
                width: cardWidth,
                marginRight: gap,
              }}
            >
              <TripUpdate
                heading="Current Ongoing Trip"
                fromAddress="Dwarka sec-10, Delhi"
                toAddress="Sec-11,Block 2A, Gurgaon"
                dateDay="22"
                date="Sep'25, Monday"
                tripStartTime="7:00 AM"
                purpose="Work"
                tripReturnTime="6pm"
                returnDate="22 Sep"
                modeOfTransport="Car"
              />
            </View>

            {upcomingTrips.length === 0 ? (
              <View style={{ width: cardWidth, marginRight: gap }} className="bg-white rounded-2xl p-6 shadow-md items-center justify-center">
                <Text className="text-lg font-semibold">No upcoming trips</Text>
                <Text className="text-sm text-gray-500 mt-2 text-center">You have no upcoming trips yet. Use Add Trip on the Plan Page (AI Trip Planner) to save one.</Text>
              </View>
            ) : (
              upcomingTrips.map((t, idx) => (
                <View key={idx} style={{ width: cardWidth, marginRight: idx < upcomingTrips.length - 1 ? gap : 0 }}>
                  <TripUpdate
                    {...t}
                    tripId={t.id || t.tripId || idx.toString()}
                    onDelete={deleteTrip}
                  />
                </View>
              ))
            )}
          </ScrollView>
        </View>
      </View>

      <View className='mt-6'>
        <Text className='text-[20px] font-bold'>Travel Analytics</Text>
        <Text className='text-[14px]'>Overview of your travel patterns and statistics</Text>
        <Link
          href={'/tripHistory'}
          className='mt-2'
          asChild
        >
          <TouchableOpacity>
            <Text className='text-blue-600 font-semibold'>
              View Past Trips
            </Text>
          </TouchableOpacity>
        </Link>

        <View className='flex-row flex-wrap w-full justify-center gap-8 mt-4'>
          {tripsOverviewDetails.map((detail, index) => (
            <View key={index} className='w-[40%] flex flex-wrap gap-10'>
              <DetailCard
                heading={detail.heading}
                value={detail.value}
                icon={detail.icon as any}
              />
            </View>
          ))}
        </View>
      </View>

      <View className='flex-col w-[90%] mx-auto mt-6 gap-4'>
        <Analytics
          heading='Monthly Travel Trends'
          data={monthlyTravelTrends}
        />

        <Analytics
          heading='Transport Mode Usage'
          data={transportModeUsage}
        />
      </View>

      <View className='w-[90%] mx-auto mt-6 bg-white rounded-2xl p-4 shadow-md'>
        <Text className='text-xl font-bold mb-2'>Your Common Routes</Text>
        <View className='flex-col gap-4'>
          <View>
            <Text className='text-base font-medium'>Home-Office</Text>
            <Text className='text-sm text-gray-500'>85 Trips · Avg: 45mins • ₹120</Text>
          </View>
          <View>
            <Text className='text-base font-medium'>Dwarka Sec-10, Delhi to Sec-11, Block 2A, Gurgaon</Text>
            <Text className='text-sm text-gray-500'>15 Trips · Avg: 30mins • ₹80</Text>
          </View>
          <View>
            <Text className='text-base font-medium'>Dwarka Sec-10, Delhi to Sec-11, Block 2A, Gurgaon</Text>
            <Text className='text-sm text-gray-500'>10 Trips · Avg: 25mins • ₹60</Text>
          </View>
        </View>
      </View>

      <View className='flex-col w-[90%] mx-auto mt-8 mb-10 bg-white rounded-2xl p-4 shadow-md items-center'>
        <Text className='text-2xl font-bold mb-2'>Your Recent Trips</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}>
          <View className='flex-row gap-4 pb-4'>
            {recentTripsData.map((trip, index) => (
              <RecentTrip tripData={trip} key={index} />
            ))}
          </View>
        </ScrollView>
      </View>
    </ScrollView>
  );
};

export default Profile;
