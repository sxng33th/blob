const blobSvg = document.getElementById('blob-svg');
const blobPath = document.getElementById('blob-path');
const pointsGroup = document.getElementById('points-group');
const showPointsToggle = document.getElementById('show-points-toggle');
const sizeSlider = document.getElementById('size-slider');
const sizeVal = document.getElementById('size-val');
const pointsSlider = document.getElementById('points-slider');
const pointsVal = document.getElementById('points-val');
const roundnessSlider = document.getElementById('roundness-slider');
const roundnessVal = document.getElementById('roundness-val');
const fillColor = document.getElementById('fill-color');
const fillHex = document.getElementById('fill-hex');
const toast = document.getElementById('toast');
const dynamicControls = document.getElementById('dynamic-controls');
const copyBtn = document.getElementById('copy-btn');
const randomBtn = document.getElementById('random-btn');
const resetBtn = document.getElementById('reset-btn');

// Animate Panel controls
const playBtn = document.getElementById('play-btn');
const stopBtn = document.getElementById('stop-btn');
const timingSlider = document.getElementById('timing-slider');
const timingVal = document.getElementById('timing-val');
const easeSelect = document.getElementById('ease-select');

let numPoints = 8;
let radii = [];
let animInterval = null;

function initRadii() {
  radii = [];
  for(let i=0; i<numPoints; i++){
    radii.push(100);
  }
}

function showToast(msg) {
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => {
    toast.classList.remove('show');
  }, 2000);
}

// Convert radius values to circular cartesian coordinates
function getPoints() {
  const pts = [];
  const angleStep = (Math.PI * 2) / numPoints;
  for(let i=0; i<numPoints; i++) {
    const angle = i * angleStep;
    const r = radii[i];
    pts.push({
      x: Math.cos(angle) * r,
      y: Math.sin(angle) * r
    });
  }
  return pts;
}

