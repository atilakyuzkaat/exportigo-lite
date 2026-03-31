'use client';

import dynamic from 'next/dynamic';
import { useLiteStore } from '@/lib/lite/store';
import { t } from '@/lib/lite/i18n';
import { PalletResult } from '@/lib/lite/types';
import { Viewer2D } from './Viewer3D';

const Viewer3D = dynamic(() => import('./Viewer3D'), { ssr: false });

function StatItem({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="text-center">
      <div className="text-xs text-gray-500 dark:text-gray-400">{label}</div>
      <div className="text-lg font-bold text-gray-800 dark:text-gray-100">{value}</div>
      {sub && <div className="text-xs text-gray-400">{sub}</div>}
    </div>
  );
}

function ProgressBar({ percent, color }: { percent: number; color: string }) {
  return (
    <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
      <div
        className="h-full rounded-full transition-all duration-500"
        style={{ width: `${Math.min(percent, 100)}%`, backgroundColor: color }}
      />
    </div>
  );
}

export default function PalletCard({
  result,
  index,
}: {
  result: PalletResult;
  index: number;
}) {
  const {
    lang, viewMode, duplicatePallet, updateDuplicateCount, removePallet,
    highlightedLayer, setHighlightedLayer,
  } = useLiteStore();

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="px-5 py-3 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-gray-800 dark:text-gray-200">
            {t('pallet.result', lang)} #{index + 1}
          </h3>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {result.palletType.name} ({result.palletType.length}x{result.palletType.width}mm)
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500 dark:text-gray-400">x</span>
          <button
            onClick={() => updateDuplicateCount(result.id, result.duplicateCount - 1)}
            className="w-7 h-7 flex items-center justify-center rounded-md bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-sm font-bold transition-colors"
          >
            -
          </button>
          <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400 min-w-[24px] text-center">
            {result.duplicateCount}
          </span>
          <button
            onClick={() => duplicatePallet(result.id)}
            className="w-7 h-7 flex items-center justify-center rounded-md bg-emerald-100 dark:bg-emerald-900/40 hover:bg-emerald-200 dark:hover:bg-emerald-800/60 text-emerald-700 dark:text-emerald-300 text-sm font-bold transition-colors"
          >
            +
          </button>
        </div>
      </div>

      {/* 3D/2D View */}
      <div className="p-3">
        {viewMode === '3d' ? (
          <Viewer3D palletResult={result} />
        ) : (
          <Viewer2D palletResult={result} />
        )}
      </div>

      {/* Layer buttons */}
      {result.layers > 1 && (
        <div className="px-5 pb-2 flex gap-1.5 flex-wrap">
          <button
            onClick={() => setHighlightedLayer(null)}
            className={`px-2.5 py-1 text-xs rounded-full transition-colors ${
              highlightedLayer === null
                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300'
                : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
            }`}
          >
            {lang === 'tr' ? 'Tümü' : 'All'}
          </button>
          {Array.from({ length: result.layers }, (_, i) => (
            <button
              key={i}
              onClick={() => setHighlightedLayer(highlightedLayer === i ? null : i)}
              className={`px-2.5 py-1 text-xs rounded-full transition-colors ${
                highlightedLayer === i
                  ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300'
                  : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
              }`}
            >
              {t('view.layer', lang)} {i + 1}
            </button>
          ))}
        </div>
      )}

      {/* Stats */}
      <div className="px-5 py-4 space-y-3">
        <div className="grid grid-cols-4 gap-3">
          <StatItem label={t('pallet.boxes', lang)} value={`${result.boxes.length}`} />
          <StatItem label={t('pallet.layers', lang)} value={`${result.layers}`} />
          <StatItem label={t('pallet.weight', lang)} value={`${result.totalWeight}`} sub="kg" />
          <StatItem
            label={t('pallet.fillVolume', lang)}
            value={`${result.fillPercentVolume}%`}
          />
        </div>

        {/* Progress bars */}
        <div className="space-y-2">
          <div>
            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
              <span>{t('pallet.fillVolume', lang)}</span>
              <span>{result.fillPercentVolume}%</span>
            </div>
            <ProgressBar percent={result.fillPercentVolume} color="#10B981" />
          </div>
          <div>
            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
              <span>{t('pallet.fillWeight', lang)}</span>
              <span>{result.fillPercentWeight}%</span>
            </div>
            <ProgressBar percent={result.fillPercentWeight} color="#3B82F6" />
          </div>
        </div>

        {/* Remaining info */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="p-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <span className="text-gray-500 dark:text-gray-400">{t('pallet.remainWeight', lang)}: </span>
            <span className="font-medium text-gray-700 dark:text-gray-300">{result.remainingWeight} kg</span>
          </div>
          <div className="p-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <span className="text-gray-500 dark:text-gray-400">{t('pallet.remainVolume', lang)}: </span>
            <span className="font-medium text-gray-700 dark:text-gray-300">
              {(result.remainingVolume / 1000000).toFixed(2)} m³
            </span>
          </div>
        </div>

        {/* Suggestion */}
        {result.sameBoxFitCount > 0 && (
          <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800/50 text-sm text-amber-700 dark:text-amber-300">
            <span className="font-bold">{result.sameBoxFitCount}</span> {t('pallet.moreBoxes', lang)}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="px-5 py-3 border-t border-gray-100 dark:border-gray-700 flex gap-2">
        <button
          onClick={() => duplicatePallet(result.id)}
          className="flex-1 py-2 text-sm bg-emerald-50 dark:bg-emerald-900/30 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 rounded-lg transition-colors font-medium"
        >
          {t('pallet.duplicate', lang)}
        </button>
        <button
          onClick={() => removePallet(result.id)}
          className="px-4 py-2 text-sm bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/40 text-red-600 dark:text-red-400 rounded-lg transition-colors"
        >
          {t('pallet.remove', lang)}
        </button>
      </div>
    </div>
  );
}
