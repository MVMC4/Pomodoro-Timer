import { useState, useEffect } from 'react';
import { Sparkles, Heart, Sun, Star } from 'lucide-react';

type Affirmation = {
  text: string;
  subtext: string;
};

/* ---------------- Affirmations Data ---------------- */
const affirmations: Affirmation[] = [
  { text: "You are allowed to take up space.", subtext: "Your presence matters, your voice deserves to be heard, and you don't need to make yourself smaller for anyone." },
  { text: "You are loved in ways you don't even see yet.", subtext: "The impact you have on others is deeper than you realize. You are cherished more than you know." },
  { text: "Even on quiet days, you matter.", subtext: "Your worth isn't measured by productivity. Rest is not wasted time. You are enough, simply as you are." },
  { text: "Your feelings are valid, every single one.", subtext: "You don't need to justify how you feel. Your emotions deserve space and compassion, especially from yourself." },
  { text: "You are doing better than you think.", subtext: "Give yourself credit for showing up, for trying, for getting through the hard days. That takes courage." },
  { text: "It's okay to not be okay right now.", subtext: "You don't have to have it all figured out. Healing isn't linear, and struggle doesn't mean you're failing." },
  { text: "You deserve kindness, especially from yourself.", subtext: "Treat yourself with the same gentleness you'd offer a dear friend. You are worthy of your own compassion." },
  { text: "Your journey is your own, and that's beautiful.", subtext: "You don't need to compare your path to anyone else's. Your timeline is perfect for you." },
  { text: "You are stronger than you believe.", subtext: "Look at everything you've already survived. That strength is still within you, always." },
  { text: "You bring light to the world just by being you.", subtext: "Your unique presence, your quirks, your authenticity—these are gifts. Never dim your light." },
  { text: "It's brave to be vulnerable.", subtext: "Opening your heart, sharing your truth, asking for help—these aren't weaknesses. They're acts of courage." },
  { text: "You are more than your mistakes.", subtext: "Your past doesn't define your future. Every moment is a chance to begin again with grace." },
  { text: "Your dreams are worth pursuing.", subtext: "Don't let fear or doubt steal your aspirations. You deserve to chase the things that make your soul sing." },
  { text: "You are not a burden.", subtext: "The people who love you want to support you. Letting them in is a gift to both of you." },
  { text: "Progress, not perfection.", subtext: "Every small step forward counts. You don't have to be perfect to be moving in the right direction." },
  { text: "You are seen, you are heard, you are valued.", subtext: "Your story matters. Your experiences are meaningful. You are an irreplaceable part of this world." },
  { text: "It's okay to rest without guilt.", subtext: "Rest is how you recharge. Taking time for yourself isn't selfish—it's necessary and wise." },
  { text: "You are allowed to change your mind.", subtext: "Growth means evolving. You're not stuck with who you used to be or what you once believed." },
  { text: "Your soft heart is a superpower.", subtext: "In a world that can be harsh, your tenderness, empathy, and care are revolutionary gifts." },
  { text: "You are exactly where you need to be.", subtext: "Trust the timing of your life. Every experience is shaping you into who you're meant to become." },
];

/* ---------------- Particle Component ---------------- */
const Particle = ({ icon: Icon, delay }: { icon: any; delay: number }) => (
  <div
    className="absolute opacity-10 pointer-events-none"
    style={{
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      animation: `float ${10 + Math.random() * 5}s ease-in-out ${delay}s infinite`,
    }}
  >
    <Icon className="w-6 h-6 text-white" />
  </div>
);

/* ---------------- Main Component ---------------- */
export default function AffirmationsPage() {
  const [currentAffirmation, setCurrentAffirmation] = useState<Affirmation | null>(null);

  // Daily affirmation based on day of year
  const getAffirmationOfDay = (): Affirmation => {
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 0);
    const diff = now.getTime() - start.getTime();
    const oneDay = 1000 * 60 * 60 * 24;
    const dayOfYear = Math.floor(diff / oneDay);
    return affirmations[dayOfYear % affirmations.length];
  };

  useEffect(() => {
    setCurrentAffirmation(getAffirmationOfDay());
  }, []);

  if (!currentAffirmation) return null;

  return (
    <div className="relative min-h-screen w-full  bg-gradient-to-br from-amber-900 via-orange-800 to-rose-900">
      {/* Background Gradients */}
      <div className="absolute inset-0 min-h-full bg-gradient-to-br from-rose-700 via-rose-500 to-rose-700">
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-rose-200/20 rounded-full blur-[120px] mix-blend-screen" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-pink-200/10 rounded-full blur-[100px] mix-blend-screen" />
      </div>

      {/* Floating Particles */}
      <div className="absolute inset-0 min-h-full pointer-events-none">
        {[...Array(8)].map((_, i) => {
          const icons = [Sparkles, Heart, Star, Sun];
          const Icon = icons[i % icons.length];
          return <Particle key={i} icon={Icon} delay={i * 0.8} />;
        })}
      </div>

      {/* Main Content */}
      <div className="relative min-h-screen  flex items-center justify-center p-6 pb-32">
        <div className="max-w-3xl w-full text-center">
          {/* Page Header */}
          <div className="text-center mb-16 relative z-10">
            <div className="inline-flex items-center justify-center p-3 mb-4 rounded-full bg-white/5 border border-white/10 backdrop-blur-md">
              <Sparkles className="w-5 h-5 text-rose-300 mr-2" />
              <span className="text-rose-100 text-sm font-medium tracking-wider uppercase">Today's Affirmation</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-thin text-white tracking-tight mb-4"
              style={{
                animation: 'slideUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.1s both',
                textShadow: '0 0 10px rgba(255,255,255,0.4), 0 0 20px rgba(216,180,254,0.8)',
                color: 'white'
              }}
            >
              Blooming flowers
            </h1>
            <p className="text-white text-base font-light">Soft daily words of love, just for you</p>
          </div>

          {/* Affirmation Card */}
          <div className="bg-white/20 backdrop-blur-xl rounded-3xl border border-white/60 shadow-2xl shadow-amber-200/20 p-10 md:p-16 transition-all duration-300 opacity-100 scale-100">
            <div className="text-center mb-8">
              <h1 className="text-3xl md:text-5xl font-light text-gray-100 leading-tight mb-6">
                "{currentAffirmation.text}"
              </h1>

              <div className="flex items-center justify-center gap-3 my-8">
                <div className="w-12 h-px bg-gradient-to-r from-transparent via-amber-300 to-transparent" />
                <Heart className="w-4 h-4 text-rose-400 fill-rose-400" />
                <div className="w-12 h-px bg-gradient-to-r from-transparent via-amber-300 to-transparent" />
              </div>

              <p className="text-lg md:text-xl text-gray-100 font-light leading-relaxed max-w-2xl mx-auto">
                {currentAffirmation.subtext}
              </p>
            </div>
          </div>

          {/* Bottom Message */}
          <div className="text-center mt-8 animate-[fadeIn_1s_ease-out_0.4s_both]">
            <p className="text-gray-200 text-sm font-light italic">You're the best, remember that! 💛</p>
          </div>
        </div>
      </div>

      {/* Styles */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translate(0, 0) rotate(0deg); opacity: 0.1; }
          33% { transform: translate(20px, -30px) rotate(10deg); opacity: 0.15; }
          66% { transform: translate(-15px, -15px) rotate(-10deg); opacity: 0.08; }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}