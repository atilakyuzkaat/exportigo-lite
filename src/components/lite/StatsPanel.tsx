'use client';

import { useState } from 'react';
import { ContainerResult, ContainerType, Lang, PalletResult } from '@/lib/lite/types';
import { CONTAINER_TYPES } from '@/lib/lite/containerTypes';
import { Plus, Minus, Trash2, ChevronDown, FileDown } from 'lucide-react';
import { useLiteStore } from '@/lib/lite/store';
import { exportPackingList } from '@/lib/lite/exportPdf';

interface StatsPanelProps {
  palletResult: PalletResult | null;
  palletResults: PalletResult[];
  selectedPalletIndex: number;
  onSelectPallet: (index: number) => void;
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
  selectedPalletIndex,
  onSelectPallet,
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
  const [palletStatsOpen, setPalletStatsOpen] = useState(true);
  const [containerOpen, setContainerOpen] = useState(true);
  const [palletListOpen, setPalletListOpen] = useState(true);

  return (
    <div className="w-full md:w-80 flex flex-col h-full bg-gray-50 dark:bg-gray-900 md:border-l border-gray-200 dark:border-gray-800 overflow-y-auto">
      {/* Pallet Stats - Accordion */}
      {palletResult && (
        <div className="border-b border-gray-200 dark:border-gray-800">
          <button
            onClick={() => setPalletStatsOpen(!palletStatsOpen)}
            className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
              {t('Palet İstatistikleri', 'Pallet Stats')}
            </h3>
            <ChevronDown size={16} className={`text-gray-500 transition-transform ${palletStatsOpen ? '' : '-rotate-90'}`} />
          </button>
          {palletStatsOpen && (
            <div className="px-4 pb-4 space-y-3">
              <div className="bg-white dark:bg-gray-800 rounded-xl p-3 border border-gray-200 dark:border-gray-700 space-y-3">
                {/* Volume Fill */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-gray-600 dark:text-gray-400">{t('Hacim Doluluk', 'Volume Fill')}</span>
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">{palletResult.fillPercentVolume.toFixed(1)}%</span>
                  </div>
                  <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-emerald-400 to-emerald-600" style={{ width: `${Math.min(100, palletResult.fillPercentVolume)}%` }} />
                  </div>
                </div>
                {/* Weight Fill */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-gray-600 dark:text-gray-400">{t('Ağırlık Doluluk', 'Weight Fill')}</span>
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">{palletResult.fillPercentWeight.toFixed(1)}%</span>
                  </div>
                  <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-blue-400 to-blue-600" style={{ width: `${Math.min(100, palletResult.fillPercentWeight)}%` }} />
                  </div>
                </div>
                {/* Remaining Capacity */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-gray-50 dark:bg-gray-700 rounded p-2">
                    <div className="text-gray-600 dark:text-gray-400">{t('Kalan Alan', 'Remaining Area')}</div>
                    <div className="font-semibold text-gray-900 dark:text-white">{(palletResult.remainingVolume / 1000000).toFixed(2)} m³</div>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700 rounded p-2">
                    <div className="text-gray-600 dark:text-gray-400">{t('Kalan Ağırlık', 'Remaining Weight')}</div>
                    <div className="font-semibold text-gray-900 dark:text-white">{palletResult.remainingWeight.toFixed(0)} kg</div>
                  </div>
                </div>
                {/* Box Count & Layers */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-gray-50 dark:bg-gray-700 rounded p-2">
                    <div className="text-gray-600 dark:text-gray-400">{t('Yerleştirilen Koli', 'Placed Boxes')}</div>
                    <div className="font-semibold text-gray-900 dark:text-white">{palletResult.boxes.length} {t('adet', 'pcs')}</div>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700 rounded p-2">
                    <div className="text-gray-600 dark:text-gray-400">{t('Kat Sayısı', 'Layers')}</div>
                    <div className="font-semibold text-gray-900 dark:text-white">{palletResult.layers}</div>
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
        </div>
      )}

      {/* Container Section - Accordion */}
      <div className="border-b border-gray-200 dark:border-gray-800">
        <button
          onClick={() => setContainerOpen(!containerOpen)}
          className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
            {t('Konteyner', 'Container')}
          </h3>
          <ChevronDown size={16} className={`text-gray-500 transition-transform ${containerOpen ? '' : '-rotate-90'}`} />
        </button>
        {containerOpen && (
          <div className="px-4 pb-4 space-y-3">
            {/* Container Type Selector */}
            <div className="space-y-2">
              <div className="text-xs text-gray-600 dark:text-gray-400 font-medium">{t('Konteyner Tipi', 'Container Type')}</div>
              <div className="grid grid-cols-2 gap-2">
                {CONTAINER_TYPES.map((ctype) => (
                  <button
                    key={ctype.id}
                    onClick={() => onContainerTypeChange(ctype)}
                    className={`px-3 py-2 text-xs font-medium rounded-lg transition-all ${
                      selectedContainerType.id === ctype.id
                        ? 'bg-teal-600 text-white'
                        : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-700 hover:border-teal-400'
                    }`}
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
              className={`w-full px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                palletResults.length > 0
                  ? 'bg-teal-600 hover:bg-teal-700 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
              }`}
            >
              {t('Konteynere Yükle', 'Load Container')}
            </button>

            {/* Container Stats */}
            {containerResult && (
              <div className="space-y-3 bg-white dark:bg-gray-800 rounded-xl p-3 border border-gray-200 dark:border-gray-700">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-gray-600 dark:text-gray-400">{t('Hacim Doluluk', 'Volume Fill')}</span>
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">{containerResult.fillPercentVolume.toFixed(1)}%</span>
                  </div>
                  <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-teal-400 to-teal-600" style={{ width: `${Math.min(100, containerResult.fillPercentVolume)}%` }} />
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-gray-600 dark:text-gray-400">{t('Ağırlık Doluluk', 'Weight Fill')}</span>
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">{containerResult.fillPercentWeight.toFixed(1)}%</span>
                  </div>
                  <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-cyan-400 to-cyan-600" style={{ width: `${Math.min(100, containerResult.fillPercentWeight)}%` }} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-gray-50 dark:bg-gray-700 rounded p-2">
                    <div className="text-gray-600 dark:text-gray-400">{t('Toplam Palet', 'Total Pallets')}</div>
                    <div className="font-semibold text-gray-900 dark:text-white">{containerResult.totalPallets}</div>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700 rounded p-2">
                    <div className="text-gray-600 dark:text-gray-400">{t('Kalan Hacim', 'Remaining Volume')}</div>
                    <div className="font-semibold text-gray-900 dark:text-white">{containerResult.remainingVolume.toFixed(1)} m³</div>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700 rounded p-2">
                    <div className="text-gray-600 dark:text-gray-400">{t('Kalan Ağırlık', 'Remaining Weight')}</div>
                    <div className="font-semibold text-gray-900 dark:text-white">{(containerResult.remainingWeight / 1000).toFixed(1)} ton</div>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700 rounded p-2">
                    <div className="text-gray-600 dark:text-gray-400">{t('Daha Palet', 'More Pallets')}</div>
                    <div className="font-semibold text-gray-900 dark:text-white">{containerResult.morePalletsFit}</div>
                  </div>
                </div>
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
        )}
      </div>

      {/* Export Button */}
      {palletResults.length > 0 && (
        <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-800">
          <button
            onClick={() => {
              const { boxTypes } = useLiteStore.getState();
              exportPackingList(palletResults, containerResult, boxTypes, lang as 'tr' | 'en');
            }}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gray-800 dark:bg-gray-700 hover:bg-gray-900 dark:hover:bg-gray-600 text-white rounded-lg text-sm font-medium transition-colors"
          >
            <FileDown size={16} />
            {t('PDF Olarak Dışa Aktar', 'Export as PDF')}
          </button>
        </div>
      )}

      {/* Pallet List - Accordion with clickable items */}
      {palletResults.length > 0 && (
        <div className="border-b border-gray-200 dark:border-gray-800">
          <button
            onClick={() => setPalletListOpen(!palletListOpen)}
            className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
              {t('Paletler', 'Pallets')} <span className="text-xs font-normal text-gray-500">({palletResults.length})</span>
            </h3>
            <ChevronDown size={16} className={`text-gray-500 transition-transform ${palletListOpen ? '' : '-rotate-90'}`} />
          </button>
          {palletListOpen && (
            <div className="px-4 pb-4">
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="max-h-64 overflow-y-auto divide-y divide-gray-100 dark:divide-gray-700">
                  {palletResults.map((pallet, idx) => (
                    <div
                      key={pallet.id}
                      onClick={() => onSelectPallet(idx)}
                      className={`px-3 py-2.5 cursor-pointer transition-colors ${
                        idx === selectedPalletIndex
                          ? 'bg-emerald-50 dark:bg-emerald-900/30 border-l-2 border-emerald-500'
                          : 'hover:bg-gray-50 dark:hover:bg-gray-750'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className={`text-xs font-medium ${
                          idx === selectedPalletIndex
                            ? 'text-emerald-700 dark:text-emerald-300'
                            : 'text-gray-800 dark:text-gray-200'
                        }`}>
                          #{idx + 1} — {pallet.palletType.name}
                        </span>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={(e) => { e.stopPropagation(); onUpdateDuplicateCount(pallet.id, pallet.duplicateCount - 1); }}
                            disabled={pallet.duplicateCount <= 1}
                            className="p-0.5 text-gray-400 hover:text-gray-600 disabled:opacity-30 rounded"
                          >
                            <Minus size={12} />
                          </button>
                          <span className="text-[10px] font-semibold text-gray-600 dark:text-gray-400 min-w-[16px] text-center">×{pallet.duplicateCount}</span>
                          <button
                            onClick={(e) => { e.stopPropagation(); onDuplicatePallet(pallet.id); }}
                            className="p-0.5 text-gray-400 hover:text-gray-600 rounded"
                          >
                            <Plus size={12} />
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); onRemovePallet(pallet.id); }}
                            className="p-0.5 text-red-400 hover:text-red-600 rounded ml-1"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              pallet.fillPercentVolume >= 80 ? 'bg-emerald-500' : pallet.fillPercentVolume >= 50 ? 'bg-amber-500' : 'bg-red-400'
                            }`}
                            style={{ width: `${Math.min(100, pallet.fillPercentVolume)}%` }}
                          />
                        </div>
                        <span className="text-[10px] text-gray-500 dark:text-gray-400">{pallet.boxes.length} {t('koli', 'box')}</span>
                        <span className="text-[10px] font-bold text-gray-700 dark:text-gray-300">{pallet.fillPercentVolume.toFixed(0)}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
