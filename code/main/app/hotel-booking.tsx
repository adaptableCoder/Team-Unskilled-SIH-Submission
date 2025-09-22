import { Ionicons } from '@expo/vector-icons'
import * as DocumentPicker from 'expo-document-picker'
import * as ImagePicker from 'expo-image-picker'
import { useRouter } from 'expo-router'
import { useState } from 'react'
import { Alert, Image, ScrollView, Text, TouchableOpacity, View } from 'react-native'

type DocumentResult = { type: 'success' | 'cancel'; name?: string; uri?: string }

const HotelBooking = () => {
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

			const [pdfs, setPdfs] = useState<{ name: string; uri: string }[]>([])

		const pickPdf = async () => {
			try {
						const resRaw: any = await DocumentPicker.getDocumentAsync({ copyToCacheDirectory: false, type: 'application/pdf', multiple: true })
						if (Array.isArray(resRaw)) {
							for (const r of resRaw) {
								if (r?.type === 'success' && r?.uri) {
									const name = (r as any).name ?? 'ticket.pdf'
									const uri = (r as any).uri as string
									setPdfs((s) => [...s, { name, uri }])
								}
							}
						} else {
							const r = resRaw as DocumentResult
							if (r.type === 'success' && r.uri) {
								const name = r.name ?? 'ticket.pdf'
								const uri = r.uri as string
								setPdfs((s) => [...s, { name, uri }])
							}
						}
			} catch (err) {
				console.error('PDF pick error', err)
			}
		}

		const submitImages = () => {
			const total = images.length + pdfs.length
			if (total === 0) {
				Alert.alert('Nothing selected', 'Please select at least one image or PDF to submit')
				return
			}
			// Placeholder: replace with real upload logic
			Alert.alert('Submitted', `Submitted ${images.length} image(s) and ${pdfs.length} PDF(s)`)
			setImages([])
			setPdfs([])
		}

	return (
			<View className="bg-[#FFF1EF] flex-1 h-[100dvh]">
				<ScrollView className="flex-1" contentContainerStyle={{ padding: 20, flexGrow: 1 }}>
					<View className="mt-6 flex-row gap-2">
						<Ionicons name="bed" size={32} color="#FF6EC7" />
						<View className="flex-col">
							<Text className="text-3xl font-extrabold">Hotel Booking</Text>
							<Text className="text-[#3f3f3f]">Keep your hotel booking details safe</Text>
						</View>
					</View>

					<View className="mt-4 rounded-xl">
						<Text className="my-6 text-[#3f3f3f] text-center mt-2 text-md leading-tight">Click the picture of the hotel booking confirmation, or upload a pdf.</Text>
					</View>

					<View className="mt-6 rounded-xl p-4 bg-white shadow-2xl">
						<Text className="font-semibold text-xl">Upload</Text>
						<Image source={require('@/assets/images/hotel-booking.png')} className="rounded-xl my-3 h-[15rem] w-[100%] object-contain"/>

						<TouchableOpacity onPress={pickImage} activeOpacity={0.85} className="mt-4 rounded-full p-3 bg-gray-100 flex-row justify-center items-center gap-3">
							<Ionicons name="image" size={22}/>
							<Text className="font-medium">Choose from gallery</Text>
						</TouchableOpacity>

									<TouchableOpacity onPress={() => router.push('/camera')} className="rounded-full bg-pink-500 flex-row items-center justify-center gap-3 p-3 mt-4">
										<Ionicons name="camera" size={22} color="#fff" />
										<Text className="text-white">Capture from Camera</Text>
									</TouchableOpacity>

									<Text className="text-center text-sm text-gray-500 mt-2">OR</Text>

									<TouchableOpacity onPress={pickPdf} className="rounded-full bg-gray-200 flex-row items-center justify-center gap-3 p-3 mt-2">
										<Ionicons name="document" size={20} />
										<Text className="font-medium">Upload PDF</Text>
									</TouchableOpacity>

									<View className="mt-3 w-full">
										{pdfs.map((p, i) => (
											<View key={`pdf-preview-${i}`} className="flex-row items-center gap-3 p-2 bg-white rounded border border-black/5 mb-2">
												<Ionicons name="document" size={20} color="#555" />
												<Text className="flex-1">{p.name}</Text>
												<TouchableOpacity onPress={() => setPdfs((prev) => prev.filter((_, idx) => idx !== i))} className="bg-white rounded-full p-1">
													<Ionicons name="close" size={14} color="#333" />
												</TouchableOpacity>
											</View>
										))}
									</View>

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

						{(images.length > 0 || pdfs.length > 0) && (
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

export default HotelBooking