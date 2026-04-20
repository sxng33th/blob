import { generateFlyers, updateFlyers } from './tools/compositor.js';

document.addEventListener('DOMContentLoaded', () => {
  const generateBtn = document.getElementById('btn-generate');
  
  if (generateBtn) {
    generateBtn.addEventListener('click', generateFlyers);
  }

  const instantInputs = ['input-title', 'input-date', 'input-location', 'input-host', 'toggle-text', 'toggle-grid', 'select-text-color', 'select-font', 'select-aspect', 'select-filter'];
  instantInputs.forEach(id => {
    const el = document.getElementById(id);
    if (el) {
       el.addEventListener('input', updateFlyers);
       el.addEventListener('change', updateFlyers);
    }
  });

  const rerenderInputs = ['select-bg-style', 'select-palette', 'toggle-shapes'];
  rerenderInputs.forEach(id => {
    document.getElementById(id)?.addEventListener('change', generateFlyers);
  });

  // Generate an initial batch to populate the screen
  generateFlyers();
});
