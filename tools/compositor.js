import { generateFluidGradient } from '../generators/fluid-gradient.js';
import { generateShape } from '../generators/shapes.js';
import { generatePath } from '../generators/blob.js';
import { generateDefaultBlob } from '../core/state.js';

function loadGoogleFont(fontName) {
  const fontId = `font-${fontName.replace(/\s+/g, '-')}`;
  if (!document.getElementById(fontId)) {
    const link = document.createElement('link');
    link.id = fontId;
    link.rel = 'stylesheet';
    link.href = `https://fonts.googleapis.com/css2?family=${fontName.replace(/\s+/g, '+')}:wght@300;400;600;700&display=swap`;
    document.head.appendChild(link);
  }
}



function getEventData() {
  return {
    title: document.getElementById('input-title').value || 'Event Name',
    date: document.getElementById('input-date').value || 'Date & Time',
    location: document.getElementById('input-location').value || 'Location',
    host: document.getElementById('input-host').value || 'Host'
  };
}

function getPalette(paletteName) {
  const palettes = {
    sunset: ['#ff4d4d', '#ff0080', '#7928ca', '#ffb84d'],
    ocean: ['#00c6ff', '#0072ff', '#00ffd2', '#1a2980'],
    neon: ['#39ff14', '#ccff00', '#ff00ff', '#00ffff'],
    mono: ['#4a4a4a', '#8a8a8a', '#d3d3d3', '#2b2b2b'],
    redwhite: ['#FF5A5F', '#FFFFFF', '#FFCFCF', '#FFA6A8']
  };
  return palettes[paletteName] || palettes.sunset;
}

function getAutoTextColor(paletteName) {
  const textColors = {
    sunset: '#ffffff',
    ocean: '#ffffff',
    neon: '#0d1b2a', 
    mono: '#18181b', 
    redwhite: '#610008' // deep burgundy
  };
  return textColors[paletteName] || '#ffffff';
}

function renderShapes(includeShapes) {
  if (!includeShapes) return '';
  const numShapes = Math.floor(Math.random() * 3) + 1; // 1 to 3 shapes
  let shapesHtml = '';
  const shapeTypes = ['star', 'ring', 'pill'];
  
  for(let i=0; i<numShapes; i++) {
    const type = shapeTypes[Math.floor(Math.random() * shapeTypes.length)];
    const size = Math.random() * 150 + 50; 
    const svgStr = generateShape(type, size, 'rgba(255,255,255,0.4)', Math.random() * 2 + 1);
    
    const top = Math.random() * 80; // percentage
    const left = Math.random() * 80;
    const rot = Math.random() * 360;
    
    shapesHtml += `<div style="position: absolute; top: ${top}%; left: ${left}%; transform: rotate(${rot}deg);">${svgStr}</div>`;
  }
  return shapesHtml;
}

