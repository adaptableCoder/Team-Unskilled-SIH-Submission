import { useState, useEffect, useRef } from 'react'
import { View, Text, Alert, ActivityIndicator, TouchableOpacity, Modal } from 'react-native'
import { WebView } from 'react-native-webview'
import { LinearGradient } from 'expo-linear-gradient'
import { Ionicons } from '@expo/vector-icons'
import * as Location from 'expo-location'
import * as TaskManager from 'expo-task-manager'
import AsyncStorage from '@react-native-async-storage/async-storage'

// Background location task definition
const BACKGROUND_LOCATION_TASK = 'background-location-task';
const LOCATION_STORAGE_KEY = 'user_location_path';

TaskManager.defineTask(BACKGROUND_LOCATION_TASK, async ({ data, error }: { data: any; error: any }) => {
  if (error) {
    console.error('Background location task error:', error);
    return;
  }

  if (data) {
    const { locations } = data as any;
    const location = locations[0];
    
    if (location) {
      const locationPoint = {
        lat: location.coords.latitude,
        lng: location.coords.longitude,
        timestamp: Date.now(),
        accuracy: location.coords.accuracy
      };
      
      // Store location in AsyncStorage
      AsyncStorage.getItem(LOCATION_STORAGE_KEY)
        .then(existingPath => {
          const path = existingPath ? JSON.parse(existingPath) : [];
          path.push(locationPoint);
          // Keep last 1000 points
          const limitedPath = path.slice(-1000);
          return AsyncStorage.setItem(LOCATION_STORAGE_KEY, JSON.stringify(limitedPath));
        })
        .catch(error => console.error('Error saving background location:', error));
    }
  }
});

interface LocationTrackingMapProps {
  lat?: number;
  lng?: number;
  height?: number;
}

