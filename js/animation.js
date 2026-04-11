let rAF_ID;
let lastTime = 0;

function startAnimation(randomShapeCallback) {
  if (state.animInterval) clearInterval(state.animInterval);
  randomShapeCallback(); 
  state.animInterval = setInterval(randomShapeCallback, state.animTiming);

  if (state.gradRotate) {
    lastTime = performance.now();
    const loop = (time) => {
      const dt = time - lastTime;
      lastTime = time;
      if (dt < 100) { 
         const rotateAmt = (state.gradRotSpeed * 2) * (dt / 1000);
         
         state.blobs.forEach(b => {
             b.gradAngle = (b.gradAngle + rotateAmt) % 360;
         });
         
         updateGradientAnglesDOM();
         syncGradAngleUI();
      }
      rAF_ID = requestAnimationFrame(loop);
    };
    rAF_ID = requestAnimationFrame(loop);
  }
}

function stopAnimation() {
  if (state.animInterval) {
    clearInterval(state.animInterval);
    state.animInterval = null;
  }
  if (rAF_ID) {
    cancelAnimationFrame(rAF_ID);
    rAF_ID = null;
  }
}

function changeTiming(timing, randomShapeCallback) {
  state.animTiming = parseInt(timing);
  if (state.animInterval) {
    startAnimation(randomShapeCallback);
  }
}
