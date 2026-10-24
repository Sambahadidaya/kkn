'use client';

// Komponen latar belakang situs dengan aksen daun/hijau alami halus
export default function SiteBackground() {
  return (
    <div
      className="fixed inset-0 pointer-events-none -z-10 bg-[radial-gradient(#d8f3dc_1px,transparent_1px)] dark:bg-[radial-gradient(#2d6a4f_1px,transparent_1px)] [background-size:24px_24px] opacity-40 dark:opacity-25"
      aria-hidden="true"
    />
  );
}
