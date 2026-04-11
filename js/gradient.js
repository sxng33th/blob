import { state } from './state.js';

function getPrimaryColor() {
  return state.stops.length > 0 ? state.stops[0].color : state.solidColor;
}

export function updateGradientSVG(svgEls) {
  // Update structural SVGs inner stops natively
  let stopsMarkup = state.stops.map(s => `<stop offset="${s.offset}%" stop-color="${s.color}" />`).join('');
  
  svgEls.blobGradLin.innerHTML = stopsMarkup;
  svgEls.blobGradRad.innerHTML = stopsMarkup;

  const rad = state.gradAngle * (Math.PI / 180);
  const R = 50 * (state.gradSpread / 100);
  const x1 = Math.round(50 - Math.cos(rad) * R) + '%';
  const y1 = Math.round(50 - Math.sin(rad) * R) + '%';
  const x2 = Math.round(50 + Math.cos(rad) * R) + '%';
  const y2 = Math.round(50 + Math.sin(rad) * R) + '%';
  
  svgEls.blobGradLin.setAttribute('x1', x1);
  svgEls.blobGradLin.setAttribute('y1', y1);
  svgEls.blobGradLin.setAttribute('x2', x2);
  svgEls.blobGradLin.setAttribute('y2', y2);
  svgEls.blobGradRad.setAttribute('r', R + '%');

  // mode
  if (state.fillMode === 'solid') {
    svgEls.blobPath.setAttribute('fill', state.solidColor);
    svgEls.blobSvg.style.filter = `drop-shadow(0 0 40px ${state.solidColor}50)`;
  } else if (state.fillMode === 'linear') {
    svgEls.blobPath.setAttribute('fill', 'url(#blob-grad-linear)');
    svgEls.blobSvg.style.filter = `drop-shadow(0 0 40px ${getPrimaryColor()}50)`;
  } else if (state.fillMode === 'radial') {
    svgEls.blobPath.setAttribute('fill', 'url(#blob-grad-radial)');
    svgEls.blobSvg.style.filter = `drop-shadow(0 0 40px ${getPrimaryColor()}50)`;
  }
}

export function buildStopsUI(container, onChangeCallback) {
  container.innerHTML = '';
  state.stops.forEach((stop) => {
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

    // Events
    const syncColor = (val) => {
      if(!val.startsWith('#')) val = '#' + val;
      const regex = /^#([0-9A-F]{3}){1,6}$/i;
      if(regex.test(val)) {
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

    if (state.stops.length > 2) {
      const rmBtn = document.createElement('button');
      rmBtn.className = 'btn-reset';
      rmBtn.style.padding = '0 0.5rem';
      rmBtn.textContent = '✖';
      rmBtn.addEventListener('click', () => {
        state.stops = state.stops.filter(s => s.id !== stop.id);
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

export function addStop(container, onChangeCallback) {
  state.stops.push({ id: state.nextStopId++, color: '#ffffff', offset: 50 });
  buildStopsUI(container, onChangeCallback);
  onChangeCallback();
}
