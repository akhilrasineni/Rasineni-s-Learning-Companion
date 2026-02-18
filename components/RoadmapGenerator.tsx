import React, { useState, useEffect } from 'react';
import { generateRoadmap } from '../services/gemini';
import { saveRoadmapForUser, toggleDayCompletionForUser } from '../services/storage';
import { Roadmap, UserProgress, RoadmapProgress } from '../types';

interface RoadmapGeneratorProps {
  user: UserProgress;
}

const RoadmapGenerator: React.FC<RoadmapGeneratorProps> = ({ user }) => {
  const [form, setForm] = useState({ topic: '', days: 7, level: 'Beginner', time: '1 hour' });
  const [activeRoadmap, setActiveRoadmap] = useState<Roadmap | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [completedDays, setCompletedDays] = useState<number[]>([]);

  useEffect(() => {
    const roadmaps = Object.values(user.roadmaps) as RoadmapProgress[];
    const latest = roadmaps[roadmaps.length - 1];
    if (latest) {
      setActiveRoadmap(latest.roadmap);
      setCompletedDays(latest.completedDays);
    } else {
      setActiveRoadmap(null);
      setCompletedDays([]);
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.topic) return;
    setLoading(true);
    setError(null);
    try {
      const data = await generateRoadmap(form.topic, form.days, form.level, form.time);
      setActiveRoadmap(data);
      saveRoadmapForUser(user.name, data);
      setCompletedDays([]);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Something went wrong while designing your roadmap.");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleDay = (day: number) => {
    if (!activeRoadmap) return;
    toggleDayCompletionForUser(user.name, activeRoadmap.topic, day);
    setCompletedDays(prev => 
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    );
  };

  if (activeRoadmap) {
    const totalDays = activeRoadmap.schedule.length;
    const progress = Math.round((completedDays.length / totalDays) * 100);

    return (
      <div className="space-y-6 md:space-y-12 animate-fade-in">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 bg-white p-6 md:p-14 rounded-3xl md:rounded-[3rem] border border-slate-100 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-50/50 rounded-bl-[2rem]"></div>
          <div className="space-y-3 relative z-10">
            <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Learning Pathway</span>
            <h2 className="text-2xl md:text-5xl font-black text-slate-800 tracking-tight">{activeRoadmap.topic}</h2>
            <div className="flex items-center gap-4 mt-2">
              <div className="flex flex-col">
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Progress</span>
                <span className="text-xl font-black text-slate-900">{progress}%</span>
              </div>
              <div className="flex-1 min-w-[120px] md:min-w-[200px] h-2 md:h-3 bg-slate-100 rounded-full overflow-hidden mt-3">
                <div className="bg-gradient-to-r from-indigo-600 to-rose-400 h-full transition-all duration-1000 ease-out" style={{ width: `${progress}%` }}></div>
              </div>
            </div>
          </div>
          <button 
            onClick={() => { if(confirm("Start a new learning journey?")) setActiveRoadmap(null); }} 
            className="px-6 py-3 bg-slate-50 text-slate-800 rounded-xl font-black hover:bg-slate-100 transition-all text-[10px] uppercase tracking-widest shadow-sm border border-slate-200"
          >
            New Mission
          </button>
        </div>

        <div className="grid gap-6 md:gap-8">
          {activeRoadmap.schedule.map((item, idx) => {
            const isDone = completedDays.includes(item.day);
            return (
              <div key={idx} className={`group bg-white rounded-3xl p-6 md:p-12 shadow-md border transition-all duration-300 ${isDone ? 'border-green-100 bg-slate-50/30' : 'border-slate-100'}`}>
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center space-x-4 md:space-x-6">
                    <div className={`w-12 h-12 md:w-16 md:h-16 rounded-2xl flex items-center justify-center font-black text-xl md:text-2xl transition-all shadow-md flex-shrink-0 ${isDone ? 'bg-green-500 text-white' : 'bg-indigo-600 text-white'}`}>
                      {item.day}
                    </div>
                    <div>
                      <h3 className="text-lg md:text-3xl font-black text-slate-800 leading-tight truncate max-w-[180px] md:max-w-none">{item.title}</h3>
                      {isDone && (
                        <span className="text-[9px] font-black text-green-600 uppercase tracking-widest">Completed</span>
                      )}
                    </div>
                  </div>
                  <button 
                    onClick={() => handleToggleDay(item.day)}
                    className={`p-3 rounded-xl border-2 transition-all flex-shrink-0 ${isDone ? 'bg-green-500 border-green-500 text-white' : 'bg-white border-slate-100 text-slate-200 hover:border-indigo-600 hover:text-indigo-600'}`}
                  >
                    <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M5 13l4 4L19 7" />
                    </svg>
                  </button>
                </div>
                
                <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div className="space-y-3">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Key Milestones</p>
                      <ul className="space-y-3">
                        {item.tasks.map((task, i) => (
                          <li key={i} className="flex items-start space-x-3 text-slate-700 text-sm md:text-lg font-medium">
                            <div className={`w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0 ${isDone ? 'bg-green-400' : 'bg-indigo-500'}`}></div>
                            <span>{task}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {item.links && item.links.length > 0 && (
                      <div className="space-y-3">
                        <p className="text-[9px] font-black text-indigo-500 uppercase tracking-widest">Resources</p>
                        <div className="flex flex-wrap gap-2">
                          {item.links.map((link, i) => (
                            <a 
                              key={i} 
                              href={link.url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="px-3 py-2 bg-indigo-50 text-indigo-700 rounded-lg text-[10px] font-bold flex items-center gap-1.5 hover:bg-indigo-100 border border-indigo-100"
                            >
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/></svg>
                              <span className="truncate max-w-[100px]">{link.title}</span>
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                    <p className="text-[9px] font-black text-indigo-500 uppercase tracking-widest mb-2">Strategy Tip</p>
                    <p className="text-base text-slate-800 font-medium italic leading-relaxed">"{item.revisionTip}"</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-2">
      <div className="text-center space-y-4 mb-10 md:mb-20">
        <h2 className="text-3xl md:text-8xl font-black text-slate-900 tracking-tighter leading-tight">Architect Your Future</h2>
        <p className="text-sm md:text-3xl font-medium text-slate-500 max-w-xl mx-auto leading-relaxed">
          Define your learning trajectory. Our AI strategist maps every milestone.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-3xl md:rounded-[4rem] p-6 md:p-20 shadow-2xl border border-slate-100 space-y-8 md:space-y-12">
        {error && (
          <div className="bg-rose-50 border border-rose-100 p-4 rounded-xl flex items-center space-x-3 text-rose-800 text-xs font-medium">
             <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/></svg>
             <span>{error}</span>
          </div>
        )}

        <div className="space-y-2">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Mission Objective</label>
          <input
            type="text"
            required
            value={form.topic}
            onChange={(e) => setForm({ ...form, topic: e.target.value })}
            placeholder="e.g. Master React Hooks..."
            className="w-full px-6 py-4 md:py-8 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-indigo-600 focus:bg-white outline-none transition-all text-lg md:text-2xl font-bold shadow-inner"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Time Horizon</label>
            <select
              value={form.days}
              onChange={(e) => setForm({ ...form, days: parseInt(e.target.value) })}
              className="w-full px-6 py-4 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-indigo-600 focus:bg-white outline-none transition-all font-bold text-base md:text-xl shadow-inner cursor-pointer"
            >
              <option value={7}>7 Day Sprint</option>
              <option value={15}>15 Day Deep Dive</option>
              <option value={30}>30 Day Mastery</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Proficiency</label>
            <select
              value={form.level}
              onChange={(e) => setForm({ ...form, level: e.target.value })}
              className="w-full px-6 py-4 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-indigo-600 focus:bg-white outline-none transition-all font-bold text-base md:text-xl shadow-inner cursor-pointer"
            >
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Expert">Expert</option>
            </select>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-slate-900 text-white py-5 md:py-10 rounded-2xl md:rounded-[2.5rem] font-black text-xl md:text-3xl hover:bg-indigo-600 transition-all shadow-xl flex items-center justify-center space-x-3 active:scale-95 disabled:opacity-50 mt-4"
        >
          {loading ? (
            <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <>
              <span>Initialize Roadmap</span>
              <svg className="w-6 h-6 md:w-8 md:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default RoadmapGenerator;