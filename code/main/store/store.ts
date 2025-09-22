import { configureStore } from '@reduxjs/toolkit'
import permissionsReducer from './slices/permissionsSlice'

const store = configureStore({
  reducer: {
    permissions: permissionsReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types for location and permission data
        ignoredActions: [
          'permissions/setUserLocation',
          'permissions/requestAll/fulfilled',
          'permissions/getCurrentLocation/fulfilled'
        ],
        // Ignore these field paths in all actions
        ignoredActionsPaths: ['payload.location', 'payload.permissions'],
        // Ignore these paths in the state
        ignoredPaths: ['permissions.currentLocation', 'permissions.permissions'],
      },
    }),
})

export default store

// Export types for TypeScript support
export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch