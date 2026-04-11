
const svgEls = {
  blobSvg: document.getElementById('blob-svg'),
  blobsGroup: document.getElementById('blobs-group'),
  defsGroup: document.getElementById('svg-defs-group'),
  pointsGroup: document.getElementById('points-group')
};

function renderAll() {
  if (state.gooeyMerge) {
    svgEls.blobsGroup.setAttribute('filter', 'url(#gooey)');
  } else {
    svgEls.blobsGroup.removeAttribute('filter');
  }
  
  const postProcGrp = document.getElementById('post-process-group');
  if (state.globalBlur > 0 || state.globalNoise > 0) {
    postProcGrp.setAttribute('filter', 'url(#post-process)');
  } else {
    postProcGrp.removeAttribute('filter');
  }
  
  updateGradientSVG(svgEls);
  updateBlobSVG(svgEls);
}

function doRandomize() {
  randomizeRadii(false);
  updateBlobSVG(svgEls);
}

function doRandomizeAll() {
  randomizeRadii(true);
  updateBlobSVG(svgEls);
}

// ------------------------
// UI Syncer
// ------------------------
function syncAllUI() {
  const blob = getActiveBlob();
  
  document.getElementById('fill-type-select').value = blob.fillMode;
  document.getElementById('solid-controls').style.display = blob.fillMode === 'solid' ? 'block' : 'none';
  document.getElementById('gradient-controls').style.display = blob.fillMode === 'solid' ? 'none' : 'block';
  document.getElementById('grad-angle-row').style.display = blob.fillMode === 'linear' ? 'flex' : 'none';

  document.getElementById('solid-color').value = blob.solidColor;
  document.getElementById('solid-hex').value = blob.solidColor;

  document.getElementById('grad-angle').value = blob.gradAngle;
  document.getElementById('grad-angle-val').textContent = blob.gradAngle+'°';
  document.getElementById('grad-spread').value = blob.gradSpread;
  document.getElementById('grad-spread-val').textContent = blob.gradSpread+'%';

  document.getElementById('blend-mode-select').value = blob.blendMode;

  document.getElementById('size-slider').value = blob.size || 300;
  document.getElementById('size-val').textContent = (blob.size || 300)+'px';

  document.getElementById('points-slider').value = blob.numPoints;
  document.getElementById('points-val').textContent = blob.numPoints;
  document.getElementById('roundness-slider').value = blob.roundness;
  document.getElementById('roundness-val').textContent = blob.roundness+'%';
  
  buildStopsUI(document.getElementById('stops-container'), renderAll);
}

// ------------------------
// Layers System
// ------------------------
function renderLayersUI() {
  const container = document.getElementById('layers-list');
  container.innerHTML = '';
  
  state.blobs.forEach((blob, idx) => {
    const item = document.createElement('div');
    item.className = 'layer-item';
    if(idx === state.activeBlobIndex) item.classList.add('active');
    
    // click wrapper
    const nameWrap = document.createElement('div');
    nameWrap.className = 'layer-name';
    nameWrap.textContent = blob.name;
    nameWrap.addEventListener('click', () => {
      state.activeBlobIndex = idx;
      renderLayersUI();
      syncAllUI();
      renderAll();
    });
    
    const actions = document.createElement('div');
    actions.className = 'layer-actions';
    
    if (state.blobs.length > 1) {
       const delBtn = document.createElement('button');
       delBtn.className = 'btn-reset';
       delBtn.textContent = '✖';
       delBtn.addEventListener('click', (e) => {
         e.stopPropagation();
         state.blobs.splice(idx, 1);
         if (state.activeBlobIndex >= state.blobs.length) {
             state.activeBlobIndex = state.blobs.length - 1;
         }
         renderLayersUI();
         syncAllUI();
         renderAll();
       });
       actions.appendChild(delBtn);
    }
    
    item.appendChild(nameWrap);
    item.appendChild(actions);
    container.appendChild(item);
  });
}

document.getElementById('add-layer-btn').addEventListener('click', () => {
  const newBlob = generateDefaultBlob(state.nextBlobId++);
  state.blobs.push(newBlob);
  state.activeBlobIndex = state.blobs.length - 1;
  initRadii(); // generates radius array specifically for this newly active blob
  renderLayersUI();
  syncAllUI();
  renderAll();
});

document.getElementById('gooey-toggle').addEventListener('change', e => {
  state.gooeyMerge = e.target.checked;
  renderAll();
});

