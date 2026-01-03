import  { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';

/* ---------------- Particle Component ---------------- */
const Particle = ({ delay }: { delay: any }) => ( // Changed to { delay: number } to fix TS7031
  <div
    className="absolute opacity-[0.04] pointer-events-none"
    style={{
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      animation: `float ${14 + Math.random() * 6}s ease-in-out ${delay}s infinite`
    }}
  >
    <Heart className="w-3 h-3 text-gray-500" />
  </div>
);

/* ---------------- Main Goodbye Page ---------------- */
export default function GoodbyePage() {
  const [fadeIn, setFadeIn] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setFadeIn(true), 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="relative h-screen w-full overflow-hidden bg-[#0c0d10]">
      {/* Dark Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-black via-[#0c0d10] to-[#12131a]">
        <div className="absolute top-[-30%] left-[-20%] w-[700px] h-[700px] bg-blue-900/5 rounded-full blur-[180px]" />
        <div className="absolute bottom-[-30%] right-[-20%] w-[600px] h-[600px] bg-slate-800/10 rounded-full blur-[160px]" />
      </div>

      {/* Particles */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(10)].map((_, i) => (
          <Particle key={i} delay={i * 1.2} />
        ))}
      </div>

      {/* Scroll Container */}
      <div className="relative h-full overflow-y-auto custom-scrollbar">
        <div className="min-h-full py-24 px-4 md:px-8 pb-48">

          {/* Header */}
          <div className="text-center mb-32 relative z-10">
            <p className="text-gray-500/60 text-sm tracking-widest uppercase mb-6">
              A final page
            </p>
            <h1 className="text-3xl md:text-5xl font-extralight text-gray-100 tracking-tight">
              This Is For You
            </h1>
          </div>

          {/* Content */}
          <div className="max-w-3xl mx-auto relative z-10 space-y-40">

            {/* Main Statement */}
            <div
              className={`transition-all duration-[3000ms] ease-out ${
                fadeIn ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
              }`}
            >
              <div className="flex flex-col items-center gap-10 text-center">
                <Heart className="w-14 h-14 text-gray-600 fill-gray-600/10" />

                <p className="text-xl md:text-2xl text-gray-200/80 font-light leading-relaxed">
                  This site exists because you mattered to me  
                  in a way I wanted to preserve.
                </p>
              </div>
            </div>

            {/* Quote */}
            <div
              className={`transition-all duration-[3000ms] ease-out delay-700 ${
                fadeIn ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
              }`}
            >
              <blockquote className="text-2xl md:text-3xl text-gray-400/70 font-light italic text-center leading-relaxed">
                “Some things are meant to be felt, not held.”
              </blockquote>
            </div>

            {/* Closing */}
            <div
              className={`transition-all duration-[3000ms] ease-out delay-[1400ms] ${
                fadeIn ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
              }`}
            >
              <p className="text-base text-gray-500/70 text-center font-light">
                Thank you for being part of my story. I love you. <br></br>Goodbye.
              </p>
            </div>

          </div>
        </div>
      </div>

      {/* Styles */}
      <style >{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 5px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(100, 116, 139, 0.25);
          border-radius: 10px;
        }

        @keyframes float {
          0%, 100% { transform: translate(0, 0); }
          50% { transform: translate(-8px, -18px); }
        }
      `}</style>
    </div>
  );
}