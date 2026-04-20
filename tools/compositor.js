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
    mono: ['#4a4a4a', '#8a8a8a', '#d3d3d3', '#2b2b2b']
  };
  return palettes[paletteName] || palettes.sunset;
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

export function generateFlyers() {
  const matrix = document.getElementById('flyer-matrix');
  matrix.innerHTML = ''; // clear 

  const data = getEventData();
  const paletteMode = document.getElementById('select-palette').value;
  const colors = getPalette(paletteMode);
  const includeShapes = document.getElementById('toggle-shapes').checked;
  const bgStyle = document.getElementById('select-bg-style').value;
  const aspectRatio = document.getElementById('select-aspect') ? document.getElementById('select-aspect').value : '4/5';
  const fontMenu = document.getElementById('select-font');
  const selectedFont = fontMenu ? fontMenu.value : 'Inter';
  
  loadGoogleFont(selectedFont);

  // generate 4 iterations
  for (let i = 0; i < 4; i++) {
    let cssGradient = '';
    let svgBackground = '';

    if (bgStyle === 'fluid-mesh') {
      const svgNodes = generateFluidGradient(colors);
      svgBackground = `<div class="flyer-bg" style="background:#09090b;">${svgNodes}</div>`;
    } else if (bgStyle === 'solid-dark') {
      cssGradient = '#1a1a1a';
    } else if (bgStyle === 'blobs') {
      // Generate a tiny inline SVG with a dark background and a random blob
      const tempBlob = generateDefaultBlob(i+10);
      tempBlob.size = Math.random()*200 + 300;
      tempBlob.radii = Array(8).fill(0).map(() => Math.floor(Math.random() * 85) + 16);
      const blobPath = generatePath(tempBlob);
      const blobColor = colors[Math.floor(Math.random() * colors.length)];
      
      svgBackground = `<svg class="flyer-bg" viewBox="-110 -110 220 220" style="background:#09090b;">
         <path d="${blobPath}" fill="${blobColor}" transform="scale(1.2)" style="opacity: 0.6; mix-blend-mode: screen;" />
      </svg>`;
    }

    const shapes = renderShapes(includeShapes);

    const cardWrapper = document.createElement('div');
    cardWrapper.className = 'flyer-card-wrapper';
    
    cardWrapper.innerHTML = `
      <div class="flyer-card" id="flyer-export-${i}" style="--aspect: calc(${aspectRatio}); --flyer-font: '${selectedFont}', sans-serif;">
        ${(bgStyle === 'blobs' || bgStyle === 'fluid-mesh') ? svgBackground : `<div class="flyer-bg" style="background: ${cssGradient};"></div>`}
        <div class="flyer-shapes">${shapes}</div>
        <div class="flyer-content">
          <div class="flyer-date">${data.date}</div>
          <div class="flyer-title">${data.title}</div>
          <div class="flyer-footer">
            <span class="location">${data.location}</span>
            <span class="host">${data.host}</span>
          </div>
        </div>
      </div>
      <button class="export-btn" data-target="flyer-export-${i}">Download PNG</button>
    `;

    matrix.appendChild(cardWrapper);
  }

  // attach export listeners
  document.querySelectorAll('.export-btn').forEach(btn => {
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
}
