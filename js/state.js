function generateDefaultBlob(id) {
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

const state = {
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

function getActiveBlob() {
  return state.blobs[state.activeBlobIndex];
}
