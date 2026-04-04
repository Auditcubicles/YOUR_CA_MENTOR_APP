import { useState, useEffect, useCallback, useRef } from 'react';
import './App.css';

// 📚 FACULTY & RTP LINKS
const NOTES_LINKS = {
  'Financial Reporting': 'https://drive.google.com/drive/folders/1ANLP_7cw7AXKkjWw4Lxp4mw7EuqcoosjuO3aR5SdqVo2oHMaVr5MiozHC662fDdpWfjsB0aP',
  'AFM': 'https://drive.google.com/drive/folders/14Ab9fZoPCcpnlDGc2bU-qTjxl6_PpdsPE_G0ndASdsFrRpPv9M4tYjRN3yPgFouCI7kQtDMq',
  'AUDIT': 'https://drive.google.com/drive/folders/1TJth8POIXDgsisqQ0EUSI7VlSY7WsdOvf0lAAzOLgfRsvFTz98HdLui7WWM1B4nDewaCKjhj',
  'Direct Tax': 'https://drive.google.com/drive/folders/14o4V7m7jxiGnrX4Sn9VyV8DChxCEOIRJSpSgEq1M-uzqqlsLoAWlOpN5Wz2p58GveZ4uUX3v',
  'IDT': 'https://drive.google.com/drive/folders/1fiRYgdDj8Zkl9s11Sguw03okzS18SMnJ95DIqOnaEZI0LoTLe8BR4x2HWPHmXMQ2iINWdu9M',
  'IBS': 'https://drive.google.com/drive/folders/1k5YeEN_1NGPXeeXkD8ziP_QOL3pIkzu4KCISPZbm9zEL8CKsk7I_ClWxvdnAEJS92tgp9WjR'
};
const RTP_LINKS = {
  'Financial Reporting': 'https://drive.google.com/drive/folders/1QuwWAVVp7I_WDHpuk9Jhrlruthpccq-t?usp=drive_link',
  'AFM': 'https://drive.google.com/drive/folders/1wrhq4le7R67_44puqXpfm_JNNLL3M4Th?usp=drive_link',
  'AUDIT': 'https://drive.google.com/drive/folders/1RviDhUZj1AvHRAU4Im5W0wPu1dtWaahd?usp=drive_link',
  'Direct Tax': 'https://drive.google.com/drive/folders/1HyQJdCFfRci__mRrHC6h-1nLR-JMvxKG?usp=drive_link',
  'IDT': 'https://drive.google.com/drive/folders/1v-36rQLlFOixBjLM4b-e-pfglu0n9FNX?usp=drive_link',
  'IBS': 'https://drive.google.com/drive/folders/12lZj9JlvkffriT5Rq_1oCV_IyIFjoOKo?usp=drive_link'
};

const SUBJECTS = Object.keys(NOTES_LINKS);

const TARGET_CATEGORIES = [
  'Concept Revision',
  'Question Bank Solving',
  'Mock Test Paper',
  'YT Revision',
  'Lecture'
];

const StatsCard = ({ icon, title, value, subtext, type }) => (
  <div className={`stats-card ${type || ''}`}>
    <div className="card-header"><span className="card-icon">{icon}</span><h3 className="card-title">{title}</h3></div>
    <p className="card-value">{value}</p>
    <p className={`card-subtext ${type || ''}`}>{subtext}</p>
  </div>
);

