'use client';

// Dynamic Favicon Generator ramah browser
import { useEffect } from 'react';

export default function DynamicFavicon() {
  useEffect(() => {
    try {
      const canvas = document.createElement('canvas');
      canvas.width = 64;
      canvas.height = 64;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#2d6a4f';
        ctx.beginPath();
        ctx.arc(32, 32, 28, 0, 2 * Math.PI);
        ctx.fill();

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 30px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('♻', 32, 34);

        const link = document.querySelector("link[rel*='icon']") || document.createElement('link');
        link.type = 'image/x-icon';
        link.rel = 'shortcut icon';
        link.href = canvas.toDataURL('image/png');
        document.getElementsByTagName('head')[0].appendChild(link);
      }
    } catch (_) {}
  }, []);

  return null;
}
