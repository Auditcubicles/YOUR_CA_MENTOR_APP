import React, { useState, useEffect, useRef } from 'react';
import {
  LayoutDashboard, CalendarCheck, Timer as TimerIcon, MessageSquare, TrendingUp, BookOpen,
  AlertTriangle, CheckCircle, XCircle, Play, Pause, RotateCcw, Send, Flame, Calendar,
  BrainCircuit, Target, FileText, Sun, Moon, Maximize, Minimize, Library, ExternalLink, 
  FolderOpen, StopCircle, Clock, BarChart2, Bell, Zap, Headphones
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
  const [tasks, setTasks] = useLocalStorage('ca-tasks', []);
  const [chatHistory, setChatHistory] = useLocalStorage('ca-chat', [
    { sender: 'mentor', text: "Hello! I am your Expert AI Mentor. I am here to plan your CA journey, resolve doubts, and keep you disciplined.", time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) },
  ]);
  const [chatInput, setChatInput] = React.useState('');
  const [toastMessage, setToastMessage] = useState(null); 
  const [toastIcon, setToastIcon] = useState(null);
  const toastTimerRef = useRef(null);

  // Timer & Sound
  const [workDuration, setWorkDuration] = useLocalStorage('ca-work-duration', 50);
  const [breakDuration, setBreakDuration] = useLocalStorage('ca-break-duration', 10);
  const [timerMode, setTimerMode] = useState('pomodoro');
  const [timeLeft, setTimeLeft] = useState(Number(workDuration) * 60 || 3000);
  const [isActive, setIsActive] = useState(false);
  const [showSessionLog, setShowSessionLog] = useState(false);
  const [timerDisplayType, setTimerDisplayType] = useLocalStorage('ca-timer-display', 'digital'); 
  const [isLofiPlaying, setIsLofiPlaying] = useState(false);
  const lofiRef = useRef(null);
  
  const timerRef = useRef(null);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [showAddTaskModal, setShowAddTaskModal] = React.useState(false);
  const [newTask, setNewTask] = React.useState({ subject: '', topic: '', duration: 2, difficulty: 'Medium', timeOfDay: 'Morning' });

  // --- ANALYTICS & STREAK LOGIC ---
  useEffect(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    const lastLogin = localStorage.getItem('ca-lastLogin');
    if (lastLogin !== todayStr) {
      setHoursStudiedToday(0); 
      localStorage.setItem('ca-lastLogin', todayStr);
      const lastTargetHit = localStorage.getItem('ca-lastTargetHit');
      const yesterday = new Date(); yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];
      if (lastTargetHit !== yesterdayStr && lastTargetHit !== todayStr) setStreak(0);
    }
  }, []);

  // --- HOURLY QUOTES (15 SECONDS) ---
  useEffect(() => {
    const quoteInterval = setInterval(() => {
      const randomQuote = motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)];
      triggerToast(randomQuote, <Zap size={18} />);
    }, 3600000); 
    return () => clearInterval(quoteInterval);
  }, []);

  const triggerToast = (msg, icon = <Bell size={18} />) => {
    setToastMessage(msg); setToastIcon(icon);
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => setToastMessage(null), 15000); // FIXED 15 SEC
  };

  // --- LO-FI SOUND ENGINE (HIGH RELIABILITY) ---
  const toggleLofi = () => {
    if (!lofiRef.current) return;
    if (isLofiPlaying) {
      lofiRef.current.pause();
      setIsLofiPlaying(false);
    } else {
      lofiRef.current.play().then(() => {
        setIsLofiPlaying(true);
      }).catch(err => {
        triggerToast("Please click Play again to start music.", <AlertTriangle size={18}/>);
      });
    }
  };

  // --- TIMER ENGINE ---
  useEffect(() => {
    let interval = null;
    if (isActive && timeLeft > 0) interval = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    else if (isActive && timeLeft <= 0) { setIsActive(false); handleSessionComplete(); }
    return () => clearInterval(interval);
  }, [isActive, timeLeft]);

  const saveToHistory = (hoursToAdd) => {
    const todayStr = new Date().toISOString().split('T')[0];
    setStudyHistory(prev => {
      const currentToday = prev[todayStr] || 0;
      return { ...prev, [todayStr]: currentToday + hoursToAdd };
    });
  };

  const handleSessionComplete = () => {
    if (timerMode === 'pomodoro') { setShowSessionLog(true); if (document.fullscreenElement) document.exitFullscreen().catch(()=>{}); } 
    else { setTimerMode('pomodoro'); setTimeLeft((Number(workDuration) || 50) * 60); triggerToast('Break over. Back to work!'); }
  };

  const handleStopSession = () => {
    setIsActive(false);
    const totalPlanned = timerMode === 'pomodoro' ? Number(workDuration) * 60 : Number(breakDuration) * 60;
    const studied = totalPlanned - timeLeft;
    if (timerMode === 'pomodoro' && studied > 0) {
      const added = studied / 3600; setHoursStudiedToday(prev => prev + added); saveToHistory(added);
      if ((hoursStudiedToday + added) >= targetHours) { setStreak(prev => prev + 1); localStorage.setItem('ca-lastTargetHit', new Date().toISOString().split('T')[0]); }
      triggerToast(`Saved ${(studied / 60).toFixed(1)} mins to progress.`);
    }
    setTimerMode('pomodoro'); setTimeLeft(Number(workDuration) * 60); setShowSessionLog(false);
  };

  const logSessionResult = (status) => {
    setShowSessionLog(false);
    const added = status === 'completed' ? (Number(workDuration) / 60) : status === 'partial' ? (Number(workDuration) / 120) : 0;
    if (added > 0) {
      setHoursStudiedToday(prev => prev + added); saveToHistory(added);
      if ((hoursStudiedToday + added) >= targetHours) { setStreak(prev => prev + 1); localStorage.setItem('ca-lastTargetHit', new Date().toISOString().split('T')[0]); }
    }
    if (status === 'completed') { setTimerMode('shortBreak'); setTimeLeft(Number(breakDuration) * 60); setIsActive(true); triggerToast("Session logged perfectly!"); }
  };

  // --- UI COMPONENTS ---
  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60); const s = Math.floor(seconds % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const renderDashboard = () => (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className={`relative overflow-hidden rounded-3xl p-8 ${isLightMode ? 'bg-gradient-to-br from-red-50 to-orange-50 border border-red-100' : 'bg-gradient-to-br from-red-950/40 to-[#2a0808] border border-red-900/30'} shadow-xl`}>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center relative z-10 gap-6">
          <div>
            <h2 className="text-red-500 font-bold tracking-[0.2em] text-xs mb-2 uppercase">Mission CA Final</h2>
            <div className="flex items-baseline gap-3">
              <span className={`text-6xl font-black tracking-tighter ${isLightMode ? 'text-slate-900' : 'text-white'}`}>{daysLeft}</span>
              <span className={`text-lg ${theme.textMuted} font-medium`}>Days to go</span>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="backdrop-blur-2xl p-4 rounded-xl border border-white/10">
              <div className="text-[10px] font-bold uppercase mb-2">Target Date</div>
              <input type="date" value={examDate} onChange={(e) => setExamDate(e.target.value)} className={`${theme.input} rounded-lg px-3 py-1 font-mono text-sm`} />
            </div>
            <div className="backdrop-blur-2xl p-4 rounded-xl border border-white/10">
              <div className="text-[10px] font-bold uppercase mb-2">Daily Goal</div>
              <input type="number" value={targetHours} onChange={(e) => setTargetHours(e.target.value)} className={`${theme.input} rounded-lg px-3 py-1 font-mono text-sm w-16`} />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className={`${theme.card} p-6 rounded-3xl`}>
          <div className="text-sm font-semibold mb-2">Progress</div>
          <div className="text-3xl font-black">{Number(hoursStudiedToday).toFixed(1)} <span className="text-sm font-normal">/ {targetHours} hrs</span></div>
          <div className="w-full bg-black/20 h-2 mt-4 rounded-full overflow-hidden">
            <div className="bg-blue-500 h-full transition-all duration-1000" style={{ width: `${Math.min((hoursStudiedToday/targetHours)*100, 100)}%` }}></div>
          </div>
        </div>
        <div className={`${theme.card} p-6 rounded-3xl`}><div className="text-sm font-semibold mb-2">Streak</div><div className="text-3xl font-black">{streak} Days</div><div className="text-xs text-orange-500 mt-2 font-bold uppercase">Consistency King 🔥</div></div>
        <div className={`${theme.card} p-6 rounded-3xl`}><div className="text-sm font-semibold mb-2">Remaining Today</div><div className="text-3xl font-black">{reqDailyHours} hrs</div><div className="text-xs font-bold mt-2 uppercase">Don't settle.</div></div>
      </div>
    </div>
  );

  const renderTimer = () => (
    <div className="h-full flex flex-col items-center justify-center p-4 animate-in fade-in">
      <audio ref={lofiRef} src="https://stream.zeno.fm/0r0xa792kw8uv" loop /> 
      
      <div className="text-center w-full max-w-xl">
        <button 
          onClick={toggleLofi}
          className={`flex items-center gap-2 px-6 py-3 rounded-2xl text-xs font-bold uppercase tracking-widest transition-all border mx-auto mb-10 ${isLofiPlaying ? 'bg-blue-500 text-white shadow-blue-500/40' : 'bg-white/5 border-white/10 text-zinc-400'}`}
        >
          <Headphones size={20} /> {isLofiPlaying ? 'Pause Focus Lo-Fi' : 'Play Focus Lo-Fi'}
        </button>

        {timerDisplayType === 'digital' ? (
          <div className="text-[8rem] md:text-[12rem] font-black font-mono tracking-tighter leading-none mb-14">{formatTime(timeLeft)}</div>
        ) : (
          <div className="relative w-64 h-64 md:w-80 md:h-80 mx-auto mb-12">
            <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-2xl">
              <circle cx="50" cy="50" r="48" fill="none" stroke="currentColor" strokeWidth="2" className="opacity-10" />
              <line x1="50" y1="50" x2="50" y2="20" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" transform={`rotate(${(Math.floor(timeLeft/60)*6)+((timeLeft%60)*0.1)} 50 50)`} />
              <line x1="50" y1="50" x2="50" y2="15" stroke="#ef4444" strokeWidth="1" transform={`rotate(${(timeLeft%60)*6} 50 50)`} />
              <circle cx="50" cy="50" r="3" fill="#3b82f6" />
            </svg>
          </div>
        )}

        <div className="flex justify-center items-center gap-8 mb-12">
          <button onClick={() => setTimeLeft(workDuration*60)} className="p-4 rounded-full border border-white/10 text-zinc-400 hover:text-white transition-colors"><RotateCcw size={24} /></button>
          <button onClick={() => setIsActive(!isActive)} className={`w-28 h-28 rounded-full flex items-center justify-center transition-all ${isActive ? 'bg-amber-500/10 text-amber-500 border-2 border-amber-500/50' : 'bg-blue-600 text-white shadow-2xl shadow-blue-500/40'}`}>{isActive ? <Pause size={40} /> : <Play size={40} className="ml-2" />}</button>
          <button onClick={handleStopSession} className="p-4 rounded-full border border-red-500/30 text-red-500 hover:bg-red-500/10 transition-all"><StopCircle size={24} /></button>
        </div>

        <div className="flex gap-4 justify-center">
            <button onClick={() => setTimerDisplayType('digital')} className={`px-4 py-2 rounded-xl text-xs font-bold uppercase border transition-all ${timerDisplayType==='digital'?'bg-white/10 border-white/20':'border-transparent opacity-40'}`}>Digital</button>
            <button onClick={() => setTimerDisplayType('analog')} className={`px-4 py-2 rounded-xl text-xs font-bold uppercase border transition-all ${timerDisplayType==='analog'?'bg-white/10 border-white/20':'border-transparent opacity-40'}`}>Analog</button>
        </div>
      </div>

      {showSessionLog && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-2xl flex items-center justify-center z-50 p-4">
          <div className={`${theme.cardSolid} rounded-[2.5rem] p-12 max-w-lg w-full text-center border border-white/20 shadow-2xl`}>
            <h3 className="text-3xl font-black mb-10">Session Complete</h3>
            <div className="space-y-4">
              <button onClick={() => logSessionResult('completed')} className="w-full py-5 bg-emerald-500/10 text-emerald-500 border border-emerald-500/30 rounded-2xl font-black text-lg">100% Focused</button>
              <button onClick={() => logSessionResult('partial')} className="w-full py-5 bg-amber-500/10 text-amber-500 border border-amber-500/30 rounded-2xl font-black text-lg">Partially Distracted</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderAnalytics = () => {
    const last7Days = []; let weekTotal = 0;
    for (let i = 6; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i); const ds = d.toISOString().split('T')[0];
      const hrs = studyHistory[ds] || (i === 0 ? hoursStudiedToday : 0);
      weekTotal += Number(hrs); last7Days.push({ day: d.toLocaleDateString('en-US', { weekday: 'short' }), hours: Number(hrs).toFixed(1), raw: Number(hrs) });
    }
    const max = Math.max(...last7Days.map(d => d.raw), 10);

    return (
      <div className="space-y-8 animate-in fade-in">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className={`${theme.card} p-5 rounded-2xl`}><div className="text-[10px] font-bold uppercase mb-2">Last 7 Days</div><div className="text-3xl font-black text-blue-500">{weekTotal.toFixed(1)}h</div></div>
            <div className={`${theme.card} p-5 rounded-2xl`}><div className="text-[10px] font-bold uppercase mb-2">Avg / Day</div><div className="text-3xl font-black">{(weekTotal/7).toFixed(1)}h</div></div>
        </div>
        <div className={`${theme.cardSolid} p-8 rounded-3xl border border-white/10`}>
          <div className="flex items-end justify-between h-56 gap-4">
            {last7Days.map((d, i) => (
              <div key={i} className="flex-1 flex flex-col items-center group">
                <div className="text-[10px] mb-2 opacity-0 group-hover:opacity-100 transition-opacity">{d.hours}h</div>
                <div className={`w-full max-w-[40px] rounded-t-xl transition-all duration-1000 ${i===6?'bg-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.5)]':'bg-white/10'}`} style={{ height: `${(d.raw/max)*100}%`, minHeight: '4px' }}></div>
                <div className="text-[10px] mt-4 font-bold uppercase">{d.day}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // --- MAIN RENDER ---
  return (
    <div className={`min-h-screen font-sans flex overflow-hidden transition-all duration-500 ${theme.bg} ${theme.text}`}>
      <aside className={`w-72 border-r flex flex-col hidden md:flex ${theme.sidebar} z-10`}>
        <div className="p-8 border-b border-white/5">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center font-black text-white shadow-xl shadow-blue-500/40">CA</div>
            <span className="font-black text-2xl">Sathi.ai</span>
          </div>
          <div className="pl-3 border-l-4 border-blue-500">
            <p className="text-[10px] uppercase tracking-widest font-black text-zinc-500">Founded By</p>
            <p className="text-sm font-black text-blue-500">Niket Talwar</p>
          </div>
        </div>
        <nav className="flex-1 p-5 space-y-3">
          {[
            { id: 'dashboard', name: 'Dashboard', icon: <LayoutDashboard size={20} /> },
            { id: 'planner', name: 'Study Planner', icon: <Calendar size={20} /> },
            { id: 'timer', name: 'Focus Timer', icon: <TimerIcon size={20} /> },
            { id: 'mentor', name: 'Expert Mentor', icon: <BrainCircuit size={20} /> },
            { id: 'analytics', name: 'Analytics', icon: <BarChart2 size={20} /> },
            { id: 'faculty_notes', name: 'Faculty Notes', icon: <FolderOpen size={20} /> },
            { id: 'past_papers', name: 'Past Papers', icon: <Library size={20} /> },
            { id: 'quick_notes', name: 'Quick Notes', icon: <FileText size={20} /> },
          ].map(item => (
            <button key={item.id} onClick={() => setActiveTab(item.id)} className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all ${activeTab === item.id ? theme.activeTab : theme.hoverTab}`}>
              {item.icon} <span className="font-bold text-sm tracking-wide">{item.name}</span>
            </button>
          ))}
        </nav>
        <div className="p-6 border-t border-white/5">
          <button onClick={() => setIsLightMode(!isLightMode)} className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl bg-white/5 text-xs font-black uppercase tracking-widest hover:bg-white/10 transition-all">
            {isLightMode ? <Moon size={18} /> : <Sun size={18} />} {isLightMode ? 'Dark Mode' : 'Light Mode'}
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto scrollbar-hide">
        <div className="max-w-6xl mx-auto h-full p-10 pb-32">
          {activeTab === 'dashboard' && renderDashboard()}
          {activeTab === 'timer' && renderTimer()}
          {activeTab === 'mentor' && (
            <div className={`flex flex-col h-[calc(100vh-6rem)] ${theme.cardSolid} rounded-[2rem] overflow-hidden`}>
              <div className="p-6 border-b border-white/5 flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-500/30"><BrainCircuit size={24} /></div>
                <h3 className="font-black text-xl">Expert Mentor</h3>
              </div>
              <div className="flex-1 overflow-y-auto p-8 space-y-8">
                {chatHistory.map((msg, i) => (
                  <div key={i} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] p-6 rounded-3xl text-sm leading-relaxed ${msg.sender === 'user' ? 'bg-blue-600 text-white rounded-br-sm shadow-xl' : 'bg-white/5 border border-white/10 text-slate-200 rounded-bl-sm backdrop-blur-xl'}`}>
                      {msg.text}
                      <div className="text-[10px] text-right mt-4 font-black uppercase opacity-40">{msg.time}</div>
                    </div>
                  </div>
                ))}
              </div>
              <form onSubmit={handleChatSubmit} className="p-6 border-t border-white/5 flex gap-4 backdrop-blur-2xl">
                <input type="text" value={chatInput} onChange={(e) => setChatInput(e.target.value)} placeholder="Ask technical doubts or request motivation..." className={`flex-1 ${theme.input} rounded-2xl px-6 py-5 text-sm font-semibold outline-none`} />
                <button type="submit" className="bg-blue-600 hover:bg-blue-500 text-white px-8 rounded-2xl font-black transition-all shadow-xl shadow-blue-500/30"><Send size={24} /></button>
              </form>
            </div>
          )}
          {activeTab === 'analytics' && renderAnalytics()}
          {activeTab === 'planner' && renderPlanner()}
          {activeTab === 'faculty_notes' && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 animate-in fade-in">
                {[
                    { name: 'FR', link: 'https://drive.google.com/drive/folders/16gN9MHrV7l9VHFFOaIrTz0IC7dl4GHIx', icon: '📘' },
                    { name: 'AFM', link: 'https://drive.google.com/drive/folders/1xIYTwL3RLmC7ELMrZKky_Q1kdico9VqD', icon: '📗' },
                    { name: 'Audit', link: 'https://drive.google.com/drive/folders/1VTFcIFznC7zpWVAWlDgY9x9NtEheBzlI', icon: '📙' },
                    { name: 'DT', link: 'https://drive.google.com/drive/folders/1j5o0WKVNtD7CxMNIrgznjfQnI4CYdheu', icon: '📕' },
                    { name: 'IDT', link: 'https://drive.google.com/drive/folders/1Z3JYyTSpRf04QhE26sdnzkxa7qEizfDT', icon: '📓' },
                    { name: 'IBS', link: 'https://drive.google.com/drive/folders/1KXTo6pobu7QKhC0TP7--g98quUFJn4rZ', icon: '📒' },
                    { name: 'SPOM', link: 'https://drive.google.com/drive/folders/1bzhLGBWUn2i_A6BoprToW-S8Majk29BV', icon: '💻' }
                ].map((n, i) => (
                    <a key={i} href={n.link} target="_blank" rel="noreferrer" className={`${theme.cardSolid} p-8 rounded-[2rem] flex flex-col items-center text-center gap-5 group border border-white/5 hover:-translate-y-2 transition-all`}>
                        <div className="text-6xl drop-shadow-xl">{n.icon}</div>
                        <h3 className="font-black text-xl">{n.name} Notes</h3>
                    </a>
                ))}
            </div>
          )}
          {activeTab === 'past_papers' && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 animate-in fade-in">
                {[
                    { name: 'FR', link: 'https://www.castudypartner.com/view/all_questions/id=ZhMn2SLrHqCWa7izgCHWVXoqv9o31c3zCd7a6BZBdRQ=/type=aBiUXQHw15Q33rsRD5ideZvMa3Oq-gDQc-p_p8a0vBU=/subject=UeoGTdCOXR9vcXrH2Ixm0zA-5qpL43ovTx6iamI8bPw=/index=HjR8OI_C92vfg2wkAKIEVBKwp0dEP3hrT8uAcW2pUOY=', icon: '📊' },
                    { name: 'AFM', link: 'https://www.castudypartner.com/view/all_questions/id=ZhMn2SLrHqCWa7izgCHWVXoqv9o31c3zCd7a6BZBdRQ=/type=aBiUXQHw15Q33rsRD5ideZvMa3Oq-gDQc-p_p8a0vBU=/subject=nzKn-ijbXOsXihFYuZuZ6-yR3O7rz5s5pFDwc0kFWXg=/index=rAymKoVQaLKzGCWL_i2PP4gzLRaKgE_1Nu8iB3d8HXo=', icon: '📈' },
                    { name: 'Audit', link: 'https://www.castudypartner.com/view/all_questions/id=ZhMn2SLrHqCWa7izgCHWVXoqv9o31c3zCd7a6BZBdRQ=/type=aBiUXQHw15Q33rsRD5ideZvMa3Oq-gDQc-p_p8a0vBU=/subject=N8Irnu1rh71zD1hw5b1Iho579hPZG2TfcYxL3kAtmow=/index=LYlBZAJ5rzMMo-bLpeEC1z1Vu6hvFQgciswiJZR5N0I=', icon: '🔍' },
                    { name: 'DT', link: 'https://www.castudypartner.com/view/all_questions/id=ZhMn2SLrHqCWa7izgCHWVXoqv9o31c3zCd7a6BZBdRQ=/type=aBiUXQHw15Q33rsRD5ideZvMa3Oq-gDQc-p_p8a0vBU=/subject=8y5m11WZYYQ61D94xGPF2eEcUme4g3cQivnx_Ia1v6Q=/index=diFiR7ZcZzLCkOruyZs6TF7eiQTTgt4-ZY8KPrGPalg=', icon: '💰' }
                ].map((p, i) => (
                    <a key={i} href={p.link} target="_blank" rel="noreferrer" className={`${theme.cardSolid} p-8 rounded-[2rem] flex flex-col items-center text-center gap-5 border border-white/5 hover:-translate-y-2 transition-all`}>
                        <div className="text-6xl">{p.icon}</div>
                        <h3 className="font-black text-xl">{p.name} Bank</h3>
                    </a>
                ))}
            </div>
          )}
          {activeTab === 'quick_notes' && renderQuickNotes()}
        </div>
      </main>

      {toastMessage && (
        <div className="fixed bottom-10 right-10 z-50 animate-in slide-in-from-right-10 fade-in duration-500 max-w-xs md:max-w-md">
          <div className="bg-[#18181B] border border-blue-500/30 shadow-2xl rounded-3xl p-6 flex items-start gap-5 backdrop-blur-3xl">
            <div className="p-3 bg-blue-500/20 text-blue-500 rounded-2xl shadow-inner mt-1">{toastIcon}</div>
            <p className="text-sm font-bold leading-relaxed text-slate-100">{toastMessage}</p>
          </div>
        </div>
      )}
    </div>
  );
}