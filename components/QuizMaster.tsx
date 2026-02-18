
import React, { useState } from 'react';
import { generateQuiz } from '../services/gemini';
import { addQuizScoreForUser } from '../services/storage';
import { QuizItem, UserProgress } from '../types';

interface QuizMasterProps {
  user: UserProgress;
}

const QuizMaster: React.FC<QuizMasterProps> = ({ user }) => {
  const [topic, setTopic] = useState('');
  const [quiz, setQuiz] = useState<QuizItem[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [loading, setLoading] = useState(false);
  const [finished, setFinished] = useState(false);

  const startQuiz = async () => {
    if (!topic.trim() || loading) return;
    setLoading(true);
    try {
      const data = await generateQuiz(topic);
      setQuiz(data);
      setCurrentIdx(0);
      setScore(0);
      setFinished(false);
      setShowResult(false);
      setSelectedAnswer(null);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswer = (idx: number) => {
    if (showResult) return;
    setSelectedAnswer(idx);
    setShowResult(true);
    if (idx === quiz[currentIdx].correctAnswer) {
      setScore(prev => prev + 1);
    }
  };

  const nextQuestion = () => {
    if (currentIdx < quiz.length - 1) {
      setCurrentIdx(prev => prev + 1);
      setShowResult(false);
      setSelectedAnswer(null);
    } else {
      setFinished(true);
      addQuizScoreForUser(user.name, {
        topic: topic,
        score: score,
        total: quiz.length,
        timestamp: Date.now()
      });
    }
  };

  const getFeedback = (percent: number) => {
    if (percent === 100) return {
      title: "Absolute Mastery!",
      message: `Incredible, ${user.name}! You've achieved a perfect score. You are truly a master of ${topic}.`,
      color: "text-indigo-600"
    };
    if (percent >= 80) return {
      title: "Elite Performance!",
      message: `Outstanding work, ${user.name}! You have a deep understanding of ${topic}. Keep this momentum going!`,
      color: "text-indigo-600"
    };
    if (percent >= 60) return {
      title: "Solid Progress!",
      message: `Well done, ${user.name}. You've grasped the core concepts of ${topic}. A little more review and you'll reach elite status.`,
      color: "text-indigo-500"
    };
    if (percent >= 40) return {
      title: "Room for Growth",
      message: `Keep at it, ${user.name}! You've got the basics down, but ${topic} still has some secrets to reveal to you.`,
      color: "text-slate-600"
    };
    return {
      title: "Mission: Retry",
      message: `Don't be discouraged, ${user.name}. ${topic} is complex, and every mistake is a learning opportunity. Try reviewing the roadmap again!`,
      color: "text-rose-500"
    };
  };

  if (quiz.length > 0 && !finished) {
    const q = quiz[currentIdx];
    return (
      <div className="max-w-4xl mx-auto py-4 md:py-10 px-4 animate-fade-in flex flex-col min-h-full">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div className="flex flex-col">
            <span className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.2em] mb-1">Knowledge Mission</span>
            <span className="text-slate-400 font-bold text-xs">Question {currentIdx + 1} of {quiz.length}</span>
          </div>
          <div className="flex space-x-1.5 overflow-x-auto pb-2 w-full md:w-auto">
             {quiz.map((_, i) => (
               <div key={i} className={`h-1.5 rounded-full transition-all duration-500 flex-shrink-0 ${
                 i < currentIdx ? 'w-4 bg-indigo-200' : 
                 i === currentIdx ? 'w-8 bg-indigo-600' : 
                 'w-2 bg-slate-200'
               }`}></div>
             ))}
          </div>
        </div>

        <div className="bg-white rounded-[2rem] md:rounded-[3rem] p-6 md:p-12 shadow-[0_20px_40px_-10px_rgba(0,0,0,0.05)] border border-slate-100 mb-6 flex-1">
          <div className="space-y-8">
            <h3 className="text-xl md:text-2xl lg:text-3xl font-black text-slate-800 leading-snug tracking-tight">
              {q.question}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
              {q.options.map((opt, i) => {
                let style = 'border-slate-100 hover:border-indigo-400 bg-slate-50/50 hover:bg-white hover:shadow-md';
                if (showResult) {
                  if (i === q.correctAnswer) style = 'border-green-500 bg-green-50 ring-2 ring-green-100 shadow-md';
                  else if (i === selectedAnswer) style = 'border-rose-500 bg-rose-50 ring-2 ring-rose-100';
                  else style = 'border-slate-50 opacity-40 grayscale-[0.5]';
                }
                return (
                  <button
                    key={i}
                    disabled={showResult}
                    onClick={() => handleAnswer(i)}
                    className={`p-5 md:p-8 rounded-2xl border-2 text-left transition-all duration-200 font-bold text-xs md:text-lg flex items-center justify-between group ${style}`}
                  >
                    <span className="flex-1">{opt}</span>
                    {showResult && i === q.correctAnswer && (
                      <div className="bg-green-500 p-1.5 rounded-full text-white shadow-sm flex-shrink-0 ml-3">
                        <svg className="w-4 h-4 md:w-6 md:h-6" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/></svg>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {showResult && (
          <div className="p-6 md:p-10 bg-indigo-600 rounded-[2rem] md:rounded-[2.5rem] text-white shadow-xl animate-fade-in relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-10 -mt-10 group-hover:scale-125 transition-transform duration-700"></div>
            <div className="relative z-10 space-y-6">
              <div>
                <span className="text-[9px] font-black uppercase tracking-[0.3em] opacity-60 mb-1 block">Quick Lesson</span>
                <p className="text-sm md:text-base lg:text-lg font-medium leading-relaxed">
                  {q.explanation}
                </p>
              </div>
              <button
                onClick={nextQuestion}
                className="w-full bg-white text-indigo-600 py-4 md:py-6 rounded-2xl font-black text-lg md:text-xl hover:bg-slate-50 transition-all flex items-center justify-center space-x-3 active:scale-95 shadow-lg"
              >
                <span>{currentIdx === quiz.length - 1 ? 'See Your Rank' : 'Continue Mission'}</span>
                <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  if (finished) {
    const percent = Math.round((score / quiz.length) * 100);
    const feedback = getFeedback(percent);
    return (
      <div className="max-w-2xl mx-auto py-6 md:py-16 flex flex-col items-center px-4">
        <div className="w-full bg-white rounded-[2.5rem] md:rounded-[4rem] p-8 md:p-16 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1)] border border-slate-100 text-center space-y-10 animate-fade-in">
          
          <div className="relative inline-flex items-center justify-center">
            <svg className="w-32 h-32 md:w-56 md:h-56 transform -rotate-90">
              <circle cx="50%" cy="50%" r="42%" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-slate-50" />
              <circle 
                cx="50%" cy="50%" r="42%" 
                stroke="currentColor" strokeWidth="12" 
                fill="transparent" 
                strokeDasharray="264" 
                strokeDashoffset={264 - (264 * percent) / 100} 
                strokeLinecap="round"
                className="text-indigo-600 transition-all duration-1000 ease-out" 
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center flex-col">
              <span className="text-3xl md:text-6xl font-black text-slate-900 leading-none tracking-tighter">{percent}%</span>
              <span className="text-[8px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1 md:mt-2">Score</span>
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl md:text-4xl font-black text-slate-900 tracking-tighter">{feedback.title}</h2>
            <div className="flex flex-col space-y-2">
              <p className="text-slate-500 font-medium text-sm md:text-lg max-w-sm mx-auto leading-relaxed">
                {feedback.message}
              </p>
              <div className="pt-4">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Final Result</span>
                <span className={`text-xl md:text-3xl font-black ${feedback.color}`}>
                  {score} <span className="text-slate-300">/</span> {quiz.length}
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={() => { setQuiz([]); setTopic(''); setFinished(false); }}
            className="w-full bg-slate-900 text-white py-4 md:py-6 rounded-2xl font-black text-lg md:text-xl hover:bg-indigo-600 transition-all shadow-xl active:scale-95 group"
          >
            <span className="flex items-center justify-center gap-3">
              Start New Assessment
              <svg className="w-5 h-5 md:w-6 md:h-6 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 7l5 5m0 0l-5 5m5-5H6"/></svg>
            </span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center space-y-10 py-8 px-4 min-h-[60vh]">
      <div className="text-center space-y-4 max-w-2xl">
        <h2 className="text-3xl md:text-6xl font-black text-slate-900 tracking-tighter">Knowledge Lab</h2>
        <p className="text-slate-500 text-sm md:text-xl font-medium leading-relaxed">
          The final check for your progress. Enter a topic to generate a personalized assessment.
        </p>
      </div>

      <div className="w-full max-w-2xl bg-white p-8 md:p-14 rounded-[3rem] shadow-[0_20px_40px_-10px_rgba(0,0,0,0.08)] border border-slate-100 space-y-10">
        <div className="space-y-3">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] ml-2">Assessment Topic</label>
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="e.g. Ancient Greece, React Lifecycle..."
            className="w-full px-6 md:px-8 py-4 md:py-6 rounded-2xl bg-slate-50 border-2 border-slate-100 focus:border-indigo-600 focus:bg-white outline-none text-slate-800 transition-all text-lg md:text-2xl font-bold shadow-inner"
          />
        </div>
        <button
          onClick={startQuiz}
          disabled={loading || !topic.trim()}
          className="w-full bg-slate-900 text-white py-5 md:py-7 rounded-2xl font-black text-lg md:text-2xl hover:bg-indigo-600 transition-all flex items-center justify-center space-x-3 shadow-xl active:scale-95 disabled:opacity-50"
        >
          {loading ? (
             <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
          ) : (
             <>
               <span>Initialize Assessment</span>
               <svg className="w-6 h-6 md:w-8 md:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
             </>
          )}
        </button>
      </div>
    </div>
  );
};

export default QuizMaster;
