import React from 'react';

export const Logo: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className="w-12 h-12 rounded-full border border-white/10 overflow-hidden flex-shrink-0 bg-[#0a0a0c]">
        <img 
          src="/author-avatar.png" 
          alt="MrDevCourses Logo" 
          className="w-full h-full object-cover scale-[1.35] translate-y-[5%] origin-center"
        />
      </div>
      <span className="text-base font-bold tracking-tight text-white font-mono uppercase">
        MRDEV<span className="text-zinc-500">COURSES</span>
      </span>
    </div>
  );
};
