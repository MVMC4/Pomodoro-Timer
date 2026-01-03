import { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  PenLine,
  Sparkles,
  BookOpen,
  X,
  ArrowUpRight,
  AlignLeft
} from 'lucide-react';

/* ---------------- Types ---------------- */
type Poem = {
  id: number;
  title: string;
  text: string;
};

/* ---------------- Load Poems ---------------- */
const loadPoems = async (): Promise<Poem[]> => {
  const files = import.meta.glob('../../assets/poems/*.md', {
    as: 'raw',
    eager: true
  });

  return Object.entries(files).map(([_, raw], index) => {
    const content = raw as string;

    const titleMatch = content.match(/^#\s+(.*)$/m);
    const title = titleMatch ? titleMatch[1] : 'Untitled';

    const text = content.replace(/^#\s+.*$/m, '').trim();

    return { id: index + 1, title, text };
  });
};

/* ---------------- Particle ---------------- */
const Particle = ({ delay }: { delay: number }) => (
  <div
    className="absolute opacity-20 pointer-events-none"
    style={{
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      animation: `float ${8 + Math.random() * 4}s ease-in-out ${delay}s infinite`
    }}
  >
    <BookOpen className="w-4 h-4 text-indigo-300" />
  </div>
);

/* ---------------- Modal ---------------- */
const PoemModal = ({
  poem,
  onClose
}: {
  poem: Poem;
  onClose: () => void;
}) => {
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-md animate-[backdrop-in_0.3s_ease-out]" />

      <div
        className="relative w-full max-w-lg bg-white/[0.01] rounded-3xl
                   border border-white/10 shadow-white/[50]
                   overflow-hidden flex flex-col max-h-[85vh]
                   animate-[modal-in_0.4s_cubic-bezier(0.16,1,0.3,1)]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/5 bg-white/5 backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-indigo-500/10">
              <PenLine className="w-5 h-5 text-indigo-100" />
            </div>
            <h2 className="text-xl font-medium text-white">
              {poem.title}
            </h2>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/10 transition"
          >
            <X className="w-5 h-5 text-indigo-200 hover:text-white" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto p-8 custom-scrollbar">
          <div className="prose prose-invert max-w-none">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                p: ({ children, node }: any) => {
                  // We try to calculate an index based on the node's position in the parent,
                  // or fallback to 0 to prevent the build error.
                  const index = node?.position?.start?.line || 0;
                  return (
                    <p
                      className="text-indigo-100/90 leading-loose opacity-0 animate-[paragraph-in_0.6s_ease-out_forwards]"
                      style={{
                        animationDelay: `${index * 0.12}s`
                      }}
                    >
                      {children}
                    </p>
                  );
                },
                em: ({ children }) => (
                  <em className="text-indigo-200">{children}</em>
                ),
                strong: ({ children }) => (
                  <strong className="text-white">{children}</strong>
                ),
                blockquote: ({ children }) => (
                  <blockquote className="border-l-4 border-indigo-400/30 pl-4 italic text-indigo-200">
                    {children}
                  </blockquote>
                )
              }}
            >
              {poem.text}
            </ReactMarkdown>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-white/5 text-center">
          <p className="text-indigo-200 text-sm font-light">
            A moment in time
          </p>
        </div>
      </div>
    </div>
  );
};

/* ---------------- Page ---------------- */
export default function PoemsPage() {
  const [poems, setPoems] = useState<Poem[]>([]);
  const [selectedPoem, setSelectedPoem] = useState<Poem | null>(null);

  useEffect(() => {
    loadPoems().then(setPoems);
  }, []);

  return (
    <div className="relative h-screen w-full overflow-hidden bg-[#0f0c29]">
      <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-purple-950 to-black" />

      <div className="absolute inset-0 pointer-events-none">
        {[...Array(12)].map((_, i) => (
          <Particle key={i} delay={i * 0.5} />
        ))}
      </div>

      <div className="relative h-full overflow-y-auto custom-scrollbar">
        <div className="py-12 px-4 md:px-8">

          {/* Header */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center p-3 mb-4 rounded-full bg-white/5 border border-white/10">
              <Sparkles className="w-5 h-5 text-indigo-300 mr-2" />
              <span className="text-indigo-100 text-sm uppercase tracking-wider">
                Collection
              </span>
            </div>
            <h1 className="text-4xl md:text-6xl  font-thin text-white tracking-tight mb-4"
              style={{
                animation: 'slideUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.1s both',
                // Added text-shadow for the glow effect
                textShadow: '0 0 10px rgba(255,255,255,0.4), 0 0 20px rgba(216,180,254,0.8)',
                color: 'white' // Ensure the text color is bright white for the best glow effect
              }}
            >
              Silent Winter
            </h1>

            <p className="text-indigo-200/80 py-2">
              Thoughts gathered in the quiet hours.
            </p>
          </div>

          {/* Grid */}
          <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-24">
            {poems.map((poem, index) => (
              <div
                key={poem.id}
                className="group relative bg-white/[0.03] backdrop-blur-md rounded-2xl
                           border border-white/50 hover:border-indigo-400/80 
                           transition-all duration-300 hover:-translate-y-1
                           flex flex-col h-[280px]"
                style={{
                  animation: `fadeIn 0.6s ease-out ${index * 0.1}s both`

                }}

              >
                <div className="p-6 flex flex-col h-full">
                  <div className="flex items-center gap-3 mb-4">
                    <AlignLeft className="w-4 h-4 text-indigo-400/50" />
                    <h3 className="text-lg font-medium text-indigo-50">
                      {poem.title}
                    </h3>
                  </div>

                  {/* Preview (clamped) */}
                  <div className="flex-1 overflow-hidden">
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      components={{
                        p: ({ children }) => (
                          <p className="text-indigo-100/80 leading-relaxed line-clamp-4">
                            {children}
                          </p>
                        )
                      }}
                    >
                      {poem.text}
                    </ReactMarkdown>
                  </div>

                  <div className="flex justify-end mt-auto pt-4 border-t border-white/5">
                    <button
                      onClick={() => setSelectedPoem(poem)}
                      className="flex items-center gap-2 px-4 py-2 rounded-full
                               bg-white/5 hover:bg-indigo-500/20
                               text-xs text-indigo-200 hover:text-white transition"
                    >
                      Read Piece
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {selectedPoem && (
        <PoemModal poem={selectedPoem} onClose={() => setSelectedPoem(null)} />
      )}

      {/* Styles */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(99, 102, 241, 0.4);
          border-radius: 10px;
        }

        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-20px); }
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

         /* Re-added keyframe for smooth transition background pulse */
        @keyframes pulse {
            0%, 100% { opacity: 0.25; }
            50% { opacity: 0.5; }
        }

        /* Re-added keyframe for icon glow */
        @keyframes ping {
            0% { transform: scale(1); opacity: 0.7; }
            70% { transform: scale(1.6); opacity: 0; }
            100% { transform: scale(1.6); opacity: 0; }
        }
        
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.8); }
          to { opacity: 1; transform: scale(1); }
        }

        @keyframes slideUp {
          from { opacity: 0; transform: translateY(40px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes backdrop-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes modal-in {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }

        @keyframes paragraph-in {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
