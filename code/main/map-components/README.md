React Native Map Migration Guide
================================

This guide contains exact copy-pasteable code and step-by-step commands to reproduce the map features from the web starter (Leaflet + React) in a React Native app using Expo and `react-native-maps`.

Summary
- Use Expo (managed) for fastest iteration.
- Use `expo-location` for device geolocation.
- Use `react-native-maps` for maps, markers and polylines.
- Use `Animated` from `react-native` for lightweight transport icon animation.

Prerequisites (Windows PowerShell)
- Install Expo CLI if you don't have it: `npm install -g expo-cli`

Create a new Expo app (TypeScript recommended)
```
expo init map-rn --template expo-template-blank-typescript
cd map-rn
```

Install dependencies
```
expo install react-native-maps expo-location react-native-svg
npm install axios
```

Notes about `react-native-maps`
- Expo supports `react-native-maps` in managed workflow. On Android you may need to install Google Play Services (usually present on emulators / devices). For a real-device test, ensure the device has Google services.

Backend & CORS
- The original web app calls `/api/nearby?...`. In RN you must call the backend by full URL (for example `http://192.168.1.5:8080/api/nearby`). Replace `BASE_URL` in the example code with your server IP/host.

Files included in this folder
- `types.ts` — shared types used by components
- `useGeolocation.ts` — React Native geolocation hook (Expo)
- `MapViewRN.tsx` — Map component implementing markers, nearby fetch and polyline
- `AnimatedTransport.tsx` — animated transport icon using `Animated`
- `AppExample.tsx` — small example showing how to use the components

How to run
```
# from the project root (map-rn)
expo start
```
Open on a device (Expo Go) or run an Android/iOS emulator.
