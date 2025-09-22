declare module 'react-native-maps' {
  import * as React from 'react'
  import { ViewProps } from 'react'
  export const PROVIDER_GOOGLE: string
  export interface Region { latitude: number; longitude: number; latitudeDelta: number; longitudeDelta: number }
  export default class MapView extends React.Component<ViewProps & { region?: Region; style?: any }> {}
  export class Marker extends React.Component<any> {}
  export class Polyline extends React.Component<any> {}
}

declare module 'axios' {
  const axios: any
  export default axios
  export const isCancel: (v: any) => boolean
}
