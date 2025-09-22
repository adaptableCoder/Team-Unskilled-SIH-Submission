import ExploreCard from '@/components/plan/ExploreCard'
import Filters from '@/components/plan/Filters'
import TripForm from '@/components/plan/TripForm'
import AI_TripItenary from '@/components/trip/AI_TripItenary'
import { useState } from 'react'
import { ScrollView, Text, TouchableOpacity, View, Image } from 'react-native'

export default function Plan() {
  const [showItinerary, setShowItinerary] = useState(false)
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
  return (
    <View className="flex-1 bg-[#FFF1EF] h-[100dvh]">
      {showItinerary ? (
        <AI_TripItenary onClose={() => setShowItinerary(false)} />
      ) : (
        <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 80 }}>
          <View className="mt-6 flex-row gap-2">
            <Image source={require('../../assets/images/ai-plan-icon-black.png')} style={{ width: 36, height: 36}} />
            <View className="flex-col">
              <Text className="text-3xl font-extrabold">AI Trip Planner</Text>
              <Text className="text-[#3f3f3f]">Meticulously plan a flawless and exciting vacation</Text>
            </View>
          </View>

          <TripForm />

          {/* Divider + Filters */}
          <View>
            <View className="mt-5 h-[1px] bg-pink-200" />
            <Filters />

            {/* Horizontal Explore cards */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingVertical: 16 }} className="mt-4">
              {card_details.map((c, i) => (
                <ExploreCard key={i} image={c.image} heading={c.heading} subtitle={c.subtitle} onPress={() => {}} />
              ))}
            </ScrollView>
          </View>
          
          <View className="my-5 h-[1px] bg-pink-200" />

          <View className="gap-3">
            <Text className="text-2xl  font-bold">We have curated an Itinerary for your trip</Text>
            <TouchableOpacity 
              className="bg-pink-500 px-4 py-2 rounded-full self-start"
              onPress={() => setShowItinerary(true)}
            >
              <Text className="text-white font-semibold">View Itinerary</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      )}
    </View>
  )
}