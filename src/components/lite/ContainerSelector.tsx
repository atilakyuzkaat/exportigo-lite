'use client';

import { useLiteStore } from '@/lib/lite/store';
import { t } from '@/lib/lite/i18n';
import { CONTAINER_TYPES } from '@/lib/lite/containerTypes';

export default function ContainerSelector() {
  const { selectedContainerType, setSelectedContainerType, lang } = useLiteStore();

  return (
    <div className="space-y-3">
      <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
        {t('container.select', lang)}
      </h2>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {CONTAINER_TYPES.map((ct) => (
          <button
            key={ct.id}
            onClick={() => setSelectedContainerType(ct)}
            className={`p-4 rounded-xl border-2 transition-all text-left ${
              selectedContainerType.id === ct.id
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-md'
                : 'border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600'
            }`}
          >
            <div className="font-medium text-sm text-gray-800 dark:text-gray-200">{ct.name}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {ct.volume} m³
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              Max {(ct.maxWeight / 1000).toFixed(1)} ton
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
