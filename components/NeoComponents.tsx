import React, { useEffect } from 'react';
import { playClickSound } from '../utils';
import { X } from 'lucide-react';

interface NeoButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'neutral';
  size?: 'sm' | 'md' | 'lg';
  noSound?: boolean;
}

export const NeoButton: React.FC<NeoButtonProps> = ({ 
  children, 
  className = '', 
  variant = 'primary', 
  size = 'md',
  noSound = false,
  onClick,
  ...props 
}) => {
  const baseStyles = "font-bold border-neo-black transition-all active:translate-x-[2px] active:translate-y-[2px] active:shadow-none";
  
  const variants = {
    primary: "bg-neo-yellow hover:bg-yellow-300 text-neo-black shadow-neo border-2",
    secondary: "bg-neo-purple hover:bg-purple-300 text-neo-black shadow-neo border-2",
    danger: "bg-neo-pink hover:bg-pink-300 text-neo-black shadow-neo border-2",
    neutral: "bg-white hover:bg-gray-50 text-neo-black shadow-neo border-2"
  };

  const sizes = {
    sm: "px-3 py-1 text-sm shadow-neo-sm",
    md: "px-6 py-3 text-base shadow-neo",
    lg: "px-8 py-4 text-xl shadow-neo-lg"
  };

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!noSound) playClickSound();
    if (onClick) onClick(e);
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`} 
      onClick={handleClick}
      {...props}
    >
      {children}
    </button>
  );
};

interface NeoCardProps {
  children: React.ReactNode;
  className?: string;
  color?: 'white' | 'purple' | 'green' | 'pink' | 'yellow' | 'blue';
}

export const NeoCard: React.FC<NeoCardProps> = ({ 
  children, 
  className = '', 
  color = 'white' 
}) => {
  const colors = {
    white: 'bg-white',
    purple: 'bg-neo-purple',
    green: 'bg-neo-green',
    pink: 'bg-neo-pink',
    yellow: 'bg-neo-yellow',
    blue: 'bg-neo-blue',
  };

  return (
    <div className={`${colors[color]} border-2 border-neo-black shadow-neo p-4 ${className}`}>
      {children}
    </div>
  );
};

interface NeoInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export const NeoInput: React.FC<NeoInputProps> = ({ label, className = '', ...props }) => {
  return (
    <div className="flex flex-col gap-1 w-full">
      {label && <label className="font-bold text-sm uppercase tracking-wider">{label}</label>}
      <input 
        className={`bg-white border-2 border-neo-black p-3 font-bold focus:outline-none focus:shadow-neo transition-all ${className}`}
        {...props}
      />
    </div>
  );
};

interface NeoToastProps {
  message: string;
  type?: 'success' | 'error' | 'info';
  onClose: () => void;
}

export const NeoToast: React.FC<NeoToastProps> = ({ message, type = 'info', onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const bgColors = {
    success: 'bg-neo-green',
    error: 'bg-neo-pink',
    info: 'bg-neo-blue',
  };

  return (
    <div className={`fixed top-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-6 py-4 border-2 border-neo-black shadow-neo-lg ${bgColors[type]} min-w-[300px] animate-in slide-in-from-top-2 fade-in`}>
      <span className="font-black uppercase flex-1">{message}</span>
      <button onClick={onClose} className="hover:bg-black/10 p-1 rounded">
        <X size={20} />
      </button>
    </div>
  );
};