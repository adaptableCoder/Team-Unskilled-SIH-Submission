import { Ionicons } from '@expo/vector-icons'
import { BlurView } from 'expo-blur'
import { LinearGradient } from 'expo-linear-gradient'
import { Image, ScrollView, Text, View, TextInput, Pressable, ActivityIndicator } from 'react-native'
import { useSelector } from 'react-redux'
import { selectAddress } from '@/store/slices/permissionsSlice'
import type { RootState } from '@/store/store'
import { useEffect, useState } from 'react'
import * as Location from 'expo-location'
import MapFallback from '@/map-components/MapFallback'

export default function WeatherUpdates() {
  const address = useSelector((state: RootState) => selectAddress(state))
  const currentLocation = useSelector((state: RootState) => state.permissions.currentLocation)

  const [detailedAddress, setDetailedAddress] = useState<string | null>(null)
  const [addressParts, setAddressParts] = useState<{ firstLine?: string; city?: string; country?: string }>({})
  const [searchQuery, setSearchQuery] = useState('')
  const [searching, setSearching] = useState(false)
  const [searchCoords, setSearchCoords] = useState<{ lat: number; lon: number } | null>(null)
  const [weatherData, setWeatherData] = useState<any | null>(null)
  const [weatherLoading, setWeatherLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<'hourly' | 'weekly'>('hourly')

  // Map Open-Meteo weather codes to Ionicons names (simplified)
  function getWeatherIcon(code: number | undefined) {
    if (code == null) return 'cloudy'
    if (code === 0) return 'sunny'
    if (code === 1 || code === 2 || code === 3) return 'partly-sunny'
    if (code >= 45 && code <= 48) return 'cloudy'
    if (code >= 51 && code <= 67) return 'rainy'
    if (code >= 71 && code <= 77) return 'snow'
    if (code >= 80 && code <= 86) return 'thunderstorm'
    return 'cloudy'
  }

  async function handleSearch() {
    if (!searchQuery || searchQuery.trim().length === 0) return
    try {
      setSearching(true)
      const results = await Location.geocodeAsync(searchQuery)
      if (results && results.length > 0) {
        const r = results[0]
        setSearchCoords({ lat: r.latitude, lon: r.longitude })
      } else {
        setSearchCoords(null)
      }
    } catch (err) {
      console.warn('Geocode failed:', err)
    } finally {
      setSearching(false)
    }
  }

  useEffect(() => {
    let mounted = true
    const lat = searchCoords ? searchCoords.lat : currentLocation ? currentLocation.coords.latitude : undefined
    const lon = searchCoords ? searchCoords.lon : currentLocation ? currentLocation.coords.longitude : undefined
    if (lat == null || lon == null) return

    ;(async () => {
      try {
        setWeatherLoading(true)
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&hourly=temperature_2m,precipitation&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,weathercode&timezone=auto`
        const r = await fetch(url)
        const d = await r.json()
        if (!mounted) return
        setWeatherData(d)
      } catch (err) {
        console.warn('Failed to fetch weather:', err)
      } finally {
        if (mounted) setWeatherLoading(false)
      }
    })()

    return () => { mounted = false }
  }, [currentLocation, searchCoords])

  useEffect(() => {
    let mounted = true

    async function fetchReverse() {
      try {
        if (currentLocation) {
          const coords = {
            latitude: currentLocation.coords.latitude,
            longitude: currentLocation.coords.longitude,
          }
          const results = await Location.reverseGeocodeAsync(coords)
          if (!mounted) return

          if (results && results.length > 0) {
            const r = results[0]
            const firstParts: string[] = []
            if (r.name && r.name !== r.city) firstParts.push(r.name)
            if (r.street) firstParts.push(r.street)
            if (r.subregion) firstParts.push(r.subregion)
            const firstLine = firstParts.join(', ')

            const city = r.city || r.region || ''
            const country = r.country || ''

            const parts: string[] = []
            if (firstLine) parts.push(firstLine)
            if (city) parts.push(city)
            if (r.postalCode) parts.push(r.postalCode)
            if (country) parts.push(country)

            const full = parts.join(', ')
            setDetailedAddress(full || `${coords.latitude.toFixed(5)}, ${coords.longitude.toFixed(5)}`)
            setAddressParts({ firstLine: firstLine || city, city: city || undefined, country: country || undefined })
          } else {
            setDetailedAddress(`${coords.latitude.toFixed(5)}, ${coords.longitude.toFixed(5)}`)
            setAddressParts({ firstLine: `${coords.latitude.toFixed(5)}, ${coords.longitude.toFixed(5)}` })
          }
        } else if (address) {
          setDetailedAddress(address)
          setAddressParts({ firstLine: address })
        }
      } catch (err) {
        console.warn('Reverse geocode failed:', err)
        if (currentLocation) {
          setDetailedAddress(`${currentLocation.coords.latitude.toFixed(5)}, ${currentLocation.coords.longitude.toFixed(5)}`)
        }
      }
    }

    fetchReverse()

    return () => { mounted = false }
  }, [address, currentLocation])

  const locationTitle = detailedAddress || (currentLocation ? `${currentLocation.coords.latitude.toFixed(3)}, ${currentLocation.coords.longitude.toFixed(3)}` : 'Current Location')

  return (
    <ScrollView className="flex-1 bg-[#FFF1EF]" contentContainerStyle={{ flexGrow: 1 }}>
      <View className="px-6 flex-row items-center gap-3">
        <Ionicons name="cloudy" size={28} />
        <Text className="text-3xl font-extrabold">Live Weather Updates</Text>
      </View>

      <View className="mt-4 flex-col items-center justify-between">
        <View style={{ width: '100%', paddingHorizontal: 12, marginBottom: 8 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.95)', borderRadius: 12, paddingHorizontal: 10, paddingVertical: 8 }}>
            <TextInput
              placeholder="Search location"
              placeholderTextColor="#C0C0C0"
              value={searchQuery}
              onChangeText={setSearchQuery}
              style={{ flex: 1, paddingVertical: 6 }}
              returnKeyType="search"
              onSubmitEditing={() => handleSearch()}
            />
            <Pressable onPress={() => handleSearch()} style={{ marginLeft: 8 }}>
              {searching ? (
                <ActivityIndicator />
              ) : (
                <Ionicons name="search" size={20} />
              )}
            </Pressable>
            {searchCoords ? (
              <Pressable onPress={() => { setSearchCoords(null); setSearchQuery('') }} style={{ marginLeft: 8 }}>
                <Ionicons name="close" size={20} />
              </Pressable>
            ) : null}
          </View>
        </View>
          <View style={{ width: '100%', height: 360, overflow: 'hidden' }}>
          {currentLocation ? (
            <MapFallback
              lat={searchCoords ? searchCoords.lat : currentLocation.coords.latitude}
              lon={searchCoords ? searchCoords.lon : currentLocation.coords.longitude}
            />
          ) : (
            <Image
              source={require('@/assets/images/map.png')}
              style={{ width: '100%', height: '100%' }}
              resizeMode="cover"
            />
          )}

          <LinearGradient
            colors={['#FFF1EF', 'transparent']}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: 100,
            }}
          />

          <LinearGradient
            colors={['transparent', '#FFF1EF']}
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: 100,
            }}
          />
        </View>

        <View className="flex-row items-center justify-between w-full px-8">
          <View className="max-w-[76%]">
            <Text className="text-xl mt-1">{addressParts.firstLine || locationTitle}</Text>
            {addressParts.city ? (
              <Text className="text-base text-gray-600">{addressParts.city}</Text>
            ) : null}
            {addressParts.country ? (
              <Text className="text-sm font-bold text-gray-900">{addressParts.country}</Text>
            ) : null}
          </View>

          <View>
            <Ionicons name="location" size={32} color="#FF6EC7" />
          </View>
        </View>
      </View>

      <BlurView intensity={25} tint="dark" style={{ borderRadius: 24,  overflow: 'hidden', marginTop: 20 }}>
        <View className="overflow-hidden border border-white/5">
          <View className="flex-row py-2">
            <Pressable className="flex-1 items-center py-3" onPress={() => setActiveTab('hourly')}>
              <Text className={activeTab === 'hourly' ? 'font-bold' : ''}>Hourly Forecast</Text>
            </Pressable>
            <Pressable className="flex-1 items-center py-3" onPress={() => setActiveTab('weekly')}>
              <Text className={activeTab === 'weekly' ? 'font-bold' : ''}>Weekly Forecast</Text>
            </Pressable>
          </View>
          <View className="h-0.5 bg-white/10" />
        </View>

        <View className="rounded-b-3xl">
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="py-3 px-2" contentContainerStyle={{ paddingRight: 8 }}>
            {activeTab === 'hourly' ? (
              weatherData && weatherData.hourly && Array.isArray(weatherData.hourly.time) ? (
                weatherData.hourly.time.slice(0, 6).map((t: string, idx: number) => {
                  const temp = weatherData.hourly.temperature_2m?.[idx]
                  const label = idx === 0 ? 'Now' : new Date(t).getHours() + ':00'
                  const key = `h-${idx}`
                  return (
                    <View key={key} className="mr-3">
                      <View className={idx === 0 ? 'h-48 rounded-full items-center justify-center px-5 py-5 bg-pink-400/40' : 'h-48 rounded-full items-center justify-center px-5 py-5 bg-black/20 border border-white/5'}>
                        <Text className={idx === 0 ? 'text-white font-semibold' : 'text-white'}>{label}</Text>
                        <View className="my-3">
                          <Ionicons name="cloudy-night" size={36} color={idx === 0 ? '#fff' : '#c2fcfa'} />
                        </View>
                        <Text className={idx === 0 ? 'text-white text-sm' : 'text-pink-200 text-sm'}>{/* chance unavailable */}</Text>
                        <Text className={idx === 0 ? 'text-2xl font-bold mt-3' : 'text-2xl font-bold mt-3'}>{temp ? `${Math.round(temp)}°` : '--'}</Text>
                      </View>
                    </View>
                  )
                })
              ) : (
                [
                  { time: 'Now', temp: '29°', chance: '10%' , key: 'now' },
                  { time: '12 AM', temp: '26°', chance: '20%' , key: '12am' },
                  { time: '1 AM', temp: '25°', chance: '15%' , key: '1am' },
                  { time: '2 AM', temp: '24°', chance: '5%' , key: '2am' },
                  { time: '3 AM', temp: '23°', chance: '0%' , key: '3am' },
                ].map((f) => (
                  <View key={f.key} className="mr-3">
                    <View className={f.key === 'now' ? 'h-54 rounded-full items-center justify-center px-5 py-5 bg-pink-400/40' : 'h-54 rounded-full items-center justify-center px-5 py-5 bg-black/20 border border-white/5'}>
                      <Text className={f.key === 'now' ? 'text-white font-semibold' : 'text-white'}>{f.time}</Text>
                      <View className="my-3">
                        <Ionicons name="cloudy-night" size={36} color={f.key === 'now' ? '#fff' : '#c2fcfa'} />
                      </View>
                      <Text className={f.key === 'now' ? 'text-white text-sm' : 'text-pink-200 text-sm'}>{f.chance}</Text>
                      <Text className={f.key === 'now' ? 'text-2xl font-bold mt-3' : 'text-2xl font-bold mt-3'}>{f.temp}</Text>
                    </View>
                  </View>
                ))
              )
            ) : (
              weatherData && weatherData.daily && Array.isArray(weatherData.daily.time) ? (
                weatherData.daily.time.slice(0, 7).map((d: string, idx: number) => {
                  const maxT = weatherData.daily.temperature_2m_max?.[idx]
                  const minT = weatherData.daily.temperature_2m_min?.[idx]
                  const precip = weatherData.daily.precipitation_sum?.[idx]
                  const code = weatherData.daily.weathercode?.[idx]
                  const date = new Date(d)
                  const label = idx === 0 ? 'Today' : date.toLocaleDateString(undefined, { weekday: 'short' })
                  const key = `d-${idx}`
                  const isToday = idx === 0
                  return (
                    <View key={key} className="mr-3">
                      <View className={isToday ? 'h-54 rounded-full items-center justify-center px-5 py-6 bg-pink-400/40' : 'h-54 rounded-full items-center justify-center px-5 py-6 bg-black/20 border border-white/5'}>
                        <Text className={isToday ? 'text-white font-semibold' : 'text-white'}>{label}</Text>
                        <View className="my-3">
                          <Ionicons name={getWeatherIcon(code) as any} size={36} color={isToday ? '#fff' : '#c2fcfa'} />
                        </View>
                        <Text className={isToday ? 'text-white text-sm' : 'text-pink-200 text-sm'}>{precip != null ? `${Math.round(precip)} mm` : ''}</Text>
                        <Text className={isToday ? 'text-2xl font-bold mt-3 text-white' : 'text-2xl font-bold mt-3'}>{maxT != null ? `${Math.round(maxT)}°` : '--'}</Text>
                        <Text className={isToday ? 'text-2xl font-bold mt-1 text-white' : 'text-2xl font-bold mt-1 text-pink-200'}>{minT != null ? `${Math.round(minT)}°` : ''}</Text>
                      </View>
                    </View>
                  )
                })
              ) : (
                [
                  { day: 'Mon', max: '30°', min: '22°', precip: '5mm', key: 'm' },
                  { day: 'Tue', max: '29°', min: '21°', precip: '2mm', key: 't' },
                  { day: 'Wed', max: '27°', min: '20°', precip: '0mm', key: 'w' },
                ].map((f, idx) => {
                  const isToday = idx === 0
                  return (
                    <View key={f.key} className="mr-3">
                      <View className={isToday ? 'h-48 rounded-full items-center justify-center px-5 py-6 bg-pink-400/40' : 'h-48 rounded-full items-center justify-center px-5 py-6 bg-black/20 border border-white/5'}>
                        <Text className={isToday ? 'text-white font-semibold' : 'text-white'}>{f.day}</Text>
                        <View className="my-3">
                          <Ionicons name="partly-sunny" size={36} color={isToday ? '#fff' : '#c2fcfa'} />
                        </View>
                        <Text className={isToday ? 'text-white text-sm' : 'text-pink-200 text-sm'}>{f.precip}</Text>
                        <Text className={isToday ? 'text-2xl font-bold mt-3 text-white' : 'text-2xl font-bold mt-3'}>{f.max}</Text>
                        <Text className={isToday ? 'text-2xl font-bold mt-1 text-white' : 'text-2xl font-bold mt-1 text-pink-200'}>{f.min}</Text>
                      </View>
                    </View>
                  )
                })
              )
            )}
          </ScrollView>

          <Text className="pl-4 mt-4 text-4xl font-extrabold">{weatherData && weatherData.current_weather ? `${Math.round(weatherData.current_weather.temperature)}°` : '29°C'} <Text className="text-2xl">Now</Text></Text>
          <Text className="pl-4 pb-4 mb-4 text-lg">{weatherData && weatherData.current_weather ? `Wind ${Math.round(weatherData.current_weather.windspeed)} km/h` : 'Light showers'}</Text>
        </View>
      </BlurView>
    </ScrollView>
  )
}
