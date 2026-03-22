import React, { useState, useEffect, useRef } from 'react';
import {
  LayoutDashboard,
  CalendarCheck,
  Timer as TimerIcon,
  MessageSquare,
  TrendingUp,
  BookOpen,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Play,
  Pause,
  RotateCcw,
  Send,
  Flame,
  Calendar,
  BrainCircuit,
  Target,
  FileText,
  Sun,
  Moon,
  Maximize,
  Minimize,
  Library,
  ExternalLink,
  FolderOpen
} from 'lucide-react';

// --- BROWSER MEMORY HOOK ---
function useLocalStorage(key, initialValue) {
  const [value, setValue] = React.useState(() => {
    const saved = localStorage.getItem(key);
    if (saved !== null) {
      try { return JSON.parse(saved); } catch { return saved; }
    }
    return initialValue;
  });

  React.useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);

  return [value, setValue];
}

// --- SIMULATED AI MENTOR BRAIN (For Auto-triggers) ---
const generateMentorResponse = (trigger, context = {}, userMessage = '') => {
  const { hoursToday = 0, targetHours = 10, daysLeft = 0, streak = 0, escalation = 0 } = context;

  const responses = {
    check_in: [
      '2 ghante ho gaye. What have you completed? Give me a quick update.',
      'Are you on track today? Syllabus wait nahi karega.',
    ],
    missed_target: [
      'You planned target hours and completed barely anything. This is not acceptable.',
      `Exam me sirf ${daysLeft} days bache hain aur tumhara yeh haal hai. Wake up!`,
    ],
    good_session: [
      "Good focus. But don't get comfortable. Take your break.",
      "That's how a CA student studies. Keep this momentum going.",
    ],
    streak_break: [
      'Streak broken. This is exactly how attempts are lost. Back to zero.',
    ],
    urgency_90_plus: "You have time. Build strong concepts. But don't waste days.",
    urgency_30_to_90: 'Now consistency matters. No more delays. Every single day counts.',
    urgency_less_30: 'Final phase. Every hour counts. Drop everything else and focus.',
    urgency_less_10: 'No excuses. Full revision mode. Do or die.',
    general_chat: [
      "CA doesn't care about your mood. It cares about discipline.",
      'Stop scrolling. Go back to your books.',
    ],
  };

  if (trigger === 'urgency') {
    if (daysLeft > 90) return responses.urgency_90_plus;
    if (daysLeft > 30) return responses.urgency_30_to_90;
    if (daysLeft > 10) return responses.urgency_less_30;
    return responses.urgency_less_10;
  }

  if (responses[trigger]) {
    const opts = responses[trigger];
    if (escalation >= 2 && trigger === 'missed_target') return 'Warning: If you continue this behavior, you are going to fail. Change your attitude right now.';
    return opts[Math.floor(Math.random() * opts.length)];
  }
  return responses.general_chat[0];
};

