// screens/MultiTrip.tsx
import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native'
import Calendar from '@/components/Calendar'
import AddMember from '@/components/home/AddMember'
import { Link } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'

// Modal (default export) and canonical LocationItem type from hooks
import LocationPickerModal from "@/components/cityInputModal";
import type { LocationItem } from "@/hooks/fetchCities";
import { useFetch } from "@/hooks/useFetch";
import { fetchCities } from "@/hooks/fetchCities";

type CityEntry = {
  to: string
  arrivalDate: string
  departureDate: string
}

const MIN_CITIES = 2

const MultiTrip = ({ locationAddress }: { locationAddress: string | null }) => {
  // Core trip state
  const [startingPoint, setStartingPoint] = useState(locationAddress || 'Select Location')
  const [numCities, setNumCities] = useState<number>(MIN_CITIES)
  const [cities, setCities] = useState<CityEntry[]>(
    Array.from({ length: MIN_CITIES }, () => ({ to: '', arrivalDate: '', departureDate: '' }))
  )

  // Return to origin (final return date shown in screenshot)
  const [returnDate, setReturnDate] = useState('')

  // passengers & members
  const [noOfPassengers, setNoOfPassengers] = useState(1)
  const [passengerDetails, setPassengerDetails] = useState<{ name: string; userId: string }[]>(
    []
  )

  // Purpose dropdown state (same options as others)
  const [purpose, setPurpose] = useState('')
  const [purposeOptionsOpen, setPurposeOptionsOpen] = useState(false)
  const [purposeOptions] = useState([
    { label: 'Work', value: 'work' },
    { label: 'Education', value: 'education' },
    { label: 'Leisure', value: 'leisure' },
  ])

  // calendar modal
  const [calendarVisible, setCalendarVisible] = useState(false)
  const [calendarTarget, setCalendarTarget] = useState<
    { type: 'arrival' | 'departure' | 'return'; index?: number } | null
  >(null)

  // Location picker modal state (for city stops)
  const [pickerVisible, setPickerVisible] = useState(false)
  const [pickerIndex, setPickerIndex] = useState<number | null>(null)

  // fetch locations for modal
  const { data: locations, loading: locationsLoading, error: locationsError, refetch } =
    useFetch<LocationItem[]>(fetchCities, true);

  // errors
  const [errors, setErrors] = useState<{
    startingPoint?: string | null
    cities?: { to?: string | null; arrivalDate?: string | null; departureDate?: string | null }[]
    returnDate?: string | null
    purpose?: string | null
    passengerDetails?: { name?: string | null; userId?: string | null }[]
    submit?: string | null
  }>({})

  const [isSubmitting, setIsSubmitting] = useState(false)

  // sync startingPoint with incoming locationAddress (don't override user-entered value)
  useEffect(() => {
    if (locationAddress && (startingPoint === 'Select Location' || !startingPoint)) {
      setStartingPoint(locationAddress)
      setErrors(prev => ({ ...prev, startingPoint: null }))
    }
  }, [locationAddress])

  // keep cities array length in sync with numCities
  useEffect(() => {
    setCities(prev => {
      if (prev.length === numCities) return prev
      if (prev.length < numCities) {
        const toAdd = Array.from({ length: numCities - prev.length }, () => ({
          to: '',
          arrivalDate: '',
          departureDate: '',
        }))
        return [...prev, ...toAdd]
      }
      return prev.slice(0, numCities)
    })

    // also resize city-level errors
    setErrors(prev => {
      const cityErrs = prev.cities ? [...prev.cities] : []
      const newCityErrs = cityErrs.slice(0, numCities)
      while (newCityErrs.length < numCities) newCityErrs.push({ to: null, arrivalDate: null, departureDate: null })
      return { ...prev, cities: newCityErrs }
    })
  }, [numCities])

  // keep passenger details in sync with noOfPassengers
  useEffect(() => {
    const needed = Math.max(0, noOfPassengers - 1)
    setPassengerDetails(prev => {
      if (prev.length === needed) return prev
      if (prev.length < needed) {
        const toAdd = Array.from({ length: needed - prev.length }, () => ({ name: '', userId: '' }))
        return [...prev, ...toAdd]
      }
      return prev.slice(0, needed)
    })

    setErrors(prevErr => {
      const pd = prevErr.passengerDetails || []
      const newPd = pd.slice(0, needed)
      while (newPd.length < needed) newPd.push({ name: null, userId: null })
      return { ...prevErr, passengerDetails: newPd }
    })
  }, [noOfPassengers])

  const updateCityField = useCallback((index: number, field: keyof CityEntry, value: string) => {
    setCities(prev => prev.map((c, i) => (i === index ? { ...c, [field]: value } : c)))
    // clear field-level error
    setErrors(prev => {
      const cityErrs = prev.cities ? [...prev.cities] : []
      if (!cityErrs[index]) cityErrs[index] = {}
      cityErrs[index] = { ...cityErrs[index], [field]: null }
      return { ...prev, cities: cityErrs }
    })
  }, [])

  const updatePassengerField = useCallback((index: number, field: 'name' | 'userId', value: string) => {
    setPassengerDetails(prev => prev.map((p, i) => (i === index ? { ...p, [field]: value } : p)))
    setErrors(prev => {
      const pd = prev.passengerDetails ? [...prev.passengerDetails] : []
      if (!pd[index]) pd[index] = {}
      pd[index] = { ...pd[index], [field]: null }
      return { ...prev, passengerDetails: pd }
    })
  }, [])

  // open city picker for a specific city index
  const openCityPicker = (index: number) => {
    setPickerIndex(index)
    // clear relevant city 'to' error when opening picker
    setErrors(prev => {
      const cityErrs = prev.cities ? [...prev.cities] : []
      if (!cityErrs[index]) cityErrs[index] = {}
      cityErrs[index] = { ...cityErrs[index], to: null }
      return { ...prev, cities: cityErrs }
    })
    setPickerVisible(true)
  }

  const handleCitySelect = (item: LocationItem) => {
    const idx = pickerIndex ?? -1
    const name = (item.name ?? '').trim()

    if (idx < 0) {
      setPickerVisible(false)
      setPickerIndex(null)
      return
    }

    // prevent choosing same as starting location (consistent with RoundTrip behavior)
    if (name && name === startingPoint) {
      Alert.alert('Choose different destination', 'From and To cannot be the same.')
      return
    }

    setCities(prev => {
      const next = [...prev]
      next[idx] = { ...next[idx], to: name || '' }
      return next
    })

    setErrors(prev => {
      const cityErrs = prev.cities ? [...prev.cities] : []
      if (!cityErrs[idx]) cityErrs[idx] = {}
      cityErrs[idx] = { ...cityErrs[idx], to: null }
      return { ...prev, cities: cityErrs }
    })

    setPickerVisible(false)
    setPickerIndex(null)
  }

  // calendar selection handler: sets appropriate city date or return date
  const onCalendarSelect = useCallback(
    (dateString: string) => {
      if (!calendarTarget) return
      if (calendarTarget.type === 'return') {
        // if return date selected earlier than last departure, clear that departure (defensive)
        setReturnDate(dateString)
        setErrors(prev => ({ ...prev, returnDate: null }))
      } else {
        const idx = calendarTarget.index ?? 0
        if (calendarTarget.type === 'arrival') {
          // If chosen arrival is after existing departure, clear departure to avoid conflict
          setCities(prev => {
            const next = [...prev]
            if (next[idx].departureDate && dateString > next[idx].departureDate) {
              next[idx] = { ...next[idx], arrivalDate: dateString, departureDate: '' }
            } else {
              next[idx] = { ...next[idx], arrivalDate: dateString }
            }
            return next
          })
        } else if (calendarTarget.type === 'departure') {
          // If chosen departure is before existing arrival, clear arrival to avoid conflict
          setCities(prev => {
            const next = [...prev]
            if (next[idx].arrivalDate && dateString < next[idx].arrivalDate) {
              next[idx] = { ...next[idx], departureDate: dateString, arrivalDate: '' }
            } else {
              next[idx] = { ...next[idx], departureDate: dateString }
            }
            return next
          })
        }
        // clear any city-level date error
        setErrors(prev => {
          const cityErrs = prev.cities ? [...prev.cities] : []
          if (!cityErrs[idx]) cityErrs[idx] = {}
          if (calendarTarget.type === 'arrival') cityErrs[idx].arrivalDate = null
          else cityErrs[idx].departureDate = null
          return { ...prev, cities: cityErrs }
        })
      }
      // close calendar
      setCalendarVisible(false)
      setCalendarTarget(null)
    },
    [calendarTarget]
  )

  // basic validation and submit
  const onSubmit = useCallback(async () => {
    setIsSubmitting(true)
    setErrors({})

    let hasError = false
    const nextErrors: typeof errors = { cities: [], passengerDetails: [] }

    if (!startingPoint || startingPoint === 'Select Location') {
      nextErrors.startingPoint = 'Please select starting location'
      hasError = true
    }

    // validate each city
    cities.forEach((c, idx) => {
      const e: any = {}
      if (!c.to || c.to.trim().length === 0) {
        e.to = 'Please enter destination'
        hasError = true
      }
      if (!c.arrivalDate) {
        e.arrivalDate = 'Please select arrival date'
        hasError = true
      }
      if (!c.departureDate) {
        e.departureDate = 'Please select departure date'
        hasError = true
      }
      nextErrors.cities![idx] = e
    })

    // return date required (as per screenshot)
    if (!returnDate) {
      nextErrors.returnDate = 'Please select return date'
      hasError = true
    }

    if (!purpose) {
      nextErrors.purpose = 'Please select purpose of trip'
      hasError = true
    }

    // validate passenger details if present
    if (passengerDetails.length > 0) {
      passengerDetails.forEach((p, idx) => {
        const pdErr: any = {}
        if (!p.name || p.name.trim().length === 0) {
          pdErr.name = 'Please enter name'
          hasError = true
        }
        if (!p.userId || p.userId.trim().length === 0) {
          pdErr.userId = 'Please enter user id'
          hasError = true
        }
        nextErrors.passengerDetails![idx] = pdErr
      })
    }

    if (hasError) {
      nextErrors.submit = 'Please fill all the required details'
      setErrors(nextErrors)
      setIsSubmitting(false)
      return
    }

    // success: simulate delay and reset (same pattern as your other components)
    await new Promise(res => setTimeout(res, 600))
    Alert.alert('Trip added', 'Your multi-city trip was added successfully.')

    // reset
    setStartingPoint(locationAddress || 'Select Location')
    setNumCities(MIN_CITIES)
    setCities(Array.from({ length: MIN_CITIES }, () => ({ to: '', arrivalDate: '', departureDate: '' })))
    setReturnDate('')
    setNoOfPassengers(1)
    setPassengerDetails([])
    setPurpose('')
    setPurposeOptionsOpen(false)

    setErrors({
      startingPoint: null,
      cities: Array.from({ length: MIN_CITIES }, () => ({ to: null, arrivalDate: null, departureDate: null })),
      returnDate: null,
      purpose: null,
      passengerDetails: [],
      submit: null,
    })

    setIsSubmitting(false)
  }, [startingPoint, cities, returnDate, purpose, passengerDetails, locationAddress])

  // UI helpers
  const todayISO = useMemo(() => new Date().toISOString().split('T')[0], [])

  // handlers for calendar opening
  const openCalendarFor = (type: 'arrival' | 'departure' | 'return', index?: number) => {
    setCalendarTarget({ type, index })
    setCalendarVisible(true)
  }

  return (
    <View className="w-full">
      {/* Header row: From & Number of cities */}
      <View className="w-[95%] mx-auto mt-3 flex-row gap-2">
        <View className="flex-1 bg-[#F3F4F6] rounded-2xl p-3 shadow ">
          <Text className="text-[13px] font-bold text-[#111827]">From</Text>
          <Text className="text-[18px] font-bold mt-2">{startingPoint || 'Select Location'}</Text>
          <Text className="text-[12px] text-[#6B7280] mt-1">{startingPoint ? '' : 'Select your start city'}</Text>
          {errors.startingPoint ? <Text className="text-red-600 text-[12px] mt-2">{errors.startingPoint}</Text> : null}
        </View>

        <View className="w-[45%] bg-[#F3F4F6] rounded-2xl p-3 justify-center shadow">
          <Text className="text-[13px] font-bold text-[#111827]">Number of cities</Text>
          <View className="flex-row items-center justify-between mt-2">
            <Text className="text-[20px] font-bold">{numCities}</Text>
            <View>
              <TouchableOpacity onPress={() => setNumCities(n => n + 1)} className="p-1">
                <Ionicons name="chevron-up-outline" size={18} color="#6B6BFF" />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setNumCities(n => Math.max(MIN_CITIES, n - 1))} className="p-1">
                <Ionicons name="chevron-down-outline" size={18} color="#6B6BFF" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>

      {/* Dynamic city blocks */}
      <View className="w-[95%] mx-auto mt-4">
        {cities.map((c, idx) => (
          <View key={idx} className="mb-3">
            <View className="bg-[#F3F4F6] rounded-2xl p-3">
              <Text className="text-[14px] font-bold text-[#111827] mb-2">To</Text>

              {/* Replaced TextInput with Touchable that opens LocationPickerModal */}
              <TouchableOpacity onPress={() => openCityPicker(idx)}>
                <Text className={`text-[16px] py-1 ${c.to ? 'text-[#111827]' : 'text-[#9CA3AF]'}`}>
                  {c.to || `City ${idx + 1}`}
                </Text>
              </TouchableOpacity>

              {errors.cities?.[idx]?.to ? <Text className="text-red-600 text-[12px] mt-2">{errors.cities[idx].to}</Text> : null}
            </View>

            <View className="flex-row gap-2 mt-2">
              <TouchableOpacity className="flex-1 bg-[#F3F4F6] rounded-2xl p-3 min-h-[80px] justify-center" onPress={() => openCalendarFor('arrival', idx)}>
                <Text className="text-[13px] font-bold">Arrival</Text>
                <Text className="text-[16px] font-bold text-[#111827] mt-2">{c.arrivalDate ? formatDisplay(c.arrivalDate) : 'Select Date'}</Text>
                {errors.cities?.[idx]?.arrivalDate ? <Text className="text-red-600 text-[12px] mt-2">{errors.cities[idx].arrivalDate}</Text> : null}
              </TouchableOpacity>

              <TouchableOpacity className="flex-1 bg-[#E6EEF9] rounded-2xl p-3 min-h-[80px] justify-center" onPress={() => openCalendarFor('departure', idx)}>
                <Text className="text-[13px] font-bold">Departure</Text>
                <Text className="text-[16px] font-bold text-[#111827] mt-2">{c.departureDate ? formatDisplay(c.departureDate) : 'Select Date'}</Text>
                {errors.cities?.[idx]?.departureDate ? <Text className="text-red-600 text-[12px] mt-2">{errors.cities[idx].departureDate}</Text> : null}
              </TouchableOpacity>
            </View>
          </View>
        ))}

        {/* Final return card (to starting point) */}
        <View className="mt-2">
          <View className="bg-[#F3F4F6] rounded-2xl p-3">
            <Text className="text-[14px] font-bold text-[#111827]">Return</Text>
            <Text className="text-[16px] py-1">{startingPoint || 'Select Location'}</Text>
            
          </View>

          <View className="mt-2">
            <TouchableOpacity className="bg-[#F3F4F6] rounded-2xl p-3 min-h-[70px] justify-center" onPress={() => openCalendarFor('return')}>
              <Text className="text-[13px] font-bold">Return Date</Text>
              <Text className="text-[16px] font-bold text-[#111827] mt-2">{returnDate ? formatDisplay(returnDate) : 'Select Date'}</Text>
              {errors.returnDate ? <Text className="text-red-600 text-[12px] mt-2">{errors.returnDate}</Text> : null}
            </TouchableOpacity>
          </View>
        </View>

        {/* Travelers & Class */}
        <View className="bg-[#F3F4F6] rounded-2xl p-3 mt-3">
          <Text className="text-[13px] font-bold text-[#111827]">Travelers & Class</Text>
          <View className="flex-row items-center justify-between mt-2">
            <View className='flex-row items-center gap-2'>
              <Text className="font-bold text-[20px]">{noOfPassengers}</Text>
              <Text>Travellers</Text>
            </View>
            <View>
              <TouchableOpacity onPress={() => setNoOfPassengers(p => p + 1)} className="p-1">
                <Ionicons name="chevron-up-outline" size={22} color="#6B6BFF" />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setNoOfPassengers(p => Math.max(1, p - 1))} className="p-1">
                <Ionicons name="chevron-down-outline" size={22} color="#6B6BFF" />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Member details */}
        {noOfPassengers > 1 && (
          <View className="mt-3">
            <Text className="font-semibold mb-2">Travelling with a group? Add group members</Text>
            {passengerDetails.map((p, idx) => (
              <AddMember
                key={idx}
                index={idx}
                name={p.name}
                userId={p.userId}
                onChange={updatePassengerField}
                nameError={errors.passengerDetails?.[idx]?.name || null}
                userIdError={errors.passengerDetails?.[idx]?.userId || null}
              />
            ))}
          </View>
        )}

        {/* Purpose dropdown */}
        <View className='w-[95%] mx-auto mt-4 bg-[#ECECEC] rounded-2xl shadow'>
        <TouchableOpacity
          onPress={() => setPurposeOptionsOpen(!purposeOptionsOpen)}
          className={`px-4 py-3.5 flex-row items-center justify-between ${purposeOptionsOpen ? 'border-b border-gray-300' : ''}`}
        >
          <View className='flex-1'>
            <Text className='text-base font-semibold text-gray-700 mb-0.5'>
              Purpose of Trip
            </Text>
            <Text className='text-sm text-gray-500'>
              {purpose ? purposeOptions.find(opt => opt.value === purpose)?.label : 'Select purpose'}
            </Text>
          </View>
          <Ionicons name={purposeOptionsOpen ? "chevron-up-outline" : "chevron-down-outline"} size={18} color="#6B6BFF" />
        </TouchableOpacity>
        {/* inline error for purpose */}
        {errors.purpose ? <Text style={{ color: '#DC2626', marginLeft: 16, marginTop: 8, fontSize: 12 }}>{errors.purpose}</Text> : null}

        {/* Inline Dropdown Options */}
        {purposeOptionsOpen && (
          <View className='bg-white rounded-b-lg overflow-hidden'>
            {purposeOptions.map((option, index) => (
              <TouchableOpacity
                key={option.value}
                onPress={() => {
                  setPurpose(option.value)
                  setPurposeOptionsOpen(false)
                }}
                className={`py-4 px-5 ${purpose === option.value ? 'bg-gray-50' : 'bg-white'} ${index < purposeOptions.length - 1 ? 'border-b border-gray-100' : ''}`}
              >
                <Text className={`text-base ${purpose === option.value ? 'font-semibold text-blue-600' : 'font-medium text-gray-700'}`}>
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      <View className='w-[80%] mx-auto mt-4 flex-col items-center '>
        <Text className='font-semibold text-[15px] '>
          Additional Information
        </Text>

        <View className='flex-row gap-7 mt-3'>
          <Link href="/hotel-booking">
            <View className='flex-col items-center justify-center'>
              <View
                className='p-4 bg-white rounded-xl border border-gray-200'
                style={{
                  shadowColor: 'black',
                  shadowOffset: { width: 0, height: 0 },
                  shadowOpacity: 0.18,
                  shadowRadius: 4, // Equal spread on all sides
                  elevation: 4,
                }}
              >
                <Ionicons name="bed-outline" size={25} color="black" />
              </View>
              <Text className='text-[12px] font-medium mt-2'>Hotels</Text>
            </View>
          </Link>

          <Link href="/flight-ticket">
            <View className='flex-col items-center justify-center'>
              <View
                className='p-4 bg-white rounded-xl border border-gray-200'
                style={{
                  shadowColor: 'black',
                  shadowOffset: { width: 0, height: 0 },
                  shadowOpacity: 0.18,
                  shadowRadius: 4, // Equal spread on all sides
                  elevation: 4,
                }}
              >
                <Ionicons name="airplane-outline" size={25} color="black" />
              </View>
              <Text className='text-[12px] font-medium mt-2'>Flights</Text>
            </View>
          </Link>

          <Link href="/train-ticket">
            <View className=' flex-col items-center justify-center'>
              <View
                className='p-4 bg-white rounded-xl border border-gray-200'
                style={{
                  shadowColor: 'black',
                  shadowOffset: { width: 0, height: 0 },
                  shadowOpacity: 0.18,
                  shadowRadius: 4, // Equal spread on all sides
                  elevation: 4,
                }}
              >
                <Ionicons name="train-outline" size={25} color="black" />
              </View>
              <Text className='text-[12px] font-medium mt-2'>Trains</Text>
            </View>
          </Link>
        </View>

      </View>

        {/* Submit button */}
        <TouchableOpacity onPress={onSubmit} disabled={isSubmitting} className="bg-[#6B6BFF] w-[90%] mx-auto mt-4 rounded-full py-4 items-center">
          {isSubmitting ? <ActivityIndicator color="white" /> : <Text className="text-white font-semibold">Add Trip</Text>}
        </TouchableOpacity>

        {typeof errors.submit === 'string' && errors.submit.length > 0 ? (
          <Text className="text-red-600 text-center mt-2">{errors.submit}</Text>
        ) : null}
      </View>

      {/* Calendar modal */}
      <Calendar
        visible={calendarVisible}
        onClose={() => { setCalendarVisible(false); setCalendarTarget(null) }}
        selectedDate={
          calendarTarget
            ? calendarTarget.type === 'return'
              ? returnDate
              : cities[calendarTarget.index ?? 0][calendarTarget.type === 'arrival' ? 'arrivalDate' : 'departureDate']
            : ''
        }
        onSelectDate={onCalendarSelect}
        minDate={todayISO}
      />

      {/* Location picker modal for city stops */}
      <LocationPickerModal
        visible={pickerVisible}
        onClose={() => { setPickerVisible(false); setPickerIndex(null) }}
        onSelect={handleCitySelect}
        locations={locations ?? []}
        loading={locationsLoading}
        title={pickerIndex === null ? "Select city" : `Select city for stop ${pickerIndex + 1}`}
        placeholder="Type city or state..."
      />

      {/* Retry button if locations failed to load */}
      {locationsError ? (
        <TouchableOpacity onPress={() => refetch()} className="mt-2 w-[95%] mx-auto">
          <Text className="text-blue-600 text-center">Retry loading locations</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  )
}

// small helper to format YYYY-MM-DD -> "24 Sep'25"
const formatDisplay = (dateString: string) => {
  if (!dateString) return ''
  const d = new Date(dateString)
  const month = d.toLocaleDateString('en-US', { month: 'short' })
  const day = d.toLocaleDateString('en-US', { day: 'numeric' })
  const year = d.toLocaleDateString('en-US', { year: '2-digit' })
  return `${day} ${month}${'\u2019'}${year}` // e.g. 24 Sep’25
}

export default MultiTrip
