import React from 'react';

interface DockItemProps {
    page: {
        id: string;
        name: string;
        icon: React.ComponentType<{ className?: string }>;
    };
    isActive: boolean;
    onClick: () => void;
}

export default function DockItem({ page, isActive, onClick }: DockItemProps) {
    const Icon = page.icon;

    return (
        <button onClick={onClick} className="group relative outline-none">
            <div className={`flex flex-col items-center justify-center transition-all duration-300 ${isActive ? 'scale-115' : 'scale-100 group-hover:scale-110'
                }`}>
                <div className={`relative p-3.5 rounded-xl transition-all duration-300 ${ // ADJUSTED: Using p-3.5 for all screens (was md:p-3.5)
                    isActive
                        ? 'bg-white/10 backdrop-blur-2xl shadow-xl shadow-purple-500/10'
                        : 'bg-white/5 backdrop-blur-xl group-hover:bg-white/10'
                    }`}>
                    {/* Active Glow Effect */}
                    {isActive && (
                        <div className="absolute inset-0 bg-white/3 rounded-xl blur-lg animate-pulse" />
                    )}

                    <Icon className={`w-7 h-7 transition-colors duration-300 relative z-10 ${ // ADJUSTED: Using w-7 h-7 for all screens (was md:w-7 md:h-7)
                        isActive ? 'text-white/80' : 'text-white/50 group-hover:text-white/80'
                        }`} />
                </div>

                {/* Active Underline Indicator (Updated) */}
                {isActive && (
                    <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 w-3/4 h-0.5 bg-purple-200/60 rounded-full shadow-[0_0_10px_rgba(216,180,254,0.3)] animate-fadeInUp" /> // Removed md:-bottom-3, using -bottom-3 for all
                )}
            </div>

            {/* Tooltip (Updated for smoother fade-up) */}
            <div className="absolute bottom-full mb-3 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none group-hover:-translate-y-1">
                <div className="bg-white/5 backdrop-blur-xl px-3 py-1 rounded-lg text-white/80 text-sm font-light whitespace-nowrap border border-white/10 shadow-md">
                    {page.name}
                </div>
            </div>

            <style >{`
        /* Keyframe for Active Underline */
        @keyframes fadeInUp {
          from { opacity: 0; transform: translate(-50%, 5px); }
          to { opacity: 1; transform: translate(-50%, 0); }
        }
      `}</style>
        </button>
    );
}