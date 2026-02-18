
import React, { useEffect, useState } from 'react';
import { getCoachAdvice } from '../services/gemini';
import { AppTab, UserProgress, RoadmapProgress } from '../types';

interface CoachProps {
  user: UserProgress;
  onNavigate: (tab: AppTab) => void;
  onLogout: () => void;
}

const Coach: React.FC<CoachProps> = ({ user, onNavigate, onLogout }) => {
  const [advice, setAdvice] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAdvice = async () => {
      try {
        const data = await getCoachAdvice();
        setAdvice(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchAdvice();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] space-y-6">
        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Consulting your coach...</p>
      </div>
    );
  }

  const activeRoadmaps: RoadmapProgress[] = Object.values(user.roadmaps);
  const recentQuiz = user.quizHistory[0];

  return (
    <div className="space-y-8 md:space-y-12 animate-fade-in pb-12">
      {/* Header Card - More Visual Flare */}
      <div className="bg-white rounded-[2rem] md:rounded-[3rem] p-8 md:p-14 shadow-2xl shadow-slate-200/40 border border-slate-100 relative overflow-hidden group">
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-indigo-50 rounded-full blur-3xl opacity-50 transition-all group-hover:scale-110"></div>
        <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-rose-50 rounded-full blur-3xl opacity-50 transition-all group-hover:scale-110"></div>
        
        <div className="relative z-10 space-y-6">
          <div className="flex items-center space-x-2">
            <span className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></span>
            <span className="text-xs font-black text-indigo-600 uppercase tracking-widest">Active Learner Session</span>
          </div>
          <h2 className="text-3xl md:text-6xl font-black text-slate-800 tracking-tighter leading-tight">
            Rise and shine, <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-rose-500">{user.name}</span>.
          </h2>
          <p className="text-xl md:text-3xl text-slate-500 font-medium leading-relaxed italic border-l-8 border-indigo-500/20 pl-8">
            "{advice?.motivation}"
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10">
        {/* Progress Tracker Card */}
        <div className="bg-white rounded-[2rem] p-8 md:p-10 shadow-xl border border-slate-100 space-y-8 flex flex-col justify-between hover:shadow-2xl transition-all">
          <div className="space-y-6">
            <h3 className="text-2xl font-black text-slate-800 flex items-center gap-3">
              <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
              </div>
              My Journey
            </h3>
            
            {activeRoadmaps.length === 0 ? (
              <p className="text-slate-400 text-base italic leading-relaxed">No active learning plans yet, {user.name}. Let's build your first roadmap together!</p>
            ) : (
              <div className="space-y-6">
                {activeRoadmaps.map((r, i) => {
                  const percent = Math.round((r.completedDays.length / r.roadmap.schedule.length) * 100);
                  return (
                    <div key={i} className="space-y-3">
                      <div className="flex justify-between text-sm md:text-base">
                        <span className="font-bold text-slate-700">{r.roadmap.topic}</span>
                        <span className="text-indigo-600 font-black">{percent}%</span>
                      </div>
                      <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                        <div className="bg-gradient-to-r from-indigo-600 to-rose-400 h-full transition-all duration-1000 ease-out shadow-[0_0_8px_rgba(79,70,229,0.3)]" style={{ width: `${percent}%` }}></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
          
          <button 
            onClick={() => onNavigate(AppTab.ROADMAP)}
            className="w-full py-5 px-6 bg-slate-900 text-white rounded-2xl text-base font-black hover:bg-indigo-600 transition-all flex items-center justify-center gap-3 shadow-xl"
          >
            {activeRoadmaps.length > 0 ? 'Continue Roadmap' : 'New Learning Plan'}
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
          </button>
        </div>

        {/* Latest Results Card */}
        <div className="bg-white rounded-[2rem] p-8 md:p-10 shadow-xl border border-slate-100 space-y-8 flex flex-col justify-between hover:shadow-2xl transition-all">
          <div className="space-y-6">
            <h3 className="text-2xl font-black text-slate-800 flex items-center gap-3">
              <div className="p-2 bg-rose-50 text-rose-500 rounded-lg">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </div>
              Analytics
            </h3>
            
            {recentQuiz ? (
              <div className="bg-slate-50/80 p-6 rounded-[1.5rem] border border-slate-100 transform hover:scale-[1.02] transition-transform">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Most Recent Milestone</p>
                <p className="text-lg font-bold text-slate-800 mb-2 truncate">{recentQuiz.topic}</p>
                <div className="flex items-end gap-2">
                  <span className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-br from-indigo-600 to-rose-500">{recentQuiz.score}</span>
                  <span className="text-slate-400 font-bold mb-2 text-xl">/ {recentQuiz.total}</span>
                </div>
              </div>
            ) : (
              <p className="text-slate-400 text-base italic leading-relaxed">Your quiz performance analytics will appear here once you take your first test.</p>
            )}

            <div className="space-y-3 p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100">
              <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">Coach's Deep Tip</p>
              <p className="text-sm text-indigo-900 font-medium leading-relaxed italic">"{advice?.revisionTip}"</p>
            </div>
          </div>

          <button 
            onClick={() => onNavigate(AppTab.QUIZ)}
            className="w-full py-5 px-6 bg-white border-4 border-slate-100 text-slate-800 rounded-2xl text-base font-black hover:bg-slate-50 transition-all flex items-center justify-center gap-3"
          >
            Launch Quiz Engine
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Coach;
