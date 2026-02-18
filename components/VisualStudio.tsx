import React, { useState } from 'react';
import { generateVisualConcept } from '../services/gemini';
import { VisualConcept } from '../types';

const VisualStudio: React.FC = () => {
  const [concept, setConcept] = useState('');
  const [result, setResult] = useState<VisualConcept | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!concept.trim() || loading) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const data = await generateVisualConcept(concept);
      setResult({ ...data, prompt: concept });
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to generate visual. Please check your connection and API key.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto py-4 animate-fade-in">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-black text-slate-800 tracking-tight">Visual Studio</h2>
        <p className="text-slate-500 font-medium">Transform abstract theories into clear, instructional visuals.</p>
      </div>

      <div className="bg-white rounded-[2rem] shadow-xl p-2 flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-4 border border-slate-100 ring-1 ring-slate-200/50">
        <input
          type="text"
          value={concept}
          onChange={(e) => setConcept(e.target.value)}
          placeholder="e.g., Photosynthesis process, DNA Double Helix, Solar System..."
          className="flex-1 px-6 py-4 outline-none text-slate-700 bg-transparent text-lg font-medium placeholder:text-slate-300"
          onKeyPress={(e) => e.key === 'Enter' && handleGenerate()}
        />
        <button
          onClick={handleGenerate}
          disabled={loading || !concept.trim()}
          className="w-full md:w-auto bg-indigo-600 text-white px-10 py-4 rounded-2xl font-black hover:bg-indigo-700 transition-all flex items-center justify-center space-x-2 shadow-lg shadow-indigo-100 disabled:opacity-50 active:scale-95"
        >
          {loading ? (
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
          ) : (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
          )}
          <span>{loading ? 'Sketching...' : 'Visualize'}</span>
        </button>
      </div>

      {error && (
        <div className="bg-rose-50 border border-rose-100 p-6 rounded-2xl flex items-center space-x-4 animate-fade-in">
          <div className="p-3 bg-rose-500 text-white rounded-xl shadow-lg">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
          </div>
          <div>
            <p className="font-black text-rose-600 uppercase text-[10px] tracking-widest">Generation Error</p>
            <p className="text-rose-800 font-medium">{error}</p>
          </div>
        </div>
      )}

      {result && (
        <div className="grid md:grid-cols-2 gap-8 items-start animate-fade-in">
          <div className="bg-white rounded-[2.5rem] overflow-hidden shadow-2xl border border-slate-100 p-4 ring-1 ring-slate-200/50">
             <img src={result.imageUrl} alt={result.prompt} className="w-full h-auto rounded-2xl object-cover shadow-inner" />
          </div>
          <div className="space-y-6">
            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-50/50 rounded-full -mr-10 -mt-10"></div>
              <h3 className="text-2xl font-black text-slate-800 mb-6 relative z-10 flex items-center gap-3">
                <div className="w-2 h-8 bg-indigo-600 rounded-full"></div>
                Breakdown: {result.prompt}
              </h3>
              <p className="text-slate-600 leading-relaxed whitespace-pre-wrap font-medium text-lg relative z-10">{result.explanation}</p>
            </div>
            <button 
              onClick={() => window.print()}
              className="w-full flex items-center justify-center space-x-3 py-5 bg-slate-900 text-white rounded-2xl font-black hover:bg-indigo-600 transition-all shadow-xl active:scale-95"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
              <span>Download Study Sheet</span>
            </button>
          </div>
        </div>
      )}

      {loading && !result && (
        <div className="flex flex-col items-center justify-center space-y-6 py-24">
          <div className="w-32 h-32 relative">
             <div className="absolute inset-0 border-8 border-indigo-50 rounded-full"></div>
             <div className="absolute inset-0 border-8 border-indigo-600 rounded-full border-t-transparent animate-spin"></div>
          </div>
          <div className="text-center space-y-2">
            <p className="text-xl font-black text-slate-800 animate-pulse tracking-tight">AI is sketching your concept...</p>
            <p className="text-slate-400 font-medium text-sm">Please wait while we generate the visual breakdown.</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default VisualStudio;