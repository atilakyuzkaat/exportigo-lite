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
 * Pack boxes into a single layer using simple 2D shelf algorithm.
 * Returns placed cells and remaining (unplaced) boxes.
 */
function packLayer(
  boxes: Array<BoxType & { originalIndex: number }>,
  palletLengthCm: number,
  palletWidthCm: number
): { cells: LayerCell[]; remaining: Array<BoxType & { originalIndex: number }> } {
  const cells: LayerCell[] = [];
  const remaining: Array<BoxType & { originalIndex: number }> = [];

  // Track available spaces: list of rectangles
  // Start with the full pallet area
  const spaces = [{ x: 0, y: 0, w: palletLengthCm, h: palletWidthCm }];

  for (const box of boxes) {
    let placed = false;

    // Try both orientations
    const orientations = [
      { l: box.length, w: box.width },
      { l: box.width, w: box.length },
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
            rotated: orient.l !== box.length,
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
          // Sort spaces by area (smallest first — best fit)
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

  const palletLengthCm = palletType.length / 10;
  const palletWidthCm = palletType.width / 10;
  const palletArea = palletLengthCm * palletWidthCm;
  const palletVolume = palletArea * palletType.maxHeight;

  let boxes = expandAndSort(boxTypes);
  const results: PalletResult[] = [];

  while (boxes.length > 0) {
    const placedBoxes: PlacedBox[] = [];
    let currentZ = 0;
    let totalWeight = 0;
    let layerIndex = 0;

    // Track stack counts per column position
    const stackCounts = new Map<string, { count: number; maxStack: number }>();

    let remainingForPallet = [...boxes];

    while (remainingForPallet.length > 0) {
      // Check height limit
      if (currentZ >= palletType.maxHeight) break;

      // Check weight limit
      if (totalWeight >= palletType.maxWeight) break;

      const availableHeight = palletType.maxHeight - currentZ;
      const availableWeight = palletType.maxWeight - totalWeight;

      // Filter boxes that can fit in remaining height and weight
      const fittingBoxes = remainingForPallet.filter(
        b => b.height <= availableHeight && b.weight <= availableWeight
      );

      if (fittingBoxes.length === 0) break;

      // Check stacking limits: for this layer, check if bottom layers allow more stacking
      // We use a simplified approach: track max layers per bottom box position
      const { cells } = packLayer(fittingBoxes, palletLengthCm, palletWidthCm);

      if (cells.length === 0) break;

      // Check stacking constraints
      let layerAllowed = true;
      if (layerIndex > 0) {
        // Check if any position below has reached its max stack
        for (const cell of cells) {
          const key = `${Math.round(cell.x)}-${Math.round(cell.y)}`;
          const stack = stackCounts.get(key);
          if (stack && stack.count >= stack.maxStack) {
            layerAllowed = false;
            break;
          }
        }
      }

      if (!layerAllowed) break;

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

        // Update stack counts
        const key = `${Math.round(cell.x)}-${Math.round(cell.y)}`;
        const existing = stackCounts.get(key);
        if (existing) {
          existing.count++;
        } else {
          stackCounts.set(key, { count: 1, maxStack: cell.maxStack });
        }
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
    const sameBoxFitByVol = Math.floor(remainVol / singleBoxVol);
    const sameBoxFitByWt = Math.floor(remainWt / mostCommonType.weight);
    const sameBoxFitCount = Math.min(sameBoxFitByVol, sameBoxFitByWt);

    results.push({
      id: generateId(),
      palletType,
      boxes: placedBoxes,
      layers: layerIndex,
      totalWeight,
      totalVolume: usedVolume,
      palletVolume,
      usedArea: placedBoxes.length > 0
        ? placedBoxes.reduce((s, b) => s + b.length * b.width, 0) / layerIndex
        : 0,
      palletArea,
      weightCapacity: palletType.maxWeight,
      remainingWeight: remainWt,
      remainingVolume: remainVol,
      fillPercentVolume: Math.round((usedVolume / palletVolume) * 100),
      fillPercentWeight: Math.round((totalWeight / palletType.maxWeight) * 100),
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
  let rowMaxLength = 0;

  for (const pallet of allPallets) {
    const pLenMM = pallet.palletType.length;
    const pWidMM = pallet.palletType.width;
    const pHeightMM = pallet.palletType.maxHeight * 10; // cm to mm

    // Check weight
    if (totalWeight + pallet.totalWeight > maxWeightKg) continue;

    // Check if pallet fits in container height
    if (pHeightMM > contH) continue;

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
      currentY += rowMaxLength;
      currentX = 0;
      rowMaxLength = 0;

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
    currentX += usedL + 20; // 20mm gap
    rowMaxLength = Math.max(rowMaxLength, usedW + 20);
  }

  // Calculate total volume used
  const totalVolumeUsed = allPallets
    .filter((_, i) => i < placedPallets.length)
    .reduce((s, p) => {
      const vol = (p.palletType.length / 1000) * (p.palletType.width / 1000) * (p.palletType.maxHeight / 100);
      return s + vol;
    }, 0);

  const contVolume = containerType.volume;

  // How many more pallets of the first type could fit
  const samplePallet = allPallets[0];
  let moreFit = 0;
  if (samplePallet) {
    const singlePalletVol = (samplePallet.palletType.length / 1000) *
      (samplePallet.palletType.width / 1000) * (samplePallet.palletType.maxHeight / 100);
    const remainVol = contVolume - totalVolumeUsed;
    const remainWt = maxWeightKg - totalWeight;
    moreFit = Math.min(
      Math.floor(remainVol / singlePalletVol),
      Math.floor(remainWt / (samplePallet.totalWeight || 1))
    );
  }

  return {
    containerType,
    pallets: placedPallets,
    totalPallets: placedPallets.length,
    totalWeight,
    totalVolume: totalVolumeUsed,
    fillPercentVolume: Math.round((totalVolumeUsed / contVolume) * 100),
    fillPercentWeight: Math.round((totalWeight / maxWeightKg) * 100),
    remainingWeight: maxWeightKg - totalWeight,
    remainingVolume: Math.round((contVolume - totalVolumeUsed) * 100) / 100,
    morePalletsFit: Math.max(0, moreFit),
  };
}
