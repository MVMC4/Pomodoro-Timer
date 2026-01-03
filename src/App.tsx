import { useState, useRef, useEffect } from 'react';
import { Volume2, VolumeX, Home, NotebookPen, Music, Calendar, Unlink } from 'lucide-react';
import Dock from './components/Dock';
import {
  HomePage,
  PlaylistPage
} from './components/Pages';
import song from './assets/bg_song1.mp3';

// Define the page IDs once for reuse
type PageID = 'home' | 'playlist' ;

export default function App() {
  const [activePage, setActivePage] = useState<PageID>('home');
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isMuted, setIsMuted] = useState(true);
  const [_isPlaying, setIsPlaying] = useState(false); // Prefix with _ to suppress TS6133
  const [isAnimating, setIsAnimating] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const containerRef = useRef<HTMLDivElement>(null!); // Use non-null assertion to match expected type
  const prevPageRef = useRef(activePage);

  // Pages array
  const pages = [
    { id: 'home', name: 'Home', icon: Home },
    { id: 'playlist', name: 'Playlist', icon: Music }
  ]; // Mutable array, no 'as const'

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.volume = 0;
    audio.loop = true;
    // Don't auto-play on mount - wait for user interaction
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleAudioError = (e: Event) => {
      console.error('Audio error:', e);
      setIsPlaying(false);
      audio.pause();
    };

    audio.addEventListener('error', handleAudioError);
    return () => {
      audio.removeEventListener('error', handleAudioError);
    };
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const prevPage = prevPageRef.current;
    const nextPage = activePage;
    const FADE_DURATION = 1500;
    const STEPS = 30;
    const stepTime = FADE_DURATION / STEPS;
    let interval: number | undefined;

    // Entering playlist → fade OUT
    if (prevPage !== 'playlist' && nextPage === 'playlist') {
      const startVolume = audio.volume;
      let step = 0;
      interval = window.setInterval(() => {
        step++;
        audio.volume = Math.max(0, startVolume * (1 - step / STEPS));
        if (audio.volume === 0) {
          audio.pause();
          setIsPlaying(false);
          clearInterval(interval);
        }
      }, stepTime);
    }

    // Leaving playlist → fade IN
    if (prevPage === 'playlist' && nextPage !== 'playlist' && !isMuted) {
      audio.volume = 0;
      audio.play().catch((error) => {
        console.error('Audio play error on page change:', error);
      });
      setIsPlaying(true);
      let step = 0;
      interval = window.setInterval(() => {
        step++;
        audio.volume = Math.min(1, step / STEPS);
        if (audio.volume >= 1) clearInterval(interval);
      }, stepTime);
    }

    prevPageRef.current = nextPage;

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [activePage, isMuted]);

  const toggleMute = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isMuted) {
      setIsMuted(false);
      audio.volume = 0;
      audio.play().catch((error) => {
        console.error('Audio play error on unmute:', error);
      });
      setIsPlaying(true);
      let step = 0;
      const STEPS = 20;
      const interval = window.setInterval(() => {
        step++;
        audio.volume = Math.min(1, step / STEPS);
        if (audio.volume >= 1) clearInterval(interval);
      }, 50);
    } else {
      setIsMuted(true);
      audio.volume = 0;
    }
  };

  const renderPage = () => {
    switch (activePage) {
      case 'home':
        return (
          <HomePage
            currentSlide={currentSlide}
            setCurrentSlide={setCurrentSlide}
            isAnimating={isAnimating}
            setIsAnimating={setIsAnimating}
            containerRef={containerRef}
          />
        );
      case 'playlist':
        return <PlaylistPage />;
      default:
        return null;
    }
  };

  return (
    <div ref={containerRef} className="relative w-full h-screen overflow-hidden bg-black">
      {/* Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-600 via-pink-600 to-blue-600 opacity-50 blur-3xl" />
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/40 pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,black_100%)] opacity-50 pointer-events-none" />

      {/* Page Content */}
      {renderPage()}

      {/* Dock */}
      <Dock
        pages={pages}
        activePage={activePage}
        onPageChange={(id: string) => {
          const audio = audioRef.current;
          // Auto-play on page change (user interaction)
          if (audio && isMuted && audio.paused && id !== 'playlist') {
            setIsMuted(false);
            audio.volume = 0;
            audio.play().catch((error) => {
              console.error('Audio play error on page change:', error);
            });
            setIsPlaying(true);
            let step = 0;
            const STEPS = 20;
            const interval = window.setInterval(() => {
              step++;
              audio.volume = Math.min(1, step / STEPS);
              if (audio.volume >= 1) clearInterval(interval);
            }, 50);
          }
          setActivePage(id as PageID);
        }}
      />

      {/* Audio Button */}
      <button
        onClick={toggleMute}
        className="fixed  top-4 right-4 z-20 bg-white/10 backdrop-blur-md p-3 rounded-full border border-white/20 hover:bg-white/20 transition-all group"
      >
        {isMuted ? (
          <VolumeX className="w-6 h-6 text-white group-hover:scale-110 transition-transform" />
        ) : (
          <Volume2 className="w-6 h-6 text-white group-hover:scale-110 transition-transform" />
        )}
        <div className="absolute inset-0 bg-white/5 rounded-full blur-lg group-hover:bg-white/10 transition-all" />
      </button>

      {/* Audio Element */}
      <audio ref={audioRef} src={song} />
    </div>
  );
}