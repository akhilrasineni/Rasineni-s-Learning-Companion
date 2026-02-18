
import React, { useState } from 'react';
import { getProfileNames, deleteUser } from '../services/storage';

interface ProfileSelectorProps {
  onSelectUser: (name: string) => void;
}

const ProfileSelector: React.FC<ProfileSelectorProps> = ({ onSelectUser }) => {
  const [nameInput, setNameInput] = useState('');
  const [profiles, setProfiles] = useState(getProfileNames());

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (nameInput.trim()) {
      onSelectUser(nameInput.trim());
    }
  };

  const handleDelete = (e: React.MouseEvent, name: string) => {
    e.stopPropagation();
    if (confirm(`Delete ${name}'s data permanently?`)) {
      deleteUser(name);
      setProfiles(getProfileNames());
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 md:p-6 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-indigo-50 via-white to-rose-50">
      <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center">
        
        <div className="space-y-6 md:space-y-8 text-center md:text-left animate-fade-in">
          <div className="inline-block p-3 md:p-4 bg-white rounded-3xl shadow-2xl shadow-indigo-100 mb-2 md:mb-4 border border-indigo-50 transform -rotate-2">
            <div className="w-12 h-12 md:w-16 md:h-16 bg-gradient-to-br from-indigo-600 to-rose-500 rounded-2xl flex items-center justify-center text-white text-2xl md:text-3xl font-black">R</div>
          </div>
          <h1 className="text-3xl md:text-6xl font-black text-slate-900 tracking-tighter leading-none">
            Rasineni's <br/>
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-rose-500">Learning Companion</span>
          </h1>
          <p className="text-base md:text-lg text-slate-500 font-medium max-w-md mx-auto md:mx-0">
            Your personal AI ecosystem for mastering any subject. Choose your profile to continue your journey.
          </p>
        </div>

        <div className="bg-white rounded-[2.5rem] md:rounded-[3rem] p-6 md:p-12 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] border border-slate-100 space-y-8 md:space-y-10">
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-slate-800">Who's Learning Today?</h2>
            {profiles.length > 0 ? (
              <div className="grid grid-cols-2 gap-3 md:gap-4">
                {profiles.map((name) => (
                  <button
                    key={name}
                    onClick={() => onSelectUser(name)}
                    className="group relative p-4 md:p-6 bg-white rounded-2xl border-2 border-slate-100 hover:border-indigo-600 transition-all text-left shadow-sm hover:shadow-md hover:-translate-y-1"
                  >
                    <span className="block font-black text-slate-800 text-base md:text-lg truncate">{name}</span>
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1 block">Student</span>
                    <div 
                      onClick={(e) => handleDelete(e, name)}
                      className="absolute top-2 right-2 p-1.5 opacity-0 group-hover:opacity-100 text-slate-300 hover:text-rose-500 transition-all rounded-lg hover:bg-rose-50"
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd"/></svg>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-slate-400 italic text-sm">No profiles found. Create your first one below!</p>
            )}
          </div>

          <form onSubmit={handleCreate} className="space-y-4 pt-6 border-t border-slate-100">
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">New Profile Name</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                placeholder="Enter your name..."
                className="flex-1 px-5 md:px-6 py-3 md:py-4 rounded-2xl bg-white border-2 border-slate-200 focus:border-indigo-600 focus:ring-4 focus:ring-indigo-50 outline-none transition-all font-bold text-slate-700 placeholder:text-slate-300"
              />
              <button
                type="submit"
                disabled={!nameInput.trim()}
                className="bg-indigo-600 text-white px-6 md:px-8 rounded-2xl font-black hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 disabled:opacity-50 disabled:bg-slate-300 active:scale-95"
              >
                Go
              </button>
            </div>
          </form>
        </div>

      </div>
    </div>
  );
};

export default ProfileSelector;
