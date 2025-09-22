import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { View, Image } from 'react-native';

export default function TabLayout() {

  return (
    <Tabs
      initialRouteName="index"
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#FFF2E1',
        tabBarStyle: {
          backgroundColor: '#FF9292',
          paddingTop: 8,
          minHeight: 74,
        },
        tabBarInactiveTintColor: '#FFF2E1',
        tabBarInactiveBackgroundColor:'#FF9292',
      }}>

      <Tabs.Screen
        name="transport"
        options={{
          title: 'Transport',
          tabBarIcon: ({ color, size, focused }) => (
            <View style={{
              marginTop: 8,
              paddingVertical: 8,
              paddingHorizontal: 12,
              borderRadius: 12,
              backgroundColor: focused ? '#FF6969' : 'transparent',
              minWidth: 56,
              minHeight: 56,
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'column',
            }}>
              <Ionicons size={size} name="bus" color={color} />
            </View>
          ),
        }}
      />

      <Tabs.Screen
        name="tripsy"
        options={{
          title: 'Tripsy',
          tabBarIcon: ({ color, size, focused }) => (
            <View style={{
              marginTop: 8,
              paddingVertical: 8,
              paddingHorizontal: 12,
              borderRadius: 12,
              backgroundColor: focused ? '#FF6969' : 'transparent',
              minWidth: 56,
              minHeight: 56,
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'column',
            }}>
              <Image source={require('../../assets/images/tripsy-icon.png')} style={{ width: 30, height: 24, marginBottom: 5, marginLeft: 10}} />
            </View>
          ),
        }}
      />

      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size, focused }) => (
            <View style={{
              marginTop: 8,
              paddingVertical: 8,
              paddingHorizontal: 12,
              borderRadius: 12,
              backgroundColor: focused ? '#FF6969' : 'transparent',
              minWidth: 56,
              minHeight: 56,
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'column',
            }}>
              <Image source={require('../../assets/images/home-icon.png')} style={{ width: 24, height: 24, marginBottom: 5}} />
            </View>
          ),
        }}
      />

      <Tabs.Screen
        name="plan"
        options={{
          title: 'Plan',
          tabBarIcon: ({ color, size, focused }) => (
            <View style={{
              marginTop: 8,
              paddingVertical: 8,
              paddingHorizontal: 12,
              borderRadius: 12,
              backgroundColor: focused ? '#FF6969' : 'transparent',
              minWidth: 56,
              minHeight: 56,
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'column',
            }}>
              <Image source={require('../../assets/images/ai-plan-icon.png')} style={{ width: 28, height: 28, marginBottom: 5}} />
            </View>
          ),
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size, focused }) => (
            <View style={{
              marginTop: 8,
              paddingVertical: 8,
              paddingHorizontal: 12,
              borderRadius: 12,
              backgroundColor: focused ? '#FF6969' : 'transparent',
              minWidth: 56,
              minHeight: 56,
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'column',
            }}>
              <Ionicons size={size} name="person-outline" color={color} />
            </View>
          ),
        }}
      />
    </Tabs>
  );
}
