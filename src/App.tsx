import { useState, useEffect, useCallback, useRef } from 'react';
import './App.css';

// 📚 NOTES LINKS
const NOTES_LINKS = {
  'Financial Reporting': 'https://drive.google.com/drive/folders/1ANLP_7cw7AXKkjWw4Lxp4mw7EuqcoosjuO3aR5SdqVo2oHMaVr5MiozHC662fDdpWfjsB0aP',
  'AFM': 'https://drive.google.com/drive/folders/14Ab9fZoPCcpnlDGc2bU-qTjxl6_PpdsPE_G0ndASdsFrRpPv9M4tYjRN3yPgFouCI7kQtDMq',
  'AUDIT': 'https://drive.google.com/drive/folders/1TJth8POIXDgsisqQ0EUSI7VlSY7WsdOvf0lAAzOLgfRsvFTz98HdLui7WWM1B4nDewaCKjhj',
  'Direct Tax': 'https://drive.google.com/drive/folders/14o4V7m7jxiGnrX4Sn9VyV8DChxCEOIRJSpSgEq1M-uzqqlsLoAWlOpN5Wz2p58GveZ4uUX3v',
  'IDT': 'https://drive.google.com/drive/folders/1fiRYgdDj8Zkl9s11Sguw03okzS18SMnJ95DIqOnaEZI0LoTLe8BR4x2HWPHmXMQ2iINWdu9M',
  'IBS': 'https://drive.google.com/drive/folders/1k5YeEN_1NGPXeeXkD8ziP_QOL3pIkzu4KCISPZbm9zEL8CKsk7I_ClWxvdnAEJS92tgp9WjR'
};
const SUBJECTS = Object.keys(NOTES_LINKS);

const StatsCard = ({ icon, title, value, subtext, type }) => (
  <div className={`stats-card ${type || ''}`}>
    <div className="card-header"><span className="card-icon">{icon}</span><h3 className="card-title">{title}</h3></div>
    <p className="card-value">{value}</p>
    <p className={`card-subtext ${type || ''}`}>{subtext}</p>
  </div>
);

