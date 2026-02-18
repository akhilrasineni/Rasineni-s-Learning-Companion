import React, { useState } from 'react';
import { getProfileNames } from '../services/storage';

interface ProfileSelectorProps {
  onSelectUser: (name: string) => void;
}

const ProfileSelector: React.FC<ProfileSelectorProps> = ({ onSelectUser }) => {
  const [nameInput, setNameInput] = useState('');
  const [profiles] = useState(getProfileNames());

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (nameInput.trim()) {
      onSelectUser(nameInput.trim());
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-4 md:p-8 transition-colors duration-500 overflow-hidden font-sans">
      {/* Background Ambient Orbs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-500/10 dark:bg-indigo-500/[0.03] rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-rose-500/10 dark:bg-rose-500/[0.03] rounded-full blur-[120px] animate-pulse [animation-delay:2s]"></div>
      </div>

      <div className="relative z-10 w-full max-w-4xl flex flex-col items-center space-y-8 md:space-y-12">
        {/* Branding Header */}
        <div className="text-center space-y-4 animate-fade-in">
          <div className="inline-flex items-center justify-center p-3 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-800 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-indigo-600 to-rose-500 rounded-xl flex items-center justify-center text-white text-2xl font-black">R</div>
          </div>
          <h1 className="text-4xl md:text-6xl font-black tracking-tight text-slate-900 dark:text-slate-100 leading-none">
            Learning <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-rose-500">Companion</span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium text-sm md:text-lg max-w-md mx-auto">
            Your personalized AI ecosystem for deep research, voice tutoring, and roadmap mastery.
          </p>
        </div>

        {/* Main Interface Card */}
        <div className="w-full bg-white dark:bg-slate-900/50 backdrop-blur-xl rounded-[2.5rem] md:rounded-[3.5rem] p-6 md:p-12 shadow-2xl dark:shadow-none border border-slate-100 dark:border-slate-800 animate-fade-in">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            
            {/* Left: Profile Selection */}
            <div className="space-y-6">
              <div className="flex items-center justify-between px-1">
                <h3 className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">Select Profile</h3>
                <span className="text-[10px] font-bold text-indigo-500 bg-indigo-50 dark:bg-indigo-900/30 px-2 py-0.5 rounded-full">{profiles.length} Active</span>
              </div>
              
              <div className="space-y-3 max-h-[280px] overflow-y-auto custom-scrollbar pr-2">
                {profiles.length > 0 ? (
                  profiles.map((name) => (
                    <button
                      key={name}
                      onClick={() => onSelectUser(name)}
                      className="w-full group p-4 md:p-5 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-transparent hover:border-indigo-500/50 dark:hover:border-indigo-500/30 hover:bg-white dark:hover:bg-slate-800 transition-all text-left flex items-center justify-between shadow-sm"
                    >
                      <div className="flex items-center space-x-4 min-w-0">
                        <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-black text-sm">
                          {name[0].toUpperCase()}
                        </div>
                        <span className="font-black text-slate-900 dark:text-slate-100 text-lg truncate">{name}</span>
                      </div>
                      <svg className="w-5 h-5 text-slate-300 dark:text-slate-600 group-hover:text-indigo-500 transform group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  ))
                ) : (
                  <div className="py-12 flex flex-col items-center justify-center border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-2xl text-slate-400 dark:text-slate-600">
                    <svg className="w-10 h-10 mb-2 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                    <p className="text-xs font-bold italic">No local profiles yet</p>
                  </div>
                )}
              </div>
            </div>

            {/* Right: New Profile / Features */}
            <div className="flex flex-col justify-between space-y-8">
              <div className="space-y-6">
                <h3 className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] px-1">New Identity</h3>
                <form onSubmit={handleCreate} className="space-y-4">
                  <div className="relative group">
                    <input
                      type="text"
                      value={nameInput}
                      onChange={(e) => setNameInput(e.target.value)}
                      placeholder="Your Name"
                      className="w-full px-6 py-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border-2 border-transparent focus:border-indigo-600 dark:focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-800 outline-none transition-all font-bold text-slate-900 dark:text-slate-100 placeholder:text-slate-300 dark:placeholder:text-slate-600 shadow-inner"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={!nameInput.trim()}
                    className="w-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 py-4 rounded-2xl font-black text-lg hover:bg-indigo-600 dark:hover:bg-indigo-400 hover:text-white transition-all shadow-xl active:scale-95 disabled:opacity-30 disabled:pointer-events-none"
                  >
                    Launch Companion
                  </button>
                </form>
              </div>

              {/* Quick Feature Pills */}
              <div className="space-y-4">
                <p className="text-[10px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-widest leading-none">Powered Intelligence</p>
                <div className="flex flex-wrap gap-2">
                  {[
                    { label: 'Voice Tutor', icon: 'M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-20a3 3 0 013 3v10a3 3 0 01-3 33 3 0 01-3-3V5a3 3 0 013-3z' },
                    { label: 'Deep Research', icon: 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z' },
                    { label: 'Visual Studio', icon: 'M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14' }
                  ].map((f) => (
                    <div key={f.label} className="flex items-center space-x-2 px-3 py-1.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-800">
                      <svg className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d={f.icon}/></svg>
                      <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400">{f.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Minimal Tech Footer */}
        <div className="flex flex-col items-center space-y-4 pt-4 opacity-50 hover:opacity-100 transition-opacity">
          <div className="flex items-center space-x-6">
            {['React 19', 'Gemini 3', 'Veo', 'Tailwind'].map((tech) => (
              <span key={tech} className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-600">{tech}</span>
            ))}
          </div>
          <p className="text-[10px] font-bold text-slate-400 dark:text-slate-600">Built by Rasineni • 2025 Ecosystem</p>
        </div>
      </div>
    </div>
  );
};

export default ProfileSelector;