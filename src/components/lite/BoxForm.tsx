'use client';

import { useLiteStore } from '@/lib/lite/store';
import { t } from '@/lib/lite/i18n';
import { useRef } from 'react';

export default function BoxForm() {
  const { boxTypes, addBoxType, updateBoxType, removeBoxType, importBoxTypes, lang } = useLiteStore();
  const fileRef = useRef<HTMLInputElement>(null);

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const XLSX = await import('xlsx');
      const data = await file.arrayBuffer();
      const wb = XLSX.read(data);
      const ws = wb.Sheets[wb.SheetNames[0]];
      const rows: Record<string, unknown>[] = XLSX.utils.sheet_to_json(ws);

      const boxes = rows.map((row, i) => ({
        label: String(row['label'] || row['ad'] || row['Koli Adı'] || `Koli ${i + 1}`),
        length: Number(row['length'] || row['uzunluk'] || row['Uzunluk'] || 40),
        width: Number(row['width'] || row['genislik'] || row['Genişlik'] || 30),
        height: Number(row['height'] || row['yukseklik'] || row['Yükseklik'] || 30),
        weight: Number(row['weight'] || row['agirlik'] || row['Ağırlık'] || 20),
        maxStack: Number(row['maxStack'] || row['max_istif'] || row['Max İstif'] || 5),
        quantity: Number(row['quantity'] || row['adet'] || row['Adet'] || 1),
      }));

      if (boxes.length > 0) importBoxTypes(boxes);
    } catch (err) {
      console.error('Import error:', err);
    }

    if (fileRef.current) fileRef.current.value = '';
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
          {t('box.title', lang)}
        </h2>
        <div className="flex gap-2">
          <input
            ref={fileRef}
            type="file"
            accept=".xlsx,.xls,.csv"
            className="hidden"
            onChange={handleImport}
          />
          <button
            onClick={() => fileRef.current?.click()}
            className="px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-lg transition-colors text-gray-700 dark:text-gray-300"
          >
            {t('box.import', lang)}
          </button>
        </div>
      </div>

      {/* Header Row */}
      <div className="hidden md:grid md:grid-cols-[1fr_0.7fr_0.7fr_0.7fr_0.7fr_0.7fr_0.6fr_auto] gap-2 px-3 py-2 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg text-xs font-medium text-emerald-800 dark:text-emerald-300">
        <span>{t('box.label', lang)}</span>
        <span>{t('box.length', lang)}</span>
        <span>{t('box.width', lang)}</span>
        <span>{t('box.height', lang)}</span>
        <span>{t('box.weight', lang)}</span>
        <span>{t('box.maxStack', lang)}</span>
        <span>{t('box.quantity', lang)}</span>
        <span></span>
      </div>

      {/* Box Rows */}
      {boxTypes.map((box) => (
        <div
          key={box.id}
          className="grid grid-cols-2 md:grid-cols-[1fr_0.7fr_0.7fr_0.7fr_0.7fr_0.7fr_0.6fr_auto] gap-2 p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-emerald-300 dark:hover:border-emerald-600 transition-colors"
        >
          <div className="col-span-2 md:col-span-1">
            <label className="md:hidden text-xs text-gray-500 mb-1 block">{t('box.label', lang)}</label>
            <div className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full flex-shrink-0"
                style={{ backgroundColor: box.color }}
              />
              <input
                type="text"
                value={box.label}
                onChange={(e) => updateBoxType(box.id, { label: e.target.value })}
                className="w-full px-2 py-1.5 text-sm border border-gray-200 dark:border-gray-600 rounded-md bg-transparent focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
              />
            </div>
          </div>

          {[
            { key: 'length' as const, label: t('box.length', lang) },
            { key: 'width' as const, label: t('box.width', lang) },
            { key: 'height' as const, label: t('box.height', lang) },
            { key: 'weight' as const, label: t('box.weight', lang) },
            { key: 'maxStack' as const, label: t('box.maxStack', lang) },
            { key: 'quantity' as const, label: t('box.quantity', lang) },
          ].map(({ key, label }) => (
            <div key={key}>
              <label className="md:hidden text-xs text-gray-500 mb-1 block">{label}</label>
              <input
                type="number"
                min={key === 'quantity' ? 1 : 0}
                value={box[key]}
                onChange={(e) => updateBoxType(box.id, { [key]: Number(e.target.value) })}
                className="w-full px-2 py-1.5 text-sm border border-gray-200 dark:border-gray-600 rounded-md bg-transparent focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-center"
              />
            </div>
          ))}

          <div className="flex items-end justify-center">
            {boxTypes.length > 1 && (
              <button
                onClick={() => removeBoxType(box.id)}
                className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors"
                title={t('box.remove', lang)}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            )}
          </div>
        </div>
      ))}

      <button
        onClick={addBoxType}
        className="w-full py-3 border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-emerald-400 dark:hover:border-emerald-500 rounded-lg text-sm text-gray-500 dark:text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
      >
        {t('box.add', lang)}
      </button>
    </div>
  );
}
