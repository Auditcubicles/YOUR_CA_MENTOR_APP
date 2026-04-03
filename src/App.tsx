import { useState, useEffect, useCallback } from 'react';
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
  'Financial Reporting': 'https://drive.google.com/drive/folders/1QuwWAVVp7I_WDHpuk9Jhrlruthpccq-t',
  'AFM': 'https://drive.google.com/drive/folders/1wrhq4le7R67_44puqXpfm_JNNLL3M4Th',
  'AUDIT': 'https://drive.google.com/drive/folders/1RviDhUZj1AvHRAU4Im5W0wPu1dtWaahd',
  'Direct Tax': 'https://drive.google.com/drive/folders/1HyQJdCFfRci__mRrHC6h-1nLR-JMvxKG',
  'IDT': 'https://drive.google.com/drive/folders/1v-36rQLlFOixBjLM4b-e-pfglu0n9FNX',
  'IBS': 'https://drive.google.com/drive/folders/12lZj9JlvkffriT5Rq_1oCV_IyIFjoOKo'
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
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [sessions, setSessions] = useState(() => JSON.parse(localStorage.getItem('sessions')) || []);
  const [todos, setTodos] = useState(() => JSON.parse(localStorage.getItem('todos')) || []);
  const [dailyGoal, setDailyGoal] = useState(() => Number(localStorage.getItem('dailyGoal')) || 10);
  const [examDate, setExamDate] = useState(() => localStorage.getItem('examDate') || '2026-05-01');
  const [streakData, setStreakData] = useState(() => JSON.parse(localStorage.getItem('streakData')) || { count: 0, lastLogin: null, targetHitToday: false });
  
  // Timer State
  const [pomodoroLength, setPomodoroLength] = useState(25);
  const [customMins, setCustomMins] = useState('');
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState(SUBJECTS[0]);
  
  // Modes
  const [isPIP, setIsPIP] = useState(false);
  const [isDND, setIsDND] = useState(false);
  const [newTask, setNewTask] = useState('');

  // Mentor Chat State
  const [chatMessages, setChatMessages] = useState(() => JSON.parse(localStorage.getItem('chatMessages')) || [
    { sender: 'bot', text: 'Hey Niket! CA Sathi is online. Paste your Gemini API key in the Settings tab to chat.' }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('geminiApiKey') || '');

  // --- PERSISTENCE ---
  useEffect(() => localStorage.setItem('sessions', JSON.stringify(sessions)), [sessions]);
  useEffect(() => localStorage.setItem('todos', JSON.stringify(todos)), [todos]);
  useEffect(() => localStorage.setItem('dailyGoal', dailyGoal), [dailyGoal]);
  useEffect(() => localStorage.setItem('examDate', examDate), [examDate]);
  useEffect(() => localStorage.setItem('streakData', JSON.stringify(streakData)), [streakData]);
  useEffect(() => localStorage.setItem('chatMessages', JSON.stringify(chatMessages)), [chatMessages]);
  useEffect(() => localStorage.setItem('geminiApiKey', apiKey), [apiKey]);

  // --- STREAK LOGIC (Daily Login + Target Achieved) ---
  useEffect(() => {
    const today = new Date().toLocaleDateString();
    let currentData = { ...streakData };

    if (currentData.lastLogin !== today) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      
      if (currentData.lastLogin === yesterday.toLocaleDateString() && currentData.targetHitToday) {
        // Kept streak
      } else if (currentData.lastLogin !== null) {
        currentData.count = 0; // Reset
      }
      currentData.lastLogin = today;
      currentData.targetHitToday = false;
      setStreakData(currentData);
    }

    const todayHours = sessions.filter(s => new Date(s.date).toLocaleDateString() === today).reduce((sum, s) => sum + s.duration, 0) / 60;
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
    alert('Focus Session Logged!');
  }, [selectedSubject, pomodoroLength]);

  useEffect(() => {
    let interval = null;
    if (isActive && timeLeft > 0) interval = setInterval(() => setTimeLeft(t => t - 1), 1000);
    else if (isActive && timeLeft === 0) { clearInterval(interval); logSession(); }
    return () => clearInterval(interval);
  }, [isActive, timeLeft, logSession]);

  const toggleTimer = () => setIsActive(!isActive);
  const resetTimer = () => { setIsActive(false); setTimeLeft(pomodoroLength * 60); };
  
  const setPomodoro = (mins) => { 
    setPomodoroLength(mins); 
    setTimeLeft(mins * 60); 
    setIsActive(false); 
    setCustomMins(''); // clear input
  };
  
  const handleCustomTime = (e) => {
    e.preventDefault();
    if(customMins > 0) setPomodoro(Number(customMins));
  };

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

  // --- MENTOR CHAT API INTEGRATION (REAL GEMINI API) ---
  const handleSendMessage = async () => {
    if (!chatInput.trim()) return;
    const newMsgs = [...chatMessages, { sender: 'user', text: chatInput }];
    setChatMessages(newMsgs);
    setChatInput('');

    if (!apiKey) {
      setChatMessages([...newMsgs, { sender: 'bot', text: "ERROR: You need to paste your Gemini API Key in the Settings tab first!" }]);
      return;
    }

    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: `You are a strict but helpful mentor for a CA (Chartered Accountant) student in India. The student asks: ${chatInput}` }] }]
        })
      });
      const data = await response.json();
      
      if(data.error) throw new Error(data.error.message);
      
      const botReply = data.candidates[0].content.parts[0].text;
      setChatMessages([...newMsgs, { sender: 'bot', text: botReply }]);
    } catch (err) {
      setChatMessages([...newMsgs, { sender: 'bot', text: `API Error: ${err.message}. Check your API Key.` }]);
    }
  };

  // --- DASHBOARD MATH & ACHIEVEMENTS ---
  const todayStr = new Date().toLocaleDateString();
  const todaySessions = sessions.filter(s => new Date(s.date).toLocaleDateString() === todayStr);
  const todayHours = (todaySessions.reduce((sum, s) => sum + s.duration, 0) / 60).toFixed(1);
  const isBehind = todayHours < dailyGoal;
  const totalHoursLogged = (sessions.reduce((sum, s) => sum + s.duration, 0) / 60).toFixed(0);
  const daysRemaining = Math.max(0, Math.ceil((new Date(examDate) - new Date()) / (1000 * 60 * 60 * 24)));

  const uniqueSubjectsToday = new Set(todaySessions.map(s => s.subject)).size;

  // --- FLOATING WIDGET (PIP & DND) ---
  const TimerWidget = () => (
    <div className={`timer-widget ${isPIP ? 'pip-mode' : ''} ${isDND ? 'dnd-mode' : ''}`}>
      {isDND && <h1 className="zen-title">DO NOT DISTURB - FULL FOCUS</h1>}
      {isPIP && <button className="close-pip" onClick={() => setIsPIP(false)}>×</button>}
      
      {!isDND && !isPIP && (
        <div className="timer-controls-wrapper">
          <div className="pomodoro-presets">
            <button className={`preset-btn ${pomodoroLength === 25 ? 'active' : ''}`} onClick={() => setPomodoro(25)}>25m</button>
            <button className={`preset-btn ${pomodoroLength === 50 ? 'active' : ''}`} onClick={() => setPomodoro(50)}>50m</button>
            <form onSubmit={handleCustomTime} className="custom-time-form">
              <input type="number" placeholder="Custom mins" value={customMins} onChange={e => setCustomMins(e.target.value)} min="1" max="300" />
              <button type="submit">Set</button>
            </form>
          </div>
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
          <button className="btn pro-btn" onClick={() => setIsPIP(true)}>🖥️ In-Browser PIP Mode</button>
          <button className="btn pro-btn dnd" onClick={toggleDND}>{isDND ? 'Exit DND' : '🌙 Fullscreen DND'}</button>
        </div>
      )}
    </div>
  );

  return (
    <div className="app-container">
      {isDND && <div className="dnd-overlay"><TimerWidget /></div>}
      {isPIP && <TimerWidget />}

      <header className="header">
        <div className="header-left">
          <div className="logo">CA</div>
          <div className="user-greeting">
            <h1>Sathi</h1>
            <p>DEVELOPED BY NIKET TALWAR</p>
          </div>
        </div>
        <nav className="header-center">
          {['Dashboard', 'Achievements', 'Analytics', 'Mentor', 'Materials', 'Settings'].map(tab => (
            <button key={tab} className={`nav-link ${activeTab === tab ? 'active' : ''}`} onClick={() => setActiveTab(tab)}>{tab}</button>
          ))}
        </nav>
      </header>

      {/* ⏱️ TAB: DASHBOARD (Unified Timer, Targets, Logs) */}
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
            {/* Left Column: Timer */}
            <div className="quick-actions panel">
              <h2>Focus Engine</h2>
              <div className="quick-subject-selector">
                {SUBJECTS.map(sub => (
                  <button key={sub} className={`sub-btn ${selectedSubject === sub ? 'active' : ''}`} onClick={() => setSelectedSubject(sub)}>{sub}</button>
                ))}
              </div>
              {!isPIP && !isDND && <TimerWidget />}
            </div>

            {/* Right Column: Targets & Logs */}
            <div className="dashboard-right-col">
              <div className="today-targets panel mini-panel">
                <h2>Today's Targets</h2>
                <form onSubmit={handleAddTask} className="task-form small">
                  <input type="text" placeholder="Add target..." value={newTask} onChange={(e) => setNewTask(e.target.value)} className="task-input"/>
                  <button type="submit" className="btn start focus-btn mini">+</button>
                </form>
                <ul className="task-list scrollable-mini">
                  {todayTodos.length === 0 ? <p className="empty-state">No targets set.</p> : 
                    todayTodos.map(t => (
                    <li key={t.id} className={`task-item ${t.done ? 'completed' : ''}`}>
                      <div className="task-left" onClick={() => toggleTodo(t.id)}>
                        <div className={`checkbox ${t.done ? 'checked' : ''}`}></div> <span>{t.text}</span>
                      </div>
                      <button className="del-btn" onClick={() => deleteTodo(t.id)}>×</button>
                    </li>
                  ))}
                </ul>
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

      {/* 🏆 TAB: ACHIEVEMENTS & MEDALS */}
      {activeTab === 'Achievements' && (
        <div className="tab-content fade-in panel">
          <h2>Trophy Cabinet</h2>
          <p className="empty-state" style={{textAlign: 'left'}}>Awards unlock based on your daily and all-time performance.</p>
          
          <div className="trophy-grid">
            <div className={`trophy-card ${todayHours >= 3 ? 'unlocked bronze' : 'locked'}`}>
              <div className="trophy-icon">🥉</div>
              <h3>Bronze Grind</h3>
              <p>Study 3+ hours in a day</p>
              <span className="status">{todayHours >= 3 ? 'UNLOCKED TODAY' : 'LOCKED'}</span>
            </div>
            
            <div className={`trophy-card ${todayHours >= 6 ? 'unlocked silver' : 'locked'}`}>
              <div className="trophy-icon">🥈</div>
              <h3>Silver Hustle</h3>
              <p>Study 6+ hours in a day</p>
              <span className="status">{todayHours >= 6 ? 'UNLOCKED TODAY' : 'LOCKED'}</span>
            </div>
            
            <div className={`trophy-card ${todayHours >= 10 ? 'unlocked gold' : 'locked'}`}>
              <div className="trophy-icon">🥇</div>
              <h3>Gold Mastery</h3>
              <p>Study 10+ hours in a day</p>
              <span className="status">{todayHours >= 10 ? 'UNLOCKED TODAY' : 'LOCKED'}</span>
            </div>

            <div className={`trophy-card ${streakData.count >= 7 ? 'unlocked special' : 'locked'}`}>
              <div className="trophy-icon">🔥</div>
              <h3>Consistent CA</h3>
              <p>Hit target 7 days in a row</p>
              <span className="status">{streakData.count >= 7 ? 'UNLOCKED' : `${streakData.count}/7 Days`}</span>
            </div>

            <div className={`trophy-card ${uniqueSubjectsToday >= 3 ? 'unlocked special' : 'locked'}`}>
              <div className="trophy-icon">🧠</div>
              <h3>Polymath</h3>
              <p>Study 3 different subjects today</p>
              <span className="status">{uniqueSubjectsToday >= 3 ? 'UNLOCKED TODAY' : `${uniqueSubjectsToday}/3 Subjects`}</span>
            </div>
          </div>
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
          {!apiKey && <div className="api-warning">⚠️ Paste your Gemini API Key in Settings to chat with the AI.</div>}
          <div className="chat-window">
            {chatMessages.map((msg, i) => (
              <div key={i} className={`chat-bubble ${msg.sender}`}>{msg.text}</div>
            ))}
          </div>
          <div className="chat-input-row">
            <input type="text" value={chatInput} onChange={(e) => setChatInput(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()} placeholder="Ask a doubt or get a study plan..." className="task-input"/>
            <button className="btn start focus-btn" onClick={handleSendMessage}>Send</button>
          </div>
        </div>
      )}

      {/* 📚 TAB: MATERIALS (Notes & RTP) */}
      {activeTab === 'Materials' && (
        <div className="tab-content fade-in panel">
          <h2>Study Materials Hub</h2>
          
          <h3 className="section-title">Faculty Drive Notes</h3>
          <div className="subject-progress-list">
            {SUBJECTS.map((sub) => (
              <div key={sub} className="subject-card"><div className="subject-info"><h3>{sub}</h3><a href={NOTES_LINKS[sub]} target="_blank" rel="noopener noreferrer" className="notes-link">Access Notes</a></div></div>
            ))}
          </div>

          <h3 className="section-title" style={{marginTop: '2rem'}}>Previous Year RTP / MTP</h3>
          <div className="subject-progress-list">
            {SUBJECTS.map((sub) => (
              <div key={`rtp-${sub}`} className="subject-card rtp-card"><div className="subject-info"><h3>{sub} RTPs</h3><a href={RTP_LINKS[sub]} target="_blank" rel="noopener noreferrer" className="notes-link rtp-link">Access RTP Folder</a></div></div>
            ))}
          </div>
        </div>
      )}

      {/* ⚙️ TAB: SETTINGS */}
      {activeTab === 'Settings' && (
        <div className="tab-content fade-in panel">
          <h2>App Settings</h2>
          <div className="setting-input-group">
            <label>Gemini API Key (For AI Mentor):</label>
            <input type="password" placeholder="AIzaSy..." value={apiKey} onChange={(e) => setApiKey(e.target.value)} />
            <p className="hint">Get a free key from Google AI Studio.</p>
          </div>
          <div className="setting-input-group"><label>Exam Date:</label><input type="date" value={examDate} onChange={(e) => setExamDate(e.target.value)} /></div>
          <div className="setting-input-group"><label>Daily Goal (Hours for Streak):</label><input type="number" value={dailyGoal} onChange={(e) => setDailyGoal(e.target.value)} /></div>
          <button className="btn reset-btn-control" onClick={() => { if(window.confirm('Clear all data?')) { localStorage.clear(); window.location.reload(); }}}>Hard Reset App</button>
        </div>
      )}
    </div>
  );
}