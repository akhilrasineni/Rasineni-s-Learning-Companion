
import React, { useState } from 'react';
import { generateVisualConcept } from '../services/gemini';
import { VisualConcept } from '../types';

const VisualStudio: React.FC = () => {
  const [concept, setConcept] = useState('');
  const [result, setResult] = useState<VisualConcept | null>(null);
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    if (!concept.trim() || loading) return;
    setLoading(true);
    try {
      const data = await generateVisualConcept(concept);
      setResult({ ...data, prompt: concept });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto py-4">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold text-slate-800">Visual Studio</h2>
        <p className="text-slate-500">Transform abstract theories into clear, instructional visuals.</p>
      </div>

      <div className="bg-white rounded-3xl shadow-xl p-2 flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-4 border border-slate-100">
        <input
          type="text"
          value={concept}
          onChange={(e) => setConcept(e.target.value)}
          placeholder="e.g., Photosynthesis process, DNA Double Helix, Solar System..."
          className="flex-1 px-6 py-4 outline-none text-slate-700 bg-transparent text-lg"
          onKeyPress={(e) => e.key === 'Enter' && handleGenerate()}
        />
        <button
          onClick={handleGenerate}
          disabled={loading || !concept.trim()}
          className="w-full md:w-auto bg-indigo-600 text-white px-8 py-4 rounded-2xl font-bold hover:bg-indigo-700 transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
        >
          {loading ? (
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
          ) : (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
          )}
          <span>{loading ? 'Creating...' : 'Visualize'}</span>
        </button>
      </div>

      {result && (
        <div className="grid md:grid-cols-2 gap-8 items-start animate-fade-in">
          <div className="bg-white rounded-3xl overflow-hidden shadow-2xl border border-slate-100 p-4">
             <img src={result.imageUrl} alt={result.prompt} className="w-full h-auto rounded-2xl object-cover" />
          </div>
          <div className="space-y-6">
            <div className="bg-indigo-50 p-6 rounded-3xl border border-indigo-100">
              <h3 className="text-xl font-bold text-indigo-900 mb-4">Breakdown: {result.prompt}</h3>
              <p className="text-indigo-800 leading-relaxed whitespace-pre-wrap">{result.explanation}</p>
            </div>
            <button 
              onClick={() => window.print()}
              className="w-full flex items-center justify-center space-x-2 py-4 border-2 border-slate-200 rounded-2xl text-slate-600 font-semibold hover:bg-slate-50 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
              <span>Download Study Sheet</span>
            </button>
          </div>
        </div>
      )}

      {loading && !result && (
        <div className="flex flex-col items-center justify-center space-y-4 py-20">
          <div className="w-24 h-24 relative">
             <div className="absolute inset-0 border-4 border-indigo-100 rounded-full"></div>
             <div className="absolute inset-0 border-4 border-indigo-600 rounded-full border-t-transparent animate-spin"></div>
          </div>
          <p className="text-slate-500 font-medium animate-pulse">Our AI is sketching your concept...</p>
        </div>
      )}
    </div>
  );
};

export default VisualStudio;
