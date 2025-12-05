export interface Location {
  id: string;
  nome: string;
  descricao: string;
  latitude: number;
  longitude: number;
  imagem: string;
}

export interface CreateLocationDto {
  nome: string;
  descricao: string;
  latitude: number;
  longitude: number;
  imagem: string;
}

export interface UpdateLocationDto {
  nome?: string;
  descricao?: string;
  latitude?: number;
  longitude?: number;
  imagem?: string;
}

export interface ApiError {
  statusCode: number;
  message: string | string[];
  error: string;
}

export interface RouteCoordinates {
  latitude: number;
  longitude: number;
}

export interface MapboxRoute {
  distance: number; // meters
  duration: number; // seconds
  geometry: {
    coordinates: [number, number][]; // [lng, lat][]
  };
}

export interface MapboxDirectionsResponse {
  routes: MapboxRoute[];
  code: string;
}
