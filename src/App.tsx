import React, { useState, useEffect, useRef } from 'react';
import {
  LayoutDashboard, CalendarCheck, Timer as TimerIcon, MessageSquare, TrendingUp, BookOpen,
  AlertTriangle, CheckCircle, XCircle, Play, Pause, RotateCcw, Send, Flame, Calendar,
  BrainCircuit, Target, FileText, Sun, Moon, Maximize, Minimize, Library, ExternalLink, FolderOpen, StopCircle, Clock
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
  const { hoursToday = 0, targetHours = 10, daysLeft = 0, streak = 0, escalation = 0 } = context;
  const responses = {
    urgency_90_plus: "You have time. Build strong concepts. But don't waste days.",
    urgency_30_to_90: 'Consistency matters now. No more delays. Every single day counts.',
    urgency_less_30: 'Final phase. Every hour counts. Drop everything else and focus.',
    urgency_less_10: 'No excuses. Full revision mode. Do or die.',
  };
  if (trigger === 'urgency') {
    if (daysLeft > 90) return responses.urgency_90_plus;
    if (daysLeft > 30) return responses.urgency_30_to_90;
    if (daysLeft > 10) return responses.urgency_less_30;
    return responses.urgency_less_10;
  }
  return "Let's focus and get back to work.";
};

