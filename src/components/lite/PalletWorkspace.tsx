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
        flex-1 flex flex-col bg-white dark:bg-gray-850 border-l border-r border-gray-200 dark:border-gray-800
        transition-all ${isOver ? 'border-emerald-400 dark:border-emerald-500 bg-emerald-50/50 dark:bg-emerald-900/10' : ''}
      `}
    >
      {/* Pallet Type Selector */}
      <div className="flex-shrink-0 p-4 border-b border-gray-200 dark:border-gray-800">
        <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {lang === 'tr' ? 'Palet Tipi' : 'Pallet Type'}
        </div>
        <div className="flex gap-2 overflow-x-auto">
          {PALLET_TYPES.map((ptype) => (
            <button
              key={ptype.id}
              onClick={() => onPalletTypeChange(ptype)}
              className={`
                px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all
                ${selectedPalletType.id === ptype.id
                  ? 'bg-emerald-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'}
              `}
            >
              {ptype.name}
            </button>
          ))}
        </div>
      </div>

      {/* 3D/2D Viewer Area */}
      <div className="flex-1 overflow-auto p-4 flex flex-col items-center justify-center">
        {palletResult ? (
          <div className="w-full h-full flex flex-col gap-4">
            {/* View Toggle */}
            <div className="flex gap-2 justify-center">
              <button
                onClick={() => setViewMode('3d')}
                className={`
                  px-4 py-2 rounded-lg text-sm font-medium transition-all
                  ${viewMode === '3d'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'}
                `}
              >
                3D
              </button>
              <button
                onClick={() => setViewMode('2d')}
                className={`
                  px-4 py-2 rounded-lg text-sm font-medium transition-all
                  ${viewMode === '2d'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'}
                `}
              >
                2D
              </button>
            </div>

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
              <div className="flex gap-1 justify-center flex-wrap">
                {layers.map((layerIdx) => (
                  <button
                    key={layerIdx}
                    onClick={() => setSelectedLayer(layerIdx)}
                    className={`
                      px-3 py-1.5 text-sm font-medium rounded-lg transition-all
                      ${selectedLayer === layerIdx
                        ? 'bg-emerald-600 text-white'
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'}
                    `}
                  >
                    {lang === 'tr' ? 'Kat' : 'Layer'} {layerIdx + 1}
                  </button>
                ))}
              </div>
            )}

            {/* Stats */}
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-2">
                <div className="text-xs text-gray-600 dark:text-gray-400">
                  {lang === 'tr' ? 'Kat Sayısı' : 'Layers'}
                </div>
                <div className="text-lg font-semibold text-gray-900 dark:text-white">
                  {palletResult.layers}
                </div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-2">
                <div className="text-xs text-gray-600 dark:text-gray-400">
                  {lang === 'tr' ? 'Koli Sayısı' : 'Boxes'}
                </div>
                <div className="text-lg font-semibold text-gray-900 dark:text-white">
                  {palletResult.boxes.length}
                </div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-2">
                <div className="text-xs text-gray-600 dark:text-gray-400">
                  {lang === 'tr' ? 'Hacim' : 'Volume'}
                </div>
                <div className="text-lg font-semibold text-gray-900 dark:text-white">
                  {palletResult.fillPercentVolume.toFixed(0)}%
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center">
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              {lang === 'tr'
                ? 'Palet oluşturmak için ürünleri sürükleyin ve "Palet Oluştur" butonuna tıklayın'
                : 'Drag products here and click "Generate Pallet" to create'}
            </p>
            <button
              onClick={onGenerate}
              disabled={!hasProducts}
              className={`
                px-6 py-3 rounded-lg font-semibold transition-all
                ${hasProducts
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'}
              `}
            >
              {lang === 'tr' ? 'Palet Oluştur' : 'Generate Pallet'}
            </button>
          </div>
        )}
      </div>

      {/* Generate Button (Always visible when result exists) */}
      {palletResult && (
        <div className="flex-shrink-0 p-4 border-t border-gray-200 dark:border-gray-800">
          <button
            onClick={onGenerate}
            className="w-full px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-colors"
          >
            {lang === 'tr' ? 'Paletleri Yeniden Oluştur' : 'Regenerate Pallets'}
          </button>
        </div>
      )}
    </div>
  );
}
