import { Ionicons } from '@expo/vector-icons'
import * as ImagePicker from 'expo-image-picker'
import { useRouter } from 'expo-router'
import { useState } from 'react'
import { Alert, Image, ScrollView, Text, TouchableOpacity, View } from 'react-native'

const Transport = () => {
  const router = useRouter()
  const [images, setImages] = useState<string[]>([])

  const pickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync()
      if (status !== 'granted') {
        Alert.alert('Permission required', 'Please allow access to your photos to upload images')
        return
      }

  const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], allowsMultipleSelection: true, quality: 0.7 })
      if (!result.canceled) {
        const uris = result.assets?.map((a) => a.uri) || []
        setImages((s) => [...s, ...uris])
      }
    } catch (err) {
      console.error('Image pick error', err)
    }
  }

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index))
  }

  const submitImages = () => {
    if (images.length === 0) {
      Alert.alert('No images', 'Please select at least one image to submit')
      return
    }
    // Placeholder: replace with real upload logic
    Alert.alert('Submitted', `Submitted ${images.length} image(s)`)
    setImages([])
  }

  return (
      <View className="bg-[#FFF1EF] flex-1 h-[100dvh]">
        <ScrollView className="flex-1" contentContainerStyle={{ padding: 20, flexGrow: 1 }}>
          <View className="mt-6 flex-row gap-2">
            <Ionicons name="bus" size={32} color="#FF6EC7" />
            <View className="flex-col">
              <Text className="text-3xl font-extrabold">Public Transport Tracker</Text>
              <Text className="text-[#3f3f3f]">Track your public transport chain</Text>
            </View>
          </View>

          <View className="mt-4 rounded-xl p-4">
            <Text className="font-semibold text-2xl">How it works</Text>
            <Text className="text-[#3f3f3f] mt-2 text-lg leading-tight">Click the picture of the number plate of the public transport (E-rickshaw, auto, bus etc.) and upload it to the database to ensure your safety and a tension free ride</Text>
          </View>

          <View className="mt-6 rounded-xl p-4 bg-white shadow-2xl">
            <Text className="font-semibold text-xl">Upload Photos</Text>
            <Image source={require('@/assets/images/number-plate.png')} className="rounded-xl my-3 h-[15rem] w-[100%] object-contain"/>
            <Text className="text-[#3f3f3f] mt-2 text-center">Select clear photos showing the vehicle number plate from your gallery.</Text>
            
            <TouchableOpacity onPress={pickImage} activeOpacity={0.85} className="mt-4 rounded-full p-3 bg-gray-100 flex-row justify-center items-center gap-3">
              <Ionicons name="image" size={22}/>
              <Text className="font-medium">Choose from gallery</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => router.push('/camera?headerTitle=Capture%20vehicle%20number%20plate&headerSubtitle=Please%20take%20a%20clear%20photo%20of%20the%20vehicle%20number%20plate.&imageType=vehicle')} className="rounded-full bg-pink-500 flex-row items-center justify-center gap-3 p-3 mt-4">
              <Ionicons name="camera" size={22} color="#fff" />
              <Text className="text-white">Capture from Camera</Text>
            </TouchableOpacity>

            <View className="mt-4 flex-row flex-wrap items-center justify-center gap-3">
              {images.map((uri, idx) => (
                <View key={idx} className="relative">
                  <Image source={{ uri }} className="w-24 h-16 rounded mb-3 border border-black/10" />
                  <TouchableOpacity onPress={() => removeImage(idx)} className="absolute top-0 right-0 bg-white rounded-full p-1 shadow">
                    <Ionicons name="close" size={14} color="#333" />
                  </TouchableOpacity>
                </View>
              ))}
            </View>

            {images.length > 0 && (
              <View className="mt-4 flex-row items-center justify-center gap-3">
                <TouchableOpacity onPress={submitImages} activeOpacity={0.85} className="rounded-full bg-green-500 flex-row items-center justify-center gap-3 p-3">
                  <Ionicons name="cloud-upload" size={20} color="#fff" />
                  <Text className="text-white">Submit Photos</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
          
        </ScrollView>
      </View>
  )
}

export default Transport