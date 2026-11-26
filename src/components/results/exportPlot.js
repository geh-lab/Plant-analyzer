import { downloadFile } from '@/utils/resultData';
import { xmlLabel } from '@/utils/distributionPlot';

export function downloadPlot(svg, name) {
  if (!svg) return;
  const copy = svg.cloneNode(true);
  copy.removeAttribute('class');
  copy.removeAttribute('style');
  const xml = new XMLSerializer().serializeToString(copy);
  const sanitized = xmlLabel(xml);
  downloadFile(name.replace(/[/\\:*?"<>|]/g, '-') + '.svg', new Blob([sanitized], { type: 'image/svg+xml;charset=utf-8' }));
}
