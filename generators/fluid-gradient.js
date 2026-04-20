export function generateFluidGradient(colors) {
  if (!colors || colors.length < 3) {
    colors = ['#ff0080', '#7928ca', '#ff4d4d'];
  }
  
  const positions = [
    { x: Math.random() * 100, y: Math.random() * 100, size: Math.random() * 60 + 50 },
    { x: Math.random() * 100, y: Math.random() * 100, size: Math.random() * 60 + 50 },
    { x: Math.random() * 100, y: Math.random() * 100, size: Math.random() * 60 + 50 },
    { x: Math.random() * 100, y: Math.random() * 100, size: Math.random() * 60 + 50 }
  ];

  let defs = '';
  let rects = '';
  
  // Base background
  rects += `<rect width="100%" height="100%" fill="${colors[0]}88" />`;
  
  positions.forEach((pos, index) => {
    const color = colors[index % colors.length];
    const gradId = `fluid-grad-${index}-${Math.floor(Math.random()*10000)}`;
    defs += `
      <radialGradient id="${gradId}" cx="${pos.x}%" cy="${pos.y}%" r="${pos.size}%" fx="${pos.x}%" fy="${pos.y}%">
        <stop offset="0%" stop-color="${color}" stop-opacity="1" />
        <stop offset="100%" stop-color="${color}" stop-opacity="0" />
      </radialGradient>
    `;
    rects += `<rect width="100%" height="100%" fill="url(#${gradId})" />`;
  });

  return `
    <svg width="100%" height="100%" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
      <defs>${defs}</defs>
      ${rects}
    </svg>
  `;
}
