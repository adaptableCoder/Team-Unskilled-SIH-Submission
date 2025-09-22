export interface NearbyItem {
  id: string;
  name?: string;
  lat: number;
  lon: number;
  tags?: Record<string, any>;
}

export interface Position {
  coords: { latitude: number; longitude: number; accuracy?: number; speed?: number | null };
  timestamp: number;
}
