import { Ionicons } from '@expo/vector-icons'
import { CameraType, CameraView, useCameraPermissions } from 'expo-camera'
import { useState } from 'react'
import { Alert, Text, TouchableOpacity, View } from 'react-native'

export default function Camera() {
  const [facing, setFacing] = useState<CameraType>('back')
  const [permission, requestPermission] = useCameraPermissions()

  function toggleCameraFacing() {
    setFacing(current => (current === 'back' ? 'front' : 'back'))
  }

  function takePicture() {
    Alert.alert('Photo Taken', 'This would capture and translate the image in a real implementation')
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
            <Text className="text-[#3f3f3f] mt-2 text-center">We need camera access to translate text from images</Text>
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
      <CameraView style={{ flex: 1 }} facing={facing} />

      {/* Camera Controls (sibling overlay) */}
      <View pointerEvents="box-none" style={{ position: 'absolute', left: 0, right: 0, bottom: 0 }}>
        <View className="absolute bottom-0 left-0 right-0 bg-black/50 p-6">
          <View className="flex-row items-center justify-center">
            <TouchableOpacity onPress={toggleCameraFacing} className="mr-8">
              <View className="w-12 h-12 rounded-full bg-white/20 items-center justify-center">
                <Ionicons name="camera-reverse" size={24} color="#fff" />
              </View>
            </TouchableOpacity>
            
            <TouchableOpacity onPress={takePicture} className="w-16 h-16 rounded-full bg-pink-500 items-center justify-center shadow-lg">
              <Ionicons name="camera" size={32} color="#fff" />
            </TouchableOpacity>
            
            <View className="w-12 h-12 ml-8" />
          </View>
        </View>
      </View>
    </>
  )
}
