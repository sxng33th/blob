export async function downloadFlyerAsPNG(nodeId, filePrefix) {
  const node = document.getElementById(nodeId);
  const oldRadius = node.style.borderRadius;
  node.style.borderRadius = '0px';
  
  const canvas = await window.html2canvas(node, { scale: 3, useCORS: true, backgroundColor: null });
  node.style.borderRadius = oldRadius;
  
  const link = document.createElement('a');
  link.download = `${filePrefix.replace(/\s+/g, '-').toLowerCase()}-${nodeId}.png`;
  link.href = canvas.toDataURL('image/png');
  link.click();
}

export async function copyFlyerAsSVG(nodeId) {
  const node = document.getElementById(nodeId);
  const w = node.offsetWidth || 400;
  const h = node.offsetHeight || 500;
  
  let mainSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}">`;
  
  const bg = node.querySelector('.flyer-bg');
  if (bg) {
    let bgColor = bg.style.background || bg.style.backgroundColor || '#09090b';
    mainSvg += `<rect width="100%" height="100%" fill="${bgColor}" />`;
    
    if (bg.tagName.toLowerCase() === 'svg') {
       mainSvg += bg.outerHTML;
    } else {
       const innerSvg = bg.querySelector('svg');
       if (innerSvg) mainSvg += innerSvg.outerHTML;
    }
  }

  const shapes = node.querySelectorAll('.flyer-shapes div');
  shapes.forEach(shapeDiv => {
     const top = shapeDiv.style.top;
     const left = shapeDiv.style.left;
     const transform = shapeDiv.style.transform;
     mainSvg += `<svg x="${left}" y="${top}" style="overflow:visible">
                   <g transform="${transform}">
                     ${shapeDiv.innerHTML}
                   </g>
                 </svg>`;
  });

  mainSvg += `</svg>`;
  await navigator.clipboard.writeText(mainSvg);
}
