import { Ionicons } from '@expo/vector-icons'
import { ScrollView, Text, View, TouchableOpacity } from 'react-native'
import NumberBadge from '../components/NumberBadge'

export default function SOS() {
  const officialContacts = [
    {
      title: 'All-in-one Emergency',
      subtitle: 'Police / Fire / Ambulance',
      numbers: ['112'],
    },
    { title: 'Police (Delhi)', numbers: ['100'] },
    { title: 'Fire Services (Delhi)', numbers: ['101'] },
    { title: 'Ambulance / Medical (Delhi)', numbers: ['102'] },
    { title: '24x7 Ambulance (National)', numbers: ['108'] },
    { title: 'State Disaster Helpline (All India)', numbers: ['1070'] },
    {
      title: 'State Disaster Management / Rescue & Relief (New Delhi)',
      numbers: ['011-23412666', '011-23412667'],
    },
    { title: 'Disaster Control Room (Delhi)', numbers: ['011-23392000'] },
    { title: 'Chief Minister Helpline (Delhi)', numbers: ['011-23392000', '1912'] },
  ]

  const personalContacts = [
    { title: 'Mother', numbers: ['+91-9876543210'] },
    { title: 'Father', numbers: ['+91-9123456780'] },
    { title: 'Local Contact - Rahul', numbers: ['+91-9012345678'] },
  ]

  return (
    <View className="flex-1">
      <ScrollView className="flex-1 bg-[#FFF1EF] p-4">
        <View className="mt-10 flex-row items-center gap-3">
          <Ionicons name="warning" size={32} color="red" />
          <Text className="text-3xl font-extrabold">SOS & Emergency</Text>
        </View>

        <View className="gap-6 mt-6 pb-20">
          <Text className="text-lg text-center">Live location gets shared and a call connects to emergency government facilities and your emergency contacts. {'\n'}Emergency updates sent to the local offices around you.</Text>

          <Text className="pl-4 text-2xl font-bold">Official Government Helplines for current detected location</Text>

          <View className="gap-2 ml-5">
            {officialContacts.map((c, i) => (
              <View key={`off-${i}`} className="flex-row items-start gap-4">
                <NumberBadge n={i + 1} />
                <View className="flex-1">
                  <Text className="text-lg font-semibold">{c.title}</Text>
                  {c.subtitle ? <Text className="text-sm text-gray-600">{c.subtitle}</Text> : null}
                  <Text className="text-sm mt-1">{c.numbers.join(' , ')}</Text>
                </View>
                <TouchableOpacity className="w-10 h-10 rounded-full items-center justify-center" onPress={() => {}}>
                  <Ionicons name="call" size={18} color="black" />
                </TouchableOpacity>
              </View>
            ))}
          </View>

          <Text className="pl-4 text-2xl font-bold mt-3">Your Emergency Contacts</Text>

          <View className="gap-2 ml-5">
            {personalContacts.map((c, idx) => (
              <View key={`ec-${idx}`} className="flex-row items-start gap-4">
                <NumberBadge n={idx + 1} />
                <View className="flex-1">
                  <Text className="text-lg font-semibold">{c.title}</Text>
                  <Text className="text-sm mt-1">{c.numbers.join(' , ')}</Text>
                </View>
                <TouchableOpacity className="w-10 h-10 rounded-full items-center justify-center" onPress={() => {}}>
                  <Ionicons name="call" size={18} color="black" />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      <View className="fixed left-0 right-0 bottom-0 items-center bg-[#FFF1EF] h-14">
        <View className="fixed left-0 right-0 bottom-20 items-center">
          <TouchableOpacity
            className="w-20 h-20 rounded-full bg-red-600 items-center justify-center shadow-lg"
            onPress={() => {}}
            accessibilityLabel="SOS Button"
          >
            <Text className="text-white text-lg font-extrabold">SOS</Text>
          </TouchableOpacity>
        </View>

      </View>
    </View>
  )
}
