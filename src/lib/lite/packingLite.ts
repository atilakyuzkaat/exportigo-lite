// =============================================
// Exportigo Lite — Layer-Based Packing Algorithm
// =============================================
import { BoxType, PlacedBox, PalletType, PalletResult } from './types';

const BOX_COLORS = [
  '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
  '#EC4899', '#06B6D4', '#84CC16', '#F97316', '#6366F1',
  '#14B8A6', '#E11D48', '#A855F7', '#0EA5E9', '#D946EF',
];

function generateId(): string {
  return Math.random().toString(36).substring(2, 10);
}

/**
 * Expand box types into individual boxes by quantity, sorted by:
 * 1. Weight (desc) — heavy boxes go to bottom
 * 2. Base area (desc) — large footprint first
 */
function expandAndSort(boxTypes: BoxType[]): Array<BoxType & { originalIndex: number }> {
  const expanded: Array<BoxType & { originalIndex: number }> = [];
  boxTypes.forEach((bt, idx) => {
    for (let i = 0; i < bt.quantity; i++) {
      expanded.push({ ...bt, color: BOX_COLORS[idx % BOX_COLORS.length], originalIndex: idx });
    }
  });

  expanded.sort((a, b) => {
    const weightDiff = b.weight - a.weight;
    if (Math.abs(weightDiff) > 0.1) return weightDiff;
    return (b.length * b.width) - (a.length * a.width);
  });

  return expanded;
}

interface LayerCell {
  x: number;
  y: number;
  length: number;
  width: number;
  height: number;
  weight: number;
  boxTypeId: string;
  label: string;
  color: string;
  rotated: boolean;
  maxStack: number;
}

/**
 * Pack boxes into a single layer using 2D guillotine bin-packing.
 * Returns placed cells and remaining (unplaced) boxes.
 */
function packLayer(
  boxes: Array<BoxType & { originalIndex: number }>,
  palletLengthCm: number,
  palletWidthCm: number
): { cells: LayerCell[]; remaining: Array<BoxType & { originalIndex: number }> } {
  const cells: LayerCell[] = [];
  const remaining: Array<BoxType & { originalIndex: number }> = [];

  // Available rectangular spaces, start with full pallet area
  const spaces = [{ x: 0, y: 0, w: palletLengthCm, h: palletWidthCm }];

  for (const box of boxes) {
    let placed = false;

    // Try both orientations
    const orientations = [
      { l: box.length, w: box.width, rotated: false },
      { l: box.width, w: box.length, rotated: true },
    ];

    for (const orient of orientations) {
      // Find first space that fits
      for (let si = 0; si < spaces.length; si++) {
        const space = spaces[si];
        if (orient.l <= space.w && orient.w <= space.h) {
          cells.push({
            x: space.x,
            y: space.y,
            length: orient.l,
            width: orient.w,
            height: box.height,
            weight: box.weight,
            boxTypeId: box.id,
            label: box.label,
            color: box.color,
            rotated: orient.rotated,
            maxStack: box.maxStack,
          });

          // Split remaining space (guillotine cut)
          const newSpaces = [];

          // Right of placed box
          if (space.w - orient.l > 0) {
            newSpaces.push({
              x: space.x + orient.l,
              y: space.y,
              w: space.w - orient.l,
              h: space.h,
            });
          }

          // Above placed box
          if (space.h - orient.w > 0) {
            newSpaces.push({
              x: space.x,
              y: space.y + orient.w,
              w: orient.l,
              h: space.h - orient.w,
            });
          }

          spaces.splice(si, 1, ...newSpaces);
          // Sort spaces: best fit (smallest area first)
          spaces.sort((a, b) => (a.w * a.h) - (b.w * b.h));
          placed = true;
          break;
        }
      }
      if (placed) break;
    }

    if (!placed) {
      remaining.push(box);
    }
  }

  return { cells, remaining };
}

/**
 * Main pallet packing function.
 * Takes box types and a pallet type, returns one or more PalletResults.
 */
