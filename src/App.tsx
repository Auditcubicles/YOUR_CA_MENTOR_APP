import { useState, useEffect, useCallback } from 'react';
import './App.css';

const NOTES_LINKS = {
  'Financial Reporting': 'https://drive.google.com/drive/folders/1ANLP_7cw7AXKkjWw4Lxp4mw7EuqcoosjuO3aR5SdqVo2oHMaVr5MiozHC662fDdpWfjsB0aP',
  'AFM': 'https://drive.google.com/drive/folders/14Ab9fZoPCcpnlDGc2bU-qTjxl6_PpdsPE_G0ndASdsFrRpPv9M4tYjRN3yPgFouCI7kQtDMq',
  'AUDIT': 'https://drive.google.com/drive/folders/1TJth8POIXDgsisqQ0EUSI7VlSY7WsdOvf0lAAzOLgfRsvFTz98HdLui7WWM1B4nDewaCKjhj',
  'Direct Tax': 'https://drive.google.com/drive/folders/14o4V7m7jxiGnrX4Sn9VyV8DChxCEOIRJSpSgEq1M-uzqqlsLoAWlOpN5Wz2p58GveZ4uUX3v',
  'IDT': 'https://drive.google.com/drive/folders/1fiRYgdDj8Zkl9s11Sguw03okzS18SMnJ95DIqOnaEZI0LoTLe8BR4x2HWPHmXMQ2iINWdu9M',
  'IBS': 'https://drive.google.com/drive/folders/1k5YeEN_1NGPXeeXkD8ziP_QOL3pIkzu4KCISPZbm9zEL8CKsk7I_ClWxvdnAEJS92tgp9WjR'
};

const SUBJECTS = Object.keys(NOTES_LINKS);
const SUBJECT_COLORS = ['blue', 'yellow', 'purple', 'orange', 'green', 'cyan'];

const StatsCard = ({ icon, title, value, subtext, type }) => (
  <div className={`stats-card ${type || ''}`}>
    <div className="card-header">
      <span className="card-icon">{icon}</span>
      <h3 className="card-title">{title}</h3>
    </div>
    <p className="card-value">{value}</p>
    <p className={`card-subtext ${type || ''}`}>{subtext}</p>
  </div>
);

const StreakGrid = () => (
  <div className="streak-container">
    <div className="streak-grid">
      {['Sat', 'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri'].map((day, i) => (
        <div key={day} className="streak-day">
          <p>{day}</p>
          <div className={`streak-circle ${i < 3 ? 'complete' : i === 3 ? 'partial' : i < 6 ? 'missed' : 'unknown'}`}>
            {i === 3 ? <span className="ring"></span> : null}
            <span className="icon">{i < 3 ? '✓' : i === 3 ? '✓' : i < 6 ? '✗' : '?'}</span>
          </div>
        </div>
      ))}
    </div>
  </div>
);

