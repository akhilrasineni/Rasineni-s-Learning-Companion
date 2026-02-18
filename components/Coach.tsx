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
      <div className="flex flex-col items-center justify-center h-[50vh] space-y-4">
        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Consulting Coach...</p>
      </div>
    );
  }

  const activeRoadmaps: RoadmapProgress[] = Object.values(user.roadmaps);
  const recentQuiz = user.quizHistory[0];

  return (
    <div className="space-y-6 md:space-y-12 animate-fade-in max-w-full overflow-x-hidden">
      {/* Header Card */}
      <div className="bg-white rounded-3xl md:rounded-[3rem] p-5 md:p-14 shadow-xl border border-slate-100 relative overflow-hidden">
        <div className="absolute -top-20 -right-20 w-48 h-48 bg-indigo-50 rounded-full blur-3xl opacity-50"></div>
        <div className="relative z-10 space-y-3 md:space-y-6">
          <div className="flex items-center space-x-2">
            <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
            <span className="text-[8px] md:text-[10px] font-black text-indigo-600 uppercase tracking-widest">Active System</span>
          </div>
          <h2 className="text-xl md:text-5xl lg:text-6xl font-black text-slate-800 tracking-tighter leading-tight break-words">
            Hi, <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-rose-500">{user.name}</span>.
          </h2>
          <p className="text-sm md:text-2xl lg:text-3xl text-slate-500 font-medium leading-relaxed italic border-l-4 border-indigo-500/20 pl-4 md:pl-8">
            "{advice?.motivation}"
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-10">
        {/* Progress Tracker Card */}
        <div className="bg-white rounded-3xl p-6 md:p-10 shadow-lg border border-slate-100 space-y-6 flex flex-col">
          <div className="flex-1 space-y-6">
            <h3 className="text-lg md:text-2xl font-black text-slate-800 flex items-center gap-3">
              <div className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg flex-shrink-0">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
              </div>
              My Journey
            </h3>
            
            {activeRoadmaps.length === 0 ? (
              <p className="text-slate-400 text-xs md:text-base italic leading-relaxed">No active plans yet. Let's build your first roadmap!</p>
            ) : (
              <div className="space-y-4">
                {activeRoadmaps.map((r, i) => {
                  const percent = Math.round((r.completedDays.length / r.roadmap.schedule.length) * 100);
                  return (
                    <div key={i} className="space-y-2">
                      <div className="flex justify-between text-[10px] md:text-sm items-center">
                        <span className="font-bold text-slate-700 truncate pr-2">{r.roadmap.topic}</span>
                        <span className="text-indigo-600 font-black flex-shrink-0">{percent}%</span>
                      </div>
                      <div className="w-full bg-slate-100 h-1.5 md:h-2 rounded-full overflow-hidden">
                        <div className="bg-gradient-to-r from-indigo-600 to-rose-400 h-full transition-all duration-1000 ease-out" style={{ width: `${percent}%` }}></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
          
          <button 
            onClick={() => onNavigate(AppTab.ROADMAP)}
            className="w-full py-3.5 md:py-5 px-6 bg-slate-900 text-white rounded-xl md:rounded-2xl text-xs md:text-base font-black hover:bg-indigo-600 transition-all flex items-center justify-center gap-2 shadow-lg mt-4 active:scale-95"
          >
            {activeRoadmaps.length > 0 ? 'Continue Plan' : 'Start Mission'}
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
          </button>
        </div>

        {/* Latest Results Card */}
        <div className="bg-white rounded-3xl p-6 md:p-10 shadow-lg border border-slate-100 space-y-6 flex flex-col">
          <div className="flex-1 space-y-6">
            <h3 className="text-lg md:text-2xl font-black text-slate-800 flex items-center gap-3">
              <div className="p-1.5 bg-rose-50 text-rose-500 rounded-lg flex-shrink-0">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </div>
              Analytics
            </h3>
            
            {recentQuiz ? (
              <div className="bg-slate-50/80 p-4 rounded-xl border border-slate-100">
                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Latest Check</p>
                <p className="text-xs md:text-sm font-bold text-slate-800 mb-1 truncate">{recentQuiz.topic}</p>
                <div className="flex items-end gap-1">
                  <span className="text-2xl md:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-br from-indigo-600 to-rose-500">{recentQuiz.score}</span>
                  <span className="text-slate-400 font-bold mb-0.5 text-[10px]">/ {recentQuiz.total}</span>
                </div>
              </div>
            ) : (
              <p className="text-slate-400 text-xs italic">No quiz history. Test your knowledge!</p>
            )}

            <div className="p-3 bg-indigo-50/50 rounded-xl border border-indigo-100">
              <p className="text-[8px] font-black text-indigo-500 uppercase tracking-widest mb-1">Coach's Tip</p>
              <p className="text-[10px] md:text-xs text-indigo-900 font-medium leading-relaxed italic break-words">"{advice?.revisionTip}"</p>
            </div>
          </div>

          <button 
            onClick={() => onNavigate(AppTab.QUIZ)}
            className="w-full py-3.5 md:py-5 px-6 bg-white border border-slate-200 text-slate-800 rounded-xl md:rounded-2xl text-xs md:text-base font-black hover:bg-slate-50 transition-all flex items-center justify-center gap-2 mt-4 active:scale-95"
          >
            Launch Quiz
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Coach;