// =============================================
// Exportigo Lite — Core Type Definitions
// =============================================

export interface BoxType {
  id: string;
  label: string;
  length: number;  // cm
  width: number;   // cm
  height: number;  // cm
  weight: number;  // kg
  maxStack: number; // max boxes on top of this one
  quantity: number;
  color: string;
}

export interface PlacedBox {
  boxTypeId: string;
  label: string;
  x: number;  // cm from pallet origin
  y: number;  // cm from pallet origin
  z: number;  // cm from pallet origin (height)
  length: number;
  width: number;
  height: number;
  weight: number;
  color: string;
  layer: number;
  rotated: boolean;
}

export interface PalletType {
  id: string;
  name: string;
  length: number;  // mm
  width: number;   // mm
  maxWeight: number; // kg
  maxHeight: number; // cm
}

export interface PalletResult {
  id: string;
  palletType: PalletType;
  boxes: PlacedBox[];
  layers: number;
  totalWeight: number;
  totalVolume: number;   // cm³
  palletVolume: number;  // cm³ (available)
  usedArea: number;      // cm² per layer average
  palletArea: number;    // cm²
  weightCapacity: number;
  remainingWeight: number;
  remainingVolume: number;
  fillPercentVolume: number;
  fillPercentWeight: number;
  sameBoxFitCount: number; // how many more of the most common box could fit
  duplicateCount: number;
}

export interface ContainerType {
  id: string;
  name: string;
  lengthMM: number;
  widthMM: number;
  heightMM: number;
  volume: number;    // m³
  maxWeight: number; // ton
}

export interface PlacedPallet {
  palletResultId: string;
  x: number; // mm
  y: number; // mm
  z: number; // mm
  rotated: boolean;
}

export interface ContainerResult {
  containerType: ContainerType;
  pallets: PlacedPallet[];
  totalPallets: number;
  totalWeight: number;  // kg
  totalVolume: number;  // m³
  fillPercentVolume: number;
  fillPercentWeight: number;
  remainingWeight: number; // kg
  remainingVolume: number; // m³
  morePalletsFit: number;
}

export type ViewMode = '3d' | '2d';
export type AppStep = 'input' | 'pallet' | 'container' | 'result';
export type Lang = 'tr' | 'en';