export function packPallets(boxTypes: BoxType[], palletType: PalletType): PalletResult[] {
  if (boxTypes.length === 0) return [];

  // Pallet dimensions: length/width are in mm, convert to cm
  const palletLengthCm = palletType.length / 10;
  const palletWidthCm = palletType.width / 10;
  const palletArea = palletLengthCm * palletWidthCm; // cm²
  const palletVolume = palletArea * palletType.maxHeight; // cm³ (maxHeight is already in cm)

  let boxes = expandAndSort(boxTypes);
  const results: PalletResult[] = [];

  while (boxes.length > 0) {
    const placedBoxes: PlacedBox[] = [];
    let currentZ = 0;  // cm from pallet top surface
    let totalWeight = 0;
    let layerIndex = 0;

    let remainingForPallet = [...boxes];

    while (remainingForPallet.length > 0) {
      // Check height limit
      if (currentZ >= palletType.maxHeight) break;

      // Check weight limit
      if (totalWeight >= palletType.maxWeight) break;

      const availableHeight = palletType.maxHeight - currentZ;
      const availableWeight = palletType.maxWeight - totalWeight;

      // Filter boxes that fit in remaining height and weight
      const fittingBoxes = remainingForPallet.filter(
        b => b.height <= availableHeight && b.weight <= availableWeight
      );

      if (fittingBoxes.length === 0) break;

      // Check stacking limits: use layer-based approach
      // maxStack represents how many layers this box type can be stacked
      // If we're on layer N, only allow boxes whose maxStack >= N+1
      const stackableBoxes = fittingBoxes.filter(b => b.maxStack > layerIndex);

      if (stackableBoxes.length === 0) break;

      const { cells } = packLayer(stackableBoxes, palletLengthCm, palletWidthCm);

      if (cells.length === 0) break;

      // Determine this layer's height (tallest box in layer)
      const layerHeight = Math.max(...cells.map(c => c.height));
      const layerWeight = cells.reduce((sum, c) => sum + c.weight, 0);

      // Check if adding this layer exceeds limits
      if (currentZ + layerHeight > palletType.maxHeight) break;
      if (totalWeight + layerWeight > palletType.maxWeight) break;

      // Place boxes
      for (const cell of cells) {
        placedBoxes.push({
          boxTypeId: cell.boxTypeId,
          label: cell.label,
          x: cell.x,
          y: cell.y,
          z: currentZ,
          length: cell.length,
          width: cell.width,
          height: cell.height,
          weight: cell.weight,
          color: cell.color,
          layer: layerIndex,
          rotated: cell.rotated,
        });
      }

      currentZ += layerHeight;
      totalWeight += layerWeight;
      layerIndex++;

      // Remove placed boxes from remaining
      const placedCounts = new Map<string, number>();
      cells.forEach(c => {
        placedCounts.set(c.boxTypeId, (placedCounts.get(c.boxTypeId) || 0) + 1);
      });

      const newRemaining: typeof remainingForPallet = [];
      const removedCounts = new Map<string, number>();

      for (const box of remainingForPallet) {
        const removed = removedCounts.get(box.id) || 0;
        const toRemove = placedCounts.get(box.id) || 0;
        if (removed < toRemove) {
          removedCounts.set(box.id, removed + 1);
          continue; // This box was placed
        }
        newRemaining.push(box);
      }

      remainingForPallet = newRemaining;
    }

    if (placedBoxes.length === 0) {
      // No boxes could be placed — avoid infinite loop
      break;
    }

    const usedVolume = placedBoxes.reduce(
      (sum, b) => sum + b.length * b.width * b.height,
      0
    );

    // Calculate "same box fit count" — how many more of the most common box could fit
    const boxTypeCounts = new Map<string, number>();
    placedBoxes.forEach(b => {
      boxTypeCounts.set(b.boxTypeId, (boxTypeCounts.get(b.boxTypeId) || 0) + 1);
    });
    let mostCommonType = boxTypes[0];
    let maxCount = 0;
    boxTypeCounts.forEach((count, id) => {
      if (count > maxCount) {
        maxCount = count;
        mostCommonType = boxTypes.find(bt => bt.id === id) || boxTypes[0];
      }
    });

    const remainVol = palletVolume - usedVolume;
    const remainWt = palletType.maxWeight - totalWeight;
    const singleBoxVol = mostCommonType.length * mostCommonType.width * mostCommonType.height;
    const sameBoxFitByVol = singleBoxVol > 0 ? Math.floor(remainVol / singleBoxVol) : 0;
    const sameBoxFitByWt = mostCommonType.weight > 0 ? Math.floor(remainWt / mostCommonType.weight) : 0;
    const sameBoxFitCount = Math.min(sameBoxFitByVol, sameBoxFitByWt);

    results.push({
      id: generateId(),
      palletType,
      boxes: placedBoxes,
      layers: layerIndex,
      totalWeight,
      totalVolume: usedVolume,
      palletVolume,
      usedArea: layerIndex > 0
        ? placedBoxes.reduce((s, b) => s + b.length * b.width, 0) / layerIndex
        : 0,
      palletArea,
      weightCapacity: palletType.maxWeight,
      remainingWeight: remainWt,
      remainingVolume: remainVol,
      fillPercentVolume: palletVolume > 0 ? Math.round((usedVolume / palletVolume) * 100) : 0,
      fillPercentWeight: palletType.maxWeight > 0 ? Math.round((totalWeight / palletType.maxWeight) * 100) : 0,
      sameBoxFitCount: Math.max(0, sameBoxFitCount),
      duplicateCount: 1,
    });

    // Move to next pallet with remaining boxes
    boxes = remainingForPallet;
  }

  return results;
}

/**
 * Place pallets inside a container using simple grid layout.
 * All pallet dimensions are in mm, container dimensions in mm.
 */
