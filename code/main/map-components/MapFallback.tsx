import { useState, useEffect, useRef } from 'react'
import { View, TouchableOpacity, Text, Modal } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { WebView } from 'react-native-webview'

interface LocationData {
  id: number;
  name: string;
  lat: number;
  lng: number;
  type: 'hospital' | 'clinic' | 'hotel';
}

interface MapFallbackProps {
  lat: number;
  lon: number;
  mapStyle?: 'osm' | 'satellite';
  showFullScreen?: boolean;
  onClose?: () => void;
}

export default function MapFallback({ lat, lon, mapStyle = 'osm', showFullScreen = false, onClose }: MapFallbackProps) {
  const [facilities, setFacilities] = useState<LocationData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [hasUserLocation, setHasUserLocation] = useState(false);
  const [webViewLoaded, setWebViewLoaded] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [lastFetchCoords, setLastFetchCoords] = useState<{lat: number, lng: number} | null>(null);
  const [facilitiesCache, setFacilitiesCache] = useState<Map<string, {facilities: LocationData[], timestamp: number}>>(new Map());
  
  // Refs for debouncing
  const debounceTimeoutRef = useRef<any>(null);
  const lastRequestTimeRef = useRef<number>(0);
  const isLoadingRef = useRef<boolean>(false);


  // Generate cache key for coordinates
  const generateCacheKey = (lat: number, lng: number): string => {
    // Round to 3 decimal places (~100m precision) to create reasonable cache zones
    const roundedLat = Math.round(lat * 1000) / 1000;
    const roundedLng = Math.round(lng * 1000) / 1000;
    return `${roundedLat},${roundedLng}`;
  };
  
  // Check if coordinates are significantly different (>500m)
  const areCoordsDifferent = (lat1: number, lng1: number, lat2: number, lng2: number): boolean => {
    const distance = Math.sqrt(Math.pow((lat1 - lat2) * 111000, 2) + Math.pow((lng1 - lng2) * 111000, 2));
    return distance > 500; // 500 meters threshold
  };



  // Function to build Overpass query - highly optimized to avoid timeouts
  const buildOverpassQuery = (latitude: number, longitude: number, radius: number = 2000) => {
    return `
      [out:json][timeout:10];
      (
        node["amenity"="hospital"](around:${radius},${latitude},${longitude});
        node["amenity"="clinic"](around:${radius},${latitude},${longitude});
        node["tourism"="hotel"](around:${radius},${latitude},${longitude});
      );
      out;
    `;
  };

  // Debounced fetch with caching and rate limiting - NO HARDCODED FACILITIES
  const fetchNearbyPlaces = async (latitude: number, longitude: number, forceRefresh: boolean = false) => {
    // Check if already loading
    if (isLoadingRef.current) {
      console.log('Already loading, skipping request');
      return;
    }
    
    // Check if coordinates haven't changed significantly
    if (!forceRefresh && lastFetchCoords && !areCoordsDifferent(latitude, longitude, lastFetchCoords.lat, lastFetchCoords.lng)) {
      console.log('Coordinates haven\'t changed significantly, skipping fetch');
      return;
    }
    
    // Rate limiting - min 5 seconds between requests
    const now = Date.now();
    if (now - lastRequestTimeRef.current < 5000) {
      console.log('Rate limiting - too soon since last request');
      return;
    }
    
    // Check cache first
    const cacheKey = generateCacheKey(latitude, longitude);
    const cached = facilitiesCache.get(cacheKey);
    if (!forceRefresh && cached && (now - cached.timestamp) < 300000) { // 5 minute cache
      console.log('Using cached data for', cacheKey);
      setFacilities(cached.facilities);
      setLastFetchCoords({lat: latitude, lng: longitude});
      return;
    }
    
    isLoadingRef.current = true;
    setIsLoading(true);
    lastRequestTimeRef.current = now;
    
    try {
      const query = buildOverpassQuery(latitude, longitude);
      console.log('Fetching facilities for coordinates:', latitude, longitude);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);
      
      const response = await fetch('https://overpass-api.de/api/interpreter', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: query,
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);

      if (!response.ok) {
        // Handle specific timeout and server errors - keep existing facilities
        if ([429, 502, 503, 504, 514].includes(response.status)) {
          console.warn(`Overpass API error (${response.status}), keeping existing facilities`);
          return; // Keep existing facilities instead of showing any fallback
        }
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log(`API returned ${data.elements?.length || 0} elements`);
      
      if (data.elements && Array.isArray(data.elements) && data.elements.length > 0) {
        const transformedFacilities: LocationData[] = data.elements
          .filter((element: any) => element.lat && element.lon && element.tags)
          .map((element: any, index: number) => ({
            id: element.id || Date.now() + index,
            name: element.tags.name || 
                  (element.tags.amenity === 'hospital' ? 'Hospital' : 
                   element.tags.amenity === 'clinic' ? 'Clinic' : 
                   element.tags.tourism === 'hotel' ? 'Hotel' : 'Facility'),
            lat: element.lat,
            lng: element.lon,
            type: element.tags.amenity === 'hospital' ? 'hospital' as const :
                  element.tags.amenity === 'clinic' ? 'clinic' as const :
                  element.tags.tourism === 'hotel' ? 'hotel' as const : 'hospital' as const
          }));
        
        console.log(`Found ${transformedFacilities.length} real facilities`);
        setFacilities(transformedFacilities);
        setLastFetchCoords({lat: latitude, lng: longitude});
        
        // Cache the results
        setFacilitiesCache(prev => {
          const newCache = new Map(prev);
          newCache.set(cacheKey, {facilities: transformedFacilities, timestamp: now});
          // Limit cache size to prevent memory issues
          if (newCache.size > 20) {
            const firstKey = newCache.keys().next().value;
            if (firstKey) {
              newCache.delete(firstKey);
            }
          }
          return newCache;
        });
      } else {
        console.log('No facilities found, keeping existing or showing empty');
        // Don't replace existing facilities, just keep what we have
      }
    } catch (error: any) {
      console.error('Error fetching facilities:', error);
      if (error.name === 'AbortError') {
        console.log('Request timed out, keeping existing facilities');
      }
      // Don't replace existing facilities on error
    } finally {
      isLoadingRef.current = false;
      setIsLoading(false);
    }
  };

  // Effect to load facilities when coordinates change or WebView loads (debounced)
  useEffect(() => {
    if (webViewLoaded && lat && lon) {
      // Clear previous debounce timeout
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
      
      // Debounce the fetch call to prevent excessive API requests
      debounceTimeoutRef.current = setTimeout(() => {
        console.log('WebView loaded or coords changed, fetching facilities...');
        fetchNearbyPlaces(lat, lon, false);
        setHasUserLocation(true);
      }, 1500); // 1.5 second debounce
    }
    
    // Cleanup timeout on unmount
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, [lat, lon, webViewLoaded]);

  // Effect to inject facilities when they change or WebView loads
  useEffect(() => {
    if (webViewLoaded && facilities.length > 0) {
      const timer = setTimeout(() => {
        console.log('Re-injecting facilities to both WebViews');
        injectFacilitiesToBothWebViews(facilities);
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [facilities, webViewLoaded]);
  
  // Load facilities immediately on first mount (fallback)
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!webViewLoaded && facilities.length === 0) {
        console.log('WebView taking too long, loading fallback data...');
        // No fallback data - keep existing facilities or set empty if none
        // setFacilities([]); // Commented out to prevent showing hardcoded data
      }
    }, 3000);
    
    return () => clearTimeout(timer);
  }, []);

  // Function to handle search
  const handleSearch = () => {
    if (!searchQuery.trim()) return;
    // For now, just log the search - in full implementation would use geocoding
    console.log('Searching for:', searchQuery);
  };

  // choose tile URL based on requested style
  const tileUrl = mapStyle === 'satellite'
    ? 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
    : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'

  const html = `
  <!DOCTYPE html>
  <html>
  <head>
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <meta name="format-detection" content="telephone=no">
    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
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
        border-radius: 8px !important;
      }
      
      .leaflet-control-zoom a { 
        padding: 8px 10px; 
        font-size: 20px; 
        font-weight: bold;
        border-radius: 4px !important;
        background: rgba(255, 255, 255, 0.95) !important;
      }
      
      .leaflet-control-zoom a:hover {
        background: #f0f0f0 !important;
      }
      
      /* Better touch targets */
      .leaflet-marker-icon {
        cursor: pointer !important;
      }
      
      /* Smooth map interactions */
      .leaflet-container {
        background: #f8f9fa;
      }
    </style>
  </head>
  <body>
    <div id="map"></div>
    <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
    <script>
      try {
        const map = L.map('map', {
          center: [${lat}, ${lon}],
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
          zoomDelta: 0.25
        });
        
        L.tileLayer('${tileUrl}', {
          maxZoom: 19,
          attribution: '© OpenStreetMap contributors'
        }).addTo(map);
        
        // User location marker
        L.marker([${lat}, ${lon}]).addTo(map).bindPopup('You are here').openPopup();

        // Custom icons for different facility types
        const hospitalIcon = L.divIcon({
          html: '<div style="background-color: #ef4444; color: white; border-radius: 50%; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; font-size: 12px;">🏥</div>',
          iconSize: [24, 24],
          className: 'custom-div-icon'
        });

        const hotelIcon = L.divIcon({
          html: '<div style="background-color: #3b82f6; color: white; border-radius: 50%; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; font-size: 12px;">🏨</div>',
          iconSize: [24, 24],
          className: 'custom-div-icon'
        });

        // Function to add facilities to map
        window.addFacilities = function(facilitiesData) {
          console.log('Adding facilities to map:', facilitiesData.length);
          
          // Clear existing facility markers (keep user location)
          map.eachLayer(function(layer) {
            if (layer instanceof L.Marker && layer.getPopup() && !layer.getPopup().getContent().includes('You are here')) {
              map.removeLayer(layer);
            }
          });
          
          // Add new facility markers
          facilitiesData.forEach(function(facility) {
            const icon = (facility.type === 'hospital' || facility.type === 'clinic') ? hospitalIcon : hotelIcon;
            
            L.marker([facility.lat, facility.lng], { icon })
              .addTo(map)
              .bindPopup('<b>' + facility.name + '</b><br/>' + facility.type.charAt(0).toUpperCase() + facility.type.slice(1));
          });
        };

        // notify React Native that the map is ready
        if (window && window.ReactNativeWebView && window.ReactNativeWebView.postMessage) {
          window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'map-ready' }));
        }

        // Listen for messages from React Native
        window.addEventListener('message', function(event) {
          try {
            const message = JSON.parse(event.data);
            if (message.type === 'add-facilities' && message.facilities) {
              window.addFacilities(message.facilities);
            }
          } catch (err) {
            console.error('Error processing message:', err);
          }
        });

        // Auto-add facilities when they're available
        setTimeout(() => {
          if (window.ReactNativeWebView && window.ReactNativeWebView.postMessage) {
            window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'request-facilities' }));
          }
        }, 500);
        
        // Also try to add any existing facilities
        setTimeout(() => {
          if (window.addFacilities) {
            console.log('Attempting to add facilities from window');
            // This will be injected by React Native
          }
        }, 1000);

        // Throttled map event handling to prevent excessive facility reloading
        let moveTimeout;
        map.on('moveend', function(e) {
          // Clear previous timeout to debounce rapid movements
          clearTimeout(moveTimeout);
          moveTimeout = setTimeout(() => {
            const center = map.getCenter();
            const zoom = map.getZoom();
            
            if (window && window.ReactNativeWebView && window.ReactNativeWebView.postMessage) {
              window.ReactNativeWebView.postMessage(JSON.stringify({ 
                type: 'map-moved', 
                center: { lat: center.lat, lng: center.lng },
                zoom: zoom
              }));
            }
          }, 1000); // Wait 1 second after movement stops
        });
        
        map.on('click', function(e) {
          if (window && window.ReactNativeWebView && window.ReactNativeWebView.postMessage) {
            window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'map-click', latlng: e.latlng }));
          }
        });
      } catch (err) {
        if (window && window.ReactNativeWebView && window.ReactNativeWebView.postMessage) {
          window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'map-error', message: String(err) }));
        }
      }
    </script>
  </body>
  </html>
  `

  const handleWebViewMessage = (event: any) => {
    try {
      const message = JSON.parse(event.nativeEvent.data);
      console.log('WebView message:', message.type);
      
      if (message.type === 'map-ready') {
        console.log('Map is ready! Loading facilities...');
        setWebViewLoaded(true);
        
        // Trigger facility loading when map is ready
        if (!hasUserLocation || facilities.length === 0) {
          setTimeout(() => {
            fetchNearbyPlaces(lat, lon);
          }, 500);
        } else if (facilities.length > 0) {
          // Send existing facilities to both WebViews if they exist
          setTimeout(() => {
            injectFacilitiesToBothWebViews(facilities);
          }, 1000);
        }
      }
      
      // Removed automatic reloading on map move to prevent excessive API calls
      if (message.type === 'request-facilities') {
        // Send facilities data to both WebViews when requested
        if (facilities.length > 0) {
          injectFacilitiesToBothWebViews(facilities);
        }
      }
    } catch (error) {
      console.error('Error handling WebView message:', error);
    }
  };

  // Effect to update markers when facilities change
  useEffect(() => {
    if (facilities.length > 0 && webViewRef.current) {
      // Try multiple methods to ensure markers are added
      setTimeout(() => {
        webViewRef.current?.postMessage(JSON.stringify({
          type: 'add-facilities',
          facilities: facilities
        }));
        
        // Also inject directly
        webViewRef.current?.injectJavaScript(`
          if (window.addFacilities) {
            window.addFacilities(${JSON.stringify(facilities)});
          }
        `);
      }, 100);
    }
  }, [facilities]);

  const webViewRef = useRef<WebView>(null);
  const fullScreenWebViewRef = useRef<WebView>(null);

  // Function to inject facilities to both WebViews
  const injectFacilitiesToBothWebViews = (facilitiesToInject: LocationData[]) => {
    const injection = `
      try {
        if (window.addFacilities && typeof window.addFacilities === 'function') {
          console.log('Adding ${facilitiesToInject.length} facilities to map');
          window.addFacilities(${JSON.stringify(facilitiesToInject)});
        }
      } catch (e) {
        console.error('Failed to inject facilities:', e);
      }
      true;
    `;
    
    webViewRef.current?.injectJavaScript(injection);
    fullScreenWebViewRef.current?.injectJavaScript(injection);
  };

  const openFullScreenMap = () => {
    setIsModalVisible(true);
  };

  const closeFullScreenMap = () => {
    setIsModalVisible(false);
    if (onClose) onClose();
  };

  const MapContent = ({ isFullScreen = false }: { isFullScreen?: boolean }) => (
    <>
      <View className="flex-1 bg-transparent">
        <WebView 
          ref={isFullScreen ? fullScreenWebViewRef : webViewRef}
          originWhitelist={["*"]} 
          source={{ html }} 
          style={{ flex: 1, backgroundColor: 'transparent' }}
          onMessage={handleWebViewMessage}
          onLoad={() => {
            console.log(`WebView loaded successfully (${isFullScreen ? 'fullscreen' : 'regular'})`);
            setWebViewLoaded(true);
            // Inject existing facilities when WebView loads
            if (facilities.length > 0) {
              setTimeout(() => {
                const injection = `
                  try {
                    if (window.addFacilities && typeof window.addFacilities === 'function') {
                      console.log('Adding ${facilities.length} facilities to map');
                      window.addFacilities(${JSON.stringify(facilities)});
                    }
                  } catch (e) {
                    console.error('Failed to inject facilities:', e);
                  }
                  true;
                `;
                
                if (isFullScreen) {
                  fullScreenWebViewRef.current?.injectJavaScript(injection);
                } else {
                  webViewRef.current?.injectJavaScript(injection);
                }
              }, 1500);
            }
          }}
          onLoadEnd={() => {
            console.log(`WebView load ended (${isFullScreen ? 'fullscreen' : 'regular'})`);
            setWebViewLoaded(true);
          }}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          startInLoadingState={false}
          scrollEnabled={false}
          bounces={false}
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}
          overScrollMode="never"
          nestedScrollEnabled={false}
        />
      </View>

      {/* Loading indicator */}
      {isLoading && (
        <View className="absolute top-[60px] left-4 bg-black/80 px-3 py-1.5 rounded z-50">
          <Text className="text-white text-xs">Loading facilities...</Text>
        </View>
      )}

      {/* Legend with facility counts - positioned at top-right */}
      <View
        className="bg-white/95 rounded-lg p-2 shadow-lg"
        style={{ position: 'absolute', top: 18, right: 12, width: 100, zIndex: 1002, elevation: 20 }}
      >
        <Text className="text-sm font-bold mb-2">Legend</Text>
        <View className="flex-row items-center mb-1">
          <Text className="text-base mr-2">🏥</Text>
          <Text className="text-xs text-gray-600">Hospitals ({facilities.filter(f => f.type === 'hospital').length})</Text>
        </View>
        <View className="flex-row items-center mb-1">
          <Text className="text-base mr-2">🏨</Text>
          <Text className="text-xs text-gray-600">Hotels ({facilities.filter(f => f.type === 'hotel').length})</Text>
        </View>
        <View className="flex-row items-center">
          <Text className="text-base mr-2">📍</Text>
          <Text className="text-xs text-gray-600">Location</Text>
        </View>
      </View>
    </>
  );

  if (showFullScreen) {
    return (
      <Modal
        visible={true}
        animationType="slide"
        presentationStyle="fullScreen"
        onRequestClose={closeFullScreenMap}
      >
        <View className="flex-1">
          <View className="flex-row justify-end items-center px-5 py-4 bg-[#f8f9fa] border-b border-[#e9ecef]">
            <TouchableOpacity onPress={closeFullScreenMap} className="bg-red-600 px-4 py-2 rounded">
              <Text className="text-white text-base font-bold">✕ Close</Text>
            </TouchableOpacity>
          </View>
          <View className="flex-1">
            <MapContent />
          </View>
        </View>
      </Modal>
    );
  }

  return (
    <View className="relative" style={{ height: 360 }}>
      <MapContent isFullScreen={false} />
      
      <TouchableOpacity
        onPress={openFullScreenMap}
        className="bg-black/50 px-4 py-2 rounded-full shadow-lg"
        style={{ position: 'absolute', bottom: 36, right: 20, zIndex: 1005, elevation: 30 }}
      >
        <View className="flex-row items-center">
          <Ionicons name="expand" size={16} color="white" />
          <Text className="text-white text-sm font-bold ml-2">Full Screen</Text>
        </View>
      </TouchableOpacity>
      
      <Modal
        visible={isModalVisible}
        animationType="slide"
        presentationStyle="fullScreen"
        onRequestClose={closeFullScreenMap}
      >
        <View className="flex-1">
          <View className="flex-row justify-end items-center px-5 py-4 bg-[#f8f9fa] border-b border-[#e9ecef]">
            <TouchableOpacity onPress={closeFullScreenMap} className="bg-red-600 px-4 py-2 rounded">
              <Text className="text-white text-base font-bold">✕ Close</Text>
            </TouchableOpacity>
          </View>
          <View className="flex-1">
            <MapContent isFullScreen={true} />
          </View>
        </View>
      </Modal>
    </View>
  );
}
// styles migrated to NativeWind className usage
