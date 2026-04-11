
function getPrimaryColor(blob) {
  return blob.stops.length > 0 ? blob.stops[0].color : blob.solidColor;
}

function updateGradientSVG(svgEls) {
  let defsMarkup = '';
  
  if (state.gooeyMerge) {
    defsMarkup += `
      <filter id="gooey" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur in="SourceGraphic" stdDeviation="15" result="blur" />
        <feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 25 -10" result="gooey" />
      </filter>
    `;
  }

  if (state.globalBlur > 0 || state.globalNoise > 0) {
    let blurStr = '';
    let noiseStr = '';
    let currentIn = 'SourceGraphic';

    if (state.globalBlur > 0) {
      blurStr = `<feGaussianBlur in="${currentIn}" stdDeviation="${state.globalBlur}" result="blurOut" />`;
      currentIn = 'blurOut';
    }

    if (state.globalNoise > 0) {
      const opacity = state.globalNoise / 100;
      noiseStr = `
        <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" result="noise" />
        <feColorMatrix in="noise" type="matrix" values="0.33 0.33 0.33 0 0  0.33 0.33 0.33 0 0  0.33 0.33 0.33 0 0  0 0 0 ${opacity} 0" result="monoNoise" />
        <feBlend mode="overlay" in="monoNoise" in2="${currentIn}" result="blendOut" />
        <feComposite operator="in" in="blendOut" in2="${currentIn}" result="noiseOut" />
      `;
      currentIn = 'noiseOut';
    }
    
    defsMarkup += `
      <filter id="post-process" x="-50%" y="-50%" width="200%" height="200%">
        ${blurStr}
        ${noiseStr}
      </filter>
    `;
  }

  state.blobs.forEach(blob => {
    const stopsMarkup = blob.stops.map(s => `<stop offset="${s.offset}%" stop-color="${s.color}" />`).join('');
    
    const rad = blob.gradAngle * (Math.PI / 180);
    const R = 50 * (blob.gradSpread / 100);
    const x1 = Math.round(50 - Math.cos(rad) * R) + '%';
    const y1 = Math.round(50 - Math.sin(rad) * R) + '%';
    const x2 = Math.round(50 + Math.cos(rad) * R) + '%';
    const y2 = Math.round(50 + Math.sin(rad) * R) + '%';
    const fx = Math.round(50 - Math.cos(rad) * (R * 0.5)) + '%';
    const fy = Math.round(50 - Math.sin(rad) * (R * 0.5)) + '%';
    
    defsMarkup += `
      <linearGradient id="blob-grad-linear-${blob.id}" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}">
        ${stopsMarkup}
      </linearGradient>
      <radialGradient id="blob-grad-radial-${blob.id}" cx="50%" cy="50%" r="${R}%" fx="${fx}" fy="${fy}">
        ${stopsMarkup}
      </radialGradient>
    `;
  });

  svgEls.defsGroup.innerHTML = defsMarkup;
}

function updateGradientAnglesDOM() {
  state.blobs.forEach(blob => {
    const rad = blob.gradAngle * (Math.PI / 180);
    const R = 50 * (blob.gradSpread / 100);

    const x1 = Math.round(50 - Math.cos(rad) * R) + '%';
    const y1 = Math.round(50 - Math.sin(rad) * R) + '%';
    const x2 = Math.round(50 + Math.cos(rad) * R) + '%';
    const y2 = Math.round(50 + Math.sin(rad) * R) + '%';
    
    const linear = document.getElementById(`blob-grad-linear-${blob.id}`);
    if (linear) {
       linear.setAttribute('x1', x1);
       linear.setAttribute('y1', y1);
       linear.setAttribute('x2', x2);
       linear.setAttribute('y2', y2);
    }
    
    const fx = Math.round(50 - Math.cos(rad) * (R * 0.5)) + '%';
    const fy = Math.round(50 - Math.sin(rad) * (R * 0.5)) + '%';
    const radial = document.getElementById(`blob-grad-radial-${blob.id}`);
    if (radial) {
       radial.setAttribute('fx', fx);
       radial.setAttribute('fy', fy);
    }
  });
}

function syncGradAngleUI() {
  const angleSlider = document.getElementById('grad-angle');
  if (angleSlider && document.getElementById('gradient-controls').style.display !== 'none') {
    const val = Math.round(getActiveBlob().gradAngle);
    angleSlider.value = val;
    document.getElementById('grad-angle-val').textContent = val + '°';
  }
}

function buildStopsUI(container, onChangeCallback) {
  const blob = getActiveBlob();
  container.innerHTML = '';
  blob.stops.forEach((stop) => {
    const row = document.createElement('div');
    row.className = 'stop-row';

    const colorWrap = document.createElement('div');
    colorWrap.className = 'color-with-hex';
    colorWrap.style.flex = '1';

    const colorPicker = document.createElement('input');
    colorPicker.type = 'color';
    colorPicker.value = stop.color;
    
    const hexInput = document.createElement('input');
    hexInput.type = 'text';
    hexInput.className = 'hex-input';
    hexInput.value = stop.color;
    hexInput.style.flex = '1';

    colorWrap.appendChild(colorPicker);
    colorWrap.appendChild(hexInput);

    const offsetInput = document.createElement('input');
    offsetInput.type = 'number';
    offsetInput.className = 'offset-input';
    offsetInput.min = '0';
    offsetInput.max = '100';
    offsetInput.value = stop.offset;

    const syncColor = (val) => {
      if(!val.startsWith('#')) val = '#' + val;
      if(/^#([0-9A-F]{3}){1,6}$/i.test(val)) {
        stop.color = val;
        colorPicker.value = val;
        hexInput.value = val;
        onChangeCallback();
      } else {
        hexInput.value = stop.color;
      }
    };
    colorPicker.addEventListener('input', (e) => syncColor(e.target.value));
    hexInput.addEventListener('change', (e) => syncColor(e.target.value));

    offsetInput.addEventListener('change', (e) => {
      let v = parseInt(e.target.value);
      if(isNaN(v)) v = 0;
      if(v < 0) v = 0;
      if(v > 100) v = 100;
      e.target.value = v;
      stop.offset = v;
      onChangeCallback();
    });

    row.appendChild(colorWrap);
    row.appendChild(offsetInput);

    if (blob.stops.length > 2) {
      const rmBtn = document.createElement('button');
      rmBtn.className = 'btn-reset';
      rmBtn.style.padding = '0 0.5rem';
      rmBtn.textContent = '✖';
      rmBtn.addEventListener('click', () => {
        blob.stops = blob.stops.filter(s => s.id !== stop.id);
        buildStopsUI(container, onChangeCallback);
        onChangeCallback();
      });
      row.appendChild(rmBtn);
    } else {
       const spacer = document.createElement('div');
       spacer.style.width = '24px';
       row.appendChild(spacer);
    }
    
    container.appendChild(row);
  });
}

function addStop(container, onChangeCallback) {
  const blob = getActiveBlob();
  blob.stops.push({ id: blob.nextStopId++, color: '#ffffff', offset: 50 });
  buildStopsUI(container, onChangeCallback);
  onChangeCallback();
}
