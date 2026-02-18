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
    if (percent === 100) return { title: "Absolute Mastery!", message: "Perfect score! You're a true master of this topic.", color: "text-indigo-600" };
    if (percent >= 80) return { title: "Elite Performance!", message: "Outstanding! You have a deep understanding.", color: "text-indigo-600" };
    if (percent >= 60) return { title: "Solid Progress!", message: "Well done! You've grasped the core concepts.", color: "text-indigo-500" };
    if (percent >= 40) return { title: "Room for Growth", message: "Keep at it! You've got the basics down.", color: "text-slate-600" };
    return { title: "Keep Learning", message: "Every mistake is a learning opportunity. Try again!", color: "text-rose-500" };
  };

  if (quiz.length > 0 && !finished) {
    const q = quiz[currentIdx];
    return (
      <div className="max-w-4xl mx-auto px-2 animate-fade-in flex flex-col min-h-full">
        <div className="flex flex-row justify-between items-center mb-6 gap-4">
          <div className="flex flex-col">
            <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Question</span>
            <span className="text-slate-900 font-black text-base">{currentIdx + 1} / {quiz.length}</span>
          </div>
          <div className="flex space-x-1 flex-1 max-w-[150px] md:max-w-[300px]">
             {quiz.map((_, i) => (
               <div key={i} className={`h-1.5 rounded-full flex-1 transition-all ${
                 i < currentIdx ? 'bg-indigo-200' : 
                 i === currentIdx ? 'bg-indigo-600' : 
                 'bg-slate-200'
               }`}></div>
             ))}
          </div>
        </div>

        <div className="bg-white rounded-3xl md:rounded-[3rem] p-6 md:p-12 shadow-xl border border-slate-100 mb-6">
          <div className="space-y-6 md:space-y-8">
            <h3 className="text-lg md:text-3xl font-black text-slate-800 leading-snug tracking-tight">
              {q.question}
            </h3>

            <div className="grid grid-cols-1 gap-3">
              {q.options.map((opt, i) => {
                let style = 'border-slate-100 bg-slate-50/50 hover:border-indigo-400';
                if (showResult) {
                  if (i === q.correctAnswer) style = 'border-green-500 bg-green-50 ring-2 ring-green-100';
                  else if (i === selectedAnswer) style = 'border-rose-500 bg-rose-50 ring-2 ring-rose-100';
                  else style = 'border-slate-50 opacity-40';
                }
                return (
                  <button
                    key={i}
                    disabled={showResult}
                    onClick={() => handleAnswer(i)}
                    className={`p-4 md:p-8 rounded-2xl border-2 text-left transition-all font-bold text-sm md:text-lg flex items-center justify-between group ${style}`}
                  >
                    <span className="flex-1 pr-2">{opt}</span>
                    {showResult && i === q.correctAnswer && (
                      <div className="bg-green-500 p-1 rounded-full text-white shadow-sm flex-shrink-0">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/></svg>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {showResult && (
          <div className="p-6 md:p-10 bg-indigo-600 rounded-3xl md:rounded-[2.5rem] text-white shadow-xl animate-fade-in space-y-4">
            <div className="space-y-2">
              <span className="text-[9px] font-black uppercase tracking-widest opacity-60">Insight</span>
              <p className="text-sm md:text-lg font-medium leading-relaxed">
                {q.explanation}
              </p>
            </div>
            <button
              onClick={nextQuestion}
              className="w-full bg-white text-indigo-600 py-4 rounded-xl font-black text-base hover:bg-slate-50 transition-all flex items-center justify-center space-x-2 shadow-lg active:scale-95"
            >
              <span>{currentIdx === quiz.length - 1 ? 'Finish Assessment' : 'Next Question'}</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
            </button>
          </div>
        )}
      </div>
    );
  }

  if (finished) {
    const percent = Math.round((score / quiz.length) * 100);
    const feedback = getFeedback(percent);
    return (
      <div className="max-w-2xl mx-auto py-4 flex flex-col items-center px-2">
        <div className="w-full bg-white rounded-[2.5rem] p-8 md:p-16 shadow-2xl border border-slate-100 text-center space-y-8 animate-fade-in">
          
          <div className="relative inline-flex items-center justify-center">
            <svg className="w-32 h-32 md:w-56 md:h-56 transform -rotate-90">
              <circle cx="50%" cy="50%" r="42%" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-slate-50" />
              <circle 
                cx="50%" cy="50%" r="42%" 
                stroke="currentColor" strokeWidth="8" 
                fill="transparent" 
                strokeDasharray="264" 
                strokeDashoffset={264 - (264 * percent) / 100} 
                strokeLinecap="round"
                className="text-indigo-600 transition-all duration-1000" 
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center flex-col">
              <span className="text-3xl md:text-6xl font-black text-slate-900 leading-none">{percent}%</span>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Final Score</span>
            </div>
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl md:text-4xl font-black text-slate-900 tracking-tighter">{feedback.title}</h2>
            <p className="text-sm md:text-lg text-slate-500 font-medium leading-relaxed">
              {feedback.message}
            </p>
          </div>

          <button
            onClick={() => { setQuiz([]); setTopic(''); setFinished(false); }}
            className="w-full bg-slate-900 text-white py-4 md:py-6 rounded-2xl font-black text-lg hover:bg-indigo-600 transition-all shadow-xl active:scale-95"
          >
            Start New Assessment
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center space-y-8 py-4 px-2 min-h-[50vh]">
      <div className="text-center space-y-3 max-w-2xl">
        <h2 className="text-3xl md:text-6xl font-black text-slate-900 tracking-tighter leading-tight">Knowledge Lab</h2>
        <p className="text-sm md:text-xl font-medium text-slate-500 leading-relaxed px-4">
          Enter a topic for a personalized assessment.
        </p>
      </div>

      <div className="w-full max-w-xl bg-white p-6 md:p-14 rounded-3xl md:rounded-[3rem] shadow-xl border border-slate-100 space-y-8">
        <div className="space-y-2">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Assessment Topic</label>
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="e.g. Ancient Greece..."
            className="w-full px-5 py-4 md:py-6 rounded-2xl bg-slate-50 border-2 border-slate-100 focus:border-indigo-600 focus:bg-white outline-none transition-all text-lg md:text-2xl font-bold shadow-inner"
          />
        </div>
        <button
          onClick={startQuiz}
          disabled={loading || !topic.trim()}
          className="w-full bg-slate-900 text-white py-4 md:py-7 rounded-2xl font-black text-lg md:text-2xl hover:bg-indigo-600 transition-all flex items-center justify-center space-x-3 shadow-xl active:scale-95 disabled:opacity-50"
        >
          {loading ? (
             <div className="w-6 h-6 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
          ) : (
             <>
               <span>Initialize</span>
               <svg className="w-5 h-5 md:w-8 md:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
             </>
          )}
        </button>
      </div>
    </div>
  );
};

export default QuizMaster;