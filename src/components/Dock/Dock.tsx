import React from 'react';
import DockItem from './DockItem';

interface Page {
    id: string;
    name: string;
    icon: React.ComponentType<{ className?: string }>;
}

interface DockProps {
    pages: Page[];
    activePage: string;
    onPageChange: (pageId: string) => void;
}

export default function Dock({ pages, activePage, onPageChange }: DockProps) {
    return (
        <div className="fixed bottom-3 sm:bottom-4 md:bottom-6 left-1/2 transform -translate-x-1/2 z-30 animate-[slideUpDock_0.8s_cubic-bezier(0.16,1,0.3,1)]">
            {/*
        ADJUSTED FOR MD SIZE ON SMALL SCREENS (sm and below):
        - Previous: p-2 sm:p-2.5 md:p-2.5
        - New: p-2.5 (Applies to all screens, effectively setting sm/base to md size)
      */}
            <div className="bg-slate-500/5 backdrop-blur-3xl rounded-3xl p-2.5 border border-white/15 shadow-2xl shadow-indigo-900/20">
                {/*
          ADJUSTED FOR MD SIZE ON SMALL SCREENS (sm and below):
          - Previous: gap-2 sm:gap-2.5 md:gap-3
          - New: gap-3 (Applies to all screens. If you want a smaller gap on the *very* smallest, you could use gap-2.5, but gap-3 matches the desired MD size)
        */}
                <div className="flex items-center gap-3">
                    {pages.map((page) => (
                        <DockItem
                            key={page.id}
                            page={page}
                            isActive={activePage === page.id}
                            onClick={() => onPageChange(page.id)}
                        />
                    ))}
                </div>
            </div>

            <style>{`
        /* Custom Keyframe for smooth initial dock entrance */
        @keyframes slideUpDock {
          from { opacity: 0; transform: translate(-50%, 20px); }
          to { opacity: 1; transform: translate(-50%, 0); }
        }
      `}</style>
        </div>
    );
}