import React, { useState, useEffect } from 'react';
import { AppTab, UserProgress } from './types';
import Sidebar from './components/Sidebar';
import Coach from './components/Coach';
import RoadmapGenerator from './components/RoadmapGenerator';
import Chat from './components/Chat';
import QuizMaster from './components/QuizMaster';
import Summarizer from './components/Summarizer';
import ProfileSelector from './components/ProfileSelector';
import LiveCompanion from './components/LiveCompanion';
import VisualStudio from './components/VisualStudio';
import { loadUserProgress } from './services/storage';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AppTab>(AppTab.COACH);
  const [currentUser, setCurrentUser] = useState<UserProgress | null>(null);
  const [globalSearch, setGlobalSearch] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem('theme') === 'dark' || 
      (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });

  useEffect(() => {
    const savedName = localStorage.getItem('active_user');
    if (savedName) {
      setCurrentUser(loadUserProgress(savedName));
    }
  }, []);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  const handleSelectUser = (name: string) => {
    const progress = loadUserProgress(name);
    setCurrentUser(progress);
    localStorage.setItem('active_user', name);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('active_user');
  };

  const handleGlobalSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (globalSearch.trim()) {
      setActiveTab(AppTab.RESEARCH);
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case AppTab.COACH:
        return <Coach user={currentUser!} onNavigate={setActiveTab} onLogout={handleLogout} />;
      case AppTab.ROADMAP:
        return <RoadmapGenerator user={currentUser!} />;
      case AppTab.RESEARCH:
        return <Chat initialQuery={globalSearch} onQueryConsumed={() => setGlobalSearch('')} />;
      case AppTab.VOICE:
        return <LiveCompanion />;
      case AppTab.QUIZ:
        return <QuizMaster user={currentUser!} />;
      case AppTab.STUDIO:
        return <VisualStudio />;
      case AppTab.SUMMARIZE:
        return <Summarizer />;
      default:
        return <Coach user={currentUser!} onNavigate={setActiveTab} onLogout={handleLogout} />;
    }
  };

  const getActiveTabTitle = () => {
    const items: Record<string, string> = {
      [AppTab.COACH]: 'Dashboard',
      [AppTab.ROADMAP]: 'Learning Pathway',
      [AppTab.RESEARCH]: 'AI Researcher',
      [AppTab.VOICE]: 'Voice Tutor',
      [AppTab.QUIZ]: 'Knowledge Check',
      [AppTab.STUDIO]: 'Visual Studio',
      [AppTab.SUMMARIZE]: 'Study Summarizer'
    };
    return items[activeTab] || 'Companion';
  };

  if (!currentUser) {
    return <ProfileSelector onSelectUser={handleSelectUser} />;
  }

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 overflow-hidden font-sans transition-colors duration-500">
      {/* Sidebar (Desktop) */}
      <div className="hidden md:flex flex-shrink-0">
        <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
      </div>

      <main className="flex-1 flex flex-col min-w-0 h-full relative overflow-hidden">
        {/* Header */}
        <header className="h-16 md:h-20 glass flex-shrink-0 z-40 flex items-center justify-between px-4 md:px-10 border-b border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="flex items-center space-x-3 min-w-0 flex-1">
            <div className="md:hidden flex-shrink-0 w-8 h-8 bg-gradient-to-br from-indigo-600 to-rose-500 rounded-lg flex items-center justify-center text-white font-black text-xs shadow-lg">R</div>
            <h2 className="text-sm md:text-xl font-black tracking-tight truncate dark:text-slate-100">
              {getActiveTabTitle()}
            </h2>
            
            {/* Global Search Bar (Desktop) */}
            <form onSubmit={handleGlobalSearch} className="hidden lg:flex flex-1 max-w-md ml-12">
              <div className="relative w-full group">
                <input 
                  type="text" 
                  value={globalSearch}
                  onChange={(e) => setGlobalSearch(e.target.value)}
                  placeholder="Ask anything..."
                  className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl py-2.5 pl-12 pr-4 text-sm font-semibold focus:ring-2 focus:ring-indigo-500/50 transition-all outline-none dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-600 shadow-sm"
                />
                <svg className="w-5 h-5 absolute left-4 top-2.5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              </div>
            </form>
          </div>
          
          <div className="flex items-center space-x-3 md:space-x-6 flex-shrink-0 ml-4">
            {/* Theme Toggle */}
            <button 
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="p-2.5 text-slate-400 hover:text-indigo-600 dark:hover:text-amber-400 transition-all bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm active:scale-90"
              aria-label="Toggle Theme"
            >
              {isDarkMode ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.364 17.636l-.707.707M6.364 6.364l.707.707m12.728 12.728l.707.707M12 8a4 4 0 100 8 4 4 0 000-8z" /></svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
              )}
            </button>

            <div className="flex flex-col items-end min-w-0">
              <span className="text-xs font-black text-slate-900 dark:text-slate-100 tracking-tight truncate max-w-[100px]">{currentUser.name}</span>
              <span className="text-[9px] font-black text-indigo-500 dark:text-indigo-400 uppercase tracking-widest leading-none">Student</span>
            </div>
            
            <button 
              onClick={handleLogout}
              className="p-2.5 text-slate-400 hover:text-rose-500 transition-all bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm active:scale-90"
              title="Logout"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
            </button>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto custom-scrollbar relative bg-slate-50 dark:bg-slate-950 transition-colors duration-500">
          <div className="p-4 md:p-8 lg:p-12 max-w-[1400px] mx-auto w-full pb-32 md:pb-12">
            {renderContent()}
          </div>
        </div>

        {/* Mobile Navigation */}
        <nav className="md:hidden fixed bottom-6 left-6 right-6 h-18 bg-white/90 dark:bg-slate-900/90 backdrop-blur-3xl border border-slate-200 dark:border-slate-800 shadow-[0_20px_50px_rgba(0,0,0,0.1)] rounded-3xl flex justify-around items-center px-2 z-50">
          {[
            { id: AppTab.COACH, icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6', label: 'Home' },
            { id: AppTab.RESEARCH, icon: 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z', label: 'Ask' },
            { id: AppTab.VOICE, icon: 'M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-20a3 3 0 013 3v10a3 3 0 01-3 33 3 0 01-3-3V5a3 3 0 013-3z', label: 'Voice' },
            { id: AppTab.QUIZ, icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z', label: 'Quiz' },
            { id: AppTab.ROADMAP, icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2', label: 'Plan' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center justify-center flex-1 h-full transition-all relative ${
                activeTab === item.id ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 dark:text-slate-600'
              }`}
            >
              <svg className={`w-6 h-6 mb-1 transition-transform ${activeTab === item.id ? 'scale-110' : 'scale-100'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={activeTab === item.id ? 2.5 : 2} d={item.icon} />
              </svg>
              <span className="text-[8px] font-black uppercase tracking-tighter leading-none">{item.label}</span>
              {activeTab === item.id && (
                <div className="absolute bottom-1 w-1 h-1 bg-indigo-600 dark:bg-indigo-400 rounded-full shadow-[0_0_8px_rgba(79,70,229,0.5)]"></div>
              )}
            </button>
          ))}
        </nav>
      </main>
    </div>
  );
};

export default App;