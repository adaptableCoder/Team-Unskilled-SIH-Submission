// RecentTrip.tsx
import React from 'react';
import { View, Text, ImageBackground } from 'react-native';

type TripData = {
  from: string;
  to: string;
  departuredate: string;
  returndate: string;
  image?: any;
};

const formatDateRange = (dep: string, ret: string) => {
  const depParts = dep.split(' ');
  const retParts = ret.split(' ');
  const depDayMonth = depParts.length >= 2 ? `${depParts[0]} ${depParts[1]}` : dep;
  const retDayMonthYear = retParts.length === 3 ? `${retParts[0]} ${retParts[1]} ${retParts[2]}` : ret;
  return `${depDayMonth} - ${retDayMonthYear}`;
};

const RecentTrip: React.FC<{ tripData: TripData }> = ({ tripData }) => {
  const dateRange = formatDateRange(tripData.departuredate, tripData.returndate);

  return (
    <View className="bg-white rounded-xl overflow-hidden shadow p-0">
      {tripData.image ? (
        <ImageBackground
          source={tripData.image}
          style={{ width: '100%', height: 140 }}
          imageStyle={{ borderTopLeftRadius: 12, borderTopRightRadius: 12 }}
          resizeMode="cover"
        >
          {/* dark overlay for text legibility */}
          <View className="absolute inset-0 bg-black opacity-20 rounded-t-xl" />

          {/* destination name bottom-left */}
          <View className="absolute left-3 bottom-3">
            <Text className="text-white font-semibold text-lg">{tripData.to}</Text>
          </View>

          
        </ImageBackground>
      ) : (
        <View className="w-full h-36 bg-gray-100 items-center justify-center rounded-t-xl">
          <Text className="text-gray-400">No Image</Text>
        </View>
      )}

      {/* content below image */}
      <View className="p-4">
        <Text className="text-lg font-semibold mb-1">Trip to {tripData.to}</Text>

        <View className="flex-row justify-between mb-1">
          <Text className="text-sm text-gray-500">From</Text>
          <Text className="text-sm">{tripData.from}</Text>
        </View>

        <View className="flex-row justify-between mb-1">
          <Text className="text-sm text-gray-500">Dates</Text>
          <Text className="text-sm">{dateRange}</Text>
        </View>

        <View className="flex-row justify-between">
          <Text className="text-sm text-gray-500">Return</Text>
          <Text className="text-sm">{tripData.returndate}</Text>
        </View>
      </View>
    </View>
  );
};

export default RecentTrip;