const ACHIEVEMENTS_DB = [
  { id: 'daily_3', icon: '🥉', title: 'Bronze Grind', desc: 'Study 3+ hours in a day', target: 3, type: 'daily' },
  { id: 'daily_6', icon: '🥈', title: 'Silver Hustle', desc: 'Study 6+ hours in a day', target: 6, type: 'daily' },
  { id: 'daily_10', icon: '🥇', title: 'Gold Mastery', desc: 'Study 10+ hours in a day', target: 10, type: 'daily' },
  { id: 'daily_12', icon: '💎', title: 'Diamond Focus', desc: 'Study 12+ hours in a day', target: 12, type: 'daily' },
  { id: 'streak_3', icon: '🔥', title: 'Getting Warm', desc: 'Hit daily goal 3 days in a row', target: 3, type: 'streak' },
  { id: 'streak_7', icon: '🌋', title: 'Consistent CA', desc: 'Hit daily goal 7 days in a row', target: 7, type: 'streak' },
  { id: 'streak_14', icon: '⚡', title: 'Unstoppable', desc: 'Hit daily goal 14 days in a row', target: 14, type: 'streak' },
  { id: 'streak_30', icon: '👑', title: 'Discipline King', desc: 'Hit daily goal 30 days in a row', target: 30, type: 'streak' },
  { id: 'total_50', icon: '📚', title: 'Bookworm', desc: 'Log 50 total hours', target: 50, type: 'total' },
  { id: 'total_100', icon: '🎓', title: 'Scholar', desc: 'Log 100 total hours', target: 100, type: 'total' },
  { id: 'total_250', icon: '🏛️', title: 'Expert', desc: 'Log 250 total hours', target: 250, type: 'total' },
  { id: 'total_500', icon: '🌌', title: 'CA Legend', desc: 'Log 500 total hours', target: 500, type: 'total' },
  { id: 'polymath', icon: '🧠', title: 'Polymath', desc: 'Study 4 different subjects in one day', target: 4, type: 'variety' },
  { id: 'fr_master', icon: '📘', title: 'FR Specialist', desc: 'Log 20 hours in Financial Reporting', target: 20, type: 'subject', sub: 'Financial Reporting' },
  { id: 'audit_master', icon: '🕵️', title: 'Audit Specialist', desc: 'Log 20 hours in Audit', target: 20, type: 'subject', sub: 'AUDIT' }
];

// 🚀 FIX: Moved TargetListRenderer OUTSIDE the App component so it doesn't remount every second!
const TargetListRenderer = ({ tasks, toggleTodo, deleteTodo }) => (
  <ul className="task-list scrollable-mini">
    {tasks.length === 0 ? <p className="empty-state">No targets set.</p> : 
      tasks.map(t => (
      <li key={t.id} className={`task-item ${t.done ? 'completed' : ''}`}>
        <div className="task-left" onClick={() => toggleTodo(t.id)}>
          <div className={`checkbox ${t.done ? 'checked' : ''}`}></div> 
          <div className="task-content-wrapper">
            {t.subject && t.category ? (
              <>
                <div className="task-badges">
                  <span className="task-badge badge-sub">{t.subject}</span>
                  <span className="task-badge badge-cat">{t.category}</span>
                </div>
                <span className="task-text-main">{t.topic}</span>
              </>
            ) : (
              <span className="task-text-main">{t.text}</span>
            )}
          </div>
        </div>
        <button className="del-btn" onClick={() => deleteTodo(t.id)}>×</button>
      </li>
    ))}
  </ul>
);

