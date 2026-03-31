'use client';

import { useLiteStore } from '@/lib/lite/store';
import { t } from '@/lib/lite/i18n';

export default function Header() {
  const { lang, setLang, step, setStep, viewMode, setViewMode } = useLiteStore();

  const steps = [
    { key: 'input' as const, label: t('step.input', lang), icon: '1' },
    { key: 'pallet' as const, label: t('step.pallet', lang), icon: '2' },
    { key: 'container' as const, label: t('step.container', lang), icon: '3' },
  ];

  const stepOrder = ['input', 'pallet', 'container'];
  const currentIndex = stepOrder.indexOf(step);

  return (
    <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        {/* Top bar */}
        <div className="flex items-center justify-between h-14">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-800 dark:text-white leading-tight">
                {t('app.title', lang)}
              </h1>
              <p className="text-[10px] text-gray-400 dark:text-gray-500 leading-tight hidden sm:block">
                {t('app.subtitle', lang)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* View mode toggle (only on pallet/container steps) */}
            {(step === 'pallet' || step === 'container') && (
              <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-0.5 mr-2">
                <button
                  onClick={() => setViewMode('3d')}
                  className={`px-3 py-1 text-xs rounded-md transition-colors ${
                    viewMode === '3d'
                      ? 'bg-white dark:bg-gray-700 text-emerald-600 dark:text-emerald-400 shadow-sm'
                      : 'text-gray-500 dark:text-gray-400'
                  }`}
                >
                  {t('view.3d', lang)}
                </button>
                <button
                  onClick={() => setViewMode('2d')}
                  className={`px-3 py-1 text-xs rounded-md transition-colors ${
                    viewMode === '2d'
                      ? 'bg-white dark:bg-gray-700 text-emerald-600 dark:text-emerald-400 shadow-sm'
                      : 'text-gray-500 dark:text-gray-400'
                  }`}
                >
                  {t('view.2d', lang)}
                </button>
              </div>
            )}

            {/* Language toggle */}
            <button
              onClick={() => setLang(lang === 'tr' ? 'en' : 'tr')}
              className="px-3 py-1.5 text-xs font-medium bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors text-gray-600 dark:text-gray-400"
            >
              {lang === 'tr' ? 'EN' : 'TR'}
            </button>
          </div>
        </div>

        {/* Step indicator */}
        <div className="flex items-center gap-1 pb-3 -mt-1">
          {steps.map((s, i) => (
            <div key={s.key} className="flex items-center">
              <button
                onClick={() => i <= currentIndex ? setStep(s.key) : undefined}
                disabled={i > currentIndex}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                  step === s.key
                    ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300'
                    : i < currentIndex
                      ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 cursor-pointer hover:bg-emerald-100'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-600 cursor-not-allowed'
                }`}
              >
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                  step === s.key
                    ? 'bg-emerald-500 text-white'
                    : i < currentIndex
                      ? 'bg-emerald-400 text-white'
                      : 'bg-gray-300 dark:bg-gray-600 text-white'
                }`}>
                  {i < currentIndex ? '✓' : s.icon}
                </span>
                <span className="hidden sm:inline">{s.label}</span>
              </button>
              {i < steps.length - 1 && (
                <div className={`w-6 h-0.5 mx-1 ${
                  i < currentIndex ? 'bg-emerald-400' : 'bg-gray-200 dark:bg-gray-700'
                }`} />
              )}
            </div>
          ))}
        </div>
      </div>
    </header>
  );
}
