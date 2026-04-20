export function generateShape(type, size = 100, color = 'white', strokeWidth = 2) {
  const center = size / 2;
  
  if (type === 'star') {
    // 4-point Luma style star
    return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
      <path d="M${center},0 Q${center},${center} ${size},${center} Q${center},${center} ${center},${size} Q${center},${center} 0,${center} Q${center},${center} ${center},0" fill="${color}" />
    </svg>`;
  }
  
  if (type === 'ring') {
    return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
      <circle cx="${center}" cy="${center}" r="${center - strokeWidth}" fill="none" stroke="${color}" stroke-width="${strokeWidth}" />
    </svg>`;
  }

  // default pill
  return `<svg width="${size * 2}" height="${size}" viewBox="0 0 ${size * 2} ${size}" xmlns="http://www.w3.org/2000/svg">
    <rect x="0" y="0" width="${size * 2}" height="${size}" rx="${size/2}" fill="none" stroke="${color}" stroke-width="${strokeWidth}" />
  </svg>`;
}