document.getElementById('blend-mode-select').addEventListener('change', e => {
  getActiveBlob().blendMode = e.target.value;
  renderAll();
});


// ------------------------
// Core Logic Listeners
// ------------------------

document.getElementById('fill-type-select').addEventListener('change', e => {
  getActiveBlob().fillMode = e.target.value;
  syncAllUI();
  renderAll();
});

document.getElementById('solid-color').addEventListener('input', e => { 
  getActiveBlob().solidColor = e.target.value; 
  document.getElementById('solid-hex').value = e.target.value; 
  renderAll(); 
});
document.getElementById('solid-hex').addEventListener('change', e => {
  let val = e.target.value;
  if(!val.startsWith('#')) val = '#' + val;
  if(/^#([0-9A-F]{3}){1,6}$/i.test(val)) {
    getActiveBlob().solidColor = val;
    document.getElementById('solid-color').value = val;
    renderAll();
  } else {
    e.target.value = getActiveBlob().solidColor;
  }
});

document.getElementById('add-stop-btn').addEventListener('click', () => addStop(document.getElementById('stops-container'), renderAll));

document.getElementById('grad-angle').addEventListener('input', e => { 
  getActiveBlob().gradAngle = e.target.value; 
  document.getElementById('grad-angle-val').textContent = e.target.value+'°'; 
  renderAll(); 
});

document.getElementById('grad-spread').addEventListener('input', e => { 
  getActiveBlob().gradSpread = parseInt(e.target.value); 
  document.getElementById('grad-spread-val').textContent = e.target.value+'%'; 
  renderAll(); 
});

document.getElementById('size-slider').addEventListener('input', e => {
  getActiveBlob().size = parseInt(e.target.value);
  document.getElementById('size-val').textContent = getActiveBlob().size+'px';
  renderAll();
});

document.getElementById('global-blur').addEventListener('input', e => {
  state.globalBlur = parseInt(e.target.value);
  document.getElementById('global-blur-val').textContent = state.globalBlur;
  renderAll();
});

document.getElementById('global-noise').addEventListener('input', e => {
  state.globalNoise = parseInt(e.target.value);
  document.getElementById('global-noise-val').textContent = state.globalNoise + '%';
  renderAll();
});

document.getElementById('points-slider').addEventListener('input', e => {
  const newN = parseInt(e.target.value);
  const blob = getActiveBlob();
  document.getElementById('points-val').textContent = newN;
  if(newN > blob.numPoints) {
    for(let i=blob.numPoints; i<newN; i++) blob.radii.push(100);
  } else {
    blob.radii = blob.radii.slice(0, newN);
  }
  blob.numPoints = newN;
  renderAll();
});

document.getElementById('roundness-slider').addEventListener('input', e => {
  getActiveBlob().roundness = parseInt(e.target.value);
  document.getElementById('roundness-val').textContent = e.target.value+'%';
  renderAll();
});

document.getElementById('show-points-toggle').addEventListener('change', e => {
  state.showPoints = e.target.checked;
  svgEls.pointsGroup.style.opacity = state.showPoints ? '1' : '0';
});

document.getElementById('play-btn').addEventListener('click', (e) => {
  if (state.animInterval) {
    stopAnimation();
    e.target.textContent = 'Start';
    e.target.className = 'btn-primary';
    showToast('Animation Stopped');
  } else {
    startAnimation(doRandomizeAll);
    e.target.textContent = 'Stop';
    e.target.className = 'btn-secondary';
    showToast('Animation Started');
  }
});

document.getElementById('grad-rotate-toggle').addEventListener('change', e => {
  state.gradRotate = e.target.checked;
  if (state.animInterval) {
    stopAnimation();
    startAnimation(doRandomizeAll);
  }
});

document.getElementById('grad-rotate-speed').addEventListener('input', e => {
  state.gradRotSpeed = parseInt(e.target.value);
  document.getElementById('grad-rotate-speed-val').textContent = state.gradRotSpeed;
});

document.getElementById('timing-slider').addEventListener('input', e => {
  document.getElementById('timing-val').textContent = e.target.value+'ms';
  changeTiming(e.target.value, doRandomizeAll);
});
document.getElementById('ease-select').addEventListener('change', e => {
  state.animEase = e.target.value;
});

// Actions
document.getElementById('copy-btn').addEventListener('click', () => {
  const svgText = generateSVGMarkup(svgEls);
  
  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard.writeText(svgText).then(() => {
      showToast('SVG Copied!');
    }).catch(() => fallbackCopy(svgText));
  } else {
    fallbackCopy(svgText);
  }
});

