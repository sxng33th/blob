import { generateFluidGradient } from '../generators/fluid-gradient.js';
import { generateShape } from '../generators/shapes.js';
import { generatePath } from '../generators/blob.js';
import { generateDefaultBlob, readUIState } from '../core/state.js';
import { getPalette, getComputedTextColor } from '../core/theme.js';
import { generateFilterOverlay } from '../generators/filters.js';
import { copyFlyerAsSVG, downloadFlyerAsPNG } from './export.js';

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

function renderShapes(includeShapes) {
  if (!includeShapes) return '';
  const numShapes = Math.floor(Math.random() * 3) + 1;
  let shapesHtml = '';
  const shapeTypes = ['star', 'ring', 'pill'];
  
  for(let i=0; i<numShapes; i++) {
    const type = shapeTypes[Math.floor(Math.random() * shapeTypes.length)];
    const size = Math.random() * 150 + 50; 
    const svgStr = generateShape(type, size, 'rgba(255,255,255,0.4)', Math.random() * 2 + 1);
    
    const top = Math.random() * 80;
    const left = Math.random() * 80;
    const rot = Math.random() * 360;
    
    shapesHtml += `<div style="position: absolute; top: ${top}%; left: ${left}%; transform: rotate(${rot}deg);">${svgStr}</div>`;
  }
  return shapesHtml;
}

export function updateFlyers() {
  const state = readUIState();
  loadGoogleFont(state.style.font);
  const computedTextColor = getComputedTextColor(state.style.textColorOption, state.style.palette);

  const cards = document.querySelectorAll('.flyer-card');
  cards.forEach((card, i) => {
    card.style.setProperty('--aspect', `calc(${state.style.aspectRatio})`);
    card.style.setProperty('--flyer-font', `'${state.style.font}', sans-serif`);

    const content = card.querySelector('.flyer-content');
    if (content) {
      content.style.display = state.features.hideText ? 'none' : '';
      content.style.color = computedTextColor;
      
      const elMap = {
        '.flyer-date': state.data.date,
        '.flyer-title': state.data.title,
        '.location': state.data.location,
        '.host': state.data.host
      };
      for (const [sel, text] of Object.entries(elMap)) {
         const el = content.querySelector(sel);
         if (el) el.innerText = text;
      }
    }

    const bgLayer = card.querySelector('.flyer-bg');
    const shapeLayer = card.querySelector('.flyer-shapes');
    const gridLayer = card.querySelector('.flyer-grid');
    const blurCss = state.style.filterEffect === 'blur';
    
    if (bgLayer) {
        bgLayer.style.filter = blurCss ? 'blur(20px)' : '';
        bgLayer.style.transform = blurCss ? 'scale(1.15)' : '';
    }
    if (shapeLayer) {
        shapeLayer.style.filter = blurCss ? 'blur(20px)' : '';
    }
    if (gridLayer) {
        gridLayer.style.display = state.features.includeGrid ? 'block' : 'none';
        gridLayer.style.filter = blurCss ? 'blur(20px)' : '';
    }

    let overlay = card.querySelector('.filter-overlay');
    if (overlay) overlay.remove();

    const overlayHtml = generateFilterOverlay(state.style.filterEffect, `Dynamic${i}`);
    if (overlayHtml && content) {
      content.insertAdjacentHTML('beforebegin', overlayHtml);
    }
  });
}

export function generateFlyers() {
  const matrix = document.getElementById('flyer-matrix');
  if (!matrix) return;
  matrix.innerHTML = ''; 

  const state = readUIState();
  const colors = getPalette(state.style.palette);
  const computedTextColor = getComputedTextColor(state.style.textColorOption, state.style.palette);
  
  loadGoogleFont(state.style.font);

  for (let i = 0; i < 4; i++) {
    let cssGradient = '';
    let svgBackground = '';
    
    let blurCss = state.style.filterEffect === 'blur' ? 'filter: blur(20px); transform: scale(1.15);' : '';
    const overlayHtml = generateFilterOverlay(state.style.filterEffect, i);

    if (state.style.bgStyle === 'fluid-mesh') {
      const svgNodes = generateFluidGradient(colors);
      svgBackground = `<div class="flyer-bg" style="background:#050505; ${blurCss}">${svgNodes}</div>`;
    } else if (state.style.bgStyle === 'solid-dark') {
      cssGradient = '#0f0f0f';
    } else if (state.style.bgStyle === 'blobs') {
      const tempBlob = generateDefaultBlob(i+10);
      tempBlob.size = Math.random()*200 + 300;
      tempBlob.radii = Array(8).fill(0).map(() => Math.floor(Math.random() * 85) + 16);
      const blobPath = generatePath(tempBlob);
      const blobColor = colors[Math.floor(Math.random() * colors.length)];
      
      svgBackground = `<svg class="flyer-bg" viewBox="-110 -110 220 220" style="background:#050505; ${blurCss}">
         <path d="${blobPath}" fill="${blobColor}" transform="scale(1.2)" style="opacity: 0.6; mix-blend-mode: screen;" />
      </svg>`;
    }

    const shapes = renderShapes(state.features.includeShapes);
    const cardWrapper = document.createElement('div');
    cardWrapper.className = 'flyer-card-wrapper';
    
    cardWrapper.innerHTML = `
      <div class="flyer-card" id="flyer-export-${i}" style="--aspect: calc(${state.style.aspectRatio}); --flyer-font: '${state.style.font}', sans-serif;">
        ${(state.style.bgStyle === 'blobs' || state.style.bgStyle === 'fluid-mesh') ? svgBackground : `<div class="flyer-bg" style="background: ${cssGradient}; ${blurCss}"></div>`}
        <div class="flyer-grid" style="${state.features.includeGrid ? 'display: block;' : 'display: none;'} ${blurCss}"></div>
        <div class="flyer-shapes" style="${blurCss}">${shapes}</div>
        ${overlayHtml}
        <div class="flyer-content" style="${state.features.hideText ? 'display: none;' : ''} color: ${computedTextColor};">
          <div class="flyer-date">${state.data.date}</div>
          <div class="flyer-title">${state.data.title}</div>
          <div class="flyer-footer">
            <span class="location">${state.data.location}</span>
            <span class="host">${state.data.host}</span>
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
      </div>
    `;
    matrix.appendChild(cardWrapper);
  }

  // Event bindings for export buttons
  document.querySelectorAll('.download-png-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const targetId = btn.getAttribute('data-target');
      const originalText = btn.innerHTML;
      btn.innerHTML = 'Exporting...';
      downloadFlyerAsPNG(targetId, state.data.title).then(() => {
         btn.innerHTML = originalText;
      });
    });
  });

  document.querySelectorAll('.copy-svg-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const targetId = btn.getAttribute('data-target');
      const originalText = btn.innerHTML;
      btn.innerHTML = 'Copied!';
      copyFlyerAsSVG(targetId).then(() => {
         setTimeout(() => btn.innerHTML = originalText, 2000);
      });
    });
  });
}
