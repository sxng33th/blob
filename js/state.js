export const state = {
  numPoints: 8,
  radii: Array(8).fill(100),
  roundness: 40,
  size: 300,
  showPoints: false,
  fillMode: 'linear', // solid, linear, radial
  solidColor: '#ff0080',
  gradAngle: 45,
  gradSpread: 100,
  stops: [
    { id: 1, color: '#ff0080', offset: 0 },
    { id: 2, color: '#7928ca', offset: 100 }
  ],
  animInterval: null,
  animTiming: 500,
  animEase: 'ease-out',
  nextStopId: 3
};
