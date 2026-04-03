'use client';

import { PalletResult, ContainerResult, BoxType, Lang } from '@/lib/lite/types';
import { Package, Layers, TrendingUp, AlertTriangle, CheckCircle2, Truck } from 'lucide-react';

interface SmartSummaryBarProps {
  boxTypes: BoxType[];
  palletResults: PalletResult[];
  containerResult: ContainerResult | null;
  lang: Lang;
}

function getEfficiencyColor(percent: number): { bg: string; text: string; ring: string; label: string } {
  if (percent >= 80) return { bg: 'bg-emerald-50 dark:bg-emerald-900/20', text: 'text-emerald-700 dark:text-emerald-300', ring: 'ring-emerald-200 dark:ring-emerald-800', label: 'optimal' };
  if (percent >= 50) return { bg: 'bg-amber-50 dark:bg-amber-900/20', text: 'text-amber-700 dark:text-amber-300', ring: 'ring-amber-200 dark:ring-amber-800', label: 'improvable' };
  return { bg: 'bg-red-50 dark:bg-red-900/20', text: 'text-red-700 dark:text-red-300', ring: 'ring-red-200 dark:ring-red-800', label: 'inefficient' };
}

export default function SmartSummaryBar({ boxTypes, palletResults, containerResult, lang }: SmartSummaryBarProps) {
  const t = (tr: string, en: string) => (lang === 'tr' ? tr : en);

  const totalBoxes = boxTypes.reduce((sum, b) => sum + b.quantity, 0);
  const totalPallets = palletResults.reduce((sum, p) => sum + p.duplicateCount, 0);
  const totalWeight = palletResults.reduce((sum, p) => sum + p.totalWeight * p.duplicateCount, 0);
  const avgFill = palletResults.length > 0
    ? palletResults.reduce((sum, p) => sum + p.fillPercentVolume, 0) / palletResults.length
    : 0;

  const hasData = palletResults.length > 0;
  const fillColor = getEfficiencyColor(avgFill);
  const containerFill = containerResult ? getEfficiencyColor(containerResult.fillPercentVolume) : null;

  // Smart recommendation logic
  const getRecommendation = (): { icon: typeof CheckCircle2; message: string; type: 'success' | 'warning' | 'info' } | null => {
    if (!hasData) return null;

    if (containerResult) {
      if (containerResult.fillPercentVolume >= 85) {
        return { icon: CheckCircle2, message: t('Mükemmel yükleme! Konteyner kapasitesi optimal kullanılıyor.', 'Excellent loading! Container capacity is optimally used.'), type: 'success' };
      }
      if (containerResult.morePalletsFit > 0 && containerResult.fillPercentVolume < 70) {
        return { icon: AlertTriangle, message: t(`Konteynerde ${containerResult.morePalletsFit} palet daha sığar. Daha fazla ürün ekleyerek maliyeti düşürebilirsiniz.`, `${containerResult.morePalletsFit} more pallets can fit. Add more products to reduce cost per unit.`), type: 'warning' };
      }
      if (containerResult.morePalletsFit > 0) {
        return { icon: TrendingUp, message: t(`${containerResult.morePalletsFit} palet daha sığabilir. Sevkiyatınızı optimize edin.`, `${containerResult.morePalletsFit} more pallets can fit. Optimize your shipment.`), type: 'info' };
      }
    }

    if (avgFill < 60) {
      return { icon: AlertTriangle, message: t('Palet doluluk oranı düşük. Farklı koli boyutları deneyin.', 'Low pallet fill rate. Try different box dimensions.'), type: 'warning' };
    }

    if (avgFill >= 80) {
      return { icon: CheckCircle2, message: t('Harika! Paletler verimli şekilde dolu.', 'Great! Pallets are efficiently packed.'), type: 'success' };
    }

    return null;
  };

  const recommendation = getRecommendation();

  // If no data yet, show a minimal prompt
  if (!hasData && totalBoxes === 0) {
    return null;
  }

  return (
    <div className="flex-shrink-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
      {/* Metric Cards Row */}
      <div className="px-4 py-3">
        <div className="flex items-stretch gap-3 overflow-x-auto">
          {/* Total Boxes */}
          <div className="flex items-center gap-3 px-4 py-2.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl ring-1 ring-slate-200 dark:ring-slate-700 min-w-fit">
            <div className="w-9 h-9 rounded-lg bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center flex-shrink-0">
              <Package size={18} className="text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <div className="text-[11px] text-gray-500 dark:text-gray-400 font-medium leading-tight">{t('Toplam Koli', 'Total Boxes')}</div>
              <div className="text-lg font-bold text-gray-900 dark:text-white leading-tight">{totalBoxes}</div>
            </div>
          </div>

          {/* Pallets Required */}
          {hasData && (
            <div className="flex items-center gap-3 px-4 py-2.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl ring-1 ring-slate-200 dark:ring-slate-700 min-w-fit">
              <div className="w-9 h-9 rounded-lg bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center flex-shrink-0">
                <Layers size={18} className="text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <div className="text-[11px] text-gray-500 dark:text-gray-400 font-medium leading-tight">{t('Palet', 'Pallets')}</div>
                <div className="text-lg font-bold text-gray-900 dark:text-white leading-tight">
                  {totalPallets}
                  <span className="text-xs font-normal text-gray-500 ml-1">{t('adet', 'pcs')}</span>
                </div>
              </div>
            </div>
          )}

          {/* Average Fill Rate */}
          {hasData && (
            <div className={`flex items-center gap-3 px-4 py-2.5 rounded-xl ring-1 min-w-fit ${fillColor.bg} ${fillColor.ring}`}>
              <div className="w-9 h-9 rounded-lg bg-white/60 dark:bg-gray-800/60 flex items-center justify-center flex-shrink-0">
                <TrendingUp size={18} className={fillColor.text} />
              </div>
              <div>
                <div className="text-[11px] text-gray-500 dark:text-gray-400 font-medium leading-tight">{t('Ort. Doluluk', 'Avg. Fill')}</div>
                <div className={`text-lg font-bold leading-tight ${fillColor.text}`}>
                  {avgFill.toFixed(0)}%
                </div>
              </div>
            </div>
          )}

          {/* Total Weight */}
          {hasData && (
            <div className="flex items-center gap-3 px-4 py-2.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl ring-1 ring-slate-200 dark:ring-slate-700 min-w-fit">
              <div className="w-9 h-9 rounded-lg bg-purple-100 dark:bg-purple-900/40 flex items-center justify-center flex-shrink-0">
                <svg className="w-[18px] h-[18px] text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                </svg>
              </div>
              <div>
                <div className="text-[11px] text-gray-500 dark:text-gray-400 font-medium leading-tight">{t('Toplam Ağırlık', 'Total Weight')}</div>
                <div className="text-lg font-bold text-gray-900 dark:text-white leading-tight">
                  {totalWeight >= 1000 ? `${(totalWeight / 1000).toFixed(1)} ton` : `${totalWeight.toFixed(0)} kg`}
                </div>
              </div>
            </div>
          )}

          {/* Container Fill */}
          {containerResult && containerFill && (
            <div className={`flex items-center gap-3 px-4 py-2.5 rounded-xl ring-1 min-w-fit ${containerFill.bg} ${containerFill.ring}`}>
              <div className="w-9 h-9 rounded-lg bg-white/60 dark:bg-gray-800/60 flex items-center justify-center flex-shrink-0">
                <Truck size={18} className={containerFill.text} />
              </div>
              <div>
                <div className="text-[11px] text-gray-500 dark:text-gray-400 font-medium leading-tight">{containerResult.containerType.name}</div>
                <div className={`text-lg font-bold leading-tight ${containerFill.text}`}>
                  {containerResult.fillPercentVolume.toFixed(0)}%
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Smart Recommendation Strip */}
      {recommendation && (
        <div className={`px-4 pb-3`}>
          <div className={`flex items-center gap-2.5 px-4 py-2 rounded-lg text-sm ${
            recommendation.type === 'success' ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300' :
            recommendation.type === 'warning' ? 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300' :
            'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
          }`}>
            <recommendation.icon size={16} className="flex-shrink-0" />
            <span className="font-medium">{recommendation.message}</span>
          </div>
        </div>
      )}
    </div>
  );
}
