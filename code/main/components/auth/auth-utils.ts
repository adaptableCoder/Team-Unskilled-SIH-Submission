import AsyncStorage from '@react-native-async-storage/async-storage';

export async function isLoggedIn() {
    const token = await AsyncStorage.getItem('jwt');
    return !!token;
}
