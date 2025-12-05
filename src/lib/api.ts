import { ApiError } from '@/features/locations/types/location';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export class ApiClientError extends Error {
  constructor(
    public statusCode: number,
    public error: string,
    message: string | string[]
  ) {
    super(Array.isArray(message) ? message.join(', ') : message);
    this.name = 'ApiClientError';
  }
}

export async function apiClient<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const url = `${API_URL}${endpoint}`;

  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });

    if (response.status === 204) {
      return undefined as T;
    }

    const data = await response.json();

    if (!response.ok) {
      const error = data as ApiError;
      throw new ApiClientError(
        error.statusCode,
        error.error,
        error.message
      );
    }

    return data as T;
  } catch (error) {
    if (error instanceof ApiClientError) {
      throw error;
    }

    throw new Error(
      `Erro ao conectar com a API: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
    );
  }
}
