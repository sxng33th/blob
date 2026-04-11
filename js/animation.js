
function startAnimation(randomShapeCallback) {
  if (state.animInterval) clearInterval(state.animInterval);
  randomShapeCallback(); 
  state.animInterval = setInterval(randomShapeCallback, state.animTiming);
}

function stopAnimation() {
  if (state.animInterval) {
    clearInterval(state.animInterval);
    state.animInterval = null;
  }
}

function changeTiming(timing, randomShapeCallback) {
  state.animTiming = parseInt(timing);
  if (state.animInterval) {
    startAnimation(randomShapeCallback);
  }
}
