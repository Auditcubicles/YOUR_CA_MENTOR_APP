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

// --- AI MENTOR BRAIN ---
const generateMentorResponse = (trigger, context = {}) => {
  const { daysLeft = 0 } = context;
  if (trigger === 'urgency') {
    if (daysLeft > 90) return "You have time. Build strong concepts. But don't waste days.";
    if (daysLeft > 30) return "Consistency matters now. No more delays. Every single day counts.";
    if (daysLeft > 10) return "Final phase. Every hour counts. Drop everything else and focus.";
    return "No excuses. Full revision mode. Do or die.";
  }
  return "Let's focus and get back to work.";
};

const motivationalQuotes = [
  "Push harder than yesterday if you want a different tomorrow.",
  "CA is not about intelligence, it's about pure stamina.",
  "Tired? Learn to rest, not to quit.",
  "Your future self is watching you right now. Make them proud.",
  "Discipline is doing what you hate, but doing it like you love it.",
  "The syllabus is huge, but your determination is bigger.",
  "One day all these late nights will pay off. Keep going.",
  "Don't stop until you see 'PASS' on your marksheet.",
  "Audit your time, before time audits your attempt.",
  "A CA student's best friend is consistency. Stay focused."
];

export default function CASathiApp() {
  // --- RESTORED PREMIUM GLOWING UI THEME ---
  const [isLightMode, setIsLightMode] = useLocalStorage('ca-theme-light', false);

  const theme = {
    bg: isLightMode ? 'bg-[#f8fafc]' : 'bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-slate-900 via-[#0a0f1c] to-black',
    text: isLightMode ? 'text-slate-800' : 'text-slate-100',
    sidebar: isLightMode ? 'bg-white/80 border-slate-200 shadow-xl backdrop-blur-3xl' : 'bg-white/[0.02] border-white/5 shadow-2xl backdrop-blur-2xl',
    card: isLightMode ? 'bg-white border border-slate-200 shadow-sm' : 'bg-white/[0.03] border border-white/10 shadow-[0_8px_30px_rgb(0,0,0,0.12)] backdrop-blur-xl hover:bg-white/[0.05] transition-colors',
    cardSolid: isLightMode ? 'bg-white border-slate-200 shadow-md' : 'bg-[#0f172a]/80 border-white/10 shadow-2xl backdrop-blur-3xl',
    input: isLightMode ? 'bg-slate-50 border-slate-200 text-slate-900 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10' : 'bg-black/40 border-white/10 text-gray-100 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20',
    textMuted: isLightMode ? 'text-slate-500' : 'text-slate-400',
    hoverTab: isLightMode ? 'hover:bg-slate-100 text-slate-600 hover:text-blue-600' : 'hover:bg-white/10 text-slate-400 hover:text-white',
    activeTab: isLightMode ? 'bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 border-l-4 border-blue-600 shadow-sm' : 'bg-gradient-to-r from-blue-600/20 to-indigo-600/10 text-blue-400 border-l-4 border-blue-500 shadow-[inset_0_0_20px_rgba(59,130,246,0.1)]'
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
    { sender: 'mentor', text: "Welcome to CA Sathi. I am your Expert Mentor. Let's plan your schedule and resolve any doubts.", time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) },
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
  const canvasRef = useRef(null); 
  const videoRef = useRef(null); 

  const [isFullScreen, setIsFullScreen] = useState(false);
  const [showAddTaskModal, setShowAddTaskModal] = React.useState(false);
  const [newTask, setNewTask] = React.useState({ subject: '', topic: '', duration: 2, difficulty: 'Medium', timeOfDay: 'Morning' });

  // --- STREAK & MIDNIGHT RESET ENGINE ---
  useEffect(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    const lastLogin = localStorage.getItem('ca-lastLogin');

    if (lastLogin !== todayStr) {
      setYesterdaysBrainDump(eodTargets);
      setEodTargets(['', '', '']);
      setHoursStudiedToday(0); 
      localStorage.setItem('ca-lastLogin', todayStr);
      
      const lastTargetHit = localStorage.getItem('ca-lastTargetHit');
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];
      
      if (lastTargetHit !== yesterdayStr && lastTargetHit !== todayStr) setStreak(0); 
    }
  }, [eodTargets, setEodTargets, setHoursStudiedToday, setYesterdaysBrainDump, setStreak]);

  // --- HOURLY QUOTES ENGINE ---
  useEffect(() => {
    const quoteInterval = setInterval(() => {
      const randomQuote = motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)];
      triggerToast(randomQuote, <Zap size={18} className="text-yellow-500" />);
    }, 3600000); 
    return () => clearInterval(quoteInterval);
  }, []);

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

  const safeExitFullscreen = () => {
    try { if (document.fullscreenElement && document.exitFullscreen) document.exitFullscreen().catch(() => {}); } 
    catch (e) { console.error(e); }
  };

  const triggerToast = (msg, icon = <Bell size={18} />) => {
    setToastMessage(msg); setToastIcon(icon);
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => setToastMessage(null), 10000); 
  };

  const toggleLofi = () => {
    if (!lofiRef.current) return;
    if (isLofiPlaying) { lofiRef.current.pause(); setIsLofiPlaying(false); } 
    else { lofiRef.current.volume = 0.4; lofiRef.current.play().then(() => setIsLofiPlaying(true)).catch(e => triggerToast("Browser blocked auto-play. Click again.", <AlertTriangle size={18}/>)); }
  };

  // --- 100% FIXED PiP ENGINE ---
  const updateCanvas = () => {
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      const width = canvasRef.current.width;
      const height = canvasRef.current.height;
      
      // Clean Deep Dark Background
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, width, height);
      
      // Accent Border
      ctx.strokeStyle = timerMode === 'pomodoro' ? '#3b82f6' : '#10b981';
      ctx.lineWidth = 16;
      ctx.strokeRect(0, 0, width, height);
      
      // Top Label
      ctx.fillStyle = timerMode === 'pomodoro' ? '#3b82f6' : '#10b981';
      ctx.font = 'bold 36px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(timerMode === 'pomodoro' ? 'CA SATHI - FOCUS' : 'BREAK TIME', width / 2, 70);
      
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
      if ((hoursStudiedToday + added) >= safeTarget && hoursStudiedToday < safeTarget) {
        setStreak(prev => prev + 1); localStorage.setItem('ca-lastTargetHit', new Date().toISOString().split('T')[0]);
        triggerToast("Target Hit! Streak Maintained 🔥", <Trophy size={18}/>);
      }
      triggerToast(`Saved ${(secondsStudied / 60).toFixed(1)} mins.`);
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
    
    if (added > 0) {
      setHoursStudiedToday(prev => prev + added); saveToHistory(added);
      if ((hoursStudiedToday + added) >= safeTarget && hoursStudiedToday < safeTarget) {
        setStreak(prev => prev + 1); localStorage.setItem('ca-lastTargetHit', new Date().toISOString().split('T')[0]);
        triggerToast("Target Hit! Streak Maintained 🔥", <Trophy size={18}/>);
      }
    }

    if (status === 'completed') {
      triggerToast("Great session logged.");
      setTimerMode('shortBreak'); setTimeLeft((Number(breakDuration) || 10) * 60); setIsActive(true);
    } else if (status === 'partial') { triggerToast('Partial session logged. Focus better.'); }
  };

  // --- FIXED AI MENTOR LOGIC ---
  const handleChatSubmit = async (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    const userText = chatInput;
    
    // Add user message locally
    setChatHistory((prev) => [...prev, { sender: 'user', text: userText, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
    setChatInput('');
    setTimeout(() => { triggerToast("Mentor is thinking...", <BrainCircuit size={18}/>); }, 500);

    const prompt = `You are 'Sathi,' an elite CA Mentor. Tone: Professional Hinglish. Be direct, helpful, and motivating.
      Context: Exam in ${daysLeft} days. Target: ${safeTarget}h. Completed: ${hoursStudiedToday}h. Streak: ${streak}.
      Student says: "${userText}"`;

    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${import.meta.env.VITE_GEMINI_API_KEY}`,
        { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }) }
      );
      const data = await response.json();
      const aiReply = data.candidates[0].content.parts[0].text;
      
      // Add mentor reply locally
      setChatHistory((prev) => [...prev, { sender: 'mentor', text: aiReply, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
      triggerToast("New message from Mentor", <MessageSquare size={18}/>);
    } catch (error) {
      setChatHistory((prev) => [...prev, { sender: 'mentor', text: "Connection error. Please try again.", time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
    }
  };

  const handleAddTask = (e) => {
    e.preventDefault();
    if (!newTask.subject || !newTask.topic) return;
    setTasks([...tasks, { ...newTask, id: Date.now(), status: 'pending' }]);
    setShowAddTaskModal(false);
    setNewTask({ subject: '', topic: '', duration: 2, difficulty: 'Medium', timeOfDay: 'Morning' });
  };

  const toggleTaskStatus = (id) => {
    setTasks(tasks.map((t) => {
      if (t.id === id) {
        const newStatus = t.status === 'pending' ? 'completed' : t.status === 'completed' ? 'partial' : 'pending';
        if (newStatus === 'completed' && t.status !== 'completed') {
          const subj = t.subject.toUpperCase();
          setSubjectMastery(prev => ({ ...prev, [subj]: (prev[subj] || 0) + 1 }));
          triggerToast(`Task completed! +1 to ${t.subject}.`, <Trophy size={18} className="text-yellow-500" />);
        }
        return { ...t, status: newStatus };
      }
      return t;
    }));
  };

  // --- RENDER COMPONENTS (PROPERLY ALIGNED PREMIUM UI) ---
  const renderDashboard = () => {
    const hasYesterdaysDump = yesterdaysBrainDump.some(t => t.trim() !== '');

    return (
      <div className="space-y-8 animate-in fade-in duration-500 max-w-6xl mx-auto">
        
        {/* BEAUTIFUL ALIGNED GRID HEADER */}
        <div className={`relative overflow-hidden rounded-[2rem] p-8 lg:p-10 ${isLightMode ? 'bg-gradient-to-br from-red-50 to-orange-50 border border-red-100 shadow-sm' : 'bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-red-950/40 via-[#0a0505] to-black border border-red-900/30 shadow-2xl'}`}>
          <div className={`absolute -top-32 -right-32 w-96 h-96 ${isLightMode ? 'bg-red-400/20' : 'bg-red-600/10'} rounded-full blur-[100px] pointer-events-none`}></div>
          
          {/* Main Grid to ensure no squishing */}
          <div className="grid grid-cols-1 xl:grid-cols-5 gap-8 relative z-10 items-center">
            
            {/* Left: Mission Statement (Takes 2 columns on XL) */}
            <div className="xl:col-span-2 flex flex-col justify-center">
              <h2 className="text-red-500 font-extrabold tracking-[0.25em] text-xs mb-3 uppercase drop-shadow-sm">Mission CA Final</h2>
              <div className="flex items-baseline gap-3 mb-3">
                <span className={`text-7xl lg:text-8xl font-black tracking-tighter leading-none ${isLightMode ? 'text-slate-900' : 'text-white'} drop-shadow-sm`}>{daysLeft}</span>
                <span className={`text-xl font-bold ${theme.textMuted}`}>Days to go</span>
              </div>
              <p className={`mt-2 ${isLightMode ? 'text-red-700' : 'text-red-200/80'} text-sm font-semibold border-l-4 border-red-500 pl-4 py-1.5 leading-relaxed italic`}>"{generateMentorResponse('urgency', { daysLeft })}"</p>
            </div>
            
            {/* Right: Controls (Takes 3 columns on XL, broken into 3 equal cards) */}
            <div className="xl:col-span-3 grid grid-cols-1 sm:grid-cols-3 gap-4 h-full">
              
              {/* Target Date Box */}
              <div className={`flex flex-col justify-center p-5 rounded-2xl border transition-all ${isLightMode ? 'bg-white/60 border-slate-200 shadow-sm' : 'bg-white/5 border-white/10 shadow-lg'} backdrop-blur-md`}>
                <div className={`text-[10px] font-bold uppercase tracking-widest ${theme.textMuted} mb-3 flex items-center gap-2`}><Calendar size={14}/> Target Date</div>
                <input type="date" value={examDate} onChange={(e) => setExamDate(e.target.value)} className={`bg-transparent text-sm font-mono font-bold focus:outline-none w-full cursor-pointer ${theme.text}`} />
              </div>
              
              {/* Daily Goal Box */}
              <div className={`flex flex-col justify-center p-5 rounded-2xl border transition-all ${isLightMode ? 'bg-white/60 border-slate-200 shadow-sm' : 'bg-white/5 border-white/10 shadow-lg'} backdrop-blur-md`}>
                <div className={`text-[10px] font-bold uppercase tracking-widest ${theme.textMuted} mb-3 flex items-center gap-2`}><Target size={14}/> Daily Goal</div>
                <input type="number" min="1" max="24" value={targetHours} onChange={(e) => setTargetHours(e.target.value)} className={`bg-transparent text-sm font-mono font-bold focus:outline-none w-full cursor-pointer ${theme.text}`} />
              </div>

              {/* End Day Ritual Box */}
              <button onClick={() => setShowEODModal(true)} className="flex flex-col items-center justify-center gap-3 bg-gradient-to-br from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white p-5 rounded-2xl shadow-lg shadow-blue-500/25 font-bold transition-all transform hover:scale-[1.02] h-full min-h-[120px]">
                <MoonStar size={28} className="mb-1" />
                <span className="text-[11px] uppercase tracking-widest text-center leading-tight">End Day<br/>& Dump</span>
              </button>

            </div>
          </div>
        </div>

        {/* EOD DUMP IMPORT */}
        {hasYesterdaysDump && (
          <div className={`${theme.cardSolid} p-8 rounded-[2rem] shadow-sm border border-emerald-500/20 bg-emerald-500/5`}>
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold flex items-center gap-3"><FileText size={22} className="text-emerald-500" /> Yesterday's Brain Dump</h3>
                <button onClick={() => setYesterdaysBrainDump(['','',''])} className="text-[10px] font-bold text-slate-400 hover:text-red-500 transition-colors uppercase tracking-widest bg-black/10 hover:bg-red-500/10 px-3 py-2 rounded-lg">Clear</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {yesterdaysBrainDump.filter(t => t.trim() !== '').map((t, idx) => (
                  <div key={idx} className={`${theme.card} rounded-2xl p-5 border border-emerald-500/20 shadow-sm`}>
                      <div className="text-[10px] font-bold uppercase tracking-widest text-emerald-500 mb-2">Target {idx+1}</div>
                      <div className={`text-sm font-semibold ${theme.text}`}>{t}</div>
                  </div>
              ))}
            </div>
          </div>
        )}

        {/* FLOATING STAT CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className={`${theme.cardSolid} p-8 rounded-[2rem] flex flex-col justify-between transition-all hover:-translate-y-1 duration-300`}>
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3.5 bg-blue-500/10 text-blue-500 rounded-xl shadow-inner"><Target size={24} /></div>
              <div className={`font-bold text-sm uppercase tracking-wider ${theme.textMuted}`}>Today's Progress</div>
            </div>
            <div>
              <div className="text-4xl font-black tracking-tight">{Number(hoursStudiedToday).toFixed(1)} <span className={`text-base font-bold ${theme.textMuted}`}>/ {safeTarget} hrs</span></div>
              <div className={`w-full ${isLightMode ? 'bg-slate-100' : 'bg-slate-800'} h-2.5 mt-5 rounded-full overflow-hidden`}>
                <div className="bg-blue-500 h-full rounded-full transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(59,130,246,0.6)]" style={{ width: `${progressPercent}%` }}></div>
              </div>
            </div>
          </div>

          <div className={`${theme.cardSolid} p-8 rounded-[2rem] flex flex-col justify-between transition-all hover:-translate-y-1 duration-300`}>
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3.5 bg-orange-500/10 text-orange-500 rounded-xl shadow-inner"><Flame size={24} /></div>
              <div className={`font-bold text-sm uppercase tracking-wider ${theme.textMuted}`}>Consistency Streak</div>
            </div>
            <div>
              <div className="text-4xl font-black tracking-tight">{streak} <span className={`text-base font-bold ${theme.textMuted}`}>Days</span></div>
              <div className="text-xs font-bold text-orange-500 mt-3 tracking-widest uppercase">Target Hit Streaks 🔥</div>
            </div>
          </div>

          <div className={`${theme.cardSolid} p-8 rounded-[2rem] flex flex-col justify-between transition-all hover:-translate-y-1 duration-300`}>
            <div className="flex items-center gap-4 mb-6">
              <div className={`p-3.5 rounded-xl shadow-inner ${hoursStudiedToday < safeTarget ? 'bg-red-500/10 text-red-500' : 'bg-emerald-500/10 text-emerald-500'}`}><TrendingUp size={24} /></div>
              <div className={`font-bold text-sm uppercase tracking-wider ${theme.textMuted}`}>Remaining Today</div>
            </div>
            <div>
              <div className="text-4xl font-black tracking-tight">{reqDailyHours} <span className={`text-base font-bold ${theme.textMuted}`}>hrs</span></div>
              <div className={`text-xs font-bold mt-3 uppercase tracking-widest ${hoursStudiedToday < safeTarget ? 'text-red-500' : 'text-emerald-500'}`}>
                {hoursStudiedToday < safeTarget ? `Pending To Hit Target` : 'Target Accomplished!'}
              </div>
            </div>
          </div>
        </div>

        {/* EOD MODAL */}
        {showEODModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xl flex items-center justify-center z-[200] p-4 animate-in fade-in">
            <div className={`${theme.cardSolid} rounded-[2rem] p-10 max-w-md w-full shadow-2xl border border-white/20`}>
              <h3 className="text-3xl font-black mb-2 flex items-center gap-3"><MoonStar size={28} className="text-blue-500" /> End Day Dump</h3>
              <p className={`text-sm font-medium mb-8 ${theme.textMuted}`}>Empty your brain. Write tomorrow's top 3 targets so you can sleep peacefully.</p>
              <div className="space-y-4 mb-8">
                {[0, 1, 2].map((i) => (
                  <input key={i} type="text" value={eodTargets[i]} onChange={(e) => { const newTargets = [...eodTargets]; newTargets[i] = e.target.value; setEodTargets(newTargets); }} placeholder={`Target ${i+1}`} className={`w-full rounded-xl p-4 text-sm font-semibold outline-none ${theme.input}`} />
                ))}
              </div>
              <div className="flex gap-4">
                <button onClick={() => setShowEODModal(false)} className={`flex-1 py-3.5 rounded-xl font-bold text-sm transition-colors ${isLightMode ? 'bg-slate-100 text-slate-700 hover:bg-slate-200' : 'bg-white/5 text-slate-300 hover:bg-white/10'}`}>Cancel</button>
                <button onClick={() => { setShowEODModal(false); triggerToast("Targets saved! Have a good sleep.", <MoonStar size={18}/>); }} className="flex-1 py-3.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-sm shadow-lg shadow-blue-500/30 transition-all">Save & Sleep</button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderPlanner = () => (
    <div className="space-y-6 relative animate-in fade-in duration-500 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-3xl font-black tracking-tight">Study Planner</h2>
          <p className={`text-sm font-medium ${theme.textMuted} mt-1`}>Organize your day. Tackle hard subjects early.</p>
        </div>
        <button onClick={() => setShowAddTaskModal(true)} className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white px-6 py-3 rounded-xl font-bold shadow-[0_0_20px_rgba(59,130,246,0.3)] transition-all transform hover:scale-105 text-sm">+ Add Target</button>
      </div>

      <div className={`${theme.cardSolid} rounded-[2rem] p-6 lg:p-10 shadow-xl`}>
        <div className="space-y-4">
          {tasks.map((task) => (
            <div key={task.id} className={`flex flex-col sm:flex-row sm:items-center justify-between p-5 ${theme.card} rounded-2xl border transition-all hover:border-blue-500/50 hover:shadow-md gap-4`}>
              <div className="flex items-center gap-5">
                <button onClick={() => toggleTaskStatus(task.id)} className="transition-transform hover:scale-110 shrink-0">
                  {task.status === 'completed' && <CheckCircle className="text-emerald-500 drop-shadow-[0_0_5px_rgba(16,185,129,0.4)]" size={28} />}
                  {task.status === 'partial' && <AlertTriangle className="text-amber-500 drop-shadow-[0_0_5px_rgba(245,158,11,0.4)]" size={28} />}
                  {task.status === 'pending' && <div className={`w-7 h-7 rounded-full border-[2px] ${isLightMode ? 'border-slate-300' : 'border-slate-600'}`}></div>}
                </button>
                <div>
                  <div className="font-bold text-lg flex items-center gap-3 flex-wrap">
                    {task.subject}: <span className="font-medium opacity-80">{task.topic}</span>
                    <span className={`text-[10px] px-3 py-1 rounded-full uppercase font-black tracking-widest ${task.difficulty === 'Hard' ? 'bg-red-500/10 text-red-500' : task.difficulty === 'Medium' ? 'bg-amber-500/10 text-amber-500' : 'bg-emerald-500/10 text-emerald-500'}`}>{task.difficulty}</span>
                  </div>
                  <div className={`text-sm font-semibold ${theme.textMuted} mt-1.5`}>{task.timeOfDay} Block • {task.duration} Hours</div>
                </div>
              </div>
              <div className="flex items-center gap-3 sm:ml-auto">
                <button onClick={() => setTasks(tasks.filter((t) => t.id !== task.id))} className={`text-red-500/80 hover:text-red-500 text-xs font-bold uppercase tracking-widest transition-colors bg-red-500/10 hover:bg-red-500/20 px-4 py-2.5 rounded-xl`}>Drop</button>
                
                {task.status === 'completed' ? (
                  <span className="text-xs font-black text-emerald-500 uppercase tracking-widest bg-emerald-500/10 px-5 py-2.5 rounded-xl text-center">Logged</span>
                ) : (
                  <button onClick={() => setActiveTab('timer')} className="text-xs bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-md shadow-blue-500/20 whitespace-nowrap">Start Session</button>
                )}
              </div>
            </div>
          ))}
          {tasks.length === 0 && (
            <div className={`text-center py-16 ${theme.textMuted}`}>
              <Target size={48} className="mx-auto mb-4 opacity-20" />
              <p className="font-bold text-lg">Your desk is clean.</p>
              <p className="text-sm mt-1">Planning is the first step to clearing CA. Add a target.</p>
            </div>
          )}
        </div>
      </div>

      {showAddTaskModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-md flex items-center justify-center z-[100] p-4 animate-in fade-in zoom-in-95 duration-300">
          <div className={`${theme.cardSolid} rounded-[2rem] p-10 max-w-lg w-full shadow-2xl border border-white/10`}>
            <h3 className="text-2xl font-black mb-6 flex items-center gap-3"><BookOpen size={24} className="text-blue-500" /> Create Target</h3>
            <form onSubmit={handleAddTask} className="space-y-5">
              <div className="grid grid-cols-2 gap-5">
                <div><label className={`text-[10px] font-bold uppercase tracking-widest mb-2 block ${theme.textMuted}`}>Subject</label><input type="text" value={newTask.subject} onChange={(e) => setNewTask({ ...newTask, subject: e.target.value })} className={`w-full rounded-xl p-3 text-sm font-semibold outline-none ${theme.input}`} required placeholder="e.g. Audit" /></div>
                <div><label className={`text-[10px] font-bold uppercase tracking-widest mb-2 block ${theme.textMuted}`}>Topic</label><input type="text" value={newTask.topic} onChange={(e) => setNewTask({ ...newTask, topic: e.target.value })} className={`w-full rounded-xl p-3 text-sm font-semibold outline-none ${theme.input}`} required placeholder="e.g. SA 500" /></div>
              </div>
              <div className="grid grid-cols-3 gap-5">
                <div><label className={`text-[10px] font-bold uppercase tracking-widest mb-2 block ${theme.textMuted}`}>Hours</label><input type="number" step="0.5" min="0.5" value={newTask.duration} onChange={(e) => setNewTask({ ...newTask, duration: Number(e.target.value) })} className={`w-full rounded-xl p-3 text-sm font-semibold outline-none ${theme.input}`} required /></div>
                <div><label className={`text-[10px] font-bold uppercase tracking-widest mb-2 block ${theme.textMuted}`}>Level</label><select value={newTask.difficulty} onChange={(e) => setNewTask({ ...newTask, difficulty: e.target.value })} className={`w-full rounded-xl p-3 text-sm font-semibold outline-none ${theme.input}`}><option>Hard</option><option>Medium</option><option>Easy</option></select></div>
                <div><label className={`text-[10px] font-bold uppercase tracking-widest mb-2 block ${theme.textMuted}`}>Block</label><select value={newTask.timeOfDay} onChange={(e) => setNewTask({ ...newTask, timeOfDay: e.target.value })} className={`w-full rounded-xl p-3 text-sm font-semibold outline-none ${theme.input}`}><option>Morning</option><option>Afternoon</option><option>Night</option></select></div>
              </div>
              <div className={`flex gap-4 mt-8 pt-6 border-t ${isLightMode ? 'border-slate-200' : 'border-white/5'}`}>
                <button type="button" onClick={() => setShowAddTaskModal(false)} className={`flex-1 py-3 rounded-xl font-bold text-sm transition-colors ${isLightMode ? 'bg-slate-100 hover:bg-slate-200 text-slate-700' : 'bg-white/5 hover:bg-white/10 text-slate-300'}`}>Cancel</button>
                <button type="submit" className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl font-bold text-sm shadow-lg shadow-blue-500/20">Save Target</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );

  const renderTimer = () => {
    if (isZenMode) {
      return (
        <div className="fixed inset-0 z-[200] bg-black text-white flex flex-col items-center justify-center p-8 animate-in fade-in duration-700">
          <audio ref={lofiRef} src="https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3" loop />
          
          <button onClick={() => setIsZenMode(false)} className="absolute top-8 right-8 flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl font-bold uppercase tracking-widest text-xs transition-colors backdrop-blur-md">
            <EyeOff size={16} /> Exit Zen
          </button>

          <div className="absolute top-8 left-8">
            <button onClick={toggleLofi} className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${isLofiPlaying ? 'text-indigo-400 bg-indigo-500/10 border border-indigo-500/30' : 'text-white/50 border border-white/10'}`}>
              <Headphones size={16} /> {isLofiPlaying ? 'Lo-Fi On' : 'Lo-Fi Off'}
            </button>
          </div>

          <h2 className="text-xs font-black mb-12 uppercase tracking-[0.5em] text-white/50">
            {timerMode === 'pomodoro' ? 'Deep Focus' : 'Break'}
          </h2>

          <div className="text-[10rem] md:text-[18rem] font-black font-mono tracking-tighter leading-none mb-20 drop-shadow-[0_0_80px_rgba(255,255,255,0.15)] text-white">
            {formatTime(timeLeft)}
          </div>

          <div className="flex justify-center items-center gap-8 mb-20">
            <button onClick={() => setIsActive(!isActive)} className={`w-32 h-32 rounded-full flex items-center justify-center transition-all duration-500 ${isActive ? 'bg-white/10 border border-white/20 text-white' : 'bg-white text-black shadow-[0_0_50px_rgba(255,255,255,0.4)] hover:scale-105'}`}>
              {isActive ? <Pause size={48} /> : <Play size={48} className="ml-2" />}
            </button>
            <button onClick={handleStopSession} className="w-20 h-20 rounded-full flex items-center justify-center bg-red-500/20 text-red-500 border border-red-500/30 hover:bg-red-500/40 transition-all">
              <StopCircle size={32} />
            </button>
          </div>

          <p className="absolute bottom-12 text-white/40 font-bold uppercase tracking-widest text-sm max-w-2xl text-center leading-relaxed">
            "{motivationalQuotes[0]}"
          </p>
        </div>
      );
    }

    return (
      <div ref={timerRef} className={`h-full flex flex-col items-center justify-center relative transition-all duration-300 animate-in fade-in max-w-6xl mx-auto ${isFullScreen ? (isLightMode ? 'bg-[#FAFAFA]' : 'bg-[#09090B]') : ''}`}>
        
        {/* --- FIXED: PiP ELEMENTS (Must remain in DOM) --- */}
        <canvas ref={canvasRef} width="800" height="400" className="fixed top-[-9999px] left-[-9999px] opacity-0 pointer-events-none" />
        <video ref={videoRef} autoPlay muted playsInline className="fixed top-[-9999px] left-[-9999px] opacity-0 pointer-events-none" />
        
        <audio ref={lofiRef} src="https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3" loop /> 
        
        <div className="absolute top-0 w-full p-6 flex flex-col sm:flex-row justify-between items-center gap-4 z-10">
          <button onClick={toggleLofi} className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all shadow-sm border ${isLofiPlaying ? 'bg-indigo-500/10 text-indigo-500 border-indigo-500/50' : isLightMode ? 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50' : 'bg-white/5 border-white/5 text-zinc-400 hover:bg-white/10'}`}>
            <Headphones size={18} /> {isLofiPlaying ? 'Pause Lo-Fi' : 'Play Focus Lo-Fi'}
          </button>
          
          <div className="flex flex-wrap justify-center items-center gap-3">
            <button onClick={togglePip} className={`px-5 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest transition-all shadow-sm flex items-center gap-2 border ${isPipActive ? 'bg-blue-600 text-white border-blue-600' : isLightMode ? 'bg-white text-slate-700 hover:bg-slate-100 border-slate-200' : 'bg-white/5 border-white/5 text-zinc-300 hover:bg-white/10'}`} title="Picture in Picture">
              <PictureInPicture size={16} /> PiP Mode
            </button>
            <button onClick={() => setIsZenMode(true)} className={`px-5 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest transition-all shadow-sm flex items-center gap-2 border ${isLightMode ? 'bg-slate-800 text-white hover:bg-black border-transparent' : 'bg-white text-black hover:bg-slate-200 shadow-[0_0_20px_rgba(255,255,255,0.2)] border-transparent'}`}>
              <EyeOff size={16} /> Ultra Zen
            </button>
            <button onClick={toggleFullScreen} className={`p-2.5 rounded-xl transition-all shadow-sm border ${isLightMode ? 'bg-white text-slate-500 hover:bg-slate-50 border-slate-200' : 'bg-white/5 text-zinc-400 hover:bg-white/10 border-white/5'}`} title="Fullscreen">
              {isFullScreen ? <Minimize size={20} /> : <Maximize size={20} />}
            </button>
          </div>
        </div>

        <div className="text-center w-full max-w-xl px-4 mt-24 sm:mt-12">
          <h2 className={`text-xs font-bold mb-6 uppercase tracking-[0.3em] ${theme.textMuted}`}>
            {timerMode === 'pomodoro' ? 'Deep Focus Session' : 'Strict Break'}
          </h2>
          
          <div className={`flex justify-center items-center gap-1.5 mb-8 p-1.5 rounded-xl border w-fit mx-auto backdrop-blur-md ${isLightMode ? 'bg-slate-100 border-slate-200' : 'bg-black/20 border-white/5'}`}>
            <button onClick={() => setTimerDisplayType('digital')} className={`flex items-center gap-2 px-5 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${timerDisplayType === 'digital' ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-800 dark:text-white' : theme.textMuted}`}><TimerIcon size={16} /> Digital</button>
            <button onClick={() => setTimerDisplayType('analog')} className={`flex items-center gap-2 px-5 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${timerDisplayType === 'analog' ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-800 dark:text-white' : theme.textMuted}`}><Clock size={16} /> Analog</button>
          </div>

          {!isActive && !isFullScreen && (
            <div className="flex justify-center gap-8 mb-8">
              <div className="flex flex-col items-center">
                <label className={`text-[10px] font-bold uppercase tracking-widest ${theme.textMuted} mb-2`}>Work (Min)</label>
                <input type="number" value={workDuration} onChange={(e) => { const v = e.target.value; setWorkDuration(v); if(timerMode==='pomodoro') setTimeLeft((Number(v)||0)*60);}} className={`w-20 text-center rounded-xl p-2.5 font-mono text-lg font-bold shadow-inner ${theme.input}`} />
              </div>
              <div className="flex flex-col items-center">
                <label className={`text-[10px] font-bold uppercase tracking-widest ${theme.textMuted} mb-2`}>Break (Min)</label>
                <input type="number" value={breakDuration} onChange={(e) => { const v = e.target.value; setBreakDuration(v); if(timerMode==='shortBreak') setTimeLeft((Number(v)||0)*60);}} className={`w-20 text-center rounded-xl p-2.5 font-mono text-lg font-bold shadow-inner ${theme.input}`} />
              </div>
            </div>
          )}

          {timerDisplayType === 'digital' ? (
            <div className={`text-[7rem] md:text-[10rem] font-black font-mono tracking-tighter leading-none mb-12 drop-shadow-xl transition-colors duration-500 ${timerMode === 'shortBreak' ? 'text-emerald-500 drop-shadow-[0_0_30px_rgba(16,185,129,0.3)]' : isActive ? (isLightMode ? 'text-slate-900' : 'text-white drop-shadow-[0_0_40px_rgba(255,255,255,0.15)]') : theme.textMuted}`}>
              {formatTime(timeLeft)}
            </div>
          ) : (
            <div className="relative flex flex-col items-center justify-center mb-10 w-full">
              <svg width="240" height="240" viewBox="0 0 100 100" className="drop-shadow-2xl mx-auto">
                <circle cx="50" cy="50" r="48" fill={isLightMode ? '#ffffff' : '#0f172a'} stroke={isLightMode ? '#e2e8f0' : '#1e293b'} strokeWidth="1.5" />
                {[...Array(12)].map((_, i) => (<line key={i} x1="50" y1="6" x2="50" y2={i % 3 === 0 ? "12" : "9"} stroke={isLightMode ? '#cbd5e1' : '#475569'} strokeWidth={i % 3 === 0 ? "2" : "1"} transform={`rotate(${i * 30} 50 50)`} />))}
                <line x1="50" y1="50" x2="50" y2="20" stroke={isLightMode ? '#334155' : '#e2e8f0'} strokeWidth="2.5" strokeLinecap="round" transform={`rotate(${(Math.floor((Number(timeLeft)||0)/60)*6)+(((Number(timeLeft)||0)%60)*0.1)} 50 50)`} />
                <line x1="50" y1="50" x2="50" y2="15" stroke="#ef4444" strokeWidth="1" strokeLinecap="round" transform={`rotate(${((Number(timeLeft)||0)%60)*6} 50 50)`} />
                <circle cx="50" cy="50" r="3.5" fill="#3b82f6" />
              </svg>
              <div className={`absolute bottom-[-10px] px-3 py-1 rounded-lg border backdrop-blur-md text-sm font-mono font-bold tracking-widest shadow-lg ${isLightMode ? 'bg-white/80 border-slate-200 text-slate-800' : 'bg-black/40 border-white/10 text-white'}`}>{formatTime(timeLeft)}</div>
            </div>
          )}
          
          <div className="flex justify-center items-center gap-6 mb-10">
            <button onClick={() => { setIsActive(false); setTimeLeft(timerMode === 'pomodoro' ? (Number(workDuration)||50) * 60 : (Number(breakDuration)||10) * 60); }} className={`w-14 h-14 rounded-full flex items-center justify-center transition-all border ${isLightMode ? 'bg-white border-slate-200 hover:bg-slate-50 text-slate-600' : 'bg-white/5 border-white/10 hover:bg-white/10 text-white'}`} title="Reset Timer"><RotateCcw size={20} /></button>
            <button onClick={() => setIsActive(!isActive)} className={`w-24 h-24 rounded-full flex items-center justify-center transition-all duration-300 shadow-xl ${isActive ? 'bg-amber-500/10 text-amber-500 border-2 border-amber-500/50 hover:bg-amber-500/20' : 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white hover:scale-105 shadow-[0_0_30px_rgba(59,130,246,0.4)]'}`}>{isActive ? <Pause size={32} /> : <Play size={32} className="ml-2" />}</button>
            <button onClick={handleStopSession} className={`w-14 h-14 rounded-full flex items-center justify-center transition-all border ${isLightMode ? 'bg-red-50 border-red-200 hover:bg-red-50' : 'bg-red-500/10 border-red-500/30 hover:bg-red-500/20 text-red-500'}`} title="Stop & Log Time"><StopCircle size={24} /></button>
          </div>

          {!isFullScreen && (
            <div className={`${theme.cardSolid} rounded-2xl p-5 text-left shadow-lg max-w-lg mx-auto`}>
              <div className={`text-[10px] font-bold uppercase tracking-widest mb-3 ${theme.textMuted}`}>Currently Executing:</div>
              <select className={`w-full rounded-xl p-3 text-sm font-semibold outline-none cursor-pointer ${theme.input}`}>
                {tasks.filter((t) => t.status !== 'completed').map((t) => <option key={t.id}>{t.subject} - {t.topic}</option>)}
                {tasks.filter((t) => t.status !== 'completed').length === 0 && <option>No active tasks assigned</option>}
              </select>
            </div>
          )}
        </div>

        {showSessionLog && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xl flex items-center justify-center z-[400] p-4 animate-in fade-in duration-300">
            <div className={`${theme.cardSolid} rounded-[2rem] p-10 max-w-sm w-full text-center shadow-2xl border border-white/10`}>
              <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-6 text-blue-500"><TimerIcon size={32} /></div>
              <h3 className="text-3xl font-black mb-3">Session Complete</h3>
              <p className={`text-xs font-medium mb-8 ${theme.textMuted}`}>Be honest with yourself. How was your focus?</p>
              <div className="space-y-4">
                <button onClick={() => logSessionResult('completed')} className="w-full py-4 bg-emerald-500/10 text-emerald-500 border border-emerald-500/30 hover:bg-emerald-500/20 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all"><CheckCircle size={18} /> 100% Focused</button>
                <button onClick={() => logSessionResult('partial')} className="w-full py-4 bg-amber-500/10 text-amber-500 border border-amber-500/30 hover:bg-amber-500/20 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all"><AlertTriangle size={18} /> Partially Distracted</button>
                <button onClick={() => logSessionResult('failed')} className="w-full py-4 bg-red-500/10 text-red-500 border border-red-500/30 hover:bg-red-500/20 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all"><XCircle size={18} /> Wasted (0 Output)</button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

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
    
    // FIXED CHART SCALING & VISIBILITY
    const maxVal = Math.max(...last7Days.map(d => d.raw));
    const maxChartHrs = maxVal > 0 ? maxVal : 1; 

    return (
      <div className="space-y-6 animate-in fade-in duration-500 max-w-6xl mx-auto">
        <div><h2 className="text-3xl font-black tracking-tight mb-2">Performance Analytics</h2><p className={`text-sm font-medium ${theme.textMuted}`}>Track your deep focus hours and consistency.</p></div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-6">
          <div className={`${theme.cardSolid} p-6 rounded-[2rem]`}><div className={`text-[10px] font-bold uppercase tracking-widest mb-3 ${theme.textMuted}`}>Today</div><div className="text-4xl font-black text-blue-500 drop-shadow-sm">{Number(hrsToday).toFixed(1)}h</div></div>
          <div className={`${theme.cardSolid} p-6 rounded-[2rem]`}><div className={`text-[10px] font-bold uppercase tracking-widest mb-3 ${theme.textMuted}`}>Yesterday</div><div className="text-4xl font-black">{Number(hrsYesterday).toFixed(1)}h</div></div>
          <div className={`${theme.cardSolid} p-6 rounded-[2rem]`}><div className={`text-[10px] font-bold uppercase tracking-widest mb-3 ${theme.textMuted}`}>Last 7 Days</div><div className="text-4xl font-black text-emerald-500 drop-shadow-sm">{weekTotal.toFixed(1)}h</div></div>
          <div className={`${theme.cardSolid} p-6 rounded-[2rem]`}><div className={`text-[10px] font-bold uppercase tracking-widest mb-3 ${theme.textMuted}`}>Daily Avg</div><div className="text-4xl font-black">{(weekTotal / 7).toFixed(1)}h</div></div>
        </div>

        <div className={`${theme.cardSolid} rounded-[2rem] p-10 mt-8 shadow-xl`}>
          <h3 className="font-bold text-sm mb-10 flex items-center gap-2 uppercase tracking-widest"><BarChart2 size={20} className="text-blue-500"/> 7-Day Focus Trend</h3>
          <div className="flex items-end justify-between h-64 gap-4 pt-4">
            {last7Days.map((data, idx) => {
              const rawPercent = (data.raw / maxChartHrs) * 100;
              // Ensure bar is ALWAYS visible (minimum 4% height) even if 0 hours
              const heightPercent = rawPercent > 0 ? Math.max(rawPercent, 4) : 4; 

              return (
                <div key={idx} className="flex flex-col items-center flex-1 group">
                  <div className={`text-xs font-mono font-bold mb-3 opacity-0 group-hover:opacity-100 transition-opacity ${theme.textMuted}`}>{data.hours}</div>
                  <div className={`w-full max-w-[50px] rounded-t-xl transition-all duration-700 ${idx === 6 ? 'bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.5)]' : isLightMode ? 'bg-blue-200 hover:bg-blue-300' : 'bg-blue-500/30 hover:bg-blue-500/50'}`} style={{ height: `${heightPercent}%` }}></div>
                  <div className={`text-[10px] font-bold uppercase tracking-wider mt-5 ${idx === 6 ? 'text-blue-500' : theme.textMuted}`}>{data.day}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  const renderMentor = () => (
    <div className={`flex flex-col h-[calc(100vh-6rem)] ${theme.cardSolid} rounded-[2rem] overflow-hidden animate-in fade-in max-w-6xl mx-auto shadow-xl`}>
      <div className={`p-6 ${isLightMode ? 'bg-slate-50/80 border-b border-slate-200' : 'bg-black/20 border-b border-white/5'} flex items-center justify-between backdrop-blur-xl`}>
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-white shadow-[0_0_15px_rgba(59,130,246,0.3)]"><BrainCircuit size={24} /></div>
          <div><h3 className="font-black text-xl">Expert CA Mentor</h3><p className={`text-[10px] font-bold uppercase tracking-widest mt-0.5 ${theme.textMuted}`}>Powered by Audit Cubicles</p></div>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {chatHistory.map((msg, i) => (
          <div key={i} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] p-5 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap font-medium shadow-sm ${msg.sender === 'user' ? 'bg-gradient-to-br from-blue-600 to-indigo-600 text-white rounded-br-sm' : (isLightMode ? 'bg-white border border-slate-200 rounded-bl-sm text-slate-800' : 'bg-white/5 border border-white/10 text-slate-200 rounded-bl-sm backdrop-blur-xl')}`}>
              {msg.text}
              <div className={`text-[9px] text-right mt-3 font-bold uppercase tracking-widest ${msg.sender === 'user' ? 'text-blue-200' : theme.textMuted}`}>{msg.time}</div>
            </div>
          </div>
        ))}
      </div>
      <form onSubmit={handleChatSubmit} className={`p-6 ${isLightMode ? 'bg-slate-50/80 border-t border-slate-200' : 'bg-black/40 border-t border-white/5'} flex gap-3 backdrop-blur-2xl`}>
        <input type="text" value={chatInput} onChange={(e) => setChatInput(e.target.value)} placeholder="Ask technical doubts, request strategies, or get motivation..." className={`flex-1 ${theme.input} rounded-xl px-5 py-4 text-sm font-semibold outline-none shadow-inner`} />
        <button type="submit" className="bg-gradient-to-br from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white px-8 rounded-xl transition-all shadow-[0_0_15px_rgba(59,130,246,0.3)] font-bold"><Send size={24} /></button>
      </form>
    </div>
  );

  const renderTrophyRoom = () => {
    const checkMastery = (keywords) => Object.keys(subjectMastery).some(k => keywords.some(kw => k.includes(kw)) && subjectMastery[k] >= 5);
    
    // FULL RESTORE OF ALL 9 BADGES
    const badges = [
      { id: 'first_blood', name: 'First Blood', desc: 'Log your first study hour.', icon: <TimerIcon size={32}/>, unlocked: hoursStudiedToday > 0, color: 'text-blue-500', glow: 'shadow-blue-500/40' },
      { id: 'beast', name: '10-Hour Beast', desc: 'Hit a 10+ hour target for 3 days in a row.', icon: <Flame size={32}/>, unlocked: streak >= 3 && safeTarget >= 10, color: 'text-orange-500', glow: 'shadow-orange-500/40' },
      { id: 'king', name: 'Consistency King', desc: 'Maintain a 7-day target hit streak.', icon: <Trophy size={32}/>, unlocked: streak >= 7, color: 'text-yellow-500', glow: 'shadow-yellow-500/40' },
      { id: 'fr_pro', name: 'FR Pro', desc: 'Complete 5 Financial Reporting tasks.', icon: <Target size={32}/>, unlocked: checkMastery(['FR', 'FINANCIAL REPORTING']), color: 'text-emerald-500', glow: 'shadow-emerald-500/40' },
      { id: 'afm_pro', name: 'AFM Pro', desc: 'Complete 5 AFM tasks.', icon: <TrendingUp size={32}/>, unlocked: checkMastery(['AFM', 'ADVANCED FINANCIAL']), color: 'text-cyan-500', glow: 'shadow-cyan-500/40' },
      { id: 'audit_master', name: 'Audit Master', desc: 'Complete 5 Audit tasks.', icon: <BookOpen size={32}/>, unlocked: checkMastery(['AUDIT']), color: 'text-purple-500', glow: 'shadow-purple-500/40' },
      { id: 'dt_expert', name: 'DT Expert', desc: 'Complete 5 Direct Tax tasks.', icon: <FileText size={32}/>, unlocked: checkMastery(['DT', 'DIRECT TAX']), color: 'text-rose-500', glow: 'shadow-rose-500/40' },
      { id: 'idt_expert', name: 'IDT Expert', desc: 'Complete 5 Indirect Tax tasks.', icon: <Library size={32}/>, unlocked: checkMastery(['IDT', 'INDIRECT TAX']), color: 'text-indigo-500', glow: 'shadow-indigo-500/40' },
      { id: 'ibs_master', name: 'IBS Master', desc: 'Complete 5 IBS tasks.', icon: <LayoutDashboard size={32}/>, unlocked: checkMastery(['IBS', 'INTEGRATED']), color: 'text-teal-500', glow: 'shadow-teal-500/40' },
    ];

    return (
      <div className="space-y-6 animate-in fade-in duration-500 max-w-6xl mx-auto">
        <div><h2 className="text-3xl font-black tracking-tight mb-2">Trophy Room</h2><p className={`text-sm font-medium ${theme.textMuted}`}>Unlock badges by maintaining discipline and completing tasks.</p></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mt-6">
          {badges.map((b) => (
            <div key={b.id} className={`${theme.cardSolid} p-8 rounded-[2rem] flex flex-col items-center text-center gap-4 transition-all ${b.unlocked ? 'border border-white/20 hover:-translate-y-1 shadow-lg' : 'opacity-50 grayscale'}`}>
              <div className={`w-20 h-20 rounded-2xl flex items-center justify-center shadow-2xl ${b.unlocked ? `bg-black/20 ${b.color} ${b.glow}` : 'bg-slate-200 dark:bg-zinc-800'}`}>
                {b.icon}
              </div>
              <div><h3 className="font-bold text-lg">{b.name}</h3><p className={`text-xs font-medium mt-2 max-w-[200px] ${theme.textMuted}`}>{b.desc}</p></div>
              <div className={`mt-2 px-4 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest ${b.unlocked ? 'bg-emerald-500/10 text-emerald-500' : 'bg-slate-200 dark:bg-zinc-800 text-slate-500'}`}>
                {b.unlocked ? 'UNLOCKED' : 'LOCKED'}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderICAIUpdates = () => {
    const icaiAnnouncements = [
      { id: 1, date: "22 Mar 2026", badge: "EXAM", title: "Hosting of Mock Test Papers Series - II for May 2026 CA Examinations", link: "https://www.icai.org" },
      { id: 2, date: "15 Mar 2026", badge: "IMPORTANT", title: "Extension of time for filling exam forms for May 2026 Final & Inter", link: "https://www.icai.org" },
      { id: 3, date: "05 Mar 2026", badge: "STUDY MAT", title: "Statutory Update for Paper 4: Corporate and Economic Laws", link: "https://www.icai.org" },
      { id: 4, date: "28 Feb 2026", badge: "GENERAL", title: "Advanced ITT and MCQS updates for May 2026 attempt", link: "https://www.icai.org" },
      { id: 5, date: "10 Feb 2026", badge: "RESULT", title: "Result of Chartered Accountants Final & Intermediate Examination held in Nov 2025", link: "https://icai.nic.in" },
    ];

    return (
      <div className="space-y-6 animate-in fade-in duration-500 max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-3xl font-black tracking-tight flex items-center gap-3"><Megaphone className="text-red-500" /> ICAI Notification Hub</h2>
            <p className={`text-sm font-medium ${theme.textMuted} mt-2`}>Real-time updates directly from the institute. No need to get distracted elsewhere.</p>
          </div>
        </div>
        <div className="space-y-4">
          {icaiAnnouncements.map((item) => (
            <div key={item.id} className={`${theme.cardSolid} p-6 rounded-[2rem] flex flex-col md:flex-row md:items-center justify-between gap-4 border-l-4 border-l-red-500 transition-all hover:-translate-y-1 hover:shadow-lg`}>
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-3">
                  <span className={`text-xs font-bold px-3 py-1 rounded bg-black/10 dark:bg-white/10 ${theme.textMuted}`}>{item.date}</span>
                  <span className={`text-[10px] font-black uppercase tracking-widest ${item.badge === 'IMPORTANT' ? 'text-red-500' : item.badge === 'EXAM' ? 'text-blue-500' : 'text-emerald-500'}`}>{item.badge}</span>
                </div>
                <h3 className="text-lg font-semibold leading-snug">{item.title}</h3>
              </div>
              <a href={item.link} target="_blank" rel="noreferrer" className="shrink-0">
                <button className="w-full md:w-auto px-6 py-3 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-xl text-xs font-bold uppercase tracking-widest transition-colors flex items-center justify-center gap-2">
                  View PDF <ExternalLink size={14} />
                </button>
              </a>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderFacultyNotes = () => {
    // ALL 7 SUBJECTS RESTORED
    const notes = [
      { name: 'Financial Reporting', link: 'https://drive.google.com/drive/folders/16gN9MHrV7l9VHFFOaIrTz0IC7dl4GHIx', icon: '📘', glow: 'hover:shadow-blue-500/20' },
      { name: 'Advanced Fin. Mgmt', link: 'https://drive.google.com/drive/folders/1xIYTwL3RLmC7ELMrZKky_Q1kdico9VqD', icon: '📗', glow: 'hover:shadow-green-500/20' },
      { name: 'Audit & Assurance', link: 'https://drive.google.com/drive/folders/1VTFcIFznC7zpWVAWlDgY9x9NtEheBzlI', icon: '📙', glow: 'hover:shadow-purple-500/20' },
      { name: 'Direct Taxes (DT)', link: 'https://drive.google.com/drive/folders/1j5o0WKVNtD7CxMNIrgznjfQnI4CYdheu', icon: '📕', glow: 'hover:shadow-orange-500/20' },
      { name: 'Indirect Taxes (IDT)', link: 'https://drive.google.com/drive/folders/1Z3JYyTSpRf04QhE26sdnzkxa7qEizfDT', icon: '📓', glow: 'hover:shadow-red-500/20' },
      { name: 'Integrated Bus. Sol.', link: 'https://drive.google.com/drive/folders/1KXTo6pobu7QKhC0TP7--g98quUFJn4rZ', icon: '📒', glow: 'hover:shadow-indigo-500/20' },
      { name: 'SPOM Modules', link: 'https://drive.google.com/drive/folders/1bzhLGBWUn2i_A6BoprToW-S8Majk29BV', icon: '💻', glow: 'hover:shadow-cyan-500/20' },
    ];
    return (
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 max-w-6xl mx-auto">
        <div><h2 className="text-3xl font-black mb-2">Faculty Notes Vault</h2><p className={`font-medium text-sm ${theme.textMuted}`}>Top CA faculty materials & summaries in one place.</p></div>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-6">
          {notes.map((n, i) => (
            <a key={i} href={n.link} target="_blank" rel="noreferrer" className={`${theme.cardSolid} p-8 rounded-[2rem] transition-all transform hover:-translate-y-1 hover:shadow-xl ${n.glow} flex flex-col items-center text-center gap-4 group border border-white/5`}>
              <div className="text-6xl mb-2 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3 drop-shadow-md">{n.icon}</div>
              <h3 className="font-bold text-base leading-tight">{n.name}</h3>
              <div className={`mt-2 px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest flex items-center gap-2 ${isLightMode ? 'bg-blue-50 text-blue-600' : 'bg-blue-500/10 text-blue-400'} group-hover:bg-blue-500 group-hover:text-white transition-all`}>Open Drive <FolderOpen size={14} /></div>
            </a>
          ))}
        </div>
      </div>
    );
  };

  const renderPastPapers = () => {
    // ALL 6 SUBJECTS RESTORED
    const papers = [
      { name: 'Financial Reporting', icon: '📊', link: 'https://www.castudypartner.com/view/all_questions/id=ZhMn2SLrHqCWa7izgCHWVXoqv9o31c3zCd7a6BZBdRQ=/type=aBiUXQHw15Q33rsRD5ideZvMa3Oq-gDQc-p_p8a0vBU=/subject=UeoGTdCOXR9vcXrH2Ixm0zA-5qpL43ovTx6iamI8bPw=/index=HjR8OI_C92vfg2wkAKIEVBKwp0dEP3hrT8uAcW2pUOY=' },
      { name: 'Advanced Fin. Mgmt', icon: '📈', link: 'https://www.castudypartner.com/view/all_questions/id=ZhMn2SLrHqCWa7izgCHWVXoqv9o31c3zCd7a6BZBdRQ=/type=aBiUXQHw15Q33rsRD5ideZvMa3Oq-gDQc-p_p8a0vBU=/subject=nzKn-ijbXOsXihFYuZuZ6-yR3O7rz5s5pFDwc0kFWXg=/index=rAymKoVQaLKzGCWL_i2PP4gzLRaKgE_1Nu8iB3d8HXo=' },
      { name: 'Audit & Assurance', icon: '🔍', link: 'https://www.castudypartner.com/view/all_questions/id=ZhMn2SLrHqCWa7izgCHWVXoqv9o31c3zCd7a6BZBdRQ=/type=aBiUXQHw15Q33rsRD5ideZvMa3Oq-gDQc-p_p8a0vBU=/subject=N8Irnu1rh71zD1hw5b1Iho579hPZG2TfcYxL3kAtmow=/index=LYlBZAJ5rzMMo-bLpeEC1z1Vu6hvFQgciswiJZR5N0I=' },
      { name: 'Direct Taxes (DT)', icon: '💰', link: 'https://www.castudypartner.com/view/all_questions/id=ZhMn2SLrHqCWa7izgCHWVXoqv9o31c3zCd7a6BZBdRQ=/type=aBiUXQHw15Q33rsRD5ideZvMa3Oq-gDQc-p_p8a0vBU=/subject=8y5m11WZYYQ61D94xGPF2eEcUme4g3cQivnx_Ia1v6Q=/index=diFiR7ZcZzLCkOruyZs6TF7eiQTTgt4-ZY8KPrGPalg=' },
      { name: 'Indirect Taxes (IDT)', icon: '🏛️', link: 'https://www.castudypartner.com/view/all_questions/id=ZhMn2SLrHqCWa7izgCHWVXoqv9o31c3zCd7a6BZBdRQ=/type=aBiUXQHw15Q33rsRD5ideZvMa3Oq-gDQc-p_p8a0vBU=/subject=yiC0c50Q_LZATuRNxhKGY-vVnCmb35XHX1qJLUCg6rg=/index=V6rijQR0M1NyCnUmIud0qmSbfUsoWPbhBF1vaGYvLZo=' },
      { name: 'Integrated Bus. Sol.', icon: '💼', link: 'https://www.castudypartner.com/view/all_questions/id=ZhMn2SLrHqCWa7izgCHWVXoqv9o31c3zCd7a6BZBdRQ=/type=aBiUXQHw15Q33rsRD5ideZvMa3Oq-gDQc-p_p8a0vBU=/subject=Wk2SeRfZ_3nIE7JER5YukXWCQAyOPdluvJ-t2L8hLSg=/index=NE6rAQ9isAAETZPXslGFhxfzuWG3zDWGYzylSlJwxNI=' },
    ];
    return (
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 max-w-6xl mx-auto">
        <div><h2 className="text-3xl font-black mb-2">Past Papers & MTPs</h2><p className={`font-medium text-sm ${theme.textMuted}`}>Direct access to subject-wise question banks.</p></div>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-6">
          {papers.map((p, i) => (
            <a key={i} href={p.link} target="_blank" rel="noreferrer" className={`${theme.cardSolid} p-8 rounded-[2rem] transition-all transform hover:-translate-y-1 hover:shadow-xl flex flex-col items-center text-center gap-4 group border border-white/5`}>
              <div className="text-6xl mb-2 transition-transform duration-500 group-hover:scale-110 drop-shadow-md">{p.icon}</div>
              <h3 className="font-bold text-base leading-tight">{p.name}</h3>
              <div className={`mt-2 px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest flex items-center gap-2 ${isLightMode ? 'bg-indigo-50 text-indigo-600' : 'bg-indigo-500/10 text-indigo-400'} group-hover:bg-indigo-500 group-hover:text-white transition-colors`}>Open Bank <ExternalLink size={14} /></div>
            </a>
          ))}
        </div>
      </div>
    );
  };

  const renderQuickNotes = () => (
    <div className="space-y-6 overflow-y-auto max-h-[75vh] p-2 text-left animate-in fade-in slide-in-from-bottom-4 max-w-6xl mx-auto">
      <div className={`p-10 ${theme.cardSolid} rounded-[2rem] shadow-xl border border-white/10`}>
        <div className="flex items-center gap-5 mb-8">
          <div className="p-4 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl shadow-[0_0_20px_rgba(245,158,11,0.4)] text-white"><FileText size={28} /></div>
          <div>
            <h3 className="font-black text-2xl uppercase tracking-widest">Quick Study Notes</h3>
            <p className={`text-sm font-medium mt-1 ${theme.textMuted}`}>Draft temporary notes, auto-saved in browser.</p>
          </div>
        </div>
        <textarea
          className={`w-full h-[50vh] p-6 rounded-2xl outline-none resize-none text-base font-medium leading-relaxed ${theme.input} shadow-inner`}
          placeholder="Start typing your rough concepts, SA summaries, or section numbers here..."
          onChange={(e) => localStorage.setItem('ca_sathi_notes', e.target.value)}
          defaultValue={localStorage.getItem('ca_sathi_notes') || ""}
        />
      </div>
    </div>
  );

  // --- MAIN UI RENDER ---
  return (
    <div className={`min-h-screen font-sans flex overflow-hidden transition-colors duration-300 ${theme.bg} ${theme.text}`}>
      
      <aside className={`w-72 border-r flex flex-col hidden md:flex transition-all duration-500 ${theme.sidebar} z-10`}>
        <div className={`p-8 border-b flex flex-col items-start ${isLightMode ? 'border-slate-200' : 'border-white/5'}`}>
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center font-black text-xl text-white shadow-[0_0_20px_rgba(59,130,246,0.5)]">CA</div>
            <span className="font-black text-2xl tracking-wide">Sathi.ai</span>
          </div>
          <div className="w-full text-left pl-3 border-l-4 border-blue-500 rounded-sm">
            <p className={`text-[10px] uppercase tracking-[0.3em] font-black leading-none mb-1.5 ${theme.textMuted}`}>Architected By</p>
            <p className="text-sm font-black text-blue-500 tracking-wide">Niket Talwar</p>
          </div>
        </div>
        
        <nav className="flex-1 p-5 space-y-3 overflow-y-auto scrollbar-hide">
          {[
            { id: 'dashboard', name: 'Dashboard', icon: <LayoutDashboard size={22} /> },
            { id: 'planner', name: 'Study Planner', icon: <Calendar size={22} /> },
            { id: 'timer', name: 'Focus Timer', icon: <TimerIcon size={22} /> },
            { id: 'mentor', name: 'Expert Mentor', icon: <BrainCircuit size={22} /> },
            { id: 'analytics', name: 'Analytics', icon: <BarChart2 size={22} /> },
            { id: 'trophy', name: 'Trophy Room', icon: <Trophy size={22} /> },
            { id: 'icai_ping', name: 'ICAI Ping', icon: <Megaphone size={22} /> },
            { id: 'faculty_notes', name: 'Faculty Notes', icon: <FolderOpen size={22} /> },
            { id: 'past_papers', name: 'Past Papers', icon: <Library size={22} /> },
            { id: 'quick_notes', name: 'Quick Notes', icon: <FileText size={22} /> },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-300 ${
                activeTab === item.id ? theme.activeTab : theme.hoverTab
              }`}
            >
              {item.icon}
              <span className="text-base font-semibold tracking-wide">{item.name}</span>
            </button>
          ))}
        </nav>

        <div className={`p-6 border-t ${isLightMode ? 'border-slate-200' : 'border-white/5'}`}>
          <button 
            onClick={() => setIsLightMode(!isLightMode)}
            className={`w-full flex items-center justify-center gap-3 py-4 rounded-2xl transition-all font-black text-xs uppercase tracking-widest ${isLightMode ? 'bg-slate-100 text-slate-700 hover:bg-slate-200' : 'bg-white/5 text-gray-300 hover:bg-white/10'}`}
          >
            {isLightMode ? <Moon size={18} /> : <Sun size={18} />}
            {isLightMode ? 'Dark Mode' : 'Light Mode'}
          </button>
        </div>
      </aside>

      <main className="flex-1 relative overflow-y-auto scrollbar-hide">
        <div className="w-full h-full p-6 md:p-10 pb-32">
          {activeTab === 'dashboard' && renderDashboard()}
          {activeTab === 'planner' && renderPlanner()}
          {activeTab === 'timer' && renderTimer()}
          {activeTab === 'mentor' && renderMentor()}
          {activeTab === 'analytics' && renderAnalytics()}
          {activeTab === 'trophy' && renderTrophyRoom()}
          {activeTab === 'icai_ping' && renderICAIUpdates()}
          {activeTab === 'faculty_notes' && renderFacultyNotes()}
          {activeTab === 'past_papers' && renderPastPapers()}
          {activeTab === 'quick_notes' && renderQuickNotes()}
        </div>
      </main>

      {/* SMART TOAST NOTIFICATION */}
      {toastMessage && (
        <div className="fixed bottom-8 right-8 z-[500] animate-in slide-in-from-right-10 fade-in duration-500 max-w-sm">
          <div className={`${theme.cardSolid} border border-blue-500/30 shadow-[0_0_50px_rgba(0,0,0,0.5)] rounded-3xl p-6 flex items-start gap-5`}>
            <div className="p-3 bg-blue-500/20 text-blue-500 rounded-2xl shadow-inner mt-1">{toastIcon}</div>
            <p className={`text-base font-bold leading-relaxed ${theme.text}`}>{toastMessage}</p>
          </div>
        </div>
      )}
      
    </div>
  );
}