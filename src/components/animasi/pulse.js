'use client';

export default function Pulse({ className = '', children }) {
  return (
    <div className={`animate-pulse ${className}`}>
      {children}
    </div>
  );
}
