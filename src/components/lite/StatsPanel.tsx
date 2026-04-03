'use client';

import { useState } from 'react';
import { ContainerResult, ContainerType, Lang, PalletResult } from '@/lib/lite/types';
import { CONTAINER_TYPES } from '@/lib/lite/containerTypes';
import { Plus, Minus, Trash2, ChevronDown, FileDown, Truck, Eye } from 'lucide-react';
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

function FillBar({ percent, color = 'emerald' }: { percent: number; color?: 'emerald' | 'teal' | 'blue' | 'cyan' }) {
  const gradients: Record<string, string> = {
    emerald: 'from-emerald-400 to-emerald-600',
    teal: 'from-teal-400 to-teal-600',
    blue: 'from-blue-400 to-blue-600',
    cyan: 'from-cyan-400 to-cyan-600',
  };
  return (
    <div className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
      <div className={`h-full bg-gradient-to-r ${gradients[color]} rounded-full transition-all duration-500`} style={{ width: `${Math.min(100, percent)}%` }} />
    </div>
  );
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
  const [containerOpen, setContainerOpen] = useState(true);
  const [palletListOpen, setPalletListOpen] = useState(true);

  return (
    <div className="w-full md:w-80 flex flex-col h-full bg-gray-50/80 dark:bg-gray-900 md:border-l border-gray-200 dark:border-gray-800 overflow-y-auto">
      <div className="p-3 space-y-3">

        {/* ─── CARD 1: Selected Pallet Detail ─── */}
        {palletResult && (
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm">
            <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700/50">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <Eye size={14} className="text-emerald-500" />
                  {t('Seçili Palet', 'Selected Pallet')}
                </h3>
                <span className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 px-2 py-0.5 rounded-full">
                  #{selectedPalletIndex + 1} / {palletResults.length}
                </span>
              </div>
            </div>
            <div className="p-4 space-y-3">
              {/* Volume Fill */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs text-gray-500 dark:text-gray-400">{t('Hacim Doluluk', 'Volume Fill')}</span>
                  <span className={`text-sm font-bold ${
                    palletResult.fillPercentVolume >= 80 ? 'text-emerald-600 dark:text-emerald-400' :
                    palletResult.fillPercentVolume >= 50 ? 'text-amber-600 dark:text-amber-400' :
                    'text-red-500'
                  }`}>{palletResult.fillPercentVolume.toFixed(1)}%</span>
                </div>
                <FillBar percent={palletResult.fillPercentVolume} />
              </div>
              {/* Weight Fill */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs text-gray-500 dark:text-gray-400">{t('Ağırlık Doluluk', 'Weight Fill')}</span>
                  <span className="text-sm font-bold text-gray-900 dark:text-white">{palletResult.fillPercentWeight.toFixed(1)}%</span>
                </div>
                <FillBar percent={palletResult.fillPercentWeight} color="blue" />
              </div>
              {/* Quick Stats Grid */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-2.5 text-center">
                  <div className="text-lg font-bold text-gray-900 dark:text-white">{palletResult.boxes.length}</div>
                  <div className="text-[10px] text-gray-500 dark:text-gray-400 font-medium">{t('Koli', 'Boxes')}</div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-2.5 text-center">
                  <div className="text-lg font-bold text-gray-900 dark:text-white">{palletResult.layers}</div>
                  <div className="text-[10px] text-gray-500 dark:text-gray-400 font-medium">{t('Kat', 'Layers')}</div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-2.5 text-center">
                  <div className="text-sm font-bold text-gray-900 dark:text-white">{(palletResult.remainingVolume / 1000000).toFixed(2)}</div>
                  <div className="text-[10px] text-gray-500 dark:text-gray-400 font-medium">m³ {t('Kalan', 'Left')}</div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-2.5 text-center">
                  <div className="text-sm font-bold text-gray-900 dark:text-white">{palletResult.remainingWeight.toFixed(0)}</div>
                  <div className="text-[10px] text-gray-500 dark:text-gray-400 font-medium">kg {t('Kalan', 'Left')}</div>
                </div>
              </div>
              {/* Tip */}
              {palletResult.sameBoxFitCount > 0 && (
                <div className="flex items-start gap-2 bg-amber-50 dark:bg-amber-900/20 border border-amber-200/60 dark:border-amber-800/40 rounded-lg px-3 py-2">
                  <span className="text-amber-500 text-sm mt-px">💡</span>
                  <p className="text-xs text-amber-700 dark:text-amber-300 leading-relaxed">
                    {t(`Bu palete ${palletResult.sameBoxFitCount} adet daha koli sığar`, `${palletResult.sameBoxFitCount} more boxes can fit on this pallet`)}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ─── CARD 2: Container ─── */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm">
          <button
            onClick={() => setContainerOpen(!containerOpen)}
            className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors"
          >
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <Truck size={14} className="text-teal-500" />
              {t('Konteyner', 'Container')}
            </h3>
            <ChevronDown size={14} className={`text-gray-400 transition-transform duration-200 ${containerOpen ? '' : '-rotate-90'}`} />
          </button>
          {containerOpen && (
            <div className="px-4 pb-4 space-y-3 border-t border-gray-100 dark:border-gray-700/50 pt-3">
              {/* Container Type Selector */}
              <div className="grid grid-cols-2 gap-1.5">
                {CONTAINER_TYPES.map((ctype) => (
                  <button
                    key={ctype.id}
                    onClick={() => onContainerTypeChange(ctype)}
                    className={`px-3 py-2 text-xs font-medium rounded-lg transition-all ${
                      selectedContainerType.id === ctype.id
                        ? 'bg-teal-600 text-white shadow-sm shadow-teal-600/20'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    {ctype.name}
                  </button>
                ))}
              </div>

              {/* Load Button */}
              <button
                onClick={onGenerateContainer}
                disabled={palletResults.length === 0}
                className={`w-full px-4 py-2.5 rounded-lg font-semibold text-sm transition-all ${
                  palletResults.length > 0
                    ? 'bg-gradient-to-r from-teal-600 to-teal-500 hover:from-teal-700 hover:to-teal-600 text-white shadow-sm shadow-teal-600/20'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                }`}
              >
                {t('Konteynere Yükle', 'Load Container')}
              </button>

              {/* Container Stats */}
              {containerResult && (
                <div className="space-y-3 pt-1">
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs text-gray-500 dark:text-gray-400">{t('Hacim Doluluk', 'Volume Fill')}</span>
                      <span className={`text-sm font-bold ${
                        containerResult.fillPercentVolume >= 80 ? 'text-emerald-600 dark:text-emerald-400' :
                        containerResult.fillPercentVolume >= 50 ? 'text-amber-600 dark:text-amber-400' :
                        'text-red-500'
                      }`}>{containerResult.fillPercentVolume.toFixed(1)}%</span>
                    </div>
                    <FillBar percent={containerResult.fillPercentVolume} color="teal" />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs text-gray-500 dark:text-gray-400">{t('Ağırlık Doluluk', 'Weight Fill')}</span>
                      <span className="text-sm font-bold text-gray-900 dark:text-white">{containerResult.fillPercentWeight.toFixed(1)}%</span>
                    </div>
                    <FillBar percent={containerResult.fillPercentWeight} color="cyan" />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-2.5 text-center">
                      <div className="text-lg font-bold text-gray-900 dark:text-white">{containerResult.totalPallets}</div>
                      <div className="text-[10px] text-gray-500 dark:text-gray-400 font-medium">{t('Palet', 'Pallets')}</div>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-2.5 text-center">
                      <div className="text-lg font-bold text-gray-900 dark:text-white">{containerResult.morePalletsFit}</div>
                      <div className="text-[10px] text-gray-500 dark:text-gray-400 font-medium">{t('Daha Sığar', 'More Fit')}</div>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-2.5 text-center">
                      <div className="text-sm font-bold text-gray-900 dark:text-white">{containerResult.remainingVolume.toFixed(1)}</div>
                      <div className="text-[10px] text-gray-500 dark:text-gray-400 font-medium">m³ {t('Kalan', 'Left')}</div>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-2.5 text-center">
                      <div className="text-sm font-bold text-gray-900 dark:text-white">{(containerResult.remainingWeight / 1000).toFixed(1)}</div>
                      <div className="text-[10px] text-gray-500 dark:text-gray-400 font-medium">ton {t('Kalan', 'Left')}</div>
                    </div>
                  </div>
                  {containerResult.morePalletsFit > 0 && (
                    <div className="flex items-start gap-2 bg-teal-50 dark:bg-teal-900/20 border border-teal-200/60 dark:border-teal-800/40 rounded-lg px-3 py-2">
                      <span className="text-teal-500 text-sm mt-px">📦</span>
                      <p className="text-xs text-teal-700 dark:text-teal-300 leading-relaxed">
                        {containerResult.morePalletsFit} {t('adet daha palet sığabilir', 'more pallets can fit')}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* ─── CARD 3: Pallet List ─── */}
        {palletResults.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm">
            <button
              onClick={() => setPalletListOpen(!palletListOpen)}
              className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors"
            >
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <svg className="w-3.5 h-3.5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                </svg>
                {t('Paletler', 'Pallets')}
                <span className="text-[10px] font-normal text-gray-400 bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded-full">{palletResults.reduce((s, p) => s + p.duplicateCount, 0)}</span>
              </h3>
              <ChevronDown size={14} className={`text-gray-400 transition-transform duration-200 ${palletListOpen ? '' : '-rotate-90'}`} />
            </button>
            {palletListOpen && (
              <div className="border-t border-gray-100 dark:border-gray-700/50">
                <div className="max-h-56 overflow-y-auto divide-y divide-gray-50 dark:divide-gray-700/50">
                  {palletResults.map((pallet, idx) => (
                    <div
                      key={pallet.id}
                      onClick={() => onSelectPallet(idx)}
                      className={`px-4 py-2.5 cursor-pointer transition-all ${
                        idx === selectedPalletIndex
                          ? 'bg-emerald-50/80 dark:bg-emerald-900/20 border-l-[3px] border-emerald-500'
                          : 'hover:bg-gray-50 dark:hover:bg-gray-750 border-l-[3px] border-transparent'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className={`text-xs font-semibold ${
                          idx === selectedPalletIndex
                            ? 'text-emerald-700 dark:text-emerald-300'
                            : 'text-gray-700 dark:text-gray-200'
                        }`}>
                          #{idx + 1} {pallet.palletType.name}
                        </span>
                        <div className="flex items-center gap-0.5">
                          <button
                            onClick={(e) => { e.stopPropagation(); onUpdateDuplicateCount(pallet.id, pallet.duplicateCount - 1); }}
                            disabled={pallet.duplicateCount <= 1}
                            className="p-0.5 text-gray-400 hover:text-gray-600 disabled:opacity-20 rounded"
                          >
                            <Minus size={11} />
                          </button>
                          <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400 min-w-[16px] text-center">×{pallet.duplicateCount}</span>
                          <button
                            onClick={(e) => { e.stopPropagation(); onDuplicatePallet(pallet.id); }}
                            className="p-0.5 text-gray-400 hover:text-emerald-600 rounded"
                          >
                            <Plus size={11} />
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); onRemovePallet(pallet.id); }}
                            className="p-0.5 text-gray-300 hover:text-red-500 rounded ml-0.5"
                          >
                            <Trash2 size={11} />
                          </button>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-300 ${
                              pallet.fillPercentVolume >= 80 ? 'bg-emerald-500' : pallet.fillPercentVolume >= 50 ? 'bg-amber-500' : 'bg-red-400'
                            }`}
                            style={{ width: `${Math.min(100, pallet.fillPercentVolume)}%` }}
                          />
                        </div>
                        <span className="text-[10px] text-gray-400 dark:text-gray-500 tabular-nums">{pallet.boxes.length} {t('koli', 'box')}</span>
                        <span className={`text-[10px] font-bold tabular-nums ${
                          pallet.fillPercentVolume >= 80 ? 'text-emerald-600 dark:text-emerald-400' :
                          pallet.fillPercentVolume >= 50 ? 'text-amber-600 dark:text-amber-400' :
                          'text-red-500'
                        }`}>{pallet.fillPercentVolume.toFixed(0)}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Export Button */}
        {palletResults.length > 0 && (
          <button
            onClick={() => {
              const { boxTypes } = useLiteStore.getState();
              exportPackingList(palletResults, containerResult, boxTypes, lang as 'tr' | 'en');
            }}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-900 dark:bg-gray-700 hover:bg-gray-800 dark:hover:bg-gray-600 text-white rounded-xl text-sm font-semibold transition-colors shadow-sm"
          >
            <FileDown size={15} />
            {t('PDF Olarak Dışa Aktar', 'Export as PDF')}
          </button>
        )}
      </div>
    </div>
  );
}
