import React, { useState, useEffect, useRef } from 'react';
import {
  LayoutDashboard, CalendarCheck, Timer as TimerIcon, MessageSquare, TrendingUp, BookOpen,
  AlertTriangle, CheckCircle, XCircle, Play, Pause, RotateCcw, Send, Flame, Calendar,
  BrainCircuit, Target, FileText, Sun, Moon, Maximize, Minimize, Library, ExternalLink, 
  FolderOpen, StopCircle, Clock, BarChart2, Bell, Zap, Headphones, Trophy, EyeOff, MoonStar
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

// --- CA MOTIVATIONAL QUOTES ---
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
  const [targetHours, setTargetHours] = useLocalStorage('ca-targetHours', 10);
  const [hoursStudiedToday, setHoursStudiedToday] = useLocalStorage('ca-hoursToday', 0);
  const [streak, setStreak] = useLocalStorage('ca-streak', 0);
  const [studyHistory, setStudyHistory] = useLocalStorage('ca-study-history', {}); 
  const [subjectMastery, setSubjectMastery] = useLocalStorage('ca-subject-mastery', {}); // Subject stats tracking
  
  // Brain Dump and Goal States
  const [eodTargets, setEodTargets] = useLocalStorage('ca-eod-targets', ['', '', '']);
  const [yesterdaysBrainDump, setYesterdaysBrainDump] = useLocalStorage('ca-yesterday-targets', ['', '', '']);
  const [showEODModal, setShowEODModal] = useState(false);

  const [tasks, setTasks] = useLocalStorage('ca-tasks', []);
  const [chatHistory, setChatHistory] = useLocalStorage('ca-chat', [
    { sender: 'mentor', text: "Welcome to CA Sathi. I am your Expert Mentor. Ask me any CA Final doubts or let's plan your schedule.", time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) },
  ]);
  const [chatInput, setChatInput] = React.useState('');
  const [toastMessage, setToastMessage] = useState(null); 
  const [toastIcon, setToastIcon] = useState(null);
  const toastTimerRef = useRef(null);
  
  // Timer & Sound State
  const [workDuration, setWorkDuration] = useLocalStorage('ca-work-duration', 50);
  const [breakDuration, setBreakDuration] = useLocalStorage('ca-break-duration', 10);
  const [timerMode, setTimerMode] = useState('pomodoro');
  const [timeLeft, setTimeLeft] = useState(Number(workDuration) * 60 || 3000);
  const [isActive, setIsActive] = useState(false);
  const [showSessionLog, setShowSessionLog] = useState(false);
  const [timerDisplayType, setTimerDisplayType] = useLocalStorage('ca-timer-display', 'digital'); 
  const [isLofiPlaying, setIsLofiPlaying] = useState(false); 
  const [isZenMode, setIsZenMode] = useState(false); 
  
  const lofiRef = useRef(null);
  const timerRef = useRef(null);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [showAddTaskModal, setShowAddTaskModal] = React.useState(false);
  const [newTask, setNewTask] = React.useState({ subject: '', topic: '', duration: 2, difficulty: 'Medium', timeOfDay: 'Morning' });

  // --- ENGINE: STREAK & MIDNIGHT RESET ---
  useEffect(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    const lastLogin = localStorage.getItem('ca-lastLogin');

    if (lastLogin !== todayStr) {
      // EOD Ritual Check
      setYesterdaysBrainDump(eodTargets);
      setEodTargets(['', '', '']);
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

  // --- HOURLY QUOTES ---
  useEffect(() => {
    const quoteInterval = setInterval(() => {
      const randomQuote = motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)];
      triggerToast(randomQuote, <Zap size={18} className="text-yellow-500" />);
    }, 3600000); 
    return () => clearInterval(quoteInterval);
  }, []);

  const rawDaysLeft = examDate ? Math.ceil((new Date(examDate) - new Date()) / (1000 * 60 * 60 * 24)) : 0;
  const daysLeft = Math.max(1, rawDaysLeft);
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

  // --- RELIABLE AUDIO PLAYER ---
  const toggleLofi = () => {
    if (!lofiRef.current) return;
    if (isLofiPlaying) { lofiRef.current.pause(); setIsLofiPlaying(false); } 
    else { lofiRef.current.play().then(() => setIsLofiPlaying(true)).catch(e => {
        triggerToast("Browser blocked sound. Please press Play again.", <AlertTriangle size={18}/>);
    }); }
  };

  const triggerToast = (msg, icon = <Bell size={18} />) => {
    setToastMessage(msg); setToastIcon(icon);
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => setToastMessage(null), 15000); 
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
    setStudyHistory(prev => ({ ...prev, [todayStr]: (prev[todayStr] || 0) + hoursToAdd }));
  };

  const handleSessionComplete = () => {
    if (isZenMode) setIsZenMode(false); 
    if (timerMode === 'pomodoro') { setShowSessionLog(true); safeExitFullscreen(); } 
    else { setTimerMode('pomodoro'); setTimeLeft((Number(workDuration) || 50) * 60); triggerToast('Break over. Back to your books.'); }
  };

  const handleStopSession = () => {
    setIsActive(false);
    if (isZenMode) setIsZenMode(false);
    const safeWorkDur = Number(workDuration) || 50;
    const totalPlanned = timerMode === 'pomodoro' ? safeWorkDur * 60 : (Number(breakDuration) || 10) * 60;
    const secondsStudied = totalPlanned - timeLeft;
    
    if (timerMode === 'pomodoro' && secondsStudied > 0) {
      const added = secondsStudied / 3600; 
      setHoursStudiedToday(prev => prev + added); saveToHistory(added);
      if ((hoursStudiedToday + added) >= safeTarget && hoursStudiedToday < safeTarget) {
        setStreak(prev => prev + 1); localStorage.setItem('ca-lastTargetHit', new Date().toISOString().split('T')[0]);
        triggerToast("Target Hit! Streak Maintained 🔥", <Trophy size={18}/>);
      }
      triggerToast(`Saved ${(secondsStudied / 60).toFixed(1)} mins.`);
    }
    setTimerMode('pomodoro'); setTimeLeft(safeWorkDur * 60); setShowSessionLog(false); safeExitFullscreen(); 
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
      triggerToast("Session logged perfectly. Good focus.");
      setTimerMode('shortBreak'); setTimeLeft((Number(breakDuration) || 10) * 60); setIsActive(true);
    } else if (status === 'partial') { triggerToast('Partial session logged. Avoid distractions.'); }
  };

  const handleChatSubmit = async (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    const userText = chatInput;
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
      setChatHistory((prev) => [...prev, { sender: 'mentor', text: aiReply, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
      triggerToast("New message from Expert Mentor", <MessageSquare size={18}/>);
    } catch (error) {
      setChatHistory((prev) => [...prev, { sender: 'mentor', text: "Connection error.", time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
    }
  };

  const handleAddTask = (e) => {
    e.preventDefault();
    if (!newTask.subject || !newTask.topic) return;
    setTasks([...tasks, { ...newTask, id: Date.now(), status: 'pending' }]);
    setShowAddTaskModal(false);
    setNewTask({ subject: '', topic: '', duration: 2, difficulty: 'Medium', timeOfDay: 'Morning' });
  };

  // GAMIFICATION LOGIC
  const toggleTaskStatus = (id) => {
    setTasks(tasks.map((t) => {
      if (t.id === id) {
        const newStatus = t.status === 'pending' ? 'completed' : t.status === 'completed' ? 'partial' : 'pending';
        // Add to subject mastery
        if (newStatus === 'completed' && t.status !== 'completed') {
          const subj = t.subject.toUpperCase();
          setSubjectMastery(prev => ({ ...prev, [subj]: (prev[subj] || 0) + 1 }));
          triggerToast(`Task completed! +1 to ${t.subject} mastery.`, <Trophy size={18} className="text-yellow-500" />);
        }
        return { ...t, status: newStatus };
      }
      return t;
    }));
  };

  // --- RENDER FUNCTIONS ---
  const renderDashboard = () => {
    const hasYesterdaysDump = yesterdaysBrainDump.some(t => t.trim() !== '');

    const countdownOrb = (
      <div className={`p-8 ${theme.cardSolid} rounded-[2rem] border border-white/5 flex flex-col items-center gap-6 text-center`}>
        <h2 className="text-red-500 font-bold tracking-[0.2em] text-[10px] uppercase drop-shadow-sm whitespace-nowrap">Mission CA Final</h2>
        <div className="relative w-40 h-40 flex items-center justify-center rounded-full bg-slate-900 border-[20px] border-slate-800 shadow-[0_0_50px_rgba(255,255,255,0.05),_inset_0_0_30px_rgba(255,255,255,0.02)]">
          <svg viewBox="0 0 36 36" className="absolute inset-0 w-full h-full transform -rotate-90">
            <path className="text-red-950/30" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" />
            <path className="text-red-500 drop-shadow-[0_0_5px_rgba(239,68,68,0.7)]" strokeDasharray={`${Math.min(100, (daysLeft/120)*100)}, 100`} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
          </svg>
          <div className="flex flex-col items-baseline gap-1">
            <span className={`text-6xl font-black tracking-tighter ${isLightMode ? 'text-slate-900' : 'text-white'}`}>{daysLeft}</span>
            <span className={`text-[10px] ${theme.textMuted} font-medium uppercase tracking-widest`}>Days Left</span>
          </div>
        </div>
        <p className={`text-sm font-medium leading-relaxed ${isLightMode ? 'text-red-700' : 'text-red-200/90'} max-w-xs`}>"{motivationalQuotes[0]}"</p>
      </div>
    );

    const adjustGoals = (
      <div className={`flex flex-col gap-6`}>
        <div className={`backdrop-blur-2xl p-6 rounded-2xl border ${isLightMode ? 'bg-white/50 border-white/40 shadow-sm' : 'bg-white/5 border-white/10 shadow-lg'}`}>
          <div className={`text-[10px] font-bold uppercase tracking-widest ${theme.textMuted} mb-3`}>Edit Target Date</div>
          <input type="date" value={examDate} onChange={(e) => setExamDate(e.target.value)} className={`${theme.input} w-full rounded-xl px-4 py-3 font-mono text-sm focus:outline-none cursor-pointer`} />
        </div>
        <div className={`backdrop-blur-2xl p-6 rounded-2xl border ${isLightMode ? 'bg-white/50 border-white/40 shadow-sm' : 'bg-white/5 border-white/10 shadow-lg'}`}>
          <div className={`text-[10px] font-bold uppercase tracking-widest ${theme.textMuted} mb-3`}>Edit Daily Hrs Goal</div>
          <input type="number" min="1" max="24" value={targetHours} onChange={(e) => setTargetHours(e.target.value)} className={`${theme.input} w-full rounded-xl px-4 py-3 font-mono text-sm focus:outline-none cursor-pointer`} />
        </div>
      </div>
    );

    const actionCenter = (
      <div className={`relative p-8 ${theme.cardSolid} rounded-[2rem] border border-white/5 flex flex-col justify-between`}>
        <div>
          <h3 className="text-xl font-bold flex items-center gap-2.5 mb-2"><MoonStar className="text-blue-500" size={24} /> EOD Ritual</h3>
          <p className={`text-xs font-medium ${theme.textMuted} leading-relaxed max-w-sm mb-6`}>Log your session output, set tomorrow's top 3 targets, and clear your headspace.</p>
          <ul className="space-y-2.5">
            {eodTargets.some(t => t.trim() !== '') ? eodTargets.filter(t => t.trim() !== '').map((t, idx) => (
                <li key={idx} className={`text-sm font-semibold flex items-center gap-2.5 ${theme.text}`}><Zap className="text-yellow-500" size={16}/> {t}</li>
            )) : <p className="text-sm font-medium text-slate-500">Tomorrow's targets not set yet.</p>}
          </ul>
        </div>
        <button onClick={() => setShowEODModal(true)} className="w-full py-4.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl shadow-lg shadow-blue-500/20 font-bold text-sm transition-all transform hover:scale-105 flex items-center justify-center gap-2 mt-8">
            <Send size={18} /> End Day & Brain Dump
        </button>
      </div>
    );

    return (
      <div className="space-y-10 animate-in fade-in duration-500">
        
        {/* NEW 3-CARD LAYOUT OVERHAUL */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {countdownOrb}
            {adjustGoals}
            {actionCenter}
        </div>

        {/* YESTERDAY'S BRAIN DUMP DISPLAY */}
        {hasYesterdaysDump && (
          <div className={`${theme.card} p-8 rounded-3xl`}>
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold flex items-center gap-3"><FileText size={22} className="text-emerald-500" /> Imported Brain Dump</h3>
                <button onClick={() => setYesterdaysBrainDump(['','',''])} className="text-xs font-bold text-slate-400 hover:text-red-500 transition-colors uppercase tracking-widest bg-black/10 px-3 py-1.5 rounded-lg">Clear List</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {yesterdaysBrainDump.filter(t => t.trim() !== '').map((t, idx) => (
                  <div key={idx} className={`${theme.cardSolid} rounded-xl p-5 border border-emerald-500/20 shadow-lg shadow-emerald-500/5`}>
                      <div className="text-[10px] font-bold uppercase tracking-widest text-emerald-500 mb-2.5">Task {idx+1}</div>
                      <div className={`text-sm font-semibold ${theme.text}`}>{t}</div>
                  </div>
              ))}
            </div>
          </div>
        )}

        {/* Float Stat Cards */}
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

        {/* EOD MODAL */}
        {showEODModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xl flex items-center justify-center z-[200] p-4 animate-in fade-in">
            <div className={`${theme.cardSolid} rounded-[2rem] p-10 max-w-md w-full shadow-2xl border border-white/20`}>
              <h3 className="text-3xl font-black mb-2 flex items-center gap-3"><MoonStar size={28} className="text-blue-500" /> End Day Dump</h3>
              <p className={`text-sm font-medium mb-8 ${theme.textMuted}`}>Log your final study session, empty your headspace. Write tomorrow's top 3 targets.</p>
              
              <div className="space-y-4 mb-8">
                {[0, 1, 2].map((i) => (
                  <input key={i} type="text" value={eodTargets[i]} onChange={(e) => { const newTargets = [...eodTargets]; newTargets[i] = e.target.value; setEodTargets(newTargets); }} placeholder={`Target ${i+1}`} className={`w-full rounded-xl p-4 text-sm font-semibold outline-none ${theme.input}`} />
                ))}
              </div>

              <div className="flex gap-4">
                <button onClick={() => setShowEODModal(false)} className={`flex-1 py-3.5 rounded-xl font-bold text-sm transition-colors ${isLightMode ? 'bg-slate-100 text-slate-700' : 'bg-white/5 text-slate-300'}`}>Cancel</button>
                <button onClick={() => { setShowEODModal(false); triggerToast("Targets saved! Have a good sleep.", <MoonStar size={18}/>); }} className="flex-1 py-3.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-sm shadow-lg shadow-blue-500/30 transition-all">Save & Sleep</button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderTimer = () => {
    // --- ULTRA ZEN MODE ---
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

          {showSessionLog && (
            <div className="fixed inset-0 bg-black/80 backdrop-blur-2xl flex items-center justify-center z-[300] p-4 animate-in fade-in">
              <div className="bg-[#111] rounded-3xl p-10 max-w-sm w-full text-center border border-white/20">
                <h3 className="text-2xl font-bold mb-8">Session Complete</h3>
                <div className="space-y-4">
                  <button onClick={() => logSessionResult('completed')} className="w-full py-4 bg-emerald-500/20 text-emerald-500 border border-emerald-500/30 rounded-xl font-bold">100% Focused</button>
                  <button onClick={() => logSessionResult('partial')} className="w-full py-4 bg-amber-500/20 text-amber-500 border border-amber-500/30 rounded-xl font-bold">Partially Distracted</button>
                </div>
              </div>
            </div>
          )}
        </div>
      );
    }

    return (
      <div ref={timerRef} className={`h-full flex flex-col items-center justify-center relative transition-all duration-300 animate-in fade-in ${isFullScreen ? (isLightMode ? 'bg-[#FAFAFA]' : 'bg-[#09090B]') : ''}`}>
        <audio ref={lofiRef} src="https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3" loop /> 
        
        <div className="absolute top-6 right-6 flex gap-4">
          <button onClick={() => setIsZenMode(true)} className={`px-5 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest transition-all shadow-md flex items-center gap-2 ${isLightMode ? 'bg-black text-white hover:bg-slate-800' : 'bg-white text-black hover:bg-slate-200 shadow-[0_0_20px_rgba(255,255,255,0.2)]'}`}>
            <EyeOff size={16} /> Ultra Zen
          </button>
          <button onClick={toggleFullScreen} className={`p-2.5 rounded-xl transition-all ${isLightMode ? 'text-slate-500 hover:bg-white shadow-sm' : 'text-slate-400 hover:bg-white/10'}`} title="Fullscreen">
            {isFullScreen ? <Minimize size={24} /> : <Maximize size={24} />}
          </button>
        </div>

        <div className="text-center w-full max-w-xl px-4">
          
          <div className="flex justify-center items-center mb-8">
            <button onClick={toggleLofi} className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all border ${isLofiPlaying ? 'bg-indigo-500/10 text-indigo-500 border-indigo-500/50 shadow-sm' : `${isLightMode ? 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50' : 'bg-black/20 border-white/5 text-zinc-400 hover:bg-white/5'}`}`}>
              <Headphones size={18} /> {isLofiPlaying ? 'Pause Lo-Fi Music' : 'Play Focus Lo-Fi'}
            </button>
          </div>

          <h2 className={`text-xs font-bold mb-6 uppercase tracking-[0.3em] ${theme.textMuted}`}>
            {timerMode === 'pomodoro' ? 'Deep Focus Session' : 'Strict Break'}
          </h2>
          
          <div className={`flex justify-center items-center gap-1.5 mb-8 p-1 rounded-xl border w-fit mx-auto backdrop-blur-md ${isLightMode ? 'bg-slate-100 border-slate-200' : 'bg-black/20 border-white/5'}`}>
            <button onClick={() => setTimerDisplayType('digital')} className={`flex items-center gap-2 px-5 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${timerDisplayType === 'digital' ? 'bg-white text-slate-900 shadow-sm dark:bg-zinc-800 dark:text-white' : theme.textMuted}`}><TimerIcon size={16} /> Digital</button>
            <button onClick={() => setTimerDisplayType('analog')} className={`flex items-center gap-2 px-5 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${timerDisplayType === 'analog' ? 'bg-white text-slate-900 shadow-sm dark:bg-zinc-800 dark:text-white' : theme.textMuted}`}><Clock size={16} /> Analog</button>
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
            <div className={`text-[6rem] md:text-[9rem] font-bold font-mono tracking-tighter leading-none mb-12 drop-shadow-xl transition-colors duration-500 ${timerMode === 'shortBreak' ? 'text-emerald-500 drop-shadow-[0_0_30px_rgba(16,185,129,0.3)]' : isActive ? (isLightMode ? 'text-slate-900' : 'text-white drop-shadow-[0_0_40px_rgba(255,255,255,0.15)]') : theme.textMuted}`}>{formatTime(timeLeft)}</div>
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
            <button onClick={() => setIsActive(!isActive)} className={`w-24 h-24 rounded-full flex items-center justify-center transition-all duration-300 shadow-xl ${isActive ? 'bg-amber-500/10 text-amber-500 border-2 border-amber-500/50 hover:bg-amber-500/20' : 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white hover:scale-105 shadow-[0_0_30px_rgba(59,130,246,0.4)]'}`}>{isActive ? <Pause size={32} /> : <Play size={32} className="ml-2" />}
            </button>
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
  };

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
              <tr><th className="p-5 rounded-tl-2xl">Subject & Topic</th><th className="p-5">Block</th><th className="p-5">Difficulty</th><th className="p-5">Target Hrs</th><th className="p-5 rounded-tr-2xl">Action</th></tr>
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

  const renderMentor = () => (
    <div className={`flex flex-col h-[calc(100vh-6rem)] ${theme.cardSolid} rounded-3xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 shadow-xl`}>
      <div className={`p-5 ${isLightMode ? 'bg-slate-50/80 border-b border-slate-200' : 'bg-black/20 border-b border-white/5'} flex items-center justify-between backdrop-blur-xl`}>
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-white shadow-[0_0_15px_rgba(59,130,246,0.3)]"><BrainCircuit size={24} /></div>
          <div><h3 className="font-bold text-lg">Expert CA Mentor</h3><p className={`text-[10px] font-bold uppercase tracking-widest mt-0.5 ${theme.textMuted}`}>Powered by Gemini AI</p></div>
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

    const last7Days = []; let weekTotal = 0;
    for (let i = 6; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i); const ds = d.toISOString().split('T')[0];
      const hrs = studyHistory[ds] || (i === 0 ? hoursStudiedToday : 0);
      weekTotal += Number(hrs); last7Days.push({ day: d.toLocaleDateString('en-US', { weekday: 'short' }), hours: Number(hrs).toFixed(1), raw: Number(hrs) });
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

  const renderTrophyRoom = () => {
    // Helper to check mastery keywords
    const checkMastery = (keywords) => Object.keys(subjectMastery).some(k => keywords.some(kw => k.includes(kw)) && subjectMastery[k] >= 5);
    
    const isFRPro = checkMastery(['FR', 'FINANCIAL REPORTING']);
    const isAFMPro = checkMastery(['AFM', 'ADVANCED FINANCIAL']);
    const isAuditMaster = checkMastery(['AUDIT']);
    const isDTExpert = checkMastery(['DT', 'DIRECT TAX']);
    const isIDTExpert = checkMastery(['IDT', 'INDIRECT TAX']);
    const isIBSMaster = checkMastery(['IBS', 'INTEGRATED']);
    
    const badges = [
      { id: 'first_blood', name: 'First Blood', desc: 'Log your first study hour.', icon: <TimerIcon size={32}/>, unlocked: hoursStudiedToday > 0, color: 'text-blue-500', glow: 'shadow-blue-500/40' },
      { id: 'beast', name: '10-Hour Beast', desc: 'Hit a 10+ hour target for 3 days in a row.', icon: <Flame size={32}/>, unlocked: streak >= 3 && safeTarget >= 10, color: 'text-orange-500', glow: 'shadow-orange-500/40' },
      { id: 'king', name: 'Consistency King', desc: 'Maintain a 7-day target hit streak.', icon: <Trophy size={32}/>, unlocked: streak >= 7, color: 'text-yellow-500', glow: 'shadow-yellow-500/40' },
      { id: 'fr_pro', name: 'FR Pro', desc: 'Complete 5 Financial Reporting tasks.', icon: <Target size={32}/>, unlocked: isFRPro, color: 'text-emerald-500', glow: 'shadow-emerald-500/40' },
      { id: 'afm_pro', name: 'AFM Pro', desc: 'Complete 5 AFM tasks.', icon: <TrendingUp size={32}/>, unlocked: isAFMPro, color: 'text-cyan-500', glow: 'shadow-cyan-500/40' },
      { id: 'audit_master', name: 'Audit Master', desc: 'Complete 5 Audit tasks.', icon: <BookOpen size={32}/>, unlocked: isAuditMaster, color: 'text-purple-500', glow: 'shadow-purple-500/40' },
      { id: 'dt_expert', name: 'DT Expert', desc: 'Complete 5 Direct Tax tasks.', icon: <FileText size={32}/>, unlocked: isDTExpert, color: 'text-rose-500', glow: 'shadow-rose-500/40' },
      { id: 'idt_expert', name: 'IDT Expert', desc: 'Complete 5 Indirect Tax tasks.', icon: <Library size={32}/>, unlocked: isIDTExpert, color: 'text-indigo-500', glow: 'shadow-indigo-500/40' },
      { id: 'ibs_master', name: 'IBS Master', desc: 'Complete 5 IBS tasks.', icon: <BookOpen size={32}/>, unlocked: isIBSMaster, color: 'text-teal-500', glow: 'shadow-teal-500/40' },
    ];

    return (
      <div className="space-y-6 animate-in fade-in duration-500">
        <div><h2 className="text-2xl font-bold tracking-tight mb-1">Trophy Room</h2><p className={`text-sm ${theme.textMuted}`}>Unlock badges by maintaining discipline and completing tasks.</p></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {badges.map((b) => (
            <div key={b.id} className={`${theme.cardSolid} p-8 rounded-3xl flex flex-col items-center text-center gap-4 transition-all ${b.unlocked ? 'border border-white/20 hover:-translate-y-1' : 'opacity-50 grayscale'}`}>
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
            { id: 'trophy', name: 'Trophy Room', icon: <Trophy size={20} /> },
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
          {activeTab === 'trophy' && renderTrophyRoom()}
          {activeTab === 'faculty_notes' && renderFacultyNotes()}
          {activeTab === 'past_papers' && renderPastPapers()}
          {activeTab === 'quick_notes' && renderQuickNotes()}
        </div>
      </main>

      {/* SMART TOAST NOTIFICATION (15 SECONDS LOCKED) */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-5 fade-in duration-500 max-w-sm">
          <div className={`${theme.cardSolid} border shadow-2xl rounded-2xl p-5 flex items-start gap-4`}>
            <div className="p-2.5 bg-blue-500/10 text-blue-500 rounded-xl shadow-inner mt-1">{toastIcon}</div>
            <p className={`text-sm font-bold leading-relaxed ${theme.text}`}>{toastMessage}</p>
          </div>
        </div>
      )}
      
    </div>
  );
}