export default function App() {
  // --- STATE MANAGEMENT ---
  const [activeTab, setActiveTab] = useState('Timer');
  const [sessions, setSessions] = useState(() => JSON.parse(localStorage.getItem('sessions')) || []);
  const [todos, setTodos] = useState(() => JSON.parse(localStorage.getItem('todos')) || []);
  const [dailyGoal, setDailyGoal] = useState(() => Number(localStorage.getItem('dailyGoal')) || 10);
  const [examDate, setExamDate] = useState(() => localStorage.getItem('examDate') || '2026-05-01');
  const [streakData, setStreakData] = useState(() => JSON.parse(localStorage.getItem('streakData')) || { count: 0, lastLogin: null, targetHitToday: false });
  
  // Timer State
  const [pomodoroLength, setPomodoroLength] = useState(25);
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState(SUBJECTS[0]);
  
  // Modes
  const [isPIP, setIsPIP] = useState(false);
  const [isDND, setIsDND] = useState(false);
  const [newTask, setNewTask] = useState('');

  // Mentor Chat State
  const [chatMessages, setChatMessages] = useState(() => JSON.parse(localStorage.getItem('chatMessages')) || [
    { sender: 'bot', text: 'Hey Audit Cubicles! The CA Sathi Mentor is online. What are we tackling today?' }
  ]);
  const [chatInput, setChatInput] = useState('');

  // --- PERSISTENCE ---
  useEffect(() => localStorage.setItem('sessions', JSON.stringify(sessions)), [sessions]);
  useEffect(() => localStorage.setItem('todos', JSON.stringify(todos)), [todos]);
  useEffect(() => localStorage.setItem('dailyGoal', dailyGoal), [dailyGoal]);
  useEffect(() => localStorage.setItem('examDate', examDate), [examDate]);
  useEffect(() => localStorage.setItem('streakData', JSON.stringify(streakData)), [streakData]);
  useEffect(() => localStorage.setItem('chatMessages', JSON.stringify(chatMessages)), [chatMessages]);

  // --- STREAK LOGIC (Daily Login + Target Achieved) ---
  useEffect(() => {
    const today = new Date().toLocaleDateString();
    let currentData = { ...streakData };

    if (currentData.lastLogin !== today) {
      // New day login check
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      
      if (currentData.lastLogin === yesterday.toLocaleDateString() && currentData.targetHitToday) {
        // Logged in yesterday AND hit target -> keep/grow streak
      } else if (currentData.lastLogin !== null) {
        // Missed a day or missed target -> reset
        currentData.count = 0; 
      }
      currentData.lastLogin = today;
      currentData.targetHitToday = false;
      setStreakData(currentData);
    }

    // Check if target hit today
    const todayMins = sessions.filter(s => new Date(s.date).toLocaleDateString() === today).reduce((sum, s) => sum + s.duration, 0);
    const todayHours = todayMins / 60;
    
    if (todayHours >= dailyGoal && !currentData.targetHitToday) {
      setStreakData({ ...currentData, targetHitToday: true, count: currentData.count + 1 });
    }
  }, [sessions, dailyGoal]);

  // --- TIMER LOGIC ---
  const logSession = useCallback(() => {
    const newSession = { id: Date.now(), subject: selectedSubject, duration: pomodoroLength, date: new Date().toISOString() };
    setSessions(s => [newSession, ...s]);
    setIsActive(false);
    setTimeLeft(pomodoroLength * 60);
    alert('Session Complete! Target logged.');
  }, [selectedSubject, pomodoroLength]);

  useEffect(() => {
    let interval = null;
    if (isActive && timeLeft > 0) interval = setInterval(() => setTimeLeft(t => t - 1), 1000);
    else if (isActive && timeLeft === 0) { clearInterval(interval); logSession(); }
    return () => clearInterval(interval);
  }, [isActive, timeLeft, logSession]);

  const toggleTimer = () => setIsActive(!isActive);
  const resetTimer = () => { setIsActive(false); setTimeLeft(pomodoroLength * 60); };
  const setPomodoro = (mins) => { setPomodoroLength(mins); setTimeLeft(mins * 60); setIsActive(false); };

  const toggleDND = () => {
    if (!isDND && document.documentElement.requestFullscreen) document.documentElement.requestFullscreen();
    else if (document.exitFullscreen) document.exitFullscreen();
    setIsDND(!isDND);
    setIsPIP(false);
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // --- TO-DO LOGIC ---
  const handleAddTask = (e) => {
    e.preventDefault();
    if (!newTask.trim()) return;
    setTodos([{ id: Date.now(), text: newTask, done: false, date: new Date().toLocaleDateString() }, ...todos]);
    setNewTask('');
  };
  const toggleTodo = (id) => setTodos(todos.map(t => t.id === id ? { ...t, done: !t.done } : t));
  const deleteTodo = (id) => setTodos(todos.filter(t => t.id !== id));
  const todayTodos = todos.filter(t => t.date === new Date().toLocaleDateString());

  // --- MENTOR CHAT API INTEGRATION ---
  const handleSendMessage = async () => {
    if (!chatInput.trim()) return;
    const newMsgs = [...chatMessages, { sender: 'user', text: chatInput }];
    setChatMessages(newMsgs);
    setChatInput('');

    // BRO, PUT YOUR AI API CALL HERE! Example using fetch:
    /*
    try {
      const response = await fetch('YOUR_API_ENDPOINT_HERE', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer YOUR_API_KEY` },
        body: JSON.stringify({ prompt: chatInput })
      });
      const data = await response.json();
      setChatMessages([...newMsgs, { sender: 'bot', text: data.reply }]);
    } catch (err) {
      setChatMessages([...newMsgs, { sender: 'bot', text: "Network error fetching mentor response." }]);
    }
    */
    
    // MOCK RESPONSE FOR NOW SO APP WORKS
    setTimeout(() => {
      setChatMessages([...newMsgs, { sender: 'bot', text: "Keep grinding, future CA! Make sure to complete your Daily To-Dos and hit that hour target." }]);
    }, 1000);
  };

  // --- DASHBOARD MATH ---
  const todayStr = new Date().toLocaleDateString();
  const todayHours = (sessions.filter(s => new Date(s.date).toLocaleDateString() === todayStr).reduce((sum, s) => sum + s.duration, 0) / 60).toFixed(1);
  const isBehind = todayHours < dailyGoal;
  const totalHoursLogged = (sessions.reduce((sum, s) => sum + s.duration, 0) / 60).toFixed(0);
  const daysRemaining = Math.max(0, Math.ceil((new Date(examDate) - new Date()) / (1000 * 60 * 60 * 24)));

  // --- FLOATING WIDGET (PIP & DND) ---
  const TimerWidget = () => (
    <div className={`timer-widget ${isPIP ? 'pip-mode' : ''} ${isDND ? 'dnd-mode' : ''}`}>
      {isDND && <h1 className="zen-title">DO NOT DISTURB - FULL FOCUS</h1>}
      {isPIP && <button className="close-pip" onClick={() => setIsPIP(false)}>×</button>}
      
      {!isDND && !isPIP && (
        <div className="pomodoro-presets">
          <button className={`preset-btn ${pomodoroLength === 25 ? 'active' : ''}`} onClick={() => setPomodoro(25)}>25m Focus</button>
          <button className={`preset-btn ${pomodoroLength === 50 ? 'active' : ''}`} onClick={() => setPomodoro(50)}>50m Deep Work</button>
        </div>
      )}

      <div className="timer-display-box">
        <h3>{formatTime(timeLeft)}</h3>
        <p>{selectedSubject}</p>
      </div>
      
      <div className="timer-controls-row">
        <button className={`btn ${isActive ? 'pause' : 'start'} focus-btn`} onClick={toggleTimer}>{isActive ? 'PAUSE' : 'START'}</button>
        <button className="btn reset-btn-control" onClick={resetTimer}>RESET</button>
      </div>

      {!isPIP && (
        <div className="pro-controls">
          <button className="btn pro-btn" onClick={() => setIsPIP(true)}>🖥️ PIP Mode</button>
          <button className="btn pro-btn dnd" onClick={toggleDND}>{isDND ? 'Exit DND' : '🌙 DND Mode'}</button>
        </div>
      )}
    </div>
  );

  return (
    <div className="app-container">
      {isDND && <div className="dnd-overlay"><TimerWidget /></div>}
      {isPIP && <TimerWidget />}

      <header className="header">
        <div className="header-left"><div className="logo">CA</div><div className="user-greeting"><h1>Sathi</h1><p>Auditcubicles HQ</p></div></div>
        <nav className="header-center">
          {['Timer', 'Targets', 'Analytics', 'Mentor', 'Notes', 'Settings'].map(tab => (
            <button key={tab} className={`nav-link ${activeTab === tab ? 'active' : ''}`} onClick={() => setActiveTab(tab)}>{tab}</button>
          ))}
        </nav>
      </header>

      {/* ⏱️ TAB: TIMER & DASHBOARD */}
      {activeTab === 'Timer' && (
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

          <div className="action-sessions-area">
            <div className="quick-actions panel">
              <h2>Focus Engine</h2>
              <div className="quick-subject-selector">
                {SUBJECTS.map(sub => (
                  <button key={sub} className={`sub-btn ${selectedSubject === sub ? 'active' : ''}`} onClick={() => setSelectedSubject(sub)}>{sub}</button>
                ))}
              </div>
              {!isPIP && !isDND && <TimerWidget />}
            </div>

            <div className="today-sessions panel">
              <h2>Session Logs</h2>
              <ul className="log-list">
                {sessions.filter(s => new Date(s.date).toLocaleDateString() === todayStr).map((s, i) => (
                  <li key={s.id} className="log-item">
                    <div><strong>{s.subject}</strong> <span className="log-duration">({s.duration}m)</span></div>
                    <div className="log-date">{new Date(s.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* 🎯 TAB: TARGETS & TO-DOS */}
      {activeTab === 'Targets' && (
        <div className="tab-content fade-in panel">
          <h2>Daily Targets & To-Dos</h2>
          <form onSubmit={handleAddTask} className="task-form">
            <input type="text" placeholder="Set a target (e.g. Complete AS-19)..." value={newTask} onChange={(e) => setNewTask(e.target.value)} className="task-input"/>
            <button type="submit" className="btn start focus-btn">Add Target</button>
          </form>
          <ul className="task-list">
            {todayTodos.map(t => (
              <li key={t.id} className={`task-item ${t.done ? 'completed' : ''}`}>
                <div className="task-left" onClick={() => toggleTodo(t.id)}>
                  <div className={`checkbox ${t.done ? 'checked' : ''}`}></div> <span>{t.text}</span>
                </div>
                <button className="del-btn" onClick={() => deleteTodo(t.id)}>×</button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* 📊 TAB: ANALYTICS */}
      {activeTab === 'Analytics' && (
        <div className="tab-content fade-in panel">
          <h2>Subject Distribution Analytics</h2>
          <div className="analytics-container">
            {SUBJECTS.map((sub, i) => {
              const hours = (sessions.filter(s => s.subject === sub).reduce((sum, s) => sum + s.duration, 0) / 60).toFixed(1);
              const maxHours = Math.max(...SUBJECTS.map(s => sessions.filter(x => x.subject === s).reduce((sum, x) => sum + x.duration, 0) / 60)) || 1;
              const pct = (hours / maxHours) * 100;
              return (
                <div key={sub} className="analytics-row">
                  <div className="analytics-label">{sub} <span>({hours}h)</span></div>
                  <div className="analytics-bar-bg"><div className="analytics-bar-fill" style={{ width: `${pct}%`, backgroundColor: `var(--color-${i})`}}></div></div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* 🧠 TAB: MENTOR */}
      {activeTab === 'Mentor' && (
        <div className="tab-content fade-in panel mentor-container">
          <h2>🧠 CA Sathi AI Mentor</h2>
          <div className="chat-window">
            {chatMessages.map((msg, i) => (
              <div key={i} className={`chat-bubble ${msg.sender}`}>
                {msg.text}
              </div>
            ))}
          </div>
          <div className="chat-input-row">
            <input type="text" value={chatInput} onChange={(e) => setChatInput(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()} placeholder="Ask for a study plan or clear a doubt..." className="task-input"/>
            <button className="btn start focus-btn" onClick={handleSendMessage}>Send</button>
          </div>
        </div>
      )}

      {/* 📚 TAB: NOTES */}
      {activeTab === 'Notes' && (
        <div className="tab-content fade-in panel">
          <h2>Faculty Drive Links</h2>
          <div className="subject-progress-list">
            {SUBJECTS.map((sub) => (
              <div key={sub} className="subject-card"><div className="subject-info"><h3>{sub}</h3><a href={NOTES_LINKS[sub]} target="_blank" rel="noopener noreferrer" className="notes-link">Access Drive</a></div></div>
            ))}
          </div>
        </div>
      )}

      {/* ⚙️ TAB: SETTINGS */}
      {activeTab === 'Settings' && (
        <div className="tab-content fade-in panel">
          <h2>App Settings</h2>
          <div className="setting-input-group"><label>Exam Date:</label><input type="date" value={examDate} onChange={(e) => setExamDate(e.target.value)} /></div>
          <div className="setting-input-group"><label>Daily Goal (Hours for Streak):</label><input type="number" value={dailyGoal} onChange={(e) => setDailyGoal(e.target.value)} /></div>
          <button className="btn reset-btn-control" onClick={() => { if(window.confirm('Clear all data?')) { localStorage.clear(); window.location.reload(); }}}>Hard Reset App</button>
        </div>
      )}
    </div>
  );
}