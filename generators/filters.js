export function generateFilterOverlay(filterEffect, index = 0) {
  if (filterEffect === 'noise') {
    return `<svg class="filter-overlay" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" style="position: absolute; top:0; left:0; width:100%; height:100%; z-index:2; opacity:0.18; pointer-events:none; mix-blend-mode: overlay;">
      <filter id="noiseFilter${index}">
        <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="3" stitchTiles="stitch"/>
      </filter>
      <rect width="100%" height="100%" filter="url(#noiseFilter${index})"/>
    </svg>`;
  } else if (filterEffect === 'vignette') {
    return `<div class="filter-overlay" style="position: absolute; top:0; left:0; width:100%; height:100%; z-index:2; pointer-events:none; background: radial-gradient(circle, transparent 40%, rgba(0,0,0,0.7) 140%); mix-blend-mode: multiply;"></div>`;
  }
  return '';
}
