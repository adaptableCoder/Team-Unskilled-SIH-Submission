import { View, Text, ScrollView, Image, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

type Props = {
  onClose?: () => void;
};

interface TripDay {
  day: number;
  date: string;
  title: string;
  locations: {
    name: string;
    subtitle: string;
    image: any;
  }[];
}

const AI_TripItenary = ({ onClose }: Props) => {
  const router = useRouter();

  const tripData: TripDay[] = [
    {
      day: 1,
      date: '22 Sep',
      title: 'Arrival + North Goa Shacks',
      locations: [
        {
          name: 'Baga Beach',
          subtitle: 'Titos Lane in Baga, Goa',
          image: require('@/assets/images/card1.png')
        },
        {
          name: 'Morjim Beach',
          subtitle: 'Titos Lane in Baga, Goa',
          image: require('@/assets/images/card2.jpg')
        }
      ]
    },
    {
      day: 2,
      date: '23 Sep',
      title: 'Arrival + North Goa Beaches',
      locations: [
        {
          name: 'Baga Beach',
          subtitle: 'Titos Lane in Baga, Goa',
          image: require('@/assets/images/card1.png')
        },
        {
          name: 'Morjim Beach',
          subtitle: 'Titos Lane in Baga, Goa',
          image: require('@/assets/images/card2.jpg')
        }
      ]
    },
    {
      day: 3,
      date: '24 Sep',
      title: 'Arrival + North Goa Shacks',
      locations: [
        {
          name: 'Baga Beach',
          subtitle: 'Titos Lane in Baga, Goa',
          image: require('@/assets/images/card1.png')
        },
        {
          name: 'Morjim Beach',
          subtitle: 'Titos Lane in Baga, Goa',
          image: require('@/assets/images/card2.jpg')
        }
      ]
    },
    {
      day: 4,
      date: '25 Sep',
      title: 'Arrival + North Goa Beaches',
      locations: [
        {
          name: 'Baga Beach',
          subtitle: 'Titos Lane in Baga, Goa',
          image: require('@/assets/images/card1.png')
        },
        {
          name: 'Morjim Beach',
          subtitle: 'Titos Lane in Baga, Goa',
          image: require('@/assets/images/card2.jpg')
        }
      ]
    },
    {
      day: 5,
      date: '26 Sep',
      title: 'Departure',
      locations: [
        {
          name: 'Baga Beach',
          subtitle: 'Titos Lane in Baga, Goa',
          image: require('@/assets/images/card1.png')
        },
        {
          name: 'Morjim Beach',
          subtitle: 'Titos Lane in Baga, Goa',
          image: require('@/assets/images/card2.jpg')
        }
      ]
    }
  ];

  const renderDayItem = (dayData: TripDay) => (
    <View key={dayData.day} className="mb-6">
      {/* Day Header */}
      <View className="flex-row items-center mb-4">
        <View className="bg-black rounded-full w-8 h-8 items-center justify-center mr-3">
          <Text className="text-white font-bold text-sm">{dayData.day}</Text>
        </View>
        <View className="flex-1">
          <Text className="text-xl font-bold text-gray-800">Day {dayData.day} ({dayData.date})</Text>
          <Text className="text-gray-600 text-base">{dayData.title}</Text>
        </View>
      </View>

      {/* Location Cards */}
      <View className="flex-row gap-3">
        {dayData.locations.map((location, index) => (
          <View key={index} className="flex-1 bg-white rounded-2xl overflow-hidden shadow-lg">
            <Image 
              source={location.image} 
              className="w-full h-32 object-cover"
              resizeMode="cover"
            />
            <View className="p-3">
              <Text className="font-bold text-gray-800 text-base">{location.name}</Text>
              <Text className="text-gray-500 text-sm mt-1">{location.subtitle}</Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );

  return (
    <View className="flex-1 bg-[#FFF1EF]">
      <ScrollView className="flex-1 px-4 pt-8" showsVerticalScrollIndicator={false}>
        {/* Back button row */}
        <View className="mb-2">
          <TouchableOpacity
            onPress={() => {
              if (onClose) return onClose();
              router.back();
            }}
            accessibilityLabel="Go back"
            className="w-10 h-10 items-center justify-center"
          >
            <Ionicons name="chevron-back" size={22} color="#333" />
          </TouchableOpacity>
        </View>

        {/* Header */}
        <View className="flex-row items-center mb-6">
          <Ionicons name="globe" size={28} color="#FF6EC7" />
          <View className="ml-3 flex-1">
            <Text className="text-2xl font-bold text-gray-800">AI Trip Itinerary</Text>
            <Text className="text-gray-600 text-sm mt-1">
              We have planned a 5 Day itinerary for your Goa trip based on your selected filters
            </Text>
          </View>
        </View>

        {/* Trip Days */}
        {tripData.map(renderDayItem)}

        {/* Additional Bookings Section */}
        <View className="bg-white rounded-2xl p-4 mb-6 shadow-lg">
          <Text className="text-xl font-bold text-gray-800 mb-2">Additional Bookings & Record updation</Text>
          <Text className="text-gray-600 text-sm mb-4">Book Hotel and add your Flight/ Train tickets to track your trip</Text>
          
          <View className="flex-row justify-around">
            <TouchableOpacity 
              onPress={() => router.push('/hotel-booking')}
              className="items-center bg-pink-50 rounded-xl p-3 flex-1 mr-2"
            >
              <Ionicons name="bed" size={24} color="#FF6EC7" />
              <Text className="text-pink-600 text-xs font-medium mt-1">Hotels</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              onPress={() => router.push('/flight-ticket')}
              className="items-center bg-pink-50 rounded-xl p-3 flex-1 mx-1"
            >
              <Ionicons name="airplane" size={24} color="#FF6EC7" />
              <Text className="text-pink-600 text-xs font-medium mt-1">Flights</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              onPress={() => router.push('/train-ticket')}
              className="items-center bg-pink-50 rounded-xl p-3 flex-1 ml-2"
            >
              <Ionicons name="train" size={24} color="#FF6EC7" />
              <Text className="text-pink-600 text-xs font-medium mt-1">Trains</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Bottom spacing */}
        <View className="h-20" />
      </ScrollView>
    </View>
  );
};

export default AI_TripItenary;