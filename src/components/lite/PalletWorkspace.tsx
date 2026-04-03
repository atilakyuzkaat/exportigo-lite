'use client';

import { useState, useMemo } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { BoxType, PalletResult, PalletType, Lang } from '@/lib/lite/types';
import { PALLET_TYPES } from '@/lib/lite/palletTypes';
import Viewer3D, { Viewer2D } from './Viewer3D';

interface PalletWorkspaceProps {
  palletResult: PalletResult | null;
  boxTypes: BoxType[];
  selectedPalletType: PalletType;
  onPalletTypeChange: (pt: PalletType) => void;
  onGenerate: () => void;
  lang: Lang;
}

export default function PalletWorkspace({
  palletResult,
  boxTypes,
  selectedPalletType,
  onPalletTypeChange,
  onGenerate,
  lang,
}: PalletWorkspaceProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: 'pallet-workspace',
  });

  const t = (tr: string, en: string) => (lang === 'tr' ? tr : en);
  const [viewMode, setViewMode] = useState<'3d' | '2d'>('3d');
  const [selectedLayer, setSelectedLayer] = useState(0);

  const hasProducts = boxTypes.length > 0 && boxTypes.some(b => b.quantity > 0);
  const layers = useMemo(
    () => (palletResult ? Array.from({ length: palletResult.layers }, (_, i) => i) : []),
    [palletResult],
  );

  return (
    <div
      ref={setNodeRef}
      className={`
        flex-1 flex flex-col bg-white dark:bg-gray-850
        transition-all ${isOver ? 'bg-emerald-50/30 dark:bg-emerald-900/5' : ''}
      `}
    >
      {/* Compact Toolbar */}
      <div className="flex-shrink-0 px-4 py-2.5 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between gap-3">
        {/* Pallet Type Chips */}
        <div className="flex gap-1.5 overflow-x-auto flex-1">
          {PALLET_TYPES.map((ptype) => (
            <button
              key={ptype.id}
              onClick={() => onPalletTypeChange(ptype)}
              className={`
                px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all
                ${selectedPalletType.id === ptype.id
                  ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/20'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'}
              `}
            >
              {ptype.name}
            </button>
          ))}
        </div>
        {/* View Toggle */}
        {palletResult && (
          <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-0.5 flex-shrink-0">
            <button
              onClick={() => setViewMode('3d')}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
                viewMode === '3d'
                  ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700'
              }`}
            >
              3D
            </button>
            <button
              onClick={() => setViewMode('2d')}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
                viewMode === '2d'
                  ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700'
              }`}
            >
              2D
            </button>
          </div>
        )}
      </div>

      {/* 3D/2D Viewer Area */}
      <div className="flex-1 overflow-auto flex flex-col items-center justify-center min-h-0">
        {palletResult ? (
          <div className="w-full h-full flex flex-col">
            {/* Viewer */}
            <div className="flex-1 min-h-0">
              {viewMode === '3d' ? (
                <Viewer3D palletResult={palletResult} />
              ) : (
                <Viewer2D palletResult={palletResult} />
              )}
            </div>

            {/* Layer Navigation */}
            {layers.length > 1 && (
              <div className="flex gap-1 justify-center flex-wrap px-4 py-2 border-t border-gray-100 dark:border-gray-800">
                {layers.map((layerIdx) => (
                  <button
                    key={layerIdx}
                    onClick={() => setSelectedLayer(layerIdx)}
                    className={`
                      px-3 py-1 text-xs font-medium rounded-md transition-all
                      ${selectedLayer === layerIdx
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'}
                    `}
                  >
                    {t('Kat', 'Layer')} {layerIdx + 1}
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="text-center px-6 py-12">
            <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t('Paletleri oluşturmaya hazır', 'Ready to generate pallets')}
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mb-5 max-w-[240px] mx-auto">
              {t('Sol panelden ürün ekleyip "Palet Oluştur" butonuna tıklayın', 'Add products from the left panel and click Generate')}
            </p>
            <button
              onClick={onGenerate}
              disabled={!hasProducts}
              className={`
                px-6 py-2.5 rounded-xl font-semibold text-sm transition-all
                ${hasProducts
                  ? 'bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 text-white shadow-lg shadow-emerald-600/20'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500 cursor-not-allowed'}
              `}
            >
              {t('Palet Oluştur', 'Generate Pallet')}
            </button>
          </div>
        )}
      </div>

      {/* Generate Button (Always visible when result exists) */}
      {palletResult && (
        <div className="flex-shrink-0 px-4 py-3 border-t border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50">
          <button
            onClick={onGenerate}
            className="w-full px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 text-white rounded-xl font-semibold text-sm transition-all shadow-sm shadow-emerald-600/20"
          >
            {t('Paletleri Yeniden Oluştur', 'Regenerate Pallets')}
          </button>
        </div>
      )}
    </div>
  );
}
