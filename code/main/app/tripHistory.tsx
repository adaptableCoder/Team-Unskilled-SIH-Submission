import { View, Text, ScrollView, TouchableOpacity, Image, Alert } from 'react-native'
import { useState } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage';
import TripUpdate from '@/components/profile/TripUpdate';

const TripHistory = () => {
    const [userId, setUserId] = useState('Jaymishra@1207');
    const handleLogout = async () => {
        await AsyncStorage.removeItem('jwt');
        Alert.alert('Logged out');
        if (typeof window !== 'undefined') {
            window.location.reload();
        } else {
            // @ts-ignore
            globalThis.reloadApp && globalThis.reloadApp();
        }
    };

    return (
        <ScrollView
            showsVerticalScrollIndicator={false}
            className="flex-1 bg-[#FFF1EF]"
            contentContainerStyle={{
                paddingTop: 40,
                paddingHorizontal: 20,
                paddingBottom: 40,
            }}
        >
            <View className="flex-row w-full items-center justify-between">
                <View className="flex-row items-center gap-3 mb-5">
                    <Image source={require('@/assets/images/profile.png')} />

                    <View className="flex-col">
                        <View className="flex-row items-center gap-2 justify-between">
                            <Text className="text-[25px] font-bold">Profile</Text>
                        </View>

                        <View>
                            <Text className="text-[15px] font-medium">User ID: {userId}</Text>
                            <TouchableOpacity
                                className="flex-row items-center gap-2 mt-1"
                                onPress={() => {
                                    try {
                                        // @ts-ignore
                                        navigator?.clipboard?.writeText?.(userId);
                                    } catch (err) { }
                                }}
                            >
                                <Image source={require('@/assets/images/copy.png')} />
                                <Text className="text-[14px]">Copy</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>

                <View>
                    <TouchableOpacity
                        onPress={handleLogout}
                        className="bg-[#6C63FF] px-3 rounded-lg py-2 items-center"
                    >
                        <Text className="text-white font-semibold">Logout</Text>
                    </TouchableOpacity>
                </View>
            </View>

            <View className='mt-6'>
                <Text className="text-[20px] font-bold">Trip History</Text>
                <Text className="text-[14px] text-gray-600 mt-1">View your Trip History</Text>
            </View>

            <View className='mt-4 flex-col gap-3 w-[95%] mx-auto'>
                <TripUpdate
                    heading="Trip 4"
                    fromAddress="Dwarka sec-10, Delhi"
                    toAddress="Sec-11,Block 2A, Gurgaon"
                    dateDay="22"
                    date="Sep’25, Monday"
                    tripStartTime="7:00 AM"
                    purpose="Work"
                    tripReturnTime="6pm"
                    returnDate="22 Sep"
                    modeOfTransport="Car"
                />
            </View>
            <View className='mt-4 flex-col gap-3 w-[95%] mx-auto'>
                <TripUpdate
                    heading="Trip 3"
                    fromAddress="Dwarka sec-10, Delhi"
                    toAddress="Sec-11,Block 2A, Gurgaon"
                    dateDay="22"
                    date="Sep’25, Monday"
                    tripStartTime="7:00 AM"
                    purpose="Work"
                    tripReturnTime="6pm"
                    returnDate="22 Sep"
                    modeOfTransport="Car"
                />
            </View>
            <View className='mt-4 flex-col gap-3 w-[95%] mx-auto'>
                <TripUpdate
                    heading="Trip 2"
                    fromAddress="Dwarka sec-10, Delhi"
                    toAddress="Sec-11,Block 2A, Gurgaon"
                    dateDay="22"
                    date="Sep’25, Monday"
                    tripStartTime="7:00 AM"
                    purpose="Work"
                    tripReturnTime="6pm"
                    returnDate="22 Sep"
                    modeOfTransport="Car"
                />
            </View>
            <View className='mt-4 flex-col gap-3 w-[95%] mx-auto'>
                <TripUpdate
                    heading="Trip 1"
                    fromAddress="Dwarka sec-10, Delhi"
                    toAddress="Sec-11,Block 2A, Gurgaon"
                    dateDay="22"
                    date="Sep’25, Monday"
                    tripStartTime="7:00 AM"
                    purpose="Work"
                    tripReturnTime="6pm"
                    returnDate="22 Sep"
                    modeOfTransport="Car"
                />
            </View>
        </ScrollView>
    )
}

export default TripHistory