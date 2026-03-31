'use client';

import { ContainerResult, ContainerType, Lang, PalletResult } from '@/lib/lite/types';
import { CONTAINER_TYPES } from '@/lib/lite/containerTypes';
import { Plus, Minus, Trash2 } from 'lucide-react';

interface StatsPanelProps {
  palletResult: PalletResult | null;
  palletResults: PalletResult[];
  containerResult: ContainerResult | null;
  selectedContainerType: ContainerType;
  onContainerTypeChange: (ct: ContainerType) => void;
  onGenerateContainer: () => void;
  onDuplicatePallet: (id: string) => void;
  onRemovePallet: (id: string) => void;
  onUpdateDuplicateCount: (id: string, count: number) => void;
  lang: Lang;
}

export default function StatsPanel({
  palletResult,
  palletResults,
  containerResult,
  selectedContainerType,
  onContainerTypeChange,
  onGenerateContainer,
  onDuplicatePallet,
  onRemovePallet,
  onUpdateDuplicateCount,
  lang,
}: StatsPanelProps) {
  const t = (tr: string, en: string) => (lang === 'tr' ? tr : en);

  return (
    <div className="w-80 flex flex-col h-full bg-gray-50 dark:bg-gray-900 border-l border-gray-200 dark:border-gray-800 p-4 gap-4 overflow-hidden">
      {/* Pallet Stats */}
      {palletResult && (
        <div className="flex-shrink-0">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
            {t('Palet İstatistikleri', 'Pallet Stats')}
          </h3>
          <div className="space-y-3 bg-white dark:bg-gray-800 rounded-xl p-3 border border-gray-200 dark:border-gray-700">
            {/* Volume Fill */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-gray-600 dark:text-gray-400">
                  {t('Hacim Doluluk', 'Volume Fill')}
                </span>
                <span className="text-sm font-semibold text-gray-900 dark:text-white">
                  {palletResult.fillPercentVolume.toFixed(1)}%
                </span>
              </div>
              <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-emerald-400 to-emerald-600"
                  style={{ width: `${Math.min(100, palletResult.fillPercentVolume)}%` }}
                />
              </div>
            </div>

            {/* Weight Fill */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-gray-600 dark:text-gray-400">
                  {t('Ağırlık Doluluk', 'Weight Fill')}
                </span>
                <span className="text-sm font-semibold text-gray-900 dark:text-white">
                  {palletResult.fillPercentWeight.toFixed(1)}%
                </span>
              </div>
              <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-400 to-blue-600"
                  style={{ width: `${Math.min(100, palletResult.fillPercentWeight)}%` }}
                />
              </div>
            </div>

            {/* Remaining Capacity */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-gray-50 dark:bg-gray-700 rounded p-2">
                <div className="text-gray-600 dark:text-gray-400">{t('Kalan Alan', 'Remaining Area')}</div>
                <div className="font-semibold text-gray-900 dark:text-white">
                  {(palletResult.remainingVolume / 1000).toFixed(1)} m³
                </div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 rounded p-2">
                <div className="text-gray-600 dark:text-gray-400">{t('Kalan Ağırlık', 'Remaining Weight')}</div>
                <div className="font-semibold text-gray-900 dark:text-white">
                  {palletResult.remainingWeight.toFixed(0)} kg
                </div>
              </div>
            </div>

            {/* Box Count & Layers */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-gray-50 dark:bg-gray-700 rounded p-2">
                <div className="text-gray-600 dark:text-gray-400">{t('Yerleştirilen Koli', 'Placed Boxes')}</div>
                <div className="font-semibold text-gray-900 dark:text-white">
                  {palletResult.boxes.length} {t('adet', 'pcs')}
                </div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 rounded p-2">
                <div className="text-gray-600 dark:text-gray-400">{t('Kat Sayısı', 'Layers')}</div>
                <div className="font-semibold text-gray-900 dark:text-white">
                  {palletResult.layers}
                </div>
              </div>
            </div>

            {/* More Boxes Info */}
            {palletResult.sameBoxFitCount > 0 && (
              <div className="bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800 rounded p-2">
                <p className="text-xs text-amber-800 dark:text-amber-200">
                  {t('Bu palete ', 'This pallet can fit ')}{palletResult.sameBoxFitCount}{t(' adet daha aynı koli sığar', ' more same boxes')}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Container Section */}
      <div className="flex-shrink-0">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
          {t('Konteyner', 'Container')}
        </h3>

        {/* Container Type Selector */}
        <div className="mb-3 space-y-2">
          <div className="text-xs text-gray-600 dark:text-gray-400 font-medium">
            {t('Konteyner Tipi', 'Container Type')}
          </div>
          <div className="grid grid-cols-2 gap-2">
            {CONTAINER_TYPES.map((ctype) => (
              <button
                key={ctype.id}
                onClick={() => onContainerTypeChange(ctype)}
                className={`
                  px-3 py-2 text-xs font-medium rounded-lg transition-all
                  ${selectedContainerType.id === ctype.id
                    ? 'bg-teal-600 text-white'
                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-700 hover:border-teal-400'}
                `}
              >
                {ctype.name}
              </button>
            ))}
          </div>
        </div>

        {/* Load Button */}
        <button
          onClick={onGenerateContainer}
          disabled={palletResults.length === 0}
          className={`
            w-full px-4 py-2 rounded-lg font-medium text-sm transition-all mb-3
            ${palletResults.length > 0
              ? 'bg-teal-600 hover:bg-teal-700 text-white'
              : 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'}
          `}
        >
          {t('Konteynere Yükle', 'Load Container')}
        </button>

        {/* Container Stats */}
        {containerResult && (
          <div className="space-y-3 bg-white dark:bg-gray-800 rounded-xl p-3 border border-gray-200 dark:border-gray-700">
            {/* Volume Fill */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-gray-600 dark:text-gray-400">
                  {t('Hacim Doluluk', 'Volume Fill')}
                </span>
                <span className="text-sm font-semibold text-gray-900 dark:text-white">
                  {containerResult.fillPercentVolume.toFixed(1)}%
                </span>
              </div>
              <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-teal-400 to-teal-600"
                  style={{ width: `${Math.min(100, containerResult.fillPercentVolume)}%` }}
                />
              </div>
            </div>

            {/* Weight Fill */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-gray-600 dark:text-gray-400">
                  {t('Ağırlık Doluluk', 'Weight Fill')}
                </span>
                <span className="text-sm font-semibold text-gray-900 dark:text-white">
                  {containerResult.fillPercentWeight.toFixed(1)}%
                </span>
              </div>
              <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-cyan-400 to-cyan-600"
                  style={{ width: `${Math.min(100, containerResult.fillPercentWeight)}%` }}
                />
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-gray-50 dark:bg-gray-700 rounded p-2">
                <div className="text-gray-600 dark:text-gray-400">{t('Toplam Palet', 'Total Pallets')}</div>
                <div className="font-semibold text-gray-900 dark:text-white">
                  {containerResult.totalPallets}
                </div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 rounded p-2">
                <div className="text-gray-600 dark:text-gray-400">{t('Kalan Hacim', 'Remaining Volume')}</div>
                <div className="font-semibold text-gray-900 dark:text-white">
                  {containerResult.remainingVolume.toFixed(1)} m³
                </div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 rounded p-2">
                <div className="text-gray-600 dark:text-gray-400">{t('Kalan Ağırlık', 'Remaining Weight')}</div>
                <div className="font-semibold text-gray-900 dark:text-white">
                  {(containerResult.remainingWeight / 1000).toFixed(1)} ton
                </div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 rounded p-2">
                <div className="text-gray-600 dark:text-gray-400">{t('Daha Palet', 'More Pallets')}</div>
                <div className="font-semibold text-gray-900 dark:text-white">
                  {containerResult.morePalletsFit}
                </div>
              </div>
            </div>

            {/* Info Box */}
            {containerResult.morePalletsFit > 0 && (
              <div className="bg-teal-50 dark:bg-teal-900/30 border border-teal-200 dark:border-teal-800 rounded p-2">
                <p className="text-xs text-teal-800 dark:text-teal-200">
                  {containerResult.morePalletsFit} {t('adet daha palet sığar', 'more pallets can fit')}
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Pallet List */}
      {palletResults.length > 0 && (
        <div className="flex-1 overflow-auto min-h-0">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 sticky top-0 bg-gray-50 dark:bg-gray-900 pt-2">
            {t('Palet Listesi', 'Pallet List')}
          </h3>
          <div className="space-y-2 pr-2">
            {palletResults.map((pallet) => (
              <div
                key={pallet.id}
                className="bg-white dark:bg-gray-800 rounded-xl p-3 border border-gray-200 dark:border-gray-700"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="font-medium text-sm text-gray-900 dark:text-white">
                      {pallet.palletType.name}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 space-y-0.5">
                      <div>{pallet.boxes.length} {t('koli', 'boxes')}</div>
                      <div>{pallet.fillPercentVolume.toFixed(0)}% {t('doluluk', 'fill')}</div>
                      <div>{pallet.totalWeight.toFixed(0)} kg</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onRemovePallet(pallet.id)}
                      className="p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded transition-colors"
                      title={t('Sil', 'Delete')}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                {/* Duplicate Count Control */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onUpdateDuplicateCount(pallet.id, pallet.duplicateCount - 1)}
                    disabled={pallet.duplicateCount <= 1}
                    className="p-1 text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed rounded transition-colors"
                  >
                    <Minus size={14} />
                  </button>
                  <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 min-w-6 text-center">
                    ×{pallet.duplicateCount}
                  </span>
                  <button
                    onClick={() => onDuplicatePallet(pallet.id)}
                    className="p-1 text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
                  >
                    <Plus size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
