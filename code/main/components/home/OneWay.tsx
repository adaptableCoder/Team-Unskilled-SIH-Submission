import { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DeviceEventEmitter } from 'react-native';
import { useRouter } from "expo-router";
import AddMember from "@/components/home/AddMember";
import Calendar from "@/components/Calendar";
import { Ionicons } from "@expo/vector-icons";

// Modal (default export) and canonical LocationItem type from hooks
import LocationPickerModal from "@/components/cityInputModal";
import type { LocationItem } from "@/hooks/fetchCities";
import { useFetch } from "@/hooks/useFetch";
import { fetchCities } from "@/hooks/fetchCities";

const OneWay = ({
  locationAddress
}: {
  locationAddress: string | null;
}) => {
  // Generate a session ID for temporary trip planning
  const [sessionId] = useState(() => Date.now().toString() + Math.random().toString(36).substr(2, 9))

  // Transfer images from session to final trip
  const transferSessionImages = async (fromSessionId: string, toTripId: string) => {
    try {
      const sessionImagesStr = await AsyncStorage.getItem(`trip_images_${fromSessionId}`)
      if (sessionImagesStr) {
        const sessionImages = JSON.parse(sessionImagesStr)
        if (sessionImages.length > 0) {
          await AsyncStorage.setItem(`trip_images_${toTripId}`, sessionImagesStr)
          // Clean up session images
          await AsyncStorage.removeItem(`trip_images_${fromSessionId}`)
        }
      }
    } catch (error) {
      console.error('Error transferring session images:', error)
    }
  }
  const router = useRouter()
  // core states
  const [calenderVisible, setcalenderVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState("");
  const [noOfPassengers, setNoOfPassengers] = useState(1);
  const [purpose, setpurpose] = useState("");
  const [purposeOptionsOpen, setPurposeOptionsOpen] = useState(false);
  const [modeOfTransport, setModeOfTransport] = useState("");
  const [transportOptionsOpen, setTransportOptionsOpen] = useState(false);

  const purposeOptions = [
    { label: "Work", value: "work" },
    { label: "Education", value: "education" },
    { label: "Leisure", value: "leisure" },
  ];

  const transportOptions = [
    { label: "Flight", value: "flight", icon: "airplane-outline" },
    { label: "Train", value: "train", icon: "train-outline" },
    { label: "Bus/Metro", value: "bus", icon: "bus-outline" },
    { label: "Car", value: "car", icon: "car-outline" },
    { label: "Bike/Scooter", value: "bike", icon: "bicycle-outline" },
  ];

  // starting point & destination
  const [startingPoint, setstartingPoint] = useState(locationAddress || "Select Location");

  const [destination, setDestination] = useState<string>("Select Destination");

  // passengers
  const [passengerDetails, setPassengerDetails] = useState<{ name: string; userId: string }[]>(
    []
  );

  const [errors, setErrors] = useState<{
    startingPoint?: string | null;
    destination?: string | null;
    selectedDate?: string | null;
    purpose?: string | null;
    modeOfTransport?: string | null;
    passengerDetails?: { name?: string | null; userId?: string | null }[];
    submit?: string | null;
  }>({});

  const [isSubmitting, setIsSubmitting] = useState(false);

  // keep startingPoint synced if locationAddress arrives later
  useEffect(() => {
    if (locationAddress && (startingPoint === "Select Location" || !startingPoint)) {
      setstartingPoint(locationAddress);
      setErrors((prev) => ({ ...prev, startingPoint: null }));
    }
  }, [locationAddress]);

  // sync passengerDetails length with noOfPassengers
  useEffect(() => {
    const needed = Math.max(0, noOfPassengers - 1);
    setPassengerDetails((prev) => {
      if (prev.length === needed) return prev;
      if (prev.length < needed) {
        const toAdd = Array.from({ length: needed - prev.length }, () => ({ name: "", userId: "" }));
        return [...prev, ...toAdd];
      }
      return prev.slice(0, needed);
    });

    setErrors((prevErr) => {
      const pd = prevErr.passengerDetails || [];
      const newPd = pd.slice(0, needed);
      while (newPd.length < needed) newPd.push({ name: null, userId: null });
      return { ...prevErr, passengerDetails: newPd };
    });
  }, [noOfPassengers]);

  const updatePassengerField = useCallback(
    (index: number, field: "name" | "userId", value: string) => {
      setPassengerDetails((prev) => prev.map((p, i) => (i === index ? { ...p, [field]: value } : p)));
      setErrors((prev) => {
        const pd = prev.passengerDetails ? [...prev.passengerDetails] : [];
        if (!pd[index]) pd[index] = {};
        pd[index] = { ...pd[index], [field]: null };
        return { ...prev, passengerDetails: pd };
      });
    },
    []
  );

  const formatDisplayDate = (dateString: string) => {
    if (!dateString) return { month: "Select", day: "--", year: "", weekday: "Date" };
    const date = new Date(dateString);
    return {
      month: date.toLocaleDateString("en-US", { month: "short" }),
      day: date.toLocaleDateString("en-US", { day: "numeric" }),
      year: date.toLocaleDateString("en-US", { year: "2-digit" }),
      weekday: date.toLocaleDateString("en-US", { weekday: "long" }),
    };
  };

  // -------------------------
  // fetch locations (hardcoded bundle or API implementation)
  // -------------------------
  const { data: locations, loading: locationsLoading, error: locationsError, refetch } =
    useFetch<LocationItem[]>(fetchCities, true);

  // debug: log sample of locations; remove in production
  useEffect(() => {
    if (locations) {
      console.log("[OneWay] locations sample:", locations.slice(0, 8));
    }
  }, [locations]);

  // -------------------------
  // Submit
  // -------------------------
  const onSubmit = useCallback(async () => {
    setIsSubmitting(true);
    setErrors({});
    let hasError = false;
    const nextErrors: typeof errors = { passengerDetails: [] };

    if (!startingPoint || startingPoint === "Select Location") {
      nextErrors.startingPoint = "Please select starting location";
      hasError = true;
    }
    if (!destination || destination === "Select Destination") {
      nextErrors.destination = "Please select destination";
      hasError = true;
    }
    if (!selectedDate) {
      nextErrors.selectedDate = "Please select departure date";
      hasError = true;
    }
    if (!purpose) {
      nextErrors.purpose = "Please select purpose of trip";
      hasError = true;
    }
    if (!modeOfTransport) {
      nextErrors.modeOfTransport = "Please select mode of transport";
      hasError = true;
    }

    if (passengerDetails.length > 0) {
      passengerDetails.forEach((p, idx) => {
        const pdErr: any = {};
        if (!p.name?.trim()) {
          pdErr.name = "Please enter name";
          hasError = true;
        }
        if (!p.userId?.trim()) {
          pdErr.userId = "Please enter user id";
          hasError = true;
        }
        nextErrors.passengerDetails![idx] = pdErr;
      });
    }

    if (hasError) {
      nextErrors.submit = "Please fill all the required details";
      setErrors(nextErrors);
      setIsSubmitting(false);
      return;
    }

    // mimic server processing
    await new Promise((res) => setTimeout(res, 600));
    Alert.alert("Trip added", "Your trip details are added in your profile.");

    // persist upcoming trip for profile page (append to upcoming_trips list)
    try {
      const { day, month, year, weekday } = formatDisplayDate(selectedDate);
      const dateDisplay = `${month}\u2019${year}, ${weekday}`;
      const tripId = Date.now().toString() + Math.random().toString(36).substr(2, 9);
      
      // Transfer session images to the final trip
      await transferSessionImages(sessionId, tripId);
      
      const tripObj = {
        id: tripId, // Generate unique ID
        heading: 'Upcoming Trip',
        fromAddress: startingPoint,
        toAddress: destination,
        dateDay: day,
        date: dateDisplay,
        tripStartTime: '',
        purpose: purpose || '',
        tripReturnTime: '',
        returnDate: '',
        modeOfTransport: modeOfTransport || '',
        __raw: {
          selectedDate,
          noOfPassengers,
          passengerDetails,
          purpose,
          modeOfTransport,
          startingPoint,
          destination,
        }
      };
  const raw = await AsyncStorage.getItem('upcoming_trips');
  const arr = raw ? JSON.parse(raw) : [];
  arr.unshift(tripObj);
  await AsyncStorage.setItem('upcoming_trips', JSON.stringify(arr));
  // emit update so profile can refresh immediately
  DeviceEventEmitter.emit('upcoming_trips_updated');
    } catch (e) {
      console.warn('Failed to save upcoming trip', e);
    }

    // reset
    setcalenderVisible(false);
    setSelectedDate("");
    setNoOfPassengers(1);
    setpurpose("");
    setPurposeOptionsOpen(false);
    setModeOfTransport("");
    setTransportOptionsOpen(false);
    setstartingPoint(locationAddress || "Select Location");
    setPassengerDetails([]);
    setDestination("Select Destination");
    setIsSubmitting(false);

    // Explicitly clear errors
    setErrors(prev => ({
      ...prev,
      startingPoint: null,
      selectedDate: null,
      selectedReturnDate: null,
      purpose: null,
      modeOfTransport: null,
      passengerDetails: [],
      submit: null
    }))
  }, [startingPoint, destination, selectedDate, purpose, passengerDetails, locationAddress, modeOfTransport]);

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

  // -------------------------
  // UI
  // -------------------------
  return (
    <View className="w-full">
      <View className="w-[95%] mx-auto flex-row mt-4 gap-2">
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
      <View className="w-[95%] mx-auto mt-4 bg-[#ECECEC] rounded-2xl p-3 shadow">
        <View className="flex-row items-center">
          <Text className="font-semibold text-[14px] text-gray-800">Departure</Text>
          <TouchableOpacity onPress={() => setcalenderVisible(true)}>
            <Ionicons name="chevron-down-outline" size={18} color="#6B6BFF" />
          </TouchableOpacity>
        </View>

        {selectedDate ? (
          (() => {
            const { day, month, year, weekday } = formatDisplayDate(selectedDate);
            return (
              <View>
                <View className="flex-row items-baseline">
                  <Text className="font-bold text-[30px] text-black mr-2">{day}</Text>
                  <Text className="font-medium text-[20px] text-gray-700">{`${month}'${year}`}</Text>
                </View>
                <Text className="font-medium text-[16px] text-gray-600">{weekday}</Text>
              </View>
            );
          })()
        ) : (
          <Text className="font-bold text-[18px] text-gray-600">Select Date</Text>
        )}

        {/* inline error for date */}
        {errors.selectedDate ? <Text style={{ color: "#DC2626", marginTop: 6, fontSize: 12 }}>{errors.selectedDate}</Text> : null}

        <Calendar
          visible={calenderVisible}
          onClose={() => setcalenderVisible(false)}
          selectedDate={selectedDate}
          onSelectDate={setSelectedDate}
          minDate={new Date().toISOString().split("T")[0]}
        />
      </View>

      {/* Travelers */}
      <View className="w-[95%] mx-auto mt-4 bg-[#ECECEC] rounded-2xl p-3 shadow flex-row justify-between items-center">
        <View>
          <Text className="font-bold text-[14px]">Travelers</Text>
          <View className="flex-row gap-2 items-center">
            <Text className="font-bold text-[20px]">{noOfPassengers}</Text>
            <Text className="font-medium text-[15px]">Travellers</Text>
          </View>
        </View>

        <View>
          <TouchableOpacity onPress={() => setNoOfPassengers((prev) => prev + 1)}>
            <Ionicons name="chevron-up-outline" size={18} color="#6B6BFF" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => noOfPassengers > 1 && setNoOfPassengers((prev) => prev - 1)}>
            <Ionicons name="chevron-down-outline" size={18} color="#6B6BFF" />
          </TouchableOpacity>
        </View>
      </View>

      {noOfPassengers > 1 && (
        <View className="w-[95%] mx-auto mt-4">
          <Text className="font-semibold text-[16px] mb-2">Add group members</Text>
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

      {/* Mode of Transport */}
      <View className="w-[95%] mx-auto mt-4 bg-[#ECECEC] rounded-2xl shadow">
        <TouchableOpacity
          onPress={() => {
            setTransportOptionsOpen(!transportOptionsOpen);
            setErrors(prev => ({ ...prev, modeOfTransport: null }));
          }}
          className={`px-4 py-3.5 flex-row items-center justify-between ${transportOptionsOpen ? "border-b border-gray-300" : ""}`}
        >
          <View className="flex-1">
            <Text className="text-base font-semibold text-gray-700">Mode of Transport</Text>
            <View className="flex-row items-center mt-1">
              {modeOfTransport && (
                <Ionicons 
                  name={transportOptions.find(opt => opt.value === modeOfTransport)?.icon as any || "help-outline"} 
                  size={16} 
                  color="#6B6BFF" 
                  style={{ marginRight: 6 }}
                />
              )}
              <Text className="text-sm text-gray-500">
                {modeOfTransport ? transportOptions.find((opt) => opt.value === modeOfTransport)?.label : "Select transport mode"}
              </Text>
            </View>
          </View>
          <Ionicons name={transportOptionsOpen ? "chevron-up-outline" : "chevron-down-outline"} size={18} color="#6B6BFF" />
        </TouchableOpacity>

        {errors.modeOfTransport ? <Text className="text-red-600 text-xs ml-4 mt-1">{errors.modeOfTransport}</Text> : null}

        {transportOptionsOpen && (
          <View className="bg-white rounded-b-lg overflow-hidden">
            {transportOptions.map((option, index) => (
              <TouchableOpacity
                key={option.value}
                onPress={() => {
                  setModeOfTransport(option.value);
                  setTransportOptionsOpen(false);
                  setErrors(prev => ({ ...prev, modeOfTransport: null }));
                }}
                className={`py-4 px-5 flex-row items-center ${modeOfTransport === option.value ? "bg-gray-50" : "bg-white"} ${index < transportOptions.length - 1 ? "border-b border-gray-100" : ""}`}
              >
                <Ionicons name={option.icon as any} size={20} color={modeOfTransport === option.value ? "#6B6BFF" : "#6B7280"} />
                <Text className={`text-base ml-3 ${modeOfTransport === option.value ? "font-semibold text-blue-600" : "font-medium text-gray-700"}`}>
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      {/* Purpose */}
      <View className="w-[95%] mx-auto mt-4 bg-[#ECECEC] rounded-2xl shadow">
        <TouchableOpacity
          onPress={() => setPurposeOptionsOpen(!purposeOptionsOpen)}
          className={`px-4 py-3.5 flex-row items-center justify-between ${purposeOptionsOpen ? "border-b border-gray-300" : ""}`}
        >
          <View className="flex-1">
            <Text className="text-base font-semibold text-gray-700">Purpose of Trip</Text>
            <Text className="text-sm text-gray-500">
              {purpose ? purposeOptions.find((opt) => opt.value === purpose)?.label : "Select purpose"}
            </Text>
          </View>
          <Ionicons name={purposeOptionsOpen ? "chevron-up-outline" : "chevron-down-outline"} size={18} color="#6B6BFF" />
        </TouchableOpacity>

        {errors.purpose ? <Text className="text-red-600 text-xs ml-4 mt-1">{errors.purpose}</Text> : null}

        {purposeOptionsOpen && (
          <View className="bg-white rounded-b-lg overflow-hidden">
            {purposeOptions.map((option, index) => (
              <TouchableOpacity
                key={option.value}
                onPress={() => {
                  setpurpose(option.value);
                  setPurposeOptionsOpen(false);
                }}
                className={`py-4 px-5 ${purpose === option.value ? "bg-gray-50" : "bg-white"} ${index < purposeOptions.length - 1 ? "border-b border-gray-100" : ""}`}
              >
                <Text className={`text-base ${purpose === option.value ? "font-semibold text-blue-600" : "font-medium text-gray-700"}`}>
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
          <TouchableOpacity onPress={() => router.push(`/camera?headerTitle=Capture%20ticket%20%2F%20booking%20reference&headerSubtitle=Please%20take%20a%20clear%20photo%20of%20your%20hotel%20booking.&tripId=${sessionId}&imageType=hotel`)}>
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
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.push(`/camera?headerTitle=Capture%20ticket%20%2F%20booking%20reference&headerSubtitle=Please%20take%20a%20clear%20photo%20of%20your%20flight%20ticket.&tripId=${sessionId}&imageType=flight`)}>
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
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.push(`/camera?headerTitle=Capture%20ticket%20%2F%20booking%20reference&headerSubtitle=Please%20take%20a%20clear%20photo%20of%20your%20train%20ticket.&tripId=${sessionId}&imageType=train`)}>
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
          </TouchableOpacity>
        </View>

      </View>

      {/* Submit / Plan buttons: two side-by-side */}
      <View className="w-[90%] mx-auto mt-6 flex-row gap-3">
        <TouchableOpacity
          onPress={onSubmit}
          disabled={isSubmitting}
          className="flex-1 bg-[#6B6BFF] rounded-full py-4 shadow flex-row justify-center items-center"
        >
          {isSubmitting ? <ActivityIndicator size="small" color="white" /> : <Text className="text-white font-medium text-[15px]">Add Trip</Text>}
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => router.push('/plan')}
          disabled={isSubmitting}
          className="flex-1 bg-white border border-gray-300 rounded-full py-4 shadow flex-row justify-center items-center"
        >
          <Text className="text-[#374151] font-medium text-[15px]">Plan Trip</Text>
        </TouchableOpacity>
      </View>

      {errors.submit ? <Text className="text-red-600 text-center mt-2">{errors.submit}</Text> : null}

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
  );
};

export default OneWay;
