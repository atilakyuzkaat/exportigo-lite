'use client';

import dynamic from 'next/dynamic';
import { useLiteStore } from '@/lib/lite/store';
import { t } from '@/lib/lite/i18n';

const ContainerView3D = dynamic(() => import('./ContainerView3D'), { ssr: false });

function StatRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700 last:border-0">
      <span className="text-sm text-gray-500 dark:text-gray-400">{label}</span>
      <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">{value}</span>
    </div>
  );
}

function ProgressBar({ percent, color, label }: { percent: number; color: string; label: string }) {
  return (
    <div>
      <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
        <span>{label}</span>
        <span>{percent}%</span>
      </div>
      <div className="w-full h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${Math.min(percent, 100)}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}

export default function ContainerResultCard() {
  const { containerResult, lang } = useLiteStore();

  if (!containerResult) return null;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm">
      {/* Header */}
      <div className="px-5 py-3 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-b border-gray-100 dark:border-gray-700">
        <h3 className="font-semibold text-gray-800 dark:text-gray-200">
          {t('container.result', lang)} — {containerResult.containerType.name}
        </h3>
        <span className="text-xs text-gray-500 dark:text-gray-400">
          {containerResult.containerType.lengthMM}x{containerResult.containerType.widthMM}x{containerResult.containerType.heightMM}mm
        </span>
      </div>

      {/* 3D View */}
      <div className="p-3">
        <ContainerView3D containerResult={containerResult} />
      </div>

      {/* Stats */}
      <div className="px-5 py-4 space-y-4">
        {/* Progress bars */}
        <div className="space-y-3">
          <ProgressBar
            percent={containerResult.fillPercentVolume}
            color="#3B82F6"
            label={t('container.fillVolume', lang)}
          />
          <ProgressBar
            percent={containerResult.fillPercentWeight}
            color="#10B981"
            label={t('container.fillWeight', lang)}
          />
        </div>

        {/* Details */}
        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
          <StatRow
            label={t('container.palletCount', lang)}
            value={`${containerResult.totalPallets}`}
          />
          <StatRow
            label={t('pallet.weight', lang)}
            value={`${containerResult.totalWeight.toLocaleString()} kg`}
          />
          <StatRow
            label={t('container.remainWeight', lang)}
            value={`${containerResult.remainingWeight.toLocaleString()} kg`}
          />
          <StatRow
            label={t('container.remainVolume', lang)}
            value={`${containerResult.remainingVolume} m³`}
          />
        </div>

        {/* More pallets suggestion */}
        {containerResult.morePalletsFit > 0 && (
          <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800/50 text-sm text-blue-700 dark:text-blue-300">
            <span className="font-bold">{containerResult.morePalletsFit}</span> {t('container.morePallets', lang)}
          </div>
        )}
      </div>
    </div>
  );
}
