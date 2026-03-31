'use client';

import { useState, useCallback } from 'react';
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
import DragOverlayContent from '@/components/lite/DragOverlayContent';

const ContainerView3D = dynamic(() => import('@/components/lite/ContainerView3D'), { ssr: false });
const PalletWorkspace = dynamic(() => import('@/components/lite/PalletWorkspace'), { ssr: false });

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

  // Quantities state (separate from store for drag UX)
  const [quantities, setQuantities] = useState<Record<string, number>>(() => {
    const q: Record<string, number> = {};
    boxTypes.forEach(b => { q[b.id] = b.quantity; });
    return q;
  });

  // Active drag item
  const [activeDrag, setActiveDrag] = useState<BoxType | null>(null);

  // Show container 3D
  const [showContainerView, setShowContainerView] = useState(false);

  // DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    })
  );

  const handleQuantityChange = useCallback((id: string, qty: number) => {
    setQuantities(prev => ({ ...prev, [id]: qty }));
    updateBoxType(id, { quantity: qty });
  }, [updateBoxType]);

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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [addBoxType, updateBoxType]);

  const handleDeleteProduct = useCallback((id: string) => {
    removeBoxType(id);
    setQuantities(prev => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  }, [removeBoxType]);

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
    }, 50);
  }, [quantities, updateBoxType, generatePallets]);

  const handleGenerateContainer = useCallback(() => {
    generateContainer();
    setShowContainerView(true);
  }, [generateContainer]);

  // Auth loading state
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

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="h-screen flex flex-col overflow-hidden">
        {/* Top Header Bar */}
        <header className="flex-shrink-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-4 h-14 flex items-center justify-between z-50">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-800 dark:text-white leading-tight">
                Exportigo Lite
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {containerResult && (
              <button
                onClick={() => setShowContainerView(!showContainerView)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                  showContainerView
                    ? 'bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-300'
                    : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                }`}
              >
                {lang === 'tr' ? 'Konteyner 3D' : 'Container 3D'}
              </button>
            )}

            <button
              onClick={() => setLang(lang === 'tr' ? 'en' : 'tr')}
              className="px-3 py-1.5 text-xs font-medium bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors text-gray-600 dark:text-gray-400"
            >
              {lang === 'tr' ? 'EN' : 'TR'}
            </button>

            <div className="flex items-center gap-2">
              {session.user?.image && (
                <Image
                  src={session.user.image}
                  alt=""
                  width={28}
                  height={28}
                  className="w-7 h-7 rounded-full"
                />
              )}
              <span className="text-sm text-gray-600 dark:text-gray-400 hidden sm:inline">
                {session.user?.name?.split(' ')[0]}
              </span>
              <button
                onClick={() => signOut()}
                className="px-2 py-1 text-xs text-gray-400 hover:text-red-500 transition-colors"
              >
                {lang === 'tr' ? 'Cikis' : 'Logout'}
              </button>
            </div>
          </div>
        </header>

        {/* Main Content: 3 Panel Layout */}
        <div className="flex-1 flex overflow-hidden">
          <ProductPanel
            products={boxTypes}
            quantities={quantities}
            onQuantityChange={handleQuantityChange}
            onAddProduct={handleAddProduct}
            onDeleteProduct={handleDeleteProduct}
            lang={lang}
          />

          {showContainerView && containerResult ? (
            <div className="flex-1 flex flex-col bg-white dark:bg-gray-850">
              <div className="flex-shrink-0 p-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
                <h2 className="font-semibold text-gray-800 dark:text-white">
                  {lang === 'tr' ? 'Konteyner Gorunumu' : 'Container View'}
                  <span className="text-sm font-normal text-gray-500 ml-2">
                    ({containerResult.containerType.name})
                  </span>
                </h2>
                <button
                  onClick={() => setShowContainerView(false)}
                  className="px-3 py-1.5 text-xs bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400"
                >
                  {lang === 'tr' ? 'Palete Don' : 'Back to Pallet'}
                </button>
              </div>
              <div className="flex-1 p-4">
                <ContainerView3D containerResult={containerResult} />
              </div>
            </div>
          ) : (
            <PalletWorkspace
              palletResult={palletResults[0] || null}
              boxTypes={boxTypes}
              selectedPalletType={selectedPalletType}
              onPalletTypeChange={setSelectedPalletType}
              onGenerate={handleGenerate}
              lang={lang}
            />
          )}

          <StatsPanel
            palletResult={palletResults[0] || null}
            palletResults={palletResults}
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
      </div>

      <DragOverlay dropAnimation={null}>
        {activeDrag && <DragOverlayContent product={activeDrag} />}
      </DragOverlay>
    </DndContext>
  );
}
