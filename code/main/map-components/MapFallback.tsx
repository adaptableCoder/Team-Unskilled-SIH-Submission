import { View, StyleSheet } from 'react-native'
import { WebView } from 'react-native-webview'

export default function MapFallback({ lat, lon, mapStyle = 'osm' }: { lat: number; lon: number; mapStyle?: 'osm' | 'satellite' }) {

  // choose tile URL based on requested style
  const tileUrl = mapStyle === 'satellite'
    ? 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
    : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'

  const html = `
  <!DOCTYPE html>
  <html>
  <head>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
    <style>
      html,body,#map{height:100%;margin:0;padding:0}
      /* move default Leaflet zoom controls slightly down */
      .leaflet-control-zoom {
        top: 12px !important;
      }
      /* make controls a bit more visible on mobile */
      .leaflet-control-zoom a { padding: 6px 8px; font-size: 18px; }
    </style>
  </head>
  <body>
    <div id="map"></div>
    <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
    <script>
      try {
        const map = L.map('map').setView([${lat}, ${lon}], 13);
        L.tileLayer('${tileUrl}', {
          maxZoom: 19,
        }).addTo(map);
        L.marker([${lat}, ${lon}]).addTo(map).bindPopup('You').openPopup();

        // notify React Native that the map is ready
        if (window && window.ReactNativeWebView && window.ReactNativeWebView.postMessage) {
          window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'map-ready' }));
        }

        // send interaction events
        map.on('click zoomend moveend', function(e) {
          if (window && window.ReactNativeWebView && window.ReactNativeWebView.postMessage) {
            window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'map-interaction', event: e.type }));
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

  return (
    <View style={styles.container}>
      <WebView originWhitelist={["*"]} source={{ html }} style={styles.webview} />
    </View>
  )
}

const styles = StyleSheet.create({
  // make the map container a bit taller by giving it an explicit height
  container: { height: 360 },
  webview: { flex: 1, backgroundColor: 'transparent' },
  // status badge removed
})
