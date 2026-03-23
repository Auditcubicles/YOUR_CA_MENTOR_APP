import React, { useState, useEffect, useRef } from 'react';
import {
  LayoutDashboard, CalendarCheck, Timer as TimerIcon, MessageSquare, TrendingUp, BookOpen,
  AlertTriangle, CheckCircle, XCircle, Play, Pause, RotateCcw, Send, Flame, Calendar,
  BrainCircuit, Target, FileText, Sun, Moon, Maximize, Minimize, Library, ExternalLink, 
  FolderOpen, StopCircle, Clock, BarChart2, CloudRain, Trees, Waves, Bell, Zap
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

// --- CA MOTIVATIONAL QUOTES (HOURLY) ---
const motivationalQuotes = [
  "Push harder than yesterday if you want a different tomorrow.",
  "CA is not about intelligence, it's about pure stamina.",
  "Tired? Learn to rest, not to quit.",
  "Your future self is watching you right now. Make them proud.",
  "Discipline is doing what you hate, but doing it like you love it.",
  "The syllabus is huge, but your determination is bigger.",
  "One day all these late nights will pay off. Keep going.",
  "Don't stop until you see 'PASS' on your marksheet.",
  "The pain you feel today will be the strength you feel tomorrow.",
  "Audit your time, before time audits your attempt.",
  "A CA student's best friend is consistency. Stay focused."
];

export default function CASathiApp() {
  // --- PERFECT GLOWING GLASSMORPHISM THEME ---
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

  // --- STATE MANAGEMENT ---
  const [activeTab, setActiveTab] = React.useState('dashboard');
  const [examDate, setExamDate] = useLocalStorage('ca-examDate', '');
  const [targetHours, setTargetHours] = useLocalStorage('ca-targetHours', 10); // EDITABLE NOW
  const [hoursStudiedToday, setHoursStudiedToday] = useLocalStorage('ca-hoursToday', 0);
  const [streak, setStreak] = useLocalStorage('ca-streak', 0);
  const [studyHistory, setStudyHistory] = useLocalStorage('ca-study-history', {}); 
  
  const [tasks, setTasks] = useLocalStorage('ca-tasks', []);
  const [chatHistory, setChatHistory] = useLocalStorage('ca-chat', [
    { sender: 'mentor', text: "Welcome to CA Sathi. I am your Expert Mentor. Ask me any Audit/FR doubts or let's plan your schedule.", time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) },
  ]);
  const [chatInput, setChatInput] = React.useState('');
  const [toastMessage, setToastMessage] = useState(null); 
  const [toastIcon, setToastIcon] = useState(null);
  
  // Timer & Sound State
  const [workDuration, setWorkDuration] = useLocalStorage('ca-work-duration', 50);
  const [breakDuration, setBreakDuration] = useLocalStorage('ca-break-duration', 10);
  const [timerMode, setTimerMode] = useState('pomodoro');
  const [timeLeft, setTimeLeft] = useState(Number(workDuration) * 60 || 3000);
  const [isActive, setIsActive] = useState(false);
  const [showSessionLog, setShowSessionLog] = useState(false);
  const [timerDisplayType, setTimerDisplayType] = useLocalStorage('ca-timer-display', 'digital'); 
  const [activeSound, setActiveSound] = useState(null); 
  const audioRef = useRef(null);
  
  const timerRef = useRef(null);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [showAddTaskModal, setShowAddTaskModal] = React.useState(false);
  const [newTask, setNewTask] = React.useState({ subject: '', topic: '', duration: 2, difficulty: 'Medium', timeOfDay: 'Morning' });

  // --- ENGINE: STREAK & ANALYTICS RESET ---
  useEffect(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    const lastLogin = localStorage.getItem('ca-lastLogin');

    if (lastLogin !== todayStr) {
      setHoursStudiedToday(0); 
      localStorage.setItem('ca-lastLogin', todayStr);
      
      const lastTargetHit = localStorage.getItem('ca-lastTargetHit');
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];
      
      if (lastTargetHit !== yesterdayStr && lastTargetHit !== todayStr) {
        setStreak(0); 
      }
    }
  }, []);

  // --- HOURLY MOTIVATIONAL QUOTES ENGINE ---
  useEffect(() => {
    const quoteInterval = setInterval(() => {
      const randomQuote = motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)];
      triggerToast(randomQuote, <Zap size={18} />);
    }, 5000); // 5000 ms = 1 Hour

    return () => clearInterval(quoteInterval);
  }, []);

  const rawDaysLeft = examDate ? Math.ceil((new Date(examDate) - new Date()) / (1000 * 60 * 60 * 24)) : 0;
  const daysLeft = Math.max(1, rawDaysLeft);
  const safeTarget = Number(targetHours) || 1; 
  const reqDailyHours = hoursStudiedToday < safeTarget ? (safeTarget - hoursStudiedToday).toFixed(1) : 0;
  const progressPercent = Math.min((Number(hoursStudiedToday) / safeTarget) * 100, 100);

  // --- SAFE FORMAT TIME ---
  const formatTime = (seconds) => {
    if (isNaN(seconds) || seconds < 0) return "00:00";
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const safeExitFullscreen = () => {
    try { if (document.fullscreenElement && document.exitFullscreen) document.exitFullscreen().catch(() => {}); } 
    catch (e) { console.error(e); }
  };

  // --- GUARANTEED SOUND LOGIC (ARCHIVE.ORG LINKS) ---
  const toggleSound = (soundType, url) => {
    if (activeSound === soundType) {
      audioRef.current?.pause();
      setActiveSound(null);
    } else {
      if (audioRef.current) {
        audioRef.current.src = url;
        audioRef.current.loop = true;
        audioRef.current.volume = 0.5;
        audioRef.current.play().catch(e => {
          console.error("Audio blocked:", e);
          triggerToast("Browser blocked auto-play. Please click again.", <AlertTriangle size={18}/>);
        });
      }
      setActiveSound(soundType);
    }
  };

  // --- TOAST NOTIFICATION ---
  const triggerToast = (msg, icon = <Bell size={18} />) => {
    setToastMessage(msg);
    setToastIcon(icon);
    setTimeout(() => setToastMessage(null), 6000);
  };

  // --- TIMER LOGIC ---
  useEffect(() => {
    let interval = null;
    if (isActive && timeLeft > 0) interval = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    else if (isActive && timeLeft <= 0) { setIsActive(false); handleSessionComplete(); }
    return () => clearInterval(interval);
  }, [isActive, timeLeft]);

  useEffect(() => {
    const handleFsChange = () => setIsFullScreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  const toggleFullScreen = () => {
    if (!document.fullscreenElement) timerRef.current?.requestFullscreen().catch(() => {});
    else safeExitFullscreen();
  };

  const saveToHistory = (hoursToAdd) => {
    const todayStr = new Date().toISOString().split('T')[0];
    setStudyHistory(prev => {
      const currentToday = prev[todayStr] || 0;
      return { ...prev, [todayStr]: currentToday + hoursToAdd };
    });
  };

  const handleSessionComplete = () => {
    if (timerMode === 'pomodoro') {
      setShowSessionLog(true);
      safeExitFullscreen(); 
    } else {
      setTimerMode('pomodoro');
      setTimeLeft((Number(workDuration) || 50) * 60);
      triggerToast('Break over. Back to your books.');
    }
  };

  const handleStopSession = () => {
    setIsActive(false);
    const safeWorkDur = Number(workDuration) || 50;
    const totalSecondsPlanned = timerMode === 'pomodoro' ? safeWorkDur * 60 : (Number(breakDuration) || 10) * 60;
    const secondsStudied = totalSecondsPlanned - timeLeft;
    
    if (timerMode === 'pomodoro' && secondsStudied > 0) {
      const hoursToAdd = secondsStudied / 3600; 
      const newTotalHours = Number(hoursStudiedToday) + hoursToAdd;
      setHoursStudiedToday(newTotalHours);
      saveToHistory(hoursToAdd);
      
      if (newTotalHours >= safeTarget && Number(hoursStudiedToday) < safeTarget) {
        setStreak(Number(streak) + 1);
        localStorage.setItem('ca-lastTargetHit', new Date().toISOString().split('T')[0]);
      }
      triggerToast(`Session stopped. ${(secondsStudied / 60).toFixed(1)} mins added.`);
    }
    
    setTimerMode('pomodoro');
    setTimeLeft(safeWorkDur * 60);
    setShowSessionLog(false);
    safeExitFullscreen(); 
  };

  const logSessionResult = (status) => {
    setShowSessionLog(false);
    const safeWorkDur = Number(workDuration) || 50;
    const sessionHoursAdded = status === 'completed' ? (safeWorkDur / 60) : status === 'partial' ? ((safeWorkDur / 2) / 60) : 0;
    const newTotalHours = Number(hoursStudiedToday) + sessionHoursAdded;

    if (sessionHoursAdded > 0) {
      setHoursStudiedToday(newTotalHours);
      saveToHistory(sessionHoursAdded);
      if (newTotalHours >= safeTarget && Number(hoursStudiedToday) < safeTarget) {
        setStreak(Number(streak) + 1);
        localStorage.setItem('ca-lastTargetHit', new Date().toISOString().split('T')[0]);
      }
    }

    if (status === 'completed') {
      triggerToast("Session logged perfectly. Good focus.");
      setTimerMode('shortBreak');
      setTimeLeft((Number(breakDuration) || 10) * 60);
      setIsActive(true);
    } else if (status === 'partial') {
      triggerToast('Partial session logged. Avoid distractions.');
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
    
    setTimeout(() => { triggerToast("Mentor is thinking...", <BrainCircuit size={18}/>); }, 500);

    const prompt = `You are 'Sathi,' an elite CA Mentor. Tone: Professional Hinglish. Be direct, helpful, and motivating.
      Context: Exam in ${daysLeft} days. Target: ${safeTarget}h. Completed: ${hoursStudiedToday}h. Streak: ${streak}.
      Student says: "${userText}"`;

    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
        { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }) }
      );
      const data = await response.json();
      const aiReply = data.candidates[0].content.parts[0].text;
      addMentorMessage(aiReply, 'mentor');
      triggerToast("New message from Expert Mentor", <MessageSquare size={18}/>);
    } catch (error) {
      addMentorMessage(`Connection error. Please try again.`, 'mentor');
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
      if (t.id === id) return { ...t, status: t.status === 'pending' ? 'completed' : t.status === 'completed' ? 'partial' : 'pending' };
      return t;
    }));
  };

  // --- RENDER FUNCTIONS ---
  const renderDashboard = () => (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {/* Aesthetic Exam Countdown Header */}
      <div className={`relative overflow-hidden rounded-3xl p-8 ${isLightMode ? 'bg-gradient-to-br from-red-50 to-orange-50 border border-red-100' : 'bg-gradient-to-br from-red-950/40 to-[#2a0808] border border-red-900/30'} shadow-xl`}>
        <div className={`absolute -top-24 -right-24 w-72 h-72 ${isLightMode ? 'bg-red-400/20' : 'bg-red-600/20'} rounded-full blur-[80px]`}></div>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center relative z-10 gap-6">
          <div>
            <h2 className="text-red-500 font-bold tracking-[0.2em] text-xs mb-2 uppercase drop-shadow-sm">Mission CA Final</h2>
            <div className="flex items-baseline gap-3">
              <span className={`text-5xl md:text-6xl font-black tracking-tighter ${isLightMode ? 'text-slate-900' : 'text-white'} drop-shadow-sm`}>{daysLeft}</span>
              <span className={`text-lg ${theme.textMuted} font-medium`}>Days to go</span>
            </div>
            <p className={`mt-3 ${isLightMode ? 'text-red-700' : 'text-red-200/80'} text-sm font-medium border-l-2 border-red-500 pl-3 py-0.5 max-w-md leading-relaxed`}>"{generateMentorResponse('urgency', { daysLeft })}"</p>
          </div>
          
          <div className="flex gap-4">
            <div className={`backdrop-blur-2xl p-4 rounded-xl border ${isLightMode ? 'bg-white/50 border-white/40 shadow-sm' : 'bg-white/5 border-white/10 shadow-lg'}`}>
              <div className={`text-[10px] font-bold uppercase tracking-widest ${theme.textMuted} mb-2`}>Target Date</div>
              <input type="date" value={examDate} onChange={(e) => setExamDate(e.target.value)} className={`${theme.input} rounded-lg px-4 py-2 font-mono text-sm focus:outline-none w-full cursor-pointer`} />
            </div>
            <div className={`backdrop-blur-2xl p-4 rounded-xl border ${isLightMode ? 'bg-white/50 border-white/40 shadow-sm' : 'bg-white/5 border-white/10 shadow-lg'}`}>
              <div className={`text-[10px] font-bold uppercase tracking-widest ${theme.textMuted} mb-2`}>Daily Hrs Goal</div>
              <input type="number" min="1" max="24" value={targetHours} onChange={(e) => setTargetHours(e.target.value)} className={`${theme.input} rounded-lg px-4 py-2 font-mono text-sm focus:outline-none w-24 cursor-pointer`} />
            </div>
          </div>
        </div>
      </div>

      {/* Floating Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className={`${theme.card} p-6 rounded-3xl flex flex-col justify-between transition-all hover:-translate-y-1 duration-300`}>
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-cyan-400 text-white rounded-xl shadow-[0_0_15px_rgba(56,189,248,0.4)]"><Target size={22} /></div>
            <div className={`font-semibold text-sm ${theme.textMuted}`}>Today's Progress</div>
          </div>
          <div>
            <div className="text-3xl font-black tracking-tight">{Number(hoursStudiedToday).toFixed(1)} <span className={`text-sm font-semibold ${theme.textMuted}`}>/ {safeTarget} hrs</span></div>
            <div className={`w-full ${isLightMode ? 'bg-slate-200' : 'bg-slate-800/50'} h-2 mt-4 rounded-full overflow-hidden border ${isLightMode ? 'border-transparent' : 'border-white/5'}`}>
              <div className="bg-gradient-to-r from-blue-500 to-cyan-400 h-full rounded-full transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(56,189,248,0.6)]" style={{ width: `${progressPercent}%` }}></div>
            </div>
          </div>
        </div>

        <div className={`${theme.card} p-6 rounded-3xl flex flex-col justify-between transition-all hover:-translate-y-1 duration-300`}>
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-gradient-to-br from-orange-400 to-red-500 text-white rounded-xl shadow-[0_0_15px_rgba(249,115,22,0.4)]"><Flame size={22} /></div>
            <div className={`font-semibold text-sm ${theme.textMuted}`}>Consistency Streak</div>
          </div>
          <div>
            <div className="text-3xl font-black tracking-tight">{streak} <span className={`text-sm font-semibold ${theme.textMuted}`}>Days</span></div>
            <div className="text-xs font-bold text-orange-500 mt-2 tracking-wide uppercase">Target Hit Streaks 🔥</div>
          </div>
        </div>

        <div className={`${theme.card} p-6 rounded-3xl flex flex-col justify-between transition-all hover:-translate-y-1 duration-300`}>
          <div className="flex items-center gap-4 mb-4">
            <div className={`p-3 rounded-xl text-white shadow-lg ${hoursStudiedToday < safeTarget ? 'bg-gradient-to-br from-red-500 to-rose-600 shadow-red-500/40' : 'bg-gradient-to-br from-emerald-400 to-green-500 shadow-emerald-500/40'}`}><TrendingUp size={22} /></div>
            <div className={`font-semibold text-sm ${theme.textMuted}`}>Remaining Today</div>
          </div>
          <div>
            <div className="text-3xl font-black tracking-tight">{reqDailyHours} <span className={`text-sm font-semibold ${theme.textMuted}`}>hrs</span></div>
            <div className={`text-xs font-bold mt-2 uppercase tracking-wide ${hoursStudiedToday < safeTarget ? 'text-red-500' : 'text-emerald-500'}`}>
              {hoursStudiedToday < safeTarget ? `Pending To Hit Target` : 'Target Accomplished!'}
            </div>
          </div>
        </div>
      </div>

      <div className={`${theme.card} rounded-3xl p-8`}>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold flex items-center gap-3"><Calendar size={22} className="text-blue-500" /> Today's Focus</h3>
          <button onClick={() => setActiveTab('planner')} className="text-xs font-bold text-blue-500 hover:text-blue-400 transition-colors bg-blue-500/10 px-3 py-1.5 rounded-lg">View Planner &rarr;</button>
        </div>
        <div className="space-y-3">
          {tasks.map((task) => (
            <div key={task.id} className={`flex items-center justify-between p-4 ${theme.cardSolid} rounded-xl border transition-all hover:border-blue-500/50 hover:shadow-sm`}>
              <div className="flex items-center gap-4">
                <button onClick={() => toggleTaskStatus(task.id)} className="transition-transform hover:scale-110">
                  {task.status === 'completed' && <CheckCircle className="text-emerald-500 drop-shadow-[0_0_5px_rgba(16,185,129,0.4)]" size={24} />}
                  {task.status === 'partial' && <AlertTriangle className="text-amber-500 drop-shadow-[0_0_5px_rgba(245,158,11,0.4)]" size={24} />}
                  {task.status === 'pending' && <div className={`w-6 h-6 rounded-full border-[2px] ${isLightMode ? 'border-slate-300' : 'border-slate-600'}`}></div>}
                </button>
                <div>
                  <div className="font-semibold text-base flex items-center gap-2">
                    {task.subject}: <span className="font-medium opacity-80">{task.topic}</span>
                    <span className={`text-[9px] px-2 py-0.5 rounded-full uppercase font-bold tracking-widest ${task.difficulty === 'Hard' ? 'bg-red-500/10 text-red-500' : 'bg-amber-500/10 text-amber-500'}`}>{task.difficulty}</span>
                  </div>
                  <div className={`text-xs font-medium ${theme.textMuted} mt-1`}>{task.timeOfDay} Block • {task.duration} Hours</div>
                </div>
              </div>
              <div className="text-right">
                {task.status === 'completed' ? <span className="text-xs font-bold text-emerald-500 uppercase tracking-widest bg-emerald-500/10 px-3 py-1.5 rounded-md">Logged</span> : <button onClick={() => setActiveTab('timer')} className="text-xs bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white px-4 py-2 rounded-lg font-bold transition-all shadow-md shadow-blue-500/20">Start Session</button>}
              </div>
            </div>
          ))}
          {tasks.length === 0 && <p className={`text-center py-6 ${theme.textMuted} font-medium text-sm`}>Your desk is clean. Add tasks in Study Planner.</p>}
        </div>
      </div>
    </div>
  );

  const renderPlanner = () => (
    <div className="space-y-6 relative animate-in fade-in duration-500">
      <div className="flex justify-between items-center mb-2">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Study Planner</h2>
          <p className={`text-sm font-medium ${theme.textMuted} mt-1`}>Organize your day. Tackle hard subjects early.</p>
        </div>
        <button onClick={() => setShowAddTaskModal(true)} className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white px-5 py-2.5 rounded-xl font-bold shadow-[0_0_20px_rgba(59,130,246,0.3)] transition-all transform hover:scale-105 text-sm">+ Add Target</button>
      </div>
      <div className={`${theme.card} rounded-3xl p-2 overflow-hidden shadow-xl`}>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className={`font-mono text-xs font-bold uppercase tracking-wider ${isLightMode ? 'text-slate-500 bg-slate-50/50' : 'text-slate-400 bg-white/5'}`}>
              <tr>
                <th className="p-5 rounded-tl-2xl">Subject & Topic</th>
                <th className="p-5">Block</th>
                <th className="p-5">Difficulty</th>
                <th className="p-5">Target Hrs</th>
                <th className="p-5 rounded-tr-2xl">Action</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${isLightMode ? 'divide-slate-100' : 'divide-white/5'}`}>
              {tasks.map((task) => (
                <tr key={task.id} className={`transition-colors hover:${isLightMode ? 'bg-slate-50' : 'bg-white/5'}`}>
                  <td className="p-5 font-semibold text-base">{task.subject}: <span className={`font-normal ${theme.textMuted}`}>{task.topic}</span></td>
                  <td className="p-5 font-medium">{task.timeOfDay}</td>
                  <td className="p-5"><span className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider ${task.difficulty === 'Hard' ? 'bg-red-500/10 text-red-500' : task.difficulty === 'Medium' ? 'bg-amber-500/10 text-amber-500' : 'bg-emerald-500/10 text-emerald-500'}`}>{task.difficulty}</span></td>
                  <td className="p-5 font-mono font-bold text-lg">{task.duration}h</td>
                  <td className="p-5"><button onClick={() => setTasks(tasks.filter((t) => t.id !== task.id))} className="text-red-500/80 hover:text-red-500 text-xs font-bold uppercase tracking-widest transition-colors bg-red-500/10 px-3 py-1.5 rounded-md">Drop</button></td>
                </tr>
              ))}
            </tbody>
          </table>
          {tasks.length === 0 && <div className={`text-center py-12 ${theme.textMuted} font-medium text-sm`}>No targets set. Planning is the first step to clearing CA.</div>}
        </div>
      </div>

      {showAddTaskModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-md flex items-center justify-center z-[100] p-4 animate-in fade-in zoom-in-95 duration-300">
          <div className={`${theme.cardSolid} rounded-3xl p-8 max-w-lg w-full shadow-2xl border border-white/10`}>
            <h3 className="text-2xl font-bold mb-6 flex items-center gap-3"><BookOpen size={24} className="text-blue-500" /> Create Target</h3>
            <form onSubmit={handleAddTask} className="space-y-5">
              <div className="grid grid-cols-2 gap-5">
                <div><label className={`text-[10px] font-bold uppercase tracking-widest mb-2 block ${theme.textMuted}`}>Subject</label><input type="text" value={newTask.subject} onChange={(e) => setNewTask({ ...newTask, subject: e.target.value })} className={`w-full rounded-xl p-3 text-sm font-medium outline-none ${theme.input}`} required placeholder="e.g. Audit" /></div>
                <div><label className={`text-[10px] font-bold uppercase tracking-widest mb-2 block ${theme.textMuted}`}>Topic</label><input type="text" value={newTask.topic} onChange={(e) => setNewTask({ ...newTask, topic: e.target.value })} className={`w-full rounded-xl p-3 text-sm font-medium outline-none ${theme.input}`} required placeholder="e.g. SA 500" /></div>
              </div>
              <div className="grid grid-cols-3 gap-5">
                <div><label className={`text-[10px] font-bold uppercase tracking-widest mb-2 block ${theme.textMuted}`}>Hours</label><input type="number" step="0.5" min="0.5" value={newTask.duration} onChange={(e) => setNewTask({ ...newTask, duration: Number(e.target.value) })} className={`w-full rounded-xl p-3 text-sm font-medium outline-none ${theme.input}`} required /></div>
                <div><label className={`text-[10px] font-bold uppercase tracking-widest mb-2 block ${theme.textMuted}`}>Level</label><select value={newTask.difficulty} onChange={(e) => setNewTask({ ...newTask, difficulty: e.target.value })} className={`w-full rounded-xl p-3 text-sm font-medium outline-none ${theme.input}`}><option>Hard</option><option>Medium</option><option>Easy</option></select></div>
                <div><label className={`text-[10px] font-bold uppercase tracking-widest mb-2 block ${theme.textMuted}`}>Block</label><select value={newTask.timeOfDay} onChange={(e) => setNewTask({ ...newTask, timeOfDay: e.target.value })} className={`w-full rounded-xl p-3 text-sm font-medium outline-none ${theme.input}`}><option>Morning</option><option>Afternoon</option><option>Night</option></select></div>
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

  // --- CRASH-FREE SAFE ANALOG CLOCK ---
  const renderAnalogClock = () => {
    const safeTime = Number(timeLeft) || 0;
    const m = Math.floor(safeTime / 60);
    const s = safeTime % 60;
    const minDegree = (m * 6) + (s * 0.1);
    const secDegree = s * 6;
    
    return (
      <div className="relative flex flex-col items-center justify-center mb-10 w-full">
        <svg width="240" height="240" viewBox="0 0 100 100" className="drop-shadow-2xl mx-auto">
          <circle cx="50" cy="50" r="48" fill={isLightMode ? '#ffffff' : '#0f172a'} stroke={isLightMode ? '#e2e8f0' : '#1e293b'} strokeWidth="1.5" />
          {[...Array(12)].map((_, i) => (
            <line key={i} x1="50" y1="6" x2="50" y2={i % 3 === 0 ? "12" : "9"} stroke={isLightMode ? '#cbd5e1' : '#475569'} strokeWidth={i % 3 === 0 ? "2" : "1"} transform={`rotate(${i * 30} 50 50)`} />
          ))}
          <line x1="50" y1="50" x2="50" y2="20" stroke={isLightMode ? '#334155' : '#e2e8f0'} strokeWidth="2.5" strokeLinecap="round" transform={`rotate(${minDegree} 50 50)`} />
          <line x1="50" y1="50" x2="50" y2="15" stroke="#ef4444" strokeWidth="1" strokeLinecap="round" transform={`rotate(${secDegree} 50 50)`} />
          <circle cx="50" cy="50" r="3.5" fill="#3b82f6" />
        </svg>
        <div className={`absolute bottom-[-10px] px-3 py-1 rounded-lg border backdrop-blur-md text-sm font-mono font-bold tracking-widest shadow-lg ${isLightMode ? 'bg-white/80 border-slate-200 text-slate-800' : 'bg-black/40 border-white/10 text-white'}`}>
          {formatTime(safeTime)}
        </div>
      </div>
    );
  };

  const renderTimer = () => (
    <div ref={timerRef} className={`h-full flex flex-col items-center justify-center relative transition-all duration-300 animate-in fade-in ${isFullScreen ? (isLightMode ? 'bg-[#FAFAFA]' : 'bg-[#09090B]') : ''}`}>
      <audio ref={audioRef} /> 
      
      <button onClick={toggleFullScreen} className={`absolute top-6 right-6 p-2.5 rounded-xl transition-all ${isLightMode ? 'text-slate-500 hover:bg-white shadow-sm' : 'text-slate-400 hover:bg-white/10'}`} title={isFullScreen ? "Exit Fullscreen" : "Go Fullscreen"}>
        {isFullScreen ? <Minimize size={24} /> : <Maximize size={24} />}
      </button>

      <div className="text-center w-full max-w-xl px-4">
        
        {/* GUARANTEED SOUNDS (ARCHIVE.ORG) */}
        <div className={`flex justify-center items-center gap-3 mb-8`}>
          {[
            { id: 'rain', icon: <CloudRain size={16} />, label: 'Rain', url: 'https://ia800109.us.archive.org/24/items/RainSounds10HoursAndNightThunderstorm1/Rain%20Sounds%2010%20Hours%20and%20Night%20Thunderstorm%201.mp3' },
            { id: 'forest', icon: <Trees size={16} />, label: 'Nature', url: 'https://ia800500.us.archive.org/15/items/forest-birds_202104/forest-birds.mp3' },
            { id: 'waves', icon: <Waves size={16} />, label: 'Waves', url: 'https://ia802504.us.archive.org/30/items/OceanWaves_447/OceanWaves.mp3' }
          ].map(sound => (
            <button 
              key={sound.id}
              onClick={() => toggleSound(sound.id, sound.url)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all border ${activeSound === sound.id ? 'bg-blue-500/10 text-blue-500 border-blue-500/50 shadow-sm' : `${isLightMode ? 'bg-white border-slate-200 text-slate-500' : 'bg-black/20 border-white/5 text-zinc-400'}`}`}
            >
              {sound.icon} {sound.label}
            </button>
          ))}
        </div>

        <h2 className={`text-xs font-bold mb-6 uppercase tracking-[0.3em] ${theme.textMuted}`}>
          {timerMode === 'pomodoro' ? 'Deep Focus Session' : 'Strict Break'}
        </h2>
        
        <div className={`flex justify-center items-center gap-1.5 mb-8 p-1 rounded-xl border w-fit mx-auto backdrop-blur-md ${isLightMode ? 'bg-slate-100 border-slate-200' : 'bg-black/20 border-white/5'}`}>
          <button onClick={() => setTimerDisplayType('digital')} className={`flex items-center gap-2 px-5 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${timerDisplayType === 'digital' ? 'bg-white text-slate-900 shadow-sm dark:bg-zinc-800 dark:text-white' : theme.textMuted}`}>
            <TimerIcon size={16} /> Digital
          </button>
          <button onClick={() => setTimerDisplayType('analog')} className={`flex items-center gap-2 px-5 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${timerDisplayType === 'analog' ? 'bg-white text-slate-900 shadow-sm dark:bg-zinc-800 dark:text-white' : theme.textMuted}`}>
            <Clock size={16} /> Analog
          </button>
        </div>

        {!isActive && !isFullScreen && (
          <div className="flex justify-center gap-8 mb-8">
            <div className="flex flex-col items-center">
              <label className={`text-[10px] mb-2 font-bold uppercase tracking-widest ${theme.textMuted}`}>Work (Min)</label>
              <input type="number" value={workDuration} onChange={(e) => { const v = e.target.value; setWorkDuration(v); if(timerMode==='pomodoro') setTimeLeft((Number(v)||0)*60);}} className={`w-20 text-center rounded-xl p-2.5 font-mono text-lg font-bold shadow-inner ${theme.input}`} />
            </div>
            <div className="flex flex-col items-center">
              <label className={`text-[10px] mb-2 font-bold uppercase tracking-widest ${theme.textMuted}`}>Break (Min)</label>
              <input type="number" value={breakDuration} onChange={(e) => { const v = e.target.value; setBreakDuration(v); if(timerMode==='shortBreak') setTimeLeft((Number(v)||0)*60);}} className={`w-20 text-center rounded-xl p-2.5 font-mono text-lg font-bold shadow-inner ${theme.input}`} />
            </div>
          </div>
        )}

        {timerDisplayType === 'digital' ? (
          <div className={`text-[6rem] md:text-[9rem] font-bold font-mono tracking-tighter leading-none mb-12 drop-shadow-xl transition-colors duration-500 ${timerMode === 'shortBreak' ? 'text-emerald-500 drop-shadow-[0_0_30px_rgba(16,185,129,0.3)]' : isActive ? (isLightMode ? 'text-slate-900' : 'text-white drop-shadow-[0_0_40px_rgba(255,255,255,0.15)]') : theme.textMuted}`}>
            {formatTime(timeLeft)}
          </div>
        ) : renderAnalogClock()}
        
        <div className="flex justify-center items-center gap-6 mb-10">
          <button onClick={() => { setIsActive(false); setTimeLeft(timerMode === 'pomodoro' ? (Number(workDuration)||50) * 60 : (Number(breakDuration)||10) * 60); }} className={`w-14 h-14 rounded-full flex items-center justify-center transition-all border ${isLightMode ? 'bg-white border-slate-200 hover:bg-slate-50 text-slate-600' : 'bg-white/5 border-white/10 hover:bg-white/10 text-white'}`} title="Reset Timer">
            <RotateCcw size={20} />
          </button>

          <button onClick={() => setIsActive(!isActive)} className={`w-24 h-24 rounded-full flex items-center justify-center transition-all duration-300 shadow-xl ${isActive ? 'bg-amber-500/10 text-amber-500 border-2 border-amber-500/50 hover:bg-amber-500/20' : 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white hover:scale-105 shadow-[0_0_30px_rgba(59,130,246,0.4)]'}`}>
            {isActive ? <Pause size={32} /> : <Play size={32} className="ml-2" />}
          </button>

          <button onClick={handleStopSession} className={`w-14 h-14 rounded-full flex items-center justify-center transition-all border ${isLightMode ? 'bg-red-50 border-red-200 hover:bg-red-50' : 'bg-red-500/10 border-red-500/30 hover:bg-red-500/20 text-red-500'}`} title="Stop & Log Time">
            <StopCircle size={24} />
          </button>
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
        <div className="fixed inset-0 bg-black/50 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
          <div className={`${theme.cardSolid} rounded-3xl p-10 max-w-sm w-full text-center shadow-2xl border border-white/10`}>
            <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-5 text-blue-500"><TimerIcon size={32} /></div>
            <h3 className="text-2xl font-bold mb-3">Session Complete</h3>
            <p className={`text-xs font-medium mb-8 ${theme.textMuted}`}>Be honest with yourself. How was your focus?</p>
            <div className="space-y-3">
              <button onClick={() => logSessionResult('completed')} className="w-full py-4 bg-emerald-500/10 text-emerald-500 border border-emerald-500/30 hover:bg-emerald-500/20 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all"><CheckCircle size={18} /> 100% Focused</button>
              <button onClick={() => logSessionResult('partial')} className="w-full py-4 bg-amber-500/10 text-amber-500 border border-amber-500/30 hover:bg-amber-500/20 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all"><AlertTriangle size={18} /> Partially Distracted</button>
              <button onClick={() => logSessionResult('failed')} className="w-full py-4 bg-red-500/10 text-red-500 border border-red-500/30 hover:bg-red-500/20 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all"><XCircle size={18} /> Wasted (0 Output)</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderMentor = () => (
    <div className={`flex flex-col h-[calc(100vh-6rem)] ${theme.cardSolid} rounded-3xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 shadow-xl`}>
      <div className={`p-5 ${isLightMode ? 'bg-slate-50/80 border-b border-slate-200' : 'bg-black/20 border-b border-white/5'} flex items-center justify-between backdrop-blur-xl`}>
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-white shadow-[0_0_15px_rgba(59,130,246,0.3)]"><BrainCircuit size={24} /></div>
          <div><h3 className="font-bold text-lg">Expert CA Mentor</h3><p className={`text-[10px] font-bold uppercase tracking-widest mt-0.5 ${theme.textMuted}`}>Powered by Audit Cubicles</p></div>
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
      <form onSubmit={handleChatSubmit} className={`p-5 ${isLightMode ? 'bg-slate-50/80 border-t border-slate-200' : 'bg-black/40 border-t border-white/5'} flex gap-3 backdrop-blur-2xl`}>
        <input type="text" value={chatInput} onChange={(e) => setChatInput(e.target.value)} placeholder="Ask technical doubts, request strategies, or get motivation..." className={`flex-1 ${theme.input} rounded-xl px-5 py-3.5 text-sm font-medium outline-none shadow-inner`} />
        <button type="submit" className="bg-gradient-to-br from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white px-6 rounded-xl transition-all shadow-[0_0_15px_rgba(59,130,246,0.3)] font-bold"><Send size={20} /></button>
      </form>
    </div>
  );

  const renderAnalytics = () => {
    const todayStr = new Date().toISOString().split('T')[0];
    const yesterday = new Date(); yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];
    
    const hrsToday = studyHistory[todayStr] || hoursStudiedToday || 0;
    const hrsYesterday = studyHistory[yesterdayStr] || 0;

    const last7Days = [];
    let weekTotal = 0;
    for (let i = 6; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i);
      const ds = d.toISOString().split('T')[0];
      const hrs = studyHistory[ds] || (i === 0 ? hoursStudiedToday : 0);
      weekTotal += Number(hrs);
      last7Days.push({ day: d.toLocaleDateString('en-US', { weekday: 'short' }), hours: Number(hrs).toFixed(1), raw: Number(hrs) });
    }
    const maxChartHrs = Math.max(...last7Days.map(d => d.raw), 10); 

    return (
      <div className="space-y-6 animate-in fade-in duration-500">
        <div><h2 className="text-2xl font-bold tracking-tight mb-1">Performance Analytics</h2><p className={`text-sm ${theme.textMuted}`}>Track your deep focus hours and consistency.</p></div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className={`${theme.card} p-5 rounded-2xl`}><div className={`text-[10px] font-bold uppercase tracking-widest mb-2 ${theme.textMuted}`}>Today</div><div className="text-3xl font-black text-blue-500 drop-shadow-sm">{Number(hrsToday).toFixed(1)}h</div></div>
          <div className={`${theme.card} p-5 rounded-2xl`}><div className={`text-[10px] font-bold uppercase tracking-widest mb-2 ${theme.textMuted}`}>Yesterday</div><div className="text-3xl font-black">{Number(hrsYesterday).toFixed(1)}h</div></div>
          <div className={`${theme.card} p-5 rounded-2xl`}><div className={`text-[10px] font-bold uppercase tracking-widest mb-2 ${theme.textMuted}`}>Last 7 Days</div><div className="text-3xl font-black text-emerald-500 drop-shadow-sm">{weekTotal.toFixed(1)}h</div></div>
          <div className={`${theme.card} p-5 rounded-2xl`}><div className={`text-[10px] font-bold uppercase tracking-widest mb-2 ${theme.textMuted}`}>Daily Avg</div><div className="text-3xl font-black">{(weekTotal / 7).toFixed(1)}h</div></div>
        </div>

        <div className={`${theme.cardSolid} rounded-3xl p-8 mt-6 border border-white/10 shadow-xl`}>
          <h3 className="font-bold text-sm mb-8 flex items-center gap-2 uppercase tracking-widest"><BarChart2 size={18} className="text-blue-500"/> 7-Day Focus Trend</h3>
          <div className="flex items-end justify-between h-56 gap-3 pt-4">
            {last7Days.map((data, idx) => {
              const heightPercent = (data.raw / maxChartHrs) * 100;
              return (
                <div key={idx} className="flex flex-col items-center flex-1 group">
                  <div className={`text-xs font-mono font-bold mb-2 opacity-0 group-hover:opacity-100 transition-opacity ${theme.textMuted}`}>{data.hours}</div>
                  <div className={`w-full max-w-[48px] rounded-t-xl transition-all duration-700 ${idx === 6 ? 'bg-gradient-to-t from-blue-600 to-cyan-400 shadow-[0_0_15px_rgba(56,189,248,0.5)]' : isLightMode ? 'bg-slate-200 hover:bg-slate-300' : 'bg-white/10 hover:bg-white/20'}`} style={{ height: `${heightPercent}%`, minHeight: '5px' }}></div>
                  <div className={`text-[10px] font-bold uppercase tracking-wider mt-4 ${idx === 6 ? 'text-blue-500' : theme.textMuted}`}>{data.day}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

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
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
        <div><h2 className="text-3xl font-bold mb-2">Faculty Notes Vault</h2><p className={`font-medium text-sm ${theme.textMuted}`}>Top CA faculty materials & summaries in one place.</p></div>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {notes.map((n, i) => (
            <a key={i} href={n.link} target="_blank" rel="noreferrer" className={`${theme.cardSolid} p-6 rounded-3xl transition-all transform hover:-translate-y-1 hover:shadow-xl ${n.glow} flex flex-col items-center text-center gap-4 group border border-white/5`}>
              <div className="text-5xl mb-1 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3 drop-shadow-md">{n.icon}</div>
              <h3 className="font-bold text-sm leading-tight">{n.name}</h3>
              <div className={`mt-2 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest flex items-center gap-2 ${isLightMode ? 'bg-blue-50 text-blue-600' : 'bg-blue-500/10 text-blue-400'} group-hover:bg-blue-500 group-hover:text-white transition-all`}>Open Drive <FolderOpen size={14} /></div>
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
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
        <div><h2 className="text-3xl font-bold mb-2">Past Papers & MTPs</h2><p className={`font-medium text-sm ${theme.textMuted}`}>Direct access to subject-wise question banks.</p></div>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {papers.map((p, i) => (
            <a key={i} href={p.link} target="_blank" rel="noreferrer" className={`${theme.cardSolid} p-6 rounded-3xl transition-all transform hover:-translate-y-1 hover:shadow-xl flex flex-col items-center text-center gap-4 group border border-white/5`}>
              <div className="text-5xl mb-1 transition-transform duration-500 group-hover:scale-110 drop-shadow-md">{p.icon}</div>
              <h3 className="font-bold text-sm leading-tight">{p.name}</h3>
              <div className={`mt-2 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest flex items-center gap-2 ${isLightMode ? 'bg-indigo-50 text-indigo-600' : 'bg-indigo-500/10 text-indigo-400'} group-hover:bg-indigo-500 group-hover:text-white transition-colors`}>Open Bank <ExternalLink size={14} /></div>
            </a>
          ))}
        </div>
      </div>
    );
  };

  const renderQuickNotes = () => (
    <div className="space-y-6 overflow-y-auto max-h-[75vh] p-2 text-left animate-in fade-in slide-in-from-bottom-4">
      <div className={`p-8 ${theme.cardSolid} rounded-3xl shadow-xl border border-white/10`}>
        <div className="flex items-center gap-4 mb-6">
          <div className="p-3 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl shadow-[0_0_15px_rgba(245,158,11,0.4)] text-white"><FileText size={22} /></div>
          <div>
            <h3 className="font-bold text-xl uppercase tracking-widest">Quick Study Notes</h3>
            <p className={`text-xs font-medium mt-1 ${theme.textMuted}`}>Draft temporary notes, auto-saved in browser.</p>
          </div>
        </div>
        <textarea
          className={`w-full h-[50vh] p-5 rounded-2xl outline-none resize-none text-sm font-medium leading-relaxed ${theme.input} shadow-inner`}
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
      
      {/* SIDEBAR */}
      <aside className={`w-64 border-r flex flex-col hidden md:flex transition-all duration-500 ${theme.sidebar} z-10`}>
        <div className={`p-6 border-b flex flex-col items-start ${isLightMode ? 'border-slate-200' : 'border-white/5'}`}>
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center font-bold text-lg text-white shadow-[0_0_15px_rgba(59,130,246,0.4)]">CA</div>
            <span className="font-bold text-xl tracking-wide">Sathi.ai</span>
          </div>
          <div className="w-full text-left pl-3 border-l-2 border-blue-500 rounded-sm">
            <p className={`text-[9px] uppercase tracking-[0.2em] font-bold leading-none mb-1.5 ${theme.textMuted}`}>Architected By</p>
            <p className="text-xs font-bold text-blue-500 tracking-wide">Niket Talwar</p>
          </div>
        </div>
        
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto scrollbar-hide">
          {[
            { id: 'dashboard', name: 'Dashboard', icon: <LayoutDashboard size={20} /> },
            { id: 'planner', name: 'Study Planner', icon: <Calendar size={20} /> },
            { id: 'timer', name: 'Focus Timer', icon: <TimerIcon size={20} /> },
            { id: 'mentor', name: 'Expert Mentor', icon: <BrainCircuit size={20} /> },
            { id: 'analytics', name: 'Analytics', icon: <BarChart2 size={20} /> },
            { id: 'faculty_notes', name: 'Faculty Notes', icon: <FolderOpen size={20} /> },
            { id: 'past_papers', name: 'Past Papers', icon: <Library size={20} /> },
            { id: 'quick_notes', name: 'Quick Notes', icon: <FileText size={20} /> },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                activeTab === item.id ? theme.activeTab : theme.hoverTab
              }`}
            >
              {item.icon}
              <span className="font-medium text-sm tracking-wide">{item.name}</span>
            </button>
          ))}
        </nav>

        {/* Theme Toggle Button */}
        <div className={`p-5 border-t ${isLightMode ? 'border-slate-200' : 'border-white/5'}`}>
          <button 
            onClick={() => setIsLightMode(!isLightMode)}
            className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl transition-all font-bold text-xs uppercase tracking-widest ${isLightMode ? 'bg-slate-100 text-slate-600 hover:bg-slate-200' : 'bg-white/5 text-gray-300 hover:bg-white/10'}`}
          >
            {isLightMode ? <Moon size={16} /> : <Sun size={16} />}
            {isLightMode ? 'Dark Mode' : 'Light Mode'}
          </button>
        </div>
      </aside>

      {/* DYNAMIC CONTENT AREA */}
      <main className="flex-1 relative overflow-y-auto scrollbar-hide">
        <div className="max-w-5xl mx-auto h-full p-8 pb-32">
          {activeTab === 'dashboard' && renderDashboard()}
          {activeTab === 'planner' && renderPlanner()}
          {activeTab === 'timer' && renderTimer()}
          {activeTab === 'mentor' && renderMentor()}
          {activeTab === 'analytics' && renderAnalytics()}
          {activeTab === 'faculty_notes' && renderFacultyNotes()}
          {activeTab === 'past_papers' && renderPastPapers()}
          {activeTab === 'quick_notes' && renderQuickNotes()}
        </div>
      </main>

      {/* SMART TOAST NOTIFICATION */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-5 fade-in duration-300">
          <div className={`${theme.cardSolid} border shadow-2xl rounded-2xl p-4 flex items-center gap-4 max-w-sm`}>
            <div className="p-2.5 bg-blue-500/10 text-blue-500 rounded-xl shadow-inner">{toastIcon || <Bell size={20} />}</div>
            <p className={`text-sm font-bold leading-snug ${theme.text}`}>{toastMessage}</p>
          </div>
        </div>
      )}
      
    </div>
  );
}