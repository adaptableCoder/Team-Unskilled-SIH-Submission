import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import * as Location from 'expo-location'
import { Camera } from 'expo-camera'
import * as MediaLibrary from 'expo-media-library'
import { requestRecordingPermissionsAsync } from 'expo-audio'
import * as Contacts from 'expo-contacts'

// Define permission types
export type PermissionType = 'location' | 'camera' | 'mediaLibrary' | 'microphone' | 'contacts'

export interface PermissionStatus {
  granted: boolean
  canAskAgain: boolean
  expires: string | number
  status: string
}

export interface PermissionsState {
  isLoading: boolean
  showPermissionModal: boolean
  currentLocation: Location.LocationObject | null
  address: string
  error: string | null
  permissions: {
    location: PermissionStatus | null
    camera: PermissionStatus | null
    mediaLibrary: PermissionStatus | null
    microphone: PermissionStatus | null
    contacts: PermissionStatus | null
  }
  allPermissionsRequested: boolean
}

// Define the initial state
const initialState: PermissionsState = {
  isLoading: false,
  showPermissionModal: true,
  currentLocation: null,
  address: '', // Empty default location
  error: null,
  permissions: {
    location: null,
    camera: null,
    mediaLibrary: null,
    microphone: null,
    contacts: null,
  },
  allPermissionsRequested: false
}

// Async thunk for requesting all permissions at once
export const requestAllPermissions = createAsyncThunk(
  'permissions/requestAll',
  async (_, { rejectWithValue }) => {
    try {
      // Request permissions one by one with better error handling
      console.log('Starting permission requests...')
      
      // Location permission
      const locationResult = await Location.requestForegroundPermissionsAsync()
      console.log('Location permission result:', locationResult)
      
      // Camera permission
      const cameraResult = await Camera.requestCameraPermissionsAsync()
      console.log('Camera permission result:', cameraResult)
      
      // Microphone permission (using requestRecordingPermissionsAsync)
      const microphoneResult = await requestRecordingPermissionsAsync()
      console.log('Microphone permission result:', microphoneResult)
      
      // Contacts permission
      const contactsResult = await Contacts.requestPermissionsAsync()
      console.log('Contacts permission result:', contactsResult)

      const permissions = {
        location: {
          granted: locationResult.status === 'granted',
          canAskAgain: locationResult.canAskAgain,
          expires: locationResult.expires,
          status: locationResult.status
        },
        camera: {
          granted: cameraResult.status === 'granted',
          canAskAgain: cameraResult.canAskAgain,
          expires: cameraResult.expires,
          status: cameraResult.status
        },
        mediaLibrary: {
          granted: true, // Consider granted in Expo Go since it's not fully supported
          canAskAgain: false,
          expires: 'never',
          status: 'granted' // Mark as granted for Expo Go compatibility
        },
        microphone: {
          granted: microphoneResult.status === 'granted',
          canAskAgain: microphoneResult.canAskAgain,
          expires: microphoneResult.expires,
          status: microphoneResult.status
        },
        contacts: {
          granted: contactsResult.status === 'granted',
          canAskAgain: contactsResult.canAskAgain,
          expires: contactsResult.expires,
          status: contactsResult.status
        }
      }

      console.log('All permissions processed:', permissions)
      return { permissions }
    } catch (error) {
      console.error('Error requesting permissions:', error)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      return rejectWithValue(`Error requesting permissions: ${errorMessage}`)
    }
  }
)

// Async thunk for getting current location (after permission granted)
export const getCurrentLocation = createAsyncThunk(
  'permissions/getCurrentLocation',
  async (_, { rejectWithValue }) => {
    try {
      console.log('Getting current location...')
      
      // Check permission first
      const { status } = await Location.getForegroundPermissionsAsync()
      if (status !== 'granted') {
        console.log('Location permission not granted:', status)
        return rejectWithValue('Location permission not granted')
      }
      
      console.log('Location permission verified, getting position...')
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
        timeInterval: 10000, // 10 second max age
      })
      
      console.log('Location obtained:', location.coords)
      
      // Reverse geocoding to get address
      console.log('Reverse geocoding...')
      const reverseGeocode = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      })
      
      let cityName = 'Current Location'
      if (reverseGeocode.length > 0) {
        const address = reverseGeocode[0]
        cityName = address.city || address.district || address.region || 'Current Location'
        console.log('Address resolved to:', cityName)
      }
      
      return {
        location,
        address: cityName
      }
    } catch (error) {
      console.error('Location error:', error)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      return rejectWithValue(`Failed to get current location: ${errorMessage}`)
    }
  }
)

// Create the permissions slice
const permissionsSlice = createSlice({
  name: 'permissions',
  initialState,
  reducers: {
    // Action to hide the permission modal
    hidePermissionModal: (state) => {
      state.showPermissionModal = false
    },
    
    // Action to show the permission modal
    showPermissionModal: (state) => {
      state.showPermissionModal = true
    },
    
    // Action to set address manually
    setAddress: (state, action: PayloadAction<string>) => {
      state.address = action.payload
    },
    
    // Action to clear error
    clearError: (state) => {
      state.error = null
    },
    
    // Action to reset permissions state
    resetPermissionsState: (state) => {
      return { ...initialState, showPermissionModal: false }
    },
    
    // Action to set individual permission status
    setPermissionStatus: (state, action: PayloadAction<{ type: PermissionType; status: PermissionStatus }>) => {
      state.permissions[action.payload.type] = action.payload.status
    }
  },
  extraReducers: (builder) => {
    // Handle requestAllPermissions
    builder
      .addCase(requestAllPermissions.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(requestAllPermissions.fulfilled, (state, action) => {
        state.isLoading = false
        state.permissions = action.payload.permissions
        state.allPermissionsRequested = true
        state.error = null
        
        // If location permission granted, we can get location
        if (action.payload.permissions.location.granted) {
          // getCurrentLocation will be dispatched separately
        }
      })
      .addCase(requestAllPermissions.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
        state.allPermissionsRequested = true
        state.showPermissionModal = false
      })
    
    // Handle getCurrentLocation
    builder
      .addCase(getCurrentLocation.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(getCurrentLocation.fulfilled, (state, action) => {
        state.isLoading = false
        state.currentLocation = action.payload.location
        state.address = action.payload.address
        state.showPermissionModal = false
        state.error = null
      })
      .addCase(getCurrentLocation.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
  },
})

// Export actions
export const {
  hidePermissionModal,
  showPermissionModal,
  setAddress,
  clearError,
  resetPermissionsState,
  setPermissionStatus
} = permissionsSlice.actions

// Export the reducer
export default permissionsSlice.reducer

// Selector functions
export const selectPermissions = (state: { permissions: PermissionsState }) => state.permissions
export const selectAddress = (state: { permissions: PermissionsState }) => state.permissions.address
export const selectPermissionsLoading = (state: { permissions: PermissionsState }) => state.permissions.isLoading
export const selectShowPermissionModal = (state: { permissions: PermissionsState }) => state.permissions.showPermissionModal
export const selectPermissionsError = (state: { permissions: PermissionsState }) => state.permissions.error
export const selectLocationPermission = (state: { permissions: PermissionsState }) => state.permissions.permissions.location
export const selectCameraPermission = (state: { permissions: PermissionsState }) => state.permissions.permissions.camera
export const selectMediaLibraryPermission = (state: { permissions: PermissionsState }) => state.permissions.permissions.mediaLibrary
export const selectMicrophonePermission = (state: { permissions: PermissionsState }) => state.permissions.permissions.microphone
export const selectContactsPermission = (state: { permissions: PermissionsState }) => state.permissions.permissions.contacts