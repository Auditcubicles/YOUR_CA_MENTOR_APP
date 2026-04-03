import { useState, useEffect, useCallback, useRef } from 'react';
import './App.css';

// 📚 LINKS
const NOTES_LINKS = {
  'Financial Reporting': 'https://drive.google.com/drive/folders/1ANLP_7cw7AXKkjWw4Lxp4mw7EuqcoosjuO3aR5SdqVo2oHMaVr5MiozHC662fDdpWfjsB0aP',
  'AFM': 'https://drive.google.com/drive/folders/14Ab9fZoPCcpnlDGc2bU-qTjxl6_PpdsPE_G0ndASdsFrRpPv9M4tYjRN3yPgFouCI7kQtDMq',
  'AUDIT': 'https://drive.google.com/drive/folders/1TJth8POIXDgsisqQ0EUSI7VlSY7WsdOvf0lAAzOLgfRsvFTz98HdLui7WWM1B4nDewaCKjhj',
  'Direct Tax': 'https://drive.google.com/drive/folders/14o4V7m7jxiGnrX4Sn9VyV8DChxCEOIRJSpSgEq1M-uzqqlsLoAWlOpN5Wz2p58GveZ4uUX3v',
  'IDT': 'https://drive.google.com/drive/folders/1fiRYgdDj8Zkl9s11Sguw03okzS18SMnJ95DIqOnaEZI0LoTLe8BR4x2HWPHmXMQ2iINWdu9M',
  'IBS': 'https://drive.google.com/drive/folders/1k5YeEN_1NGPXeeXkD8ziP_QOL3pIkzu4KCISPZbm9zEL8CKsk7I_ClWxvdnAEJS92tgp9WjR'
};
const RTP_LINKS = {
  'Financial Reporting': 'https://drive.google.com/drive/folders/1QuwWAVVp7I_WDHpuk9Jhrlruthpccq-t',
  'AFM': 'https://drive.google.com/drive/folders/1wrhq4le7R67_44puqXpfm_JNNLL3M4Th',
  'AUDIT': 'https://drive.google.com/drive/folders/1RviDhUZj1AvHRAU4Im5W0wPu1dtWaahd',
  'Direct Tax': 'https://drive.google.com/drive/folders/1HyQJdCFfRci__mRrHC6h-1nLR-JMvxKG',
  'IDT': 'https://drive.google.com/drive/folders/1v-36rQLlFOixBjLM4b-e-pfglu0n9FNX',
  'IBS': 'https://drive.google.com/drive/folders/12lZj9JlvkffriT5Rq_1oCV_IyIFjoOKo'
};
const SUBJECTS = Object.keys(NOTES_LINKS);

const StatsCard = ({ icon, title, value, subtext, type }) => (
  <div className={`stats-card ${type || ''}`}><div className="card-header"><span className="card-icon">{icon}</span><h3 className="card-title">{title}</h3></div><p className="card-value">{value}</p><p className={`card-subtext ${type || ''}`}>{subtext}</p></div>
);

