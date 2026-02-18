
import React, { useState, useEffect } from 'react';
import { generateVideoLesson } from '../services/gemini';

const VideoTutor: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');
  const [hasKey, setHasKey] = useState(false);

  useEffect(() => {
    const checkKey = async () => {
      const selected = await (window as any).aistudio.hasSelectedApiKey();
      setHasKey(selected);
    };
    checkKey();
  }, []);

  const handleSelectKey = async () => {
    await (window as any).aistudio.openSelectKey();
    setHasKey(true); // Assume success per instructions
  };

  const handleGenerate = async () => {
    if (!prompt.trim() || loading) return;
    setLoading(true);
    setVideoUrl(null);
    try {
      const url = await generateVideoLesson(prompt, setStatusMsg);
      setVideoUrl(url);
    } catch (err: any) {
      if (err.message?.includes("Requested entity was not found")) {
        setHasKey(false);
      }
      console.error(err);
    } finally {
      setLoading(false);
      setStatusMsg('');
    }
  };

  if (!hasKey) {
    return (
      <div className="flex flex-col items-center justify-center h-full space-y-8 py-12 text-center max-w-lg mx-auto">
        <div className="w-20 h-20 bg-amber-50 text-amber-600 rounded-3xl flex items-center justify-center shadow-sm">
          <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"/></svg>
        </div>
        <div className="space-y-4">
          <h2 className="text-3xl font-bold text-slate-800">Advanced Video Tutoring</h2>
          <p className="text-slate-500">To generate high-fidelity educational videos using Veo, you must select a paid API key from your Google AI Studio project.</p>
          <p className="text-sm text-slate-400 italic">For more details, visit the <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" className="text-indigo-600 underline">billing documentation</a>.</p>
        </div>
        <button
          onClick={handleSelectKey}
          className="bg-indigo-600 text-white px-10 py-4 rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
        >
          Select API Key to Unlock
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto py-4">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold text-slate-800">Video Tutor</h2>
        <p className="text-slate-500">Create high-quality cinematic explanations of complex subjects.</p>
      </div>

      <div className="bg-white rounded-3xl shadow-xl p-2 flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-4 border border-slate-100">
        <input
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Describe the lesson video: 'A documentary style clip explaining how black holes form...'"
          className="flex-1 px-6 py-4 outline-none text-slate-700 bg-transparent text-lg"
          disabled={loading}
        />
        <button
          onClick={handleGenerate}
          disabled={loading || !prompt.trim()}
          className="w-full md:w-auto bg-indigo-600 text-white px-8 py-4 rounded-2xl font-bold hover:bg-indigo-700 transition-all disabled:opacity-50"
        >
          {loading ? 'Working...' : 'Create Video'}
        </button>
      </div>

      {loading && (
        <div className="bg-white rounded-3xl p-12 text-center shadow-sm border border-slate-100 space-y-6 animate-pulse">
           <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
             <svg className="animate-spin w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>
           </div>
           <div className="space-y-2">
             <p className="text-xl font-bold text-slate-800">Generating Your Lesson</p>
             <p className="text-slate-500 italic">"{statusMsg}"</p>
           </div>
           <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
              <div className="bg-indigo-600 h-full animate-[loading_20s_ease-in-out_infinite]" style={{ width: '40%' }}></div>
           </div>
        </div>
      )}

      {videoUrl && (
        <div className="animate-fade-in bg-black rounded-3xl overflow-hidden shadow-2xl aspect-video border-8 border-white">
          <video 
            src={videoUrl} 
            controls 
            autoPlay 
            className="w-full h-full"
            poster="https://picsum.photos/seed/video/1280/720"
          />
        </div>
      )}

      {!loading && !videoUrl && (
        <div className="grid md:grid-cols-3 gap-6">
          <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 space-y-2 text-center">
            <p className="font-bold text-slate-800">Documentary Style</p>
            <p className="text-xs text-slate-500">Perfect for historical events and scientific discoveries.</p>
          </div>
          <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 space-y-2 text-center">
            <p className="font-bold text-slate-800">3D Animation</p>
            <p className="text-xs text-slate-500">Great for biology and mechanical engineering concepts.</p>
          </div>
          <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 space-y-2 text-center">
            <p className="font-bold text-slate-800">Hand-Drawn</p>
            <p className="text-xs text-slate-500">Ideal for story-telling and simple conceptual metaphors.</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoTutor;