export default function App() {
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [sessions, setSessions] = useState(() => JSON.parse(localStorage.getItem('sessions')) || []);
  const [todos, setTodos] = useState(() => JSON.parse(localStorage.getItem('todos')) || []);
  const [dailyGoal, setDailyGoal] = useState(() => Number(localStorage.getItem('dailyGoal')) || 10);
  const [examDate, setExamDate] = useState(() => localStorage.getItem('examDate') || '2026-05-01');
  const [streakData, setStreakData] = useState(() => JSON.parse(localStorage.getItem('streakData')) || { count: 0, lastLogin: null, targetHitToday: false });
  const [unlockedAchievements, setUnlockedAchievements] = useState(() => JSON.parse(localStorage.getItem('unlockedAchievements')) || []);

  const [pomodoroLength, setPomodoroLength] = useState(25);
  const [customMins, setCustomMins] = useState('');
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState(SUBJECTS[0]);
  const [clockStyle, setClockStyle] = useState('minimal'); 
  
  const [targetSub, setTargetSub] = useState(SUBJECTS[0]);
  const [targetCat, setTargetCat] = useState(TARGET_CATEGORIES[0]);
  const [targetTopic, setTargetTopic] = useState('');

  const canvasRef = useRef(null);
  const videoRef = useRef(null);
  const [isDND, setIsDND] = useState(false);

  const [chatMessages, setChatMessages] = useState(() => JSON.parse(localStorage.getItem('chatMessages')) || [{ sender: 'bot', text: 'Hi Student! CA Sathi is online. How can I help you grind today?' }]);
  const [chatInput, setChatInput] = useState('');
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('geminiApiKey') || '');

  useEffect(() => localStorage.setItem('sessions', JSON.stringify(sessions)), [sessions]);
  useEffect(() => localStorage.setItem('todos', JSON.stringify(todos)), [todos]);
  useEffect(() => localStorage.setItem('dailyGoal', dailyGoal), [dailyGoal]);
  useEffect(() => localStorage.setItem('examDate', examDate), [examDate]);
  useEffect(() => localStorage.setItem('streakData', JSON.stringify(streakData)), [streakData]);
  useEffect(() => localStorage.setItem('chatMessages', JSON.stringify(chatMessages)), [chatMessages]);
  useEffect(() => localStorage.setItem('geminiApiKey', apiKey), [apiKey]);
  useEffect(() => localStorage.setItem('unlockedAchievements', JSON.stringify(unlockedAchievements)), [unlockedAchievements]);

  const todayStr = new Date().toLocaleDateString();
  const todaySessions = sessions.filter(s => new Date(s.date).toLocaleDateString() === todayStr);
  const todayHours = (todaySessions.reduce((sum, s) => sum + s.duration, 0) / 60).toFixed(1);
  const isBehind = todayHours < dailyGoal;
  const totalHoursLogged = (sessions.reduce((sum, s) => sum + s.duration, 0) / 60).toFixed(0);
  const daysRemaining = Math.max(0, Math.ceil((new Date(examDate) - new Date()) / (1000 * 60 * 60 * 24)));
  const uniqueSubjectsToday = new Set(todaySessions.map(s => s.subject)).size;

  useEffect(() => {
    let newUnlocks = [...unlockedAchievements];
    let changed = false;
    ACHIEVEMENTS_DB.forEach(ach => {
      if (!newUnlocks.some(u => u.id === ach.id)) {
        let earned = false;
        if (ach.type === 'daily' && todayHours >= ach.target) earned = true;
        if (ach.type === 'streak' && streakData.count >= ach.target) earned = true;
        if (ach.type === 'total' && totalHoursLogged >= ach.target) earned = true;
        if (ach.type === 'variety' && uniqueSubjectsToday >= ach.target) earned = true;
        if (ach.type === 'subject') {
          const subHours = sessions.filter(s => s.subject === ach.sub).reduce((sum, s) => sum + s.duration, 0) / 60;
          if (subHours >= ach.target) earned = true;
        }
        if (earned) {
          newUnlocks.push({ id: ach.id, date: new Date().toLocaleDateString(), month: new Date().toLocaleString('default', { month: 'long', year: 'numeric' }) });
          changed = true;
          if(isActive) alert(`🏆 ACHIEVEMENT UNLOCKED: ${ach.title}!`); 
        }
      }
    });
    if (changed) setUnlockedAchievements(newUnlocks);
  }, [sessions, todayHours, totalHoursLogged, streakData.count, uniqueSubjectsToday]);

  useEffect(() => {
    const today = new Date().toLocaleDateString();
    let currentData = { ...streakData };
    if (currentData.lastLogin !== today) {
      const yesterday = new Date(); yesterday.setDate(yesterday.getDate() - 1);
      if (currentData.lastLogin === yesterday.toLocaleDateString() && currentData.targetHitToday) { } 
      else if (currentData.lastLogin !== null) { currentData.count = 0; }
      currentData.lastLogin = today; currentData.targetHitToday = false;
      setStreakData(currentData);
    }
    if (todayHours >= dailyGoal && !currentData.targetHitToday) {
      setStreakData({ ...currentData, targetHitToday: true, count: currentData.count + 1 });
    }
  }, [sessions, dailyGoal, todayHours]);

  const logSession = useCallback(() => {
    const newSession = { id: Date.now(), subject: selectedSubject, duration: pomodoroLength, date: new Date().toISOString() };
    setSessions(s => [newSession, ...s]);
    setIsActive(false);
    setTimeLeft(pomodoroLength * 60);
    alert(`Focus Session Logged: ${pomodoroLength} mins!`);
  }, [selectedSubject, pomodoroLength]);

  const endAndLogEarly = () => {
    const timeElapsedSecs = (pomodoroLength * 60) - timeLeft;
    const elapsedMins = Math.floor(timeElapsedSecs / 60);

    if (elapsedMins < 1) {
      alert("Session too short to log (under 1 minute). Timer reset.");
      setIsActive(false);
      setTimeLeft(pomodoroLength * 60);
      return;
    }

    const newSession = { id: Date.now(), subject: selectedSubject, duration: elapsedMins, date: new Date().toISOString() };
    setSessions(s => [newSession, ...s]);
    setIsActive(false);
    setTimeLeft(pomodoroLength * 60);
    alert(`Partial Session Logged: ${elapsedMins} mins!`);
  };

  useEffect(() => {
    let interval = null;
    if (isActive && timeLeft > 0) interval = setInterval(() => setTimeLeft(t => t - 1), 1000);
    else if (isActive && timeLeft === 0) { clearInterval(interval); logSession(); }
    return () => clearInterval(interval);
  }, [isActive, timeLeft, logSession]);

  const toggleTimer = () => setIsActive(!isActive);
  const resetTimer = () => { setIsActive(false); setTimeLeft(pomodoroLength * 60); };
  const setPomodoro = (mins) => { setPomodoroLength(mins); setTimeLeft(mins * 60); setIsActive(false); setCustomMins(''); };
  const handleCustomTime = (e) => { e.preventDefault(); if(customMins > 0) setPomodoro(Number(customMins)); };
  
  const toggleDND = () => {
    if (!isDND && document.documentElement.requestFullscreen) document.documentElement.requestFullscreen();
    else if (document.exitFullscreen) document.exitFullscreen();
    setIsDND(!isDND);
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60); const s = seconds % 60;
    return { mins: `${m < 10 ? '0' : ''}${m}`, secs: `${s < 10 ? '0' : ''}${s}`, full: `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}` };
  };
  const timeObj = formatTime(timeLeft);
  const progressPercent = ((pomodoroLength * 60 - timeLeft) / (pomodoroLength * 60)) * 100;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#0d1117'; ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#f0f6fc'; ctx.font = 'bold 120px Inter, sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(timeObj.full, canvas.width / 2, canvas.height / 2 - 20);
    ctx.fillStyle = '#38bdf8'; ctx.font = 'bold 30px Inter, sans-serif'; ctx.fillText(selectedSubject.toUpperCase(), canvas.width / 2, canvas.height / 2 + 70);
    ctx.fillStyle = isActive ? '#22c55e' : '#ef4444'; ctx.font = '20px Inter, sans-serif';
    ctx.fillText(isActive ? '● FOCUSING' : '⏸ PAUSED', canvas.width / 2, canvas.height / 2 + 110);
  }, [timeLeft, selectedSubject, isActive]);

  const toggleNativePIP = async () => {
    try {
      if (document.pictureInPictureElement) await document.exitPictureInPicture();
      else {
        const video = videoRef.current;
        video.srcObject = canvasRef.current.captureStream(15); 
        await video.play(); await video.requestPictureInPicture();
      }
    } catch (err) {
      alert("PIP Error: Ensure you click the button directly. Browser error: " + err.message);
    }
  };

  const handleAddStructuredTask = (e) => {
    e.preventDefault();
    if (!targetTopic.trim()) return;
    const newTask = { id: Date.now(), subject: targetSub, category: targetCat, topic: targetTopic, done: false, date: new Date().toLocaleDateString() };
    setTodos([newTask, ...todos]);
    setTargetTopic(''); 
  };

  const toggleTodo = (id) => setTodos(todos.map(t => t.id === id ? { ...t, done: !t.done } : t));
  const deleteTodo = (id) => setTodos(todos.filter(t => t.id !== id));
  const todayTodos = todos.filter(t => t.date === new Date().toLocaleDateString());

  const clearChatHistory = () => {
    if (window.confirm('Are you sure you want to clear your mentor chat history?')) {
      setChatMessages([{ sender: 'bot', text: 'Hi Student ! CA Sathi is online. How can I help you grind today?' }]);
    }
  };

  const handleSendMessage = async () => {
    if (!chatInput.trim()) return;
    const newMsgs = [...chatMessages, { sender: 'user', text: chatInput }];
    setChatMessages(newMsgs);
    setChatInput('');

    if (!apiKey) {
      setChatMessages([...newMsgs, { sender: 'bot', text: "⚠️ ERROR: Please paste your Gemini API Key in the Settings tab." }]);
      return;
    }

    const promptText = `You are a Passionate, Modern,and a Trustworthy experienced CA Faculty, Your motive is to solve the doubts of the students in by providing them solutions of queries as they required and you should ensure that query is resolved,for a CA Final student. Reply should be medium and understandable as per the query. Student says: ${chatInput}`;

    const tryModel = async (modelName) => {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: promptText }] }] })
      });
      const data = await response.json();
      if (data.error) throw new Error(data.error.message);
      return data.candidates[0].content.parts[0].text;
    };

    const modelsToTry = ['gemini-3.1-flash', 'gemini-3.0-flash', 'gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-1.5-flash'];
    let success = false;
    let lastError = '';

    for (const model of modelsToTry) {
      try {
        const reply = await tryModel(model);
        setChatMessages([...newMsgs, { sender: 'bot', text: reply }]);
        success = true; break;
      } catch (err) {
        lastError = err.message;
      }
    }
    if (!success) setChatMessages([...newMsgs, { sender: 'bot', text: `API Error: Unable to connect. Last error: ${lastError}. Ensure key is fresh from aistudio.google.com!` }]);
  };

  const getWeeklyData = () => {
    const days = []; let maxHrs = 1;
    for(let i=6; i>=0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i); const dateStr = d.toLocaleDateString();
      const hrs = sessions.filter(s => new Date(s.date).toLocaleDateString() === dateStr).reduce((sum, s) => sum + s.duration, 0) / 60;
      if (hrs > maxHrs) maxHrs = hrs;
      days.push({ name: d.toLocaleDateString('en-US', { weekday: 'short' }), hours: hrs.toFixed(1) });
    }
    return { days, maxHrs };
  };
  const weeklyData = getWeeklyData();
  const achievementsByMonth = unlockedAchievements.reduce((acc, current) => {
    if (!acc[current.month]) acc[current.month] = []; acc[current.month].push(current); return acc;
  }, {});

  const TimerWidget = () => (
    <div className={`timer-widget ${isDND ? 'dnd-mode' : ''}`}>
      {isDND && (
        <div className="dnd-header">
          <h1 className="zen-title">FULL FOCUS MODE</h1>
          <button className="btn reset-btn-control exit-dnd-btn" onClick={toggleDND}>EXIT FULL SCREEN</button>
        </div>
      )}
      
      {!isDND && (
        <>
          <div className="clock-style-toggle">
            <button className={clockStyle === 'minimal' ? 'active' : ''} onClick={() => setClockStyle('minimal')}>Minimal</button>
            <button className={clockStyle === 'standard' ? 'active' : ''} onClick={() => setClockStyle('standard')}>Digital</button>
            <button className={clockStyle === 'flip' ? 'active' : ''} onClick={() => setClockStyle('flip')}>Flip</button>
          </div>
          <div className="pomodoro-presets">
            <button className={`preset-btn ${pomodoroLength === 25 ? 'active' : ''}`} onClick={() => setPomodoro(25)}>25m</button>
            <button className={`preset-btn ${pomodoroLength === 50 ? 'active' : ''}`} onClick={() => setPomodoro(50)}>50m</button>
            <form onSubmit={handleCustomTime} className="custom-time-form">
              <input type="number" placeholder="Mins" value={customMins} onChange={e => setCustomMins(e.target.value)} min="1" max="300" />
              <button type="submit">Set</button>
            </form>
          </div>
        </>
      )}

      {clockStyle === 'standard' && (
        <div className="timer-display-box">
          <h3>{timeObj.full}</h3>
          <p>{selectedSubject}</p>
        </div>
      )}

      {clockStyle === 'minimal' && (
        <div className="minimal-clock-container">
          <svg className="progress-ring" width="240" height="240">
            <circle className="progress-ring__circle bg" stroke="#30363d" strokeWidth="8" fill="transparent" r="100" cx="120" cy="120"/>
            <circle className="progress-ring__circle fg" stroke="#38bdf8" strokeWidth="8" fill="transparent" r="100" cx="120" cy="120" style={{strokeDasharray: 628, strokeDashoffset: 628 - (progressPercent / 100) * 628}} />
          </svg>
          <div className="minimal-time-text">
            <h2>{timeObj.full}</h2>
            <p>{selectedSubject}</p>
          </div>
        </div>
      )}

      {clockStyle === 'flip' && (
        <div className="flip-clock-container">
          <div className="flip-clock">
            <div className="flip-card"><span>{timeObj.mins}</span></div><span className="colon">:</span><div className="flip-card"><span>{timeObj.secs}</span></div>
          </div>
          <p className="flip-subject">{selectedSubject}</p>
        </div>
      )}
      
      <div className="timer-controls-row">
        <button className={`btn ${isActive ? 'pause' : 'start'} focus-btn`} onClick={toggleTimer}>{isActive ? 'PAUSE' : 'START'}</button>
        
        {(timeLeft < pomodoroLength * 60) && (
          <button className="btn end-log-btn" onClick={endAndLogEarly}>END & LOG</button>
        )}
        
        <button className="btn reset-btn-control" onClick={resetTimer}>RESET</button>
      </div>

      {!isDND && (
        <div className="pro-controls" style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
          <button className="btn pro-btn pip-btn" onClick={toggleNativePIP}>🖥️ Floating PIP Timer</button>
          <button className="btn pro-btn dnd" onClick={toggleDND}>🌙 Enter Fullscreen DND</button>
        </div>
      )}
    </div>
  );

  return (
    <div className="app-container">
      <div style={{ position: 'fixed', top: '-1000px', left: '-1000px', opacity: 0, pointerEvents: 'none' }}>
        <canvas ref={canvasRef} width="600" height="400" />
        <video ref={videoRef} muted autoPlay playsInline />
      </div>

      {isDND && <div className="dnd-overlay"><TimerWidget /></div>}

      <header className="header">
        <div className="header-left">
          <div className="logo">CA</div>
          <div className="user-greeting">
            <h1>Sathi</h1>
            <p>DEVELOPED BY NIKET TALWAR</p>
          </div>
        </div>
        <nav className="header-center">
          {['Dashboard', 'Targets', 'Achievements', 'Analytics', 'Mentor', 'Materials', 'Settings'].map(tab => (
            <button key={tab} className={`nav-link ${activeTab === tab ? 'active' : ''}`} onClick={() => setActiveTab(tab)}>{tab}</button>
          ))}
        </nav>
      </header>

      {/* DASHBOARD */}
      {activeTab === 'Dashboard' && (
        <div className="tab-content fade-in">
          <div className="stats-dashboard">
            <StatsCard icon="📅" title="EXAM COUNTDOWN" value={daysRemaining} subtext="days remaining" type="red" />
            <StatsCard icon="⏱️" title="TODAY'S STUDY" value={`${todayHours} / ${dailyGoal}h`} subtext={isBehind ? "Behind schedule" : "Target Hit!"} type={isBehind ? "red" : "green"} />
            <div className="stats-card streak-card green">
              <div className="card-header"><span className="card-icon">🔥</span><h3 className="card-title">TRUE STREAK</h3></div>
              <p className="card-value">{streakData.count}</p>
              <p className="card-subtext green">Days hitting target + login</p>
            </div>
            <StatsCard icon="📈" title="TOTAL HOURS" value={totalHoursLogged} subtext="all time logged" />
          </div>

          <div className="main-dashboard-grid">
            <div className="quick-actions panel">
              <h2>Focus Engine</h2>
              <div className="quick-subject-selector">
                {SUBJECTS.map(sub => (
                  <button key={sub} className={`sub-btn ${selectedSubject === sub ? 'active' : ''}`} onClick={() => setSelectedSubject(sub)}>{sub}</button>
                ))}
              </div>
              {!isDND && <TimerWidget />}
            </div>

            <div className="dashboard-right-col">
              <div className="today-targets panel mini-panel">
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                  <h2>Today's Targets</h2>
                  <button className="btn reset-btn-control" style={{width:'auto', padding:'5px 15px', fontSize:'0.8rem'}} onClick={() => setActiveTab('Targets')}>Add New +</button>
                </div>
                {/* 🚀 FIX: Passed props perfectly down to the stable renderer */}
                <TargetListRenderer tasks={todayTodos} toggleTodo={toggleTodo} deleteTodo={deleteTodo} />
              </div>

              <div className="today-sessions panel mini-panel">
                <h2>Today's Logs</h2>
                <ul className="log-list scrollable-mini">
                  {todaySessions.length === 0 ? <p className="empty-state">No sessions yet.</p> :
                    todaySessions.map((s) => (
                    <li key={s.id} className="log-item">
                      <div><strong>{s.subject}</strong> <span className="log-duration">({s.duration}m)</span></div>
                      <div className="log-date">{new Date(s.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TARGETS PLANNER */}
      {activeTab === 'Targets' && (
        <div className="tab-content fade-in panel">
          <h2>Daily Target Planner</h2>
          <p className="empty-state" style={{textAlign: 'left', marginBottom: '20px'}}>Structure your day by assigning specific chapters to exact study methods.</p>
          
          <form onSubmit={handleAddStructuredTask} className="structured-task-form">
            <div className="form-row">
              <select value={targetSub} onChange={e => setTargetSub(e.target.value)} className="task-input select-input">
                {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              <select value={targetCat} onChange={e => setTargetCat(e.target.value)} className="task-input select-input">
                {TARGET_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="form-row">
              <input type="text" placeholder="Enter Chapter or Topic Name (e.g. INDAS-116 Leases, Block Assessments)..." value={targetTopic} onChange={(e) => setTargetTopic(e.target.value)} className="task-input" />
              <button type="submit" className="btn start focus-btn" style={{width: '200px'}}>Add Target</button>
            </div>
          </form>

          <h3 className="section-title" style={{marginTop: '30px'}}>Your Master To-Do List</h3>
          <div className="full-target-list-wrapper">
             {/* 🚀 FIX: Passed props perfectly down to the stable renderer */}
             <TargetListRenderer tasks={todayTodos} toggleTodo={toggleTodo} deleteTodo={deleteTodo} />
          </div>
        </div>
      )}

      {/* ACHIEVEMENTS */}
      {activeTab === 'Achievements' && (
        <div className="tab-content fade-in panel">
          <h2>Trophy Cabinet</h2>
          <div className="trophy-grid">
            {ACHIEVEMENTS_DB.map(ach => {
              const isUnlocked = unlockedAchievements.some(u => u.id === ach.id);
              return (
                <div key={ach.id} className={`trophy-card ${isUnlocked ? 'unlocked gold' : 'locked'}`}>
                  <div className="trophy-icon">{ach.icon}</div>
                  <h3>{ach.title}</h3>
                  <p>{ach.desc}</p>
                  <span className="status">{isUnlocked ? 'UNLOCKED' : 'LOCKED'}</span>
                </div>
              );
            })}
          </div>
          <h2 style={{marginTop: '3rem', borderTop: '1px solid #30363d', paddingTop: '2rem'}}>Monthly History</h2>
          {Object.keys(achievementsByMonth).length === 0 ? (
            <p className="empty-state" style={{textAlign: 'left'}}>No achievements unlocked yet. Keep grinding!</p>
          ) : (
            <div className="history-timeline">
              {Object.keys(achievementsByMonth).reverse().map(month => (
                <div key={month} className="history-month">
                  <h3 className="month-title">{month}</h3>
                  <ul className="history-list">
                    {achievementsByMonth[month].map(unlocked => {
                      const details = ACHIEVEMENTS_DB.find(a => a.id === unlocked.id);
                      return (<li key={unlocked.id}><span className="history-icon">{details?.icon}</span><span className="history-text"><strong>{details?.title}</strong> - Unlocked on {unlocked.date}</span></li>);
                    })}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ANALYTICS */}
      {activeTab === 'Analytics' && (
        <div className="tab-content fade-in panel">
          <h2>Performance Analytics</h2>
          <h3 className="section-title">Weekly Trend (Last 7 Days)</h3>
          <div className="bar-chart-container">
            {weeklyData.days.map((day, i) => {
              const heightPct = (day.hours / (weeklyData.maxHrs || 1)) * 100;
              return (
                <div key={i} className="bar-col"><span className="bar-val">{day.hours}h</span><div className="bar-fill" style={{ height: `${heightPct}%` }}></div><span className="bar-label">{day.name}</span></div>
              );
            })}
          </div>
          <h3 className="section-title" style={{marginTop: '3rem'}}>All-Time Subject Distribution</h3>
          <div className="analytics-container">
            {SUBJECTS.map((sub, i) => {
              const hours = (sessions.filter(s => s.subject === sub).reduce((sum, s) => sum + s.duration, 0) / 60).toFixed(1);
              const maxHours = Math.max(...SUBJECTS.map(s => sessions.filter(x => x.subject === s).reduce((sum, x) => sum + x.duration, 0) / 60)) || 1;
              return (
                <div key={sub} className="analytics-row"><div className="analytics-label">{sub} <span>({hours}h)</span></div><div className="analytics-bar-bg"><div className="analytics-bar-fill" style={{ width: `${(hours/maxHours)*100}%`, backgroundColor: `var(--color-${i})`}}></div></div></div>
              )
            })}
          </div>
        </div>
      )}

      {/* MENTOR */}
      {activeTab === 'Mentor' && (
        <div className="tab-content fade-in panel mentor-container">
 <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
          <h2 style={{ margin: 0 }}>🧠 CA Sathi AI Mentor</h2>
<button className="btn reset-btn-control" style={{ width: 'auto', padding: '5px 15px', fontSize: '0.8rem' }} onClick={clearChatHistory}>Clear Chat</button>
          </div>
          {!apiKey && <div className="api-warning">⚠️ Paste your Gemini API Key in Settings to chat with the AI.</div>}
          <div className="chat-window">{chatMessages.map((msg, i) => (<div key={i} className={`chat-bubble ${msg.sender}`}>{msg.text}</div>))}</div>
          <div className="chat-input-row">
            <input type="text" value={chatInput} onChange={(e) => setChatInput(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()} placeholder="Ask a doubt..." className="task-input"/>
            <button className="btn start chat-send-btn" onClick={handleSendMessage}>Send</button>
          </div>
        </div>
      )}

      {/* MATERIALS */}
      {activeTab === 'Materials' && (
        <div className="tab-content fade-in panel">
          <h3 className="section-title">Faculty Drive Notes</h3>
          <div className="subject-progress-list">{SUBJECTS.map(sub => (<div key={sub} className="subject-card"><div className="subject-info"><h3>{sub}</h3><a href={NOTES_LINKS[sub]} target="_blank" rel="noreferrer" className="notes-link">Access Notes</a></div></div>))}</div>
          <h3 className="section-title" style={{marginTop: '2rem'}}>Previous Year RTP / MTP</h3>
          <div className="subject-progress-list">{SUBJECTS.map(sub => (<div key={`rtp-${sub}`} className="subject-card rtp-card"><div className="subject-info"><h3>{sub} RTPs</h3><a href={RTP_LINKS[sub]} target="_blank" rel="noreferrer" className="notes-link rtp-link">Access RTP</a></div></div>))}</div>
        </div>
      )}

      {/* SETTINGS */}
      {activeTab === 'Settings' && (
        <div className="tab-content fade-in panel">
          <h2>App Settings</h2>
          <div className="setting-input-group"><label>Gemini API Key:</label><input type="password" value={apiKey} onChange={(e) => setApiKey(e.target.value)} /><p className="hint">Required for AI Mentor. Get it free from Google AI Studio.</p></div>
          <div className="setting-input-group"><label>Exam Date:</label><input type="date" value={examDate} onChange={(e) => setExamDate(e.target.value)} /></div>
          <div className="setting-input-group"><label>Daily Goal (Hours):</label><input type="number" value={dailyGoal} onChange={(e) => setDailyGoal(e.target.value)} /></div>
          <button className="btn reset-btn-control" onClick={() => { if(window.confirm('Clear all data?')) { localStorage.clear(); window.location.reload(); }}}>Hard Reset App</button>
        </div>
      )}
    </div>
  );
}