'use client';

import { useState } from 'react';
import { Location, CreateLocationDto } from '@/features/locations/types/location';
import { useLocations } from '@/features/locations/hooks/useLocations';
import { useGeolocation } from '@/features/locations/hooks/useGeolocation';
import { createLocation, updateLocation, deleteLocation } from '@/features/locations/services/locationService';
import { LocationCard } from './LocationCard';
import { LocationMap } from './Map';
import { RouteButton } from './RouteButton';
import { LocationFormModal } from './LocationFormModal';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

export function LocationsView() {
  const { locations, loading, refetching, error, refetch } = useLocations();
  const {
    latitude,
    longitude,
    error: geoError,
    loading: geoLoading,
    requestLocation,
  } = useGeolocation();

  const [selectedLocation, setSelectedLocation] = useState<Location | null>(
    null
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [editingLocation, setEditingLocation] = useState<Location | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<Location | null>(null);

  const userLocation: [number, number] | null =
    latitude !== null && longitude !== null
      ? [latitude, longitude]
      : null;

  const handleStartRoute = () => {
    if (!selectedLocation) return;
    toast.info('Obtendo sua localização...', {
      description: 'Aguarde enquanto calculamos a melhor rota.',
    });
    requestLocation();
  };

  const handleCancelRoute = () => {
    setSelectedLocation(null);
    toast.info('Rota cancelada', {
      description: 'Selecione outro local para traçar uma nova rota.',
    });
  };

  const handleCreateNew = () => {
    setModalMode('create');
    setEditingLocation(null);
    setIsModalOpen(true);
  };

  const handleEdit = (location: Location) => {
    setModalMode('edit');
    setEditingLocation(location);
    setIsModalOpen(true);
  };

  const handleDelete = (location: Location) => {
    setDeleteConfirm(location);
  };

  const confirmDelete = async () => {
    if (!deleteConfirm) return;

    const locationName = deleteConfirm.nome;
    const locationId = deleteConfirm.id;

    setDeleteConfirm(null);

    toast.promise(
      deleteLocation(locationId).then(() => {
        if (selectedLocation?.id === locationId) {
          setSelectedLocation(null);
        }
        refetch();
      }),
      {
        loading: 'Excluindo local...',
        success: `${locationName} foi removido com sucesso!`,
        error: (err) => err instanceof Error ? err.message : 'Erro ao excluir local',
      }
    );
  };

  const handleSubmit = async (data: CreateLocationDto) => {
    const isCreate = modalMode === 'create';
    const operation = isCreate
      ? createLocation(data)
      : updateLocation(editingLocation!.id, data);

    toast.promise(
      operation.then(() => {
        setIsModalOpen(false);
        setEditingLocation(null);
        refetch();
      }),
      {
        loading: isCreate ? 'Criando local...' : 'Atualizando local...',
        success: isCreate
          ? `${data.nome} foi criado com sucesso!`
          : `${data.nome} foi atualizado com sucesso!`,
        error: (err) => err instanceof Error ? err.message : 'Erro ao salvar local',
      }
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
          <p className="text-zinc-600 dark:text-zinc-400">
            Carregando locais...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center max-w-md">
          <div className="text-red-500 mb-4">
            <svg
              className="w-16 h-16 mx-auto"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50 mb-2">
            Erro ao carregar locais
          </h2>
          <p className="text-zinc-600 dark:text-zinc-400">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <header className="bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <svg
                className="w-8 h-8 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              <div>
                <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
                  Explorador de Locais
                </h1>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  Selecione um local e trace uma rota
                </p>
              </div>
            </div>
            <button
              onClick={handleCreateNew}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Novo Local
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white dark:bg-zinc-900 rounded-lg p-4 border border-zinc-200 dark:border-zinc-800">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                  Locais Disponíveis ({locations.length})
                </h2>
                {refetching && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400"
                  >
                    <svg
                      className="animate-spin h-4 w-4"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    <span>Atualizando...</span>
                  </motion.div>
                )}
              </div>

              {locations.length === 0 ? (
                <div className="text-center py-8">
                  <svg
                    className="w-12 h-12 mx-auto text-zinc-400 mb-3"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <p className="text-zinc-600 dark:text-zinc-400">
                    Nenhum local cadastrado
                  </p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[calc(100vh-300px)] overflow-y-auto pr-2">
                  {locations.map((location, index) => (
                    <motion.div
                      key={location.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <LocationCard
                        location={location}
                        onSelectLocation={setSelectedLocation}
                        isSelected={selectedLocation?.id === location.id}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                      />
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {selectedLocation && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-zinc-900 rounded-lg p-4 border border-zinc-200 dark:border-zinc-800"
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-md font-semibold text-zinc-900 dark:text-zinc-50">
                    Local Selecionado
                  </h3>
                  <button
                    onClick={handleCancelRoute}
                    className="text-xs text-zinc-500 hover:text-red-600 dark:text-zinc-400 dark:hover:text-red-400 transition-colors"
                    title="Cancelar rota"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
                <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4">
                  {selectedLocation.nome}
                </p>

                <RouteButton
                  onClick={handleStartRoute}
                  loading={geoLoading}
                  disabled={!selectedLocation}
                />

                {geoError && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="mt-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg"
                  >
                    <p className="text-sm text-red-600 dark:text-red-400">
                      {geoError}
                    </p>
                  </motion.div>
                )}

                {userLocation && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="mt-3 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg"
                  >
                    <p className="text-sm text-green-600 dark:text-green-400 flex items-center gap-2">
                      <svg
                        className="w-4 h-4"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                      Localização obtida com sucesso
                    </p>
                  </motion.div>
                )}
              </motion.div>
            )}
          </div>

          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-zinc-900 rounded-lg p-4 border border-zinc-200 dark:border-zinc-800 h-[calc(100vh-200px)]">
              <LocationMap
                locations={locations}
                selectedLocation={selectedLocation}
                userLocation={userLocation}
              />
            </div>
          </div>
        </div>
      </main>

      <LocationFormModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingLocation(null);
        }}
        onSubmit={handleSubmit}
        location={editingLocation}
        mode={modalMode}
      />

      {deleteConfirm && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setDeleteConfirm(null)}
            className="fixed inset-0 bg-black/50 z-40"
          />
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-zinc-900 rounded-lg shadow-xl w-full max-w-md p-6"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="shrink-0 w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
                  <svg
                    className="w-6 h-6 text-red-600 dark:text-red-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                    Excluir Local
                  </h3>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">
                    Esta ação não pode ser desfeita
                  </p>
                </div>
              </div>

              <p className="text-sm text-zinc-700 dark:text-zinc-300 mb-6">
                Tem certeza que deseja excluir <strong>{deleteConfirm.nome}</strong>?
              </p>

              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="flex-1 px-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={confirmDelete}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Excluir
                </button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </div>
  );
}
