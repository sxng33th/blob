import { state, getActiveBlob } from '../core/state.js';

export function initRadii() {
  const blob = getActiveBlob();
  blob.radii = Array(blob.numPoints).fill(75);
}

export function randomizeRadii(allLayers = false) {
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

export function getPoints(blob) {
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

export function generatePath(blob) {
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
export function updateBlobSVG(svgEls) {
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
    const easeActive = (state.isDraggingPoint && idx === state.activeBlobIndex) ? 'none' : `d ${state.animTiming}ms ${state.animEase}, fill 0.2s ease`;
    path.style.transition = easeActive;
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
      circle.setAttribute('r', '6');
      circle.setAttribute('fill', '#050505');
      circle.setAttribute('stroke', '#ffffff');
      circle.setAttribute('stroke-width', '2');
      circle.style.cursor = 'grab';
      svgEls.pointsGroup.appendChild(circle);
      pointCircles.push(circle);
    }
  }
  
  for(let i=0; i<activeBlob.numPoints; i++) {
    const easeCircle = state.isDraggingPoint ? 'none' : `cx ${duration}ms ${ease}, cy ${duration}ms ${ease}`;
    if (state.isDraggingPoint) {
      pointCircles[i].style.cursor = 'grabbing';
    } else {
      pointCircles[i].style.cursor = 'grab';
    }
    pointCircles[i].style.transition = easeCircle;
    pointCircles[i].setAttribute('cx', pts[i].x);
    pointCircles[i].setAttribute('cy', pts[i].y);
  }
}
