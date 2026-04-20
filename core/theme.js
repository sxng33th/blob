export function getPalette(paletteName) {
  const palettes = {
    sunset: ['#ff4d4d', '#ff0080', '#7928ca', '#ffb84d'],
    ocean: ['#00c6ff', '#0072ff', '#00ffd2', '#1a2980'],
    neon: ['#39ff14', '#ccff00', '#ff00ff', '#00ffff'],
    mono: ['#4a4a4a', '#8a8a8a', '#d3d3d3', '#2b2b2b'],
    redwhite: ['#FF5A5F', '#FFFFFF', '#FFCFCF', '#FFA6A8']
  };
  return palettes[paletteName] || palettes.sunset;
}

export function getAutoTextColor(paletteName) {
  const textColors = {
    sunset: '#ffffff',
    ocean: '#ffffff',
    neon: '#0d1b2a', 
    mono: '#18181b', 
    redwhite: '#610008' // deep burgundy
  };
  return textColors[paletteName] || '#ffffff';
}

export function getComputedTextColor(textColorOption, paletteMode) {
  if (textColorOption === 'white') return '#ffffff';
  if (textColorOption === 'black') return '#18181b';
  return getAutoTextColor(paletteMode);
}
