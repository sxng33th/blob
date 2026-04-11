import { state } from './state.js';
import { generatePath } from './blob.js';

export function generateSVGMarkup(svgEls) {
  let defs = '';
  let fillTarget = '';

  if (state.fillMode === 'solid') {
    fillTarget = state.solidColor;
  } else if (state.fillMode === 'linear') {
    const stops = state.stops.map(s => `      <stop offset="${s.offset}%" stop-color="${s.color}" />`).join('\n');
    defs = `<defs>\n    <linearGradient id="blob-grad" x1="${svgEls.blobGradLin.getAttribute('x1')}" y1="${svgEls.blobGradLin.getAttribute('y1')}" x2="${svgEls.blobGradLin.getAttribute('x2')}" y2="${svgEls.blobGradLin.getAttribute('y2')}">\n${stops}\n    </linearGradient>\n  </defs>\n  `;
    fillTarget = 'url(#blob-grad)';
  } else if (state.fillMode === 'radial') {
    const stops = state.stops.map(s => `      <stop offset="${s.offset}%" stop-color="${s.color}" />`).join('\n');
    defs = `<defs>\n    <radialGradient id="blob-grad" cx="50%" cy="50%" r="${svgEls.blobGradRad.getAttribute('r')}">\n${stops}\n    </radialGradient>\n  </defs>\n  `;
    fillTarget = 'url(#blob-grad)';
  }

  return `<svg viewBox="-110 -110 220 220" xmlns="http://www.w3.org/2000/svg">\n  ${defs}<path fill="${fillTarget}" d="${generatePath()}" />\n</svg>`;
}

export function showToast(msg) {
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2000);
}
