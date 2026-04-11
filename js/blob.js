
function initRadii() {
  const blob = getActiveBlob();
  blob.radii = Array(blob.numPoints).fill(100);
}

function randomizeRadii(allLayers = false) {
  if (allLayers) {
    state.blobs.forEach(blob => {
      for(let i=0; i<blob.numPoints; i++) {
        blob.radii[i] = Math.floor(Math.random() * 85) + 16; 
      }
    });
  } else {
    const blob = getActiveBlob();
    for(let i=0; i<blob.numPoints; i++) {
      blob.radii[i] = Math.floor(Math.random() * 85) + 16; 
    }
  }
}

function getPoints(blob) {
  const pts = [];
  const angleStep = (Math.PI * 2) / blob.numPoints;
  for(let i=0; i<blob.numPoints; i++) {
    const angle = i * angleStep;
    const r = blob.radii[i];
    pts.push({
      x: Math.cos(angle) * r,
      y: Math.sin(angle) * r
    });
  }
  return pts;
}

function generatePath(blob) {
  const pts = getPoints(blob);
  const n = pts.length;
  const k = (blob.roundness / 100) * 0.4;
  
  if(n === 0) return '';
  let d = `M ${pts[0].x},${pts[0].y}`;
  for (let i = 0; i < n; i++) {
    let p0 = pts[(i - 1 + n) % n];
    let p1 = pts[i];
    let p2 = pts[(i + 1) % n];
    let p3 = pts[(i + 2) % n];

    let cp1x = p1.x + (p2.x - p0.x) * k;
    let cp1y = p1.y + (p2.y - p0.y) * k;

    let cp2x = p2.x - (p3.x - p1.x) * k;
    let cp2y = p2.y - (p3.y - p1.y) * k;

    d += ` C ${cp1x},${cp1y} ${cp2x},${cp2y} ${p2.x},${p2.y}`;
  }
  return d;
}

let pointCircles = [];
function updateBlobSVG(svgEls) {
  const maxSize = Math.max(...state.blobs.map(b => b.size || 300));
  
  svgEls.blobSvg.style.width = maxSize + 'px';
  svgEls.blobSvg.style.height = maxSize + 'px';

  while(svgEls.blobsGroup.children.length > state.blobs.length) {
    svgEls.blobsGroup.removeChild(svgEls.blobsGroup.lastChild);
  }
  while(svgEls.blobsGroup.children.length < state.blobs.length) {
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    svgEls.blobsGroup.appendChild(path);
  }
  
  state.blobs.forEach((blob, idx) => {
    const path = svgEls.blobsGroup.children[idx];
    path.setAttribute('d', generatePath(blob));
    
    const scale = (blob.size || 300) / maxSize;
    path.setAttribute('transform', `scale(${scale})`);
    
    if (blob.fillMode === 'solid') {
      path.setAttribute('fill', blob.solidColor);
    } else if (blob.fillMode === 'linear') {
      path.setAttribute('fill', `url(#blob-grad-linear-${blob.id})`);
    } else if (blob.fillMode === 'radial') {
      path.setAttribute('fill', `url(#blob-grad-radial-${blob.id})`);
    }
    
    path.style.mixBlendMode = blob.blendMode;
    path.style.transition = `d ${state.animTiming}ms ${state.animEase}, fill 0.2s ease`;
  });

  const activeBlob = getActiveBlob();
  const pts = getPoints(activeBlob);
  const duration = state.animTiming;
  const ease = state.animEase;

  const activeScale = (activeBlob.size || 300) / maxSize;
  svgEls.pointsGroup.setAttribute('transform', `scale(${activeScale})`);

  if (pointCircles.length !== activeBlob.numPoints) {
    svgEls.pointsGroup.innerHTML = '';
    pointCircles = [];
    for(let i=0; i<activeBlob.numPoints; i++) {
      const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      circle.setAttribute('r', '4');
      circle.setAttribute('fill', '#050505');
      circle.setAttribute('stroke', '#ffffff');
      circle.setAttribute('stroke-width', '1.5');
      svgEls.pointsGroup.appendChild(circle);
      pointCircles.push(circle);
    }
  }
  
  for(let i=0; i<activeBlob.numPoints; i++) {
    pointCircles[i].style.transition = `cx ${duration}ms ${ease}, cy ${duration}ms ${ease}`;
    pointCircles[i].setAttribute('cx', pts[i].x);
    pointCircles[i].setAttribute('cy', pts[i].y);
  }
}

function buildRadiiUI(container, onChangeCallback) {
  const blob = getActiveBlob();
  container.innerHTML = '';
  for(let i=0; i<blob.numPoints; i++) {
    const row = document.createElement('div');
    row.className = 'input-row';
    
    const label = document.createElement('span');
    label.className = 'label';
    label.textContent = `Point ${i+1}`;
    
    const input = document.createElement('input');
    input.type = 'range';
    input.min = '10';
    input.max = '100';
    input.value = blob.radii[i];
    
    const valSpan = document.createElement('span');
    valSpan.className = 'value';
    valSpan.style.width = '35px';
    valSpan.textContent = blob.radii[i];

    input.addEventListener('input', (e) => {
      blob.radii[i] = parseInt(e.target.value);
      valSpan.textContent = blob.radii[i];
      onChangeCallback();
    });

    row.appendChild(label);
    row.appendChild(input);
    row.appendChild(valSpan);
    container.appendChild(row);
  }
}

function syncRadiiUI(container) {
  const blob = getActiveBlob();
  const rows = container.children;
  for(let i=0; i<blob.numPoints; i++) {
    if (i < rows.length) {
      const input = rows[i].children[1];
      const valSpan = rows[i].children[2];
      input.value = blob.radii[i];
      valSpan.textContent = blob.radii[i];
    }
  }
}
