'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { Location } from '@/features/locations/types/location';

interface LocationCardProps {
  location: Location;
  onSelectLocation: (location: Location) => void;
  isSelected: boolean;
  onEdit: (location: Location) => void;
  onDelete: (location: Location) => void;
}

export function LocationCard({
  location,
  onSelectLocation,
  isSelected,
  onEdit,
  onDelete,
}: LocationCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className={`relative overflow-hidden rounded-lg border bg-white dark:bg-zinc-900 shadow-md transition-all cursor-pointer ${
        isSelected
          ? 'border-blue-500 ring-2 ring-blue-500'
          : 'border-zinc-200 dark:border-zinc-800 hover:border-blue-300'
      }`}
      onClick={() => onSelectLocation(location)}
    >
      <div className="relative h-48 w-full">
        <Image
          src={location.imagem}
          alt={location.nome}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
      </div>

      <div className="p-4">
        <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50 mb-2">
          {location.nome}
        </h3>
        <p className="text-sm text-zinc-600 dark:text-zinc-400 line-clamp-2">
          {location.descricao}
        </p>

        <div className="mt-3 flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-500">
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
              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
          <span>
            {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
          </span>
        </div>
      </div>

      <div className="absolute bottom-3 right-3 flex gap-2">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onEdit(location);
          }}
          className="bg-white dark:bg-zinc-800 text-blue-600 dark:text-blue-400 rounded-full p-2 shadow-md hover:shadow-lg transition-all hover:scale-110"
          title="Editar local"
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
              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
            />
          </svg>
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(location);
          }}
          className="bg-white dark:bg-zinc-800 text-red-600 dark:text-red-400 rounded-full p-2 shadow-md hover:shadow-lg transition-all hover:scale-110"
          title="Excluir local"
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
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
            />
          </svg>
        </button>
      </div>

      {isSelected && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute top-3 right-3 bg-blue-500 text-white rounded-full p-2"
        >
          <svg
            className="w-5 h-5"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
              clipRule="evenodd"
            />
          </svg>
        </motion.div>
      )}
    </motion.div>
  );
}
