import React from 'react';
import { AppTab } from '../types';

interface SidebarProps {
  activeTab: AppTab;
  onTabChange: (tab: AppTab) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, onTabChange }) => {
  const menuItems = [
    { id: AppTab.COACH, label: 'Dashboard', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
    { id: AppTab.RESEARCH, label: 'AI Researcher', icon: 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z' },
    { id: AppTab.VOICE, label: 'Voice Tutor', icon: 'M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-20a3 3 0 013 3v10a3 3 0 01-3 33 3 0 01-3-3V5a3 3 0 013-3z' },
    { id: AppTab.STUDIO, label: 'Visual Studio', icon: 'M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z' },
    { id: AppTab.ROADMAP, label: 'Learning Plans', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2' },
    { id: AppTab.QUIZ, label: 'Knowledge Checks', icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' },
    { id: AppTab.SUMMARIZE, label: 'Study Notes', icon: 'M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z' },
  ];

  return (
    <aside className="w-20 lg:w-80 flex flex-col border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 h-screen transition-all duration-300">
      {/* Sidebar Branding */}
      <div className="p-8 hidden lg:block">
        <div className="flex items-center space-x-3 mb-10">
          <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-rose-500 rounded-xl flex items-center justify-center text-white font-black shadow-lg">R</div>
          <div className="flex flex-col">
            <h1 className="text-sm font-black text-slate-900 dark:text-slate-100 leading-none">Rasineni's</h1>
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-1">Companion</span>
          </div>
        </div>
        <h2 className="text-[10px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-[0.2em] mb-6 px-1">Navigation</h2>
      </div>

      <div className="p-4 lg:hidden flex justify-center py-8">
        <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-rose-500 rounded-xl flex items-center justify-center text-white font-black shadow-lg">R</div>
      </div>

      <nav className="flex-1 space-y-2 px-3 lg:px-6">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onTabChange(item.id)}
            className={`w-full flex flex-col lg:flex-row items-center space-y-1 lg:space-y-0 lg:space-x-4 px-2 lg:px-5 py-3 lg:py-4 rounded-2xl transition-all duration-200 group ${
              activeTab === item.id
                ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-500/10 dark:shadow-none'
                : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900 hover:text-indigo-600 dark:hover:text-indigo-400'
            }`}
          >
            <svg
              className={`w-5 h-5 lg:w-6 lg:h-6 transition-colors ${activeTab === item.id ? 'text-white' : 'text-slate-400 dark:text-slate-600 group-hover:text-indigo-500'}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d={item.icon} />
            </svg>
            <span className={`text-[7px] lg:text-sm font-black tracking-tight text-center lg:text-left leading-none lg:leading-normal`}>
              {item.label}
            </span>
          </button>
        ))}
      </nav>

      <div className="p-6 border-t border-slate-100 dark:border-slate-900 hidden lg:block">
        <div className="bg-slate-50 dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-200 dark:border-slate-800">
          <p className="text-[10px] font-black text-slate-400 dark:text-slate-600 uppercase mb-3 tracking-widest leading-none">System Status</p>
          <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
             <div className="w-2/3 h-full bg-indigo-500 rounded-full"></div>
          </div>
          <p className="text-[8px] font-bold text-indigo-500 dark:text-indigo-400 mt-2 uppercase text-center">Neural Sync: Active</p>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;