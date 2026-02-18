
import React, { useState } from 'react';
import { summarizeNotes } from '../services/gemini';

const Summarizer: React.FC = () => {
  const [text, setText] = useState('');
  const [summary, setSummary] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSummarize = async () => {
    if (!text.trim()) return;
    setLoading(true);
    try {
      const response = await summarizeNotes(text);
      setSummary(response.text || "Could not summarize text.");
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-10 max-w-4xl mx-auto py-6">
      <div className="text-center space-y-4">
        <h2 className="text-4xl font-black text-slate-800 tracking-tight">Summarize Notes</h2>
        <p className="text-slate-500 text-lg">Paste your study material and get the gist in seconds.</p>
      </div>

      <div className="bg-white rounded-[2.5rem] p-10 shadow-xl border border-slate-100 space-y-6">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Paste your notes or text here..."
          className="w-full h-64 p-8 rounded-3xl bg-slate-50 border-2 border-transparent focus:border-indigo-600 outline-none transition-all text-lg font-medium resize-none"
        />
        <button
          onClick={handleSummarize}
          disabled={loading || !text.trim()}
          className="w-full bg-indigo-600 text-white py-5 rounded-2xl font-black text-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 disabled:opacity-50 flex items-center justify-center space-x-3"
        >
          {loading ? "Summarizing..." : "Generate Summary"}
        </button>
      </div>

      {summary && (
        <div className="bg-white rounded-[2.5rem] p-10 shadow-xl border border-slate-100 animate-fade-in">
          <div className="prose prose-indigo max-w-none">
            <h3 className="text-2xl font-bold text-slate-800 mb-6">Learning Takeaways</h3>
            <div className="text-lg text-slate-700 leading-relaxed whitespace-pre-wrap">
              {summary}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Summarizer;