// Generate smooth bezier curve across all N points
function generatePath() {
  const pts = getPoints();
  const n = pts.length;
  
  const roundness = parseInt(roundnessSlider.value) / 100;
  const k = roundness * 0.4;
  
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
function updatePointVisuals() {
  const pts = getPoints();
  const duration = timingSlider ? timingSlider.value : 500;
  const ease = easeSelect ? easeSelect.value : 'ease-out';

  if (pointCircles.length !== numPoints) {
    pointsGroup.innerHTML = '';
    pointCircles = [];
    for(let i=0; i<numPoints; i++) {
      const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      circle.setAttribute('r', '4');
      circle.setAttribute('fill', '#050505');
      circle.setAttribute('stroke', '#ffffff');
      circle.setAttribute('stroke-width', '1.5');
      pointsGroup.appendChild(circle);
      pointCircles.push(circle);
    }
  }
  
  for(let i=0; i<numPoints; i++) {
    pointCircles[i].style.transition = `cx ${duration}ms ${ease}, cy ${duration}ms ${ease}`;
    pointCircles[i].setAttribute('cx', pts[i].x);
    pointCircles[i].setAttribute('cy', pts[i].y);
  }
}

function updateBlob() {
  blobPath.setAttribute('d', generatePath());
  updatePointVisuals();
}

function updateRadiiFromInputs() {
  const inputs = dynamicControls.querySelectorAll('input[type="range"]');
  inputs.forEach((input, i) => {
    input.value = radii[i];
    input.nextElementSibling.textContent = radii[i];
  });
}

function buildConfigUI() {
  dynamicControls.innerHTML = '';
  for(let i=0; i<numPoints; i++) {
    const row = document.createElement('div');
    row.className = 'input-row';
    
    const label = document.createElement('span');
    label.className = 'label';
    label.textContent = `Point ${i+1}`;
    
    const input = document.createElement('input');
    input.type = 'range';
    input.min = '10'; // Extreme exaggeration allowed
    input.max = '100';
    input.value = radii[i];
    
    const valSpan = document.createElement('span');
    valSpan.className = 'value';
    valSpan.style.width = '35px';
    valSpan.textContent = radii[i];

    input.addEventListener('input', (e) => {
      radii[i] = parseInt(e.target.value);
      valSpan.textContent = radii[i];
      updateBlob();
    });

    row.appendChild(label);
    row.appendChild(input);
    row.appendChild(valSpan);
    dynamicControls.appendChild(row);
  }
}

function updateSvgTransitions() {
  const duration = timingSlider.value;
  const ease = easeSelect.value;
  blobPath.style.transition = `d ${duration}ms ${ease}, fill 0.2s ease`;
}

// Ensure JS is handling transitions synchronously with panels initially
updateSvgTransitions();

pointsSlider.addEventListener('input', (e) => {
  const newN = parseInt(e.target.value);
  pointsVal.textContent = newN;
  if(newN > numPoints) {
    for(let i=numPoints; i<newN; i++) radii.push(100);
  } else {
    radii = radii.slice(0, newN);
  }
  numPoints = newN;
  buildConfigUI();
  updateBlob();
});

showPointsToggle.addEventListener('change', (e) => {
  pointsGroup.style.opacity = e.target.checked ? '1' : '0';
});

roundnessSlider.addEventListener('input', (e) => {
  roundnessVal.textContent = `${e.target.value}%`;
  updateBlob();
});

sizeSlider.addEventListener('input', (e) => {
  const val = e.target.value;
  sizeVal.textContent = `${val}px`;
  blobSvg.style.width = `${val}px`;
  blobSvg.style.height = `${val}px`;
});

function handleColorChange(val) {
  fillColor.value = val;
  const normalizedHex = fillColor.value;
  fillHex.value = normalizedHex;
  blobPath.setAttribute('fill', normalizedHex);
  blobSvg.style.filter = `drop-shadow(0 0 40px ${normalizedHex}14)`;
}

fillColor.addEventListener('input', (e) => handleColorChange(e.target.value));

fillHex.addEventListener('change', (e) => {
  let val = e.target.value;
  if(!val.startsWith('#')) val = '#' + val;
  const regex = /^#([0-9A-F]{3}){1,2}$/i;
  if(regex.test(val)) {
    handleColorChange(val);
  } else {
    fillHex.value = fillColor.value;
  }
});

function copySVG() {
  const svgMarkup = `<svg viewBox="-110 -110 220 220" xmlns="http://www.w3.org/2000/svg">\n  <path fill="${fillColor.value}" d="${generatePath()}" />\n</svg>`;
  navigator.clipboard.writeText(svgMarkup).then(() => {
    showToast('SVG Copied!');
  }).catch(err => {
    console.error('Failed to copy: ', err);
    showToast('Copy Failed');
  });
}

function randomizeShape() {
  for(let i=0; i<numPoints; i++) {
    radii[i] = Math.floor(Math.random() * 85) + 16; 
  }
  updateRadiiFromInputs();
  updateBlob();
}

function reset() {
  if(animInterval) stopBtn.click();
  numPoints = 8;
  pointsSlider.value = numPoints;
  pointsVal.textContent = numPoints;
  roundnessSlider.value = 40;
  roundnessVal.textContent = '40%';
  showPointsToggle.checked = false;
  pointsGroup.style.opacity = '0';
  initRadii();
  buildConfigUI();
  updateBlob();
  
  sizeSlider.value = 300;
  sizeVal.textContent = '300px';
  blobSvg.style.width = '300px';
  blobSvg.style.height = '300px';
  
  // reset anim panel attributes natively 
  timingSlider.value = 500;
  timingVal.textContent = '500ms';
  easeSelect.value = 'ease-out';
  updateSvgTransitions();
  
  handleColorChange('#ffffff');
  showToast('Reset to Default');
}

// Animate Event Listeners
playBtn.addEventListener('click', () => {
  if (animInterval) clearInterval(animInterval);
  updateSvgTransitions();
  randomizeShape(); // Immediately trigger
  animInterval = setInterval(randomizeShape, parseInt(timingSlider.value));
  showToast('Animation Started');
});

stopBtn.addEventListener('click', () => {
  if (animInterval) {
    clearInterval(animInterval);
    animInterval = null;
    showToast('Animation Stopped');
  }
});

timingSlider.addEventListener('input', (e) => {
  timingVal.textContent = `${e.target.value}ms`;
  if (animInterval) {
    clearInterval(animInterval);
    updateSvgTransitions();
    animInterval = setInterval(randomizeShape, parseInt(e.target.value));
  } else {
    updateSvgTransitions();
  }
});

easeSelect.addEventListener('change', () => {
  updateSvgTransitions();
});


copyBtn.addEventListener('click', copySVG);
randomBtn.addEventListener('click', () => {
  randomizeShape();
  if(!animInterval) showToast('Random Shape Generated');
});
resetBtn.addEventListener('click', reset);

document.addEventListener('keydown', (e) => {
  if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT') return;
  if (e.key.toLowerCase() === 'c') {
    copySVG();
  } else if (e.key.toLowerCase() === 'r') {
    reset();
  } else if (e.key === ' ' || e.key.toLowerCase() === 'g') {
    e.preventDefault();
    randomizeShape();
    if(!animInterval) showToast('Random Shape Generated');
  }
});

// Init
initRadii();
buildConfigUI();
updateBlob();
handleColorChange('#ffffff');
