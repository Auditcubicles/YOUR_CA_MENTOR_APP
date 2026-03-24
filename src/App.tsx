import React, { useState, useEffect, useRef } from 'react';
import {
  LayoutDashboard, CalendarCheck, Timer as TimerIcon, MessageSquare, TrendingUp, BookOpen,
  AlertTriangle, CheckCircle, XCircle, Play, Pause, RotateCcw, Send, Flame, Calendar,
  BrainCircuit, Target, FileText, Sun, Moon, Maximize, Minimize, Library, ExternalLink, 
  FolderOpen, StopCircle, Clock, BarChart2, Bell, Zap, Headphones, Trophy, EyeOff, MoonStar, Megaphone, PictureInPicture
} from 'lucide-react';

// --- BROWSER MEMORY HOOK ---
function useLocalStorage(key, initialValue) {
  const [value, setValue] = React.useState(() => {
    const saved = localStorage.getItem(key);
    if (saved !== null) { try { return JSON.parse(saved); } catch { return saved; } }
    return initialValue;
  });
  React.useEffect(() => { localStorage.setItem(key, JSON.stringify(value)); }, [key, value]);
  return [value, setValue];
}

const motivationalQuotes = [
  "Push harder than yesterday if you want a different tomorrow.",
  "CA is not about intelligence, it's about pure stamina.",
  "Tired? Learn to rest, not to quit.",
  "Your future self is watching you right now. Make them proud.",
  "Discipline is doing what you hate, but doing it like you love it."
];

