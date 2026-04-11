
function generateSVGMarkup(svgEls) {
  let defsMarkup = '';
  
  if (state.gooeyMerge) {
    defsMarkup += `    <filter id="gooey" x="-50%" y="-50%" width="200%" height="200%">\n      <feGaussianBlur in="SourceGraphic" stdDeviation="15" result="blur" />\n      <feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 25 -10" result="gooey" />\n      <feComposite in="SourceGraphic" in2="gooey" operator="atop"/>\n    </filter>\n`;
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
      if(blob.blendMode !== 'normal') styleStr = ` style="mix-blend-mode: ${blob.blendMode};"`;
      
      return `    <path fill="${fillTarg}" d="${generatePath(blob)}"${styleStr} />`;
  }).join('\n');

  let postProcStart = '';
  let postProcEnd = '';
  if (state.globalBlur > 0 || state.globalNoise > 0) {
    postProcStart = '  <g filter="url(#post-process)">\n';
    postProcEnd = '  </g>\n';
  }

  return `<svg viewBox="-110 -110 220 220" xmlns="http://www.w3.org/2000/svg">\n  <defs>\n${defsMarkup}  </defs>\n${postProcStart}  <g id="blobs-group"${activeFilter}>\n${pathMarkup}\n  </g>\n${postProcEnd}</svg>`;
}

function showToast(msg) {
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2000);
}
