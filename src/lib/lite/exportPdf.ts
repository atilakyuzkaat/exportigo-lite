import { PalletResult, ContainerResult, BoxType } from './types';

export function generatePackingListHTML(
  palletResults: PalletResult[],
  containerResult: ContainerResult | null,
  boxTypes: BoxType[],
  lang: 'tr' | 'en'
): string {
  const t = (tr: string, en: string) => (lang === 'tr' ? tr : en);
  const now = new Date().toLocaleDateString(lang === 'tr' ? 'tr-TR' : 'en-US', {
    year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
  });

  const totalBoxes = palletResults.reduce((sum, p) => sum + p.boxes.length * p.duplicateCount, 0);
  const totalWeight = palletResults.reduce((sum, p) => sum + p.totalWeight * p.duplicateCount, 0);
  const totalPallets = palletResults.reduce((sum, p) => sum + p.duplicateCount, 0);

  let html = `<!DOCTYPE html><html><head><meta charset="utf-8">
<title>Exportigo Lite — Packing List</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; color: #1a1a1a; padding: 40px; font-size: 13px; }
  .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 30px; border-bottom: 3px solid #10b981; padding-bottom: 15px; }
  .header h1 { font-size: 22px; color: #10b981; }
  .header .date { color: #666; font-size: 12px; }
  .summary { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 25px; }
  .summary-card { background: #f8fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 12px; text-align: center; }
  .summary-card .label { font-size: 11px; color: #666; margin-bottom: 4px; }
  .summary-card .value { font-size: 20px; font-weight: 700; color: #111; }
  .summary-card .unit { font-size: 11px; color: #999; }
  h2 { font-size: 15px; color: #333; margin: 20px 0 10px; padding-bottom: 5px; border-bottom: 1px solid #e5e7eb; }
  table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
  th { background: #f3f4f6; color: #374151; font-size: 11px; font-weight: 600; text-align: left; padding: 8px 10px; border: 1px solid #e5e7eb; }
  td { padding: 7px 10px; border: 1px solid #e5e7eb; font-size: 12px; }
  tr:nth-child(even) { background: #fafafa; }
  .fill-bar { display: inline-block; height: 8px; border-radius: 4px; }
  .fill-green { background: #10b981; }
  .fill-amber { background: #f59e0b; }
  .fill-red { background: #ef4444; }
  .footer { margin-top: 30px; padding-top: 15px; border-top: 1px solid #e5e7eb; color: #999; font-size: 11px; text-align: center; }
  @media print { body { padding: 20px; } }
</style></head><body>`;

  // Header
  html += `<div class="header"><div><h1>Exportigo Lite</h1><div style="color:#666;font-size:13px;margin-top:4px;">${t('Yükleme Planı', 'Packing List')}</div></div><div class="date">${now}</div></div>`;

  // Summary cards
  html += `<div class="summary">`;
  html += `<div class="summary-card"><div class="label">${t('Toplam Koli', 'Total Boxes')}</div><div class="value">${totalBoxes}</div><div class="unit">${t('adet', 'pcs')}</div></div>`;
  html += `<div class="summary-card"><div class="label">${t('Toplam Palet', 'Total Pallets')}</div><div class="value">${totalPallets}</div><div class="unit">${t('adet', 'pcs')}</div></div>`;
  html += `<div class="summary-card"><div class="label">${t('Toplam Ağırlık', 'Total Weight')}</div><div class="value">${totalWeight.toFixed(0)}</div><div class="unit">kg</div></div>`;
  if (containerResult) {
    html += `<div class="summary-card"><div class="label">${t('Konteyner', 'Container')}</div><div class="value">${containerResult.fillPercentVolume.toFixed(0)}%</div><div class="unit">${containerResult.containerType.name}</div></div>`;
  } else {
    html += `<div class="summary-card"><div class="label">${t('Konteyner', 'Container')}</div><div class="value">—</div><div class="unit">${t('Henüz yüklenmedi', 'Not loaded')}</div></div>`;
  }
  html += `</div>`;

  // Products table
  html += `<h2>${t('Ürün Listesi', 'Product List')}</h2>`;
  html += `<table><thead><tr><th>#</th><th>${t('Ürün', 'Product')}</th><th>${t('Boyut (cm)', 'Size (cm)')}</th><th>${t('Ağırlık', 'Weight')}</th><th>${t('Max İstif', 'Max Stack')}</th><th>${t('Adet', 'Qty')}</th></tr></thead><tbody>`;
  boxTypes.forEach((b, i) => {
    html += `<tr><td>${i + 1}</td><td><strong>${b.label}</strong></td><td>${b.length}×${b.width}×${b.height}</td><td>${b.weight} kg</td><td>${b.maxStack}</td><td>${b.quantity}</td></tr>`;
  });
  html += `</tbody></table>`;

  // Pallets table
  html += `<h2>${t('Palet Detayları', 'Pallet Details')}</h2>`;
  html += `<table><thead><tr><th>#</th><th>${t('Palet Tipi', 'Pallet Type')}</th><th>${t('Koli', 'Boxes')}</th><th>${t('Kat', 'Layers')}</th><th>${t('Ağırlık', 'Weight')}</th><th>${t('Doluluk', 'Fill %')}</th><th>${t('Kopya', 'Copies')}</th></tr></thead><tbody>`;
  palletResults.forEach((p, i) => {
    const fillClass = p.fillPercentVolume >= 80 ? 'fill-green' : p.fillPercentVolume >= 50 ? 'fill-amber' : 'fill-red';
    html += `<tr><td>${i + 1}</td><td>${p.palletType.name}</td><td>${p.boxes.length}</td><td>${p.layers}</td><td>${p.totalWeight.toFixed(0)} kg</td><td><span class="fill-bar ${fillClass}" style="width:${Math.min(100, p.fillPercentVolume)}px"></span> ${p.fillPercentVolume.toFixed(1)}%</td><td>×${p.duplicateCount}</td></tr>`;
  });
  html += `</tbody></table>`;

  // Container info
  if (containerResult) {
    html += `<h2>${t('Konteyner Bilgileri', 'Container Info')}</h2>`;
    html += `<table><tbody>`;
    html += `<tr><td><strong>${t('Konteyner Tipi', 'Type')}</strong></td><td>${containerResult.containerType.name}</td></tr>`;
    html += `<tr><td><strong>${t('Hacim Doluluk', 'Volume Fill')}</strong></td><td>${containerResult.fillPercentVolume.toFixed(1)}%</td></tr>`;
    html += `<tr><td><strong>${t('Ağırlık Doluluk', 'Weight Fill')}</strong></td><td>${containerResult.fillPercentWeight.toFixed(1)}%</td></tr>`;
    html += `<tr><td><strong>${t('Yüklenen Palet', 'Loaded Pallets')}</strong></td><td>${containerResult.totalPallets}</td></tr>`;
    html += `<tr><td><strong>${t('Kalan Hacim', 'Remaining Vol')}</strong></td><td>${containerResult.remainingVolume.toFixed(2)} m³</td></tr>`;
    html += `<tr><td><strong>${t('Kalan Ağırlık', 'Remaining Wt')}</strong></td><td>${(containerResult.remainingWeight / 1000).toFixed(1)} ton</td></tr>`;
    html += `<tr><td><strong>${t('Daha Sığacak Palet', 'More Pallets Fit')}</strong></td><td>${containerResult.morePalletsFit}</td></tr>`;
    html += `</tbody></table>`;
  }

  // Footer
  html += `<div class="footer">${t('Bu rapor Exportigo Lite tarafından oluşturulmuştur.', 'Generated by Exportigo Lite.')} — ${now}</div>`;
  html += `</body></html>`;

  return html;
}

export function exportPackingList(
  palletResults: PalletResult[],
  containerResult: ContainerResult | null,
  boxTypes: BoxType[],
  lang: 'tr' | 'en'
) {
  const html = generatePackingListHTML(palletResults, containerResult, boxTypes, lang);
  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(html);
    printWindow.document.close();
    setTimeout(() => printWindow.print(), 500);
  }
}
