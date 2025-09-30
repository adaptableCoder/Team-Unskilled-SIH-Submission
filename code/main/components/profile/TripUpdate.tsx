import { View, Text, TouchableOpacity, Alert, Image, Modal, ScrollView } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import { useState, useEffect, useCallback } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'

const TripUpdate = ({
  heading,
  fromAddress,
  toAddress,
  dateDay,
  date,
  purpose,
  returnDate,
  __raw,
  className,
  tripId,
  onDelete,
  modeOfTransport,
}: {
  heading: string
  fromAddress: string
  toAddress: string
  dateDay: string
  date: string
  purpose?: string
  returnDate?: string
  tripStartTime?: string
  tripReturnTime?: string
  modeOfTransport?: string
  __raw?: any
  className?: string
  tripId?: string
  onDelete?: (tripId: string) => void
}) => {
  // accept legacy props (tripStartTime, tripReturnTime, modeOfTransport) for backwards compatibility
  const router = useRouter();
  const [tripImages, setTripImages] = useState<any[]>([])
  const [showImageModal, setShowImageModal] = useState(false)

  const loadTripImages = useCallback(async () => {
    if (!tripId) return
    try {
      const imagesStr = await AsyncStorage.getItem(`trip_images_${tripId}`)
      const images = imagesStr ? JSON.parse(imagesStr) : []
      setTripImages(images)
    } catch (error) {
      console.error('Error loading trip images:', error)
    }
  }, [tripId])

  useEffect(() => {
    loadTripImages()
  }, [loadTripImages])

  const openImageModal = () => {
    setShowImageModal(true)
  }

  const getImageTypeIcon = (type: string) => {
    switch (type) {
      case 'hotel': return 'bed'
      case 'flight': return 'airplane'
      case 'train': return 'train'
      case 'vehicle': return 'car'
      default: return 'image'
    }
  }

  const getImageTypeColor = (type: string) => {
    switch (type) {
      case 'hotel': return '#8B5CF6'
      case 'flight': return '#3B82F6'
      case 'train': return '#10B981'
      case 'vehicle': return '#F59E0B'
      default: return '#6B7280'
    }
  }

  const getImageTypeLabel = (type: string) => {
    switch (type) {
      case 'hotel': return 'Hotel Booking Reference'
      case 'flight': return 'Flight Ticket'
      case 'train': return 'Train Ticket'
      case 'vehicle': return 'Vehicle Number Plate'
      default: return 'Image'
    }
  }

  const handleDelete = () => {
    if (!onDelete || !tripId) return;
    
    Alert.alert(
      'Delete Trip',
      'Are you sure you want to delete this trip? This action cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => onDelete(tripId),
        },
      ],
      { cancelable: true }
    );
  };

  const handlePress = () => {
    // Navigate to trip map details page
    router.push({
      pathname: '/trip-map-details',
      params: {
        fromAddress,
        toAddress,
        heading: heading || 'Trip Details',
        date: date || 'Unknown Date',
        // Add coordinates if available in __raw data
        fromLat: __raw?.fromLat?.toString() || '',
        fromLng: __raw?.fromLng?.toString() || '',
        toLat: __raw?.toLat?.toString() || '',
        toLng: __raw?.toLng?.toString() || '',
      }
    });
  };

  const formatDisplayDate = (dateString?: string) => {
    if (!dateString) return null
    // try to parse ISO-like dates; fallback returns null
    const d = new Date(dateString)
    if (isNaN(d.getTime())) return null
    const month = d.toLocaleDateString('en-US', { month: 'short' })
    const day = d.toLocaleDateString('en-US', { day: 'numeric' })
    const year = d.toLocaleDateString('en-US', { year: '2-digit' })
    const weekday = d.toLocaleDateString('en-US', { weekday: 'long' })
    return { month, day, year, weekday }
  }

  const returnFmt = formatDisplayDate(returnDate)

  return (
    <TouchableOpacity 
      onPress={handlePress}
      className={`w-full rounded-3xl p-5 bg-[#EFF8FF] border border-[#DBEAFE] ${className || ''}`}
      activeOpacity={0.7}
    >

      {/* Header: removed left heading text; show a small status tag on the right when applicable */}
      <View className="flex-row items-start justify-end mb-4">
        {
          (() => {
            const h = (heading || '').toString().toLowerCase();
            if (h.includes('upcoming')) {
              return (
                <View className="bg-blue-50 px-3 py-1 rounded-full">
                  <Text className="text-xs text-blue-600">Upcoming</Text>
                </View>
              )
            }
            if (h.includes('ongoing') || h.includes('current')) {
              return (
                <View className="bg-green-50 px-3 py-1 rounded-full">
                  <Text className="text-xs text-green-600">Ongoing</Text>
                </View>
              )
            }
            return null
          })()
        }
      </View>

      {/* From / To row: use flexible columns so the icon doesn't push content out */}
      <View className="flex-row items-center">
        <View className="flex-1 pr-2">
          <Text className="text-[18px] font-semibold text-gray-900" numberOfLines={2} ellipsizeMode="tail">{fromAddress}</Text>
          <Text className="text-sm text-gray-400 mt-1">From</Text>
        </View>

        <View className="w-12 items-center justify-center">
          <Ionicons name="swap-horizontal" size={22} color="#2563EB" />
        </View>

        <View className="flex-1 pl-2 items-end">
          <Text className="text-[18px] font-semibold text-gray-900 text-right" numberOfLines={2} ellipsizeMode="tail">{toAddress}</Text>
          <Text className="text-sm text-gray-400 mt-1">To</Text>
        </View>
      </View>

      <View className="h-px bg-gray-100 my-4" />

      {/* Dates row: departure on left, return pushed to the right */}
      <View className="flex-row items-start justify-between">
        <View>
          <Text className="text-4xl font-extrabold text-blue-600 leading-none">{dateDay}</Text>
          <Text className="text-sm text-gray-500 mt-1">{date}</Text>
        </View>

        {returnFmt ? (
          <View className="items-end">
            <Text className="text-4xl font-extrabold text-blue-600 leading-none">{returnFmt.day}</Text>
            <Text className="text-sm text-gray-500 mt-1">{`${returnFmt.month}\u2019${returnFmt.year}, ${returnFmt.weekday}`}</Text>
          </View>
        ) : null}
      </View>

      {/* Travelers, transport, and purpose below the dates */}
      <View className="mt-4 flex-col gap-3">
        <View className="flex-row items-center gap-3">
          <Text className="text-sm text-gray-500">Travellers</Text>
          <Text className="text-sm font-medium text-gray-900">{__raw?.noOfPassengers ?? 1}</Text>
        </View>

        {(__raw?.modeOfTransport || modeOfTransport) ? (
          <View className="flex-row items-center gap-3">
            <Text className="text-sm text-gray-500">Transport</Text>
            <View className="flex-row items-center gap-2">
              <Ionicons 
                name={
                  (__raw?.modeOfTransport || modeOfTransport) === 'Flight' ? 'airplane-outline' :
                  (__raw?.modeOfTransport || modeOfTransport) === 'Train' ? 'train-outline' :
                  (__raw?.modeOfTransport || modeOfTransport) === 'Bus/Metro' ? 'bus-outline' :
                  (__raw?.modeOfTransport || modeOfTransport) === 'Car' ? 'car-outline' :
                  (__raw?.modeOfTransport || modeOfTransport) === 'Bike' ? 'bicycle-outline' :
                  'navigate-outline'
                } 
                size={16} 
                color="#6B7280" 
              />
              <Text className="text-sm font-medium text-gray-900">{__raw?.modeOfTransport || modeOfTransport}</Text>
            </View>
          </View>
        ) : null}

        {purpose ? (
          <View className="flex-row items-center gap-3">
            <Text className="text-sm text-gray-500">Purpose</Text>
            <Text className="text-sm font-medium text-gray-900">{purpose}</Text>
          </View>
        ) : null}
      </View>
      
      {/* Action buttons */}
      <View className="absolute bottom-5 right-5 flex-row gap-2">
        {tripImages.length > 0 && (
          <TouchableOpacity 
            onPress={openImageModal}
            className="bg-blue-50/90 p-2 rounded-full"
            activeOpacity={0.7}
          >
            <View className="relative">
              <Ionicons name="images" size={20} color="#2563EB" />
              {tripImages.length > 0 && (
                <View className="absolute -top-1 -right-1 bg-red-500 rounded-full w-4 h-4 items-center justify-center">
                  <Text className="text-white text-xs font-bold">{tripImages.length}</Text>
                </View>
              )}
            </View>
          </TouchableOpacity>
        )}
        <TouchableOpacity 
          onPress={handlePress}
          className="bg-white/80 p-2 rounded-full"
          activeOpacity={0.7}
        >
          <Ionicons name="map" size={20} color="#6B6BFF" />
        </TouchableOpacity>
        {onDelete && tripId && (
          <TouchableOpacity 
            onPress={handleDelete}
            className="bg-red-50/90 p-2 rounded-full"
            activeOpacity={0.7}
          >
            <Ionicons name="trash-outline" size={20} color="#DC2626" />
          </TouchableOpacity>
        )}
      </View>

      {/* Image Modal */}
      <Modal
        visible={showImageModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowImageModal(false)}
      >
        <View className="flex-1 bg-white">
          <View className="flex-row items-center justify-between p-4 border-b border-gray-200">
            <Text className="text-lg font-bold">Trip Images</Text>
            <TouchableOpacity onPress={() => setShowImageModal(false)}>
              <Ionicons name="close" size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>
          
          <ScrollView className="flex-1 p-4">
            {tripImages.length === 0 ? (
              <View className="flex-1 items-center justify-center">
                <Ionicons name="images-outline" size={64} color="#D1D5DB" />
                <Text className="text-gray-500 mt-4">No images captured yet</Text>
              </View>
            ) : (
              <View className="gap-4">
                {tripImages.map((image, index) => (
                  <View key={image.id || index} className="bg-gray-50 rounded-xl p-4">
                    <View className="flex-row items-center mb-3">
                      <Ionicons 
                        name={getImageTypeIcon(image.type)} 
                        size={20} 
                        color={getImageTypeColor(image.type)} 
                      />
                      <Text className="ml-2 font-medium">{getImageTypeLabel(image.type)}</Text>
                      <Text className="ml-auto text-xs text-gray-500">
                        {new Date(image.capturedAt).toLocaleDateString()}
                      </Text>
                    </View>
                    <Image
                      source={{ uri: image.uri || image.tempUri }}
                      className="w-full h-48 rounded-lg"
                      resizeMode="cover"
                    />
                  </View>
                ))}
              </View>
            )}
          </ScrollView>
        </View>
      </Modal>
    </TouchableOpacity>
  )
}

export default TripUpdate
