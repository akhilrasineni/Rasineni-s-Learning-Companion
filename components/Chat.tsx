
import React, { useState, useRef, useEffect } from 'react';
import { generateExplanation } from '../services/gemini';
import { ChatMessage } from '../types';

const Chat: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMsg: ChatMessage = { role: 'user', text: input, timestamp: Date.now() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const response = await generateExplanation(input);
      const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks?.map((chunk: any) => ({
        web: { uri: chunk.web?.uri || '', title: chunk.web?.title || 'Source' }
      })).filter((s: any) => s.web.uri);

      const modelMsg: ChatMessage = {
        role: 'model',
        text: response.text || "I'm sorry, I couldn't process that. Please try again.",
        timestamp: Date.now(),
        sources
      };
      setMessages(prev => [...prev, modelMsg]);
    } catch (error) {
      console.error(error);
      const errorMsg: ChatMessage = {
        role: 'model',
        text: "I encountered an error while searching for the answer. Please check your connection.",
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-12rem)] md:h-[calc(100vh-14rem)] w-full max-w-5xl mx-auto animate-fade-in relative">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto space-y-6 mb-4 px-2 md:px-6 custom-scrollbar pb-10" ref={scrollRef}>
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-6 opacity-90 py-10">
            <div className="w-24 h-24 bg-gradient-to-br from-indigo-50 to-rose-50 text-indigo-600 rounded-[2.5rem] flex items-center justify-center shadow-2xl shadow-indigo-100 border border-indigo-50">
              <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <div className="space-y-2">
              <h2 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tighter">AI Researcher</h2>
              <p className="text-slate-500 max-w-md mx-auto text-lg font-medium">Deep-search any topic. I verify every answer with live web results.</p>
            </div>
          </div>
        )}
        {messages.map((m, idx) => (
          <div key={idx} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[90%] md:max-w-[80%] rounded-3xl p-5 md:p-6 shadow-xl ${
              m.role === 'user' 
                ? 'bg-indigo-600 text-white rounded-tr-none' 
                : 'bg-white text-slate-800 rounded-tl-none border border-slate-100'
            }`}>
              <p className="whitespace-pre-wrap leading-relaxed text-base md:text-lg font-medium">{m.text}</p>
              {m.sources && m.sources.length > 0 && (
                <div className="mt-6 pt-4 border-t border-slate-100">
                  <p className="text-[10px] font-black text-slate-400 mb-3 uppercase tracking-[0.2em]">Verified Sources</p>
                  <div className="flex flex-wrap gap-2">
                    {m.sources.map((s, i) => (
                      <a 
                        key={i} 
                        href={s.web.uri} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-xs bg-slate-50 hover:bg-indigo-50 text-indigo-600 px-3 py-2 rounded-xl transition-all border border-slate-100 flex items-center gap-2 font-bold shadow-sm"
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                        <span className="truncate max-w-[150px]">{s.web.title}</span>
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-white border border-slate-100 rounded-[2rem] rounded-tl-none p-5 shadow-xl">
              <div className="flex space-x-2">
                <div className="w-2.5 h-2.5 bg-indigo-500 rounded-full animate-bounce"></div>
                <div className="w-2.5 h-2.5 bg-indigo-500 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                <div className="w-2.5 h-2.5 bg-indigo-500 rounded-full animate-bounce [animation-delay:0.4s]"></div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input Box - Enhanced Visibility */}
      <div className="sticky bottom-0 left-0 right-0 pt-4 bg-gradient-to-t from-slate-50 via-slate-50/80 to-transparent pb-10 md:pb-4">
        <div className="relative group max-w-4xl mx-auto px-2">
          <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 via-rose-400 to-indigo-500 rounded-[2rem] blur opacity-20 group-focus-within:opacity-50 transition duration-1000 animate-gradient-x"></div>
          <div className="relative flex items-center bg-white/90 backdrop-blur-xl rounded-[1.5rem] md:rounded-[2rem] shadow-2xl border border-white/50 pr-3 h-16 md:h-20">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder="What would you like to research today?"
              className="flex-1 px-6 md:px-10 py-4 bg-transparent outline-none text-slate-800 placeholder:text-slate-400 font-bold text-lg md:text-xl"
            />
            <button
              onClick={handleSend}
              disabled={loading || !input.trim()}
              className={`p-3 md:p-4 rounded-2xl transition-all shadow-lg ${
                input.trim() 
                  ? 'bg-slate-900 text-white hover:bg-indigo-600 scale-100 active:scale-95' 
                  : 'bg-slate-100 text-slate-300 scale-95 cursor-not-allowed'
              }`}
            >
              <svg className="w-6 h-6 md:w-8 md:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;