export default function CASathiApp() {
  // --- THEME STATE ---
  const [isLightMode, setIsLightMode] = useLocalStorage('ca-theme-light', false);

  const theme = {
    bg: isLightMode ? 'bg-slate-50' : 'bg-[#0a0f1c]',
    text: isLightMode ? 'text-slate-900' : 'text-slate-200',
    sidebar: isLightMode ? 'bg-white border-slate-200' : 'bg-slate-950 border-slate-800',
    card: isLightMode ? 'bg-white border-slate-200 shadow-sm' : 'bg-gray-800/30 border-gray-700/50',
    cardSolid: isLightMode ? 'bg-white border-slate-200 shadow-md' : 'bg-gray-900/80 border-gray-700/50',
    input: isLightMode ? 'bg-slate-50 border-slate-300 text-slate-900 focus:border-blue-500' : 'bg-gray-800/40 border-gray-700 text-gray-100 focus:border-yellow-500/50',
    textMuted: isLightMode ? 'text-slate-500' : 'text-gray-400',
    hoverTab: isLightMode ? 'hover:bg-slate-100 text-slate-600 hover:text-blue-600' : 'hover:bg-slate-900 text-gray-400 hover:text-white',
    activeTab: isLightMode ? 'bg-blue-50 text-blue-600 border border-blue-200 shadow-sm' : 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
  };

  // --- STATE MANAGEMENT ---
  const [activeTab, setActiveTab] = React.useState('dashboard');
  const [examDate, setExamDate] = useLocalStorage('ca-examDate', '');
  const [targetHours, setTargetHours] = useLocalStorage('ca-targetHours', 10);
  const [hoursStudiedToday, setHoursStudiedToday] = useLocalStorage('ca-hoursToday', 0);
  const [streak, setStreak] = useLocalStorage('ca-streak', 0);
  const [escalationLevel, setEscalationLevel] = useLocalStorage('ca-escalation', 0);

  const rawDaysLeft = examDate ? Math.ceil((new Date(examDate) - new Date()) / (1000 * 60 * 60 * 24)) : 0;
  const daysLeft = Math.max(1, rawDaysLeft);
  const reqDailyHours = hoursStudiedToday < targetHours ? (targetHours + (targetHours - hoursStudiedToday) / daysLeft).toFixed(1) : targetHours;

  const [tasks, setTasks] = useLocalStorage('ca-tasks', []);
  const [chatHistory, setChatHistory] = useLocalStorage('ca-chat', [
    { sender: 'mentor', text: "Hello! I am your AI Mentor. You can ask me CA Final subject doubts (FR, Audit, DT, etc.), ask for daily planning, or just talk to me if you are stressed. How can I help you today?", time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) },
  ]);
  const [chatInput, setChatInput] = React.useState('');
  
  const [workDuration, setWorkDuration] = useLocalStorage('ca-work-duration', 50);
  const [breakDuration, setBreakDuration] = useLocalStorage('ca-break-duration', 10);
  const [timerMode, setTimerMode] = useState('pomodoro');
  const [timeLeft, setTimeLeft] = useState(workDuration * 60);
  const [isActive, setIsActive] = useState(false);
  const [showSessionLog, setShowSessionLog] = useState(false);
  
  const timerRef = useRef(null);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [showAddTaskModal, setShowAddTaskModal] = React.useState(false);
  const [newTask, setNewTask] = React.useState({ subject: '', topic: '', duration: 2, difficulty: 'Medium', timeOfDay: 'Morning' });

  // --- LOGIC FUNCTIONS ---
  const handleAddTask = (e) => {
    e.preventDefault();
    if (!newTask.subject || !newTask.topic) return;
    setTasks([...tasks, { ...newTask, id: Date.now(), status: 'pending' }]);
    setShowAddTaskModal(false);
    setNewTask({ subject: '', topic: '', duration: 2, difficulty: 'Medium', timeOfDay: 'Morning' });
  };

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

  const toggleFullScreen = () => {
    if (!document.fullscreenElement) { timerRef.current?.requestFullscreen().catch(err => console.log(err)); } 
    else { document.exitFullscreen(); }
  };

  const handleWorkTimeChange = (e) => {
    const val = Number(e.target.value);
    setWorkDuration(val);
    if (timerMode === 'pomodoro' && !isActive) setTimeLeft(val * 60);
  };

  const handleBreakTimeChange = (e) => {
    const val = Number(e.target.value);
    setBreakDuration(val);
    if (timerMode === 'shortBreak' && !isActive) setTimeLeft(val * 60);
  };

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

  const logSessionResult = (status) => {
    setShowSessionLog(false);
    if (status === 'completed') {
      setHoursStudiedToday((prev) => prev + (workDuration / 60));
      addMentorMessage(generateMentorResponse('good_session', { hoursToday: hoursStudiedToday, targetHours, daysLeft, streak, escalation: escalationLevel }));
      setEscalationLevel(0);
      setTimerMode('shortBreak');
      setTimeLeft(breakDuration * 60);
      setIsActive(true);
    } else if (status === 'partial') {
      setHoursStudiedToday((prev) => prev + ((workDuration/2) / 60));
      addMentorMessage('Partial completion is just procrastination. Why did you stop?');
      setEscalationLevel((prev) => prev + 1);
    } else {
      addMentorMessage(generateMentorResponse('missed_target', { hoursToday: hoursStudiedToday, targetHours, daysLeft, streak, escalation: escalationLevel }));
      setEscalationLevel((prev) => prev + 1);
    }
  };

  const addMentorMessage = (text, sender = 'mentor') => {
    setChatHistory((prev) => [...prev, { sender, text, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
  };

  // --- UPGRADED AI MENTOR API LOGIC ---
  const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
  const handleChatSubmit = async (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    const userText = chatInput;
    addMentorMessage(userText, 'user');
    setChatInput('');
    addMentorMessage('...', 'mentor');

    const prompt = `
    You are 'Sathi,' an elite CA Mentor and an all-rounder expert in Finance, Audit, Taxation, and the entire CA Final curriculum. Your tone is professional English & sometime Hinglish (a natural mix of Hindi and English), acting like a highly knowledgeable, empathetic, and supportive big brother from the 'Audit Cubicles' brand.
    
    Your Core Capabilities:
    1. SUBJECT EXPERT: Answer technical and subjective doubts perfectly for subjects like FR, AFM, Audit, DT, IDT, and IBS. Explain concepts clearly with practical examples and section references if needed.
    2. STRATEGIST & PLANNER: Help students plan their day, create revision strategies, optimize their timetables, and guide them on how to approach specific subjects.
    3. MOTIVATOR: Be deeply empathetic and supportive when they are stressed or burnt out. Remind them of their potential. However, use 'tough love' if they are making silly excuses.

    Live Context of the Student:
    - Exam is in ${daysLeft} days.
    - Target today: ${targetHours} hours.
    - Completed today: ${hoursStudiedToday} hours.
    - Current streak: ${streak} days.
    
    Rules for response: 
    - Give highly practical, actionable CA-specific advice. 
    - Format your answers nicely using short paragraphs or bullet points for readability.
    - Never break character. Never state that you are an AI.
    
    Student says: "${userText}"
    `;

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
        { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }) }
      );
      const data = await response.json();
      if (data.error) throw new Error(data.error.message);
      const aiReply = data.candidates[0].content.parts[0].text;
      setChatHistory((prev) => {
        const newHistory = [...prev];
        newHistory[newHistory.length - 1] = { sender: 'mentor', text: aiReply, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
        return newHistory;
      });
    } catch (error) {
      setChatHistory((prev) => {
        const newHistory = [...prev];
        newHistory[newHistory.length - 1] = { sender: 'mentor', text: `SYSTEM ERROR: Unable to connect to the brain. Check your API Key.`, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
        return newHistory;
      });
    }
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const toggleTaskStatus = (id) => {
    setTasks(tasks.map((t) => {
      if (t.id === id) {
        const nextStatus = t.status === 'pending' ? 'completed' : t.status === 'completed' ? 'partial' : 'pending';
        return { ...t, status: nextStatus };
      }
      return t;
    }));
  };

  // --- RENDER FUNCTIONS ---
  const renderDashboard = () => (
    <div className="space-y-6">
      <div className={`border ${isLightMode ? 'bg-red-50 border-red-200' : 'bg-red-950/40 border-red-900/50'} rounded-xl p-6 relative overflow-hidden`}>
        <div className={`absolute top-0 right-0 w-32 h-32 ${isLightMode ? 'bg-red-200' : 'bg-red-600/10'} rounded-full blur-3xl`}></div>
        <div className="flex justify-between items-center relative z-10">
          <div>
            <h2 className="text-red-500 font-bold tracking-wider text-sm mb-1 uppercase">Mission CA Final</h2>
            <div className="flex items-baseline gap-3">
              <span className={`text-5xl font-black ${isLightMode ? 'text-slate-900' : 'text-white'}`}>{daysLeft}</span>
              <span className={`text-xl ${theme.textMuted} font-medium`}>Days Left</span>
            </div>
            <p className={`mt-2 ${isLightMode ? 'text-red-700' : 'text-red-200/80'} text-sm font-medium border-l-2 border-red-500 pl-3`}>"{generateMentorResponse('urgency', { daysLeft })}"</p>
          </div>
          <div className="text-right">
            <div className={`text-sm ${theme.textMuted} mb-1`}>Target Date</div>
            <input type="date" value={examDate} onChange={(e) => setExamDate(e.target.value)} className={`${theme.input} rounded px-3 py-1 font-mono text-sm focus:outline-none`} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className={`${theme.card} p-5 rounded-xl flex items-center gap-4`}>
          <div className="p-3 bg-blue-500/20 text-blue-500 rounded-lg"><Target size={24} /></div>
          <div>
            <div className={`text-sm ${theme.textMuted}`}>Today's Progress</div>
            <div className="text-2xl font-bold">{hoursStudiedToday.toFixed(1)} / {targetHours} <span className={`text-sm font-normal ${theme.textMuted}`}>hrs</span></div>
            <div className={`w-full ${isLightMode ? 'bg-gray-200' : 'bg-gray-700'} h-1.5 mt-2 rounded-full overflow-hidden`}>
              <div className="bg-blue-500 h-full" style={{ width: `${(hoursStudiedToday / targetHours) * 100}%` }}></div>
            </div>
          </div>
        </div>
        <div className={`${theme.card} p-5 rounded-xl flex items-center gap-4`}>
          <div className="p-3 bg-orange-500/20 text-orange-500 rounded-lg"><Flame size={24} /></div>
          <div>
            <div className={`text-sm ${theme.textMuted}`}>Consistency Streak</div>
            <div className="text-2xl font-bold">{streak} <span className={`text-sm font-normal ${theme.textMuted}`}>Days</span></div>
            <div className="text-xs text-orange-500 mt-1">Maintained Pace</div>
          </div>
        </div>
        <div className={`${theme.card} ${hoursStudiedToday < targetHours && !isLightMode ? 'border-red-900/50 bg-red-950/20' : ''} p-5 rounded-xl flex items-center gap-4`}>
          <div className={`p-3 rounded-lg ${hoursStudiedToday < targetHours ? 'bg-red-500/20 text-red-500' : 'bg-green-500/20 text-green-500'}`}><TrendingUp size={24} /></div>
          <div>
            <div className={`text-sm ${theme.textMuted}`}>Required Daily Pace</div>
            <div className="text-2xl font-bold">{reqDailyHours} <span className={`text-sm font-normal ${theme.textMuted}`}>hrs/day</span></div>
            <div className={`text-xs mt-1 ${hoursStudiedToday < targetHours ? 'text-red-500' : 'text-green-500'}`}>
              {hoursStudiedToday < targetHours ? `You lost time. Pace increased.` : 'On track. Maintain pace.'}
            </div>
          </div>
        </div>
      </div>

      <div className={`${theme.card} rounded-xl p-6`}>
        <h3 className="text-lg font-bold mb-4 flex items-center gap-2"><Calendar size={18} className="text-blue-500" /> Today's Battle Plan</h3>
        <div className="space-y-3">
          {tasks.map((task) => (
            <div key={task.id} className={`flex items-center justify-between p-3 ${theme.cardSolid} rounded-lg border`}>
              <div className="flex items-center gap-4">
                <button onClick={() => toggleTaskStatus(task.id)}>
                  {task.status === 'completed' && <CheckCircle className="text-green-500" size={20} />}
                  {task.status === 'partial' && <AlertTriangle className="text-yellow-500" size={20} />}
                  {task.status === 'pending' && <div className={`w-5 h-5 rounded-full border-2 ${isLightMode ? 'border-gray-400' : 'border-gray-600'}`}></div>}
                </button>
                <div>
                  <div className="font-medium flex items-center gap-2">
                    {task.subject}: {task.topic}
                    <span className={`text-[10px] px-2 py-0.5 rounded uppercase font-bold tracking-wider ${task.difficulty === 'Hard' ? 'bg-red-500/20 text-red-500' : 'bg-yellow-500/20 text-yellow-600'}`}>{task.difficulty}</span>
                  </div>
                  <div className={`text-xs ${theme.textMuted} mt-0.5`}>{task.timeOfDay} Block • {task.duration} Hours</div>
                </div>
              </div>
              <div className="text-right">
                {task.status === 'completed' ? <span className="text-xs font-bold text-green-500 uppercase">Logged</span> : <button onClick={() => setActiveTab('timer')} className="text-xs bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded font-medium transition-colors">Start Session</button>}
              </div>
            </div>
          ))}
          {tasks.length === 0 && <p className={`text-center py-4 ${theme.textMuted} italic`}>No tasks assigned. Go to Study Planner.</p>}
        </div>
      </div>
    </div>
  );

  // --- UPGRADED AI MENTOR UI ---
  const renderMentor = () => (
    <div className={`flex flex-col h-[calc(100vh-8rem)] ${theme.cardSolid} rounded-xl overflow-hidden`}>
      <div className={`p-4 ${isLightMode ? 'bg-gray-100 border-b border-gray-200' : 'bg-gray-800 border-b border-gray-700'} flex items-center justify-between`}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center border border-blue-500/30 text-blue-500"><BrainCircuit size={20} /></div>
          <div><h3 className="font-bold">Expert AI Mentor</h3><p className={`text-xs ${theme.textMuted} font-mono tracking-wider`}>Finance, Strategy & Support</p></div>
        </div>
        <div className={`text-xs ${theme.textMuted} font-mono`}>Escalation Lvl: {escalationLevel}</div>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {chatHistory.map((msg, i) => (
          <div key={i} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] p-4 rounded-xl text-sm leading-relaxed whitespace-pre-wrap ${msg.sender === 'user' ? 'bg-blue-600 text-white rounded-br-none' : (isLightMode ? 'bg-white border border-gray-200 rounded-bl-none text-slate-800 shadow-sm' : 'bg-gray-800 border border-gray-700 text-gray-200 rounded-bl-none shadow-sm')}`}>
              {msg.text}
              <div className="text-[10px] text-right opacity-50 mt-2">{msg.time}</div>
            </div>
          </div>
        ))}
      </div>
      <form onSubmit={handleChatSubmit} className={`p-4 ${isLightMode ? 'bg-gray-100 border-t border-gray-200' : 'bg-gray-800 border-t border-gray-700'} flex gap-2`}>
        <input type="text" value={chatInput} onChange={(e) => setChatInput(e.target.value)} placeholder="Ask an Audit doubt, request a timetable, or get advice..." className={`flex-1 ${theme.input} rounded-xl px-4 py-3 text-sm outline-none`} />
        <button type="submit" className="bg-blue-600 hover:bg-blue-500 text-white px-5 rounded-xl transition-colors font-bold"><Send size={20} /></button>
      </form>
    </div>
  );

  const renderTimer = () => (
    <div ref={timerRef} className={`h-full flex flex-col items-center justify-center relative transition-all ${isFullScreen ? (isLightMode ? 'bg-slate-50' : 'bg-[#0a0f1c]') : ''}`}>
      <button onClick={toggleFullScreen} className={`absolute top-4 right-4 p-2 rounded-lg transition-colors ${isLightMode ? 'text-slate-500 hover:bg-slate-200' : 'text-gray-400 hover:bg-gray-800'}`} title={isFullScreen ? "Exit Fullscreen" : "Go Fullscreen"}>
        {isFullScreen ? <Minimize size={24} /> : <Maximize size={24} />}
      </button>

      <div className="text-center w-full max-w-md">
        <h2 className={`text-xl font-bold mb-6 uppercase tracking-widest ${theme.textMuted}`}>{timerMode === 'pomodoro' ? 'Focus Session' : 'Strict Break'}</h2>
        
        {!isActive && !isFullScreen && (
          <div className="flex justify-center gap-6 mb-6">
            <div className="flex flex-col items-center">
              <label className={`text-xs mb-1 font-semibold ${theme.textMuted}`}>Work (Min)</label>
              <input type="number" value={workDuration} onChange={handleWorkTimeChange} className={`w-16 text-center rounded p-1 font-mono ${theme.input}`} />
            </div>
            <div className="flex flex-col items-center">
              <label className={`text-xs mb-1 font-semibold ${theme.textMuted}`}>Break (Min)</label>
              <input type="number" value={breakDuration} onChange={handleBreakTimeChange} className={`w-16 text-center rounded p-1 font-mono ${theme.input}`} />
            </div>
          </div>
        )}

        <div className={`text-8xl md:text-[10rem] font-black font-mono tracking-tighter leading-none mb-12 ${timerMode === 'shortBreak' ? 'text-green-500' : isActive ? (isLightMode ? 'text-slate-900' : 'text-white') : theme.textMuted}`}>
          {formatTime(timeLeft)}
        </div>
        
        <div className="flex justify-center gap-6 mb-12">
          <button onClick={() => setIsActive(!isActive)} className={`w-20 h-20 rounded-full flex items-center justify-center transition-all shadow-lg ${isActive ? 'bg-red-500/10 text-red-500 border-2 border-red-500' : 'bg-blue-600 text-white hover:bg-blue-500 hover:scale-105'}`}>
            {isActive ? <Pause size={32} /> : <Play size={32} className="ml-1" />}
          </button>
          <button onClick={() => { setIsActive(false); setTimeLeft(timerMode === 'pomodoro' ? workDuration * 60 : breakDuration * 60); }} className={`w-16 h-16 rounded-full flex items-center justify-center transition-all border ${isLightMode ? 'bg-white border-gray-300 hover:bg-gray-100' : 'bg-gray-800 border-gray-700 hover:text-white'}`}>
            <RotateCcw size={24} />
          </button>
        </div>

        {!isFullScreen && (
          <div className={`${theme.cardSolid} rounded-xl p-4 text-left`}>
            <div className={`text-xs font-mono mb-2 ${theme.textMuted}`}>CURRENTLY EXECUTING:</div>
            <select className={`w-full rounded p-2 text-sm outline-none ${theme.input}`}>
              {tasks.filter((t) => t.status !== 'completed').map((t) => <option key={t.id}>{t.subject} - {t.topic}</option>)}
              {tasks.filter((t) => t.status !== 'completed').length === 0 && <option>No active tasks</option>}
            </select>
          </div>
        )}
      </div>

      {showSessionLog && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className={`${theme.cardSolid} rounded-2xl p-8 max-w-sm w-full text-center`}>
            <h3 className="text-2xl font-bold mb-2">Session Over</h3>
            <p className={`text-sm mb-6 ${theme.textMuted}`}>Mentor is asking: How much did you actually study?</p>
            <div className="space-y-3">
              <button onClick={() => logSessionResult('completed')} className="w-full py-3 bg-green-500/10 text-green-500 border border-green-500/50 hover:bg-green-500/20 rounded-lg font-bold flex items-center justify-center gap-2"><CheckCircle size={18} /> Fully Completed</button>
              <button onClick={() => logSessionResult('partial')} className="w-full py-3 bg-yellow-500/10 text-yellow-600 border border-yellow-500/50 hover:bg-yellow-500/20 rounded-lg font-bold flex items-center justify-center gap-2"><AlertTriangle size={18} /> Partially Completed</button>
              <button onClick={() => logSessionResult('failed')} className="w-full py-3 bg-red-500/10 text-red-500 border border-red-500/50 hover:bg-red-500/20 rounded-lg font-bold flex items-center justify-center gap-2"><XCircle size={18} /> Wasted Session</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderPlanner = () => (
    <div className="space-y-6 relative">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Planning Engine</h2>
        <button onClick={() => setShowAddTaskModal(true)} className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-[0_0_10px_rgba(37,99,235,0.4)]">+ Add New Task</button>
      </div>
      <div className={`${theme.card} rounded-xl p-6`}>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className={`font-mono text-xs uppercase border-b ${isLightMode ? 'text-gray-500 border-gray-200' : 'text-gray-500 border-gray-700'}`}>
              <tr>
                <th className="pb-3 font-medium">Subject & Topic</th>
                <th className="pb-3 font-medium">Block</th>
                <th className="pb-3 font-medium">Difficulty</th>
                <th className="pb-3 font-medium">Target Hrs</th>
                <th className="pb-3 font-medium">Action</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${isLightMode ? 'divide-gray-100' : 'divide-gray-800'}`}>
              {tasks.map((task) => (
                <tr key={task.id}>
                  <td className="py-4 font-medium">{task.subject}: <span className={theme.textMuted}>{task.topic}</span></td>
                  <td className="py-4">{task.timeOfDay}</td>
                  <td className="py-4"><span className={`px-2 py-1 rounded text-xs font-semibold ${task.difficulty === 'Hard' ? 'bg-red-500/10 text-red-500' : task.difficulty === 'Medium' ? 'bg-yellow-500/10 text-yellow-600' : 'bg-green-500/10 text-green-500'}`}>{task.difficulty}</span></td>
                  <td className="py-4 font-mono">{task.duration}h</td>
                  <td className="py-4"><button onClick={() => setTasks(tasks.filter((t) => t.id !== task.id))} className="text-red-500 hover:text-red-600 text-xs font-bold uppercase tracking-wide">Delete</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showAddTaskModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <div className={`${theme.cardSolid} rounded-2xl p-6 max-w-md w-full shadow-2xl`}>
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2"><BookOpen size={20} className="text-blue-500" /> Add Target</h3>
            <form onSubmit={handleAddTask} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><label className={`text-xs mb-1 block ${theme.textMuted}`}>Subject</label><input type="text" value={newTask.subject} onChange={(e) => setNewTask({ ...newTask, subject: e.target.value })} className={`w-full rounded p-2 text-sm outline-none ${theme.input}`} required /></div>
                <div><label className={`text-xs mb-1 block ${theme.textMuted}`}>Topic</label><input type="text" value={newTask.topic} onChange={(e) => setNewTask({ ...newTask, topic: e.target.value })} className={`w-full rounded p-2 text-sm outline-none ${theme.input}`} required /></div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div><label className={`text-xs mb-1 block ${theme.textMuted}`}>Hours</label><input type="number" step="0.5" min="0.5" value={newTask.duration} onChange={(e) => setNewTask({ ...newTask, duration: Number(e.target.value) })} className={`w-full rounded p-2 text-sm outline-none ${theme.input}`} required /></div>
                <div><label className={`text-xs mb-1 block ${theme.textMuted}`}>Level</label><select value={newTask.difficulty} onChange={(e) => setNewTask({ ...newTask, difficulty: e.target.value })} className={`w-full rounded p-2 text-sm outline-none ${theme.input}`}><option>Hard</option><option>Medium</option><option>Easy</option></select></div>
                <div><label className={`text-xs mb-1 block ${theme.textMuted}`}>Block</label><select value={newTask.timeOfDay} onChange={(e) => setNewTask({ ...newTask, timeOfDay: e.target.value })} className={`w-full rounded p-2 text-sm outline-none ${theme.input}`}><option>Morning</option><option>Afternoon</option><option>Night</option></select></div>
              </div>
              <div className={`flex gap-3 mt-8 pt-4 border-t ${isLightMode ? 'border-gray-200' : 'border-gray-800'}`}>
                <button type="button" onClick={() => setShowAddTaskModal(false)} className={`flex-1 py-2.5 rounded-lg text-sm font-medium ${isLightMode ? 'bg-gray-100 hover:bg-gray-200 text-slate-700' : 'bg-gray-800 hover:bg-gray-700 text-gray-300'}`}>Cancel</button>
                <button type="submit" className="flex-1 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-500 text-sm font-bold">Save Target</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );

  const renderPastPapers = () => {
    const papers = [
      { name: 'Financial Reporting (FR)', link: 'https://www.castudypartner.com/view/all_questions/id=ZhMn2SLrHqCWa7izgCHWVXoqv9o31c3zCd7a6BZBdRQ=/type=aBiUXQHw15Q33rsRD5ideZvMa3Oq-gDQc-p_p8a0vBU=/subject=UeoGTdCOXR9vcXrH2Ixm0zA-5qpL43ovTx6iamI8bPw=/index=HjR8OI_C92vfg2wkAKIEVBKwp0dEP3hrT8uAcW2pUOY=', icon: '📊', border: 'border-blue-500/30 hover:border-blue-500' },
      { name: 'Advanced Financial Management', link: 'https://www.castudypartner.com/view/all_questions/id=ZhMn2SLrHqCWa7izgCHWVXoqv9o31c3zCd7a6BZBdRQ=/type=aBiUXQHw15Q33rsRD5ideZvMa3Oq-gDQc-p_p8a0vBU=/subject=nzKn-ijbXOsXihFYuZuZ6-yR3O7rz5s5pFDwc0kFWXg=/index=rAymKoVQaLKzGCWL_i2PP4gzLRaKgE_1Nu8iB3d8HXo=', icon: '📈', border: 'border-green-500/30 hover:border-green-500' },
      { name: 'Audit & Assurance', link: 'https://www.castudypartner.com/view/all_questions/id=ZhMn2SLrHqCWa7izgCHWVXoqv9o31c3zCd7a6BZBdRQ=/type=aBiUXQHw15Q33rsRD5ideZvMa3Oq-gDQc-p_p8a0vBU=/subject=N8Irnu1rh71zD1hw5b1Iho579hPZG2TfcYxL3kAtmow=/index=LYlBZAJ5rzMMo-bLpeEC1z1Vu6hvFQgciswiJZR5N0I=', icon: '🔍', border: 'border-purple-500/30 hover:border-purple-500' },
      { name: 'Direct Taxes (DT)', link: 'https://www.castudypartner.com/view/all_questions/id=ZhMn2SLrHqCWa7izgCHWVXoqv9o31c3zCd7a6BZBdRQ=/type=aBiUXQHw15Q33rsRD5ideZvMa3Oq-gDQc-p_p8a0vBU=/subject=8y5m11WZYYQ61D94xGPF2eEcUme4g3cQivnx_Ia1v6Q=/index=diFiR7ZcZzLCkOruyZs6TF7eiQTTgt4-ZY8KPrGPalg=', icon: '💰', border: 'border-orange-500/30 hover:border-orange-500' },
      { name: 'Indirect Taxes (IDT)', link: 'https://www.castudypartner.com/view/all_questions/id=ZhMn2SLrHqCWa7izgCHWVXoqv9o31c3zCd7a6BZBdRQ=/type=aBiUXQHw15Q33rsRD5ideZvMa3Oq-gDQc-p_p8a0vBU=/subject=yiC0c50Q_LZATuRNxhKGY-vVnCmb35XHX1qJLUCg6rg=/index=V6rijQR0M1NyCnUmIud0qmSbfUsoWPbhBF1vaGYvLZo=', icon: '🏛️', border: 'border-red-500/30 hover:border-red-500' },
      { name: 'Integrated Business Solutions', link: 'https://www.castudypartner.com/view/all_questions/id=ZhMn2SLrHqCWa7izgCHWVXoqv9o31c3zCd7a6BZBdRQ=/type=aBiUXQHw15Q33rsRD5ideZvMa3Oq-gDQc-p_p8a0vBU=/subject=Wk2SeRfZ_3nIE7JER5YukXWCQAyOPdluvJ-t2L8hLSg=/index=NE6rAQ9isAAETZPXslGFhxfzuWG3zDWGYzylSlJwxNI=', icon: '💼', border: 'border-indigo-500/30 hover:border-indigo-500' },
    ];

    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold mb-2">Past Papers, RTPs & MTPs</h2>
          <p className={`${theme.textMuted} text-sm`}>Access subject-wise question banks, mock tests, and revision papers directly.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {papers.map((paper, index) => (
            <a key={index} href={paper.link} target="_blank" rel="noopener noreferrer" className={`${theme.cardSolid} p-6 rounded-2xl border-2 transition-all transform hover:-translate-y-1 hover:shadow-lg ${paper.border} flex flex-col items-center text-center gap-3`}>
              <div className="text-4xl mb-2 drop-shadow-md">{paper.icon}</div>
              <h3 className={`font-bold text-lg leading-tight ${theme.text}`}>{paper.name}</h3>
              <div className={`mt-2 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-2 ${isLightMode ? 'bg-slate-100 text-slate-600' : 'bg-gray-800 text-gray-300'}`}>
                Open Bank <ExternalLink size={14} />
              </div>
            </a>
          ))}
        </div>
      </div>
    );
  };

  // --- NEW: FACULTY NOTES VAULT ---
  const renderFacultyNotes = () => {
    const notes = [
      { name: 'Financial Reporting (FR)', link: 'https://drive.google.com/drive/folders/16gN9MHrV7l9VHFFOaIrTz0IC7dl4GHIx', icon: '📘', border: 'border-blue-500/30 hover:border-blue-500' },
      { name: 'Advanced Financial Management', link: 'https://drive.google.com/drive/folders/1xIYTwL3RLmC7ELMrZKky_Q1kdico9VqD', icon: '📗', border: 'border-green-500/30 hover:border-green-500' },
      { name: 'Audit & Assurance', link: 'https://drive.google.com/drive/folders/1VTFcIFznC7zpWVAWlDgY9x9NtEheBzlI', icon: '📙', border: 'border-purple-500/30 hover:border-purple-500' },
      { name: 'Direct Taxes (DT)', link: 'https://drive.google.com/drive/folders/1j5o0WKVNtD7CxMNIrgznjfQnI4CYdheu', icon: '📕', border: 'border-orange-500/30 hover:border-orange-500' },
      { name: 'Indirect Taxes (IDT)', link: 'https://drive.google.com/drive/folders/1Z3JYyTSpRf04QhE26sdnzkxa7qEizfDT', icon: '📓', border: 'border-red-500/30 hover:border-red-500' },
      { name: 'Integrated Business Solutions', link: 'https://drive.google.com/drive/folders/1KXTo6pobu7QKhC0TP7--g98quUFJn4rZ', icon: '📒', border: 'border-indigo-500/30 hover:border-indigo-500' },
      { name: 'SPOM', link: 'https://drive.google.com/drive/folders/1bzhLGBWUn2i_A6BoprToW-S8Majk29BV', icon: '💻', border: 'border-cyan-500/30 hover:border-cyan-500' },
    ];

    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold mb-2">Subject Wise Faculty Notes</h2>
          <p className={`${theme.textMuted} text-sm`}>Access comprehensive study materials, summary charts, and notes of top CA faculties.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {notes.map((note, index) => (
            <a key={index} href={note.link} target="_blank" rel="noopener noreferrer" className={`${theme.cardSolid} p-6 rounded-2xl border-2 transition-all transform hover:-translate-y-1 hover:shadow-lg ${note.border} flex flex-col items-center text-center gap-3`}>
              <div className="text-4xl mb-2 drop-shadow-md">{note.icon}</div>
              <h3 className={`font-bold text-lg leading-tight ${theme.text}`}>{note.name}</h3>
              <div className={`mt-2 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-2 ${isLightMode ? 'bg-slate-100 text-slate-600' : 'bg-gray-800 text-gray-300'}`}>
                Open Drive <FolderOpen size={14} />
              </div>
            </a>
          ))}
        </div>
      </div>
    );
  };

  const renderQuickNotes = () => (
    <div className="space-y-6 overflow-y-auto max-h-[75vh] p-2 text-left">
      <div className={`p-6 ${theme.cardSolid} rounded-3xl shadow-xl`}>
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-yellow-500/10 rounded-lg border border-yellow-500/20"><span className="text-xl">📝</span></div>
          <div>
            <h3 className="font-bold text-lg leading-tight uppercase tracking-wider">Quick Study Notes</h3>
            <p className={`text-xs italic font-light ${theme.textMuted}`}>Draft temporary notes, saved locally in your browser.</p>
          </div>
        </div>
        <textarea
          className={`w-full h-[50vh] p-4 rounded-xl outline-none resize-none font-sans ${theme.input}`}
          placeholder="Enter important section numbers, audit standards, or your daily targets here..."
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
      <aside className={`w-64 border-r flex flex-col hidden md:flex transition-colors duration-300 ${theme.sidebar}`}>
        <div className={`p-6 border-b flex flex-col items-start ${isLightMode ? 'border-slate-200' : 'border-slate-800'}`}>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center font-black text-white shadow-lg shadow-blue-500/20">CA</div>
            <span className="font-bold text-xl tracking-wide">Sathi.ai</span>
          </div>
          
          <div className="w-full text-left pl-2 border-l-2 border-blue-500/50">
            <p className={`text-[9px] uppercase tracking-widest font-semibold leading-none mb-1 ${theme.textMuted}`}>Created By</p>
            <p className="text-sm font-bold text-blue-500 tracking-wide">Niket Talwar</p>
          </div>
        </div>
        
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {[
            { id: 'dashboard', name: 'Dashboard', icon: <LayoutDashboard size={20} /> },
            { id: 'planner', name: 'Study Planner', icon: <Calendar size={20} /> },
            { id: 'timer', name: 'Focus Timer', icon: <TimerIcon size={20} /> },
            { id: 'faculty_notes', name: 'Faculty Notes', icon: <FolderOpen size={20} /> },
            { id: 'past_papers', name: 'Past Papers & MTPs', icon: <Library size={20} /> },
            { id: 'quick_notes', name: 'Quick Notes', icon: <FileText size={20} /> },
            { id: 'mentor', name: 'Expert CA Mentor', icon: <BrainCircuit size={20} /> },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                activeTab === item.id ? theme.activeTab : theme.hoverTab
              }`}
            >
              {item.icon}
              <span className="font-medium text-sm">{item.name}</span>
            </button>
          ))}
        </nav>

        {/* Theme Toggle Button */}
        <div className={`p-4 border-t ${isLightMode ? 'border-slate-200' : 'border-slate-800'}`}>
          <button 
            onClick={() => setIsLightMode(!isLightMode)}
            className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-lg transition-colors font-medium text-sm ${isLightMode ? 'bg-slate-100 text-slate-700 hover:bg-slate-200' : 'bg-slate-800 text-gray-300 hover:bg-slate-700'}`}
          >
            {isLightMode ? <Moon size={18} /> : <Sun size={18} />}
            {isLightMode ? 'Switch to Dark' : 'Switch to Light'}
          </button>
        </div>
      </aside>

      {/* DYNAMIC CONTENT AREA */}
      <main className="flex-1 relative overflow-y-auto">
        <div className="max-w-5xl mx-auto h-full p-8 pb-24">
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