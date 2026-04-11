import { state } from './state.js';

export function initRadii() {
  state.radii = Array(state.numPoints).fill(100);
}

export function randomizeRadii() {
  for(let i=0; i<state.numPoints; i++) {
    state.radii[i] = Math.floor(Math.random() * 85) + 16; 
  }
}

export function getPoints() {
  const pts = [];
  const angleStep = (Math.PI * 2) / state.numPoints;
  for(let i=0; i<state.numPoints; i++) {
    const angle = i * angleStep;
    const r = state.radii[i];
    pts.push({
      x: Math.cos(angle) * r,
      y: Math.sin(angle) * r
    });
  }
  return pts;
}

export function generatePath() {
  const pts = getPoints();
  const n = pts.length;
  const k = (state.roundness / 100) * 0.4;
  
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
  svgEls.blobPath.setAttribute('d', generatePath());
  
  const pts = getPoints();
  const duration = state.animTiming;
  const ease = state.animEase;

  if (pointCircles.length !== state.numPoints) {
    svgEls.pointsGroup.innerHTML = '';
    pointCircles = [];
    for(let i=0; i<state.numPoints; i++) {
      const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      circle.setAttribute('r', '4');
      circle.setAttribute('fill', '#050505');
      circle.setAttribute('stroke', '#ffffff');
      circle.setAttribute('stroke-width', '1.5');
      svgEls.pointsGroup.appendChild(circle);
      pointCircles.push(circle);
    }
  }
  
  for(let i=0; i<state.numPoints; i++) {
    pointCircles[i].style.transition = `cx ${duration}ms ${ease}, cy ${duration}ms ${ease}`;
    pointCircles[i].setAttribute('cx', pts[i].x);
    pointCircles[i].setAttribute('cy', pts[i].y);
  }
}

export function buildRadiiUI(container, onChangeCallback) {
  container.innerHTML = '';
  for(let i=0; i<state.numPoints; i++) {
    const row = document.createElement('div');
    row.className = 'input-row';
    
    const label = document.createElement('span');
    label.className = 'label';
    label.textContent = `Point ${i+1}`;
    
    const input = document.createElement('input');
    input.type = 'range';
    input.min = '10';
    input.max = '100';
    input.value = state.radii[i];
    
    const valSpan = document.createElement('span');
    valSpan.className = 'value';
    valSpan.style.width = '35px';
    valSpan.textContent = state.radii[i];

    input.addEventListener('input', (e) => {
      state.radii[i] = parseInt(e.target.value);
      valSpan.textContent = state.radii[i];
      onChangeCallback();
    });

    row.appendChild(label);
    row.appendChild(input);
    row.appendChild(valSpan);
    container.appendChild(row);
  }
}

export function syncRadiiUI(container) {
  const inputs = container.querySelectorAll('input[type="range"]');
  inputs.forEach((input, i) => {
    input.value = state.radii[i];
    input.nextElementSibling.textContent = state.radii[i];
  });
}
