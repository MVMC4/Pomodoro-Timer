import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Clock, Coffee, Sparkles, Folder, Plus, X, ChevronLeft, ChevronRight, Pencil, Trash2 } from 'lucide-react';
type TimerMode = 'pomodoro' | 'shortBreak' | 'longBreak';
interface TimerSettings {
  pomodoro: number;
  shortBreak: number;
  longBreak: number;
}
interface Project {
  id: string;
  name: string;
  goals: string;
  customSettings: TimerSettings;
  totalTime: number;
  pomodorosCompleted: number;
}
export default function HomePage() {
  const [mode, setMode] = useState<TimerMode>('pomodoro');
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  const [sessionStartTime, setSessionStartTime] = useState<number>(0);
  const [formName, setFormName] = useState('');
  const [formGoals, setFormGoals] = useState('');
  const [formPomodoro, setFormPomodoro] = useState('25');
  const [formShortBreak, setFormShortBreak] = useState('5');
  const [formLongBreak, setFormLongBreak] = useState('15');
  const [formErrors, setFormErrors] = useState<string[]>([]);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const intervalRef = useRef<number | null>(null);
  useEffect(() => {
    const stored = localStorage.getItem('pomodoroProjects');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setProjects(parsed);
      } catch (e) {
        console.error('Failed to parse stored projects');
      }
    }
  }, []);
  useEffect(() => {
    if (projects.length > 0) {
      localStorage.setItem('pomodoroProjects', JSON.stringify(projects));
    }
  }, [projects]);
  const activeProject = projects.find(p => p.id === activeProjectId);
  const defaultSettings: TimerSettings = {
    pomodoro: 25 * 60,
    shortBreak: 5 * 60,
    longBreak: 15 * 60
  };
  const currentSettings = activeProject?.customSettings || defaultSettings;
  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      if (sessionStartTime === 0) {
        setSessionStartTime(timeLeft);
      }

      intervalRef.current = window.setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            setIsRunning(false);
            const timeSpent = sessionStartTime;

            if (activeProjectId) {
              setProjects(prevProjects =>
                prevProjects.map(p =>
                  p.id === activeProjectId
                    ? {
                      ...p,
                      totalTime: p.totalTime + timeSpent,
                      pomodorosCompleted: mode === 'pomodoro' ? p.pomodorosCompleted + 1 : p.pomodorosCompleted
                    }
                    : p
                )
              );
            }

            setSessionStartTime(0);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (!isRunning && sessionStartTime > 0) {
      setSessionStartTime(0);
    }
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, timeLeft, mode, activeProjectId, sessionStartTime]);
  const handleModeChange = (newMode: TimerMode) => {
    setMode(newMode);
    setTimeLeft(currentSettings[newMode]);
    setIsRunning(false);
    setSessionStartTime(0);
  };
  const handleReset = () => {
    setTimeLeft(currentSettings[mode]);
    setIsRunning(false);
    setSessionStartTime(0);
  };
  const toggleTimer = () => {
    setIsRunning(!isRunning);
  };
  const handleProjectSelect = (projectId: string) => {
    const project = projects.find(p => p.id === projectId);
    if (project) {
      setActiveProjectId(projectId);
      setTimeLeft(project.customSettings[mode]);
      setIsRunning(false);
      setSessionStartTime(0);
    }
  };
  const handleEditProject = (project: Project) => {
    setFormName(project.name);
    setFormGoals(project.goals);
    setFormPomodoro((project.customSettings.pomodoro / 60).toString());
    setFormShortBreak((project.customSettings.shortBreak / 60).toString());
    setFormLongBreak((project.customSettings.longBreak / 60).toString());
    setEditingProject(project);
    setShowModal(true);
  };
  const handleDeleteProject = (id: string) => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      setProjects(projects.filter(p => p.id !== id));
      if (activeProjectId === id) {
        setActiveProjectId(null);
        setTimeLeft(defaultSettings[mode]);
      }
    }
  };
  const handleSubmitProject = () => {
    const errors: string[] = [];

    if (!formName.trim()) errors.push('Project name is required');
    if (!formGoals.trim()) errors.push('Project goals are required');

    const pomodoroNum = parseInt(formPomodoro);
    const shortBreakNum = parseInt(formShortBreak);
    const longBreakNum = parseInt(formLongBreak);

    if (isNaN(pomodoroNum) || pomodoroNum < 1 || pomodoroNum > 120) {
      errors.push('Pomodoro duration must be between 1 and 120 minutes');
    }
    if (isNaN(shortBreakNum) || shortBreakNum < 1 || shortBreakNum > 60) {
      errors.push('Short break must be between 1 and 60 minutes');
    }
    if (isNaN(longBreakNum) || longBreakNum < 1 || longBreakNum > 90) {
      errors.push('Long break must be between 1 and 90 minutes');
    }

    if (errors.length > 0) {
      setFormErrors(errors);
      return;
    }

    if (editingProject) {
      const updatedProject: Project = {
        ...editingProject,
        name: formName.trim(),
        goals: formGoals.trim(),
        customSettings: {
          pomodoro: pomodoroNum * 60,
          shortBreak: shortBreakNum * 60,
          longBreak: longBreakNum * 60
        }
      };
      setProjects(projects.map(p => p.id === editingProject.id ? updatedProject : p));
      if (activeProjectId === editingProject.id) {
        setTimeLeft(updatedProject.customSettings[mode]);
        setIsRunning(false);
        setSessionStartTime(0);
      }
    } else {
      const newProject: Project = {
        id: Date.now().toString(),
        name: formName.trim(),
        goals: formGoals.trim(),
        customSettings: {
          pomodoro: pomodoroNum * 60,
          shortBreak: shortBreakNum * 60,
          longBreak: longBreakNum * 60
        },
        totalTime: 0,
        pomodorosCompleted: 0
      };
      setProjects([...projects, newProject]);
      setActiveProjectId(newProject.id);
      setTimeLeft(newProject.customSettings[mode]);
      setIsRunning(false);
      setSessionStartTime(0);
    }

    setFormName('');
    setFormGoals('');
    setFormPomodoro('25');
    setFormShortBreak('5');
    setFormLongBreak('15');
    setFormErrors([]);
    setEditingProject(null);
    setShowModal(false);
  };
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  const formatTotalTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  const getTotalTime = () => {
    return projects.reduce((sum, p) => sum + p.totalTime, 0);
  };
  const progress = ((currentSettings[mode] - timeLeft) / currentSettings[mode]) * 100;
  const particles = Array.from({ length: 30 }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    top: Math.random() * 100,
    delay: i * 0.5,
    duration: 15 + Math.random() * 15,
  }));
  return (
    <div className="relative h-screen w-full overflow-hidden bg-black">
      {/* Aurora Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-950 via-slate-950 to-black">
        <div className="absolute top-[-20%] left-[-10%] w-[80vw] h-[80vw] bg-purple-500/10 rounded-full blur-[120px] animate-[pulse_8s_ease-in-out_infinite]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[60vw] h-[60vw] bg-blue-500/10 rounded-full blur-[100px] animate-[pulse_10s_ease-in-out_infinite_1s]" />
      </div>
      {/* Floating Particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {particles.map((particle) => (
          <div
            key={particle.id}
            className="absolute text-white/10"
            style={{
              left: `${particle.left}%`,
              top: `${particle.top}%`,
              animation: `float ${particle.duration}s ease-in-out ${particle.delay}s infinite`,
            }}
          >
            <Sparkles className="w-4 h-4" />
          </div>
        ))}
      </div>
      {/* Left Sidebar Toggle Button */}
      <button
        onClick={() => setShowSidebar(!showSidebar)}
        className="fixed left-0 top-1/2 -translate-y-1/2 z-30 p-3 bg-white/10 backdrop-blur-md border border-white/20 border-l-0 rounded-r-xl text-white hover:bg-white/20 transition-all duration-300 shadow-[0_0_20px_rgba(168,85,247,0.2)]"
        aria-label={showSidebar ? 'Hide projects sidebar' : 'Show projects sidebar'}
      >
        {showSidebar ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
      </button>
      {/* Left Sidebar */}
      <div
        className={`fixed left-0 top-0 h-full w-64 sm:w-80
    bg-gradient-to-b from-white/10 via-white/5 to-black/20
    backdrop-blur-2xl
    border-r border-white/20
    shadow-[0_0_60px_rgba(168,85,247,0.15)]
    z-20 transition-transform duration-300
    ${showSidebar ? 'translate-x-0' : '-translate-x-full'}
  `}
      >
        <div className="h-full overflow-y-auto p-6">

          {/* Header */}
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/10">
            <h2 className="text-white text-xl font-semibold flex items-center gap-3">
              <span className="p-2 rounded-xl bg-purple-500/20 shadow-[0_0_20px_rgba(168,85,247,0.4)]">
                <Folder className="w-5 h-5 text-purple-300" />
              </span>
              Projects
            </h2>

            <button
              onClick={() => {
                setEditingProject(null);
                setFormName('');
                setFormGoals('');
                setFormPomodoro('25');
                setFormShortBreak('5');
                setFormLongBreak('15');
                setFormErrors([]);
                setShowModal(true);
              }}
              className="p-2 rounded-xl
          bg-gradient-to-br from-purple-500/30 to-pink-500/20
          border border-white/30
          text-white
          hover:scale-105 hover:shadow-[0_0_25px_rgba(168,85,247,0.5)]
          active:scale-95
          transition-all duration-300"
              aria-label="Add new project"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>

          {/* Empty State */}
          {projects.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl
          bg-gradient-to-br from-purple-500/20 to-pink-500/10
          flex items-center justify-center
          shadow-[0_0_30px_rgba(168,85,247,0.4)]">
                <Folder className="w-8 h-8 text-purple-300" />
              </div>

              <p className="text-white/50 text-sm mb-5">
                No projects yet
              </p>

              <button
                onClick={() => {
                  setEditingProject(null);
                  setFormName('');
                  setFormGoals('');
                  setFormPomodoro('25');
                  setFormShortBreak('5');
                  setFormLongBreak('15');
                  setFormErrors([]);
                  setShowModal(true);
                }}
                className="px-5 py-2 rounded-xl
            bg-white/10 border border-white/20
            text-white text-sm
            hover:bg-white/20 hover:scale-105
            transition-all duration-300"
              >
                Create First Project
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {projects.map(project => (
                <button
                  key={project.id}
                  onClick={() => handleProjectSelect(project.id)}
                  className={`group w-full text-left p-4 rounded-2xl
              transition-all duration-300 relative overflow-hidden
              ${activeProjectId === project.id
                      ? 'bg-gradient-to-br from-purple-500/20 to-pink-500/10 border border-purple-400/40 shadow-[0_0_30px_rgba(168,85,247,0.35)]'
                      : 'bg-white/5 border border-white/10 hover:bg-white/10 hover:scale-[1.02]'
                    }
            `}
                >
                  {/* Hover glow */}
                  <span className="absolute inset-0 opacity-0 group-hover:opacity-100 transition pointer-events-none
              bg-gradient-to-r from-purple-500/10 via-transparent to-pink-500/10" />

                  {/* Top row */}
                  <div className="relative flex justify-between items-start mb-2">
                    <div className="text-white font-semibold tracking-wide">
                      {project.name}
                    </div>

                    <div className="flex gap-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditProject(project);
                        }}
                        className="p-1 rounded-md
                    text-white/50
                    hover:text-white hover:bg-white/10
                    transition-all duration-200"
                        aria-label="Edit project"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteProject(project.id);
                        }}
                        className="p-1 rounded-md
                    text-white/50
                    hover:text-red-400 hover:bg-red-500/10
                    transition-all duration-200"
                        aria-label="Delete project"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Goals */}
                  <div className="relative text-white/50 text-sm leading-relaxed line-clamp-2 mb-3">
                    {project.goals}
                  </div>

                  {/* Stats */}
                  <div className="relative flex items-center justify-between text-xs">
                    <div className="flex flex-col gap-1">
                      <span className="text-purple-300 text-xs font-medium px-2 py-1 rounded-full bg-purple-500/10 w-fit">
                        {project.pomodorosCompleted} pomodoros
                      </span>
                      <span className="text-white/40 text-xs">
                        {project.customSettings.pomodoro / 60}m ·{' '}
                        {project.customSettings.shortBreak / 60}m ·{' '}
                        {project.customSettings.longBreak / 60}m
                      </span>
                    </div>

                    <span className="text-white/60">
                      {formatTotalTime(project.totalTime)}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Total Time Summary */}
          {projects.length > 0 && (
            <div className="mt-6 p-4 rounded-2xl
        bg-gradient-to-r from-purple-500/10 to-pink-500/5
        border border-white/20
        shadow-inner">
              <div className="flex items-center justify-between">
                <span className="text-white/50 text-sm">Total Time</span>
                <span className="text-purple-300 font-semibold">
                  {formatTotalTime(getTotalTime())}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Sidebar Overlay for Mobile */}
      {showSidebar && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-10 lg:hidden"
          onClick={() => setShowSidebar(false)}
        />
      )}
      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center justify-center h-screen px-6">
        {/* Mode Selector */}
        <div className="mb-8 md:mb-12 flex flex-wrap gap-2 md:gap-3 justify-center">
          <button
            onClick={() => handleModeChange('pomodoro')}
            className={`px-3 py-2 sm:px-4 sm:py-2 md:px-6 md:py-3 rounded-xl text-xs sm:text-sm font-medium tracking-wide transition-all duration-300 ${mode === 'pomodoro'
                ? 'bg-white/10 text-white border border-white/30 backdrop-blur-md shadow-[0_0_30px_rgba(255,255,255,0.1)]'
                : 'bg-white/5 text-white/60 border border-white/10 backdrop-blur-sm hover:bg-white/10 hover:text-white/80'
              }`}
          >
            <Clock className="w-3 h-3 sm:w-4 sm:h-4 inline mr-1 md:mr-2" />
            Pomodoro
          </button>
          <button
            onClick={() => handleModeChange('shortBreak')}
            className={`px-3 py-2 sm:px-4 sm:py-2 md:px-6 md:py-3 rounded-xl text-xs sm:text-sm font-medium tracking-wide transition-all duration-300 ${mode === 'shortBreak'
                ? 'bg-white/10 text-white border border-white/30 backdrop-blur-md shadow-[0_0_30px_rgba(255,255,255,0.1)]'
                : 'bg-white/5 text-white/60 border border-white/10 backdrop-blur-sm hover:bg-white/10 hover:text-white/80'
              }`}
          >
            <Coffee className="w-3 h-3 sm:w-4 sm:h-4 inline mr-1 md:mr-2" />
            Short Break
          </button>
          <button
            onClick={() => handleModeChange('longBreak')}
            className={`px-3 py-2 sm:px-4 sm:py-2 md:px-6 md:py-3 rounded-xl text-xs sm:text-sm font-medium tracking-wide transition-all duration-300 ${mode === 'longBreak'
                ? 'bg-white/10 text-white border border-white/30 backdrop-blur-md shadow-[0_0_30px_rgba(255,255,255,0.1)]'
                : 'bg-white/5 text-white/60 border border-white/10 backdrop-blur-sm hover:bg-white/10 hover:text-white/80'
              }`}
          >
            <Coffee className="w-3 h-3 sm:w-4 sm:h-4 inline mr-1 md:mr-2" />
            Long Break
          </button>
        </div>
        {/* Timer Circle */}
        <div className="relative mb-8">
          <div className="absolute inset-0 m-[-15px] rounded-full border-2 border-purple-400/30 opacity-50 animate-[ping_3s_ease-in-out_infinite]" />

          <svg className="absolute inset-0 -rotate-90" viewBox="0 0 280 280">
            <circle cx="140" cy="140" r="130" stroke="rgba(255,255,255,0.1)" strokeWidth="2" fill="none" />
            <circle
              cx="140"
              cy="140"
              r="130"
              stroke="url(#gradient)"
              strokeWidth="2"
              fill="none"
              strokeDasharray={`${2 * Math.PI * 130}`}
              strokeDashoffset={`${2 * Math.PI * 130 * (1 - progress / 100)}`}
              className="transition-all duration-1000 ease-linear"
              strokeLinecap="round"
            />
            <defs>
              <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#a78bfa" />
                <stop offset="100%" stopColor="#ec4899" />
              </linearGradient>
            </defs>
          </svg>
          <div className="w-60 h-60 sm:w-72 md:w-[280px] md:h-[280px] rounded-full bg-slate-400/5 border border-white/10 backdrop-blur-xl shadow-[0_0_10px_rgba(168,85,247,0.2)] flex flex-col items-center justify-center relative z-10">
            <div
              className="text-6xl sm:text-7xl font-thin text-white/70 tracking-tight"
              style={{ textShadow: '0 0 20px rgba(255,255,255,0.3), 0 0 410px rgba(168,85,247,0.4)' }}
            >
              {formatTime(timeLeft)}
            </div>
            <div className="mt-3 text-sm font-light text-purple-200/80 tracking-widest uppercase">
              {mode === 'pomodoro' ? 'Focus Time' : mode === 'shortBreak' ? 'Short Break' : 'Long Break'}
            </div>
          </div>
        </div>
        {/* Control Buttons */}
        <div className="flex gap-3 mb-6">
          <button
            onClick={toggleTimer}
            className="px-6 sm:px-8 py-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md text-white/70 hover:bg-white/15 transition-all duration-300  "
            aria-label={isRunning ? 'Pause timer' : 'Start timer'}
          >
            {isRunning ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-1" />}
          </button>
          <button
            onClick={handleReset}
            className="px-6 sm:px-8 py-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md text-white/70 hover:bg-white/15 hover:text-white transition-all duration-300"
            aria-label="Reset timer"
          >
            <RotateCcw className="w-5 h-5" />
          </button>
        </div>
        {/* Project Status */}
        {activeProject ? (
          <div className="px-6 py-3 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm">
            <span className="text-sm text-white/60">{activeProject.name}: </span>
            <span className="text-sm text-purple-300 font-medium">{activeProject.pomodorosCompleted} pomodoros</span>
          </div>
        ) : (
          <div className="px-6 py-3 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm">
            <span className="text-sm text-white/60">Default Timer</span>
          </div>
        )}
      </div>
      {/* Project Modal */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowModal(false);
              setFormErrors([]);
              setEditingProject(null);
            }
          }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
        >
          <div className="w-full max-w-sm sm:max-w-md bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl shadow-[0_0_60px_rgba(168,85,247,0.3)] animate-[scaleIn_0.3s_ease-out]">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 id="modal-title" className="text-2xl text-white font-medium">{editingProject ? 'Edit Project' : 'Add New Project'}</h2>
                <button
                  onClick={() => {
                    setShowModal(false);
                    setFormErrors([]);
                    setEditingProject(null);
                  }}
                  className="p-2 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-all duration-300"
                  aria-label="Close modal"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              {formErrors.length > 0 && (
                <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20" role="alert">
                  {formErrors.map((error, i) => (
                    <div key={i} className="text-sm text-red-300">{error}</div>
                  ))}
                </div>
              )}
              <div className="space-y-4">
                <div>
                  <label htmlFor="project-name" className="block text-sm text-white/80 mb-2">Project Name *</label>
                  <input
                    id="project-name"
                    type="text"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    className="w-full px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-purple-400/50 transition-all duration-300"
                    placeholder="Enter project name"
                  />
                </div>
                <div>
                  <label htmlFor="project-goals" className="block text-sm text-white/80 mb-2">Project Goals *</label>
                  <textarea
                    id="project-goals"
                    value={formGoals}
                    onChange={(e) => setFormGoals(e.target.value)}
                    rows={3}
                    className="w-full px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-purple-400/50 transition-all duration-300 resize-none"
                    placeholder="Describe your project goals"
                  />
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label htmlFor="pomodoro-duration" className="block text-xs text-white/80 mb-2">Pomodoro (min)</label>
                    <input
                      id="pomodoro-duration"
                      type="number"
                      value={formPomodoro}
                      onChange={(e) => setFormPomodoro(e.target.value)}
                      min="1"
                      max="120"
                      className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-white text-sm focus:outline-none focus:border-purple-400/50 transition-all duration-300"
                    />
                  </div>
                  <div>
                    <label htmlFor="short-break-duration" className="block text-xs text-white/80 mb-2">Short (min)</label>
                    <input
                      id="short-break-duration"
                      type="number"
                      value={formShortBreak}
                      onChange={(e) => setFormShortBreak(e.target.value)}
                      min="1"
                      max="60"
                      className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-white text-sm focus:outline-none focus:border-purple-400/50 transition-all duration-300"
                    />
                  </div>
                  <div>
                    <label htmlFor="long-break-duration" className="block text-xs text-white/80 mb-2">Long (min)</label>
                    <input
                      id="long-break-duration"
                      type="number"
                      value={formLongBreak}
                      onChange={(e) => setFormLongBreak(e.target.value)}
                      min="1"
                      max="90"
                      className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-white text-sm focus:outline-none focus:border-purple-400/50 transition-all duration-300"
                    />
                  </div>
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => {
                    setShowModal(false);
                    setFormErrors([]);
                    setEditingProject(null);
                  }}
                  className="flex-1 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white/60 hover:bg-white/10 hover:text-white transition-all duration-300"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmitProject}
                  className="flex-1 px-4 py-2 rounded-xl bg-purple-500/20 border border-purple-400/30 text-white hover:bg-purple-500/30 transition-all duration-300 shadow-[0_0_20px_rgba(168,85,247,0.2)]"
                >
                  {editingProject ? 'Update Project' : 'Add Project'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      <style>{`
        @keyframes float {
          0%, 100% {
            transform: translate(0, 0);
            opacity: 0.1;
          }
          50% {
            transform: translate(20px, -30px);
            opacity: 0.15;
          }
        }
       
        @keyframes pulse {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.6; }
        }
        @keyframes ping {
          0% { transform: scale(1); opacity: 0.5; }
          70% { transform: scale(1.2); opacity: 0; }
          100% { transform: scale(1.2); opacity: 0; }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scaleIn {
          from { transform: scale(0.95); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}