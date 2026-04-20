export function generateDefaultBlob(id) {
  return {
    id: id,
    name: `Blob ${id}`,
    numPoints: 8,
    radii: Array(8).fill(75),
    roundness: 40,
    size: 300,
    fillMode: 'linear',
    solidColor: '#ff0080',
    gradAngle: 45,
    gradSpread: 100,
    blendMode: 'normal',
    stops: [
      { id: 1, color: '#ff0080', offset: 0 },
      { id: 2, color: '#7928ca', offset: 100 }
    ],
    nextStopId: 3
  };
}

export const state = {
  blobs: [generateDefaultBlob(1)],
  activeBlobIndex: 0,
  nextBlobId: 2,
  
  showPoints: false,
  isDraggingPoint: false,
  animInterval: null,
  animTiming: 500,
  animEase: 'ease-out',
  gradRotate: false,
  gradRotSpeed: 50,
  gooeyMerge: false,
  globalBlur: 0,
  globalNoise: 0
};

export function getActiveBlob() {
  return state.blobs[state.activeBlobIndex];
}

export function readUIState() {
  return {
    data: {
      title: document.getElementById('input-title')?.value || 'Event Name',
      date: document.getElementById('input-date')?.value || 'Date & Time',
      location: document.getElementById('input-location')?.value || 'Location',
      host: document.getElementById('input-host')?.value || 'Host'
    },
    features: {
      hideText: document.getElementById('toggle-text')?.checked || false,
      includeGrid: document.getElementById('toggle-grid')?.checked || false,
      includeShapes: document.getElementById('toggle-shapes')?.checked || false
    },
    style: {
      filterEffect: document.getElementById('select-filter')?.value || 'none',
      aspectRatio: document.getElementById('select-aspect')?.value || '4/5',
      font: document.getElementById('select-font')?.value || 'Inter',
      palette: document.getElementById('select-palette')?.value || 'sunset',
      textColorOption: document.getElementById('select-text-color')?.value || 'auto',
      bgStyle: document.getElementById('select-bg-style')?.value || 'fluid-mesh'
    }
  };
}