export default function LocationTrackingMap({ lat = 28.6139, lng = 77.2090, height = 300 }: LocationTrackingMapProps) {
  // State variables
  const [isTrackingLocation, setIsTrackingLocation] = useState(false);
  const [isBackgroundTracking, setIsBackgroundTracking] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<{lat: number, lng: number} | null>(null);
  const [locationPath, setLocationPath] = useState<{lat: number, lng: number, timestamp: number}[]>([]);
  const [locationAccuracy, setLocationAccuracy] = useState<number | null>(null);
  const [isFullScreenVisible, setIsFullScreenVisible] = useState(false);
  const [webViewLoaded, setWebViewLoaded] = useState(false);
  
  // Refs for tracking
  const locationWatchId = useRef<any>(null);
  const lastLocationTime = useRef<number>(0);
  const webViewRef = useRef<WebView>(null);
  const fullScreenWebViewRef = useRef<WebView>(null);

  // Generate HTML content for the map
  const generateHTML = () => {
    return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Location Tracking Map</title>
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
      <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
      <style>
        html, body, #map { 
          height: 100%; 
          margin: 0; 
          padding: 0; 
          overflow: hidden;
          touch-action: manipulation;
        }
        
        /* Enhanced zoom controls for better mobile experience */
        .leaflet-control-zoom {
          top: 12px !important;
          left: 12px !important;
          border-radius: 12px !important;
          box-shadow: 0 4px 12px rgba(0,0,0,0.15) !important;
        }
        
        .leaflet-control-zoom a { 
          width: 44px !important;
          height: 44px !important;
          line-height: 44px !important;
          font-size: 22px !important;
          font-weight: bold !important;
          border-radius: 8px !important;
          background: rgba(255, 255, 255, 0.95) !important;
          backdrop-filter: blur(10px) !important;
          transition: all 0.2s ease !important;
        }
        
        .leaflet-control-zoom a:hover {
          background: rgba(107, 107, 255, 0.1) !important;
          transform: scale(1.05) !important;
        }
        
        /* Better touch targets */
        .leaflet-marker-icon {
          cursor: pointer !important;
        }
        
        /* Smooth map interactions */
        .leaflet-container {
          background: #f8f9fa;
        }
        
        /* Smooth zoom animation */
        .leaflet-zoom-anim .leaflet-zoom-animated {
          transition: transform 0.25s cubic-bezier(0, 0, 0.25, 1) !important;
        }
        
        /* Hide attribution/watermark for cleaner UI */
        .leaflet-control-attribution {
          display: none !important;
        }
        
        .leaflet-bottom.leaflet-right {
          display: none !important;
        }
        
        /* Hide attribution/watermark for cleaner UI */
        .leaflet-control-attribution {
          display: none !important;
        }
        
        .leaflet-bottom.leaflet-right {
          display: none !important;
        }
      </style>
    </head>
    <body>
      <div id="map"></div>
      
      <script>
        let map, userMarker, userPathPolyline, userPathBackground;
        let pathCoordinates = [];
        
        // Initialize map with enhanced controls and smooth zoom
        map = L.map('map', {
          center: [${lat}, ${lng}],
          zoom: 13,
          minZoom: 3,
          maxZoom: 19,
          zoomControl: true,
          scrollWheelZoom: true,
          doubleClickZoom: true,
          touchZoom: true,
          boxZoom: true,
          keyboard: true,
          dragging: true,
          tap: true,
          zoomSnap: 0.25,
          zoomDelta: 0.5,
          wheelDebounceTime: 60,
          wheelPxPerZoomLevel: 120
        });
        
        // Add tile layer
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: ''
        }).addTo(map);
        
        // Hide attribution control for cleaner UI
        map.attributionControl.remove();
        
        // Function to update user location and path
        window.updateUserLocation = (location, path, accuracy) => {
          try {
            console.log('WebView: Updating location:', location, 'Path points:', path.length, 'Accuracy:', accuracy);
            
            // Remove existing user marker
            if (userMarker) {
              console.log('WebView: Removing existing marker');
              map.removeLayer(userMarker);
            }
            
            // Add new user marker (blue circle)
            console.log('WebView: Adding new marker at', location.lat, location.lng);
            userMarker = L.circleMarker([location.lat, location.lng], {
              color: '#ffffff',
              fillColor: '#4285F4',  // Google Maps blue
              fillOpacity: 0.8,
              radius: 12,
              weight: 3,
            }).addTo(map);
            
            console.log('WebView: Marker added successfully');
            
            // Add accuracy circle (light blue)
            if (accuracy && accuracy > 0) {
              console.log('WebView: Adding accuracy circle with radius:', accuracy);
              L.circle([location.lat, location.lng], {
                radius: accuracy,
                fillColor: '#4285F4',
                color: '#4285F4',
                weight: 1,
                opacity: 0.2,
                fillOpacity: 0.1
              }).addTo(map);
            }

            // Update path if we have multiple points
            if (path && path.length > 1) {
              console.log('Drawing path with', path.length, 'points');
              
              // Remove existing path layers
              if (userPathBackground) {
                map.removeLayer(userPathBackground);
              }
              if (userPathPolyline) {
                map.removeLayer(userPathPolyline);
              }

              pathCoordinates = path.map(p => [p.lat, p.lng]);
              
              // Add white background line for better visibility
              userPathBackground = L.polyline(pathCoordinates, {
                color: '#ffffff',
                weight: 8,
                opacity: 0.8,
                lineCap: 'round',
                lineJoin: 'round'
              }).addTo(map);
              
              // Add blue path line (Google Maps style)
              userPathPolyline = L.polyline(pathCoordinates, {
                color: '#4285F4',  // Google Maps blue
                weight: 5,
                opacity: 1.0,
                smoothFactor: 2,
                lineCap: 'round',
                lineJoin: 'round'
              }).addTo(map);
              
              // Bring the main path to front
              userPathPolyline.bringToFront();
              console.log('Blue path added to map');
            }

            // Center map on current location with appropriate zoom
            console.log('WebView: Centering map on location');
            map.setView([location.lat, location.lng], Math.max(map.getZoom(), 15));
            console.log('WebView: Map centered successfully');
            
          } catch (error) {
            console.error('Error updating user location:', error);
          }
        };
        
        // Function to clear path
        window.clearPath = () => {
          try {
            if (userPathBackground) {
              map.removeLayer(userPathBackground);
              userPathBackground = null;
            }
            if (userPathPolyline) {
              map.removeLayer(userPathPolyline);
              userPathPolyline = null;
            }
            pathCoordinates = [];
            console.log('Path cleared from map');
          } catch (error) {
            console.error('Error clearing path:', error);
          }
        };
        
        // Notify React Native when map is ready
        setTimeout(() => {
          if (window.ReactNativeWebView) {
            window.ReactNativeWebView.postMessage('map-ready');
          }
        }, 500);
      </script>
    </body>
    </html>`;
  };

  // Inject location data to WebView
  const injectLocationToWebView = (
    location: {lat: number, lng: number}, 
    path: {lat: number, lng: number, timestamp: number}[], 
    accuracy?: number
  ) => {
    console.log('React Native: Injecting location to WebView:', location, 'accuracy:', accuracy);
    
    const injection = `
      try {
        console.log('WebView: Injection script running...');
        if (window.updateUserLocation && typeof window.updateUserLocation === 'function') {
          console.log('WebView: updateUserLocation function found, calling it...');
          window.updateUserLocation(${JSON.stringify(location)}, ${JSON.stringify(path)}, ${accuracy || 0});
          console.log('WebView: updateUserLocation called successfully');
        } else {
          console.error('WebView: updateUserLocation function not found!');
        }
      } catch (e) {
        console.error('WebView: Failed to inject location:', e);
      }
      true;
    `;
    
    // Inject to main WebView
    if (webViewRef.current) {
      console.log('React Native: Main WebView ref available, injecting JavaScript...');
      webViewRef.current.injectJavaScript(injection);
    } else {
      console.error('React Native: Main WebView ref not available!');
    }
    
    // Inject to fullscreen WebView if it's visible
    if (fullScreenWebViewRef.current && isFullScreenVisible) {
      console.log('React Native: Fullscreen WebView ref available, injecting JavaScript...');
      fullScreenWebViewRef.current.injectJavaScript(injection);
    }
  };

  // Start foreground location tracking
  const startLocationTracking = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Location permission is required for live tracking');
        return;
      }

      setIsTrackingLocation(true);
      console.log('Starting live location tracking...');

      const watchId = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.BestForNavigation,
          timeInterval: 3000, // Update every 3 seconds
          distanceInterval: 5, // Update every 5 meters
        },
        (location) => {
          const now = Date.now();
          const newLocation = {
            lat: location.coords.latitude,
            lng: location.coords.longitude
          };

          setCurrentLocation(newLocation);
          setLocationAccuracy(location.coords.accuracy);

          // Add to path if significant time has passed (avoid GPS noise)
          if (now - lastLocationTime.current > 5000) { // At least 5 seconds apart
            const newPathPoint = { ...newLocation, timestamp: now };
            setLocationPath(prevPath => {
              const newPath = [...prevPath, newPathPoint];
              const limitedPath = newPath.slice(-1000); // Keep last 1000 points
              
              // Inject updated location and path immediately
              setTimeout(() => {
                injectLocationToWebView(newLocation, limitedPath, location.coords.accuracy || undefined);
              }, 100);
              
              // Save to storage for persistence
              AsyncStorage.setItem(LOCATION_STORAGE_KEY, JSON.stringify(limitedPath))
                .catch(error => console.error('Error saving path:', error));
              
              return limitedPath;
            });
            lastLocationTime.current = now;
          } else {
            // Still inject current location even if not adding to path
            setTimeout(() => {
              injectLocationToWebView(newLocation, locationPath, location.coords.accuracy || undefined);
            }, 100);
          }

          console.log(`Location updated: ${newLocation.lat}, ${newLocation.lng}`);
        }
      );

      locationWatchId.current = watchId;
    } catch (error) {
      console.error('Error starting location tracking:', error);
      Alert.alert('Error', 'Failed to start location tracking');
    }
  };

  // Stop foreground location tracking
  const stopLocationTracking = () => {
    if (locationWatchId.current) {
      locationWatchId.current.remove();
      locationWatchId.current = null;
    }
    setIsTrackingLocation(false);
    console.log('Stopped live location tracking');
  };

  // Start background location tracking
  const startBackgroundTracking = async () => {
    try {
      // Check if we already have background permission from startup
      const { status: backgroundStatus } = await Location.getBackgroundPermissionsAsync();
      console.log('Current background permission status:', backgroundStatus);
      
      if (backgroundStatus !== 'granted') {
        Alert.alert(
          'Background Permission Required',
          'Background location tracking requires "Allow all the time" permission. This should have been granted during app setup.\n\nPlease:\n1. Open Settings\n2. Find Yatra app\n3. Go to Location\n4. Select "Allow all the time"',
          [
            { text: 'Cancel', style: 'cancel' },
            { 
              text: 'Request Permission', 
              onPress: async () => {
                const retry = await Location.requestBackgroundPermissionsAsync();
                if (retry.status === 'granted') {
                  startBackgroundTracking(); // Retry if permission granted
                }
              }
            }
          ]
        );
        return;
      }

      setIsBackgroundTracking(true);
      console.log('Starting background location tracking with both permissions granted...');

      // Start background location updates
      await Location.startLocationUpdatesAsync(BACKGROUND_LOCATION_TASK, {
        accuracy: Location.Accuracy.BestForNavigation,
        timeInterval: 10000, // Every 10 seconds in background
        distanceInterval: 20, // Every 20 meters
        foregroundService: {
          notificationTitle: 'Yatra - Location Tracking',
          notificationBody: 'Tracking your journey in the background',
          notificationColor: '#4285F4',
        },
      });

      Alert.alert(
        '✅ Background Tracking Active',
        'Your location will be tracked continuously, even when the app is closed. You\'ll see a notification while tracking is active.',
        [{ text: 'Got it!' }]
      );
      
      console.log('Background location tracking started successfully');
      
    } catch (error) {
      console.error('Error starting background tracking:', error);
      setIsBackgroundTracking(false);
      Alert.alert(
        'Background Tracking Failed', 
        'Could not start background tracking. Please try again or check your location settings.',
        [{ text: 'OK' }]
      );
    }
  };

  // Start background location tracking silently (no alerts)
  const startBackgroundTrackingSilently = async () => {
    try {
      // Check if we already have background permission from startup
      const { status: backgroundStatus } = await Location.getBackgroundPermissionsAsync();
      console.log('Silent check - Current background permission status:', backgroundStatus);
      
      if (backgroundStatus !== 'granted') {
        console.log('Background permission not granted, skipping silent background tracking');
        return; // Silently skip if no permission
      }

      setIsBackgroundTracking(true);
      console.log('Starting background location tracking silently...');

      // Start background location updates
      await Location.startLocationUpdatesAsync(BACKGROUND_LOCATION_TASK, {
        accuracy: Location.Accuracy.BestForNavigation,
        timeInterval: 10000, // Every 10 seconds in background
        distanceInterval: 20, // Every 20 meters
        foregroundService: {
          notificationTitle: 'Yatra - GPS Tracking',
          notificationBody: 'Live location tracking active',
          notificationColor: '#6B6BFF',
        },
      });
      
      console.log('Background location tracking started silently');
      
    } catch (error) {
      console.error('Error starting silent background tracking:', error);
      setIsBackgroundTracking(false);
      // No alert - fail silently
    }
  };

  // Stop background tracking
  const stopBackgroundTracking = async () => {
    try {
      const isTaskRunning = await TaskManager.isTaskRegisteredAsync(BACKGROUND_LOCATION_TASK);
      if (isTaskRunning) {
        await Location.stopLocationUpdatesAsync(BACKGROUND_LOCATION_TASK);
      }
      setIsBackgroundTracking(false);
      console.log('Stopped background location tracking');
      Alert.alert('Background Tracking Stopped', 'Location tracking has been disabled.');
    } catch (error) {
      console.error('Error stopping background tracking:', error);
    }
  };

  // Clear location path
  const clearLocationPath = () => {
    setLocationPath([]);
    AsyncStorage.removeItem(LOCATION_STORAGE_KEY);
    
    // Clear path from map
    webViewRef.current?.injectJavaScript(`
      try {
        if (window.clearPath && typeof window.clearPath === 'function') {
          window.clearPath();
        }
      } catch (e) {
        console.error('Failed to clear path:', e);
      }
      true;
    `);
  };

  // Track if WebView is ready
  const [isWebViewReady, setIsWebViewReady] = useState(false);

  // Inject location whenever currentLocation changes and WebView is ready
  useEffect(() => {
    if (isWebViewReady && currentLocation) {
      console.log('Injecting current location to WebView:', currentLocation);
      setTimeout(() => {
        injectLocationToWebView(currentLocation, locationPath, locationAccuracy || undefined);
      }, 200);
    }
  }, [currentLocation, isWebViewReady, locationPath, locationAccuracy]);

  // Auto-get current location on component mount
  useEffect(() => {
    const initializeLocationAndPath = async () => {
      try {
        // Load saved path
        const savedPath = await AsyncStorage.getItem(LOCATION_STORAGE_KEY);
        if (savedPath) {
          const path = JSON.parse(savedPath);
          setLocationPath(path);
          console.log('Loaded saved path with', path.length, 'points');
        }

        // Check if background task is already running
        const isTaskRunning = await TaskManager.isTaskRegisteredAsync(BACKGROUND_LOCATION_TASK);
        if (isTaskRunning) {
          console.log('Background location task is already running');
          setIsBackgroundTracking(true);
        }

        // Check existing permissions first to avoid unnecessary prompts
        console.log('Checking existing location permissions...');
        const existingPermission = await Location.getForegroundPermissionsAsync();
        let status = existingPermission.status;
        
        if (status !== 'granted') {
          console.log('Requesting location permission...');
          const { status: newStatus } = await Location.requestForegroundPermissionsAsync();
          status = newStatus;
        }
        
        if (status === 'granted') {
          console.log('Location permission granted, getting current position...');
          const location = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.High,
          });
          
          const currentPos = {
            lat: location.coords.latitude,
            lng: location.coords.longitude
          };
          
          console.log('Location obtained:', currentPos);
          setCurrentLocation(currentPos);
          setLocationAccuracy(location.coords.accuracy);
          
          console.log('Current location state updated');
          
          // Auto-start live tracking for continuous location updates
          console.log('Auto-starting live location tracking...');
          startLocationTracking();
          
          // Auto-start background tracking if not already running (silently)
          if (!isTaskRunning) {
            console.log('Auto-starting background location tracking silently...');
            setTimeout(() => {
              startBackgroundTrackingSilently();
            }, 2000); // Start background tracking after 2 seconds
          }
        } else {
          console.log('Location permission denied, using default Delhi location');
          // Set default Delhi location if permission denied
          setCurrentLocation({ lat: 28.6139, lng: 77.2090 });
          setLocationAccuracy(100);
        }
      } catch (error) {
        console.error('Error initializing location:', error);
        // Fallback to default location on error
        console.log('Setting fallback location due to error');
        setCurrentLocation({ lat: 28.6139, lng: 77.2090 });
        setLocationAccuracy(100);
      }
    };
    
    initializeLocationAndPath();
  }, []);

  return (
    <View style={{ width: '100%' }}>
      {/* Header with location info */}
      <View className="mb-4 flex-row items-center justify-between">
        <View className="flex-row items-center gap-3">
          <Ionicons name="navigate" size={24} color="#6B6BFF" />
          <Text className="text-lg font-bold text-[#6B6BFF]">Live Location</Text>
        </View>
        {isBackgroundTracking && (
          <View className="flex-row items-center gap-1 bg-green-100 px-2 py-1 rounded-full">
            <View className="w-2 h-2 bg-green-500 rounded-full" />
            <Text className="text-xs text-green-700 font-medium">Background Active</Text>
          </View>
        )}
      </View>

      {/* Location details */}
      {currentLocation && (
        <View className="mb-4 bg-gray-50 p-3 rounded-lg">
          <View className="flex-row items-center justify-between">
            <View className="flex-1">
              <Text className="text-sm text-gray-600">Current Position</Text>
              <Text className="text-base font-semibold text-gray-900">
                {currentLocation.lat.toFixed(5)}, {currentLocation.lng.toFixed(5)}
              </Text>
            </View>
            {locationAccuracy && (
              <View className="bg-blue-100 px-2 py-1 rounded">
                <Text className="text-xs text-blue-700">±{Math.round(locationAccuracy)}m</Text>
              </View>
            )}
          </View>
          {locationPath.length > 0 && (
            <View className="mt-2 flex-row items-center gap-4">
              <Text className="text-sm text-gray-600">Path Points: {locationPath.length}</Text>
              <Text className="text-sm text-gray-600">Distance: {calculatePathDistance(locationPath).toFixed(0)}m</Text>
            </View>
          )}
        </View>
      )}

      {/* Map container with gradient overlay */}
      <View style={{ width: '100%', height: height || 250, overflow: 'hidden', borderRadius: 12 }}>
        {!currentLocation ? (
          <View className="flex-1 items-center justify-center bg-gray-100">
            <ActivityIndicator size="large" color="#6B6BFF" />
            <Text className="mt-2 text-gray-600">Getting location...</Text>
          </View>
        ) : (
          <WebView
            ref={webViewRef}
            source={{ html: generateHTML() }}
            className="flex-1 bg-gray-100 rounded-xl"
            onMessage={(event) => {
              if (event.nativeEvent.data === 'map-ready') {
                console.log('Map is ready! Setting WebView ready state...');
                setIsWebViewReady(true);
                
                // Inject current location if available (useEffect will also handle this)
                if (currentLocation) {
                  console.log('Map ready and location available, injecting immediately...');
                  setTimeout(() => {
                    injectLocationToWebView(currentLocation, locationPath, locationAccuracy || undefined);
                  }, 300);
                } else {
                  console.log('Map ready but no location yet, waiting for location...');
                }
              }
            }}
            javaScriptEnabled={true}
            domStorageEnabled={true}
          />
        )}
        
        {/* Gradient overlays for better integration */}
        <LinearGradient
          colors={['rgba(255,255,255,1)', 'transparent']}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 40,
          }}
        />
        <LinearGradient
          colors={['transparent', 'rgba(255,255,255,1)']}
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: 40,
          }}
        />
        
        {/* Status indicator */}
        {currentLocation && (
          <View style={{
            position: 'absolute',
            top: 10,
            right: 10,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            paddingHorizontal: 8,
            paddingVertical: 4,
            borderRadius: 12,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 4,
          }}>
            <View style={{
              width: 6,
              height: 6,
              backgroundColor: '#4CAF50',
              borderRadius: 3,
            }} />
            <Text style={{ color: 'white', fontSize: 10, fontWeight: '600' }}>
              LIVE
            </Text>
          </View>
        )}

        {/* Fullscreen button like weather app */}
        <TouchableOpacity 
          onPress={() => setIsFullScreenVisible(true)} 
          className="absolute bottom-4 right-4 bg-black/50 px-3 py-2 rounded-full flex-row items-center gap-1.5 shadow-lg"
        >
          <Ionicons name="expand" size={16} color="white" />
          <Text className="text-white text-xs font-semibold">Full Screen</Text>
        </TouchableOpacity>
      </View>

      {/* Fullscreen Modal */}
      <Modal
        visible={isFullScreenVisible}
        animationType="slide"
        presentationStyle="fullScreen"
        onRequestClose={() => setIsFullScreenVisible(false)}
      >
        <View className="flex-1 bg-gray-50">
          <View className="flex-row justify-between items-center px-5 py-4 bg-white border-b border-gray-200 shadow-sm">
            <View className="flex-row items-center gap-2">
              <Ionicons name="navigate" size={24} color="#6B6BFF" />
              <Text className="text-lg font-bold text-[#6B6BFF]">Live GPS Tracking</Text>
            </View>
            <TouchableOpacity onPress={() => setIsFullScreenVisible(false)} className="bg-[#6B6BFF] px-4 py-2 rounded-2xl flex-row items-center gap-1.5">
              <Ionicons name="close" size={20} color="white" />
              <Text className="text-white text-sm font-semibold">Close</Text>
            </TouchableOpacity>
          </View>
          
          <View className="flex-1">
            {currentLocation ? (
              <WebView
                ref={fullScreenWebViewRef}
                source={{ html: generateHTML() }}
                className="flex-1 bg-gray-100 rounded-xl"
                onMessage={(event) => {
                  if (event.nativeEvent.data === 'map-ready') {
                    console.log('Fullscreen map is ready!');
                    setWebViewLoaded(true);
                    
                    if (currentLocation) {
                      setTimeout(() => {
                        fullScreenWebViewRef.current?.injectJavaScript(`
                          if (window.updateUserLocation) {
                            window.updateUserLocation(${JSON.stringify(currentLocation)}, ${JSON.stringify(locationPath)}, ${locationAccuracy || 'null'});
                          }
                        `);
                      }, 300);
                    }
                  }
                }}
                javaScriptEnabled={true}
                domStorageEnabled={true}
              />
            ) : (
              <View className="flex-1 justify-center items-center bg-gray-50">
                <ActivityIndicator size="large" color="#6B6BFF" />
                <Text className="mt-3 text-base text-[#6B6BFF] font-medium">Getting location...</Text>
              </View>
            )}

            {/* Fullscreen status indicators */}
            {currentLocation && (
              <View className="absolute bottom-5 left-5 right-5 bg-white/95 rounded-xl p-4 shadow-lg">
                <View className="flex-row items-center gap-2 mb-2">
                  <Ionicons name="location" size={16} color="#6B6BFF" />
                  <Text className="text-sm text-gray-800 font-medium">
                    {currentLocation.lat.toFixed(5)}, {currentLocation.lng.toFixed(5)}
                  </Text>
                </View>
                <View className="flex-row items-center gap-2 mb-2">
                  <Ionicons name="navigate-circle" size={16} color="#6B6BFF" />
                  <Text className="text-sm text-gray-800 font-medium">±{Math.round(locationAccuracy || 0)}m</Text>
                </View>
                {locationPath.length > 0 && (
                  <View className="flex-row items-center gap-2">
                    <Ionicons name="trail-sign" size={16} color="#6B6BFF" />
                    <Text className="text-sm text-gray-800 font-medium">
                      {calculatePathDistance(locationPath).toFixed(0)}m traveled
                    </Text>
                  </View>
                )}
              </View>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

// Helper function to calculate distance between two points
const calculateDistance = (point1: {lat: number, lng: number}, point2: {lat: number, lng: number}): number => {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = (point1.lat * Math.PI) / 180;
  const φ2 = (point2.lat * Math.PI) / 180;
  const Δφ = ((point2.lat - point1.lat) * Math.PI) / 180;
  const Δλ = ((point2.lng - point1.lng) * Math.PI) / 180;

  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ/2) * Math.sin(Δλ/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  
  return R * c;
};

// Helper function to calculate path distance
const calculatePathDistance = (path: Array<{lat: number, lng: number}>): number => {
  if (path.length < 2) return 0;
  
  let totalDistance = 0;
  for (let i = 1; i < path.length; i++) {
    totalDistance += calculateDistance(path[i-1], path[i]);
  }
  return totalDistance;
};
