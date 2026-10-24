'use client';

import { useState } from 'react';
import { Lock, Eye, EyeOff } from 'lucide-react';

export default function PasswordInput({
  value,
  onChange,
  placeholder = 'Masukkan kata sandi',
  required = true,
  minLength = 6,
  id,
  name,
  disabled = false,
  className = '',
  autoComplete = 'current-password',
  iconLeft: IconLeft = Lock,
  ...props
}) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="relative w-full">
      {IconLeft && (
        <div className="absolute left-3.5 top-3.5 text-stone-400 dark:text-stone-500 pointer-events-none">
          <IconLeft className="w-4 h-4" />
        </div>
      )}

      <input
        type={showPassword ? 'text' : 'password'}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        minLength={minLength}
        id={id}
        name={name}
        disabled={disabled}
        autoComplete={autoComplete}
        className={`w-full ${IconLeft ? 'pl-10' : 'pl-4'} pr-11 py-3 text-sm bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 border border-stone-300 dark:border-stone-700 rounded-xl focus:border-[#2d6a4f] dark:focus:border-emerald-500 focus:outline-hidden placeholder:text-stone-400 dark:placeholder:text-stone-500 transition-colors ${className}`}
        {...props}
      />

      <button
        type="button"
        onClick={() => setShowPassword(prev => !prev)}
        disabled={disabled}
        tabIndex={0}
        aria-label={showPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
        className="absolute right-3 top-3 p-1 rounded-lg text-stone-400 dark:text-stone-500 hover:text-stone-700 dark:hover:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-700/50 transition-colors cursor-pointer"
      >
        {showPassword ? (
          <EyeOff className="w-4 h-4" />
        ) : (
          <Eye className="w-4 h-4" />
        )}
      </button>
    </div>
  );
}
