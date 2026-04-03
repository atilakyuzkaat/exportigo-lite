'use client';

import { useState, useCallback, useRef } from 'react';
import { useSession, signIn, signOut } from 'next-auth/react';
import {
  DndContext,
  DragOverlay,
  DragStartEvent,
  DragEndEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import dynamic from 'next/dynamic';
import Image from 'next/image';

import { useLiteStore } from '@/lib/lite/store';
import { BoxType } from '@/lib/lite/types';

import ProductPanel from '@/components/lite/ProductPanel';
import StatsPanel from '@/components/lite/StatsPanel';
import SmartSummaryBar from '@/components/lite/SmartSummaryBar';
import DragOverlayContent from '@/components/lite/DragOverlayContent';
import ToastContainer, { addToast } from '@/components/lite/Toast';

const ContainerView3D = dynamic(() => import('@/components/lite/ContainerView3D'), { ssr: false });
const PalletWorkspace = dynamic(() => import('@/components/lite/PalletWorkspace'), { ssr: false });

type MobileTab = 'products' | 'workspace' | 'stats';

export default function LiteApp() {
  const { data: session, status } = useSession();
  const store = useLiteStore();
  const {
    lang, setLang,
    boxTypes, addBoxType, updateBoxType, removeBoxType,
    selectedPalletType, setSelectedPalletType,
    palletResults, generatePallets, duplicatePallet, removePallet, updateDuplicateCount,
    selectedContainerType, setSelectedContainerType,
    containerResult, generateContainer,
  } = store;

  const [quantities, setQuantities] = useState<Record<string, number>>(() => {
    const q: Record<string, number> = {};
    boxTypes.forEach(b => { q[b.id] = b.quantity; });
    return q;
  });

  const [activeDrag, setActiveDrag] = useState<BoxType | null>(null);
  const [showContainerView, setShowContainerView] = useState(false);
  const [mobileTab, setMobileTab] = useState<MobileTab>('products');
  const [selectedPalletIndex, setSelectedPalletIndex] = useState(0);
  const regenerateTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hasGenerated = useRef(false);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    })
  );

  const hasGeneratedContainer = useRef(false);

  // Auto-regenerate pallets after quantity or product changes
  const triggerAutoRegenerate = useCallback(() => {
    if (!hasGenerated.current) return;
    if (regenerateTimer.current) clearTimeout(regenerateTimer.current);
    regenerateTimer.current = setTimeout(() => {
      generatePallets();
      // Also regenerate container if it was previously generated
      if (hasGeneratedContainer.current) {
        setTimeout(() => generateContainer(), 100);
      }
    }, 600);
  }, [generatePallets, generateContainer]);

  // Auto-regenerate container when pallet list changes (duplicate/remove)
  const triggerContainerRegenerate = useCallback(() => {
    if (!hasGeneratedContainer.current) return;
    if (regenerateTimer.current) clearTimeout(regenerateTimer.current);
    regenerateTimer.current = setTimeout(() => {
      generateContainer();
    }, 300);
  }, [generateContainer]);

  const handleQuantityChange = useCallback((id: string, qty: number) => {
    setQuantities(prev => ({ ...prev, [id]: qty }));
    updateBoxType(id, { quantity: qty });
    triggerAutoRegenerate();
  }, [updateBoxType, triggerAutoRegenerate]);

  const handleAddProduct = useCallback((product: Omit<BoxType, 'id' | 'quantity' | 'color'>) => {
    addBoxType();
    const lastBox = useLiteStore.getState().boxTypes[useLiteStore.getState().boxTypes.length - 1];
    if (lastBox) {
      updateBoxType(lastBox.id, {
        label: product.label,
        length: product.length,
        width: product.width,
        height: product.height,
        weight: product.weight,
        maxStack: product.maxStack,
      });
      setQuantities(prev => ({ ...prev, [lastBox.id]: 1 }));
    }
    triggerAutoRegenerate();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [addBoxType, updateBoxType, triggerAutoRegenerate]);

  const handleDeleteProduct = useCallback((id: string) => {
    removeBoxType(id);
    setQuantities(prev => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
    triggerAutoRegenerate();
  }, [removeBoxType, triggerAutoRegenerate]);

  const handleDragStart = (event: DragStartEvent) => {
    const data = event.active.data.current;
    if (data) {
      setActiveDrag(data as BoxType);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveDrag(null);
    const { over } = event;
    if (over?.id === 'pallet-workspace') {
      // Product was dropped on pallet workspace
    }
  };

  const handleGenerate = useCallback(() => {
    Object.entries(quantities).forEach(([id, qty]) => {
      updateBoxType(id, { quantity: qty });
    });
    setTimeout(() => {
      generatePallets();
      hasGenerated.current = true;
      setSelectedPalletIndex(0);
      setMobileTab('workspace');
      const results = useLiteStore.getState().palletResults;
      addToast('success', lang === 'tr'
        ? `${results.length} palet oluşturuldu`
        : `${results.length} pallets generated`);
    }, 50);
  }, [quantities, updateBoxType, generatePallets, lang]);

  const handlePalletTypeChange = useCallback((pt: typeof selectedPalletType) => {
    setSelectedPalletType(pt);
    if (hasGenerated.current) {
      setTimeout(() => {
        generatePallets();
        if (hasGeneratedContainer.current) {
          setTimeout(() => generateContainer(), 100);
        }
      }, 100);
    }
  }, [setSelectedPalletType, generatePallets, generateContainer]);

  const handleGenerateContainer = useCallback(() => {
    generateContainer();
    hasGeneratedContainer.current = true;
    setShowContainerView(true);
    setMobileTab('workspace');
    const cr = useLiteStore.getState().containerResult;
    if (cr) {
      addToast('success', lang === 'tr'
        ? `${cr.totalPallets} palet konteynere yüklendi (${cr.fillPercentVolume.toFixed(0)}% doluluk)`
        : `${cr.totalPallets} pallets loaded (${cr.fillPercentVolume.toFixed(0)}% fill)`);
    }
  }, [generateContainer, lang]);

  // Wrapped pallet list operations with auto container regeneration
  const handleDuplicatePallet = useCallback((id: string) => {
    duplicatePallet(id);
    triggerContainerRegenerate();
  }, [duplicatePallet, triggerContainerRegenerate]);

  const handleRemovePallet = useCallback((id: string) => {
    removePallet(id);
    triggerContainerRegenerate();
  }, [removePallet, triggerContainerRegenerate]);

  const handleUpdateDuplicateCount = useCallback((id: string, count: number) => {
    updateDuplicateCount(id, count);
    triggerContainerRegenerate();
  }, [updateDuplicateCount, triggerContainerRegenerate]);

  // Auth loading
  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400">Yukleniyor...</p>
        </div>
      </div>
    );
  }

  // Auth required
  if (!session) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-emerald-50 dark:from-slate-950 dark:to-emerald-950 flex items-center justify-center p-4">
        <div className="w-full max-w-md text-center">
          <div className="w-16 h-16 bg-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-emerald-500/25">
            <svg className="w-9 h-9 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Exportigo Lite
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mb-8">
            Palet & Konteyner Yukleme Optimizasyonu
          </p>
          <button
            onClick={() => signIn('google')}
            className="inline-flex items-center gap-3 px-6 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors shadow-lg"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            <span className="font-medium text-gray-700 dark:text-gray-200">
              Google ile Giris Yap
            </span>
          </button>
        </div>
      </div>
    );
  }

  // Clamp selectedPalletIndex to valid range
  const safePalletIndex = palletResults.length > 0 ? Math.min(selectedPalletIndex, palletResults.length - 1) : 0;
  const currentPallet = palletResults[safePalletIndex] || null;

  // Center panel content
  const centerPanel = showContainerView && containerResult ? (
    <div className="flex-1 flex flex-col bg-white dark:bg-gray-900">
      <div className="flex-shrink-0 px-4 py-2.5 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-teal-50 dark:bg-teal-900/30 flex items-center justify-center">
            <svg className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6z" />
            </svg>
          </div>
          <h2 className="font-semibold text-sm text-gray-800 dark:text-white">
            {lang === 'tr' ? 'Konteyner' : 'Container'}
            <span className="text-xs font-normal text-gray-400 ml-1.5">
              {containerResult.containerType.name}
            </span>
          </h2>
        </div>
        <button
          onClick={() => setShowContainerView(false)}
          className="px-3 py-1.5 text-xs font-medium bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 transition-colors"
        >
          {lang === 'tr' ? 'Palete Dön' : 'Back to Pallet'}
        </button>
      </div>
      <div className="flex-1 p-2">
        <ContainerView3D containerResult={containerResult} />
      </div>
    </div>
  ) : (
    <PalletWorkspace
        palletResult={currentPallet}
        boxTypes={boxTypes}
        selectedPalletType={selectedPalletType}
        onPalletTypeChange={handlePalletTypeChange}
        onGenerate={handleGenerate}
        lang={lang}
      />
  );

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="h-screen flex flex-col overflow-hidden">
        {/* Header */}
        <header className="flex-shrink-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-3 md:px-4 h-11 md:h-12 flex items-center justify-between z-50">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg flex items-center justify-center shadow-sm shadow-emerald-500/20">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <h1 className="text-sm font-bold text-gray-800 dark:text-white leading-tight">
              Exportigo<span className="text-emerald-500 ml-0.5">Lite</span>
            </h1>
          </div>

          <div className="flex items-center gap-1.5 md:gap-2">
            {containerResult && (
              <button
                onClick={() => { setShowContainerView(!showContainerView); setMobileTab('workspace'); }}
                className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-lg transition-all ${
                  showContainerView
                    ? 'bg-teal-50 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300 ring-1 ring-teal-200 dark:ring-teal-800'
                    : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6z" />
                </svg>
                {lang === 'tr' ? 'Konteyner 3D' : 'Container 3D'}
              </button>
            )}

            <button
              onClick={() => setLang(lang === 'tr' ? 'en' : 'tr')}
              className="px-2.5 py-1 text-[11px] font-semibold bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-md transition-colors text-gray-500 dark:text-gray-400"
            >
              {lang === 'tr' ? 'EN' : 'TR'}
            </button>

            <div className="flex items-center gap-1.5 pl-1.5 border-l border-gray-200 dark:border-gray-700">
              {session.user?.image && (
                <Image
                  src={session.user.image}
                  alt=""
                  width={24}
                  height={24}
                  className="w-6 h-6 rounded-full ring-1 ring-gray-200 dark:ring-gray-700"
                />
              )}
              <span className="text-xs text-gray-600 dark:text-gray-400 hidden md:inline font-medium">
                {session.user?.name?.split(' ')[0]}
              </span>
              <button
                onClick={() => signOut()}
                className="px-1.5 py-0.5 text-[10px] text-gray-400 hover:text-red-500 transition-colors"
              >
                {lang === 'tr' ? 'Cikis' : 'Logout'}
              </button>
            </div>
          </div>
        </header>

        {/* Progress Stepper — Sleek inline */}
        <div className="flex-shrink-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-4 py-1.5 hidden md:flex items-center justify-center gap-0">
          {[
            { step: 1, label: lang === 'tr' ? 'Ürün Ekle' : 'Add Products', done: boxTypes.length > 0 && boxTypes.some(b => b.quantity > 0) },
            { step: 2, label: lang === 'tr' ? 'Palet Seç' : 'Select Pallet', done: !!selectedPalletType },
            { step: 3, label: lang === 'tr' ? 'Optimize Et' : 'Optimize', done: palletResults.length > 0 },
            { step: 4, label: lang === 'tr' ? 'Konteyner' : 'Container', done: !!containerResult },
          ].map(({ step, label, done }, idx) => (
            <div key={step} className="flex items-center">
              <div className="flex items-center gap-1.5">
                <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold transition-all ${
                  done
                    ? 'bg-emerald-500 text-white shadow-sm shadow-emerald-500/30'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500'
                }`}>
                  {done ? (
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : step}
                </div>
                <span className={`text-[11px] font-medium whitespace-nowrap ${
                  done ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-400 dark:text-gray-500'
                }`}>{label}</span>
              </div>
              {idx < 3 && (
                <div className={`w-6 h-px mx-2 ${done ? 'bg-emerald-400' : 'bg-gray-200 dark:bg-gray-700'}`} />
              )}
            </div>
          ))}
        </div>

        {/* Smart Summary Bar */}
        <SmartSummaryBar
          boxTypes={boxTypes}
          palletResults={palletResults}
          containerResult={containerResult}
          lang={lang}
        />

        {/* Desktop: 3-panel layout */}
        <div className="flex-1 hidden md:flex overflow-hidden">
          <ProductPanel
            products={boxTypes}
            quantities={quantities}
            onQuantityChange={handleQuantityChange}
            onAddProduct={handleAddProduct}
            onDeleteProduct={handleDeleteProduct}
            lang={lang}
          />
          {centerPanel}
          <StatsPanel
            palletResult={currentPallet}
            palletResults={palletResults}
            selectedPalletIndex={safePalletIndex}
            onSelectPallet={setSelectedPalletIndex}
            containerResult={containerResult}
            selectedContainerType={selectedContainerType}
            onContainerTypeChange={setSelectedContainerType}
            onGenerateContainer={handleGenerateContainer}
            onDuplicatePallet={handleDuplicatePallet}
            onRemovePallet={handleRemovePallet}
            onUpdateDuplicateCount={handleUpdateDuplicateCount}
            lang={lang}
          />
        </div>

        {/* Mobile: Tab-based layout */}
        <div className="flex-1 flex flex-col md:hidden overflow-hidden">
          {/* Mobile content area */}
          <div className="flex-1 overflow-hidden">
            {mobileTab === 'products' && (
              <div className="h-full overflow-y-auto">
                <ProductPanel
                  products={boxTypes}
                  quantities={quantities}
                  onQuantityChange={handleQuantityChange}
                  onAddProduct={handleAddProduct}
                  onDeleteProduct={handleDeleteProduct}
                  lang={lang}
                />
              </div>
            )}
            {mobileTab === 'workspace' && (
              <div className="h-full overflow-hidden">
                {centerPanel}
              </div>
            )}
            {mobileTab === 'stats' && (
              <div className="h-full overflow-y-auto">
                <StatsPanel
                  palletResult={currentPallet}
                  palletResults={palletResults}
                  selectedPalletIndex={safePalletIndex}
                  onSelectPallet={setSelectedPalletIndex}
                  containerResult={containerResult}
                  selectedContainerType={selectedContainerType}
                  onContainerTypeChange={setSelectedContainerType}
                  onGenerateContainer={handleGenerateContainer}
                  onDuplicatePallet={duplicatePallet}
                  onRemovePallet={removePallet}
                  onUpdateDuplicateCount={updateDuplicateCount}
                  lang={lang}
                />
              </div>
            )}
          </div>

          {/* Mobile bottom tab bar */}
          <div className="flex-shrink-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 flex safe-bottom">
            <button
              onClick={() => setMobileTab('products')}
              className={`flex-1 flex flex-col items-center py-2 gap-0.5 transition-colors ${
                mobileTab === 'products'
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : 'text-gray-400 dark:text-gray-500'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
              <span className="text-[10px] font-medium">
                {lang === 'tr' ? 'Urunler' : 'Products'}
              </span>
            </button>
            <button
              onClick={() => setMobileTab('workspace')}
              className={`flex-1 flex flex-col items-center py-2 gap-0.5 transition-colors ${
                mobileTab === 'workspace'
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : 'text-gray-400 dark:text-gray-500'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
              <span className="text-[10px] font-medium">
                {lang === 'tr' ? 'Palet' : 'Pallet'}
              </span>
            </button>
            <button
              onClick={() => setMobileTab('stats')}
              className={`flex-1 flex flex-col items-center py-2 gap-0.5 transition-colors ${
                mobileTab === 'stats'
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : 'text-gray-400 dark:text-gray-500'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <span className="text-[10px] font-medium">
                {lang === 'tr' ? 'Istatistik' : 'Stats'}
              </span>
            </button>
          </div>
        </div>
      </div>

      <DragOverlay dropAnimation={null}>
        {activeDrag && <DragOverlayContent product={activeDrag} />}
      </DragOverlay>
      <ToastContainer />
    </DndContext>
  );
}
