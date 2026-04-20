import { generateFlyers } from './tools/compositor.js';

document.addEventListener('DOMContentLoaded', () => {
  const generateBtn = document.getElementById('btn-generate');
  
  if (generateBtn) {
    generateBtn.addEventListener('click', generateFlyers);
  }

  // Generate an initial batch to populate the screen
  generateFlyers();
});
