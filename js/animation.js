import { state } from './state.js';

export function updateTransitions(blobPath) {
  blobPath.style.transition = `d ${state.animTiming}ms ${state.animEase}, fill 0.2s ease`;
}

export function startAnimation(blobPath, randomShapeCallback) {
  if (state.animInterval) clearInterval(state.animInterval);
  updateTransitions(blobPath);
  randomShapeCallback(); // trigger first jump sync
  state.animInterval = setInterval(randomShapeCallback, state.animTiming);
}

export function stopAnimation() {
  if (state.animInterval) {
    clearInterval(state.animInterval);
    state.animInterval = null;
  }
}

export function changeTiming(timing, blobPath, randomShapeCallback) {
  state.animTiming = parseInt(timing);
  if (state.animInterval) {
    startAnimation(blobPath, randomShapeCallback);
  } else {
    updateTransitions(blobPath);
  }
}