export default function App() {
  const [activeTab, setActiveTab] = useState('Timer');
  const [sessions, setSessions] = useState(() => JSON.parse(localStorage.getItem('sessions')) || []);
  const [dailyGoal, setDailyGoal] = useState(() => localStorage.getItem('dailyGoal') || 10);
  const [examDate, setExamDate] = useState(() => localStorage.getItem('examDate') || '2026-05-01');
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState(SUBJECTS[0]);

  useEffect(() => localStorage.setItem('sessions', JSON.stringify(sessions)), [sessions]);
  useEffect(() => localStorage.setItem('dailyGoal', dailyGoal), [dailyGoal]);
  useEffect(() => localStorage.setItem('examDate', examDate), [examDate]);

  const logSession = useCallback(() => {
    const newSession = {
      id: Date.now(),
      subject: selectedSubject,
      duration: 25,
      date: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setSessions(s => [newSession, ...s]);
    setIsActive(false);
    setTimeLeft(25 * 60);
    alert('Session Complete! Take a 5 minute break.');
  }, [selectedSubject]);

  useEffect(() => {
    let interval = null;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => setTimeLeft(t => t - 1), 1000);
    } else if (timeLeft === 0) {
      clearInterval(interval);
      logSession();
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft, logSession]);

  const todayMins = sessions.reduce((sum, s) => sum + s.duration, 0);
  const todayHours = (todayMins / 60).toFixed(1);
  const isBehind = todayHours < dailyGoal;
  const totalHoursLogged = (sessions.reduce((sum, s) => sum + s.duration, 0) / 60).toFixed(0);

  const calculateDaysRemaining = () => {
    const target = new Date(examDate);
    const diffDays = Math.ceil((target - new Date()) / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  const getSubjectHours = (subject) => {
    return (sessions.filter(s => s.subject === subject).reduce((sum, s) => sum + s.duration, 0) / 60).toFixed(1);
  };

  const toggleTimer = () => setIsActive(!isActive);
  const resetTimer = () => { setIsActive(false); setTimeLeft(25 * 60); };
  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="app-container">
      {/* HEADER NAV */}
      <header className="header">
        <div className="header-left">
          <div className="logo">CA</div>
          <div className="user-greeting">
            <h1>Sathi</h1>
            <p>Hey, Auditcubicles</p>
          </div>
        </div>
        <nav className="header-center">
          {['Timer', 'Mentor', 'Notes', 'Settings'].map(tab => (
            <button 
              key={tab} 
              className={`nav-link ${activeTab === tab ? 'active' : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </nav>
      </header>

      {/* DYNAMIC CONTENT AREA */}
      {activeTab === 'Timer' && (
        <div className="tab-content fade-in">
          <div className="stats-dashboard">
            <StatsCard icon="📅" title="EXAM COUNTDOWN" value={calculateDaysRemaining()} subtext="days remaining" type="red" />
            <StatsCard icon="⏱️" title="TODAY'S STUDY" value={`${todayHours} / ${dailyGoal}h`} subtext={isBehind ? "Behind schedule!" : "On track!"} type={isBehind ? "red" : "green"} />
            <div className="stats-card streak-card green">
              <div className="card-header"><span className="card-icon">🔥</span><h3 className="card-title">CURRENT STREAK</h3></div>
              <div className="streak-content"><p className="card-value">3</p><p className="card-subtext green">days of 10+ hours</p><StreakGrid /></div>
            </div>
            <StatsCard icon="📈" title="TOTAL HOURS" value={totalHoursLogged} subtext="hours logged" />
          </div>

          <div className="action-sessions-area">
            <div className="quick-actions panel">
              <h2>Quick Actions</h2>
              <div className="quick-subject-selector">
                {SUBJECTS.map(sub => (
                  <button key={sub} className={`sub-btn ${selectedSubject === sub ? 'active' : ''}`} onClick={() => setSelectedSubject(sub)}>{sub}</button>
                ))}
              </div>
              <div className="timer-display-box">
                <h3>{formatTime(timeLeft)}</h3>
                <p>Focusing on: {selectedSubject}</p>
              </div>
              <div className="timer-controls-row">
                <button className={`btn ${isActive ? 'pause' : 'start'} focus-btn`} onClick={toggleTimer}>
                  ⚡ {isActive ? 'PAUSE' : 'START FOCUS'}
                </button>
                <button className="btn reset-btn-control" onClick={resetTimer}>RESET</button>
              </div>
              <button className="btn outline-btn mentor-btn" onClick={() => setActiveTab('Mentor')}>Talk to Mentor</button>
            </div>

            <div className="today-sessions panel">
              <h2>Today's Sessions</h2>
              {sessions.length === 0 ? <p className="empty-state">No sessions logged today.</p> : null}
              <ul className="log-list">
                {sessions.map((s, i) => (
                  <li key={s.id} className="log-item">
                    <div className="log-left"><span className="log-session-num">Session {sessions.length - i}</span><span className="log-duration">{s.duration} min</span></div>
                    <div className="log-right"><span className="log-subject">{s.subject}</span><span className="log-date">{s.date}</span></div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'Notes' && (
        <div className="tab-content fade-in">
          <div className="subjects-progress panel">
            <h2>Faculty Notes & Subject Progress</h2>
            <div className="subject-progress-list">
              {SUBJECTS.map((sub, i) => (
                <div key={sub} className="subject-card">
                  <div className={`subject-color-strip strip-${SUBJECT_COLORS[i]}`}></div>
                  <div className="subject-info">
                    <h3>{sub}</h3>
                    <p>{getSubjectHours(sub)}h studied totally</p>
                    <a href={NOTES_LINKS[sub]} target="_blank" rel="noopener noreferrer" className="notes-link">Access Drive Link</a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'Mentor' && (
        <div className="tab-content fade-in panel mentor-placeholder">
          <h2>🧠 AI Mentor</h2>
          <p>Your custom CA-SATHI AI integration will live here.</p>
          <p className="empty-state">Load your existing AI system prompts to review your daily plan.</p>
        </div>
      )}

      {activeTab === 'Settings' && (
        <div className="tab-content fade-in panel">
          <h2>Application Settings</h2>
          <div className="setting-input-group">
            <label>Target Exam Date:</label>
            <input type="date" value={examDate} onChange={(e) => setExamDate(e.target.value)} />
          </div>
          <div className="setting-input-group">
            <label>Daily Study Goal (Hours):</label>
            <input type="number" value={dailyGoal} min="1" max="24" onChange={(e) => setDailyGoal(e.target.value)} />
          </div>
          <p className="empty-state" style={{marginTop: '20px'}}>Changes save automatically to local storage.</p>
        </div>
      )}
    </div>
  );
}