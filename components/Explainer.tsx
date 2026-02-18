
import React, { useState } from 'react';
import { explainConcept } from '../services/gemini';

const Explainer: React.FC = () => {
  const [query, setQuery] = useState('');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);

  const handleExplain = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setResult('');
    try {
      const response = await explainConcept(query);
      setResult(response.text || "No explanation found.");
    } catch (e) {
      console.error(e);
      setResult("Error fetching explanation. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 md:space-y-10 animate-fade-in pb-12">
      <div className="text-center space-y-2 md:space-y-4">
        <h2 className="text-2xl md:text-4xl font-black text-slate-800 tracking-tight">Explain Topic</h2>
        <p className="text-slate-500 text-sm md:text-lg px-4">Complex ideas, broken down with real-world metaphors.</p>
      </div>

      <div className="relative group max-w-2xl mx-auto w-full">
        <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-violet-600 rounded-[1.5rem] md:rounded-[2.5rem] blur opacity-10 group-focus-within:opacity-20 transition duration-500"></div>
        <div className="relative bg-white rounded-[1.25rem] md:rounded-[2rem] p-2 flex shadow-lg border border-slate-100 overflow-hidden">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleExplain()}
            placeholder="e.g. Entropy or Bitcoin..."
            className="flex-1 px-4 md:px-8 py-3 md:py-5 outline-none text-sm md:text-xl font-medium text-slate-700 bg-transparent min-w-0"
          />
          <button
            onClick={handleExplain}
            disabled={loading}
            className="bg-indigo-600 text-white px-4 md:px-10 py-3 md:py-5 rounded-[0.75rem] md:rounded-[1.5rem] font-bold text-xs md:text-lg hover:bg-indigo-700 transition-all disabled:opacity-50 whitespace-nowrap"
          >
            {loading ? "..." : "Explain"}
          </button>
        </div>
      </div>

      {result && (
        <div className="bg-white rounded-[1.5rem] md:rounded-[2.5rem] p-6 md:p-12 shadow-xl border border-slate-100 animate-fade-in">
          <div className="prose prose-sm md:prose-lg prose-indigo max-w-none">
            <div className="whitespace-pre-wrap leading-relaxed text-slate-700 font-medium">
              {result}
            </div>
          </div>
        </div>
      )}

      {loading && !result && (
        <div className="flex flex-col items-center justify-center space-y-4 py-12 md:py-20">
          <div className="flex space-x-2">
            <div className="w-3 h-3 bg-indigo-600 rounded-full animate-bounce"></div>
            <div className="w-3 h-3 bg-indigo-600 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
            <div className="w-3 h-3 bg-indigo-600 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
          </div>
          <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">AI is simplifying your topic...</p>
        </div>
      )}
    </div>
  );
};

export default Explainer;
