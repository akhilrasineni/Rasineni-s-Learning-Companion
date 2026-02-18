
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
  const [completedDays, setCompletedDays] = useState<number[]>([]);

  useEffect(() => {
    const roadmaps = Object.values(user.roadmaps) as RoadmapProgress[];
    const latest = roadmaps.pop();
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
    try {
      const data = await generateRoadmap(form.topic, form.days, form.level, form.time);
      setActiveRoadmap(data);
      saveRoadmapForUser(user.name, data);
      setCompletedDays([]);
    } catch (err) {
      console.error(err);
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
      <div className="space-y-12 animate-fade-in pb-24">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 bg-white p-10 md:p-14 rounded-[3rem] border border-slate-100 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50/50 rounded-bl-[3rem]"></div>
          <div className="space-y-3 relative z-10">
            <span className="text-xs font-black text-indigo-600 uppercase tracking-[0.2em]">Learning Pathway</span>
            <h2 className="text-4xl md:text-5xl font-black text-slate-800 tracking-tight">{activeRoadmap.topic}</h2>
            <div className="flex items-center gap-6 mt-4">
              <div className="flex flex-col">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Global Progress</span>
                <span className="text-2xl font-black text-slate-900">{progress}%</span>
              </div>
              <div className="flex-1 min-w-[200px] h-3 bg-slate-100 rounded-full overflow-hidden mt-4">
                <div className="bg-gradient-to-r from-indigo-600 to-rose-400 h-full transition-all duration-1000 ease-out shadow-[0_0_12px_rgba(79,70,229,0.4)]" style={{ width: `${progress}%` }}></div>
              </div>
            </div>
          </div>
          <button 
            onClick={() => { if(confirm("Archive this plan and start a new mission?")) setActiveRoadmap(null); }} 
            className="px-8 py-4 bg-slate-50 text-slate-800 rounded-2xl font-black hover:bg-slate-100 transition-all text-sm shadow-inner border border-slate-200 active:scale-95"
          >
            Start New Mission
          </button>
        </div>

        <div className="grid gap-8">
          {activeRoadmap.schedule.map((item, idx) => {
            const isDone = completedDays.includes(item.day);
            return (
              <div key={idx} className={`group bg-white rounded-[2.5rem] p-8 md:p-12 shadow-xl border transition-all duration-500 ${isDone ? 'border-green-100 opacity-70' : 'border-slate-100 hover:shadow-2xl hover:-translate-y-1'}`}>
                <div className="flex items-start justify-between gap-6">
                  <div className="flex items-center space-x-6">
                    <div className={`w-16 h-16 rounded-3xl flex items-center justify-center font-black text-2xl transition-all duration-500 shadow-lg ${isDone ? 'bg-green-500 text-white scale-90' : 'bg-indigo-600 text-white group-hover:rotate-3'}`}>
                      {item.day}
                    </div>
                    <div>
                      <h3 className="text-2xl md:text-3xl font-black text-slate-800 group-hover:text-indigo-600 transition-colors">{item.title}</h3>
                      {isDone && (
                        <div className="flex items-center gap-2 mt-2">
                           <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                           <span className="text-[10px] font-black text-green-600 uppercase tracking-widest">Goal Achieved</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <button 
                    onClick={() => handleToggleDay(item.day)}
                    className={`p-4 rounded-2xl border-2 transition-all shadow-sm ${isDone ? 'bg-green-500 border-green-500 text-white shadow-green-100' : 'bg-white border-slate-200 text-slate-200 hover:border-indigo-600 hover:text-indigo-600'}`}
                  >
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M5 13l4 4L19 7" />
                    </svg>
                  </button>
                </div>
                
                <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div className="space-y-8">
                    <div className="space-y-4">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Key Milestones</p>
                      <ul className="space-y-4">
                        {item.tasks.map((task, i) => (
                          <li key={i} className="flex items-start space-x-4 text-slate-700 text-lg font-medium leading-relaxed">
                            <div className={`w-2 h-2 rounded-full mt-3 flex-shrink-0 shadow-sm ${isDone ? 'bg-green-400' : 'bg-indigo-500 animate-pulse'}`}></div>
                            <span>{task}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {item.links && item.links.length > 0 && (
                      <div className="space-y-4 pt-4">
                        <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">Reference Resources</p>
                        <div className="flex flex-wrap gap-3">
                          {item.links.map((link, i) => (
                            <a 
                              key={i} 
                              href={link.url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="px-4 py-3 bg-indigo-50 text-indigo-700 rounded-xl text-xs font-bold flex items-center gap-2 hover:bg-indigo-100 transition-colors border border-indigo-100"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/></svg>
                              <span className="truncate max-w-[120px]">{link.title}</span>
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="bg-slate-50 p-8 rounded-[2.5rem] border border-slate-100 flex flex-col justify-center relative overflow-hidden group/tip">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-100/30 rounded-full -mr-10 -mt-10 transition-transform group-hover/tip:scale-150 duration-500"></div>
                    <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mb-4 relative z-10">Strategic Insight</p>
                    <p className="text-xl text-slate-800 font-medium italic leading-relaxed relative z-10">"{item.revisionTip}"</p>
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
    <div className="max-w-4xl mx-auto py-12 px-4">
      <div className="text-center space-y-6 mb-20">
        <h2 className="text-5xl md:text-8xl font-black text-slate-900 tracking-tighter leading-none">Architect Your Future</h2>
        <p className="text-slate-500 text-lg md:text-3xl font-medium max-w-2xl mx-auto leading-relaxed">
          Define your learning trajectory, {user.name}. Our AI strategist will map every milestone and provide curated resources.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-[4rem] p-10 md:p-20 shadow-[0_48px_96px_-16px_rgba(0,0,0,0.12)] border border-slate-100 space-y-12">
        <div className="space-y-4">
          <label className="text-xs font-black text-slate-400 uppercase tracking-[0.3em] ml-2">Mission Objective</label>
          <input
            type="text"
            required
            value={form.topic}
            onChange={(e) => setForm({ ...form, topic: e.target.value })}
            placeholder="e.g. Master React Hooks, French Literature..."
            className="w-full px-10 py-8 rounded-[2rem] bg-slate-50 border-4 border-transparent focus:border-indigo-600 focus:bg-white outline-none transition-all text-2xl font-bold placeholder:text-slate-200 shadow-inner"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <div className="space-y-4">
            <label className="text-xs font-black text-slate-400 uppercase tracking-[0.3em] ml-2">Time Horizon</label>
            <select
              value={form.days}
              onChange={(e) => setForm({ ...form, days: parseInt(e.target.value) })}
              className="w-full px-8 py-8 rounded-[2rem] bg-slate-50 border-4 border-transparent focus:border-indigo-600 focus:bg-white outline-none transition-all font-bold text-xl shadow-inner appearance-none cursor-pointer"
            >
              <option value={7}>7 Days Sprint</option>
              <option value={15}>15 Days Deep Dive</option>
              <option value={30}>30 Days Absolute Mastery</option>
            </select>
          </div>
          <div className="space-y-4">
            <label className="text-xs font-black text-slate-400 uppercase tracking-[0.3em] ml-2">Current Proficiency</label>
            <select
              value={form.level}
              onChange={(e) => setForm({ ...form, level: e.target.value })}
              className="w-full px-8 py-8 rounded-[2rem] bg-slate-50 border-4 border-transparent focus:border-indigo-600 focus:bg-white outline-none transition-all font-bold text-xl shadow-inner appearance-none cursor-pointer"
            >
              <option>Beginner (Curious)</option>
              <option>Intermediate (Practitioner)</option>
              <option>Expert (Researcher)</option>
            </select>
          </div>
        </div>

        <div className="space-y-4">
          <label className="text-xs font-black text-slate-400 uppercase tracking-[0.3em] ml-2">Daily Focus Window</label>
          <input
            type="text"
            value={form.time}
            onChange={(e) => setForm({ ...form, time: e.target.value })}
            placeholder="e.g. 1 hour, 45 minutes..."
            className="w-full px-10 py-8 rounded-[2rem] bg-slate-50 border-4 border-transparent focus:border-indigo-600 focus:bg-white outline-none transition-all font-bold text-xl shadow-inner"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-slate-900 text-white py-10 rounded-[2.5rem] font-black text-3xl hover:bg-indigo-600 transition-all shadow-2xl flex items-center justify-center space-x-6 active:scale-95 disabled:opacity-50"
        >
          {loading ? (
            <div className="w-10 h-10 border-6 border-white border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <>
              <span>Initialize Roadmap</span>
              <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default RoadmapGenerator;
