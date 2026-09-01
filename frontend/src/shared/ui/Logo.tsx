import React from 'react';

export const Logo: React.FC<{ className?: string }> = ({ className = '' }) => {
  const [hasError, setHasError] = React.useState(false);

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full border border-white/15 overflow-hidden flex-shrink-0 bg-[#0a0a0c] shadow-sm flex items-center justify-center">
        {!hasError ? (
          <img 
            src={`${import.meta.env.BASE_URL}author-avatar.png`}
            alt="MrDeveloper Logo" 
            onError={() => setHasError(true)}
            className="w-full h-full object-cover scale-[1.35]"
          />
        ) : (
          <span className="text-xs font-bold font-mono text-zinc-300">MD</span>
        )}
      </div>
      <span className="text-sm font-bold tracking-tight text-white uppercase">
        MrDeveloper
      </span>
    </div>
  );
};
