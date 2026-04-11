import { state } from './state.js';
import { initRadii, randomizeRadii, updateBlobSVG, buildRadiiUI, syncRadiiUI } from './blob.js';
import { updateGradientSVG, buildStopsUI, addStop } from './gradient.js';
import { startAnimation, stopAnimation, changeTiming, updateTransitions } from './animation.js';
import { generateSVGMarkup, showToast } from './export.js';

// Base Refs
const svgEls = {
  blobSvg: document.getElementById('blob-svg'),
  blobPath: document.getElementById('blob-path'),
  pointsGroup: document.getElementById('points-group'),
  blobGradLin: document.getElementById('blob-grad-linear'),
  blobGradRad: document.getElementById('blob-grad-radial')
};

function renderAll() {
  updateGradientSVG(svgEls);
  updateBlobSVG(svgEls);
}

function doRandomize() {
  randomizeRadii();
  syncRadiiUI(document.getElementById('dynamic-controls'));
  renderAll();
}

// Color and Mode Settings
const solidColorInput = document.getElementById('solid-color');
const solidHexInput = document.getElementById('solid-hex');
const fillTypeSelect = document.getElementById('fill-type-select');

solidColorInput.addEventListener('input', e => { 
  state.solidColor = e.target.value; 
  solidHexInput.value = state.solidColor; 
  renderAll(); 
});
solidHexInput.addEventListener('change', e => {
  let val = e.target.value;
  if(!val.startsWith('#')) val = '#' + val;
  if(/^#([0-9A-F]{3}){1,6}$/i.test(val)) {
    state.solidColor = val;
    solidColorInput.value = val;
    renderAll();
  } else {
    e.target.value = state.solidColor;
  }
});

fillTypeSelect.addEventListener('change', e => {
  state.fillMode = e.target.value;
  document.getElementById('solid-controls').style.display = state.fillMode === 'solid' ? 'block' : 'none';
  document.getElementById('gradient-controls').style.display = state.fillMode === 'solid' ? 'none' : 'block';
  document.getElementById('grad-angle-row').style.display = state.fillMode === 'linear' ? 'flex' : 'none';
  renderAll();
});

// Dynamic Stops
const stopsContainer = document.getElementById('stops-container');
document.getElementById('add-stop-btn').addEventListener('click', () => addStop(stopsContainer, renderAll));

// Angles and Layout Spread
const gradAngleInput = document.getElementById('grad-angle');
gradAngleInput.addEventListener('input', e => { 
  state.gradAngle = e.target.value; 
  document.getElementById('grad-angle-val').textContent = state.gradAngle+'°'; 
  renderAll(); 
});

const gradSpreadInput = document.getElementById('grad-spread');
gradSpreadInput.addEventListener('input', e => { 
  state.gradSpread = parseInt(e.target.value); 
  document.getElementById('grad-spread-val').textContent = state.gradSpread+'%'; 
  renderAll(); 
});

// Base structural changes
const sizeSlider = document.getElementById('size-slider');
sizeSlider.addEventListener('input', e => {
  state.size = parseInt(e.target.value);
  document.getElementById('size-val').textContent = state.size+'px';
  svgEls.blobSvg.style.width = state.size+'px';
  svgEls.blobSvg.style.height = state.size+'px';
});

const pointsSlider = document.getElementById('points-slider');
pointsSlider.addEventListener('input', e => {
  const newN = parseInt(e.target.value);
  document.getElementById('points-val').textContent = newN;
  if(newN > state.numPoints) {
    for(let i=state.numPoints; i<newN; i++) state.radii.push(100);
  } else {
    state.radii = state.radii.slice(0, newN);
  }
  state.numPoints = newN;
  buildRadiiUI(document.getElementById('dynamic-controls'), renderAll);
  renderAll();
});

const roundnessSlider = document.getElementById('roundness-slider');
roundnessSlider.addEventListener('input', e => {
  state.roundness = parseInt(e.target.value);
  document.getElementById('roundness-val').textContent = state.roundness+'%';
  renderAll();
});

const showPointsToggle = document.getElementById('show-points-toggle');
showPointsToggle.addEventListener('change', e => {
  state.showPoints = e.target.checked;
  svgEls.pointsGroup.style.opacity = state.showPoints ? '1' : '0';
});

// Playback Logic
document.getElementById('play-btn').addEventListener('click', () => {
    startAnimation(svgEls.blobPath, doRandomize);
    showToast('Animation Started');
});
document.getElementById('stop-btn').addEventListener('click', () => {
    stopAnimation();
    showToast('Animation Stopped');
});

const timingSlider = document.getElementById('timing-slider');
timingSlider.addEventListener('input', e => {
  document.getElementById('timing-val').textContent = e.target.value+'ms';
  changeTiming(e.target.value, svgEls.blobPath, doRandomize);
});

document.getElementById('ease-select').addEventListener('change', e => {
  state.animEase = e.target.value;
  updateTransitions(svgEls.blobPath);
});

// Actions
document.getElementById('copy-btn').addEventListener('click', () => {
  navigator.clipboard.writeText(generateSVGMarkup(svgEls)).then(() => {
    showToast('SVG Copied!');
  }).catch(() => showToast('Copy Failed'));
});

document.getElementById('random-btn').addEventListener('click', () => {
  doRandomize();
  if(!state.animInterval) showToast('Random Shape Generated');
});

document.getElementById('reset-btn').addEventListener('click', () => {
  stopAnimation();
  state.numPoints = 8;
  pointsSlider.value = 8;
  document.getElementById('points-val').textContent = 8;
  
  state.roundness = 40;
  roundnessSlider.value = 40;
  document.getElementById('roundness-val').textContent = '40%';
  
  state.showPoints = false;
  showPointsToggle.checked = false;
  svgEls.pointsGroup.style.opacity = '0';
  
  state.size = 300;
  sizeSlider.value = 300;
  document.getElementById('size-val').textContent = '300px';
  svgEls.blobSvg.style.width = '300px';
  svgEls.blobSvg.style.height = '300px';
  
  state.fillMode = 'linear';
  fillTypeSelect.value = 'linear';
  document.getElementById('solid-controls').style.display = 'none';
  document.getElementById('gradient-controls').style.display = 'block';
  document.getElementById('grad-angle-row').style.display = 'flex';
  
  state.stops = [
    { id: 1, color: '#ff0080', offset: 0 },
    { id: 2, color: '#7928ca', offset: 100 }
  ];
  state.nextStopId = 3;
  buildStopsUI(stopsContainer, renderAll);

  initRadii();
  buildRadiiUI(document.getElementById('dynamic-controls'), renderAll);
  renderAll();
  showToast('Reset to Default');
});

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
  if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT') return;
  if (e.key.toLowerCase() === 'c') {
    document.getElementById('copy-btn').click();
  } else if (e.key.toLowerCase() === 'r') {
    document.getElementById('reset-btn').click();
  } else if (e.key === ' ' || e.key.toLowerCase() === 'g') {
    e.preventDefault();
    document.getElementById('random-btn').click();
  }
});

// Boot seq
initRadii();
buildStopsUI(stopsContainer, renderAll);
buildRadiiUI(document.getElementById('dynamic-controls'), renderAll);
updateTransitions(svgEls.blobPath);
renderAll();
