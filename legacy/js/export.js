
function generateSVGMarkup(svgEls) {
  const maxSize = Math.max(...state.blobs.map(b => b.size || 300));
  let defsMarkup = '';
  
  if (state.gooeyMerge) {
    defsMarkup += `    <filter id="gooey" x="-50%" y="-50%" width="200%" height="200%">\n      <feGaussianBlur in="SourceGraphic" stdDeviation="15" result="blur" />\n      <feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 25 -10" result="gooey" />\n      <feComposite in="SourceGraphic" in2="gooey" operator="atop"/>\n    </filter>\n`;
  }

  if (state.globalBlur > 0 || state.globalNoise > 0) {
    let blurStr = '';
    let noiseStr = '';
    let currentIn = 'SourceGraphic';

    if (state.globalBlur > 0) {
      blurStr = `      <feGaussianBlur in="${currentIn}" stdDeviation="${state.globalBlur}" result="blurOut" />\n`;
      currentIn = 'blurOut';
    }
    if (state.globalNoise > 0) {
      const op = state.globalNoise / 100;
      noiseStr = `      <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" result="noise" />\n      <feColorMatrix in="noise" type="matrix" values="0.33 0.33 0.33 0 0  0.33 0.33 0.33 0 0  0.33 0.33 0.33 0 0  0 0 0 ${op} 0" result="monoNoise" />\n      <feBlend mode="overlay" in="monoNoise" in2="${currentIn}" result="blendOut" />\n      <feComposite operator="in" in="blendOut" in2="${currentIn}" result="noiseOut" />\n`;
      currentIn = 'noiseOut';
    }
    defsMarkup += `    <filter id="post-process" x="-50%" y="-50%" width="200%" height="200%">\n${blurStr}${noiseStr}    </filter>\n`;
  }

  state.blobs.forEach(blob => {
    const stopsMarkup = blob.stops.map(s => `      <stop offset="${s.offset}%" stop-color="${s.color}" />`).join('\n');
    
    const rad = blob.gradAngle * (Math.PI / 180);
    const R = 50 * (blob.gradSpread / 100);
    const x1 = Math.round(50 - Math.cos(rad) * R) + '%';
    const y1 = Math.round(50 - Math.sin(rad) * R) + '%';
    const x2 = Math.round(50 + Math.cos(rad) * R) + '%';
    const y2 = Math.round(50 + Math.sin(rad) * R) + '%';
    
    defsMarkup += `    <linearGradient id="blob-grad-linear-${blob.id}" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}">\n${stopsMarkup}\n    </linearGradient>\n`;
    defsMarkup += `    <radialGradient id="blob-grad-radial-${blob.id}" cx="50%" cy="50%" r="${R}%">\n${stopsMarkup}\n    </radialGradient>\n`;
  });

  const pathMarkup = state.blobs.map(blob => {
      let fillTarg = '';
      if (blob.fillMode === 'solid') fillTarg = blob.solidColor;
      else if (blob.fillMode === 'linear') fillTarg = `url(#blob-grad-linear-${blob.id})`;
      else if (blob.fillMode === 'radial') fillTarg = `url(#blob-grad-radial-${blob.id})`;

      let styleStr = '';
      if (blob.blendMode && blob.blendMode !== 'normal') {
          styleStr += ` style="mix-blend-mode: ${blob.blendMode};"`;
      }
      
      const scale = (blob.size || 300) / maxSize;
      return `    <path fill="${fillTarg}" transform="scale(${scale})" d="${generatePath(blob)}"${styleStr} />`;
  }).join('\n');

  let postProcStart = '';
  let postProcEnd = '';
  if (state.globalBlur > 0 || state.globalNoise > 0) {
    postProcStart = '  <g filter="url(#post-process)">\n';
    postProcEnd = '  </g>\n';
  }

  let activeFilter = state.gooeyMerge ? ' filter="url(#gooey)"' : '';

  return `<svg width="${maxSize}" height="${maxSize}" viewBox="-110 -110 220 220" xmlns="http://www.w3.org/2000/svg" style="overflow: visible;">\n  <defs>\n${defsMarkup}  </defs>\n${postProcStart}  <g id="blobs-group"${activeFilter}>\n${pathMarkup}\n  </g>\n${postProcEnd}</svg>`;
}

