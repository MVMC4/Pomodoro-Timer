import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Music,
  Sparkles,
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Shuffle,
  Repeat,
  Repeat1
} from 'lucide-react';

/* ---------------- Interfaces ---------------- */
interface Song {
  id: number;
  title: string;
  artist: string;
  youtubeId: string;
  thumbnail: string;
  duration: string;
}

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: (() => void) | undefined;
  }
}

/* ---------------- Main Component ---------------- */
export default function PlaylistPage() {
  const [songs, setSongs] = useState<Song[]>([]);
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hoveredSong, setHoveredSong] = useState<number | null>(null);
  const [player, setPlayer] = useState<any>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isPlayerReady, setIsPlayerReady] = useState(false);
  const [shuffle, setShuffle] = useState(false);
  const [repeat, setRepeat] = useState(0);
  const [loading, setLoading] = useState(false);

  const playerRef = useRef<any>(null);

  const songsRef = useRef(songs);
  const currentSongRef = useRef(currentSong);
  const repeatRef = useRef(repeat);
  const shuffleRef = useRef(shuffle);

  /* ---------------- YouTube Player ---------------- */
  const createPlayer = (song: Song) => {
    if (!window.YT || !window.YT.Player || !song) return;

    const onPlayerStateChange = (event: any) => {
      if (event.data === window.YT.PlayerState.ENDED) {
        const repeatMode = repeatRef.current;
        const songsList = songsRef.current;
        const current = currentSongRef.current;

        if (!current || songsList.length === 0) return;

        if (repeatMode === 2) {
          event.target.seekTo(0);
          event.target.playVideo();
          return;
        }

        const index = songsList.findIndex(s => s.id === current.id);
        let nextSong = null;

        if (shuffleRef.current) {
          const others = songsList.filter(s => s.id !== current.id);
          nextSong = others.length
            ? others[Math.floor(Math.random() * others.length)]
            : songsList[0];
        } else {
          const nextIndex = index + 1;
          if (repeatMode === 1) {
            nextSong = songsList[nextIndex % songsList.length];
          } else if (nextIndex < songsList.length) {
            nextSong = songsList[nextIndex];
          }
        }

        if (nextSong) setCurrentSong(nextSong);
        else setIsPlaying(false);
      }

      if (event.data === window.YT.PlayerState.PLAYING) {
        setIsPlaying(true);
        setDuration(event.target.getDuration());
      }

      if (event.data === window.YT.PlayerState.PAUSED) {
        setIsPlaying(false);
      }
    };

    const ytPlayer = new window.YT.Player('youtube-player', {
      height: '0',
      width: '0',
      videoId: song.youtubeId,
      playerVars: {
        autoplay: 0,
        controls: 0,
        origin: window.location.origin
      },
      events: {
        onReady: (e: any) => {
          setPlayer(e.target);
          playerRef.current = e.target;
          setIsPlayerReady(true);
          setDuration(e.target.getDuration());
          if (isPlaying) e.target.playVideo();
        },
        onStateChange: onPlayerStateChange
      }
    });

    playerRef.current = ytPlayer;
  };

  useEffect(() => {
    songsRef.current = songs;
    currentSongRef.current = currentSong;
    repeatRef.current = repeat;
    shuffleRef.current = shuffle;
  }, [songs, currentSong, repeat, shuffle]);

  /* ---------------- Video Handling ---------------- */
  const extractVideoId = (url: string) => {
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
      /^([a-zA-Z0-9_-]{11})$/
    ];
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) return match[1];
    }
    return null;
  };

  const fetchVideoInfo = async (videoId: string): Promise<Song | null> => {
    try {
      setLoading(true);
      const response = await fetch(
        `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`
      );
      if (!response.ok) throw new Error('Failed to fetch video info');
      const data = await response.json();
      return {
        id: Date.now() + Math.random(),
        title: data.title,
        artist: data.author_name,
        youtubeId: videoId,
        thumbnail: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
        duration: '0:00'
      };
    } catch (error) {
      console.error(error);
      alert('Failed to fetch video info.');
      return null;
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- Initial Songs ---------------- */
  useEffect(() => {
    const initialUrls = [
      'https://youtu.be/lSD_L-xic9o?list=RDlSD_L-xic9o',
      'https://youtu.be/1F3OGIFnW1k',

      //'https://youtu.be/FHT3xNYZU8o',
      'https://youtu.be/PEM0Vs8jf1w',
      'https://www.youtube.com/watch?v=60rLYaz9Q1w&pp=ygUHbG92ZSBtZQ%3D%3D',

      'https://youtu.be/dTS_aNfpbIM',

      
'https://youtu.be/SkcO47UDzzY',
      'https://youtu.be/5r3B7yz6J68',

      
      'https://youtu.be/vGJTaP6anOU',
      'https://youtu.be/Bx27Kn6Ct9A',
      'https://www.youtube.com/watch?v=450p7goxZqg&pp=ygUJYWxsIG9mIG1l0gcJCSkKAYcqIYzv',
    ];

    const load = async () => {
      setLoading(true);
      const loaded: Song[] = [];
      for (const url of initialUrls) {
        const id = extractVideoId(url);
        if (id) {
          const info = await fetchVideoInfo(id);
          if (info) loaded.push(info);
        }
      }
      setSongs(loaded);
      if (loaded.length) setCurrentSong(loaded[0]);
      setLoading(false);
    };
    load();
  }, []);

  /* ---------------- Player Initialization ---------------- */
  useEffect(() => {
    if (!currentSong) return;

    const initPlayer = () => {
      if (playerRef.current) {
        if (typeof playerRef.current.getVideoData === 'function' && playerRef.current.getVideoData().video_id !== currentSong.youtubeId) {
          playerRef.current.loadVideoById(currentSong.youtubeId);
          playerRef.current.playVideo();
          setIsPlaying(true);
          setCurrentTime(0);
        }
      } else {
        createPlayer(currentSong);
      }
    };

    if (window.YT && window.YT.Player) {
      initPlayer();
    } else {
      if (!document.getElementById('youtube-iframe-api-script')) {
        const tag = document.createElement('script');
        tag.id = 'youtube-iframe-api-script';
        tag.src = 'https://www.youtube.com/iframe_api';
        document.body.appendChild(tag);
      }
      const prev = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = () => {
        prev?.();
        initPlayer();
      };
    }

    return () => {
      if (playerRef.current) {
        if (typeof playerRef.current.destroy === 'function') {
          playerRef.current.destroy();
        }
        playerRef.current = null;
      }
      setPlayer(null);
      setIsPlayerReady(false);
      setIsPlaying(false);
    };
  }, [currentSong]);

  /* ---------------- Progress ---------------- */
  useEffect(() => {
    if (!player || !isPlaying) return;
    const interval = setInterval(() => {
      if (player && typeof player.getCurrentTime === 'function') {
        setCurrentTime(player.getCurrentTime());
      }
    }, 100);
    return () => clearInterval(interval);
  }, [player, isPlaying]);

  /* ---------------- Controls ---------------- */
  const handlePlayPause = (song: Song) => {
    if (!player || !currentSong) return;
    if (currentSong.id === song.id) {
      if (isPlaying) player.pauseVideo();
      else player.playVideo();
      setIsPlaying(!isPlaying);
    } else {
      setCurrentSong(song);
    }
  };

  const handleNextSong = useCallback(() => {
    if (!currentSong || songs.length === 0) return;
    const currentSongs = songsRef.current;
    const idx = currentSongs.findIndex(s => s.id === currentSong.id);
    let next;
    if (shuffle) {
      const others = currentSongs.filter(s => s.id !== currentSong.id);
      next = others.length ? others[Math.floor(Math.random() * others.length)] : currentSongs[0];
    } else {
      next = currentSongs[(idx + 1) % currentSongs.length];
    }
    setCurrentSong(next);
  }, [currentSong, songs, shuffle]);

  const handlePrevSong = useCallback(() => {
    if (!currentSong || songs.length === 0) return;
    const idx = songs.findIndex(s => s.id === currentSong.id);
    const prev = songs[(idx - 1 + songs.length) % songs.length];
    setCurrentSong(prev);
  }, [currentSong, songs]);

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!player) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const newTime = (x / rect.width) * duration;
    player.seekTo(newTime);
    setCurrentTime(newTime);
  };

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const toggleRepeat = () => setRepeat((repeat + 1) % 3);

  const particles = React.useMemo(() => [...Array(15)].map((_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    top: `${Math.random() * 100}%`,
    duration: `${8 + Math.random() * 4}s`,
    delay: `${i * 0.4}s`
  })), []);

  /* ---------------- UI ---------------- */
  return (
    <div className="relative min-h-screen w-full bg-[#0f0c29] ooverflow-y-auto flex-1 custom-scrollbar">
      {/* Loading Skeleton */}
      {loading && (
        <div className="fixed lg:h-[700px]  inset-0 g-gradient-to-br from-black via-blue-700 z-50 p-4 sm:p-8 lg:p-12">
          <div className="flex flex-col lg:flex-row gap-8 h-full">
            {/* Player Skeleton */}
            <div className="w-full lg:w-[550px] flex flex-col bg-white/[0.03] rounded-3xl border border-white/50 flex-shrink-0">
              <div className="p-6 lg:p-8 text-center flex-1 flex flex-col justify-center">
                {/* Album Art Skeleton */}
                <div className="w-48 h-48 lg:w-64 lg:h-64 mx-auto rounded-2xl bg-white/10 mb-6 animate-pulse" />
                {/* Title Skeleton */}
                <div className="h-6 bg-white/10 rounded-lg w-3/4 mx-auto mb-2 animate-pulse" />
                {/* Artist Skeleton */}
                <div className="h-4 bg-white/10 rounded-lg w-1/2 mx-auto animate-pulse" />
              </div>

              {/* Controls Skeleton */}
              <div className="px-6 lg:px-8 pb-6 lg:pb-8">
                {/* Progress Bar Skeleton */}
                <div className="mb-4">
                  <div className="h-1 bg-white/10 rounded-full animate-pulse" />
                  <div className="flex justify-between mt-1">
                    <div className="h-3 w-8 bg-white/10 rounded animate-pulse" />
                    <div className="h-3 w-8 bg-white/10 rounded animate-pulse" />
                  </div>
                </div>
                {/* Control Buttons Skeleton */}
                <div className="flex items-center justify-center gap-4">
                  <div className="w-5 h-5 bg-white/10 rounded-full animate-pulse" />
                  <div className="w-6 h-6 bg-white/10 rounded-full animate-pulse" />
                  <div className="w-12 h-12 bg-white/20 rounded-full animate-pulse" />
                  <div className="w-6 h-6 bg-white/10 rounded-full animate-pulse" />
                  <div className="w-5 h-5 bg-white/10 rounded-full animate-pulse" />
                </div>
              </div>
            </div>

            {/* Playlist Skeleton */}
            <div className="flex-1 bg-white/[0.03] rounded-3xl border border-white/50 overflow-hidden flex flex-col">
              <div className="p-6 border-b border-white/5">
                <div className="h-8 bg-white/10 rounded-lg w-64 animate-pulse" />
              </div>
              <div className="flex-1 p-6 space-y-4">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="flex items-center gap-4 animate-pulse">
                    <div className="w-12 h-12 bg-white/10 rounded flex-shrink-0" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-white/10 rounded w-3/4" />
                      <div className="h-3 bg-white/10 rounded w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Hidden YouTube Player */}
      <div id="youtube-player" className="hidden"></div>

      {/* Background */}
      <div className="fixed inset-0 bg-gradient-to-br from-black via-blue-700 to-black-950 pointer-events-none" />

      {/* Particles */}
      {particles.map((p) => (
        <div
          key={p.id}
          className="fixed opacity-20 pointer-events-none particle-float"
          style={{
            left: p.left,
            top: p.top,
            animationDuration: p.duration,
            animationDelay: p.delay
          }}
        >
          <Music className="w-4 h-4 text-rose-300" />
        </div>
      ))}

      {/* Layout */}
      <div
        className={`relative flex flex-col md-12 lg:h-[700px] lg:flex-row gap-8 p-4 sm:p-8 lg:p-12 pb-10 lg:pb-12 h-screen lg:h-auto lg:max-h-[800px] overflow-y-auto flex-1 custom-scrollbar transition-opacity duration-700 ${loading ? 'opacity-0 pointer-events-none' : 'opacity-100'
          }`}
      >
        {/* Player */}
        {currentSong && (
          <div className="w-full lg:w-[550px] flex flex-col bg-white/[0.03] rounded-3xl border border-white/50 flex-shrink-0 lg:max-h-none">
            {/* Album Art Section */}
            <div className="p-6 lg:p-8 text-center flex-1 flex flex-col justify-center">
              <div className="w-48 h-48 lg:w-64 lg:h-64 mx-auto rounded-2xl shadow-2xl overflow-hidden mb-6">
                <img
                  src={currentSong.thumbnail}
                  alt={currentSong.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = `https://img.youtube.com/vi/${currentSong.youtubeId}/default.jpg`;
                  }}
                />
              </div>

              <h2 className="text-xl lg:text-2xl text-white font-semibold truncate px-4">{currentSong.title}</h2>
              <p className="text-blue-100 text-sm mt-1 truncate px-4">{currentSong.artist}</p>
            </div>

            {/* Playback Controls */}
            <div className="px-6 lg:px-8 pb-6 lg:pb-8">
              {/* Progress Bar */}
              <div className="mb-4">
                <div
                  className="h-1 bg-white/10 rounded-full overflow-hidden cursor-pointer"
                  onClick={handleProgressClick}
                >
                  <div
                    className="h-full bg-blue-400 transition-all"
                    style={{ width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs text-rose-200/40 mt-1">
                  <span>{formatTime(currentTime)}</span>
                  <span>{formatTime(duration)}</span>
                </div>
              </div>

              {/* Control Buttons */}
              <div className="flex items-center justify-center gap-3 lg:gap-4">
                <button
                  onClick={() => setShuffle(!shuffle)}
                  className={`${shuffle ? 'text-blue-400' : 'text-blue-200/60'} hover:text-rose-200 transition-colors`}
                >
                  <Shuffle className="w-4 h-4 lg:w-5 lg:h-5" />
                </button>

                <SkipBack
                  onClick={handlePrevSong}
                  className="cursor-pointer text-blue-200/80 hover:text-blue-200 w-5 h-5 lg:w-6 lg:h-6 transition-colors"
                />

                <button
                  onClick={() => handlePlayPause(currentSong)}
                  disabled={!isPlayerReady}
                  className="bg-white/70 hover:bg-blue-50 p-2.5 lg:p-3 rounded-full transition-all hover:scale-105 disabled:opacity-50"
                >
                  {isPlaying ?
                    <Pause className="w-5 h-5 lg:w-6 lg:h-6 text-black/70" /> :
                    <Play className="w-5 h-5 lg:w-6 lg:h-6 text-black ml-0.5" />
                  }
                </button>

                <SkipForward
                  onClick={handleNextSong}
                  className="cursor-pointer text-blue-200/80 hover:text-blue-200 w-5 h-5 lg:w-6 lg:h-6 transition-colors"
                />

                <button
                  onClick={toggleRepeat}
                  className={`${repeat > 0 ? 'text-blue-400' : 'text-blue-200/60'} hover:text-rose-200 transition-colors relative`}
                >
                  {repeat === 2 ? (
                    <Repeat1 className="w-4 h-4 lg:w-5 lg:h-5" />
                  ) : (
                    <Repeat className="w-4 h-4 lg:w-5 lg:h-5" />
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Playlist */}
        <div className="flex-1  bg-white/[0.03] rounded-3xl border border-white/50 overflow-hidden flex flex-col min-h-[500px] lg:min-h-[400px] ">
          <div className="p-6 border-b border-white/5 flex-shrink-0">
            <h1 className="text-3xl lg:text-4xl text-white font-thin flex items-center gap-3">
              <Sparkles className="text-blue-800" />
              From the start
            </h1>
          </div>

          {/* Songs List */}
          <div className="overflow-y-auto flex-1 custom-scrollbar">
            {songs.length === 0 && !loading ? (
              <div className="flex items-center justify-center h-full text-rose-200/40">
                Add some songs to get started!
              </div>
            ) : (
              songs.map((song, i) => {
                const active = currentSong && song.id === currentSong.id;
                return (
                  <div
                    key={song.id}
                    onClick={() => handlePlayPause(song)}
                    onMouseEnter={() => setHoveredSong(song.id)}
                    onMouseLeave={() => setHoveredSong(null)}
                    className="flex items-center gap-4 px-6 py-4 border-b border-white/30 hover:bg-white/10 cursor-pointer transition-all duration-500 opacity-0 animate-fade-in"
                    style={{ animationDelay: `${i * 100}ms` }}
                  >
                    <img
                      src={song.thumbnail}
                      alt={song.title}
                      className="w-12 h-12 rounded object-cover flex-shrink-0"
                      onError={(e) => {
                        e.currentTarget.src = `https://img.youtube.com/vi/${song.youtubeId}/default.jpg`;
                      }}
                    />
                    <div className="flex-1 min-w-0">
                      <div className={`font-medium truncate ${active ? 'text-blue-400' : 'text-blue-100'}`}>
                        {song.title}
                      </div>
                      <div className="text-sm text-blue-100 truncate">{song.artist}</div>
                    </div>

                    {active && isPlaying ? (
                      <Pause className="text-blue-400 w-5 h-5 flex-shrink-0" />
                    ) : hoveredSong === song.id || active ? (
                      <Play className="text-blue-300 w-5 h-5 flex-shrink-0" />
                    ) : (
                      <span className="text-blue-200 flex-shrink-0">{i + 1}</span>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Quote at Bottom */}
      <div className="relative flex  text-center py-15 px-4">
        <p className="text-blue-100 text-md italic max-w-2xl mx-auto">
          "Certain sounds carry more than awords.."
        </p>
      </div>

      {/* Animations */}
      <style>{`
        /* Custom Scrollbar */
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(239, 237, 240, 0.56);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(184, 99, 241, 0.4); }

        .particle-float {
          animation-name: float;
          animation-timing-function: ease-in-out;
          animation-iteration-count: infinite;
        }
        @keyframes float {
          0% { transform: translate(0, 0) rotate(0deg); }
          25% { transform: translate(5vw, -3vh) rotate(5deg); }
          50% { transform: translate(-8vw, 6vh) rotate(-5deg); }
          75% { transform: translate(4vw, 2vh) rotate(3deg); }
          100% { transform: translate(0, 0) rotate(0deg); }
        }

        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in { animation: fade-in 0.5s forwards; }
      `}</style>
    </div>
  );
}