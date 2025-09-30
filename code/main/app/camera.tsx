import { Ionicons } from '@expo/vector-icons'
import { CameraType, CameraView, useCameraPermissions } from 'expo-camera'
import { useState, useRef } from 'react'
import { Alert, Text, TouchableOpacity, View } from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import AsyncStorage from '@react-native-async-storage/async-storage'

export default function Camera() {
  const { headerTitle, headerSubtitle, tripId, imageType } = useLocalSearchParams<{
    headerTitle?: string
    headerSubtitle?: string
    tripId?: string
    imageType?: 'hotel' | 'flight' | 'train' | 'vehicle'
  }>()
  const router = useRouter()
  const cameraRef = useRef<CameraView>(null)
  const [facing, setFacing] = useState<CameraType>('back')
  const [permission, requestPermission] = useCameraPermissions()
  const [isCapturing, setIsCapturing] = useState(false)

  function toggleCameraFacing() {
    setFacing(current => (current === 'back' ? 'front' : 'back'))
  }

  async function takePicture() {
    if (!cameraRef.current || isCapturing) return
    
    setIsCapturing(true)
    
    try {
      // Capture the photo
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
        base64: false,
        exif: false,
      })

      if (photo?.uri) {
        // Save image info to AsyncStorage if tripId and imageType are provided
        if (tripId && imageType) {
          await saveImageToTrip(tripId, imageType, photo.uri, photo.uri)
        }

        Alert.alert(
          'Photo Captured!', 
          'The image has been saved to your trip records.',
          [
            {
              text: 'Take Another',
              style: 'default'
            },
            {
              text: 'Done',
              style: 'default',
              onPress: () => router.back()
            }
          ]
        )
      }
    } catch (error) {
      console.error('Error taking picture:', error)
      Alert.alert('Error', 'Failed to capture photo. Please try again.')
    } finally {
      setIsCapturing(false)
    }
  }

  async function saveImageToTrip(tripId: string, imageType: string, assetUri: string, tempUri: string) {
    try {
      const key = `trip_images_${tripId}`
      const existingImagesStr = await AsyncStorage.getItem(key)
      const existingImages = existingImagesStr ? JSON.parse(existingImagesStr) : []
      
      const newImage = {
        id: Date.now().toString(),
        type: imageType,
        uri: assetUri,
        tempUri: tempUri,
        capturedAt: new Date().toISOString(),
      }
      
      existingImages.push(newImage)
      await AsyncStorage.setItem(key, JSON.stringify(existingImages))
    } catch (error) {
      console.error('Error saving image to trip:', error)
    }
  }

  if (!permission) {
    // Camera permissions are still loading
    return (
        <View className="flex-1 items-center justify-center">
          <Text className="">Loading camera permissions...</Text>
        </View>
    )
  }

  if (!permission.granted) {
    // Camera permissions are not granted yet
    return (
      <View className="flex-1 items-center justify-center p-6">
        <View className="bg-white rounded-xl p-6 items-center shadow-2xl">
          <Ionicons name="camera" size={48} color="#FF6EC7" />
          <Text className=" text-xl font-bold mt-4 text-center">Camera Access Required</Text>
          <Text className="text-[#3f3f3f] mt-2 text-center">We need camera access to capture images for your trip</Text>
          <TouchableOpacity onPress={requestPermission} className="mt-6 bg-pink-500 px-6 py-3 rounded-full">
            <Text className="text-white font-semibold">Grant Camera Permission</Text>
          </TouchableOpacity>
        </View>
      </View>
    )
  }

  return (
    <>
      {/* Full Screen Camera */}
      <CameraView ref={cameraRef} style={{ flex: 1 }} facing={facing} />

      {/* Top instruction banner - only show if headerTitle is provided */}
      {headerTitle && (
        <View pointerEvents="box-none" className="absolute left-0 right-0 top-0 pt-5">
          <View className="absolute top-0 left-0 right-0 bg-black/40 pt-8 px-4 pb-4">
            <Text className="text-white text-lg font-bold">{headerTitle}</Text>
            {headerSubtitle && (
              <Text className="text-white text-sm mt-1">{headerSubtitle}</Text>
            )}
          </View>
        </View>
      )}

      {/* Camera Controls (sibling overlay) */}
      <View pointerEvents="box-none" className="absolute left-0 right-0 bottom-0">
        <View className="absolute bottom-0 left-0 right-0 bg-black/50 p-6">
          <View className="flex-row items-center justify-center">
            <TouchableOpacity onPress={toggleCameraFacing} className="mr-8">
              <View className="w-12 h-12 rounded-full bg-white/20 items-center justify-center">
                <Ionicons name="camera-reverse" size={24} color="#fff" />
              </View>
            </TouchableOpacity>
            
            <TouchableOpacity 
              onPress={takePicture} 
              disabled={isCapturing}
              className={`w-16 h-16 rounded-full ${isCapturing ? 'bg-pink-300' : 'bg-pink-500'} items-center justify-center shadow-lg`}
            >
              <Ionicons name="camera" size={32} color="#fff" />
            </TouchableOpacity>
            
            <View className="w-12 h-12 ml-8" />
          </View>
        </View>
      </View>
    </>
  )
}