export function updateFlyers() {
  const data = getEventData();
  const hideText = document.getElementById('toggle-text') ? document.getElementById('toggle-text').checked : false;
  const filterEffect = document.getElementById('select-filter') ? document.getElementById('select-filter').value : 'none';
  const aspectRatio = document.getElementById('select-aspect') ? document.getElementById('select-aspect').value : '4/5';
  const fontMenu = document.getElementById('select-font');
  const selectedFont = fontMenu ? fontMenu.value : 'Inter';
  
  loadGoogleFont(selectedFont);

  const paletteMode = document.getElementById('select-palette').value;
  const textColorOption = document.getElementById('select-text-color') ? document.getElementById('select-text-color').value : 'auto';
  let computedTextColor = '#ffffff';
  if (textColorOption === 'white') computedTextColor = '#ffffff';
  else if (textColorOption === 'black') computedTextColor = '#18181b';
  else computedTextColor = getAutoTextColor(paletteMode);

  const cards = document.querySelectorAll('.flyer-card');
  cards.forEach((card, i) => {
    card.style.setProperty('--aspect', `calc(${aspectRatio})`);
    card.style.setProperty('--flyer-font', `'${selectedFont}', sans-serif`);

    const content = card.querySelector('.flyer-content');
    if (content) {
      content.style.display = hideText ? 'none' : '';
      content.style.color = computedTextColor;
      
      const dateEl = content.querySelector('.flyer-date');
      const titleEl = content.querySelector('.flyer-title');
      const locEl = content.querySelector('.location');
      const hostEl = content.querySelector('.host');
      
      if (dateEl) dateEl.innerText = data.date;
      if (titleEl) titleEl.innerText = data.title;
      if (locEl) locEl.innerText = data.location;
      if (hostEl) hostEl.innerText = data.host;
    }

    const bgLayer = card.querySelector('.flyer-bg');
    const shapeLayer = card.querySelector('.flyer-shapes');
    const gridLayer = card.querySelector('.flyer-grid');
    
    if (bgLayer) {
        bgLayer.style.filter = filterEffect === 'blur' ? 'blur(20px)' : '';
        bgLayer.style.transform = filterEffect === 'blur' ? 'scale(1.15)' : '';
    }
    if (shapeLayer) {
        shapeLayer.style.filter = filterEffect === 'blur' ? 'blur(20px)' : '';
    }
    if (gridLayer) {
        gridLayer.style.display = includeGrid ? 'block' : 'none';
        gridLayer.style.filter = filterEffect === 'blur' ? 'blur(20px)' : '';
    }

    let overlay = card.querySelector('.filter-overlay');
    if (overlay) overlay.remove();

    if (filterEffect === 'noise') {
      const overlayHtml = `<svg class="filter-overlay" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" style="position: absolute; top:0; left:0; width:100%; height:100%; z-index:2; opacity:0.18; pointer-events:none; mix-blend-mode: overlay;">
        <filter id="noiseFilterDynamic${i}">
          <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="3" stitchTiles="stitch"/>
        </filter>
        <rect width="100%" height="100%" filter="url(#noiseFilterDynamic${i})"/>
      </svg>`;
      // insert before content so it overlaps shapes but not text unless necessary
      if(content) content.insertAdjacentHTML('beforebegin', overlayHtml);
    } else if (filterEffect === 'vignette') {
      const overlayHtml = `<div class="filter-overlay" style="position: absolute; top:0; left:0; width:100%; height:100%; z-index:2; pointer-events:none; background: radial-gradient(circle, transparent 40%, rgba(0,0,0,0.7) 140%); mix-blend-mode: multiply;"></div>`;
      if(content) content.insertAdjacentHTML('beforebegin', overlayHtml);
    }
  });
}

