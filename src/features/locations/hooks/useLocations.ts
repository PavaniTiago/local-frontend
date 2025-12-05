'use client';

import { useState, useEffect } from 'react';
import { Location } from '../types/location';
import { getLocations } from '../services/locationService';

interface UseLocationsState {
  locations: Location[];
  loading: boolean;
  refetching: boolean;
  error: string | null;
}

export function useLocations() {
  const [state, setState] = useState<UseLocationsState>({
    locations: [],
    loading: true,
    refetching: false,
    error: null,
  });

  const fetchLocations = async (isRefetch = false) => {
    if (isRefetch) {
      setState((prev) => ({ ...prev, refetching: true, error: null }));
    } else {
      setState((prev) => ({ ...prev, loading: true, error: null }));
    }

    try {
      const data = await getLocations();
      setState({
        locations: data,
        loading: false,
        refetching: false,
        error: null,
      });
    } catch (error) {
      setState({
        locations: [],
        loading: false,
        refetching: false,
        error:
          error instanceof Error
            ? error.message
            : 'Erro ao carregar locais',
      });
    }
  };

  useEffect(() => {
    fetchLocations(false);
  }, []);

  return {
    ...state,
    refetch: () => fetchLocations(true),
  };
}
