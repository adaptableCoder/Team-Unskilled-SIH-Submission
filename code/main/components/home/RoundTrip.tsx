import { useState, useCallback, useEffect } from 'react'
import { View, Text, TouchableOpacity, Alert, ActivityIndicator } from 'react-native'
import { Link } from 'expo-router'
import AddMember from '@/components/home/AddMember' // adjust path if needed
import Calendar from '@/components/Calendar' // reusable calendar
import { Ionicons } from '@expo/vector-icons'
// Modal (default export) and canonical LocationItem type from hooks
import LocationPickerModal from "@/components/cityInputModal";
import type { LocationItem } from "@/hooks/fetchCities";
import { useFetch } from "@/hooks/useFetch";
import { fetchCities } from "@/hooks/fetchCities";


const RoundTrip = ({
  locationAddress
}: {
  locationAddress: string | null;
}) => {
  const [travelMethod, settravelMethod] = useState("roundTrip")
  const [calenderVisible, setcalenderVisible] = useState(false)
  const [returnCalendarVisible, setReturnCalendarVisible] = useState(false)
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedReturnDate, setSelectedReturnDate] = useState('')
  const [noOfPassengers, setNoOfPassengers] = useState(1)
  const [purpose, setpurpose] = useState("")
  const [purposeOptionsOpen, setPurposeOptionsOpen] = useState(false);
  const [purposeOptions] = useState([
    { label: "Work", value: "work" },
    { label: "Education", value: "education" },
    { label: "Leisure", value: "leisure" }
  ]);
  const [startingPoint, setstartingPoint] = useState(locationAddress || "Select Location")

  const [destination, setDestination] = useState<string>("Select Destination");


  // passenger details for travellers #2..#N
  const [passengerDetails, setPassengerDetails] = useState<{ name: string, userId: string }[]>([])

  // validation errors
  const [errors, setErrors] = useState<{
    startingPoint?: string | null
    destination?: string | null
    selectedDate?: string | null
    selectedReturnDate?: string | null
    purpose?: string | null
    passengerDetails?: { name?: string | null; userId?: string | null }[]
    submit?: string | null
  }>({})

  // submission/loading state
  const [isSubmitting, setIsSubmitting] = useState(false)

  // --- Sync startingPoint to locationAddress when available (don't override user's choice)
  useEffect(() => {
    if (locationAddress && (startingPoint === 'Select Location' || !startingPoint)) {
      setstartingPoint(locationAddress)
      setErrors(prev => ({ ...prev, startingPoint: null }))
    }
  }, [locationAddress, startingPoint])

  // Keep passengerDetails length synced with number of passengers
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

    // also adjust passenger errors length (so indexes match)
    setErrors(prevErr => {
      const pd = prevErr.passengerDetails || []
      const newPd = pd.slice(0, needed)
      while (newPd.length < needed) newPd.push({ name: null, userId: null })
      return { ...prevErr, passengerDetails: newPd }
    })
  }, [noOfPassengers])

  const updatePassengerField = useCallback((index: number, field: 'name' | 'userId', value: string) => {
    setPassengerDetails(prev => prev.map((p, i) => (i === index ? { ...p, [field]: value } : p)))
    // clear field-level error when user types
    setErrors(prev => {
      const pd = prev.passengerDetails ? [...prev.passengerDetails] : []
      if (!pd[index]) pd[index] = {}
      pd[index] = { ...pd[index], [field]: null }
      return { ...prev, passengerDetails: pd }
    })
  }, [])

  const formatDisplayDate = (dateString: string) => {
    if (!dateString) return { month: 'Select', day: '--', year: '', weekday: 'Date' }
    const date = new Date(dateString)
    return {
      month: date.toLocaleDateString('en-US', { month: 'short' }),
      day: date.toLocaleDateString('en-US', { day: 'numeric' }),
      year: date.toLocaleDateString('en-US', { year: '2-digit' }),
      weekday: date.toLocaleDateString('en-US', { weekday: 'long' }),
    }
  }

  // -------------------------
  // fetch locations (hardcoded bundle or API implementation)
  // -------------------------
  const { data: locations, loading: locationsLoading, error: locationsError, refetch } =
    useFetch<LocationItem[]>(fetchCities, true);

  // ---- onSubmit: validates all required fields, shows inline errors, and resets on success
  const onSubmit = useCallback(async () => {
    setIsSubmitting(true)
    setErrors({}) // clear previous errors

    // validation
    let hasError = false
    const nextErrors: typeof errors = { passengerDetails: [] }

    if (!startingPoint || startingPoint === 'Select Location') {
      nextErrors.startingPoint = 'Please select starting location'
      hasError = true
    }

    if (!destination || destination === "Select Destination") {
      nextErrors.destination = "Please select destination";
      hasError = true;
    }

    if (!selectedDate) {
      nextErrors.selectedDate = 'Please select departure date'
      hasError = true
    }

    if (!selectedReturnDate) {
      nextErrors.selectedReturnDate = 'Please select return date'
      hasError = true
    }

    if (!purpose) {
      nextErrors.purpose = 'Please select purpose of trip'
      hasError = true
    }

    // validate passengerDetails entries (if any)
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

    // success path
    await new Promise(res => setTimeout(res, 600))
    Alert.alert('Trip added', 'Your trip details were added successfully.')

    // reset
    settravelMethod("oneWay")
    setcalenderVisible(false)
    setReturnCalendarVisible(false)
    setSelectedDate('')
    setSelectedReturnDate('')
    setNoOfPassengers(1)
    setpurpose("")
    setPurposeOptionsOpen(false)
    setstartingPoint(locationAddress || "Select Location")
    setPassengerDetails([])
    setDestination("Select Destination");

    // Explicitly clear errors
    setErrors(prev => ({
      ...prev,
      startingPoint: null,
      selectedDate: null,
      selectedReturnDate: null,
      purpose: null,
      passengerDetails: [],
      submit: null
    }))

    setIsSubmitting(false)
  }, [
    startingPoint,
    destination,
    selectedDate,
    selectedReturnDate,
    purpose,
    passengerDetails,
    locationAddress
  ])

  // -------------------------
  // Location picker modal handling
  // -------------------------
  const [pickerVisible, setPickerVisible] = useState(false);
  const [pickerMode, setPickerMode] = useState<"from" | "to">("from");

  const openPicker = (mode: "from" | "to") => {
    setPickerMode(mode);
    // clear relevant error when opening picker
    setErrors((prev) => ({ ...prev, [mode === "from" ? "startingPoint" : "destination"]: null }));
    setPickerVisible(true);
  };

  const handleLocationSelect = (item: LocationItem) => {
    const name = (item.name ?? "").trim();

    if (pickerMode === "from") {
      // if selecting same as destination, warn
      if (name && name === destination) {
        Alert.alert("Choose different starting location", "From and To cannot be the same.");
        return;
      }
      setstartingPoint(name || "Select Location");
      setErrors((prev) => ({ ...prev, startingPoint: null }));
    } else {
      // to
      if (name && name === startingPoint) {
        Alert.alert("Choose different destination", "From and To cannot be the same.");
        return;
      }
      setDestination(name || "Select Destination");
      setErrors((prev) => ({ ...prev, destination: null }));
    }
    setPickerVisible(false);
  };

  // Today's date in YYYY-MM-DD format for minDate fallbacks
  const todayISO = new Date().toISOString().split('T')[0]

  // If a departure date is selected, the return calendar should not allow earlier dates
  const returnMinDate = selectedDate ? selectedDate : todayISO
  // If a return date is selected, departure calendar should not allow later dates
  const departureMaxDate = selectedReturnDate ? selectedReturnDate : undefined

  return (
    <View className='w-full'>
      <View className='w-[95%] mx-auto flex-row mt-4 gap-2'>
        {/* FROM */}
        <TouchableOpacity
          className="w-[50%] bg-[#ECECEC] rounded-2xl p-3 shadow"
          onPress={() => openPicker("from")}
        >
          <View className="flex-row items-center gap-1">
            <Text className="text-sm">From</Text>
            <Ionicons name="chevron-down-outline" size={18} color="#6B6BFF" />
          </View>
          <Text className="font-bold text-xl" style={{ color: startingPoint !== "Select Location" ? "#000" : "#9CA3AF" }}>
            {startingPoint}
          </Text>
          {errors.startingPoint ? <Text style={{ color: "#DC2626", marginTop: 6, fontSize: 12 }}>{errors.startingPoint}</Text> : null}
        </TouchableOpacity>

        {/* TO */}
        <TouchableOpacity
          className="w-[50%] bg-[#DEE9F3] rounded-2xl p-3 shadow"
          onPress={() => openPicker("to")}
        >
          <View className="flex-row items-center gap-1">
            <Text className="text-sm">To</Text>
            <Ionicons name="chevron-down-outline" size={18} color="#6B6BFF" />
          </View>
          <Text className="font-bold text-xl" style={{ color: destination !== "Select Destination" ? "#000" : "#9CA3AF" }}>
            {destination}
          </Text>
          {errors.destination ? <Text style={{ color: "#DC2626", marginTop: 6, fontSize: 12 }}>{errors.destination}</Text> : null}
        </TouchableOpacity>
      </View>

       {/* Departure */}
      <View className='w-[95%] mx-auto flex-row items-center  gap-2'>
        <View className='w-[50%] mx-auto mt-4 bg-[#ECECEC] rounded-2xl p-3 shadow'>
          <View className='flex-row items-center '>
            <Text className='font-semibold text-sm text-gray-800'>Departure</Text>
            <TouchableOpacity
              onPress={() => setcalenderVisible(true)}
            >
              <Ionicons name="chevron-down-outline" size={18} color="#6B6BFF" />
            </TouchableOpacity>
          </View>

          {selectedDate ? (
            (() => {
              const { day, month, year, weekday } = formatDisplayDate(selectedDate)
              return (
                <View>
                  <View className='flex-row items-baseline'>
                    <Text className='font-bold text-[30px] text-black leading-none mr-2'>
                      {day}
                    </Text>
                    <Text className='font-medium text-[20px] text-gray-700'>
                      {month}'{year}
                    </Text>
                  </View>
                  <Text className='font-medium text-[16px] text-gray-600 mt-1'>
                    {weekday}
                  </Text>
                </View>
              )
            })()
          ) : (
            <Text className='font-bold text-[18px] mt-1 text-gray-600'>
              Select Date
            </Text>
          )}

          {/* inline error for date */}
          {errors.selectedDate ? <Text style={{ color: '#DC2626', marginTop: 6, fontSize: 12 }}>{errors.selectedDate}</Text> : null}

          {/* departure calendar modal replaced with reusable Calendar */}
          <Calendar
            visible={calenderVisible}
            onClose={() => setcalenderVisible(false)}
            selectedDate={selectedDate}
            onSelectDate={(dateString) => {
              if (selectedReturnDate && dateString > selectedReturnDate) {
                setSelectedReturnDate('')
              }
              setSelectedDate(dateString)
            }}
            minDate={todayISO}
            maxDate={departureMaxDate}
          />
        </View>

        <View className='w-[50%] mx-auto mt-4 bg-[#ECECEC] rounded-2xl p-3 shadow'>
          <View className='flex-row items-center '>
            <Text className='font-semibold text-sm text-gray-800'>Return</Text>
            <TouchableOpacity onPress={() => setReturnCalendarVisible(true)} >
              <Ionicons name="chevron-down-outline" size={18} color="#6B6BFF" />
            </TouchableOpacity>
          </View>

          {selectedReturnDate ? (
            (() => {
              const { day, month, year, weekday } = formatDisplayDate(selectedReturnDate)
              return (
                <View>
                  <View className='flex-row items-baseline'>
                    <Text className='font-bold text-[30px] text-black leading-none mr-2'>
                      {day}
                    </Text>
                    <Text className='font-medium text-[20px] text-gray-700'>
                      {month}'{year}
                    </Text>
                  </View>
                  <Text className='font-medium text-[16px] text-gray-600 mt-1'>
                    {weekday}
                  </Text>
                </View>
              )
            })()
          ) : (
            <Text className='font-bold text-[18px] mt-1 text-gray-600'>
              Select Date
            </Text>
          )}

          {/* inline error for date */}
          {errors.selectedReturnDate ? <Text style={{ color: '#DC2626', marginTop: 6, fontSize: 12 }}>{errors.selectedReturnDate}</Text> : null}

          {/* return calendar modal replaced with reusable Calendar */}
          <Calendar
            visible={returnCalendarVisible}
            onClose={() => setReturnCalendarVisible(false)}
            selectedDate={selectedReturnDate}
            onSelectDate={(dateString) => {
              if (selectedDate && dateString < selectedDate) {
                setSelectedDate('')
              }
              setSelectedReturnDate(dateString)
            }}
            minDate={returnMinDate}
          />
        </View>
      </View>

      <View className='w-[95%] mx-auto mt-4 bg-[#ECECEC] rounded-2xl p-3 shadow flex-row justify-between items-center'>
        <View className='flex-col'>
          <Text className='font-bold text-sm'>Travelers & Class</Text>
          <View className='flex-row gap-2 items-center' >
            <Text className='font-bold text-[20px]'>{noOfPassengers}</Text>
            <Text className='font-medium text-[15px]'>Travellers</Text>
          </View>
        </View>

        <View>
          <TouchableOpacity
            onPress={() => setNoOfPassengers(noOfPassengers + 1)}
          >
            <Ionicons name="chevron-up-outline" size={18} color="#6B6BFF" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              if (noOfPassengers > 1) {
                setNoOfPassengers(noOfPassengers - 1)
              }
            }}
          >
            <Ionicons name="chevron-down-outline" size={18} color="#6B6BFF" />
          </TouchableOpacity>
        </View>
      </View>

      {/* member details */}
      {noOfPassengers > 1 && (
        <View className='w-[95%] mx-auto mt-4'>
          <Text className='font-semibold text-[16px] mb-2'>Travelling with a group? Add group members</Text>

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
                  setpurpose(option.value)
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

      {/* Submit */}
      <TouchableOpacity
        onPress={onSubmit}
        disabled={isSubmitting}
        className='bg-[#6B6BFF] w-[90%] mx-auto mt-6 rounded-full py-4 shadow flex-row justify-center items-center '
      >
        {isSubmitting ? (
          <ActivityIndicator size='small' color='white' />
        ) : (
          <Text className='text-white font-medium text-[15px]'>Add Trip</Text>
        )}
      </TouchableOpacity>

      {/* submission-level error under the button */}
      {errors.submit ? <Text style={{ color: '#DC2626', textAlign: 'center', marginTop: 8 }}>{errors.submit}</Text> : null}

      {/* Location picker modal */}
            <LocationPickerModal
              visible={pickerVisible}
              onClose={() => setPickerVisible(false)}
              onSelect={handleLocationSelect}
              locations={locations ?? []}
              loading={locationsLoading}
              title={pickerMode === "from" ? "Select starting location" : "Select destination"}
              placeholder="Type city or state..."
            />
      
            {locationsError ? (
              <TouchableOpacity onPress={() => refetch()} className="mt-2 w-[95%] mx-auto">
                <Text className="text-blue-600 text-center">Retry loading locations</Text>
              </TouchableOpacity>
            ) : null}
    </View>
  )
}

export default RoundTrip
