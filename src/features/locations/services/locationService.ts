import { apiClient } from '@/lib/api';
import {
  Location,
  CreateLocationDto,
  UpdateLocationDto,
} from '../types/location';

export async function getLocations(): Promise<Location[]> {
  return apiClient<Location[]>('/locais');
}

export async function getLocationById(id: string): Promise<Location> {
  return apiClient<Location>(`/locais/${id}`);
}

export async function createLocation(
  data: CreateLocationDto
): Promise<Location> {
  return apiClient<Location>('/locais', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateLocation(
  id: string,
  data: UpdateLocationDto
): Promise<Location> {
  return apiClient<Location>(`/locais/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export async function deleteLocation(id: string): Promise<void> {
  return apiClient<void>(`/locais/${id}`, {
    method: 'DELETE',
  });
}
