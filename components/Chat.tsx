import React, { useState, useRef, useEffect } from 'react';
import { generateExplanationStream } from '../services/gemini';
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

    let currentResponseText = '';
    const modelMsgPlaceholder: ChatMessage = {
      role: 'model',
      text: '',
      timestamp: Date.now()
    };
    
    setMessages(prev => [...prev, modelMsgPlaceholder]);

    try {
      const resultStream = await generateExplanationStream(input);
      
      for await (const chunk of resultStream) {
        const chunkText = chunk.text || "";
        currentResponseText += chunkText;
        
        setMessages(prev => {
          const newMessages = [...prev];
          const lastMsg = newMessages[newMessages.length - 1];
          if (lastMsg && lastMsg.role === 'model') {
            lastMsg.text = currentResponseText;
            
            const groundingMetadata = chunk.candidates?.[0]?.groundingMetadata;
            if (groundingMetadata?.groundingChunks) {
              const chunks = groundingMetadata.groundingChunks;
              const sources = chunks
                .filter((c: any) => c.web && c.web.uri)
                .map((c: any) => ({
                  web: { uri: c.web.uri, title: c.web.title || 'Source' }
                }));
              
              if (sources.length > 0) {
                lastMsg.sources = sources;
              }
            }
          }
          return newMessages;
        });
      }
    } catch (error: any) {
      console.error('AI Research Error:', error);
      let displayMessage = "I'm having trouble connecting right now.";
      setMessages(prev => {
        const newMessages = [...prev];
        const lastMsg = newMessages[newMessages.length - 1];
        if (lastMsg && lastMsg.role === 'model' && !lastMsg.text) {
          lastMsg.text = displayMessage;
        }
        return newMessages;
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-14rem)] md:h-[calc(100vh-16rem)] w-full max-w-5xl mx-auto animate-fade-in relative px-2">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto space-y-4 md:space-y-6 mb-4 px-1 md:px-6 custom-scrollbar pb-10" ref={scrollRef}>
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-4 opacity-90 py-10">
            <div className="w-20 h-20 bg-gradient-to-br from-indigo-50 to-rose-50 text-indigo-600 rounded-3xl flex items-center justify-center shadow-lg border border-indigo-50">
              <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <div className="space-y-1">
              <h2 className="text-2xl md:text-5xl font-black text-slate-900 tracking-tighter">Researcher</h2>
              <p className="text-slate-500 max-w-xs mx-auto text-sm md:text-lg font-medium leading-relaxed px-4">Deep-search any topic with live verified citations.</p>
            </div>
          </div>
        )}
        {messages.map((m, idx) => (
          <div key={idx} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[92%] md:max-w-[80%] rounded-2xl p-4 md:p-6 shadow-md ${
              m.role === 'user' 
                ? 'bg-indigo-600 text-white rounded-tr-none' 
                : 'bg-white text-slate-800 rounded-tl-none border border-slate-100'
            }`}>
              {m.text ? (
                <p className="whitespace-pre-wrap leading-relaxed text-sm md:text-lg font-medium">{m.text}</p>
              ) : (
                <div className="flex space-x-2 py-2">
                  <div className="w-2 h-2 bg-indigo-200 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-indigo-200 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                  <div className="w-2 h-2 bg-indigo-200 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                </div>
              )}
              {m.sources && m.sources.length > 0 && (
                <div className="mt-4 pt-3 border-t border-slate-100">
                  <p className="text-[8px] font-black text-slate-400 mb-2 uppercase tracking-widest">Sources</p>
                  <div className="flex flex-wrap gap-1.5">
                    {m.sources.map((s, i) => (
                      <a 
                        key={i} 
                        href={s.web.uri} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-[9px] md:text-xs bg-slate-50 text-indigo-600 px-2 py-1.5 rounded-lg border border-slate-100 flex items-center gap-1.5 font-bold shadow-sm"
                      >
                        <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/></svg>
                        <span className="truncate max-w-[100px]">{s.web.title}</span>
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Input Box */}
      <div className="sticky bottom-0 pt-2 bg-gradient-to-t from-slate-50 via-slate-50/90 to-transparent pb-4 md:pb-6">
        <div className="relative flex items-center bg-white rounded-2xl md:rounded-[2rem] shadow-xl border border-slate-100 pr-2 h-14 md:h-20">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Search for something..."
            className="flex-1 px-4 md:px-10 py-3 bg-transparent outline-none text-slate-800 placeholder:text-slate-400 font-bold text-base md:text-xl"
          />
          <button
            onClick={handleSend}
            disabled={loading || !input.trim()}
            className={`p-2.5 md:p-4 rounded-xl transition-all ${
              input.trim() ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-100 text-slate-300'
            }`}
          >
            <svg className="w-5 h-5 md:w-8 md:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Chat;