document.getElementById('copy-anim-btn').addEventListener('click', () => {
  const svgText = generateAnimatedSVGMarkup(svgEls);
  
  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard.writeText(svgText).then(() => {
      showToast('Animated SVG Copied!');
    }).catch(() => fallbackCopy(svgText));
  } else {
    fallbackCopy(svgText);
  }
});

function fallbackCopy(text) {
  const textArea = document.createElement("textarea");
  textArea.value = text;
  textArea.style.position = "fixed";
  textArea.style.top = "-999999px";
  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();
  
  try {
    document.execCommand('copy');
    showToast('SVG Copied!');
  } catch (err) {
    showToast('Copy Failed');
  }
  document.body.removeChild(textArea);
}

document.getElementById('random-btn').addEventListener('click', () => {
  doRandomize();
  if(!state.animInterval) showToast('Random Shape Generated');
});

document.getElementById('reset-btn').addEventListener('click', () => {
  stopAnimation();
  const playBtn = document.getElementById('play-btn');
  playBtn.textContent = 'Start';
  playBtn.className = 'btn-primary';
  
  state.blobs = [generateDefaultBlob(1)];
  state.activeBlobIndex = 0;
  state.nextBlobId = 2;
  state.gooeyMerge = false;
  document.getElementById('gooey-toggle').checked = false;
  
  state.showPoints = false;
  document.getElementById('show-points-toggle').checked = false;
  svgEls.pointsGroup.style.opacity = '0';
  
  state.globalBlur = 0;
  state.globalNoise = 0;
  document.getElementById('global-blur').value = 0;
  document.getElementById('global-blur-val').textContent = '0';
  document.getElementById('global-noise').value = 0;
  document.getElementById('global-noise-val').textContent = '0%';
  
  state.gradRotate = false;
  document.getElementById('grad-rotate-toggle').checked = false;
  state.gradRotSpeed = 50;
  document.getElementById('grad-rotate-speed').value = 50;
  document.getElementById('grad-rotate-speed-val').textContent = '50';
  
  initRadii();
  renderLayersUI();
  syncAllUI();
  renderAll();
  showToast('Reset to Default');
});

document.addEventListener('keydown', (e) => {
  if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT') return;
  if (e.key.toLowerCase() === 'c') document.getElementById('copy-btn').click();
  else if (e.key.toLowerCase() === 'r') document.getElementById('reset-btn').click();
  else if (e.key === ' ' || e.key.toLowerCase() === 'g') {
    e.preventDefault();
    document.getElementById('random-btn').click();
  }
});

initRadii();
renderLayersUI();
syncAllUI();
renderAll();

let activeDragPointIndex = null;

svgEls.pointsGroup.addEventListener('pointerdown', (e) => {
  if (e.target.tagName === 'circle') {
    const circles = Array.from(svgEls.pointsGroup.children);
    activeDragPointIndex = circles.indexOf(e.target);
    if(activeDragPointIndex !== -1) {
      state.isDraggingPoint = true;
      svgEls.blobSvg.setPointerCapture(e.pointerId);
      updateBlobSVG(svgEls);
    }
  }
});

svgEls.blobSvg.addEventListener('pointermove', (e) => {
  if (state.isDraggingPoint && activeDragPointIndex !== null) {
      const pt = svgEls.blobSvg.createSVGPoint();
      pt.x = e.clientX;
      pt.y = e.clientY;
      const svgPt = pt.matrixTransform(svgEls.blobSvg.getScreenCTM().inverse());
      const dist = Math.sqrt(svgPt.x * svgPt.x + svgPt.y * svgPt.y);
      
      const maxSize = Math.max(...state.blobs.map(b => b.size || 300));
      const activeBlob = getActiveBlob();
      const activeScale = (activeBlob.size || 300) / maxSize;
      
      const newRadius = Math.max(10, Math.min(100, Math.round(dist / activeScale)));
      activeBlob.radii[activeDragPointIndex] = newRadius;
      
      updateBlobSVG(svgEls);
  }
});

svgEls.blobSvg.addEventListener('pointerup', (e) => {
  if (state.isDraggingPoint) {
     state.isDraggingPoint = false;
     activeDragPointIndex = null;
     svgEls.blobSvg.releasePointerCapture(e.pointerId);
     updateBlobSVG(svgEls);
  }
});
