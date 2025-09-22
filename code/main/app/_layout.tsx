import { Stack } from 'expo-router';
import { Provider } from 'react-redux';
import { useState, useEffect } from 'react';
import 'react-native-reanimated';
import './globals.css';

import store from '@/store/store';
import { isLoggedIn } from '@/components/auth/auth-utils';
import AuthScreen from '@/components/auth/auth';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const [authChecked, setAuthChecked] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    (async () => {
      const logged = await isLoggedIn();
      setLoggedIn(logged);
      setAuthChecked(true);
    })();
  }, []);

  if (!authChecked) {
    return null; // or a splash/loading screen
  }

  if (!loggedIn) {
    return (
      <Provider store={store}>
        <AuthScreen onLoginSuccess={async () => {
          setLoggedIn(true);
        }} />
      </Provider>
    );
  }
  return (
    <Provider store={store}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen 
        name="(tabs)" 
        options={{ headerShown: false }} />
      </Stack>
    </Provider>
  );
}