function generateAnimatedSVGMarkup(svgEls) {
  const frames = 4;
  const originalBlobs = JSON.parse(JSON.stringify(state.blobs));
  const pathFrames = Array(originalBlobs.length).fill().map(() => []);
  
  // Frame Generation
  for (let f = 0; f < frames; f++) {
      state.blobs.forEach(blob => {
         for(let i=0; i<blob.numPoints; i++) {
            blob.radii[i] = Math.floor(Math.random() * 85) + 16;
         }
      });
      state.blobs.forEach((blob, idx) => {
         pathFrames[idx].push(generatePath(blob));
      });
  }
  
  // Append first frame to close the loop smoothly
  state.blobs.forEach((blob, idx) => {
      pathFrames[idx].push(pathFrames[idx][0]);
  });
  
  state.blobs = originalBlobs;

  const maxSize = Math.max(...state.blobs.map(b => b.size || 300));
  let defsMarkup = '';
  
  if (state.gooeyMerge) {
    defsMarkup += `    <filter id="gooey" x="-50%" y="-50%" width="200%" height="200%">\n      <feGaussianBlur in="SourceGraphic" stdDeviation="15" result="blur" />\n      <feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 25 -10" result="gooey" />\n    </filter>\n`;
  }

  if (state.globalBlur > 0 || state.globalNoise > 0) {
    let blurStr = '';
    let noiseStr = '';
    let currentIn = 'SourceGraphic';

    if (state.globalBlur > 0) {
      blurStr = `      <feGaussianBlur in="${currentIn}" stdDeviation="${state.globalBlur}" result="blurOut" />\n`;
      currentIn = 'blurOut';
    }
    if (state.globalNoise > 0) {
      const op = state.globalNoise / 100;
      noiseStr = `      <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" result="noise" />\n      <feColorMatrix in="noise" type="matrix" values="0.33 0.33 0.33 0 0  0.33 0.33 0.33 0 0  0.33 0.33 0.33 0 0  0 0 0 ${op} 0" result="monoNoise" />\n      <feBlend mode="overlay" in="monoNoise" in2="${currentIn}" result="blendOut" />\n      <feComposite operator="in" in="blendOut" in2="${currentIn}" result="noiseOut" />\n`;
      currentIn = 'noiseOut';
    }
    defsMarkup += `    <filter id="post-process" x="-50%" y="-50%" width="200%" height="200%">\n${blurStr}${noiseStr}    </filter>\n`;
  }

  const loopDur = (state.animTiming * frames) / 1000; // in seconds

  state.blobs.forEach(blob => {
    let rotAnimStr = '';
    if (state.gradRotate) {
        // rotation duration relative to speed. e.g. speed 50 = 100 deg/sec = 3.6s per full loop
        const secPerRot = 360 / (Math.max(1, state.gradRotSpeed) * 2);
        rotAnimStr = `      <animateTransform attributeName="gradientTransform" type="rotate" from="0 0.5 0.5" to="360 0.5 0.5" dur="${secPerRot.toFixed(2)}s" repeatCount="indefinite" />\n`;
    }

    const stopsMarkup = blob.stops.map(s => `      <stop offset="${s.offset}%" stop-color="${s.color}" />`).join('\n');
    const rad = blob.gradAngle * (Math.PI / 180);
    const R = 50 * (blob.gradSpread / 100);
    const x1 = Math.round(50 - Math.cos(rad) * R) + '%';
    const y1 = Math.round(50 - Math.sin(rad) * R) + '%';
    const x2 = Math.round(50 + Math.cos(rad) * R) + '%';
    const y2 = Math.round(50 + Math.sin(rad) * R) + '%';
    const fx = Math.round(50 - Math.cos(rad) * (R * 0.5)) + '%';
    const fy = Math.round(50 - Math.sin(rad) * (R * 0.5)) + '%';
    
    defsMarkup += `    <linearGradient id="blob-grad-linear-${blob.id}" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}">\n${rotAnimStr}${stopsMarkup}\n    </linearGradient>\n`;
    defsMarkup += `    <radialGradient id="blob-grad-radial-${blob.id}" cx="50%" cy="50%" r="${R}%" fx="${fx}" fy="${fy}">\n${stopsMarkup}\n    </radialGradient>\n`;
  });

  const pathMarkup = state.blobs.map((blob, idx) => {
      let fillTarg = '';
      if (blob.fillMode === 'solid') fillTarg = blob.solidColor;
      else if (blob.fillMode === 'linear') fillTarg = `url(#blob-grad-linear-${blob.id})`;
      else if (blob.fillMode === 'radial') fillTarg = `url(#blob-grad-radial-${blob.id})`;

      let styleStr = '';
      if (blob.blendMode && blob.blendMode !== 'normal') {
          styleStr += ` style="mix-blend-mode: ${blob.blendMode};"`;
      }
      
      const scale = (blob.size || 300) / maxSize;
      
      const animValues = pathFrames[idx].join(';');
      
      return `    <path fill="${fillTarg}" transform="scale(${scale})"${styleStr}>\n      <animate attributeName="d" dur="${loopDur.toFixed(2)}s" repeatCount="indefinite" calcMode="spline" keyTimes="0;0.25;0.5;0.75;1" keySplines="0.4 0 0.6 1; 0.4 0 0.6 1; 0.4 0 0.6 1; 0.4 0 0.6 1" values="${animValues}" />\n    </path>`;
  }).join('\n');

  let postProcStart = '';
  let postProcEnd = '';
  if (state.globalBlur > 0 || state.globalNoise > 0) {
    postProcStart = '  <g filter="url(#post-process)">\n';
    postProcEnd = '  </g>\n';
  }
  let activeFilter = state.gooeyMerge ? ' filter="url(#gooey)"' : '';

  return `<svg width="${maxSize}" height="${maxSize}" viewBox="-110 -110 220 220" xmlns="http://www.w3.org/2000/svg" style="overflow: visible;">\n  <defs>\n${defsMarkup}  </defs>\n${postProcStart}  <g id="blobs-group"${activeFilter}>\n${pathMarkup}\n  </g>\n${postProcEnd}</svg>`;
}

function showToast(msg) {
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2000);
}
