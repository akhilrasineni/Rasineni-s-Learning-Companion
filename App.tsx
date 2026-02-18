
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

  useEffect(() => {
    const savedName = localStorage.getItem('active_user');
    if (savedName) {
      setCurrentUser(loadUserProgress(savedName));
    }
  }, []);

  const handleSelectUser = (name: string) => {
    const progress = loadUserProgress(name);
    setCurrentUser(progress);
    localStorage.setItem('active_user', name);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('active_user');
  };

  if (!currentUser) {
    return <ProfileSelector onSelectUser={handleSelectUser} />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case AppTab.COACH:
        return <Coach user={currentUser} onNavigate={setActiveTab} onLogout={handleLogout} />;
      case AppTab.ROADMAP:
        return <RoadmapGenerator user={currentUser} />;
      case AppTab.RESEARCH:
        return <Chat />;
      case AppTab.VOICE:
        return <LiveCompanion />;
      case AppTab.QUIZ:
        return <QuizMaster user={currentUser} />;
      case AppTab.STUDIO:
        return <VisualStudio />;
      case AppTab.SUMMARIZE:
        return <Summarizer />;
      default:
        return <Coach user={currentUser} onNavigate={setActiveTab} onLogout={handleLogout} />;
    }
  };

  const getActiveTabTitle = () => {
    const items: Record<string, string> = {
      [AppTab.COACH]: 'Dashboard',
      [AppTab.ROADMAP]: 'Learning Pathway',
      [AppTab.RESEARCH]: 'Research Lab',
      [AppTab.VOICE]: 'Voice Tutor',
      [AppTab.QUIZ]: 'Assessment',
      [AppTab.STUDIO]: 'Visual Concepts',
      [AppTab.SUMMARIZE]: 'Note Summary'
    };
    return items[activeTab] || 'Companion';
  };

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900 overflow-hidden font-sans">
      {/* Desktop Sidebar */}
      <div className="hidden md:flex">
        <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
      </div>

      <main className="flex-1 flex flex-col min-w-0 h-full relative overflow-y-auto custom-scrollbar pb-24 md:pb-0">
        <header className="h-16 md:h-20 glass sticky top-0 z-40 flex items-center justify-between px-4 md:px-10 border-b border-slate-200/50 shadow-sm">
          {/* Mobile Only: Small Brand */}
          <div className="md:hidden flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-indigo-600 to-rose-500 rounded-lg flex items-center justify-center text-white font-black text-sm">R</div>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Companion</span>
          </div>

          {/* Page Title */}
          <div className="hidden md:block">
            <h2 className="text-lg font-black text-slate-800 tracking-tight">{getActiveTabTitle()}</h2>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex flex-col items-end">
              <span className="text-[10px] md:text-xs font-black text-slate-800 tracking-tight">{currentUser.name}</span>
              <span className="text-[8px] md:text-[9px] font-black text-indigo-500 uppercase tracking-tighter">Gold Account</span>
            </div>
            <button 
              onClick={handleLogout}
              className="p-2 text-slate-400 hover:text-rose-500 transition-colors bg-slate-50 rounded-lg border border-slate-100"
              title="Logout"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
            </button>
          </div>
        </header>

        <div className="flex-1 p-4 md:p-8 lg:p-12 max-w-[1400px] mx-auto w-full relative">
          {renderContent()}
        </div>

        {/* Mobile Navigation */}
        <nav className="md:hidden fixed bottom-6 left-6 right-6 h-18 bg-white/95 backdrop-blur-2xl border border-slate-200 shadow-[0_20px_50px_rgba(0,0,0,0.1)] rounded-[2rem] flex justify-around items-center px-4 z-50 overflow-hidden">
          {[
            { id: AppTab.COACH, icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6', label: 'Home' },
            { id: AppTab.RESEARCH, icon: 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z', label: 'Search' },
            { id: AppTab.VOICE, icon: 'M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-20a3 3 0 013 3v10a3 3 0 01-3 33 3 0 01-3-3V5a3 3 0 013-3z', label: 'Talk' },
            { id: AppTab.QUIZ, icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z', label: 'Quiz' },
            { id: AppTab.ROADMAP, icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2', label: 'Plan' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center justify-center flex-1 h-full transition-all ${
                activeTab === item.id ? 'text-indigo-600' : 'text-slate-400'
              }`}
            >
              <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d={item.icon} />
              </svg>
              <span className="text-[8px] font-black uppercase tracking-tight">{item.label}</span>
              {activeTab === item.id && (
                <div className="absolute bottom-1 w-1 h-1 bg-indigo-600 rounded-full"></div>
              )}
            </button>
          ))}
        </nav>
      </main>
    </div>
  );
};

export default App;