export function generateFlyers() {
  const matrix = document.getElementById('flyer-matrix');
  matrix.innerHTML = ''; // clear 

  const data = getEventData();
  const paletteMode = document.getElementById('select-palette').value;
  const colors = getPalette(paletteMode);
  const includeShapes = document.getElementById('toggle-shapes').checked;
  const hideText = document.getElementById('toggle-text') ? document.getElementById('toggle-text').checked : false;
  const includeGrid = document.getElementById('toggle-grid') ? document.getElementById('toggle-grid').checked : false;
  const bgStyle = document.getElementById('select-bg-style').value;
  const filterEffect = document.getElementById('select-filter') ? document.getElementById('select-filter').value : 'none';
  const aspectRatio = document.getElementById('select-aspect') ? document.getElementById('select-aspect').value : '4/5';
  const fontMenu = document.getElementById('select-font');
  const selectedFont = fontMenu ? fontMenu.value : 'Inter';
  
  const textColorOption = document.getElementById('select-text-color') ? document.getElementById('select-text-color').value : 'auto';
  let computedTextColor = '#ffffff';
  if (textColorOption === 'white') computedTextColor = '#ffffff';
  else if (textColorOption === 'black') computedTextColor = '#18181b';
  else computedTextColor = getAutoTextColor(paletteMode);
  
  loadGoogleFont(selectedFont);

  // generate 4 iterations
  for (let i = 0; i < 4; i++) {
    let cssGradient = '';
    let svgBackground = '';
    
    let blurCss = filterEffect === 'blur' ? 'filter: blur(20px); transform: scale(1.15);' : '';
    let overlayHtml = '';
    
    if (filterEffect === 'noise') {
      overlayHtml = `<svg class="filter-overlay" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" style="position: absolute; top:0; left:0; width:100%; height:100%; z-index:2; opacity:0.18; pointer-events:none; mix-blend-mode: overlay;">
        <filter id="noiseFilter${i}">
          <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="3" stitchTiles="stitch"/>
        </filter>
        <rect width="100%" height="100%" filter="url(#noiseFilter${i})"/>
      </svg>`;
    } else if (filterEffect === 'vignette') {
      overlayHtml = `<div class="filter-overlay" style="position: absolute; top:0; left:0; width:100%; height:100%; z-index:2; pointer-events:none; background: radial-gradient(circle, transparent 40%, rgba(0,0,0,0.7) 140%); mix-blend-mode: multiply;"></div>`;
    }

    if (bgStyle === 'fluid-mesh') {
      const svgNodes = generateFluidGradient(colors);
      svgBackground = `<div class="flyer-bg" style="background:#09090b; ${blurCss}">${svgNodes}</div>`;
    } else if (bgStyle === 'solid-dark') {
      cssGradient = '#1a1a1a';
    } else if (bgStyle === 'blobs') {
      // Generate a tiny inline SVG with a dark background and a random blob
      const tempBlob = generateDefaultBlob(i+10);
      tempBlob.size = Math.random()*200 + 300;
      tempBlob.radii = Array(8).fill(0).map(() => Math.floor(Math.random() * 85) + 16);
      const blobPath = generatePath(tempBlob);
      const blobColor = colors[Math.floor(Math.random() * colors.length)];
      
      svgBackground = `<svg class="flyer-bg" viewBox="-110 -110 220 220" style="background:#09090b; ${blurCss}">
         <path d="${blobPath}" fill="${blobColor}" transform="scale(1.2)" style="opacity: 0.6; mix-blend-mode: screen;" />
      </svg>`;
    }

    const shapes = renderShapes(includeShapes);

    const cardWrapper = document.createElement('div');
    cardWrapper.className = 'flyer-card-wrapper';
    
    cardWrapper.innerHTML = `
      <div class="flyer-card" id="flyer-export-${i}" style="--aspect: calc(${aspectRatio}); --flyer-font: '${selectedFont}', sans-serif;">
        ${(bgStyle === 'blobs' || bgStyle === 'fluid-mesh') ? svgBackground : `<div class="flyer-bg" style="background: ${cssGradient}; ${blurCss}"></div>`}
        <div class="flyer-grid" style="${includeGrid ? 'display: block;' : 'display: none;'} ${blurCss}"></div>
        <div class="flyer-shapes" style="${blurCss}">${shapes}</div>
        ${overlayHtml}
        <div class="flyer-content" style="${hideText ? 'display: none;' : ''} color: ${computedTextColor};">
          <div class="flyer-date">${data.date}</div>
          <div class="flyer-title">${data.title}</div>
          <div class="flyer-footer">
            <span class="location">${data.location}</span>
            <span class="host">${data.host}</span>
          </div>
        <div class="flyer-actions" data-html2canvas-ignore="true">
           <button class="icon-btn download-png-btn" data-target="flyer-export-${i}">
              <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg> PNG
           </button>
           <button class="icon-btn copy-svg-btn" data-target="flyer-export-${i}">
              <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg> SVG
           </button>
        </div>
      </div>
    `;

    matrix.appendChild(cardWrapper);
  }

  // attach export listeners
  document.querySelectorAll('.download-png-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const targetId = e.target.getAttribute('data-target');
      const node = document.getElementById(targetId);
      
      e.target.innerText = 'Exporting...';
      
      // Temporarily strip border radius for clean export
      const oldRadius = node.style.borderRadius;
      node.style.borderRadius = '0px';
      
      html2canvas(node, { scale: 3, useCORS: true, backgroundColor: null }).then(canvas => {
        // Restore
        node.style.borderRadius = oldRadius;
        
        const link = document.createElement('a');
        link.download = `${data.title.replace(/\s+/g, '-').toLowerCase()}-${targetId}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
        e.target.innerText = 'Download PNG';
      });
    });
  });

  document.querySelectorAll('.copy-svg-btn').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const targetId = e.target.getAttribute('data-target');
      const node = document.getElementById(targetId);
      
      const w = node.offsetWidth || 400;
      const h = node.offsetHeight || 500;
      
      let mainSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}">`;
      
      const bg = node.querySelector('.flyer-bg');
      if (bg) {
        let bgColor = bg.style.background || bg.style.backgroundColor || '#09090b';
        mainSvg += `<rect width="100%" height="100%" fill="${bgColor}" />`;
        
        if (bg.tagName.toLowerCase() === 'svg') {
           mainSvg += bg.outerHTML;
        } else {
           const innerSvg = bg.querySelector('svg');
           if (innerSvg) mainSvg += innerSvg.outerHTML;
        }
      }

      const shapes = node.querySelectorAll('.flyer-shapes div');
      shapes.forEach(shapeDiv => {
         const top = shapeDiv.style.top;
         const left = shapeDiv.style.left;
         const transform = shapeDiv.style.transform;
         mainSvg += `<svg x="${left}" y="${top}" style="overflow:visible">
                       <g transform="${transform}">
                         ${shapeDiv.innerHTML}
                       </g>
                     </svg>`;
      });

      mainSvg += `</svg>`;
      
      try {
        await navigator.clipboard.writeText(mainSvg);
        const originalText = e.target.innerText;
        e.target.innerText = 'Copied!';
        setTimeout(() => e.target.innerText = originalText, 2000);
      } catch (err) {
        console.error('Failed to copy SVG', err);
        e.target.innerText = 'Failed';
      }
    });
  });
}
