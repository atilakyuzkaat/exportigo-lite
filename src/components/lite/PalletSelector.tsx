'use client';

import { useLiteStore } from '@/lib/lite/store';
import { t } from '@/lib/lite/i18n';
import { PALLET_TYPES } from '@/lib/lite/palletTypes';
import { useState } from 'react';

export default function PalletSelector() {
  const { selectedPalletType, setSelectedPalletType, lang } = useLiteStore();
  const [customMode, setCustomMode] = useState(false);

  return (
    <div className="space-y-3">
      <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
        {t('pallet.select', lang)}
      </h2>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {PALLET_TYPES.filter(p => p.id !== 'custom').map((pt) => (
          <button
            key={pt.id}
            onClick={() => { setSelectedPalletType(pt); setCustomMode(false); }}
            className={`p-4 rounded-xl border-2 transition-all text-left ${
              selectedPalletType.id === pt.id && !customMode
                ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 shadow-md'
                : 'border-gray-200 dark:border-gray-700 hover:border-emerald-300 dark:hover:border-emerald-600'
            }`}
          >
            <div className="font-medium text-sm text-gray-800 dark:text-gray-200">{pt.name}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {pt.length} x {pt.width} mm
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              Max {pt.maxWeight} kg / {pt.maxHeight} cm
            </div>
          </button>
        ))}

        <button
          onClick={() => {
            setCustomMode(true);
            setSelectedPalletType({ ...PALLET_TYPES.find(p => p.id === 'custom')! });
          }}
          className={`p-4 rounded-xl border-2 transition-all text-left ${
            customMode
              ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 shadow-md'
              : 'border-gray-200 dark:border-gray-700 hover:border-emerald-300 dark:hover:border-emerald-600'
          }`}
        >
          <div className="font-medium text-sm text-gray-800 dark:text-gray-200">
            {lang === 'tr' ? 'Özel Boyut' : 'Custom Size'}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {t('pallet.customSize', lang)}
          </div>
        </button>
      </div>

      {customMode && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
          {[
            { label: `${lang === 'tr' ? 'Uzunluk' : 'Length'} (mm)`, key: 'length' as const },
            { label: `${lang === 'tr' ? 'Genişlik' : 'Width'} (mm)`, key: 'width' as const },
            { label: t('pallet.maxWeight', lang), key: 'maxWeight' as const },
            { label: t('pallet.maxHeight', lang), key: 'maxHeight' as const },
          ].map(({ label, key }) => (
            <div key={key}>
              <label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">{label}</label>
              <input
                type="number"
                value={selectedPalletType[key]}
                onChange={(e) =>
                  setSelectedPalletType({ ...selectedPalletType, [key]: Number(e.target.value) })
                }
                className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
