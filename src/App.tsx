import React, { useState, useEffect, useRef } from 'react';
import {
  LayoutDashboard, CalendarCheck, Timer as TimerIcon, MessageSquare, TrendingUp, BookOpen,
  AlertTriangle, CheckCircle, XCircle, Play, Pause, RotateCcw, Send, Flame, Calendar,
  BrainCircuit, Target, FileText, Sun, Moon, Maximize, Minimize, Library, ExternalLink, 
  FolderOpen, StopCircle, Clock, BarChart2, CloudRain, Trees, Waves, Bell
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

export default function CASathiApp() {
  // --- MODERN MINIMALIST THEME STATE ---
  const [isLightMode, setIsLightMode] = useLocalStorage('ca-theme-light', false);

  const theme = {
    bg: isLightMode ? 'bg-[#FAFAFA]' : 'bg-[#09090B]', 
    text: isLightMode ? 'text-slate-900' : 'text-zinc-100',
    sidebar: isLightMode ? 'bg-white border-slate-200' : 'bg-[#18181B] border-zinc-800',
    card: isLightMode ? 'bg-white border border-slate-200 shadow-sm' : 'bg-[#18181B] border border-zinc-800',
    cardSolid: isLightMode ? 'bg-white border border-slate-200 shadow-md' : 'bg-[#121214] border border-zinc-800 shadow-2xl',
    input: isLightMode ? 'bg-slate-50 border-slate-200 text-slate-900 focus:border-blue-500' : 'bg-[#09090B] border-zinc-700 text-zinc-100 focus:border-blue-500',
    textMuted: isLightMode ? 'text-slate-500' : 'text-zinc-400',
    hoverTab: isLightMode ? 'hover:bg-slate-100 text-slate-600' : 'hover:bg-zinc-800/50 text-zinc-400 hover:text-zinc-200',
    activeTab: isLightMode ? 'bg-blue-50 text-blue-700 font-medium' : 'bg-blue-500/10 text-blue-400 font-medium'
  };

  // --- STATE MANAGEMENT ---
  const [activeTab, setActiveTab] = React.useState('dashboard');
  const [examDate, setExamDate] = useLocalStorage('ca-examDate', '');
  const [targetHours, setTargetHours] = useLocalStorage('ca-targetHours', 10);
  const [hoursStudiedToday, setHoursStudiedToday] = useLocalStorage('ca-hoursToday', 0);
  const [streak, setStreak] = useLocalStorage('ca-streak', 0);
  const [studyHistory, setStudyHistory] = useLocalStorage('ca-study-history', {}); // NEW: Analytics Engine
  
  const [tasks, setTasks] = useLocalStorage('ca-tasks', []);
  const [chatHistory, setChatHistory] = useLocalStorage('ca-chat', [
    { sender: 'mentor', text: "Welcome to your CA Dashboard. I am your AI Mentor. Let's plan your day and maintain absolute discipline.", time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) },
  ]);
  const [chatInput, setChatInput] = React.useState('');
  const [toastMessage, setToastMessage] = useState(null); // NEW: Smart Pop-up
  
  // Timer & Sound State
  const [workDuration, setWorkDuration] = useLocalStorage('ca-work-duration', 50);
  const [breakDuration, setBreakDuration] = useLocalStorage('ca-break-duration', 10);
  const [timerMode, setTimerMode] = useState('pomodoro');
  const [timeLeft, setTimeLeft] = useState(workDuration * 60);
  const [isActive, setIsActive] = useState(false);
  const [showSessionLog, setShowSessionLog] = useState(false);
  const [timerDisplayType, setTimerDisplayType] = useLocalStorage('ca-timer-display', 'digital'); 
  const [activeSound, setActiveSound] = useState(null); // NEW: Ambient Sounds
  const audioRef = useRef(null);
  
  const timerRef = useRef(null);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [showAddTaskModal, setShowAddTaskModal] = React.useState(false);
  const [newTask, setNewTask] = React.useState({ subject: '', topic: '', duration: 2, difficulty: 'Medium', timeOfDay: 'Morning' });

  // --- ENGINE: STREAK & ANALYTICS MIDNIGHT RESET ---
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

  const rawDaysLeft = examDate ? Math.ceil((new Date(examDate) - new Date()) / (1000 * 60 * 60 * 24)) : 0;
  const daysLeft = Math.max(1, rawDaysLeft);
  const reqDailyHours = hoursStudiedToday < targetHours ? (targetHours - hoursStudiedToday).toFixed(1) : 0;
  const progressPercent = targetHours > 0 ? Math.min((Number(hoursStudiedToday) / Number(targetHours)) * 100, 100) : 0;

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

  // --- SOUND LOGIC ---
  const toggleSound = (soundType, url) => {
    if (activeSound === soundType) {
      audioRef.current?.pause();
      setActiveSound(null);
    } else {
      if (audioRef.current) {
        audioRef.current.src = url;
        audioRef.current.loop = true;
        audioRef.current.volume = 0.4; // Soft background volume
        audioRef.current.play().catch(e => console.log("Audio play blocked by browser", e));
      }
      setActiveSound(soundType);
    }
  };

  // --- TOAST NOTIFICATION LOGIC ---
  const triggerToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 5000);
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

  // Function to save hours to Analytics History
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
      saveToHistory(hoursToAdd); // Save to Analytics
      
      if (newTotalHours >= targetHours && Number(hoursStudiedToday) < targetHours) {
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
      saveToHistory(sessionHoursAdded); // Save to Analytics
      if (newTotalHours >= targetHours && Number(hoursStudiedToday) < targetHours) {
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
    
    // Simulate thinking
    setTimeout(() => {
      triggerToast("Mentor is typing a response...");
    }, 500);

    const prompt = `You are 'Sathi,' an elite CA Mentor. Tone: Professional Hinglish. Be direct, helpful, and motivating.
      Context: Exam in ${daysLeft} days. Target: ${targetHours}h. Completed: ${hoursStudiedToday}h. Streak: ${streak}.
      Student says: "${userText}"`;

    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
        { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }) }
      );
      const data = await response.json();
      const aiReply = data.candidates[0].content.parts[0].text;
      addMentorMessage(aiReply, 'mentor');
      triggerToast("New message from your Mentor"); // Trigger Toast
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
      <div className={`${theme.card} rounded-2xl p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6`}>
        <div>
          <h2 className={`text-sm font-semibold uppercase tracking-widest ${theme.textMuted} mb-2`}>Mission CA Final</h2>
          <div className="flex items-end gap-3">
            <span className="text-5xl font-bold tracking-tight leading-none">{daysLeft}</span>
            <span className={`text-lg font-medium ${theme.textMuted} pb-1`}>Days Remaining</span>
          </div>
          <p className={`mt-3 text-sm font-medium border-l-2 border-blue-500 pl-3 ${theme.textMuted}`}>"{generateMentorResponse('urgency', { daysLeft })}"</p>
        </div>
        <div className={`p-4 rounded-xl border ${isLightMode ? 'bg-slate-50 border-slate-200' : 'bg-zinc-800/50 border-zinc-700'}`}>
          <div className={`text-xs font-semibold uppercase tracking-wider ${theme.textMuted} mb-2`}>Target Exam Date</div>
          <input type="date" value={examDate} onChange={(e) => setExamDate(e.target.value)} className={`${theme.input} rounded-lg px-3 py-2 text-sm focus:outline-none`} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className={`${theme.card} p-6 rounded-2xl`}>
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2.5 bg-blue-500/10 text-blue-500 rounded-lg"><Target size={20} /></div>
            <div className={`text-sm font-medium ${theme.textMuted}`}>Today's Progress</div>
          </div>
          <div className="text-3xl font-bold tracking-tight">{Number(hoursStudiedToday).toFixed(1)} <span className={`text-base font-normal ${theme.textMuted}`}>/ {targetHours} hrs</span></div>
          <div className={`w-full ${isLightMode ? 'bg-slate-100' : 'bg-zinc-800'} h-1.5 mt-4 rounded-full overflow-hidden`}>
            <div className="bg-blue-500 h-full rounded-full transition-all duration-700" style={{ width: `${progressPercent}%` }}></div>
          </div>
        </div>

        <div className={`${theme.card} p-6 rounded-2xl`}>
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2.5 bg-orange-500/10 text-orange-500 rounded-lg"><Flame size={20} /></div>
            <div className={`text-sm font-medium ${theme.textMuted}`}>Consistency Streak</div>
          </div>
          <div className="text-3xl font-bold tracking-tight">{streak} <span className={`text-base font-normal ${theme.textMuted}`}>Days</span></div>
          <div className={`text-xs font-medium mt-4 ${theme.textMuted}`}>Target successfully hit</div>
        </div>

        <div className={`${theme.card} p-6 rounded-2xl`}>
          <div className="flex items-center gap-3 mb-4">
            <div className={`p-2.5 rounded-lg ${hoursStudiedToday < targetHours ? 'bg-red-500/10 text-red-500' : 'bg-emerald-500/10 text-emerald-500'}`}><TrendingUp size={20} /></div>
            <div className={`text-sm font-medium ${theme.textMuted}`}>Remaining Today</div>
          </div>
          <div className="text-3xl font-bold tracking-tight">{reqDailyHours} <span className={`text-base font-normal ${theme.textMuted}`}>hrs</span></div>
          <div className={`text-xs font-medium mt-4 ${hoursStudiedToday < targetHours ? 'text-red-500' : 'text-emerald-500'}`}>
            {hoursStudiedToday < targetHours ? 'Keep pushing to hit target.' : 'Target accomplished!'}
          </div>
        </div>
      </div>

      <div className={`${theme.card} rounded-2xl p-8`}>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold flex items-center gap-2">Today's Focus</h3>
          <button onClick={() => setActiveTab('planner')} className="text-sm font-medium text-blue-500 hover:text-blue-600 transition-colors">View Planner &rarr;</button>
        </div>
        <div className="space-y-3">
          {tasks.map((task) => (
            <div key={task.id} className={`flex items-center justify-between p-4 rounded-xl border transition-colors ${isLightMode ? 'bg-slate-50 border-slate-100 hover:border-slate-300' : 'bg-[#121214] border-zinc-800/50 hover:border-zinc-700'}`}>
              <div className="flex items-center gap-4">
                <button onClick={() => toggleTaskStatus(task.id)} className="transition-transform hover:scale-105">
                  {task.status === 'completed' && <CheckCircle className="text-emerald-500" size={22} />}
                  {task.status === 'partial' && <AlertTriangle className="text-amber-500" size={22} />}
                  {task.status === 'pending' && <div className={`w-5 h-5 rounded-full border-2 ${isLightMode ? 'border-slate-300' : 'border-zinc-600'}`}></div>}
                </button>
                <div>
                  <div className="font-semibold text-base flex items-center gap-2">
                    {task.subject}: <span className="font-normal opacity-90">{task.topic}</span>
                  </div>
                  <div className={`text-xs font-medium ${theme.textMuted} mt-1`}>{task.timeOfDay} Block • {task.duration} Hours</div>
                </div>
              </div>
              <div className="text-right">
                {task.status === 'completed' ? <span className="text-xs font-semibold text-emerald-500">LOGGED</span> : <button onClick={() => setActiveTab('timer')} className="text-xs bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors">Start Session</button>}
              </div>
            </div>
          ))}
          {tasks.length === 0 && <p className={`text-center py-6 ${theme.textMuted} text-sm`}>Your desk is clean. Plan your day.</p>}
        </div>
      </div>
    </div>
  );

  const renderPlanner = () => (
    <div className="space-y-6 relative animate-in fade-in duration-500">
      <div className="flex justify-between items-center mb-2">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Study Planner</h2>
        </div>
        <button onClick={() => setShowAddTaskModal(true)} className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-colors">+ Add Target</button>
      </div>
      <div className={`${theme.card} rounded-2xl overflow-hidden`}>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className={`font-medium ${isLightMode ? 'bg-slate-50 text-slate-500 border-b border-slate-200' : 'bg-[#18181B] text-zinc-400 border-b border-zinc-800'}`}>
              <tr><th className="p-4">Subject & Topic</th><th className="p-4">Block</th><th className="p-4">Difficulty</th><th className="p-4">Target Hrs</th><th className="p-4">Action</th></tr>
            </thead>
            <tbody className={`divide-y ${isLightMode ? 'divide-slate-100' : 'divide-zinc-800'}`}>
              {tasks.map((task) => (
                <tr key={task.id} className={`transition-colors hover:${isLightMode ? 'bg-slate-50' : 'bg-[#121214]'}`}>
                  <td className="p-4 font-medium">{task.subject}: <span className={theme.textMuted}>{task.topic}</span></td>
                  <td className="p-4">{task.timeOfDay}</td>
                  <td className="p-4"><span className={`px-2.5 py-1 rounded-md text-xs font-semibold ${task.difficulty === 'Hard' ? 'bg-red-500/10 text-red-500' : task.difficulty === 'Medium' ? 'bg-amber-500/10 text-amber-500' : 'bg-emerald-500/10 text-emerald-500'}`}>{task.difficulty}</span></td>
                  <td className="p-4 font-mono">{task.duration}h</td>
                  <td className="p-4"><button onClick={() => setTasks(tasks.filter((t) => t.id !== task.id))} className="text-red-500 hover:text-red-600 text-xs font-semibold uppercase tracking-wider transition-colors">Drop</button></td>
                </tr>
              ))}
            </tbody>
          </table>
          {tasks.length === 0 && <div className={`text-center py-10 ${theme.textMuted} text-sm`}>No targets set. Plan your day to stay on track.</div>}
        </div>
      </div>

      {showAddTaskModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-in fade-in">
          <div className={`${theme.cardSolid} rounded-2xl p-8 max-w-md w-full shadow-xl`}>
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2"><BookOpen size={20} className="text-blue-500" /> Create Target</h3>
            <form onSubmit={handleAddTask} className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div><label className={`text-xs font-semibold uppercase tracking-wider mb-2 block ${theme.textMuted}`}>Subject</label><input type="text" value={newTask.subject} onChange={(e) => setNewTask({ ...newTask, subject: e.target.value })} className={`w-full rounded-lg p-2.5 text-sm outline-none ${theme.input}`} required placeholder="e.g. Audit" /></div>
                <div><label className={`text-xs font-semibold uppercase tracking-wider mb-2 block ${theme.textMuted}`}>Topic</label><input type="text" value={newTask.topic} onChange={(e) => setNewTask({ ...newTask, topic: e.target.value })} className={`w-full rounded-lg p-2.5 text-sm outline-none ${theme.input}`} required placeholder="e.g. SA 500" /></div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div><label className={`text-xs font-semibold uppercase tracking-wider mb-2 block ${theme.textMuted}`}>Hours</label><input type="number" step="0.5" min="0.5" value={newTask.duration} onChange={(e) => setNewTask({ ...newTask, duration: Number(e.target.value) })} className={`w-full rounded-lg p-2.5 text-sm outline-none ${theme.input}`} required /></div>
                <div><label className={`text-xs font-semibold uppercase tracking-wider mb-2 block ${theme.textMuted}`}>Level</label><select value={newTask.difficulty} onChange={(e) => setNewTask({ ...newTask, difficulty: e.target.value })} className={`w-full rounded-lg p-2.5 text-sm outline-none ${theme.input}`}><option>Hard</option><option>Medium</option><option>Easy</option></select></div>
                <div><label className={`text-xs font-semibold uppercase tracking-wider mb-2 block ${theme.textMuted}`}>Block</label><select value={newTask.timeOfDay} onChange={(e) => setNewTask({ ...newTask, timeOfDay: e.target.value })} className={`w-full rounded-lg p-2.5 text-sm outline-none ${theme.input}`}><option>Morning</option><option>Afternoon</option><option>Night</option></select></div>
              </div>
              <div className={`flex gap-3 mt-8 pt-6 border-t ${isLightMode ? 'border-slate-200' : 'border-zinc-800'}`}>
                <button type="button" onClick={() => setShowAddTaskModal(false)} className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-colors ${isLightMode ? 'bg-slate-100 hover:bg-slate-200 text-slate-700' : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300'}`}>Cancel</button>
                <button type="submit" className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors">Save Target</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );

  const renderTimer = () => (
    <div ref={timerRef} className={`h-full flex flex-col items-center justify-center relative transition-colors duration-300 animate-in fade-in ${isFullScreen ? (isLightMode ? 'bg-[#FAFAFA]' : 'bg-[#09090B]') : ''}`}>
      <audio ref={audioRef} /> {/* Hidden Audio Player */}
      
      <button onClick={toggleFullScreen} className={`absolute top-4 right-4 p-2 rounded-lg transition-colors ${theme.hoverTab}`} title="Fullscreen">
        {isFullScreen ? <Minimize size={20} /> : <Maximize size={20} />}
      </button>

      <div className="text-center w-full max-w-lg">
        {/* NEW: Focus Sounds UI */}
        <div className={`flex justify-center items-center gap-4 mb-8`}>
          {[
            { id: 'rain', icon: <CloudRain size={18} />, label: 'Rain', url: 'https://cdn.pixabay.com/download/audio/2022/02/22/audio_c8bfb703e3.mp3' },
            { id: 'forest', icon: <Trees size={18} />, label: 'Forest', url: 'https://cdn.pixabay.com/download/audio/2021/08/09/audio_8dd9b8b603.mp3' },
            { id: 'waves', icon: <Waves size={18} />, label: 'Waves', url: 'https://cdn.pixabay.com/download/audio/2022/01/18/audio_2c3a504cc8.mp3' }
          ].map(sound => (
            <button 
              key={sound.id}
              onClick={() => toggleSound(sound.id, sound.url)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all border ${activeSound === sound.id ? 'bg-blue-500/10 text-blue-500 border-blue-500/50 shadow-sm' : `${isLightMode ? 'bg-white border-slate-200 text-slate-500' : 'bg-black/20 border-white/5 text-zinc-400'}`}`}
            >
              {sound.icon} {sound.label}
            </button>
          ))}
        </div>

        <div className={`flex justify-center items-center gap-2 mb-10 p-1 rounded-lg border w-fit mx-auto ${isLightMode ? 'bg-slate-100 border-slate-200' : 'bg-[#18181B] border-zinc-800'}`}>
          <button onClick={() => setTimerDisplayType('digital')} className={`flex items-center gap-2 px-4 py-2 rounded-md text-xs font-semibold uppercase tracking-wider transition-all ${timerDisplayType === 'digital' ? 'bg-white text-slate-900 shadow-sm dark:bg-zinc-700 dark:text-white' : theme.textMuted}`}><TimerIcon size={16} /> Digital</button>
          <button onClick={() => setTimerDisplayType('analog')} className={`flex items-center gap-2 px-4 py-2 rounded-md text-xs font-semibold uppercase tracking-wider transition-all ${timerDisplayType === 'analog' ? 'bg-white text-slate-900 shadow-sm dark:bg-zinc-700 dark:text-white' : theme.textMuted}`}><Clock size={16} /> Analog</button>
        </div>

        {!isActive && !isFullScreen && (
          <div className="flex justify-center gap-6 mb-10">
            <div className="flex flex-col items-center">
              <label className={`text-xs mb-2 font-medium uppercase tracking-wider ${theme.textMuted}`}>Work (Min)</label>
              <input type="number" value={workDuration} onChange={(e) => {setWorkDuration(e.target.value); if(timerMode==='pomodoro') setTimeLeft((Number(e.target.value)||0)*60);}} className={`w-20 text-center rounded-lg p-2 font-mono text-lg font-semibold ${theme.input}`} />
            </div>
            <div className="flex flex-col items-center">
              <label className={`text-xs mb-2 font-medium uppercase tracking-wider ${theme.textMuted}`}>Break (Min)</label>
              <input type="number" value={breakDuration} onChange={(e) => {setBreakDuration(e.target.value); if(timerMode==='shortBreak') setTimeLeft((Number(e.target.value)||0)*60);}} className={`w-20 text-center rounded-lg p-2 font-mono text-lg font-semibold ${theme.input}`} />
            </div>
          </div>
        )}

        {timerDisplayType === 'digital' ? (
          <div className={`text-6xl md:text-8xl font-semibold font-mono tracking-tight mb-12 transition-colors ${timerMode === 'shortBreak' ? 'text-emerald-500' : isActive ? theme.text : theme.textMuted}`}>{formatTime(timeLeft)}</div>
        ) : (
          <div className="relative flex flex-col items-center justify-center mb-12">
            <svg width="280" height="280" viewBox="0 0 100 100" className="drop-shadow-lg">
              <circle cx="50" cy="50" r="48" fill={isLightMode ? '#ffffff' : '#18181b'} stroke={isLightMode ? '#e2e8f0' : '#27272a'} strokeWidth="1.5" />
              {[...Array(12)].map((_, i) => (<line key={i} x1="50" y1="6" x2="50" y2={i % 3 === 0 ? "12" : "9"} stroke={isLightMode ? '#cbd5e1' : '#3f3f46'} strokeWidth={i % 3 === 0 ? "2" : "1"} transform={`rotate(${i * 30} 50 50)`} />))}
              <line x1="50" y1="50" x2="50" y2="22" stroke={isLightMode ? '#334155' : '#e4e4e7'} strokeWidth="2.5" strokeLinecap="round" transform={`rotate(${(Math.floor(timeLeft / 60) * 6) + ((timeLeft % 60) * 0.1)} 50 50)`} />
              <line x1="50" y1="50" x2="50" y2="15" stroke="#ef4444" strokeWidth="1" strokeLinecap="round" transform={`rotate(${(timeLeft % 60) * 6} 50 50)`} />
              <circle cx="50" cy="50" r="3" fill="#3b82f6" />
            </svg>
            <div className={`absolute top-1/2 mt-12 px-3 py-1 rounded bg-black/5 border border-white/10 text-sm font-mono font-bold ${theme.text}`}>{formatTime(timeLeft)}</div>
          </div>
        )}
        
        <div className="flex justify-center items-center gap-6 mb-12">
          <button onClick={() => { setIsActive(false); setTimeLeft(timerMode === 'pomodoro' ? (Number(workDuration)||50)*60 : (Number(breakDuration)||10)*60); }} className={`w-12 h-12 rounded-full flex items-center justify-center border transition-colors ${isLightMode ? 'border-slate-300 text-slate-600 hover:bg-slate-100' : 'border-zinc-700 text-zinc-400 hover:bg-zinc-800'}`} title="Reset"><RotateCcw size={18} /></button>
          <button onClick={() => setIsActive(!isActive)} className={`w-20 h-20 rounded-full flex items-center justify-center transition-all ${isActive ? 'bg-amber-500/10 text-amber-500 border border-amber-500/50 hover:bg-amber-500/20' : 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-500/20'}`}>{isActive ? <Pause size={28} /> : <Play size={28} className="ml-1" />}</button>
          <button onClick={handleStopSession} className={`w-12 h-12 rounded-full flex items-center justify-center border transition-colors ${isLightMode ? 'border-red-200 text-red-500 hover:bg-red-50' : 'border-red-900 text-red-500 hover:bg-red-500/10'}`} title="Stop & Log Time"><StopCircle size={20} /></button>
        </div>

        {!isFullScreen && (
          <div className={`${theme.card} rounded-2xl p-4 text-left`}>
            <div className={`text-xs font-semibold uppercase tracking-wider mb-2 ${theme.textMuted}`}>Currently Focused On:</div>
            <select className={`w-full rounded-lg p-2 text-sm font-medium outline-none ${theme.input}`}>
              {tasks.filter((t) => t.status !== 'completed').map((t) => <option key={t.id}>{t.subject} - {t.topic}</option>)}
              {tasks.filter((t) => t.status !== 'completed').length === 0 && <option>No tasks assigned</option>}
            </select>
          </div>
        )}
      </div>

      {showSessionLog && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-in fade-in">
          <div className={`${theme.cardSolid} rounded-2xl p-8 max-w-sm w-full text-center shadow-2xl`}>
            <h3 className="text-2xl font-bold mb-2">Session Complete</h3>
            <p className={`text-sm mb-6 ${theme.textMuted}`}>How was your focus during this block?</p>
            <div className="space-y-3">
              <button onClick={() => logSessionResult('completed')} className="w-full py-3 bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 rounded-xl font-semibold flex items-center justify-center gap-2"><CheckCircle size={18} /> 100% Focused</button>
              <button onClick={() => logSessionResult('partial')} className="w-full py-3 bg-amber-500/10 text-amber-600 hover:bg-amber-500/20 rounded-xl font-semibold flex items-center justify-center gap-2"><AlertTriangle size={18} /> Partially Distracted</button>
              <button onClick={() => logSessionResult('failed')} className="w-full py-3 bg-red-500/10 text-red-600 hover:bg-red-500/20 rounded-xl font-semibold flex items-center justify-center gap-2"><XCircle size={18} /> Wasted (0 Output)</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderMentor = () => (
    <div className={`flex flex-col h-[calc(100vh-6rem)] ${theme.card} rounded-2xl overflow-hidden animate-in fade-in`}>
      <div className={`p-5 ${isLightMode ? 'bg-slate-50 border-b border-slate-200' : 'bg-[#121214] border-b border-zinc-800'} flex items-center justify-between`}>
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-blue-500/10 text-blue-500 rounded-lg flex items-center justify-center"><BrainCircuit size={20} /></div>
          <div><h3 className="font-bold text-base">Expert CA Mentor</h3><p className={`text-[10px] font-semibold uppercase tracking-widest ${theme.textMuted}`}>Audit Cubicles Engine</p></div>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {chatHistory.map((msg, i) => (
          <div key={i} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] p-4 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${msg.sender === 'user' ? 'bg-blue-600 text-white rounded-br-sm' : (isLightMode ? 'bg-slate-100 text-slate-800 rounded-bl-sm' : 'bg-[#18181B] border border-zinc-800 text-zinc-200 rounded-bl-sm')}`}>
              {msg.text}
              <div className={`text-[9px] text-right mt-2 font-semibold uppercase tracking-widest ${msg.sender === 'user' ? 'text-blue-200' : theme.textMuted}`}>{msg.time}</div>
            </div>
          </div>
        ))}
      </div>
      <form onSubmit={handleChatSubmit} className={`p-4 ${isLightMode ? 'bg-white border-t border-slate-200' : 'bg-[#121214] border-t border-zinc-800'} flex gap-3`}>
        <input type="text" value={chatInput} onChange={(e) => setChatInput(e.target.value)} placeholder="Ask technical doubts, strategies, or get motivation..." className={`flex-1 ${theme.input} rounded-xl px-4 py-3 text-sm outline-none`} />
        <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-5 rounded-xl transition-colors"><Send size={18} /></button>
      </form>
    </div>
  );

  // --- NEW: ANALYTICS ENGINE ---
  const renderAnalytics = () => {
    const todayStr = new Date().toISOString().split('T')[0];
    const yesterday = new Date(); yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];
    
    const hrsToday = studyHistory[todayStr] || hoursStudiedToday || 0;
    const hrsYesterday = studyHistory[yesterdayStr] || 0;

    // Calculate Last 7 Days for Chart
    const last7Days = [];
    let weekTotal = 0;
    for (let i = 6; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i);
      const ds = d.toISOString().split('T')[0];
      const hrs = studyHistory[ds] || (i === 0 ? hoursStudiedToday : 0);
      weekTotal += Number(hrs);
      last7Days.push({ day: d.toLocaleDateString('en-US', { weekday: 'short' }), hours: Number(hrs).toFixed(1), raw: Number(hrs) });
    }
    const maxChartHrs = Math.max(...last7Days.map(d => d.raw), 10); // Scale chart

    return (
      <div className="space-y-6 animate-in fade-in duration-500">
        <div><h2 className="text-2xl font-bold tracking-tight mb-1">Performance Analytics</h2><p className={`text-sm ${theme.textMuted}`}>Track your deep focus hours and study consistency.</p></div>
        
        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className={`${theme.card} p-5 rounded-2xl`}><div className={`text-xs font-semibold uppercase tracking-wider mb-2 ${theme.textMuted}`}>Today</div><div className="text-2xl font-bold text-blue-500">{Number(hrsToday).toFixed(1)}h</div></div>
          <div className={`${theme.card} p-5 rounded-2xl`}><div className={`text-xs font-semibold uppercase tracking-wider mb-2 ${theme.textMuted}`}>Yesterday</div><div className="text-2xl font-bold">{Number(hrsYesterday).toFixed(1)}h</div></div>
          <div className={`${theme.card} p-5 rounded-2xl`}><div className={`text-xs font-semibold uppercase tracking-wider mb-2 ${theme.textMuted}`}>Last 7 Days</div><div className="text-2xl font-bold text-emerald-500">{weekTotal.toFixed(1)}h</div></div>
          <div className={`${theme.card} p-5 rounded-2xl`}><div className={`text-xs font-semibold uppercase tracking-wider mb-2 ${theme.textMuted}`}>Daily Avg (Week)</div><div className="text-2xl font-bold">{(weekTotal / 7).toFixed(1)}h</div></div>
        </div>

        {/* CSS Bar Chart */}
        <div className={`${theme.cardSolid} rounded-2xl p-6 mt-6`}>
          <h3 className="font-semibold text-sm mb-6 flex items-center gap-2"><BarChart2 size={16} className="text-blue-500"/> 7-Day Focus Trend</h3>
          <div className="flex items-end justify-between h-48 gap-2 pt-4">
            {last7Days.map((data, idx) => {
              const heightPercent = (data.raw / maxChartHrs) * 100;
              return (
                <div key={idx} className="flex flex-col items-center flex-1 group">
                  <div className={`text-xs font-mono mb-2 opacity-0 group-hover:opacity-100 transition-opacity ${theme.textMuted}`}>{data.hours}</div>
                  <div className={`w-full max-w-[40px] rounded-t-md transition-all duration-700 ${idx === 6 ? 'bg-blue-500' : isLightMode ? 'bg-slate-200 hover:bg-slate-300' : 'bg-zinc-800 hover:bg-zinc-700'}`} style={{ height: `${heightPercent}%`, minHeight: '4px' }}></div>
                  <div className={`text-[10px] font-semibold mt-3 ${idx === 6 ? 'text-blue-500' : theme.textMuted}`}>{data.day}</div>
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
      { name: 'Financial Reporting', link: 'https://drive.google.com/drive/folders/16gN9MHrV7l9VHFFOaIrTz0IC7dl4GHIx', icon: '📘' },
      { name: 'Advanced Fin. Mgmt', link: 'https://drive.google.com/drive/folders/1xIYTwL3RLmC7ELMrZKky_Q1kdico9VqD', icon: '📗' },
      { name: 'Audit & Assurance', link: 'https://drive.google.com/drive/folders/1VTFcIFznC7zpWVAWlDgY9x9NtEheBzlI', icon: '📙' },
      { name: 'Direct Taxes (DT)', link: 'https://drive.google.com/drive/folders/1j5o0WKVNtD7CxMNIrgznjfQnI4CYdheu', icon: '📕' },
      { name: 'Indirect Taxes (IDT)', link: 'https://drive.google.com/drive/folders/1Z3JYyTSpRf04QhE26sdnzkxa7qEizfDT', icon: '📓' },
      { name: 'Integrated Bus. Sol.', link: 'https://drive.google.com/drive/folders/1KXTo6pobu7QKhC0TP7--g98quUFJn4rZ', icon: '📒' },
      { name: 'SPOM Modules', link: 'https://drive.google.com/drive/folders/1bzhLGBWUn2i_A6BoprToW-S8Majk29BV', icon: '💻' },
    ];
    return (
      <div className="space-y-6 animate-in fade-in">
        <div><h2 className="text-2xl font-bold tracking-tight mb-1">Faculty Notes Vault</h2><p className={`text-sm ${theme.textMuted}`}>Top CA faculty materials & summaries in one place.</p></div>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {notes.map((n, i) => (
            <a key={i} href={n.link} target="_blank" rel="noreferrer" className={`${theme.card} p-5 rounded-2xl transition-all hover:border-blue-500/30 flex flex-col items-start gap-3 group`}>
              <div className="text-3xl mb-1">{n.icon}</div>
              <h3 className="font-semibold text-sm leading-tight">{n.name}</h3>
              <div className={`mt-auto pt-2 text-xs font-semibold text-blue-500 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity`}>Access Drive <ExternalLink size={12} /></div>
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
      <div className="space-y-6 animate-in fade-in">
        <div><h2 className="text-2xl font-bold tracking-tight mb-1">Past Papers & MTPs</h2><p className={`text-sm ${theme.textMuted}`}>Direct access to subject-wise question banks.</p></div>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {papers.map((p, i) => (
            <a key={i} href={p.link} target="_blank" rel="noreferrer" className={`${theme.card} p-5 rounded-2xl transition-all hover:border-blue-500/30 flex flex-col items-start gap-3 group`}>
              <div className="text-3xl mb-1">{p.icon}</div>
              <h3 className="font-semibold text-sm leading-tight">{p.name}</h3>
              <div className={`mt-auto pt-2 text-xs font-semibold text-blue-500 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity`}>Open Bank <ExternalLink size={12} /></div>
            </a>
          ))}
        </div>
      </div>
    );
  };

  const renderQuickNotes = () => (
    <div className="space-y-6 h-[70vh] flex flex-col animate-in fade-in">
      <div><h2 className="text-2xl font-bold tracking-tight mb-1">Quick Notes</h2><p className={`text-sm ${theme.textMuted}`}>Draft temporary notes, auto-saved in your browser.</p></div>
      <div className={`${theme.cardSolid} rounded-2xl flex-1 flex flex-col overflow-hidden`}>
        <textarea
          className={`w-full h-full p-6 outline-none resize-none text-sm font-medium leading-relaxed bg-transparent ${theme.text}`}
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
      
      {/* SIDEBAR (REORDERED) */}
      <aside className={`w-64 border-r flex flex-col hidden md:flex transition-colors duration-300 ${theme.sidebar} z-10`}>
        <div className={`p-6 border-b flex flex-col items-start ${isLightMode ? 'border-slate-200' : 'border-zinc-800'}`}>
          <div className="flex items-center gap-3 mb-5">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-sm text-white">CA</div>
            <span className="font-bold text-lg tracking-tight">Sathi.ai</span>
          </div>
          <div className="w-full text-left pl-2.5 border-l-2 border-blue-500">
            <p className={`text-[9px] uppercase tracking-widest font-semibold leading-none mb-1 ${theme.textMuted}`}>Architected By</p>
            <p className="text-sm font-semibold text-blue-500 tracking-tight">Niket Talwar</p>
          </div>
        </div>
        
        <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto scrollbar-hide">
          {[
            { id: 'dashboard', name: 'Dashboard', icon: <LayoutDashboard size={18} /> },
            { id: 'planner', name: 'Study Planner', icon: <Calendar size={18} /> },
            { id: 'timer', name: 'Focus Timer', icon: <TimerIcon size={18} /> },
            { id: 'mentor', name: 'Expert Mentor', icon: <BrainCircuit size={18} /> }, // Moved Up
            { id: 'analytics', name: 'Analytics', icon: <BarChart2 size={18} /> }, // NEW
            { id: 'faculty_notes', name: 'Faculty Notes', icon: <FolderOpen size={18} /> },
            { id: 'past_papers', name: 'Past Papers', icon: <Library size={18} /> },
            { id: 'quick_notes', name: 'Quick Notes', icon: <FileText size={18} /> },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors text-sm ${
                activeTab === item.id ? theme.activeTab : theme.hoverTab
              }`}
            >
              {item.icon}
              <span>{item.name}</span>
            </button>
          ))}
        </nav>

        <div className={`p-4 border-t ${isLightMode ? 'border-slate-200' : 'border-zinc-800'}`}>
          <button 
            onClick={() => setIsLightMode(!isLightMode)}
            className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-lg transition-colors font-medium text-xs uppercase tracking-wider ${isLightMode ? 'bg-slate-100 text-slate-600 hover:bg-slate-200' : 'bg-zinc-800/50 text-zinc-400 hover:text-zinc-200'}`}
          >
            {isLightMode ? <Moon size={16} /> : <Sun size={16} />}
            {isLightMode ? 'Dark Mode' : 'Light Mode'}
          </button>
        </div>
      </aside>

      {/* DYNAMIC CONTENT AREA */}
      <main className="flex-1 relative overflow-y-auto scrollbar-hide">
        <div className="max-w-5xl mx-auto h-full p-8 pb-24">
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
          <div className={`${isLightMode ? 'bg-white border-slate-200' : 'bg-zinc-900 border-zinc-700'} border shadow-xl rounded-xl p-4 flex items-center gap-3 max-w-sm`}>
            <div className="p-2 bg-blue-500/10 text-blue-500 rounded-lg"><Bell size={18} /></div>
            <p className={`text-sm font-medium ${theme.text}`}>{toastMessage}</p>
          </div>
        </div>
      )}
      
    </div>
  );
}