export default function CASathiApp() {
  // --- THEME STATE (MODERN AESTHETIC) ---
  const [isLightMode, setIsLightMode] = useLocalStorage('ca-theme-light', false);

  const theme = {
    bg: isLightMode ? 'bg-[#f8fafc]' : 'bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-slate-900 via-[#0a0f1c] to-black',
    text: isLightMode ? 'text-slate-800' : 'text-slate-100',
    sidebar: isLightMode ? 'bg-white/80 border-slate-200 shadow-xl backdrop-blur-3xl' : 'bg-white/[0.02] border-white/5 shadow-2xl backdrop-blur-2xl',
    card: isLightMode ? 'bg-white border border-slate-200 shadow-[0_8px_30px_rgb(0,0,0,0.04)]' : 'bg-white/[0.03] border border-white/10 shadow-[0_8px_30px_rgb(0,0,0,0.12)] backdrop-blur-xl hover:bg-white/[0.05] transition-colors',
    cardSolid: isLightMode ? 'bg-white border-slate-200 shadow-md' : 'bg-[#0f172a]/80 border-white/10 shadow-2xl backdrop-blur-3xl',
    input: isLightMode ? 'bg-slate-50 border-slate-200 text-slate-900 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10' : 'bg-black/40 border-white/10 text-gray-100 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20',
    textMuted: isLightMode ? 'text-slate-500' : 'text-slate-400',
    hoverTab: isLightMode ? 'hover:bg-slate-100 text-slate-600 hover:text-blue-600' : 'hover:bg-white/10 text-slate-400 hover:text-white',
    activeTab: isLightMode ? 'bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 border-l-4 border-blue-600 shadow-sm' : 'bg-gradient-to-r from-blue-600/20 to-indigo-600/10 text-blue-400 border-l-4 border-blue-500 shadow-[inset_0_0_20px_rgba(59,130,246,0.1)]'
  };

  // --- STATE MANAGEMENT ---
  const [activeTab, setActiveTab] = React.useState('dashboard');
  const [examDate, setExamDate] = useLocalStorage('ca-examDate', '');
  const [targetHours, setTargetHours] = useLocalStorage('ca-targetHours', 10);
  const [hoursStudiedToday, setHoursStudiedToday] = useLocalStorage('ca-hoursToday', 0);
  const [streak, setStreak] = useLocalStorage('ca-streak', 0);
  const [escalationLevel, setEscalationLevel] = useLocalStorage('ca-escalation', 0);
  const [tasks, setTasks] = useLocalStorage('ca-tasks', []);
  const [chatHistory, setChatHistory] = useLocalStorage('ca-chat', [
    { sender: 'mentor', text: "Hello! I am your Expert AI Mentor. I am here to plan your CA journey, resolve doubts, and keep you disciplined.", time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) },
  ]);
  const [chatInput, setChatInput] = React.useState('');
  
  // Timer State
  const [workDuration, setWorkDuration] = useLocalStorage('ca-work-duration', 50);
  const [breakDuration, setBreakDuration] = useLocalStorage('ca-break-duration', 10);
  const [timerMode, setTimerMode] = useState('pomodoro');
  const [timeLeft, setTimeLeft] = useState(workDuration * 60);
  const [isActive, setIsActive] = useState(false);
  const [showSessionLog, setShowSessionLog] = useState(false);
  const [timerDisplayType, setTimerDisplayType] = useLocalStorage('ca-timer-display', 'digital'); // NEW: Analog/Digital State
  
  const timerRef = useRef(null);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [showAddTaskModal, setShowAddTaskModal] = React.useState(false);
  const [newTask, setNewTask] = React.useState({ subject: '', topic: '', duration: 2, difficulty: 'Medium', timeOfDay: 'Morning' });

  // --- ENGINE: STREAK & MIDNIGHT RESET LOGIC ---
  useEffect(() => {
    const todayDate = new Date().toDateString();
    const lastLogin = localStorage.getItem('ca-lastLogin');

    if (lastLogin !== todayDate) {
      setHoursStudiedToday(0); 
      localStorage.setItem('ca-lastLogin', todayDate);
      
      const lastTargetHit = localStorage.getItem('ca-lastTargetHit');
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      
      if (lastTargetHit !== yesterday.toDateString() && lastTargetHit !== todayDate) {
        setStreak(0); 
      }
    }
  }, []);

  const rawDaysLeft = examDate ? Math.ceil((new Date(examDate) - new Date()) / (1000 * 60 * 60 * 24)) : 0;
  const daysLeft = Math.max(1, rawDaysLeft);
  const reqDailyHours = hoursStudiedToday < targetHours ? (targetHours - hoursStudiedToday).toFixed(1) : 0;

  // --- TIMER LOGIC ---
  useEffect(() => {
    let interval = null;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => setTimeLeft(timeLeft - 1), 1000);
    } else if (isActive && timeLeft === 0) {
      setIsActive(false);
      handleSessionComplete();
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft]);

  useEffect(() => {
    const handleFsChange = () => setIsFullScreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  const handleSessionComplete = () => {
    if (timerMode === 'pomodoro') {
      setShowSessionLog(true);
      if (document.fullscreenElement) document.exitFullscreen(); 
    } else {
      setTimerMode('pomodoro');
      setTimeLeft(workDuration * 60);
      addMentorMessage('Break over. Back to your desk immediately.');
    }
  };

  const handleStopSession = () => {
    setIsActive(false);
    const totalSecondsPlanned = timerMode === 'pomodoro' ? workDuration * 60 : breakDuration * 60;
    const secondsStudied = totalSecondsPlanned - timeLeft;
    
    if (timerMode === 'pomodoro' && secondsStudied > 0) {
      const hoursToAdd = secondsStudied / 3600; 
      const newTotalHours = Number(hoursStudiedToday) + hoursToAdd;
      setHoursStudiedToday(newTotalHours);
      
      if (newTotalHours >= targetHours && Number(hoursStudiedToday) < targetHours) {
        setStreak(Number(streak) + 1);
        localStorage.setItem('ca-lastTargetHit', new Date().toDateString());
      }
      addMentorMessage(`You stopped the session early. Added ${Math.round(secondsStudied / 60)} minutes to your daily progress.`);
    }
    
    setTimerMode('pomodoro');
    setTimeLeft(workDuration * 60);
    setShowSessionLog(false);
    if (document.fullscreenElement) document.exitFullscreen(); 
  };

  const logSessionResult = (status) => {
    setShowSessionLog(false);
    
    const sessionHoursAdded = status === 'completed' ? (Number(workDuration) / 60) : status === 'partial' ? ((Number(workDuration) / 2) / 60) : 0;
    const newTotalHours = Number(hoursStudiedToday) + sessionHoursAdded;

    if (sessionHoursAdded > 0) {
      setHoursStudiedToday(newTotalHours);
      if (newTotalHours >= targetHours && Number(hoursStudiedToday) < targetHours) {
        setStreak(Number(streak) + 1);
        localStorage.setItem('ca-lastTargetHit', new Date().toDateString());
      }
    }

    if (status === 'completed') {
      addMentorMessage("Good focus. Session logged perfectly. Take a break.");
      setEscalationLevel(0);
      setTimerMode('shortBreak');
      setTimeLeft(breakDuration * 60);
      setIsActive(true);
    } else if (status === 'partial') {
      addMentorMessage('Partial session logged. Avoid distractions next time.');
      setEscalationLevel((prev) => prev + 1);
    } else {
      addMentorMessage('Session wasted. No hours added. Pull yourself together.');
      setEscalationLevel((prev) => prev + 1);
    }
  };

  const addMentorMessage = (text, sender = 'mentor') => {
    setChatHistory((prev) => [...prev, { sender, text, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
  };

  const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
  const handleChatSubmit = async (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    const userText = chatInput;
    addMentorMessage(userText, 'user');
    setChatInput('');
    addMentorMessage('...', 'mentor');

    const prompt = `You are 'Sathi,' an elite CA Mentor. Tone: Hinglish. Answer Audit/FR/Tax doubts brilliantly. Be supportive.
      Context: Exam in ${daysLeft} days. Target: ${targetHours}h. Completed: ${hoursStudiedToday}h. Streak: ${streak}.
      Student says: "${userText}"`;

    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
        { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }) }
      );
      const data = await response.json();
      const aiReply = data.candidates[0].content.parts[0].text;
      setChatHistory((prev) => {
        const newHistory = [...prev];
        newHistory[newHistory.length - 1] = { sender: 'mentor', text: aiReply, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
        return newHistory;
      });
    } catch (error) {
      setChatHistory((prev) => {
        const newHistory = [...prev];
        newHistory[newHistory.length - 1] = { sender: 'mentor', text: `SYSTEM ERROR: Connection failed.`, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
        return newHistory;
      });
    }
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
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
        return { ...t, status: t.status === 'pending' ? 'completed' : t.status === 'completed' ? 'partial' : 'pending' };
      }
      return t;
    }));
  };

  // --- RENDER FUNCTIONS (AESTHETIC UI) ---
  const renderDashboard = () => {
    const progressPercent = Math.min((Number(hoursStudiedToday) / Number(targetHours)) * 100, 100);

    return (
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className={`relative overflow-hidden rounded-[2rem] p-10 ${isLightMode ? 'bg-gradient-to-br from-red-50 to-orange-50 border border-red-100' : 'bg-gradient-to-br from-red-950/40 to-[#2a0808] border border-red-900/30'} shadow-2xl`}>
          <div className={`absolute -top-32 -right-32 w-96 h-96 ${isLightMode ? 'bg-red-400/20' : 'bg-red-600/20'} rounded-full blur-[100px]`}></div>
          <div className="flex justify-between items-center relative z-10">
            <div>
              <h2 className="text-red-500 font-extrabold tracking-[0.2em] text-sm mb-3 uppercase drop-shadow-sm">Mission CA Final</h2>
              <div className="flex items-baseline gap-4">
                <span className={`text-7xl font-black tracking-tighter ${isLightMode ? 'text-slate-900' : 'text-white'} drop-shadow-md`}>{daysLeft}</span>
                <span className={`text-2xl ${theme.textMuted} font-semibold`}>Days to go</span>
              </div>
              <p className={`mt-4 ${isLightMode ? 'text-red-700' : 'text-red-200/80'} text-sm font-medium border-l-4 border-red-500 pl-4 py-1 max-w-lg leading-relaxed`}>"{generateMentorResponse('urgency', { daysLeft })}"</p>
            </div>
            <div className={`backdrop-blur-2xl p-5 rounded-2xl border ${isLightMode ? 'bg-white/50 border-white/40 shadow-xl' : 'bg-white/5 border-white/10 shadow-2xl'}`}>
              <div className={`text-xs font-black uppercase tracking-widest ${theme.textMuted} mb-3`}>Target Date</div>
              <input type="date" value={examDate} onChange={(e) => setExamDate(e.target.value)} className={`${theme.input} rounded-xl px-5 py-3 font-mono text-sm focus:outline-none w-full cursor-pointer`} />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className={`${theme.card} p-8 rounded-[2rem] flex flex-col justify-between transition-all hover:-translate-y-2 duration-300`}>
            <div className="flex items-center gap-5 mb-6">
              <div className="p-4 bg-gradient-to-br from-blue-500 to-cyan-400 text-white rounded-2xl shadow-[0_0_20px_rgba(56,189,248,0.4)]"><Target size={28} /></div>
              <div className={`font-bold text-lg ${theme.textMuted}`}>Today's Progress</div>
            </div>
            <div>
              <div className="text-4xl font-black tracking-tight">{Number(hoursStudiedToday).toFixed(1)} <span className={`text-lg font-semibold ${theme.textMuted}`}>/ {targetHours} hrs</span></div>
              <div className={`w-full ${isLightMode ? 'bg-slate-200' : 'bg-slate-800/50'} h-3 mt-5 rounded-full overflow-hidden border ${isLightMode ? 'border-transparent' : 'border-white/5'}`}>
                <div className="bg-gradient-to-r from-blue-500 to-cyan-400 h-full rounded-full transition-all duration-1000 ease-out shadow-[0_0_15px_rgba(56,189,248,0.6)]" style={{ width: `${progressPercent}%` }}></div>
              </div>
            </div>
          </div>

          <div className={`${theme.card} p-8 rounded-[2rem] flex flex-col justify-between transition-all hover:-translate-y-2 duration-300`}>
            <div className="flex items-center gap-5 mb-6">
              <div className="p-4 bg-gradient-to-br from-orange-400 to-red-500 text-white rounded-2xl shadow-[0_0_20px_rgba(249,115,22,0.4)]"><Flame size={28} /></div>
              <div className={`font-bold text-lg ${theme.textMuted}`}>Consistency Streak</div>
            </div>
            <div>
              <div className="text-4xl font-black tracking-tight">{streak} <span className={`text-lg font-semibold ${theme.textMuted}`}>Days</span></div>
              <div className="text-sm font-bold text-orange-500 mt-3 tracking-wide uppercase">Target Hit Streaks 🔥</div>
            </div>
          </div>

          <div className={`${theme.card} p-8 rounded-[2rem] flex flex-col justify-between transition-all hover:-translate-y-2 duration-300`}>
            <div className="flex items-center gap-5 mb-6">
              <div className={`p-4 rounded-2xl text-white shadow-lg ${hoursStudiedToday < targetHours ? 'bg-gradient-to-br from-red-500 to-rose-600 shadow-red-500/40' : 'bg-gradient-to-br from-emerald-400 to-green-500 shadow-emerald-500/40'}`}><TrendingUp size={28} /></div>
              <div className={`font-bold text-lg ${theme.textMuted}`}>Remaining Today</div>
            </div>
            <div>
              <div className="text-4xl font-black tracking-tight">{reqDailyHours} <span className={`text-lg font-semibold ${theme.textMuted}`}>hrs</span></div>
              <div className={`text-sm font-bold mt-3 uppercase tracking-wide ${hoursStudiedToday < targetHours ? 'text-red-500' : 'text-emerald-500'}`}>
                {hoursStudiedToday < targetHours ? `Pending To Hit Target.` : 'Target Accomplished!'}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // --- NEW: ANALOG CLOCK COMPONENT ---
  const renderAnalogClock = () => {
    const m = Math.floor(timeLeft / 60);
    const s = timeLeft % 60;
    // Clock math to make hands tick gracefully
    const minAngle = (m * 6) + (s * 0.1); 
    const secAngle = s * 6;

    return (
      <div className="relative w-64 h-64 md:w-80 md:h-80 rounded-full border-[8px] border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.3)] flex items-center justify-center bg-gradient-to-br from-white/5 to-transparent backdrop-blur-xl mb-12 mx-auto">
        {/* Dial Markers */}
        {[...Array(12)].map((_, i) => (
          <div key={i} className="absolute w-full h-full p-4" style={{ transform: `rotate(${i * 30}deg)` }}>
            <div className={`mx-auto w-1.5 ${i % 3 === 0 ? 'h-5 bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.8)]' : 'h-2 bg-white/20'} rounded-full`}></div>
          </div>
        ))}
        {/* Minute Hand */}
        <div className="absolute w-2.5 h-[35%] bg-slate-200 rounded-full origin-bottom bottom-1/2" style={{ transform: `rotate(${minAngle}deg)` }}></div>
        {/* Second Hand */}
        <div className="absolute w-1 h-[45%] bg-red-500 rounded-full origin-bottom bottom-1/2" style={{ transform: `rotate(${secAngle}deg)` }}></div>
        {/* Center Dot */}
        <div className="absolute w-5 h-5 bg-black rounded-full border-[4px] border-blue-500 shadow-[0_0_15px_rgba(59,130,246,1)] z-10"></div>
        {/* Digital Sub-display */}
        <div className="absolute bottom-10 bg-black/40 px-3 py-1 rounded-lg border border-white/10 text-xs font-mono font-bold tracking-widest text-slate-300">
          {formatTime(timeLeft)}
        </div>
      </div>
    );
  };

  const renderTimer = () => (
    <div ref={timerRef} className={`h-full flex flex-col items-center justify-center relative transition-all duration-500 animate-in fade-in zoom-in-95 ${isFullScreen ? (isLightMode ? 'bg-[#f8fafc]' : 'bg-[#030712]') : ''}`}>
      <button onClick={toggleFullScreen} className={`absolute top-6 right-6 p-3 rounded-2xl transition-all ${isLightMode ? 'text-slate-500 hover:bg-white shadow-sm' : 'text-slate-400 hover:bg-white/10'}`} title={isFullScreen ? "Exit Fullscreen" : "Go Fullscreen"}>
        {isFullScreen ? <Minimize size={28} /> : <Maximize size={28} />}
      </button>

      <div className="text-center w-full max-w-2xl">
        <h2 className={`text-sm font-black mb-8 uppercase tracking-[0.4em] ${theme.textMuted}`}>
          {timerMode === 'pomodoro' ? 'Deep Focus Session' : 'Strict Break'}
        </h2>
        
        {/* Toggle Analog/Digital */}
        <div className={`flex justify-center items-center gap-2 mb-8 p-1.5 rounded-2xl border w-fit mx-auto backdrop-blur-md ${isLightMode ? 'bg-slate-100 border-slate-200' : 'bg-black/40 border-white/5'}`}>
          <button onClick={() => setTimerDisplayType('digital')} className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-black uppercase tracking-widest transition-all ${timerDisplayType === 'digital' ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}>
            <TimerIcon size={18} /> Digital
          </button>
          <button onClick={() => setTimerDisplayType('analog')} className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-black uppercase tracking-widest transition-all ${timerDisplayType === 'analog' ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}>
            <Clock size={18} /> Analog
          </button>
        </div>

        {!isActive && !isFullScreen && (
          <div className="flex justify-center gap-10 mb-8">
            <div className="flex flex-col items-center">
              <label className={`text-xs mb-3 font-bold uppercase tracking-widest ${theme.textMuted}`}>Work (Min)</label>
              <input type="number" value={workDuration} onChange={(e) => {setWorkDuration(e.target.value); if(timerMode==='pomodoro') setTimeLeft(Number(e.target.value)*60);}} className={`w-24 text-center rounded-2xl p-3 font-mono text-xl font-black shadow-inner ${theme.input}`} />
            </div>
            <div className="flex flex-col items-center">
              <label className={`text-xs mb-3 font-bold uppercase tracking-widest ${theme.textMuted}`}>Break (Min)</label>
              <input type="number" value={breakDuration} onChange={(e) => {setBreakDuration(e.target.value); if(timerMode==='shortBreak') setTimeLeft(Number(e.target.value)*60);}} className={`w-24 text-center rounded-2xl p-3 font-mono text-xl font-black shadow-inner ${theme.input}`} />
            </div>
          </div>
        )}

        {/* Conditional Timer Display */}
        {timerDisplayType === 'digital' ? (
          <div className={`text-[8rem] md:text-[14rem] font-black font-mono tracking-tighter leading-none mb-12 drop-shadow-2xl transition-colors duration-500 ${timerMode === 'shortBreak' ? 'text-emerald-500 drop-shadow-[0_0_50px_rgba(16,185,129,0.5)]' : isActive ? (isLightMode ? 'text-slate-900 drop-shadow-md' : 'text-white drop-shadow-[0_0_60px_rgba(255,255,255,0.2)]') : theme.textMuted}`}>
            {formatTime(timeLeft)}
          </div>
        ) : (
          renderAnalogClock()
        )}
        
        {/* Play, Pause, Stop, Reset Controls */}
        <div className="flex justify-center items-center gap-8 mb-16">
          <button onClick={() => { setIsActive(false); setTimeLeft(timerMode === 'pomodoro' ? workDuration * 60 : breakDuration * 60); }} className={`w-16 h-16 rounded-full flex items-center justify-center transition-all border-2 ${isLightMode ? 'bg-white border-slate-200 hover:bg-slate-50 text-slate-600' : 'bg-white/5 border-white/10 hover:bg-white/10 text-white'}`} title="Reset Timer">
            <RotateCcw size={24} />
          </button>

          <button onClick={() => setIsActive(!isActive)} className={`w-28 h-28 rounded-full flex items-center justify-center transition-all duration-300 shadow-2xl ${isActive ? 'bg-amber-500/10 text-amber-500 border-2 border-amber-500/50 hover:bg-amber-500/20 shadow-[0_0_30px_rgba(245,158,11,0.3)]' : 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white hover:scale-105 shadow-[0_0_40px_rgba(59,130,246,0.5)]'}`}>
            {isActive ? <Pause size={40} /> : <Play size={40} className="ml-2" />}
          </button>

          <button onClick={handleStopSession} className={`w-16 h-16 rounded-full flex items-center justify-center transition-all border-2 ${isLightMode ? 'bg-red-50 border-red-200 hover:bg-red-100 text-red-500' : 'bg-red-500/10 border-red-500/30 hover:bg-red-500/20 text-red-500'}`} title="Stop & Log Time">
            <StopCircle size={28} />
          </button>
        </div>

        {!isFullScreen && (
          <div className={`${theme.cardSolid} rounded-3xl p-6 text-left shadow-xl max-w-xl mx-auto`}>
            <div className={`text-xs font-black uppercase tracking-widest mb-4 ${theme.textMuted}`}>Currently Executing:</div>
            <select className={`w-full rounded-2xl p-4 text-lg font-bold outline-none cursor-pointer ${theme.input}`}>
              {tasks.filter((t) => t.status !== 'completed').map((t) => <option key={t.id}>{t.subject} - {t.topic}</option>)}
              {tasks.filter((t) => t.status !== 'completed').length === 0 && <option>No active tasks assigned</option>}
            </select>
          </div>
        )}
      </div>

      {showSessionLog && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-2xl flex items-center justify-center z-50 p-4 animate-in fade-in zoom-in-95 duration-300">
          <div className={`${theme.cardSolid} rounded-[2.5rem] p-12 max-w-lg w-full text-center shadow-[0_0_50px_rgba(0,0,0,0.5)] border border-white/20`}>
            <div className="w-20 h-20 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-6 text-blue-500"><TimerIcon size={40} /></div>
            <h3 className="text-4xl font-black mb-4">Session Complete</h3>
            <p className={`text-base font-semibold mb-10 ${theme.textMuted}`}>Be honest with yourself. How was your focus?</p>
            <div className="space-y-4">
              <button onClick={() => logSessionResult('completed')} className="w-full py-5 bg-emerald-500/10 text-emerald-500 border border-emerald-500/30 hover:bg-emerald-500/20 rounded-2xl font-black text-lg flex items-center justify-center gap-3 transition-all hover:scale-[1.02]"><CheckCircle size={24} /> 100% Focused</button>
              <button onClick={() => logSessionResult('partial')} className="w-full py-5 bg-amber-500/10 text-amber-500 border border-amber-500/30 hover:bg-amber-500/20 rounded-2xl font-black text-lg flex items-center justify-center gap-3 transition-all hover:scale-[1.02]"><AlertTriangle size={24} /> Partially Distracted</button>
              <button onClick={() => logSessionResult('failed')} className="w-full py-5 bg-red-500/10 text-red-500 border border-red-500/30 hover:bg-red-500/20 rounded-2xl font-black text-lg flex items-center justify-center gap-3 transition-all hover:scale-[1.02]"><XCircle size={24} /> Wasted (0 Output)</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderPlanner = () => (
    <div className="space-y-8 relative animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-4xl font-black">Study Planner</h2>
          <p className={`text-base font-medium ${theme.textMuted} mt-2`}>Organize your day. Tackle hard subjects early.</p>
        </div>
        <button onClick={() => setShowAddTaskModal(true)} className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white px-8 py-4 rounded-2xl font-black shadow-[0_0_25px_rgba(59,130,246,0.4)] transition-all transform hover:scale-105 text-lg">+ Add Target</button>
      </div>
      <div className={`${theme.card} rounded-[2rem] p-2 overflow-hidden shadow-2xl`}>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-base">
            <thead className={`font-mono text-sm font-black uppercase tracking-widest ${isLightMode ? 'text-slate-400 bg-slate-50' : 'text-slate-500 bg-white/5'}`}>
              <tr>
                <th className="p-6 rounded-tl-[1.5rem]">Subject & Topic</th>
                <th className="p-6">Block</th>
                <th className="p-6">Difficulty</th>
                <th className="p-6">Target Hrs</th>
                <th className="p-6 rounded-tr-[1.5rem]">Action</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${isLightMode ? 'divide-slate-100' : 'divide-white/5'}`}>
              {tasks.map((task) => (
                <tr key={task.id} className={`transition-colors hover:${isLightMode ? 'bg-slate-50' : 'bg-white/5'}`}>
                  <td className="p-6 font-bold text-lg">{task.subject}: <span className={`font-medium ${theme.textMuted}`}>{task.topic}</span></td>
                  <td className="p-6 font-semibold">{task.timeOfDay}</td>
                  <td className="p-6"><span className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest ${task.difficulty === 'Hard' ? 'bg-red-500/10 text-red-500' : task.difficulty === 'Medium' ? 'bg-amber-500/10 text-amber-500' : 'bg-emerald-500/10 text-emerald-500'}`}>{task.difficulty}</span></td>
                  <td className="p-6 font-mono font-black text-xl">{task.duration}h</td>
                  <td className="p-6"><button onClick={() => setTasks(tasks.filter((t) => t.id !== task.id))} className="text-red-500/80 hover:text-red-500 text-sm font-black uppercase tracking-widest transition-colors bg-red-500/10 px-4 py-2 rounded-lg">Drop</button></td>
                </tr>
              ))}
            </tbody>
          </table>
          {tasks.length === 0 && <div className={`text-center py-16 ${theme.textMuted} font-bold text-lg`}>No targets set. Planning is the first step to clearing CA.</div>}
        </div>
      </div>

      {showAddTaskModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-2xl flex items-center justify-center z-[100] p-4 animate-in fade-in zoom-in-95 duration-300">
          <div className={`${theme.cardSolid} rounded-[2.5rem] p-10 max-w-xl w-full shadow-[0_0_50px_rgba(0,0,0,0.4)] border border-white/20`}>
            <h3 className="text-3xl font-black mb-8 flex items-center gap-4"><BookOpen size={28} className="text-blue-500" /> Create Target</h3>
            <form onSubmit={handleAddTask} className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div><label className={`text-xs font-black uppercase tracking-widest mb-3 block ${theme.textMuted}`}>Subject</label><input type="text" value={newTask.subject} onChange={(e) => setNewTask({ ...newTask, subject: e.target.value })} className={`w-full rounded-2xl p-4 text-lg font-bold outline-none ${theme.input}`} required placeholder="e.g. Audit" /></div>
                <div><label className={`text-xs font-black uppercase tracking-widest mb-3 block ${theme.textMuted}`}>Topic</label><input type="text" value={newTask.topic} onChange={(e) => setNewTask({ ...newTask, topic: e.target.value })} className={`w-full rounded-2xl p-4 text-lg font-bold outline-none ${theme.input}`} required placeholder="e.g. SA 500" /></div>
              </div>
              <div className="grid grid-cols-3 gap-6">
                <div><label className={`text-xs font-black uppercase tracking-widest mb-3 block ${theme.textMuted}`}>Hours</label><input type="number" step="0.5" min="0.5" value={newTask.duration} onChange={(e) => setNewTask({ ...newTask, duration: Number(e.target.value) })} className={`w-full rounded-2xl p-4 text-lg font-bold outline-none ${theme.input}`} required /></div>
                <div><label className={`text-xs font-black uppercase tracking-widest mb-3 block ${theme.textMuted}`}>Level</label><select value={newTask.difficulty} onChange={(e) => setNewTask({ ...newTask, difficulty: e.target.value })} className={`w-full rounded-2xl p-4 text-lg font-bold outline-none ${theme.input}`}><option>Hard</option><option>Medium</option><option>Easy</option></select></div>
                <div><label className={`text-xs font-black uppercase tracking-widest mb-3 block ${theme.textMuted}`}>Block</label><select value={newTask.timeOfDay} onChange={(e) => setNewTask({ ...newTask, timeOfDay: e.target.value })} className={`w-full rounded-2xl p-4 text-lg font-bold outline-none ${theme.input}`}><option>Morning</option><option>Afternoon</option><option>Night</option></select></div>
              </div>
              <div className={`flex gap-5 mt-10 pt-8 border-t ${isLightMode ? 'border-slate-200' : 'border-white/10'}`}>
                <button type="button" onClick={() => setShowAddTaskModal(false)} className={`flex-1 py-4 rounded-2xl font-black text-lg transition-colors ${isLightMode ? 'bg-slate-100 hover:bg-slate-200 text-slate-700' : 'bg-white/5 hover:bg-white/10 text-slate-300'}`}>Cancel</button>
                <button type="submit" className="flex-1 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-2xl font-black text-lg shadow-[0_0_25px_rgba(59,130,246,0.4)]">Save Target</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );

  const renderMentor = () => (
    <div className={`flex flex-col h-[calc(100vh-6rem)] ${theme.cardSolid} rounded-[2rem] overflow-hidden animate-in fade-in slide-in-from-bottom-4 shadow-2xl`}>
      <div className={`p-6 ${isLightMode ? 'bg-slate-50/80 border-b border-slate-200' : 'bg-black/20 border-b border-white/5'} flex items-center justify-between backdrop-blur-xl`}>
        <div className="flex items-center gap-5">
          <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-[0_0_20px_rgba(59,130,246,0.4)]"><BrainCircuit size={28} /></div>
          <div><h3 className="font-black text-2xl">Expert CA Mentor</h3><p className={`text-xs font-black uppercase tracking-widest mt-1 ${theme.textMuted}`}>Powered by Audit Cubicles</p></div>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-8 space-y-8">
        {chatHistory.map((msg, i) => (
          <div key={i} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] p-6 rounded-3xl text-lg leading-relaxed whitespace-pre-wrap font-medium shadow-lg ${msg.sender === 'user' ? 'bg-gradient-to-br from-blue-600 to-indigo-600 text-white rounded-br-sm shadow-blue-500/20' : (isLightMode ? 'bg-white border border-slate-200 rounded-bl-sm text-slate-800' : 'bg-white/5 border border-white/10 text-slate-200 rounded-bl-sm backdrop-blur-xl')}`}>
              {msg.text}
              <div className={`text-[11px] text-right mt-4 font-black uppercase tracking-widest ${msg.sender === 'user' ? 'text-blue-200' : theme.textMuted}`}>{msg.time}</div>
            </div>
          </div>
        ))}
      </div>
      <form onSubmit={handleChatSubmit} className={`p-6 ${isLightMode ? 'bg-slate-50/80 border-t border-slate-200' : 'bg-black/40 border-t border-white/5'} flex gap-4 backdrop-blur-2xl`}>
        <input type="text" value={chatInput} onChange={(e) => setChatInput(e.target.value)} placeholder="Ask technical doubts, request strategies, or get motivation..." className={`flex-1 ${theme.input} rounded-2xl px-6 py-5 text-lg font-semibold outline-none shadow-inner`} />
        <button type="submit" className="bg-gradient-to-br from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white px-8 rounded-2xl transition-all shadow-[0_0_20px_rgba(59,130,246,0.4)] hover:scale-105 font-black"><Send size={28} /></button>
      </form>
    </div>
  );

  const renderFacultyNotes = () => {
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
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
        <div><h2 className="text-4xl font-black mb-3">Faculty Notes Vault</h2><p className={`font-semibold text-lg ${theme.textMuted}`}>Top CA faculty materials & summaries in one place.</p></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {notes.map((n, i) => (
            <a key={i} href={n.link} target="_blank" rel="noreferrer" className={`${theme.cardSolid} p-8 rounded-[2rem] transition-all transform hover:-translate-y-2 hover:shadow-2xl ${n.glow} flex flex-col items-center text-center gap-5 group border border-white/5`}>
              <div className="text-6xl mb-2 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3 drop-shadow-xl">{n.icon}</div>
              <h3 className="font-black text-xl leading-tight">{n.name}</h3>
              <div className={`mt-2 px-6 py-2.5 rounded-xl text-sm font-black uppercase tracking-widest flex items-center gap-3 ${isLightMode ? 'bg-blue-50 text-blue-600' : 'bg-blue-500/10 text-blue-400'} group-hover:bg-blue-500 group-hover:text-white transition-all`}>Open Drive <FolderOpen size={18} /></div>
            </a>
          ))}
        </div>
      </div>
    );
  };

  const renderPastPapers = () => {
    const papers = [
      { name: 'Financial Reporting', icon: '📊', link: 'https://www.castudypartner.com/view/all_questions/id=ZhMn2SLrHqCWa7izgCHWVXoqv9o31c3zCd7a6BZBdRQ=/type=aBiUXQHw15Q33rsRD5ideZvMa3Oq-gDQc-p_p8a0vBU=/subject=UeoGTdCOXR9vcXrH2Ixm0zA-5qpL43ovTx6iamI8bPw=/index=HjR8OI_C92vfg2wkAKIEVBKwp0dEP3hrT8uAcW2pUOY=' },
      { name: 'Advanced Fin. Mgmt', icon: '📈', link: 'https://www.castudypartner.com/view/all_questions/id=ZhMn2SLrHqCWa7izgCHWVXoqv9o31c3zCd7a6BZBdRQ=/type=aBiUXQHw15Q33rsRD5ideZvMa3Oq-gDQc-p_p8a0vBU=/subject=nzKn-ijbXOsXihFYuZuZ6-yR3O7rz5s5pFDwc0kFWXg=/index=rAymKoVQaLKzGCWL_i2PP4gzLRaKgE_1Nu8iB3d8HXo=' },
      { name: 'Audit & Assurance', icon: '🔍', link: 'https://www.castudypartner.com/view/all_questions/id=ZhMn2SLrHqCWa7izgCHWVXoqv9o31c3zCd7a6BZBdRQ=/type=aBiUXQHw15Q33rsRD5ideZvMa3Oq-gDQc-p_p8a0vBU=/subject=N8Irnu1rh71zD1hw5b1Iho579hPZG2TfcYxL3kAtmow=/index=LYlBZAJ5rzMMo-bLpeEC1z1Vu6hvFQgciswiJZR5N0I=' },
      { name: 'Direct Taxes (DT)', icon: '💰', link: 'https://www.castudypartner.com/view/all_questions/id=ZhMn2SLrHqCWa7izgCHWVXoqv9o31c3zCd7a6BZBdRQ=/type=aBiUXQHw15Q33rsRD5ideZvMa3Oq-gDQc-p_p8a0vBU=/subject=8y5m11WZYYQ61D94xGPF2eEcUme4g3cQivnx_Ia1v6Q=/index=diFiR7ZcZzLCkOruyZs6TF7eiQTTgt4-ZY8KPrGPalg=' },
      { name: 'Indirect Taxes (IDT)', icon: '🏛️', link: 'https://www.castudypartner.com/view/all_questions/id=ZhMn2SLrHqCWa7izgCHWVXoqv9o31c3zCd7a6BZBdRQ=/type=aBiUXQHw15Q33rsRD5ideZvMa3Oq-gDQc-p_p8a0vBU=/subject=yiC0c50Q_LZATuRNxhKGY-vVnCmb35XHX1qJLUCg6rg=/index=V6rijQR0M1NyCnUmIud0qmSbfUsoWPbhBF1vaGYvLZo=' },
      { name: 'Integrated Bus. Sol.', icon: '💼', link: 'https://www.castudypartner.com/view/all_questions/id=ZhMn2SLrHqCWa7izgCHWVXoqv9o31c3zCd7a6BZBdRQ=/type=aBiUXQHw15Q33rsRD5ideZvMa3Oq-gDQc-p_p8a0vBU=/subject=Wk2SeRfZ_3nIE7JER5YukXWCQAyOPdluvJ-t2L8hLSg=/index=NE6rAQ9isAAETZPXslGFhxfzuWG3zDWGYzylSlJwxNI=' },
    ];
    return (
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
        <div><h2 className="text-4xl font-black mb-3">Past Papers & MTPs</h2><p className={`font-semibold text-lg ${theme.textMuted}`}>Direct access to subject-wise question banks.</p></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {papers.map((p, i) => (
            <a key={i} href={p.link} target="_blank" rel="noreferrer" className={`${theme.cardSolid} p-8 rounded-[2rem] transition-all transform hover:-translate-y-2 hover:shadow-2xl flex flex-col items-center text-center gap-5 group border border-white/5`}>
              <div className="text-6xl mb-2 transition-transform duration-500 group-hover:scale-110 drop-shadow-xl">{p.icon}</div>
              <h3 className="font-black text-xl leading-tight">{p.name}</h3>
              <div className={`mt-2 px-6 py-2.5 rounded-xl text-sm font-black uppercase tracking-widest flex items-center gap-3 ${isLightMode ? 'bg-indigo-50 text-indigo-600' : 'bg-indigo-500/10 text-indigo-400'} group-hover:bg-indigo-500 group-hover:text-white transition-colors`}>Open Bank <ExternalLink size={18} /></div>
            </a>
          ))}
        </div>
      </div>
    );
  };

  const renderQuickNotes = () => (
    <div className="space-y-6 overflow-y-auto max-h-[75vh] p-2 text-left animate-in fade-in slide-in-from-bottom-4">
      <div className={`p-8 ${theme.cardSolid} rounded-[2.5rem] shadow-2xl border border-white/10`}>
        <div className="flex items-center gap-5 mb-8">
          <div className="p-4 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl shadow-[0_0_20px_rgba(245,158,11,0.4)] text-white"><FileText size={28} /></div>
          <div>
            <h3 className="font-black text-2xl uppercase tracking-widest">Quick Study Notes</h3>
            <p className={`text-sm font-bold mt-1 ${theme.textMuted}`}>Draft temporary notes, auto-saved in browser.</p>
          </div>
        </div>
        <textarea
          className={`w-full h-[50vh] p-6 rounded-3xl outline-none resize-none text-lg font-medium leading-relaxed ${theme.input} shadow-inner`}
          placeholder="Start typing your rough concepts, SA summaries, or section numbers here..."
          onChange={(e) => localStorage.setItem('ca_sathi_notes', e.target.value)}
          defaultValue={localStorage.getItem('ca_sathi_notes') || ""}
        />
      </div>
    </div>
  );

  // --- MAIN UI RENDER ---
  return (
    <div className={`min-h-screen font-sans flex overflow-hidden transition-colors duration-500 ${theme.bg} ${theme.text}`}>
      
      {/* SIDEBAR */}
      <aside className={`w-72 border-r flex flex-col hidden md:flex transition-all duration-500 ${theme.sidebar} z-10`}>
        <div className={`p-8 border-b flex flex-col items-start ${isLightMode ? 'border-slate-200' : 'border-white/5'}`}>
          <div className="flex items-center gap-4 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center font-black text-xl text-white shadow-[0_0_20px_rgba(59,130,246,0.5)]">CA</div>
            <span className="font-black text-2xl tracking-wider">Sathi.ai</span>
          </div>
          <div className="w-full text-left pl-3 border-l-4 border-blue-500 rounded-sm">
            <p className={`text-[10px] uppercase tracking-[0.3em] font-black leading-none mb-1.5 ${theme.textMuted}`}>Created By</p>
            <p className="text-base font-black text-blue-500 tracking-wide">Niket Talwar</p>
          </div>
        </div>
        
        <nav className="flex-1 p-5 space-y-3 overflow-y-auto scrollbar-hide">
          {[
            { id: 'dashboard', name: 'Dashboard', icon: <LayoutDashboard size={22} /> },
            { id: 'planner', name: 'Study Planner', icon: <Calendar size={22} /> },
            { id: 'timer', name: 'Focus Timer', icon: <TimerIcon size={22} /> },
            { id: 'faculty_notes', name: 'Faculty Notes', icon: <FolderOpen size={22} /> },
            { id: 'past_papers', name: 'Past Papers', icon: <Library size={22} /> },
            { id: 'quick_notes', name: 'Quick Notes', icon: <FileText size={22} /> },
            { id: 'mentor', name: 'Expert Mentor', icon: <BrainCircuit size={22} /> },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-300 ${
                activeTab === item.id ? theme.activeTab : theme.hoverTab
              }`}
            >
              {item.icon}
              <span className="font-bold text-base tracking-wide">{item.name}</span>
            </button>
          ))}
        </nav>

        {/* Theme Toggle Button */}
        <div className={`p-6 border-t ${isLightMode ? 'border-slate-200' : 'border-white/5'}`}>
          <button 
            onClick={() => setIsLightMode(!isLightMode)}
            className={`w-full flex items-center justify-center gap-3 py-4 rounded-2xl transition-all font-black text-sm uppercase tracking-widest ${isLightMode ? 'bg-slate-100 text-slate-700 hover:bg-slate-200' : 'bg-white/5 text-gray-300 hover:bg-white/10'}`}
          >
            {isLightMode ? <Moon size={20} /> : <Sun size={20} />}
            {isLightMode ? 'Dark Mode' : 'Light Mode'}
          </button>
        </div>
      </aside>

      {/* DYNAMIC CONTENT AREA */}
      <main className="flex-1 relative overflow-y-auto scrollbar-hide">
        <div className="max-w-6xl mx-auto h-full p-10 pb-32">
          {activeTab === 'dashboard' && renderDashboard()}
          {activeTab === 'planner' && renderPlanner()}
          {activeTab === 'timer' && renderTimer()}
          {activeTab === 'faculty_notes' && renderFacultyNotes()}
          {activeTab === 'past_papers' && renderPastPapers()}
          {activeTab === 'quick_notes' && renderQuickNotes()}
          {activeTab === 'mentor' && renderMentor()}
        </div>
      </main>
      
    </div>
  );
}