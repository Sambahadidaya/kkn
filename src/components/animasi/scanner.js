'use client';

/**
 * Komponen Animasi Scanner Looping
 * Menghasilkan garis laser pemindai bergradasi dengan trail glow yang bergerak naik-turun (looping).
 */
export default function ScannerAnimation({ active = true }) {
  if (!active) return null;

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl z-20">
      <style>{`
        @keyframes scanSweep {
          0% {
            top: 2%;
            opacity: 0.85;
          }
          50% {
            top: 96%;
            opacity: 1;
          }
          100% {
            top: 2%;
            opacity: 0.85;
          }
        }
        .scanner-beam-line {
          animation: scanSweep 2.8s ease-in-out infinite;
        }
        .scanner-beam-trail {
          animation: scanSweep 2.8s ease-in-out infinite;
        }
      `}</style>

      {/* Cahaya sorot (Laser Trail Glow) */}
      <div
        className="scanner-beam-trail absolute left-0 right-0 h-14 -mt-7 bg-gradient-to-b from-emerald-500/0 via-emerald-400/25 to-emerald-400/5 blur-xs pointer-events-none"
        style={{ willChange: 'top' }}
      />

      {/* Garis Laser Utama Looping */}
      <div
        className="scanner-beam-line absolute left-0 right-0 h-[2px] pointer-events-none flex items-center justify-center -mt-[1px]"
        style={{ willChange: 'top' }}
      >
        <div className="w-full h-[2.5px] bg-gradient-to-r from-transparent via-emerald-300 to-transparent shadow-[0_0_14px_4px_rgba(52,211,153,0.9)]" />
        <div className="absolute w-24 h-[3px] bg-white rounded-full blur-[1px] shadow-[0_0_12px_3px_rgba(255,255,255,0.95)]" />
      </div>

      {/* Efek Garis Sudut Presisi (Corner Guide Accents) */}
      <div className="absolute top-2 left-2 w-5 h-5 border-t-2 border-l-2 border-emerald-400/90 rounded-tl" />
      <div className="absolute top-2 right-2 w-5 h-5 border-t-2 border-r-2 border-emerald-400/90 rounded-tr" />
      <div className="absolute bottom-2 left-2 w-5 h-5 border-b-2 border-l-2 border-emerald-400/90 rounded-bl" />
      <div className="absolute bottom-2 right-2 w-5 h-5 border-b-2 border-r-2 border-emerald-400/90 rounded-br" />
    </div>
  );
}