export function packContainer(
  palletResults: PalletResult[],
  containerType: import('./types').ContainerType
): import('./types').ContainerResult {
  const placedPallets: import('./types').PlacedPallet[] = [];

  // Expand duplicated pallets
  const allPallets: PalletResult[] = [];
  palletResults.forEach(pr => {
    for (let i = 0; i < pr.duplicateCount; i++) {
      allPallets.push(pr);
    }
  });

  const contL = containerType.lengthMM;
  const contW = containerType.widthMM;
  const contH = containerType.heightMM;
  const maxWeightKg = containerType.maxWeight;

  let totalWeight = 0;
  let currentX = 0;
  let currentY = 0;
  let rowMaxWidth = 0; // track widest pallet in current row

  const GAP_MM = 20; // 20mm gap between pallets

  for (const pallet of allPallets) {
    const pLenMM = pallet.palletType.length;
    const pWidMM = pallet.palletType.width;
    // Pallet total height: base (~150mm) + load height
    // maxHeight is in cm, convert to mm
    const palletHeightMM = 150 + pallet.palletType.maxHeight * 10;

    // Check weight
    if (totalWeight + pallet.totalWeight > maxWeightKg) continue;

    // Check if pallet fits in container height
    if (palletHeightMM > contH) continue;

    // Try normal orientation
    let fitNormal = (currentX + pLenMM <= contL) && (currentY + pWidMM <= contW);
    // Try rotated
    let fitRotated = (currentX + pWidMM <= contL) && (currentY + pLenMM <= contW);

    let rotated = false;
    let usedL = pLenMM;
    let usedW = pWidMM;

    if (fitNormal) {
      // Use normal
    } else if (fitRotated) {
      rotated = true;
      usedL = pWidMM;
      usedW = pLenMM;
    } else {
      // Try next row
      currentY += rowMaxWidth + GAP_MM;
      currentX = 0;
      rowMaxWidth = 0;

      fitNormal = (currentX + pLenMM <= contL) && (currentY + pWidMM <= contW);
      fitRotated = (currentX + pWidMM <= contL) && (currentY + pLenMM <= contW);

      if (fitNormal) {
        usedL = pLenMM;
        usedW = pWidMM;
      } else if (fitRotated) {
        rotated = true;
        usedL = pWidMM;
        usedW = pLenMM;
      } else {
        continue; // Doesn't fit
      }
    }

    placedPallets.push({
      palletResultId: pallet.id,
      x: currentX,
      y: currentY,
      z: 0,
      rotated,
    });

    totalWeight += pallet.totalWeight;
    currentX += usedL + GAP_MM;
    rowMaxWidth = Math.max(rowMaxWidth, usedW);
  }

  // Calculate actual volume used by placed pallets (real box volume, not pallet capacity)
  const placedPalletResults = placedPallets.map(pp =>
    allPallets.find(p => p.id === pp.palletResultId)
  ).filter(Boolean) as PalletResult[];

  // Convert box volume from cm³ to m³
  const totalVolumeUsedM3 = placedPalletResults.reduce((sum, pr) => {
    return sum + pr.totalVolume / 1_000_000; // cm³ → m³
  }, 0);

  const contVolume = containerType.volume; // m³

  // How many more pallets of the first type could fit
  const samplePallet = allPallets[0];
  let moreFit = 0;
  if (samplePallet) {
    // Use actual pallet footprint volume (not just box volume)
    const singlePalletVolM3 = (samplePallet.palletType.length / 1000) *
      (samplePallet.palletType.width / 1000) * (samplePallet.palletType.maxHeight / 100);
    const usedFootprintVol = placedPalletResults.reduce((sum, pr) => {
      return sum + (pr.palletType.length / 1000) * (pr.palletType.width / 1000) * (pr.palletType.maxHeight / 100);
    }, 0);
    const remainVol = contVolume - usedFootprintVol;
    const remainWt = maxWeightKg - totalWeight;
    moreFit = Math.min(
      singlePalletVolM3 > 0 ? Math.floor(remainVol / singlePalletVolM3) : 0,
      samplePallet.totalWeight > 0 ? Math.floor(remainWt / samplePallet.totalWeight) : 0
    );
  }

  return {
    containerType,
    pallets: placedPallets,
    totalPallets: placedPallets.length,
    totalWeight,
    totalVolume: totalVolumeUsedM3,
    fillPercentVolume: contVolume > 0 ? Math.round((totalVolumeUsedM3 / contVolume) * 100) : 0,
    fillPercentWeight: maxWeightKg > 0 ? Math.round((totalWeight / maxWeightKg) * 100) : 0,
    remainingWeight: maxWeightKg - totalWeight,
    remainingVolume: Math.round((contVolume - totalVolumeUsedM3) * 100) / 100,
    morePalletsFit: Math.max(0, moreFit),
  };
}
