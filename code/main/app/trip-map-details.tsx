import React, { useState, useEffect, useRef } from 'react'
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Modal, 
  ScrollView, 
  ActivityIndicator, 
  Alert 
} from 'react-native'
import { WebView } from 'react-native-webview'
import { LinearGradient } from 'expo-linear-gradient'
import { Ionicons } from '@expo/vector-icons'
import { useLocalSearchParams, useRouter } from 'expo-router'
import * as Location from 'expo-location'

interface LocationData {
  id: number;
  name: string;
  lat: number;
  lng: number;
  type: 'hospital' | 'clinic' | 'hotel';
}

interface TripLocation {
  name: string;
  lat: number;
  lng: number;
}

export default function TripMapDetails() {
  const params = useLocalSearchParams<{
    fromAddress: string;
    toAddress: string;
    fromLat?: string;
    fromLng?: string;
    toLat?: string;
    toLng?: string;
    heading?: string;
    date?: string;
  }>();
  
  const router = useRouter();
  const webViewRef = useRef<WebView>(null);
  
  const [fromLocation, setFromLocation] = useState<TripLocation | null>(null);
  const [toLocation, setToLocation] = useState<TripLocation | null>(null);
  const [facilities, setFacilities] = useState<LocationData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [webViewLoaded, setWebViewLoaded] = useState(false);
  
  // Geocode addresses to coordinates if not provided
  const geocodeLocations = async () => {
    try {
      setIsLoading(true);
      
      // Use provided coordinates or geocode addresses
      let fromCoords = null;
      let toCoords = null;
      
      if (params.fromLat && params.fromLng) {
        fromCoords = {
          lat: parseFloat(params.fromLat),
          lng: parseFloat(params.fromLng)
        };
      } else {
        const fromResults = await Location.geocodeAsync(params.fromAddress);
        if (fromResults && fromResults.length > 0) {
          fromCoords = {
            lat: fromResults[0].latitude,
            lng: fromResults[0].longitude
          };
        }
      }
      
      if (params.toLat && params.toLng) {
        toCoords = {
          lat: parseFloat(params.toLat),
          lng: parseFloat(params.toLng)
        };
      } else {
        const toResults = await Location.geocodeAsync(params.toAddress);
        if (toResults && toResults.length > 0) {
          toCoords = {
            lat: toResults[0].latitude,
            lng: toResults[0].longitude
          };
        }
      }
      
      if (fromCoords) {
        setFromLocation({
          name: params.fromAddress,
          lat: fromCoords.lat,
          lng: fromCoords.lng
        });
      }
      
      if (toCoords) {
        setToLocation({
          name: params.toAddress,
          lat: toCoords.lat,
          lng: toCoords.lng
        });
      }
      
      // Fetch facilities around both locations
      if (fromCoords || toCoords) {
        await fetchNearbyFacilities(fromCoords, toCoords);
      }
      
    } catch (error) {
      console.error('Error geocoding locations:', error);
      Alert.alert('Error', 'Could not find locations on map');
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch hospitals and hotels around from and to locations
  const fetchNearbyFacilities = async (fromCoords: any, toCoords: any) => {
    try {
      const allFacilities: LocationData[] = [];
      
      // Fetch around "from" location
      if (fromCoords) {
        const fromFacilities = await fetchFacilitiesAroundLocation(fromCoords.lat, fromCoords.lng);
        allFacilities.push(...fromFacilities);
      }
      
      // Fetch around "to" location
      if (toCoords) {
        const toFacilities = await fetchFacilitiesAroundLocation(toCoords.lat, toCoords.lng);
        allFacilities.push(...toFacilities);
      }
      
      // Remove duplicates based on coordinates
      const uniqueFacilities = allFacilities.filter((facility, index, self) => 
        index === self.findIndex(f => 
          Math.abs(f.lat - facility.lat) < 0.001 && 
          Math.abs(f.lng - facility.lng) < 0.001
        )
      );
      
      setFacilities(uniqueFacilities);
      
    } catch (error) {
      console.error('Error fetching facilities:', error);
    }
  };

  // Fetch facilities using Overpass API
  const fetchFacilitiesAroundLocation = async (lat: number, lng: number): Promise<LocationData[]> => {
    try {
      const radius = 3000; // 3km radius
      const query = `
        [out:json][timeout:10];
        (
          node["amenity"="hospital"](around:${radius},${lat},${lng});
          node["amenity"="clinic"](around:${radius},${lat},${lng});
          node["tourism"="hotel"](around:${radius},${lat},${lng});
        );
        out;
      `;
      
      const response = await fetch('https://overpass-api.de/api/interpreter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: query,
      });
      
      if (!response.ok) return [];
      
      const data = await response.json();
      
      return (data.elements || [])
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
        
    } catch (error) {
      console.error('Error fetching facilities from Overpass:', error);
      return [];
    }
  };

  // Generate HTML for the map
  const generateHTML = () => {
    const centerLat = fromLocation && toLocation ? 
      (fromLocation.lat + toLocation.lat) / 2 : 
      fromLocation?.lat || toLocation?.lat || 28.6139;
      
    const centerLng = fromLocation && toLocation ? 
      (fromLocation.lng + toLocation.lng) / 2 : 
      fromLocation?.lng || toLocation?.lng || 77.2090;

    return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
      <style>
        html, body, #map { 
          height: 100%; 
          margin: 0; 
          padding: 0; 
          overflow: hidden;
        }
        .leaflet-control-attribution { display: none !important; }
        .leaflet-bottom.leaflet-right { display: none !important; }
        
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
        }
      </style>
    </head>
    <body>
      <div id="map"></div>
      <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
      <script>
        const map = L.map('map').setView([${centerLat}, ${centerLng}], 12);
        
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: ''
        }).addTo(map);
        
        map.attributionControl.remove();

        // Custom icons
        const fromIcon = L.divIcon({
          html: '<div style="background-color: #10B981; color: white; border-radius: 50%; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; font-size: 14px; font-weight: bold; box-shadow: 0 2px 8px rgba(0,0,0,0.3);">FROM</div>',
          iconSize: [32, 32],
          className: 'custom-div-icon'
        });

        const toIcon = L.divIcon({
          html: '<div style="background-color: #EF4444; color: white; border-radius: 50%; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; font-size: 14px; font-weight: bold; box-shadow: 0 2px 8px rgba(0,0,0,0.3);">TO</div>',
          iconSize: [32, 32],
          className: 'custom-div-icon'
        });

        const hospitalIcon = L.divIcon({
          html: '<div style="background-color: #EF4444; color: white; border-radius: 50%; width: 28px; height: 28px; display: flex; align-items: center; justify-content: center; font-size: 14px;">🏥</div>',
          iconSize: [28, 28],
          className: 'custom-div-icon'
        });

        const hotelIcon = L.divIcon({
          html: '<div style="background-color: #3B82F6; color: white; border-radius: 50%; width: 28px; height: 28px; display: flex; align-items: center; justify-content: center; font-size: 14px;">🏨</div>',
          iconSize: [28, 28],
          className: 'custom-div-icon'
        });

        // Add from/to markers
        ${fromLocation ? `
        L.marker([${fromLocation.lat}, ${fromLocation.lng}], { icon: fromIcon })
          .addTo(map)
          .bindPopup('<b>FROM</b><br/>${fromLocation.name}');
        ` : ''}

        ${toLocation ? `
        L.marker([${toLocation.lat}, ${toLocation.lng}], { icon: toIcon })
          .addTo(map)
          .bindPopup('<b>TO</b><br/>${toLocation.name}');
        ` : ''}

        // Draw route line if both locations exist
        ${fromLocation && toLocation ? `
        const routeLine = L.polyline([
          [${fromLocation.lat}, ${fromLocation.lng}],
          [${toLocation.lat}, ${toLocation.lng}]
        ], {
          color: '#6B6BFF',
          weight: 4,
          opacity: 0.8,
          dashArray: '10, 5'
        }).addTo(map);
        ` : ''}

        // Function to add facilities
        window.addFacilities = function(facilitiesData) {
          facilitiesData.forEach(function(facility) {
            const icon = (facility.type === 'hospital' || facility.type === 'clinic') ? hospitalIcon : hotelIcon;
            
            L.marker([facility.lat, facility.lng], { icon })
              .addTo(map)
              .bindPopup('<b>' + facility.name + '</b><br/>' + facility.type.charAt(0).toUpperCase() + facility.type.slice(1));
          });
        };

        // Fit map to show all markers
        ${fromLocation && toLocation ? `
        const group = new L.featureGroup();
        group.addLayer(L.marker([${fromLocation.lat}, ${fromLocation.lng}]));
        group.addLayer(L.marker([${toLocation.lat}, ${toLocation.lng}]));
        map.fitBounds(group.getBounds().pad(0.2));
        ` : ''}

        // Notify React Native that map is ready
        if (window.ReactNativeWebView) {
          window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'map-ready' }));
        }
      </script>
    </body>
    </html>
    `;
  };

  const handleWebViewMessage = (event: any) => {
    try {
      const message = JSON.parse(event.nativeEvent.data);
      if (message.type === 'map-ready') {
        console.log('Trip map is ready!');
        setWebViewLoaded(true);
        
        // Inject facilities after map is ready
        if (facilities.length > 0) {
          setTimeout(() => {
            webViewRef.current?.injectJavaScript(`
              if (window.addFacilities) {
                window.addFacilities(${JSON.stringify(facilities)});
              }
            `);
          }, 1000);
        }
      }
    } catch (error) {
      console.error('Error handling WebView message:', error);
    }
  };

  useEffect(() => {
    geocodeLocations();
  }, []);

  useEffect(() => {
    if (webViewLoaded && facilities.length > 0) {
      setTimeout(() => {
        webViewRef.current?.injectJavaScript(`
          if (window.addFacilities) {
            window.addFacilities(${JSON.stringify(facilities)});
          }
        `);
      }, 500);
    }
  }, [facilities, webViewLoaded]);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#6B6BFF" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Trip Route</Text>
          {params.date && (
            <Text style={styles.headerSubtitle}>{params.date}</Text>
          )}
        </View>
      </View>

      {/* Route Info */}
      <View style={styles.routeInfo}>
        <View style={styles.locationRow}>
          <View style={[styles.locationDot, { backgroundColor: '#10B981' }]} />
          <Text style={styles.locationText} numberOfLines={2}>
            {params.fromAddress}
          </Text>
        </View>
        <View style={styles.routeLine} />
        <View style={styles.locationRow}>
          <View style={[styles.locationDot, { backgroundColor: '#EF4444' }]} />
          <Text style={styles.locationText} numberOfLines={2}>
            {params.toAddress}
          </Text>
        </View>
      </View>

      {/* Map Container */}
      <View style={styles.mapContainer}>
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#6B6BFF" />
            <Text style={styles.loadingText}>Loading trip map...</Text>
          </View>
        ) : (
          <WebView
            ref={webViewRef}
            source={{ html: generateHTML() }}
            style={styles.webview}
            onMessage={handleWebViewMessage}
            javaScriptEnabled={true}
            domStorageEnabled={true}
          />
        )}

        {/* Legend - Bottom overlay */}
        <View style={styles.legend}>
          <View style={styles.legendHeader}>
            <Text style={styles.legendTitle}>Map Legend</Text>
            <Text style={styles.facilityCount}>
              {facilities.length} facilities found
            </Text>
          </View>
          
          <View style={styles.legendGrid}>
            <View style={styles.legendColumn}>
              <View style={styles.legendItem}>
                <View style={[styles.locationMarker, { backgroundColor: '#10B981' }]}>
                  <Text style={styles.markerText}>FROM</Text>
                </View>
                <Text style={styles.legendLabel}>Start Point</Text>
              </View>
              
              <View style={styles.legendItem}>
                <View style={styles.facilityIcon}>
                  <Text style={styles.iconEmoji}>🏥</Text>
                </View>
                <Text style={styles.legendLabel}>
                  Hospitals ({facilities.filter(f => f.type === 'hospital' || f.type === 'clinic').length})
                </Text>
              </View>
            </View>
            
            <View style={styles.legendColumn}>
              <View style={styles.legendItem}>
                <View style={[styles.locationMarker, { backgroundColor: '#EF4444' }]}>
                  <Text style={styles.markerText}>TO</Text>
                </View>
                <Text style={styles.legendLabel}>Destination</Text>
              </View>
              
              <View style={styles.legendItem}>
                <View style={styles.facilityIcon}>
                  <Text style={styles.iconEmoji}>🏨</Text>
                </View>
                <Text style={styles.legendLabel}>
                  Hotels ({facilities.filter(f => f.type === 'hotel').length})
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Loading overlay for facilities */}
        {isLoading && (
          <View style={styles.facilitiesLoading}>
            <Text style={styles.facilitiesLoadingText}>
              Loading nearby facilities...
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  backButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#f8f9fa',
  },
  headerContent: {
    marginLeft: 16,
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 2,
  },
  routeInfo: {
    backgroundColor: 'white',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  locationText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1f2937',
    flex: 1,
  },
  routeLine: {
    width: 2,
    height: 20,
    backgroundColor: '#6B6BFF',
    marginLeft: 5,
    marginVertical: 8,
  },
  mapContainer: {
    flex: 1,
    position: 'relative',
  },
  webview: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6B6BFF',
    fontWeight: '500',
  },
  legend: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.98)',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  legendHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  legendTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  facilityCount: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
  legendGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
  },
  legendColumn: {
    flex: 1,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  locationMarker: {
    width: 32,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  markerText: {
    fontSize: 8,
    fontWeight: 'bold',
    color: 'white',
  },
  facilityIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  iconEmoji: {
    fontSize: 16,
  },
  legendLabel: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
    flex: 1,
  },
  facilitiesLoading: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  facilitiesLoadingText: {
    color: 'white',
    fontSize: 12,
  },
});