export default function App() {
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [sessions, setSessions] = useState(() => JSON.parse(localStorage.getItem('sessions')) || []);
  const [todos, setTodos] = useState(() => JSON.parse(localStorage.getItem('todos')) || []);
  const [dailyGoal, setDailyGoal] = useState(() => Number(localStorage.getItem('dailyGoal')) || 10);
  const [examDate, setExamDate] = useState(() => localStorage.getItem('examDate') || '2026-05-01');
  const [streakData, setStreakData] = useState(() => JSON.parse(localStorage.getItem('streakData')) || { count: 0, lastLogin: null, targetHitToday: false });
  const [unlockedTrophies, setUnlockedTrophies] = useState(() => JSON.parse(localStorage.getItem('unlockedTrophies')) || {});
  
  // Timer & UI State
  const [pomodoroLength, setPomodoroLength] = useState(25);
  const [customMins, setCustomMins] = useState('');
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState(SUBJECTS[0]);
  const [clockStyle, setClockStyle] = useState('minimal'); // 'standard', 'flip', 'minimal'
  const [analyticsView, setAnalyticsView] = useState('daily');
  const [isDND, setIsDND] = useState(false);
  const [newTask, setNewTask] = useState('');

  // Mentor Chat
  const [chatMessages, setChatMessages] = useState(() => JSON.parse(localStorage.getItem('chatMessages')) || [{ sender: 'bot', text: 'Hey Niket! CA Sathi is online.' }]);
  const [chatInput, setChatInput] = useState('');
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('geminiApiKey') || '');
  const [aiModel, setAiModel] = useState(() => localStorage.getItem('aiModel') || 'gemini-1.5-pro-latest');

  // Persistence
  useEffect(() => localStorage.setItem('sessions', JSON.stringify(sessions)), [sessions]);
  useEffect(() => localStorage.setItem('todos', JSON.stringify(todos)), [todos]);
  useEffect(() => localStorage.setItem('dailyGoal', dailyGoal), [dailyGoal]);
  useEffect(() => localStorage.setItem('examDate', examDate), [examDate]);
  useEffect(() => localStorage.setItem('streakData', JSON.stringify(streakData)), [streakData]);
  useEffect(() => localStorage.setItem('unlockedTrophies', JSON.stringify(unlockedTrophies)), [unlockedTrophies]);
  useEffect(() => localStorage.setItem('chatMessages', JSON.stringify(chatMessages)), [chatMessages]);
  useEffect(() => { localStorage.setItem('geminiApiKey', apiKey); localStorage.setItem('aiModel', aiModel); }, [apiKey, aiModel]);

  // Streak & Unlock Logic
  useEffect(() => {
    const today = new Date().toLocaleDateString();
    let currentData = { ...streakData };
    if (currentData.lastLogin !== today) {
      const yesterday = new Date(); yesterday.setDate(yesterday.getDate() - 1);
      if (currentData.lastLogin !== yesterday.toLocaleDateString() && currentData.lastLogin !== null) currentData.count = 0;
      currentData.lastLogin = today; currentData.targetHitToday = false;
      setStreakData(currentData);
    }
    const todayHours = sessions.filter(s => new Date(s.date).toLocaleDateString() === today).reduce((sum, s) => sum + s.duration, 0) / 60;
    if (todayHours >= dailyGoal && !currentData.targetHitToday) setStreakData({ ...currentData, targetHitToday: true, count: currentData.count + 1 });
  }, [sessions, dailyGoal]);

  // Timer Execution
  const logSession = useCallback(() => {
    const newSession = { id: Date.now(), subject: selectedSubject, duration: pomodoroLength, date: new Date().toISOString() };
    setSessions(s => [newSession, ...s]);
    setIsActive(false); setTimeLeft(pomodoroLength * 60);
    alert('Focus Session Logged!');
    checkAchievements(newSession);
  }, [selectedSubject, pomodoroLength]);

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
    else if (document.exitFullscreen) document.exitFullscreen().catch(e => console.log(e));
    setIsDND(!isDND);
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60); const s = seconds % 60;
    return { mins: `${m < 10 ? '0' : ''}${m}`, secs: `${s < 10 ? '0' : ''}${s}`, full: `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}` };
  };
  const timeObj = formatTime(timeLeft);

  // To-Dos
  const handleAddTask = (e) => { e.preventDefault(); if (!newTask.trim()) return; setTodos([{ id: Date.now(), text: newTask, done: false, date: new Date().toLocaleDateString() }, ...todos]); setNewTask(''); };
  const toggleTodo = (id) => setTodos(todos.map(t => t.id === id ? { ...t, done: !t.done } : t));
  const deleteTodo = (id) => setTodos(todos.filter(t => t.id !== id));

  // AI Mentor API (Fixed Model Engine)
  const handleSendMessage = async () => {
    if (!chatInput.trim()) return;
    const newMsgs = [...chatMessages, { sender: 'user', text: chatInput }];
    setChatMessages(newMsgs); setChatInput('');
    if (!apiKey) return setChatMessages([...newMsgs, { sender: 'bot', text: "ERROR: Set your API Key in Settings." }]);

    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${aiModel}:generateContent?key=${apiKey}`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: `You are a strict AI mentor for Niket, a CA final student. Keep it short. Niket says: ${chatInput}` }] }] })
      });
      const data = await response.json();
      if(data.error) throw new Error(data.error.message);
      setChatMessages([...newMsgs, { sender: 'bot', text: data.candidates[0].content.parts[0].text }]);
    } catch (err) {
      setChatMessages([...newMsgs, { sender: 'bot', text: `API Error: ${err.message}` }]);
    }
  };

  // Dashboard Math
  const todayStr = new Date().toLocaleDateString();
  const todaySessions = sessions.filter(s => new Date(s.date).toLocaleDateString() === todayStr);
  const todayHours = (todaySessions.reduce((sum, s) => sum + s.duration, 0) / 60).toFixed(1);
  const totalHours = (sessions.reduce((sum, s) => sum + s.duration, 0) / 60).toFixed(0);
  const daysRemaining = Math.max(0, Math.ceil((new Date(examDate) - new Date()) / (1000 * 60 * 60 * 24)));

  // --- MEGA TROPHY SYSTEM ---
  const checkAchievements = (lastSession) => {
    const newUnlocks = { ...unlockedTrophies };
    const monthStr = new Date().toLocaleString('default', { month: 'short', year: 'numeric' });
    const unlock = (id) => { if (!newUnlocks[id]) newUnlocks[id] = monthStr; };

    if (sessions.length >= 1) unlock('first');
    if (todayHours >= 3) unlock('bronze');
    if (todayHours >= 6) unlock('silver');
    if (todayHours >= 10) unlock('gold');
    if (todayHours >= 14) unlock('diamond');
    if (streakData.count >= 3) unlock('streak3');
    if (streakData.count >= 7) unlock('streak7');
    if (streakData.count >= 14) unlock('streak14');
    if (streakData.count >= 30) unlock('streak30');
    if (totalHours >= 100) unlock('100hrs');
    if (totalHours >= 500) unlock('500hrs');
    
    const hour = new Date(lastSession.date).getHours();
    if (hour < 6) unlock('early_bird');
    if (hour >= 22) unlock('night_owl');

    setUnlockedTrophies(newUnlocks);
  };

  const TROPHIES = [
    { id: 'first', icon: '🐣', title: 'The First Step', desc: 'Log your first session' },
    { id: 'bronze', icon: '🥉', title: 'Bronze Grind', desc: '3+ hours in a day' },
    { id: 'silver', icon: '🥈', title: 'Silver Hustle', desc: '6+ hours in a day' },
    { id: 'gold', icon: '🥇', title: 'Gold Mastery', desc: '10+ hours in a day' },
    { id: 'diamond', icon: '💎', title: 'Diamond Focus', desc: '14+ hours in a day' },
    { id: 'streak3', icon: '🔥', title: 'Warming Up', desc: '3 Day Target Streak' },
    { id: 'streak7', icon: '📅', title: 'Consistent CA', desc: '7 Day Target Streak' },
    { id: 'streak14', icon: '🗓️', title: 'Fortnight Focus', desc: '14 Day Target Streak' },
    { id: 'streak30', icon: '🏆', title: 'Monthly Master', desc: '30 Day Target Streak' },
    { id: 'early_bird', icon: '🌅', title: 'Early Bird', desc: 'Log session before 6 AM' },
    { id: 'night_owl', icon: '🦉', title: 'Night Owl', desc: 'Log session after 10 PM' },
    { id: '100hrs', icon: '💯', title: 'Century Club', desc: '100 total hours logged' },
    { id: '500hrs', icon: '💫', title: '500 Club', desc: '500 total hours logged' },
    { id: 'polymath', icon: '🧠', title: 'Polymath', desc: 'Study 3 subjects in 1 day' },
    { id: 'weekend', icon: '⚔️', title: 'Weekend Warrior', desc: 'Hit daily goal on Sunday' },
  ];

  // --- ANALYTICS ENGINE (Time-based grouping) ---
  const getChartData = () => {
    let data = [];
    if (analyticsView === 'daily') {
      // Last 7 Days
      for(let i=6; i>=0; i--) {
        const d = new Date(); d.setDate(d.getDate() - i);
        const dateStr = d.toLocaleDateString();
        const hrs = sessions.filter(s => new Date(s.date).toLocaleDateString() === dateStr).reduce((sum, s) => sum + s.duration, 0) / 60;
        data.push({ label: d.toLocaleDateString('en-US', {weekday:'short'}), value: hrs.toFixed(1) });
      }
    } else if (analyticsView === 'weekly') {
      // Last 4 Weeks
      for(let i=3; i>=0; i--) {
        const start = new Date(); start.setDate(start.getDate() - (i*7 + 7));
        const end = new Date(); end.setDate(end.getDate() - (i*7));
        const hrs = sessions.filter(s => new Date(s.date) >= start && new Date(s.date) <= end).reduce((sum, s) => sum + s.duration, 0) / 60;
        data.push({ label: `Week ${4-i}`, value: hrs.toFixed(1) });
      }
    } else if (analyticsView === 'monthly') {
      // Last 6 Months
      for(let i=5; i>=0; i--) {
        const d = new Date(); d.setMonth(d.getMonth() - i);
        const mStr = d.toLocaleString('default', { month: 'short' });
        const hrs = sessions.filter(s => new Date(s.date).getMonth() === d.getMonth()).reduce((sum, s) => sum + s.duration, 0) / 60;
        data.push({ label: mStr, value: hrs.toFixed(1) });
      }
    } else if (analyticsView === 'subject') {
      SUBJECTS.forEach(sub => {
        const hrs = sessions.filter(s => s.subject === sub).reduce((sum, s) => sum + s.duration, 0) / 60;
        data.push({ label: sub.substring(0,5), value: hrs.toFixed(1), fullLabel: sub });
      });
    }
    const maxVal = Math.max(...data.map(d => Number(d.value))) || 1;
    return { data, maxVal };
  };
  const chart = getChartData();

  // --- TIMER WIDGET COMPONENT ---
  const TimerWidget = () => (
    <div className={`timer-widget ${isDND ? 'dnd-mode' : ''}`}>
      {!isDND && (
        <div className="clock-style-toggle">
          <button className={clockStyle === 'minimal' ? 'active' : ''} onClick={() => setClockStyle('minimal')}>Minimal</button>
          <button className={clockStyle === 'standard' ? 'active' : ''} onClick={() => setClockStyle('standard')}>Standard</button>
          <button className={clockStyle === 'flip' ? 'active' : ''} onClick={() => setClockStyle('flip')}>Flip Clock</button>
        </div>
      )}

      {/* CLOCK RENDERS */}
      {clockStyle === 'minimal' && (
        <div className="minimal-clock">
          <svg className="progress-ring" width="240" height="240">
            <circle className="ring-bg" stroke="#161b22" strokeWidth="8" fill="transparent" r="110" cx="120" cy="120"/>
            <circle className="ring-fill" stroke={isActive ? "#22c55e" : "#38bdf8"} strokeWidth="8" fill="transparent" r="110" cx="120" cy="120" style={{ strokeDasharray: `${2 * Math.PI * 110}`, strokeDashoffset: `${2 * Math.PI * 110 * (1 - timeLeft / (pomodoroLength * 60))}` }}/>
          </svg>
          <div className="minimal-text">
            <h2>{timeObj.full}</h2>
            <p>{selectedSubject}</p>
          </div>
        </div>
      )}
      
      {clockStyle === 'standard' && (<div className="timer-display-box"><h3>{timeObj.full}</h3><p>{selectedSubject}</p></div>)}
      
      {clockStyle === 'flip' && (
        <div className="flip-clock-container">
          <div className="flip-clock"><div className="flip-card"><span>{timeObj.mins}</span></div><span className="colon">:</span><div className="flip-card"><span>{timeObj.secs}</span></div></div>
          <p className="flip-subject">{selectedSubject}</p>
        </div>
      )}

      {!isDND && (
        <div className="pomodoro-presets">
          <button className={`preset-btn ${pomodoroLength === 25 ? 'active' : ''}`} onClick={() => setPomodoro(25)}>25m</button>
          <button className={`preset-btn ${pomodoroLength === 50 ? 'active' : ''}`} onClick={() => setPomodoro(50)}>50m</button>
          <form onSubmit={handleCustomTime} className="custom-time-form"><input type="number" placeholder="Mins" value={customMins} onChange={e => setCustomMins(e.target.value)} /><button type="submit">Set</button></form>
        </div>
      )}
      
      <div className="timer-controls-row">
        <button className={`btn ${isActive ? 'pause' : 'start'} focus-btn`} onClick={toggleTimer}>{isActive ? 'PAUSE' : 'START'}</button>
        <button className="btn reset-btn-control" onClick={resetTimer}>RESET</button>
      </div>

      {!isDND && <button className="btn pro-btn dnd full-width" onClick={toggleDND}>🌙 Enter Fullscreen DND Mode</button>}
    </div>
  );

  return (
    <div className="app-container">
      {/* 🛑 FIXED DND OVERLAY WITH EXIT BUTTON */}
      {isDND && (
        <div className="dnd-overlay">
          <button className="exit-dnd-btn" onClick={toggleDND}>✖ EXIT DND FULLSCREEN</button>
          <TimerWidget />
        </div>
      )}

      <header className="header">
        <div className="header-left"><div className="logo">CA</div><div className="user-greeting"><h1>Sathi</h1><p>DEVELOPED BY NIKET TALWAR</p></div></div>
        <nav className="header-center">
          {['Dashboard', 'Achievements', 'Analytics', 'Mentor', 'Materials', 'Settings'].map(tab => (
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
            <div className="stats-card streak-card green"><div className="card-header"><span className="card-icon">🔥</span><h3 className="card-title">TRUE STREAK</h3></div><p className="card-value">{streakData.count}</p><p className="card-subtext green">Days hitting target + login</p></div>
            <StatsCard icon="📈" title="TOTAL HOURS" value={totalHours} subtext="all time logged" />
          </div>

          <div className="main-dashboard-grid">
            <div className="quick-actions panel">
              <h2>Focus Engine</h2>
              <div className="quick-subject-selector">
                {SUBJECTS.map(sub => (<button key={sub} className={`sub-btn ${selectedSubject === sub ? 'active' : ''}`} onClick={() => setSelectedSubject(sub)}>{sub}</button>))}
              </div>
              {!isDND && <TimerWidget />}
            </div>

            <div className="dashboard-right-col">
              <div className="today-targets panel mini-panel">
                <h2>Today's Targets</h2>
                <form onSubmit={handleAddTask} className="task-form small"><input type="text" placeholder="Add target..." value={newTask} onChange={(e) => setNewTask(e.target.value)} className="task-input"/><button type="submit" className="btn start focus-btn mini">+</button></form>
                <ul className="task-list scrollable-mini">
                  {todos.filter(t => t.date === new Date().toLocaleDateString()).map(t => (
                    <li key={t.id} className={`task-item ${t.done ? 'completed' : ''}`}><div className="task-left" onClick={() => toggleTodo(t.id)}><div className={`checkbox ${t.done ? 'checked' : ''}`}></div> <span>{t.text}</span></div><button className="del-btn" onClick={() => deleteTodo(t.id)}>×</button></li>
                  ))}
                </ul>
              </div>
              <div className="today-sessions panel mini-panel">
                <h2>Today's Logs</h2>
                <ul className="log-list scrollable-mini">
                  {todaySessions.map(s => (<li key={s.id} className="log-item"><div><strong>{s.subject}</strong> <span className="log-duration">({s.duration}m)</span></div><div className="log-date">{new Date(s.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div></li>))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MEGA ACHIEVEMENTS */}
      {activeTab === 'Achievements' && (
        <div className="tab-content fade-in panel">
          <h2>Trophy Cabinet & History</h2>
          <div className="trophy-grid">
            {TROPHIES.map(t => {
              const unlockedMonth = unlockedTrophies[t.id];
              return (
                <div key={t.id} className={`trophy-card ${unlockedMonth ? 'unlocked gold' : 'locked'}`}>
                  <div className="trophy-icon">{t.icon}</div>
                  <h3>{t.title}</h3><p>{t.desc}</p>
                  <span className="status">{unlockedMonth ? `Unlocked: ${unlockedMonth}` : 'LOCKED'}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ADVANCED ANALYTICS */}
      {activeTab === 'Analytics' && (
        <div className="tab-content fade-in panel">
          <div className="header-left" style={{justifyContent: 'space-between', marginBottom: '20px'}}>
            <h2>Performance Analytics</h2>
            <div className="clock-style-toggle">
              {['daily', 'weekly', 'monthly', 'subject'].map(v => (
                <button key={v} className={analyticsView === v ? 'active' : ''} onClick={() => setAnalyticsView(v)}>{v.toUpperCase()}</button>
              ))}
            </div>
          </div>
          
          <div className="chart-wrapper">
            {chart.data.map((d, i) => {
              const heightPct = (Number(d.value) / chart.maxVal) * 100;
              return (
                <div key={i} className="chart-bar-container">
                  <div className="chart-val">{d.value}h</div>
                  <div className="chart-bar"><div className="chart-fill" style={{ height: `${heightPct}%`, backgroundColor: `var(--color-${i%6})`}}></div></div>
                  <div className="chart-label" title={d.fullLabel || d.label}>{d.label}</div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* MENTOR */}
      {activeTab === 'Mentor' && (
        <div className="tab-content fade-in panel mentor-container">
          <h2>🧠 CA Sathi AI Mentor</h2>
          {!apiKey && <div className="api-warning">⚠️ Paste your Gemini API Key in Settings to chat.</div>}
          <div className="chat-window">{chatMessages.map((msg, i) => (<div key={i} className={`chat-bubble ${msg.sender}`}>{msg.text}</div>))}</div>
          <div className="chat-input-row">
            <input type="text" value={chatInput} onChange={(e) => setChatInput(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()} placeholder="Ask a doubt..." className="task-input"/>
            <button className="btn start focus-btn" onClick={handleSendMessage}>Send</button>
          </div>
        </div>
      )}

      {/* MATERIALS */}
      {activeTab === 'Materials' && (
        <div className="tab-content fade-in panel">
          <h3 className="section-title">Faculty Drive Notes</h3><div className="subject-progress-list">{SUBJECTS.map(sub => (<div key={sub} className="subject-card"><div className="subject-info"><h3>{sub}</h3><a href={NOTES_LINKS[sub]} target="_blank" rel="noreferrer" className="notes-link">Access Notes</a></div></div>))}</div>
          <h3 className="section-title" style={{marginTop: '2rem'}}>Previous Year RTP / MTP</h3><div className="subject-progress-list">{SUBJECTS.map(sub => (<div key={`rtp-${sub}`} className="subject-card rtp-card"><div className="subject-info"><h3>{sub} RTPs</h3><a href={RTP_LINKS[sub]} target="_blank" rel="noreferrer" className="notes-link rtp-link">Access RTP</a></div></div>))}</div>
        </div>
      )}

      {/* SETTINGS */}
      {activeTab === 'Settings' && (
        <div className="tab-content fade-in panel">
          <h2>App Settings</h2>
          <div className="setting-input-group"><label>Gemini API Key:</label><input type="password" value={apiKey} onChange={(e) => setApiKey(e.target.value)} /></div>
          <div className="setting-input-group"><label>AI Model (Change if error):</label><input type="text" value={aiModel} onChange={(e) => setAiModel(e.target.value)} /><p className="hint">Defaults to <code>gemini-1.5-pro-latest</code>. Try <code>gemini-1.5-flash</code> if it fails.</p></div>
          <div className="setting-input-group"><label>Exam Date:</label><input type="date" value={examDate} onChange={(e) => setExamDate(e.target.value)} /></div>
          <div className="setting-input-group"><label>Daily Goal (Hours):</label><input type="number" value={dailyGoal} onChange={(e) => setDailyGoal(e.target.value)} /></div>
          <button className="btn reset-btn-control" onClick={() => { if(window.confirm('Clear all data?')) { localStorage.clear(); window.location.reload(); }}}>Hard Reset App</button>
        </div>
      )}
    </div>
  );
}