export default function CASathiApp() {
  // --- NEW VERCEL/APPLE STYLE MINIMALIST THEME ---
  const [isLightMode, setIsLightMode] = useLocalStorage('ca-theme-light', false);

  const theme = {
    bg: isLightMode ? 'bg-[#FAFAFA]' : 'bg-[#090A0F]',
    text: isLightMode ? 'text-[#111827]' : 'text-[#FAFAFA]',
    sidebar: isLightMode ? 'bg-white border-[#E5E7EB]' : 'bg-[#090A0F] border-[#27272A]',
    card: isLightMode ? 'bg-white border-[#E5E7EB] shadow-sm' : 'bg-[#12121A] border-[#27272A] shadow-lg',
    input: isLightMode ? 'bg-[#F3F4F6] border-[#E5E7EB] text-[#111827] focus:border-blue-500' : 'bg-[#090A0F] border-[#27272A] text-[#FAFAFA] focus:border-blue-500 focus:ring-1 focus:ring-blue-500',
    textMuted: isLightMode ? 'text-[#6B7280]' : 'text-[#A1A1AA]',
    hoverTab: isLightMode ? 'hover:bg-[#F3F4F6] text-[#4B5563]' : 'hover:bg-[#27272A] text-[#A1A1AA] hover:text-white',
    activeTab: isLightMode ? 'bg-[#EFF6FF] text-blue-600 font-semibold' : 'bg-[#1E3A8A]/20 text-blue-400 font-semibold'
  };

  // --- STATE ---
  const [activeTab, setActiveTab] = React.useState('dashboard');
  const [examDate, setExamDate] = useLocalStorage('ca-examDate', '');
  const [targetHours, setTargetHours] = useLocalStorage('ca-targetHours', 10);
  const [hoursStudiedToday, setHoursStudiedToday] = useLocalStorage('ca-hoursToday', 0);
  const [streak, setStreak] = useLocalStorage('ca-streak', 0);
  const [studyHistory, setStudyHistory] = useLocalStorage('ca-study-history', {}); 
  const [subjectMastery, setSubjectMastery] = useLocalStorage('ca-subject-mastery', {}); 
  
  const [eodTargets, setEodTargets] = useLocalStorage('ca-eod-targets', ['', '', '']);
  const [yesterdaysBrainDump, setYesterdaysBrainDump] = useLocalStorage('ca-yesterday-targets', ['', '', '']);
  const [showEODModal, setShowEODModal] = useState(false);
  const [tasks, setTasks] = useLocalStorage('ca-tasks', []);
  const [chatHistory, setChatHistory] = useLocalStorage('ca-chat', [
    { sender: 'mentor', text: "Welcome to CA Sathi. I am your Expert Mentor. Let's conquer the syllabus.", time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) },
  ]);
  const [chatInput, setChatInput] = React.useState('');
  const [toastMessage, setToastMessage] = useState(null); 
  const [toastIcon, setToastIcon] = useState(null);
  const toastTimerRef = useRef(null);
  
  // Timer, Sound & PiP
  const [workDuration, setWorkDuration] = useLocalStorage('ca-work-duration', 50);
  const [breakDuration, setBreakDuration] = useLocalStorage('ca-break-duration', 10);
  const [timerMode, setTimerMode] = useState('pomodoro');
  const [timeLeft, setTimeLeft] = useState(Number(workDuration) * 60 || 3000);
  const [isActive, setIsActive] = useState(false);
  const [showSessionLog, setShowSessionLog] = useState(false);
  const [timerDisplayType, setTimerDisplayType] = useLocalStorage('ca-timer-display', 'digital'); 
  const [isLofiPlaying, setIsLofiPlaying] = useState(false); 
  const [isZenMode, setIsZenMode] = useState(false); 
  const [isPipActive, setIsPipActive] = useState(false);

  const lofiRef = useRef(null);
  const timerRef = useRef(null);
  
  // PiP Refs
  const canvasRef = useRef(null); 
  const videoRef = useRef(null); 

  const [isFullScreen, setIsFullScreen] = useState(false);
  const [showAddTaskModal, setShowAddTaskModal] = React.useState(false);
  const [newTask, setNewTask] = React.useState({ subject: '', topic: '', duration: 2, difficulty: 'Medium', timeOfDay: 'Morning' });

  const rawDaysLeft = examDate ? Math.ceil((new Date(examDate) - new Date()) / (1000 * 60 * 60 * 24)) : 0;
  const daysLeft = Math.max(0, rawDaysLeft);
  const safeTarget = Number(targetHours) || 1; 
  const reqDailyHours = hoursStudiedToday < safeTarget ? (safeTarget - hoursStudiedToday).toFixed(1) : 0;
  const progressPercent = Math.min((Number(hoursStudiedToday) / safeTarget) * 100, 100);

  const formatTime = (seconds) => {
    if (isNaN(seconds) || seconds < 0) return "00:00";
    const m = Math.floor(seconds / 60); const s = Math.floor(seconds % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const triggerToast = (msg, icon = <Bell size={18} />) => {
    setToastMessage(msg); setToastIcon(icon);
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => setToastMessage(null), 10000); 
  };

  // --- NEW ROCK-SOLID PiP ENGINE ---
  const updateCanvas = () => {
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      const width = canvasRef.current.width;
      const height = canvasRef.current.height;
      
      // Clean Deep Dark Background
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, width, height);
      
      // Top Label
      ctx.fillStyle = timerMode === 'pomodoro' ? '#3b82f6' : '#10b981';
      ctx.font = '600 28px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(timerMode === 'pomodoro' ? 'CA FOCUS SESSION' : 'TAKE A BREAK', width / 2, 70);
      
      // Timer
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 140px monospace';
      ctx.fillText(formatTime(timeLeft), width / 2, height / 2 + 50);
    }
  };

  // Keep canvas updated every second
  useEffect(() => {
    updateCanvas();
  }, [timeLeft, timerMode]);

  const togglePip = async () => {
    try {
      const video = videoRef.current;
      if (!video || !canvasRef.current) return;

      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
        setIsPipActive(false);
      } else {
        // Draw once before streaming to ensure it's not blank
        updateCanvas(); 
        const stream = canvasRef.current.captureStream(30); 
        video.srcObject = stream;
        
        // Ensure video is playing before requesting PiP
        await video.play(); 
        await video.requestPictureInPicture();
        setIsPipActive(true);
      }
    } catch (error) {
      console.error(error);
      triggerToast("PiP is blocked or not supported by your browser.", <AlertTriangle size={18}/>);
    }
  };

  useEffect(() => {
    const video = videoRef.current;
    const handleLeavePip = () => setIsPipActive(false);
    if (video) video.addEventListener('leavepictureinpicture', handleLeavePip);
    return () => { if (video) video.removeEventListener('leavepictureinpicture', handleLeavePip); };
  }, []);

  // --- TIMER LOGIC ---
  useEffect(() => {
    let interval = null;
    if (isActive && timeLeft > 0) interval = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    else if (isActive && timeLeft <= 0) { setIsActive(false); handleSessionComplete(); }
    return () => clearInterval(interval);
  }, [isActive, timeLeft]);

  const handleStopSession = () => {
    setIsActive(false);
    if (isZenMode) setIsZenMode(false);
    const safeWorkDur = Number(workDuration) || 50;
    const totalPlanned = timerMode === 'pomodoro' ? safeWorkDur * 60 : (Number(breakDuration) || 10) * 60;
    const secondsStudied = totalPlanned - timeLeft;
    
    if (timerMode === 'pomodoro' && secondsStudied > 0) {
      const added = secondsStudied / 3600; 
      setHoursStudiedToday(prev => prev + added);
      saveToHistory(added);
      triggerToast(`Saved ${(secondsStudied / 60).toFixed(1)} mins to progress.`);
    }
    setTimerMode('pomodoro'); setTimeLeft(safeWorkDur * 60); setShowSessionLog(false);
    if(document.fullscreenElement) document.exitFullscreen().catch(()=>{}); 
  };

  const handleSessionComplete = () => {
    if (isZenMode) setIsZenMode(false); 
    if (timerMode === 'pomodoro') { setShowSessionLog(true); if(document.fullscreenElement) document.exitFullscreen().catch(()=>{}); } 
    else { setTimerMode('pomodoro'); setTimeLeft((Number(workDuration) || 50) * 60); triggerToast('Break over. Get back to work.'); }
  };

  const saveToHistory = (hoursToAdd) => {
    const todayStr = new Date().toISOString().split('T')[0];
    setStudyHistory(prev => ({ ...prev, [todayStr]: (prev[todayStr] || 0) + hoursToAdd }));
  };

  const logSessionResult = (status) => {
    setShowSessionLog(false);
    const safeWorkDur = Number(workDuration) || 50;
    const added = status === 'completed' ? (safeWorkDur / 60) : status === 'partial' ? ((safeWorkDur / 2) / 60) : 0;
    
    if (added > 0) { setHoursStudiedToday(prev => prev + added); saveToHistory(added); }
    if (status === 'completed') {
      triggerToast("Great session logged.");
      setTimerMode('shortBreak'); setTimeLeft((Number(breakDuration) || 10) * 60); setIsActive(true);
    } else if (status === 'partial') { triggerToast('Partial session logged. Focus better.'); }
  };

  const toggleLofi = () => {
    if (!lofiRef.current) return;
    if (isLofiPlaying) { lofiRef.current.pause(); setIsLofiPlaying(false); } 
    else { lofiRef.current.volume = 0.3; lofiRef.current.play().then(() => setIsLofiPlaying(true)).catch(e => triggerToast("Click again to play audio.", <AlertTriangle size={18}/>)); }
  };

  // --- RENDER COMPONENTS (MINIMALIST REDESIGN) ---
  const renderDashboard = () => (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-5xl mx-auto">
      
      {/* CLEAN HEADER SECTION */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight mb-1">Dashboard</h1>
          <p className={theme.textMuted}>Mission CA Final • Track your progress</p>
        </div>
        <button onClick={() => setShowEODModal(true)} className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors ${isLightMode ? 'bg-black text-white hover:bg-gray-800' : 'bg-white text-black hover:bg-gray-200'}`}>
          <MoonStar size={16} /> End Day Ritual
        </button>
      </div>

      {/* TOP METRICS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className={`${theme.card} p-6 rounded-2xl flex flex-col justify-between`}>
          <div className="flex justify-between items-center mb-4">
            <span className={`text-sm font-semibold ${theme.textMuted}`}>Exam Countdown</span>
            <Calendar size={18} className="text-blue-500" />
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-extrabold tracking-tight">{daysLeft}</span>
              <span className={`text-sm ${theme.textMuted}`}>Days</span>
            </div>
            <div className="mt-4 flex items-center gap-3">
              <input type="date" value={examDate} onChange={(e) => setExamDate(e.target.value)} className={`${theme.input} w-full rounded-md px-3 py-1.5 text-xs font-medium focus:outline-none`} />
            </div>
          </div>
        </div>

        <div className={`${theme.card} p-6 rounded-2xl flex flex-col justify-between`}>
          <div className="flex justify-between items-center mb-4">
            <span className={`text-sm font-semibold ${theme.textMuted}`}>Today's Focus</span>
            <Target size={18} className="text-emerald-500" />
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-extrabold tracking-tight">{Number(hoursStudiedToday).toFixed(1)}</span>
              <span className={`text-sm ${theme.textMuted}`}>/ {safeTarget} hrs</span>
            </div>
            <div className="mt-4 flex items-center gap-3">
              <input type="number" value={targetHours} onChange={(e) => setTargetHours(e.target.value)} className={`${theme.input} w-full rounded-md px-3 py-1.5 text-xs font-medium focus:outline-none`} placeholder="Daily Goal" />
            </div>
          </div>
        </div>

        <div className={`${theme.card} p-6 rounded-2xl flex flex-col justify-between`}>
          <div className="flex justify-between items-center mb-4">
            <span className={`text-sm font-semibold ${theme.textMuted}`}>Consistency</span>
            <Flame size={18} className="text-orange-500" />
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-extrabold tracking-tight">{streak}</span>
              <span className={`text-sm ${theme.textMuted}`}>Day Streak</span>
            </div>
            <p className={`text-xs mt-4 font-medium ${theme.textMuted}`}>Keep hitting the daily target.</p>
          </div>
        </div>
      </div>

      {/* BRAIN DUMP SECTION */}
      {yesterdaysBrainDump.some(t => t.trim() !== '') && (
        <div className={`${theme.card} p-6 rounded-2xl`}>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-bold flex items-center gap-2"><FileText size={16} className="text-blue-500" /> Today's Imported Targets</h3>
            <button onClick={() => setYesterdaysBrainDump(['','',''])} className={`text-xs font-semibold ${theme.textMuted} hover:text-red-500`}>Clear</button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {yesterdaysBrainDump.filter(t => t.trim() !== '').map((t, idx) => (
                <div key={idx} className={`p-4 rounded-xl border ${isLightMode ? 'bg-[#F9FAFB] border-[#E5E7EB]' : 'bg-[#18181B] border-[#27272A]'}`}>
                    <div className="text-sm font-medium">{t}</div>
                </div>
            ))}
          </div>
        </div>
      )}

      {/* EOD MODAL */}
      {showEODModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[200] p-4 animate-in fade-in">
          <div className={`${theme.cardSolid} rounded-2xl p-8 max-w-md w-full shadow-2xl`}>
            <h3 className="text-xl font-bold mb-2 flex items-center gap-2"><MoonStar size={20} className="text-blue-500" /> End Day Ritual</h3>
            <p className={`text-xs mb-6 ${theme.textMuted}`}>Set tomorrow's top 3 targets.</p>
            <div className="space-y-3 mb-6">
              {[0, 1, 2].map((i) => (
                <input key={i} type="text" value={eodTargets[i]} onChange={(e) => { const newTargets = [...eodTargets]; newTargets[i] = e.target.value; setEodTargets(newTargets); }} placeholder={`Target ${i+1}`} className={`w-full rounded-lg p-3 text-sm outline-none ${theme.input}`} />
              ))}
            </div>
            <div className="flex gap-3">
              <button onClick={() => setShowEODModal(false)} className={`flex-1 py-2.5 rounded-lg font-semibold text-sm ${isLightMode ? 'bg-gray-100 text-gray-700' : 'bg-[#27272A] text-white'}`}>Cancel</button>
              <button onClick={() => { setShowEODModal(false); triggerToast("Targets saved.", <CheckCircle size={18}/>); }} className="flex-1 py-2.5 bg-blue-600 text-white rounded-lg font-semibold text-sm hover:bg-blue-500 transition-colors">Save & Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderTimer = () => {
    if (isZenMode) {
      return (
        <div className="fixed inset-0 z-[200] bg-[#090A0F] text-white flex flex-col items-center justify-center p-8 animate-in fade-in duration-500">
          <audio ref={lofiRef} src="https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3" loop />
          <button onClick={() => setIsZenMode(false)} className="absolute top-8 right-8 flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg font-semibold text-xs transition-colors">
            <EyeOff size={14} /> Exit Zen
          </button>
          <div className="absolute top-8 left-8">
            <button onClick={toggleLofi} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${isLofiPlaying ? 'text-blue-400 bg-blue-500/10' : 'text-white/50 bg-white/5'}`}>
              <Headphones size={14} /> {isLofiPlaying ? 'Lo-Fi On' : 'Lo-Fi Off'}
            </button>
          </div>
          <h2 className="text-xs font-bold mb-8 tracking-[0.3em] text-white/40 uppercase">{timerMode === 'pomodoro' ? 'Deep Focus' : 'Break'}</h2>
          <div className="text-8xl md:text-[12rem] font-bold font-mono tracking-tighter leading-none mb-16 text-white drop-shadow-md">
            {formatTime(timeLeft)}
          </div>
          <div className="flex justify-center items-center gap-6 mb-20">
            <button onClick={() => setIsActive(!isActive)} className={`w-24 h-24 rounded-full flex items-center justify-center transition-colors ${isActive ? 'bg-white/10 text-white' : 'bg-white text-black'}`}>
              {isActive ? <Pause size={32} /> : <Play size={32} className="ml-1" />}
            </button>
            <button onClick={handleStopSession} className="w-16 h-16 rounded-full flex items-center justify-center bg-red-500/20 text-red-500 hover:bg-red-500/30 transition-colors">
              <StopCircle size={24} />
            </button>
          </div>
        </div>
      );
    }

    return (
      <div ref={timerRef} className={`h-full flex flex-col items-center justify-center relative animate-in fade-in max-w-4xl mx-auto ${isFullScreen ? (isLightMode ? 'bg-[#FAFAFA]' : 'bg-[#090A0F]') : ''}`}>
        
        {/* --- PIP INFRASTRUCTURE (DOM Mounted but hidden) --- */}
        <canvas ref={canvasRef} width="600" height="300" className="fixed top-[-9999px] left-[-9999px] pointer-events-none" />
        <video ref={videoRef} autoPlay muted playsInline className="fixed top-[-9999px] left-[-9999px] pointer-events-none" />
        <audio ref={lofiRef} src="https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3" loop /> 
        
        {/* CLEAN NAVBAR FOR TIMER */}
        <div className="w-full flex flex-col sm:flex-row justify-between items-center gap-4 mb-16 px-4">
          <button onClick={toggleLofi} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-colors border ${isLofiPlaying ? 'bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/30' : isLightMode ? 'bg-white border-[#E5E7EB] text-[#4B5563]' : 'bg-[#18181B] border-[#27272A] text-[#A1A1AA]'}`}>
            <Headphones size={16} /> {isLofiPlaying ? 'Pause Lo-Fi' : 'Play Focus Lo-Fi'}
          </button>
          
          <div className="flex items-center gap-3">
            <button onClick={togglePip} className={`px-4 py-2 rounded-lg font-semibold text-xs flex items-center gap-2 border transition-colors ${isPipActive ? 'bg-blue-600 text-white border-blue-600' : isLightMode ? 'bg-white border-[#E5E7EB] text-[#4B5563] hover:bg-[#F3F4F6]' : 'bg-[#18181B] border-[#27272A] text-[#A1A1AA] hover:bg-[#27272A]'}`}>
              <PictureInPicture size={14} /> PiP
            </button>
            <button onClick={() => setIsZenMode(true)} className={`px-4 py-2 rounded-lg font-semibold text-xs flex items-center gap-2 border transition-colors ${isLightMode ? 'bg-black text-white border-black' : 'bg-white text-black border-white hover:bg-gray-200'}`}>
              <EyeOff size={14} /> Zen
            </button>
            <button onClick={toggleFullScreen} className={`p-2 rounded-lg border transition-colors ${isLightMode ? 'bg-white border-[#E5E7EB] text-[#4B5563]' : 'bg-[#18181B] border-[#27272A] text-[#A1A1AA]'}`}>
              {isFullScreen ? <Minimize size={16} /> : <Maximize size={16} />}
            </button>
          </div>
        </div>

        <div className="text-center w-full">
          <div className={`inline-flex items-center gap-1 p-1 rounded-lg border mb-10 ${isLightMode ? 'bg-[#F3F4F6] border-[#E5E7EB]' : 'bg-[#18181B] border-[#27272A]'}`}>
            <button onClick={() => setTimerDisplayType('digital')} className={`px-4 py-1.5 rounded-md text-xs font-semibold transition-colors ${timerDisplayType === 'digital' ? 'bg-white text-black shadow-sm dark:bg-[#27272A] dark:text-white' : theme.textMuted}`}>Digital</button>
            <button onClick={() => setTimerDisplayType('analog')} className={`px-4 py-1.5 rounded-md text-xs font-semibold transition-colors ${timerDisplayType === 'analog' ? 'bg-white text-black shadow-sm dark:bg-[#27272A] dark:text-white' : theme.textMuted}`}>Analog</button>
          </div>

          {timerDisplayType === 'digital' ? (
            <div className={`text-7xl md:text-[9rem] font-bold font-mono tracking-tighter leading-none mb-12 ${timerMode === 'shortBreak' ? 'text-emerald-500' : theme.text}`}>
              {formatTime(timeLeft)}
            </div>
          ) : (
            <div className="relative flex flex-col items-center justify-center mb-10 w-full">
              <svg width="240" height="240" viewBox="0 0 100 100" className="mx-auto">
                <circle cx="50" cy="50" r="48" fill="transparent" stroke={isLightMode ? '#E5E7EB' : '#27272A'} strokeWidth="2" />
                <line x1="50" y1="50" x2="50" y2="20" stroke={isLightMode ? '#111827' : '#ffffff'} strokeWidth="3" strokeLinecap="round" transform={`rotate(${(Math.floor((Number(timeLeft)||0)/60)*6)+(((Number(timeLeft)||0)%60)*0.1)} 50 50)`} />
                <line x1="50" y1="50" x2="50" y2="15" stroke="#ef4444" strokeWidth="1.5" strokeLinecap="round" transform={`rotate(${((Number(timeLeft)||0)%60)*6} 50 50)`} />
                <circle cx="50" cy="50" r="4" fill="#3b82f6" />
              </svg>
            </div>
          )}

          {!isActive && !isFullScreen && (
            <div className="flex justify-center gap-6 mb-10">
              <div className="flex flex-col items-center">
                <label className={`text-xs font-semibold mb-2 ${theme.textMuted}`}>Work (m)</label>
                <input type="number" value={workDuration} onChange={(e) => { const v = e.target.value; setWorkDuration(v); if(timerMode==='pomodoro') setTimeLeft((Number(v)||0)*60);}} className={`w-16 text-center rounded-lg p-2 font-mono text-sm border ${isLightMode ? 'bg-white border-[#E5E7EB]' : 'bg-[#18181B] border-[#27272A]'} outline-none focus:border-blue-500`} />
              </div>
              <div className="flex flex-col items-center">
                <label className={`text-xs font-semibold mb-2 ${theme.textMuted}`}>Break (m)</label>
                <input type="number" value={breakDuration} onChange={(e) => { const v = e.target.value; setBreakDuration(v); if(timerMode==='shortBreak') setTimeLeft((Number(v)||0)*60);}} className={`w-16 text-center rounded-lg p-2 font-mono text-sm border ${isLightMode ? 'bg-white border-[#E5E7EB]' : 'bg-[#18181B] border-[#27272A]'} outline-none focus:border-blue-500`} />
              </div>
            </div>
          )}
          
          <div className="flex justify-center items-center gap-6">
            <button onClick={() => { setIsActive(false); setTimeLeft(timerMode === 'pomodoro' ? (Number(workDuration)||50) * 60 : (Number(breakDuration)||10) * 60); }} className={`p-3 rounded-full border transition-colors ${isLightMode ? 'bg-white border-[#E5E7EB] hover:bg-gray-50 text-gray-600' : 'bg-[#18181B] border-[#27272A] hover:bg-[#27272A] text-gray-400'}`}><RotateCcw size={20} /></button>
            <button onClick={() => setIsActive(!isActive)} className={`w-20 h-20 rounded-full flex items-center justify-center transition-colors ${isActive ? 'bg-[#FFFBEB] text-orange-600 border border-orange-200 dark:bg-orange-500/10 dark:border-orange-500/30' : 'bg-blue-600 text-white hover:bg-blue-700'}`}>{isActive ? <Pause size={28} /> : <Play size={28} className="ml-1" />}</button>
            <button onClick={handleStopSession} className={`p-3 rounded-full border transition-colors ${isLightMode ? 'bg-red-50 border-red-200 text-red-500 hover:bg-red-100' : 'bg-red-500/10 border-red-500/20 text-red-500 hover:bg-red-500/20'}`}><StopCircle size={20} /></button>
          </div>
        </div>

        {showSessionLog && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[400] p-4 animate-in fade-in">
            <div className={`${theme.cardSolid} rounded-2xl p-8 max-w-sm w-full text-center shadow-xl`}>
              <h3 className="text-xl font-bold mb-2">Session Complete</h3>
              <p className={`text-xs mb-6 ${theme.textMuted}`}>How was your focus?</p>
              <div className="space-y-3">
                <button onClick={() => logSessionResult('completed')} className="w-full py-3 bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400 rounded-lg font-semibold text-sm border border-emerald-200 dark:border-emerald-500/20">100% Focused</button>
                <button onClick={() => logSessionResult('partial')} className="w-full py-3 bg-orange-50 text-orange-600 dark:bg-orange-500/10 dark:text-orange-400 rounded-lg font-semibold text-sm border border-orange-200 dark:border-orange-500/20">Partially Distracted</button>
                <button onClick={() => logSessionResult('failed')} className="w-full py-3 bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400 rounded-lg font-semibold text-sm border border-red-200 dark:border-red-500/20">Wasted Session</button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderPlanner = () => (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Study Planner</h2>
          <p className={`text-sm ${theme.textMuted} mt-1`}>Organize your day and check off tasks.</p>
        </div>
        <button onClick={() => setShowAddTaskModal(true)} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold text-sm transition-colors">+ Add Task</button>
      </div>

      <div className="space-y-3">
        {tasks.map((task) => (
          <div key={task.id} className={`flex flex-col sm:flex-row sm:items-center justify-between p-4 ${theme.card} rounded-xl transition-colors gap-4`}>
            <div className="flex items-center gap-4">
              <button onClick={() => toggleTaskStatus(task.id)} className="shrink-0">
                {task.status === 'completed' && <CheckCircle className="text-emerald-500" size={24} />}
                {task.status === 'partial' && <AlertTriangle className="text-amber-500" size={24} />}
                {task.status === 'pending' && <div className={`w-6 h-6 rounded-full border-2 ${isLightMode ? 'border-[#D1D5DB]' : 'border-[#3F3F46]'}`}></div>}
              </button>
              <div>
                <div className="font-semibold text-sm flex items-center gap-2">
                  {task.subject}: <span className="font-normal opacity-80">{task.topic}</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded uppercase font-bold ${task.difficulty === 'Hard' ? 'bg-red-100 text-red-600 dark:bg-red-500/10 dark:text-red-400' : task.difficulty === 'Medium' ? 'bg-orange-100 text-orange-600 dark:bg-orange-500/10 dark:text-orange-400' : 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400'}`}>{task.difficulty}</span>
                </div>
                <div className={`text-xs ${theme.textMuted} mt-1`}>{task.timeOfDay} Block • {task.duration}h</div>
              </div>
            </div>
            <div className="flex items-center gap-3 sm:ml-auto">
              <button onClick={() => setTasks(tasks.filter((t) => t.id !== task.id))} className={`text-red-500 text-xs font-semibold hover:bg-red-50 dark:hover:bg-red-500/10 px-3 py-1.5 rounded-lg transition-colors`}>Drop</button>
              {task.status === 'completed' ? (
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-4 py-1.5 rounded-lg">Done</span>
              ) : (
                <button onClick={() => setActiveTab('timer')} className="text-xs bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-500/20 px-4 py-1.5 rounded-lg font-semibold transition-colors">Start Focus</button>
              )}
            </div>
          </div>
        ))}
        {tasks.length === 0 && (
          <div className={`text-center py-12 ${theme.card} rounded-xl`}>
            <p className="font-semibold text-sm">No tasks planned.</p>
            <p className={`text-xs mt-1 ${theme.textMuted}`}>Add tasks to start tracking your daily progress.</p>
          </div>
        )}
      </div>

      {showAddTaskModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4 animate-in fade-in">
          <div className={`${theme.cardSolid} rounded-2xl p-6 max-w-md w-full shadow-2xl`}>
            <h3 className="text-lg font-bold mb-4">Create Task</h3>
            <form onSubmit={handleAddTask} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><label className={`text-xs font-semibold mb-1.5 block ${theme.textMuted}`}>Subject</label><input type="text" value={newTask.subject} onChange={(e) => setNewTask({ ...newTask, subject: e.target.value })} className={`w-full rounded-lg p-2.5 text-sm outline-none border ${isLightMode ? 'bg-[#F9FAFB] border-[#E5E7EB]' : 'bg-[#18181B] border-[#27272A]'}`} required /></div>
                <div><label className={`text-xs font-semibold mb-1.5 block ${theme.textMuted}`}>Topic</label><input type="text" value={newTask.topic} onChange={(e) => setNewTask({ ...newTask, topic: e.target.value })} className={`w-full rounded-lg p-2.5 text-sm outline-none border ${isLightMode ? 'bg-[#F9FAFB] border-[#E5E7EB]' : 'bg-[#18181B] border-[#27272A]'}`} required /></div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div><label className={`text-xs font-semibold mb-1.5 block ${theme.textMuted}`}>Hours</label><input type="number" step="0.5" min="0.5" value={newTask.duration} onChange={(e) => setNewTask({ ...newTask, duration: Number(e.target.value) })} className={`w-full rounded-lg p-2.5 text-sm outline-none border ${isLightMode ? 'bg-[#F9FAFB] border-[#E5E7EB]' : 'bg-[#18181B] border-[#27272A]'}`} required /></div>
                <div><label className={`text-xs font-semibold mb-1.5 block ${theme.textMuted}`}>Level</label><select value={newTask.difficulty} onChange={(e) => setNewTask({ ...newTask, difficulty: e.target.value })} className={`w-full rounded-lg p-2.5 text-sm outline-none border ${isLightMode ? 'bg-[#F9FAFB] border-[#E5E7EB]' : 'bg-[#18181B] border-[#27272A]'}`}><option>Hard</option><option>Medium</option><option>Easy</option></select></div>
                <div><label className={`text-xs font-semibold mb-1.5 block ${theme.textMuted}`}>Block</label><select value={newTask.timeOfDay} onChange={(e) => setNewTask({ ...newTask, timeOfDay: e.target.value })} className={`w-full rounded-lg p-2.5 text-sm outline-none border ${isLightMode ? 'bg-[#F9FAFB] border-[#E5E7EB]' : 'bg-[#18181B] border-[#27272A]'}`}><option>Morning</option><option>Afternoon</option><option>Night</option></select></div>
              </div>
              <div className="flex gap-3 mt-6 pt-4 border-t border-[#E5E7EB] dark:border-[#27272A]">
                <button type="button" onClick={() => setShowAddTaskModal(false)} className={`flex-1 py-2.5 rounded-lg font-semibold text-sm ${isLightMode ? 'bg-gray-100 text-gray-700' : 'bg-[#27272A] text-white'}`}>Cancel</button>
                <button type="submit" className="flex-1 py-2.5 bg-blue-600 text-white rounded-lg font-semibold text-sm hover:bg-blue-700">Save Task</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );

  const renderAnalytics = () => {
    const todayStr = new Date().toISOString().split('T')[0];
    const yesterday = new Date(); yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];
    
    const hrsToday = studyHistory[todayStr] || hoursStudiedToday || 0;
    const hrsYesterday = studyHistory[yesterdayStr] || 0;

    const last7Days = []; let weekTotal = 0;
    for (let i = 6; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i); const ds = d.toISOString().split('T')[0];
      const hrs = studyHistory[ds] || (i === 0 ? hoursStudiedToday : 0);
      weekTotal += Number(hrs); last7Days.push({ day: d.toLocaleDateString('en-US', { weekday: 'short' }), hours: Number(hrs).toFixed(1), raw: Number(hrs) });
    }
    const maxVal = Math.max(...last7Days.map(d => d.raw));
    const maxChartHrs = maxVal > 0 ? maxVal : 1; 

    return (
      <div className="space-y-8 animate-in fade-in duration-500 max-w-5xl mx-auto">
        <div><h2 className="text-2xl font-bold tracking-tight mb-1">Analytics</h2><p className={`text-sm ${theme.textMuted}`}>Deep focus insights.</p></div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className={`${theme.card} p-5 rounded-2xl`}><div className={`text-xs font-semibold mb-1 ${theme.textMuted}`}>Today</div><div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{Number(hrsToday).toFixed(1)}h</div></div>
          <div className={`${theme.card} p-5 rounded-2xl`}><div className={`text-xs font-semibold mb-1 ${theme.textMuted}`}>Yesterday</div><div className="text-2xl font-bold">{Number(hrsYesterday).toFixed(1)}h</div></div>
          <div className={`${theme.card} p-5 rounded-2xl`}><div className={`text-xs font-semibold mb-1 ${theme.textMuted}`}>Last 7 Days</div><div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{weekTotal.toFixed(1)}h</div></div>
          <div className={`${theme.card} p-5 rounded-2xl`}><div className={`text-xs font-semibold mb-1 ${theme.textMuted}`}>Daily Avg</div><div className="text-2xl font-bold">{(weekTotal / 7).toFixed(1)}h</div></div>
        </div>

        <div className={`${theme.card} rounded-2xl p-6`}>
          <h3 className="font-semibold text-sm mb-8 flex items-center gap-2"><BarChart2 size={16} className="text-blue-500"/> 7-Day Focus Trend</h3>
          <div className="flex items-end justify-between h-48 gap-3">
            {last7Days.map((data, idx) => {
              const rawPercent = (data.raw / maxChartHrs) * 100;
              const heightPercent = rawPercent > 0 ? Math.max(rawPercent, 5) : 5; // Minimum 5% visible height
              return (
                <div key={idx} className="flex flex-col items-center flex-1 group">
                  <div className={`text-xs font-semibold mb-2 opacity-0 group-hover:opacity-100 transition-opacity ${theme.textMuted}`}>{data.hours}</div>
                  <div className={`w-full max-w-[40px] rounded-t-md transition-all duration-700 ${idx === 6 ? 'bg-blue-600' : isLightMode ? 'bg-[#E5E7EB] hover:bg-[#D1D5DB]' : 'bg-[#27272A] hover:bg-[#3F3F46]'}`} style={{ height: `${heightPercent}%` }}></div>
                  <div className={`text-[10px] font-semibold mt-3 ${idx === 6 ? 'text-blue-600' : theme.textMuted}`}>{data.day}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  const renderTrophyRoom = () => {
    const checkMastery = (keywords) => Object.keys(subjectMastery).some(k => keywords.some(kw => k.includes(kw)) && subjectMastery[k] >= 5);
    const badges = [
      { id: 'first_blood', name: 'First Blood', desc: 'Log your first study hour.', icon: <TimerIcon size={24}/>, unlocked: hoursStudiedToday > 0, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-500/10' },
      { id: 'beast', name: '10-Hour Beast', desc: 'Hit a 10+ hr target for 3 days.', icon: <Flame size={24}/>, unlocked: streak >= 3 && safeTarget >= 10, color: 'text-orange-600 dark:text-orange-400', bg: 'bg-orange-50 dark:bg-orange-500/10' },
      { id: 'king', name: 'Consistency King', desc: '7-day target streak.', icon: <Trophy size={24}/>, unlocked: streak >= 7, color: 'text-yellow-600 dark:text-yellow-400', bg: 'bg-yellow-50 dark:bg-yellow-500/10' },
      { id: 'fr_pro', name: 'FR Pro', desc: 'Complete 5 FR tasks.', icon: <Target size={24}/>, unlocked: checkMastery(['FR', 'FINANCIAL REPORTING']), color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-500/10' },
      { id: 'afm_pro', name: 'AFM Pro', desc: 'Complete 5 AFM tasks.', icon: <TrendingUp size={24}/>, unlocked: checkMastery(['AFM', 'ADVANCED FINANCIAL']), color: 'text-cyan-600 dark:text-cyan-400', bg: 'bg-cyan-50 dark:bg-cyan-500/10' },
      { id: 'audit_master', name: 'Audit Master', desc: 'Complete 5 Audit tasks.', icon: <BookOpen size={24}/>, unlocked: checkMastery(['AUDIT']), color: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-50 dark:bg-purple-500/10' },
    ];

    return (
      <div className="space-y-6 animate-in fade-in duration-500 max-w-5xl mx-auto">
        <div><h2 className="text-2xl font-bold tracking-tight mb-1">Trophy Room</h2><p className={`text-sm ${theme.textMuted}`}>Unlock badges with consistency.</p></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
          {badges.map((b) => (
            <div key={b.id} className={`${theme.card} p-6 rounded-2xl flex flex-col items-start gap-4 transition-all ${!b.unlocked && 'opacity-50 grayscale'}`}>
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${b.unlocked ? b.bg : isLightMode ? 'bg-gray-100' : 'bg-[#27272A]'} ${b.color}`}>
                {b.icon}
              </div>
              <div>
                <h3 className="font-semibold text-sm">{b.name}</h3>
                <p className={`text-xs mt-1 ${theme.textMuted}`}>{b.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderMentor = () => (
    <div className={`flex flex-col h-[calc(100vh-6rem)] ${theme.card} rounded-2xl overflow-hidden animate-in fade-in max-w-4xl mx-auto`}>
      <div className={`p-4 border-b ${isLightMode ? 'border-[#E5E7EB]' : 'border-[#27272A]'} flex items-center gap-3`}>
        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white"><BrainCircuit size={16} /></div>
        <div><h3 className="font-bold text-sm">Expert CA Mentor</h3><p className={`text-[10px] ${theme.textMuted}`}>Powered by Gemini</p></div>
      </div>
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {chatHistory.map((msg, i) => (
          <div key={i} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] p-3.5 rounded-xl text-sm leading-relaxed ${msg.sender === 'user' ? 'bg-blue-600 text-white rounded-br-sm' : isLightMode ? 'bg-[#F3F4F6] text-[#111827] rounded-bl-sm' : 'bg-[#18181B] text-[#FAFAFA] border border-[#27272A] rounded-bl-sm'}`}>
              {msg.text}
            </div>
          </div>
        ))}
      </div>
      <form onSubmit={handleChatSubmit} className={`p-4 border-t ${isLightMode ? 'border-[#E5E7EB]' : 'border-[#27272A]'} flex gap-3`}>
        <input type="text" value={chatInput} onChange={(e) => setChatInput(e.target.value)} placeholder="Ask technical doubts or strategy..." className={`flex-1 ${theme.input} rounded-lg px-4 py-2.5 text-sm outline-none`} />
        <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-5 rounded-lg font-semibold transition-colors"><Send size={18} /></button>
      </form>
    </div>
  );

  // Default renders for generic tabs
  const renderGenericList = (title, items, icon) => (
    <div className="space-y-6 animate-in fade-in max-w-5xl mx-auto">
      <div><h2 className="text-2xl font-bold tracking-tight mb-1">{title}</h2><p className={`text-sm ${theme.textMuted}`}>Quick access links.</p></div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {items.map((item, i) => (
          <a key={i} href={item.link} target="_blank" rel="noreferrer" className={`${theme.card} p-5 rounded-xl flex items-center justify-between group hover:border-blue-500/50 transition-colors`}>
            <div className="flex items-center gap-3">
              <span className="text-2xl">{item.icon || icon}</span>
              <span className="font-semibold text-sm">{item.name}</span>
            </div>
            <ExternalLink size={14} className="text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity" />
          </a>
        ))}
      </div>
    </div>
  );

  return (
    <div className={`min-h-screen font-sans flex overflow-hidden transition-colors duration-300 ${theme.bg} ${theme.text}`}>
      {/* SIDEBAR */}
      <aside className={`w-64 border-r flex flex-col hidden md:flex ${theme.sidebar} z-10`}>
        <div className={`p-6 border-b ${isLightMode ? 'border-[#E5E7EB]' : 'border-[#27272A]'}`}>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-sm text-white">CA</div>
            <span className="font-bold text-lg tracking-tight">Sathi.ai</span>
          </div>
        </div>
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto scrollbar-hide">
          {[
            { id: 'dashboard', name: 'Dashboard', icon: <LayoutDashboard size={16} /> },
            { id: 'planner', name: 'Study Planner', icon: <Calendar size={16} /> },
            { id: 'timer', name: 'Focus Timer', icon: <TimerIcon size={16} /> },
            { id: 'mentor', name: 'Expert Mentor', icon: <BrainCircuit size={16} /> },
            { id: 'analytics', name: 'Analytics', icon: <BarChart2 size={16} /> },
            { id: 'trophy', name: 'Trophy Room', icon: <Trophy size={16} /> },
            { id: 'faculty_notes', name: 'Faculty Notes', icon: <FolderOpen size={16} /> },
            { id: 'past_papers', name: 'Past Papers', icon: <Library size={16} /> },
          ].map((item) => (
            <button key={item.id} onClick={() => setActiveTab(item.id)} className={`w-full flex items-center gap-3 px-3 py-2 rounded-md transition-colors text-sm ${activeTab === item.id ? theme.activeTab : theme.hoverTab}`}>
              {item.icon} <span className="font-medium">{item.name}</span>
            </button>
          ))}
        </nav>
        <div className={`p-4 border-t ${isLightMode ? 'border-[#E5E7EB]' : 'border-[#27272A]'}`}>
          <button onClick={() => setIsLightMode(!isLightMode)} className={`w-full flex items-center justify-center gap-2 py-2 rounded-md font-medium text-xs ${isLightMode ? 'bg-[#F3F4F6] text-[#4B5563]' : 'bg-[#18181B] text-[#A1A1AA] hover:text-white'}`}>
            {isLightMode ? <Moon size={14} /> : <Sun size={14} />} {isLightMode ? 'Dark Mode' : 'Light Mode'}
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 relative overflow-y-auto scrollbar-hide">
        <div className="h-full p-6 md:p-10 pb-32">
          {activeTab === 'dashboard' && renderDashboard()}
          {activeTab === 'planner' && renderPlanner()}
          {activeTab === 'timer' && renderTimer()}
          {activeTab === 'mentor' && renderMentor()}
          {activeTab === 'analytics' && renderAnalytics()}
          {activeTab === 'trophy' && renderTrophyRoom()}
          {activeTab === 'faculty_notes' && renderGenericList('Faculty Notes', [{ name: 'Financial Reporting', link: '#', icon: '📘' }, { name: 'Audit & Assurance', link: '#', icon: '📙' }, { name: 'Direct Tax', link: '#', icon: '📕' }])}
          {activeTab === 'past_papers' && renderGenericList('Past Papers', [{ name: 'FR Bank', link: '#', icon: '📊' }, { name: 'Audit Bank', link: '#', icon: '🔍' }])}
        </div>
      </main>

      {/* TOAST */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-[999] animate-in slide-in-from-bottom-2 fade-in">
          <div className={`${theme.cardSolid} rounded-xl p-4 flex items-center gap-3 shadow-2xl`}>
            <div className="text-blue-500">{toastIcon}</div>
            <p className="text-sm font-semibold">{toastMessage}</p>
          </div>
        </div>
      )}
    </div>
  );
}