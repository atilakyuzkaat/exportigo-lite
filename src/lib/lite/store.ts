import { create } from 'zustand';
import {
  BoxType, PalletType, PalletResult, ContainerType, ContainerResult,
  AppStep, ViewMode, Lang,
} from './types';
import { PALLET_TYPES } from './palletTypes';
import { CONTAINER_TYPES } from './containerTypes';
import { packPallets, packContainer } from './packingLite';

function genId() {
  return Math.random().toString(36).substring(2, 10);
}

interface LiteStore {
  // Language
  lang: Lang;
  setLang: (l: Lang) => void;

  // Navigation
  step: AppStep;
  setStep: (s: AppStep) => void;

  // Box input
  boxTypes: BoxType[];
  addBoxType: () => void;
  updateBoxType: (id: string, updates: Partial<BoxType>) => void;
  removeBoxType: (id: string) => void;
  importBoxTypes: (boxes: Omit<BoxType, 'id' | 'color'>[]) => void;

  // Pallet
  selectedPalletType: PalletType;
  setSelectedPalletType: (pt: PalletType) => void;
  palletResults: PalletResult[];
  generatePallets: () => void;
  duplicatePallet: (id: string) => void;
  updateDuplicateCount: (id: string, count: number) => void;
  removePallet: (id: string) => void;

  // Container
  selectedContainerType: ContainerType;
  setSelectedContainerType: (ct: ContainerType) => void;
  containerResult: ContainerResult | null;
  generateContainer: () => void;

  // View
  viewMode: ViewMode;
  setViewMode: (m: ViewMode) => void;
  highlightedLayer: number | null;
  setHighlightedLayer: (l: number | null) => void;
}

const BOX_COLORS = [
  '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
  '#EC4899', '#06B6D4', '#84CC16', '#F97316', '#6366F1',
];

export const useLiteStore = create<LiteStore>((set, get) => ({
  lang: 'tr',
  setLang: (l) => set({ lang: l }),

  step: 'input',
  setStep: (s) => set({ step: s }),

  boxTypes: [
    {
      id: genId(),
      label: 'Koli 1',
      length: 40,
      width: 50,
      height: 30,
      weight: 45,
      maxStack: 7,
      quantity: 10,
      color: BOX_COLORS[0],
    },
  ],

  addBoxType: () => set((s) => ({
    boxTypes: [...s.boxTypes, {
      id: genId(),
      label: `Koli ${s.boxTypes.length + 1}`,
      length: 40,
      width: 30,
      height: 30,
      weight: 20,
      maxStack: 5,
      quantity: 1,
      color: BOX_COLORS[s.boxTypes.length % BOX_COLORS.length],
    }],
  })),

  updateBoxType: (id, updates) => set((s) => ({
    boxTypes: s.boxTypes.map(b => b.id === id ? { ...b, ...updates } : b),
  })),

  removeBoxType: (id) => set((s) => ({
    boxTypes: s.boxTypes.filter(b => b.id !== id),
  })),

  importBoxTypes: (boxes) => set(() => ({
    boxTypes: boxes.map((b, i) => ({
      ...b,
      id: genId(),
      color: BOX_COLORS[i % BOX_COLORS.length],
    })),
  })),

  selectedPalletType: PALLET_TYPES[0],
  setSelectedPalletType: (pt) => set({ selectedPalletType: pt }),

  palletResults: [],
  generatePallets: () => {
    const { boxTypes, selectedPalletType } = get();
    const results = packPallets(boxTypes, selectedPalletType);
    set({ palletResults: results, step: 'pallet' });
  },

  duplicatePallet: (id) => set((s) => ({
    palletResults: s.palletResults.map(p =>
      p.id === id ? { ...p, duplicateCount: p.duplicateCount + 1 } : p
    ),
  })),

  updateDuplicateCount: (id, count) => set((s) => ({
    palletResults: s.palletResults.map(p =>
      p.id === id ? { ...p, duplicateCount: Math.max(1, count) } : p
    ),
  })),

  removePallet: (id) => set((s) => ({
    palletResults: s.palletResults.filter(p => p.id !== id),
  })),

  selectedContainerType: CONTAINER_TYPES[2], // 40'HC default
  setSelectedContainerType: (ct) => set({ selectedContainerType: ct }),

  containerResult: null,
  generateContainer: () => {
    const { palletResults, selectedContainerType } = get();
    const result = packContainer(palletResults, selectedContainerType);
    set({ containerResult: result, step: 'container' });
  },

  viewMode: '3d',
  setViewMode: (m) => set({ viewMode: m }),

  highlightedLayer: null,
  setHighlightedLayer: (l) => set({ highlightedLayer: l }),
}));
