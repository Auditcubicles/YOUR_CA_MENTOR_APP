import React, { useState, useEffect } from 'react';
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
  FileText
} from 'lucide-react';

// --- BROWSER MEMORY HOOK ---
function useLocalStorage(key, initialValue) {
  const [value, setValue] = React.useState(() => {
    const saved = localStorage.getItem(key);
    if (saved !== null) {
      try {
        return JSON.parse(saved);
      } catch {
        return saved;
      }
    }
    return initialValue;
  });

  React.useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);

  return [value, setValue];
}

// --- SIMULATED AI MENTOR BRAIN ---
const generateMentorResponse = (trigger, context = {}, userMessage = '') => {
  const {
    hoursToday = 0,
    targetHours = 10,
    daysLeft = 0,
    streak = 0,
    escalation = 0,
  } = context;

  const responses = {
    check_in: [
      '2 ghante ho gaye. What have you completed? Give me a quick update.',
      'Are you on track today? Syllabus wait nahi karega.',
      `You need ${targetHours} hours today. Abhi sirf ${Number(hoursToday).toFixed(1)} hue hain. Speed up.`,
    ],
    missed_target: [
      'You planned 10 hours and completed barely anything. This is not acceptable.',
      'Be honest — are you serious about clearing CA Final? Kyunki yeh output se toh nahi hoga.',
      `Exam me sirf ${daysLeft} days bache hain aur tumhara yeh haal hai. Wake up!`,
    ],
    good_session: [
      "Good focus. But don't get comfortable. Next session in 10 mins.",
      "That's how a CA Finalist studies. Keep this momentum for the next 3 hours.",
      "Target hit for this block. Take a 10 min break, standard Pomodoro rules. Don't extend it.",
    ],
    streak_break: [
      'Streak broken. This is exactly how attempts are lost. Back to zero.',
      'You broke your consistency. Do you realize the compounding effect of missed days?',
    ],
    urgency_90_plus: "You have time. Build strong concepts. But don't waste days.",
    urgency_30_to_90: 'Now consistency matters. No more delays. Every single day counts.',
    urgency_less_30: 'Final phase. Every hour counts. Drop everything else and focus.',
    urgency_less_10: 'No excuses. Full revision mode. Do or die.',
    general_chat: [
      'Stop finding excuses. If you waste time, you waste an attempt.',
      "CA Final doesn't care about your mood. It cares about discipline.",
      'Are you prioritizing your weak subjects or just reading what feels easy?',
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
    if (escalation >= 2 && trigger === 'missed_target') {
      return 'I am warning you. If you continue this behavior, you are going to fail. Change your attitude right now.';
    }
    return opts[Math.floor(Math.random() * opts.length)];
  }

  return responses.general_chat[Math.floor(Math.random() * responses.general_chat.length)];
};

export default function CASathiApp() {
  // --- STATE MANAGEMENT ---
  const [activeTab, setActiveTab] = React.useState('dashboard');

  const [examDate, setExamDate] = useLocalStorage('ca-examDate', '');
  const [targetHours, setTargetHours] = useLocalStorage('ca-targetHours', 10);
  const [hoursStudiedToday, setHoursStudiedToday] = useLocalStorage('ca-hoursToday', 0);
  const [streak, setStreak] = useLocalStorage('ca-streak', 0);
  const [escalationLevel, setEscalationLevel] = useLocalStorage('ca-escalation', 0);

  const rawDaysLeft = examDate ? Math.ceil((new Date(examDate) - new Date()) / (1000 * 60 * 60 * 24)) : 0;
  const daysLeft = Math.max(1, rawDaysLeft);
  const reqDailyHours = hoursStudiedToday < targetHours
    ? (targetHours + (targetHours - hoursStudiedToday) / daysLeft).toFixed(1)
    : targetHours;

  const [tasks, setTasks] = useLocalStorage('ca-tasks', [
    {
      id: 1,
      subject: 'Setup',
      topic: 'Set your exam date and tasks',
      duration: 1,
      difficulty: 'Medium',
      timeOfDay: 'Morning',
      status: 'pending',
    },
  ]);

  const [chatHistory, setChatHistory] = useLocalStorage('ca-chat', [
    {
      sender: 'mentor',
      text: "Welcome to CA Sathi. Set your target exam date on the dashboard so I can calculate your required daily pace. Let's get to work.",
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [chatInput, setChatInput] = React.useState('');
  
  const [timerMode, setTimerMode] = useState('pomodoro');
  const [timeLeft, setTimeLeft] = useState(50 * 60);
  const [isActive, setIsActive] = useState(false);
  const [showSessionLog, setShowSessionLog] = useState(false);

  const [showAddTaskModal, setShowAddTaskModal] = React.useState(false);
  const [newTask, setNewTask] = React.useState({
    subject: '',
    topic: '',
    duration: 2,
    difficulty: 'Medium',
    timeOfDay: 'Morning',
  });

  // --- LOGIC FUNCTIONS ---
  const handleAddTask = (e) => {
    e.preventDefault();
    if (!newTask.subject || !newTask.topic) return;
    const taskToAdd = { ...newTask, id: Date.now(), status: 'pending' };
    setTasks([...tasks, taskToAdd]);
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

  const handleSessionComplete = () => {
    if (timerMode === 'pomodoro') {
      setShowSessionLog(true);
    } else {
      setTimerMode('pomodoro');
      setTimeLeft(50 * 60);
      addMentorMessage('Break over. Back to your desk immediately.');
    }
  };

  const logSessionResult = (status) => {
    setShowSessionLog(false);
    if (status === 'completed') {
      setHoursStudiedToday((prev) => prev + 50 / 60);
      addMentorMessage(generateMentorResponse('good_session', { hoursToday: hoursStudiedToday, targetHours, daysLeft, streak, escalation: escalationLevel }));
      setEscalationLevel(0);
      setTimerMode('shortBreak');
      setTimeLeft(10 * 60);
      setIsActive(true);
    } else if (status === 'partial') {
      setHoursStudiedToday((prev) => prev + 25 / 60);
      addMentorMessage('Partial completion is just a polite word for procrastination. Why did you stop?');
      setEscalationLevel((prev) => prev + 1);
    } else {
      addMentorMessage(generateMentorResponse('missed_target', { hoursToday: hoursStudiedToday, targetHours, daysLeft, streak, escalation: escalationLevel }));
      setEscalationLevel((prev) => prev + 1);
    }
  };

  const addMentorMessage = (text, sender = 'mentor') => {
    setChatHistory((prev) => [
      ...prev,
      { sender, text, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) },
    ]);
  };

  const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
  const handleChatSubmit = async (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userText = chatInput;
    addMentorMessage(userText, 'user');
    setChatInput('');
    addMentorMessage('...', 'mentor');

    const prompt = `
    You are 'Sathi,' a balanced CA Mentor. Your tone is Hinglish. You are Strict when the user misses goals, but Deeply Supportive and Empathetic when they are stressed.
      Live Context:
      - Exam is in ${daysLeft} days.
      - Target today: ${targetHours} hours.
      - Completed today: ${hoursStudiedToday} hours.
      - Current streak: ${streak} days.
      Rule: Respond in short, punchy Hinglish. Be tough but motivating. Never break character.
      Student says: "${userText}"
    `;

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
        }
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
        newHistory[newHistory.length - 1] = { sender: 'mentor', text: `SYSTEM ERROR: API issue.`, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
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
      <div className="bg-red-950/40 border border-red-900/50 rounded-xl p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-red-600/10 rounded-full blur-3xl"></div>
        <div className="flex justify-between items-center relative z-10">
          <div>
            <h2 className="text-red-500 font-bold tracking-wider text-sm mb-1 uppercase">Mission CA Final</h2>
            <div className="flex items-baseline gap-3">
              <span className="text-5xl font-black text-white">{daysLeft}</span>
              <span className="text-xl text-gray-400 font-medium">Days Left</span>
            </div>
            <p className="mt-2 text-red-200/80 text-sm font-medium border-l-2 border-red-500 pl-3">"{generateMentorResponse('urgency', { daysLeft })}"</p>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-400 mb-1">Target Date</div>
            <input type="date" value={examDate} onChange={(e) => setExamDate(e.target.value)} className="bg-black/50 border border-gray-700 rounded px-3 py-1 text-white font-mono text-sm focus:outline-none focus:border-red-500" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gray-800/50 border border-gray-700/50 p-5 rounded-xl flex items-center gap-4">
          <div className="p-3 bg-blue-500/20 text-blue-400 rounded-lg"><Target size={24} /></div>
          <div>
            <div className="text-sm text-gray-400">Today's Progress</div>
            <div className="text-2xl font-bold">{hoursStudiedToday.toFixed(1)} / {targetHours} <span className="text-sm font-normal text-gray-500">hrs</span></div>
            <div className="w-full bg-gray-700 h-1.5 mt-2 rounded-full overflow-hidden">
              <div className="bg-blue-500 h-full" style={{ width: `${(hoursStudiedToday / targetHours) * 100}%` }}></div>
            </div>
          </div>
        </div>
        <div className="bg-gray-800/50 border border-gray-700/50 p-5 rounded-xl flex items-center gap-4">
          <div className="p-3 bg-orange-500/20 text-orange-400 rounded-lg"><Flame size={24} /></div>
          <div>
            <div className="text-sm text-gray-400">Consistency Streak</div>
            <div className="text-2xl font-bold">{streak} <span className="text-sm font-normal text-gray-500">Days</span></div>
            <div className="text-xs text-orange-400 mt-1">10+ hours maintained</div>
          </div>
        </div>
        <div className={`bg-gray-800/50 border ${hoursStudiedToday < targetHours ? 'border-red-900/50 bg-red-950/20' : 'border-green-900/50 bg-green-950/20'} p-5 rounded-xl flex items-center gap-4`}>
          <div className={`p-3 rounded-lg ${hoursStudiedToday < targetHours ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'}`}><TrendingUp size={24} /></div>
          <div>
            <div className="text-sm text-gray-400">Required Daily Pace</div>
            <div className="text-2xl font-bold">{reqDailyHours} <span className="text-sm font-normal text-gray-500">hrs/day</span></div>
            <div className={`text-xs mt-1 ${hoursStudiedToday < targetHours ? 'text-red-400' : 'text-green-400'}`}>
              {hoursStudiedToday < targetHours ? `You lost time. Pace increased.` : 'On track. Maintain pace.'}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gray-800/30 border border-gray-700/50 rounded-xl p-6">
        <h3 className="text-lg font-bold mb-4 flex items-center gap-2"><Calendar size={18} className="text-blue-400" /> Today's Battle Plan</h3>
        <div className="space-y-3">
          {tasks.map((task) => (
            <div key={task.id} className="flex items-center justify-between p-3 bg-gray-900/50 rounded-lg border border-gray-800">
              <div className="flex items-center gap-4">
                <button onClick={() => toggleTaskStatus(task.id)}>
                  {task.status === 'completed' && <CheckCircle className="text-green-500" size={20} />}
                  {task.status === 'partial' && <AlertTriangle className="text-yellow-500" size={20} />}
                  {task.status === 'pending' && <div className="w-5 h-5 rounded-full border-2 border-gray-600"></div>}
                </button>
                <div>
                  <div className="font-medium flex items-center gap-2">
                    {task.subject}: {task.topic}
                    <span className={`text-[10px] px-2 py-0.5 rounded uppercase font-bold tracking-wider ${task.difficulty === 'Hard' ? 'bg-red-500/20 text-red-400' : 'bg-yellow-500/20 text-yellow-400'}`}>{task.difficulty}</span>
                  </div>
                  <div className="text-xs text-gray-400 mt-0.5">{task.timeOfDay} Block • {task.duration} Hours</div>
                </div>
              </div>
              <div className="text-right">
                {task.status === 'completed' ? <span className="text-xs font-bold text-green-500 uppercase">Logged</span> : <button onClick={() => setActiveTab('timer')} className="text-xs bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded font-medium transition-colors">Start Session</button>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderMentor = () => (
    <div className="flex flex-col h-[calc(100vh-8rem)] bg-gray-900/50 border border-gray-700/50 rounded-xl overflow-hidden">
      <div className="p-4 bg-gray-800 border-b border-gray-700 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-red-900/50 rounded-full flex items-center justify-center border border-red-500/30 text-red-400"><BrainCircuit size={20} /></div>
          <div><h3 className="font-bold text-gray-100">AI Mentor (Strict Mode)</h3><p className="text-xs text-red-400 font-mono tracking-wider">STATUS: WATCHING YOU</p></div>
        </div>
        <div className="text-xs text-gray-500 font-mono">Escalation Lvl: {escalationLevel}</div>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {chatHistory.map((msg, i) => (
          <div key={i} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] p-3 rounded-lg text-sm ${msg.sender === 'user' ? 'bg-blue-600 text-white rounded-br-none' : 'bg-gray-800 border border-gray-700 text-gray-200 rounded-bl-none'}`}>
              <div className="mb-1 leading-relaxed font-medium">{msg.text}</div>
              <div className="text-[10px] text-right opacity-60">{msg.time}</div>
            </div>
          </div>
        ))}
      </div>
      <form onSubmit={handleChatSubmit} className="p-4 bg-gray-800 border-t border-gray-700 flex gap-2">
        <input type="text" value={chatInput} onChange={(e) => setChatInput(e.target.value)} placeholder="Update your mentor or ask a doubt..." className="flex-1 bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-blue-500" />
        <button type="submit" className="bg-blue-600 hover:bg-blue-500 text-white p-2 rounded-lg transition-colors"><Send size={20} /></button>
      </form>
    </div>
  );

  const renderTimer = () => (
    <div className="h-full flex flex-col items-center justify-center">
      <div className="text-center w-full max-w-md">
        <h2 className="text-xl font-bold text-gray-400 mb-8 uppercase tracking-widest">{timerMode === 'pomodoro' ? 'Focus Session' : 'Strict Break'}</h2>
        <div className={`text-8xl font-black font-mono tracking-tighter mb-12 ${timerMode === 'shortBreak' ? 'text-green-500' : isActive ? 'text-white' : 'text-gray-500'}`}>{formatTime(timeLeft)}</div>
        <div className="flex justify-center gap-6 mb-12">
          <button onClick={() => setIsActive(!isActive)} className={`w-16 h-16 rounded-full flex items-center justify-center transition-all ${isActive ? 'bg-red-500/20 text-red-500 border border-red-500/50' : 'bg-blue-600 text-white hover:bg-blue-500'}`}>{isActive ? <Pause size={28} /> : <Play size={28} className="ml-1" />}</button>
          <button onClick={() => { setIsActive(false); setTimeLeft(timerMode === 'pomodoro' ? 50 * 60 : 10 * 60); }} className="w-16 h-16 rounded-full flex items-center justify-center bg-gray-800 border border-gray-700 text-gray-400 hover:text-white transition-all"><RotateCcw size={24} /></button>
        </div>
        <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4 text-left">
          <div className="text-xs text-gray-500 font-mono mb-2">CURRENTLY EXECUTING:</div>
          <select className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-sm text-white outline-none focus:border-blue-500">
            {tasks.filter((t) => t.status !== 'completed').map((t) => <option key={t.id}>{t.subject} - {t.topic}</option>)}
          </select>
        </div>
      </div>
      {showSessionLog && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-gray-900 border border-gray-700 rounded-2xl p-8 max-w-sm w-full text-center">
            <h3 className="text-2xl font-bold mb-2">Session Over</h3>
            <p className="text-gray-400 text-sm mb-6">Mentor is asking: How much did you actually study?</p>
            <div className="space-y-3">
              <button onClick={() => logSessionResult('completed')} className="w-full py-3 bg-green-900/40 text-green-400 border border-green-800 hover:bg-green-800/60 rounded-lg font-bold flex items-center justify-center gap-2"><CheckCircle size={18} /> Fully Completed</button>
              <button onClick={() => logSessionResult('partial')} className="w-full py-3 bg-yellow-900/40 text-yellow-400 border border-yellow-800 hover:bg-yellow-800/60 rounded-lg font-bold flex items-center justify-center gap-2"><AlertTriangle size={18} /> Partially Completed</button>
              <button onClick={() => logSessionResult('failed')} className="w-full py-3 bg-red-900/40 text-red-400 border border-red-800 hover:bg-red-800/60 rounded-lg font-bold flex items-center justify-center gap-2"><XCircle size={18} /> Wasted Session</button>
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
        <button onClick={() => setShowAddTaskModal(true)} className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-[0_0_10px_rgba(37,99,235,0.4)]">+ Add New Task</button>
      </div>
      <div className="bg-gray-800/30 border border-gray-700/50 rounded-xl p-6">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-gray-500 font-mono text-xs uppercase border-b border-gray-700">
              <tr>
                <th className="pb-3 font-medium">Subject & Topic</th>
                <th className="pb-3 font-medium">Block</th>
                <th className="pb-3 font-medium">Difficulty</th>
                <th className="pb-3 font-medium">Target Hrs</th>
                <th className="pb-3 font-medium">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {tasks.map((task) => (
                <tr key={task.id} className="text-gray-200">
                  <td className="py-4 font-medium">{task.subject}: <span className="text-gray-400">{task.topic}</span></td>
                  <td className="py-4">{task.timeOfDay}</td>
                  <td className="py-4"><span className={`px-2 py-1 rounded text-xs ${task.difficulty === 'Hard' ? 'bg-red-900/30 text-red-400' : task.difficulty === 'Medium' ? 'bg-yellow-900/30 text-yellow-400' : 'bg-green-900/30 text-green-400'}`}>{task.difficulty}</span></td>
                  <td className="py-4 font-mono">{task.duration}h</td>
                  <td className="py-4"><button onClick={() => setTasks(tasks.filter((t) => t.id !== task.id))} className="text-red-500/70 hover:text-red-400 text-xs font-medium">Delete</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showAddTaskModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6 max-w-md w-full shadow-2xl">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2"><BookOpen size={20} className="text-blue-400" /> Add Target</h3>
            <form onSubmit={handleAddTask} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><label className="text-xs text-gray-400 mb-1 block">Subject</label><input type="text" value={newTask.subject} onChange={(e) => setNewTask({ ...newTask, subject: e.target.value })} className="w-full bg-gray-800 border border-gray-700 rounded p-2 text-sm text-white" required /></div>
                <div><label className="text-xs text-gray-400 mb-1 block">Topic</label><input type="text" value={newTask.topic} onChange={(e) => setNewTask({ ...newTask, topic: e.target.value })} className="w-full bg-gray-800 border border-gray-700 rounded p-2 text-sm text-white" required /></div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div><label className="text-xs text-gray-400 mb-1 block">Hours</label><input type="number" step="0.5" min="0.5" value={newTask.duration} onChange={(e) => setNewTask({ ...newTask, duration: Number(e.target.value) })} className="w-full bg-gray-800 border border-gray-700 rounded p-2 text-sm text-white" required /></div>
                <div><label className="text-xs text-gray-400 mb-1 block">Level</label><select value={newTask.difficulty} onChange={(e) => setNewTask({ ...newTask, difficulty: e.target.value })} className="w-full bg-gray-800 border border-gray-700 rounded p-2 text-sm text-white"><option>Hard</option><option>Medium</option><option>Easy</option></select></div>
                <div><label className="text-xs text-gray-400 mb-1 block">Block</label><select value={newTask.timeOfDay} onChange={(e) => setNewTask({ ...newTask, timeOfDay: e.target.value })} className="w-full bg-gray-800 border border-gray-700 rounded p-2 text-sm text-white"><option>Morning</option><option>Afternoon</option><option>Night</option></select></div>
              </div>
              <div className="flex gap-3 mt-8 pt-4 border-t border-gray-800">
                <button type="button" onClick={() => setShowAddTaskModal(false)} className="flex-1 py-2.5 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700">Cancel</button>
                <button type="submit" className="flex-1 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-500">Save Target</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );

  // --- SEPARATE QUICK NOTES ---
  const renderQuickNotes = () => (
    <div className="space-y-6 overflow-y-auto max-h-[75vh] p-2 text-left">
      <div className="p-6 bg-slate-900/80 rounded-3xl border border-yellow-500/30 shadow-2xl">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-yellow-500/10 rounded-lg border border-yellow-500/20"><span className="text-xl">📝</span></div>
          <div>
            <h3 className="text-white font-bold text-lg leading-tight uppercase tracking-wider">Quick Study Notes</h3>
            <p className="text-gray-400 text-xs italic font-light">Draft temporary notes, saved locally in your browser.</p>
          </div>
        </div>
        <textarea
          className="w-full h-[50vh] bg-slate-800/40 text-gray-100 p-4 rounded-xl border border-white/5 focus:border-yellow-500/50 outline-none resize-none placeholder:text-gray-600 font-sans"
          placeholder="Enter important section numbers, audit standards, or your daily targets here..."
          onChange={(e) => localStorage.setItem('ca_sathi_notes', e.target.value)}
          defaultValue={localStorage.getItem('ca_sathi_notes') || ""}
        />
      </div>
    </div>
  );

  // --- SEPARATE ACTIVE RECALL ---
  const renderActiveRecall = () => (
    <div className="h-[60vh] flex flex-col items-center justify-center py-10 text-center bg-slate-900/40 rounded-3xl border-2 border-dashed border-purple-500/20">
      <div className="w-20 h-20 bg-gray-900 rounded-full flex items-center justify-center border border-purple-500/40 mb-6 shadow-[0_0_20px_rgba(147,51,234,0.3)]">
        <span className="text-4xl animate-bounce">🚀</span>
      </div>
      <h2 className="text-2xl font-bold text-white mb-3 uppercase tracking-wide">Active Recall Engine</h2>
      <p className="text-gray-400 text-base max-w-[350px] mx-auto font-light leading-relaxed">
        AI-driven conceptual testing and MCQ analysis are currently under development. 
        <br/><br/>
        Follow <span className="text-purple-400 font-semibold italic border-b border-purple-400/50 pb-0.5">Audit Cubicles</span> for the official release.
      </p>
    </div>
  );

  // --- MAIN UI RENDER ---
  return (
    <div className="min-h-screen bg-[#0a0f1c] text-slate-200 font-sans flex overflow-hidden">
      
      {/* SIDEBAR WITH LEFT-ALIGNED BRANDING */}
      <aside className="w-64 bg-slate-950 border-r border-slate-800 flex flex-col hidden md:flex">
        <div className="p-6 border-b border-slate-800 flex flex-col items-start">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center font-black text-white shadow-lg shadow-blue-500/20">CA</div>
            <span className="font-bold text-xl tracking-wide text-white">Sathi.ai</span>
          </div>
          
          {/* Properly Left-Aligned Name Block */}
          <div className="w-full text-left pl-2 border-l-2 border-blue-500/50">
            <p className="text-[9px] text-gray-500 uppercase tracking-widest font-semibold leading-none mb-1">Created By</p>
            <p className="text-sm font-bold text-blue-400 tracking-wide">Niket Talwar</p>
          </div>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          {[
            { id: 'dashboard', name: 'Dashboard', icon: <LayoutDashboard size={20} /> },
            { id: 'planner', name: 'Study Planner', icon: <Calendar size={20} /> },
            { id: 'timer', name: 'Focus Timer', icon: <TimerIcon size={20} /> },
            { id: 'quick_notes', name: 'Quick Notes', icon: <FileText size={20} /> },
            { id: 'active_recall', name: 'Active Recall', icon: <BookOpen size={20} /> },
            { id: 'mentor', name: 'Mentor Chat', icon: <MessageSquare size={20} /> },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                activeTab === item.id 
                ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30' 
                : 'text-gray-400 hover:bg-slate-900 hover:text-white'
              }`}
            >
              {item.icon}
              <span className="font-medium text-sm">{item.name}</span>
            </button>
          ))}
        </nav>
      </aside>

      {/* DYNAMIC CONTENT AREA */}
      <main className="flex-1 relative overflow-y-auto">
        <div className="max-w-5xl mx-auto h-full p-8 pb-24">
          {activeTab === 'dashboard' && renderDashboard()}
          {activeTab === 'planner' && renderPlanner()}
          {activeTab === 'timer' && renderTimer()}
          {activeTab === 'quick_notes' && renderQuickNotes()}
          {activeTab === 'active_recall' && renderActiveRecall()}
          {activeTab === 'mentor' && renderMentor()}
        </div>
      </main>
      
    </div>
  );
}