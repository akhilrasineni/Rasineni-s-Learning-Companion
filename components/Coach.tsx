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
        <div className="w-14 h-14 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-slate-400 dark:text-slate-500 font-black uppercase tracking-[0.2em] text-[10px]">Analyzing Neural Pathways...</p>
      </div>
    );
  }

  const activeRoadmaps: RoadmapProgress[] = Object.values(user.roadmaps);
  const recentQuiz = user.quizHistory[0];

  return (
    <div className="space-y-12 animate-fade-in max-w-full">
      {/* Dynamic Welcome Hero */}
      <div className="bg-white dark:bg-slate-900 rounded-[3rem] md:rounded-[5rem] p-10 md:p-24 shadow-xl dark:shadow-none border border-slate-100 dark:border-slate-800 relative overflow-hidden group">
        <div className="absolute -top-40 -right-40 w-[40rem] h-[40rem] bg-indigo-100 dark:bg-indigo-600/10 rounded-full blur-[140px] opacity-60"></div>
        <div className="absolute -bottom-40 -left-40 w-[40rem] h-[40rem] bg-rose-100 dark:bg-rose-600/10 rounded-full blur-[140px] opacity-60"></div>
        
        <div className="relative z-10 space-y-8 md:space-y-12">
          <div className="flex items-center space-x-4">
            <div className="flex -space-x-3">
               {[1,2,3].map(i => <div key={i} className="w-8 h-8 rounded-full border-2 border-white dark:border-slate-900 bg-indigo-500"></div>)}
            </div>
            <span className="text-xs font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">Neural Sync Optimized</span>
          </div>
          
          <h2 className="text-5xl md:text-8xl lg:text-9xl font-black text-slate-900 dark:text-slate-100 tracking-tighter leading-[0.85] break-words">
            Hi, <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-violet-600 to-rose-500">{user.name}</span>.
          </h2>
          
          <div className="max-w-4xl">
            <p className="text-xl md:text-4xl text-slate-500 dark:text-slate-400 font-medium leading-tight italic border-l-8 border-indigo-500/20 dark:border-indigo-500/40 pl-8 md:pl-16 py-2">
              "{advice?.motivation}"
            </p>
          </div>
          
          <div className="flex flex-wrap gap-4 pt-4">
            <button 
              onClick={() => onNavigate(AppTab.RESEARCH)}
              className="px-12 py-6 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-[2rem] font-black text-lg md:text-xl hover:scale-105 transition-all shadow-2xl active:scale-95 flex items-center gap-4"
            >
              Start New Research
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M17 8l4 4m0 0l-4-4m4 4H3" /></svg>
            </button>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 md:gap-16">
        {/* Pathway Section */}
        <div className="bg-white dark:bg-slate-900 rounded-[3rem] p-10 md:p-16 shadow-lg dark:shadow-none border border-slate-100 dark:border-slate-800 space-y-10 flex flex-col justify-between">
          <div className="space-y-10">
            <div className="flex items-center justify-between">
              <h3 className="text-3xl font-black text-slate-900 dark:text-slate-100 flex items-center gap-4">
                <div className="p-4 bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 rounded-2xl flex-shrink-0">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
                </div>
                Active Tracks
              </h3>
            </div>
            
            <p className="text-lg text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
              Your personalized roadmaps are dynamic. Every milestone achieved brings you closer to mastery.
            </p>

            {activeRoadmaps.length === 0 ? (
              <div className="py-14 bg-slate-50 dark:bg-slate-800/50 rounded-[2.5rem] text-center border-2 border-dashed border-slate-200 dark:border-slate-700">
                <p className="text-slate-400 dark:text-slate-500 font-bold italic">Ready to map your growth?</p>
              </div>
            ) : (
              <div className="space-y-10">
                {activeRoadmaps.slice(0, 3).map((r, i) => {
                  const percent = Math.round((r.completedDays.length / r.roadmap.schedule.length) * 100);
                  return (
                    <div key={i} className="space-y-4">
                      <div className="flex justify-between items-end px-1">
                        <span className="font-black text-slate-800 dark:text-slate-100 truncate pr-6 text-xl">{r.roadmap.topic}</span>
                        <span className="text-indigo-600 dark:text-indigo-400 font-black text-2xl">{percent}%</span>
                      </div>
                      <div className="w-full bg-slate-100 dark:bg-slate-800 h-4 rounded-full overflow-hidden p-1 shadow-inner">
                        <div className="bg-gradient-to-r from-indigo-600 via-violet-500 to-rose-400 h-full transition-all duration-1000 ease-out rounded-full" style={{ width: `${percent}%` }}></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
          
          <button 
            onClick={() => onNavigate(AppTab.ROADMAP)}
            className="w-full py-6 px-10 bg-indigo-600 text-white rounded-[2rem] text-xl font-black hover:bg-indigo-700 transition-all shadow-xl dark:shadow-none active:scale-95"
          >
            Manage Pathways
          </button>
        </div>

        {/* Analytics Section */}
        <div className="bg-white dark:bg-slate-900 rounded-[3rem] p-10 md:p-16 shadow-lg dark:shadow-none border border-slate-100 dark:border-slate-800 space-y-10 flex flex-col justify-between">
          <div className="space-y-10">
            <h3 className="text-3xl font-black text-slate-900 dark:text-slate-100 flex items-center gap-4">
              <div className="p-4 bg-rose-50 dark:bg-rose-900/40 text-rose-500 dark:text-rose-400 rounded-2xl flex-shrink-0">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </div>
              Performance
            </h3>

            <p className="text-lg text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
              We track concept retention using adaptive algorithms. Review the coach's strategy for better results.
            </p>
            
            {recentQuiz ? (
              <div className="bg-slate-50 dark:bg-slate-800/50 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800">
                <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.3em] mb-4">Latest Evaluation</p>
                <div className="flex items-center justify-between gap-6">
                  <div className="min-w-0">
                    <p className="text-2xl font-black text-slate-800 dark:text-slate-100 truncate">{recentQuiz.topic}</p>
                    <p className="text-slate-400 dark:text-slate-500 font-bold text-sm mt-1 uppercase tracking-widest">Active Retention</p>
                  </div>
                  <div className="bg-white dark:bg-slate-800 p-6 rounded-[2rem] border border-slate-100 dark:border-slate-700 shadow-sm">
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-br from-indigo-600 to-rose-500">{recentQuiz.score}</span>
                      <span className="text-slate-400 font-bold text-lg">/ {recentQuiz.total}</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-14 bg-slate-50 dark:bg-slate-800/50 rounded-[2.5rem] text-center border-2 border-dashed border-slate-200 dark:border-slate-700">
                <p className="text-slate-400 dark:text-slate-500 font-bold italic">Knowledge checks keep you sharp.</p>
              </div>
            )}

            <div className="p-8 bg-indigo-50/50 dark:bg-indigo-900/30 rounded-[2.5rem] border border-indigo-100 dark:border-indigo-900/50">
              <p className="text-[10px] font-black text-indigo-500 dark:text-indigo-400 uppercase tracking-widest mb-3">Coach's Perspective</p>
              <p className="text-lg md:text-xl text-indigo-900 dark:text-indigo-200 font-medium leading-snug italic">"{advice?.revisionTip}"</p>
            </div>
          </div>

          <button 
            onClick={() => onNavigate(AppTab.QUIZ)}
            className="w-full py-6 px-10 bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-800 text-slate-800 dark:text-slate-100 rounded-[2rem] text-xl font-black hover:bg-slate-50 dark:hover:bg-slate-700 transition-all active:scale-95"
          >
            Launch Assessment
          </button>
        </div>
      </div>
    </div>
  );
};

export default Coach;