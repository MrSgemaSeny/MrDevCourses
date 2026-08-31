import React from 'react';

export const Logo: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl border border-white/15 overflow-hidden flex-shrink-0 bg-[#0a0a0c] flex items-center justify-center shadow-sm">
        <img 
          src="/author-avatar.png" 
          alt="MrDeveloper Logo" 
          className="w-full h-full object-cover scale-115"
        />
      </div>
      <span className="text-sm font-bold tracking-tight text-white uppercase">
        MrDeveloper
      </span>
    </div>
  );
};
