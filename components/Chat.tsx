import React, { useState, useRef, useEffect } from 'react';
import { generateExplanationStream } from '../services/gemini';
import { ChatMessage } from '../types';

interface ChatProps {
  initialQuery?: string;
  onQueryConsumed?: () => void;
}

const Chat: React.FC<ChatProps> = ({ initialQuery, onQueryConsumed }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (initialQuery && initialQuery.trim() !== '') {
      setInput(initialQuery);
      handleSend(initialQuery);
      if (onQueryConsumed) onQueryConsumed();
    }
  }, [initialQuery]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (queryToUse?: string) => {
    const finalInput = queryToUse || input;
    if (!finalInput.trim() || loading) return;

    const userMsg: ChatMessage = { role: 'user', text: finalInput, timestamp: Date.now() };
    setMessages(prev => [...prev, userMsg]);
    if (!queryToUse) setInput('');
    setLoading(true);

    let currentResponseText = '';
    const modelMsgPlaceholder: ChatMessage = {
      role: 'model',
      text: '',
      timestamp: Date.now()
    };
    
    setMessages(prev => [...prev, modelMsgPlaceholder]);

    try {
      const resultStream = await generateExplanationStream(finalInput);
      
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
      let displayMessage = "I encountered an error while researching. Please check your connection or try a simpler topic.";
      setMessages(prev => {
        const newMessages = [...prev];
        const lastMsg = newMessages[newMessages.length - 1];
        if (lastMsg && lastMsg.role === 'model') {
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
      <div className="flex-1 overflow-y-auto space-y-6 md:space-y-8 mb-4 px-1 md:px-6 custom-scrollbar pb-10" ref={scrollRef}>
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-6 opacity-90 py-10">
            <div className="w-24 h-24 bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-900/40 dark:to-indigo-800/20 text-indigo-600 dark:text-indigo-400 rounded-[2.5rem] flex items-center justify-center shadow-2xl border border-indigo-100/50 dark:border-indigo-700/30">
              <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <div className="space-y-2">
              <h2 className="text-3xl md:text-6xl font-black text-slate-900 dark:text-slate-100 tracking-tighter">Researcher</h2>
              <p className="text-slate-500 dark:text-slate-400 max-w-sm mx-auto text-base md:text-xl font-medium leading-relaxed px-4 italic">
                Citing real-time web data for every answer.
              </p>
            </div>
          </div>
        )}
        {messages.map((m, idx) => (
          <div key={idx} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[94%] md:max-w-[85%] rounded-[2rem] p-6 md:p-8 shadow-xl ${
              m.role === 'user' 
                ? 'bg-indigo-600 text-white rounded-tr-none' 
                : 'bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 rounded-tl-none border border-slate-100 dark:border-slate-800'
            }`}>
              {m.text ? (
                <p className="whitespace-pre-wrap leading-relaxed text-base md:text-xl font-medium tracking-tight break-words">{m.text}</p>
              ) : (
                <div className="flex space-x-3 py-3">
                  <div className="w-3 h-3 bg-indigo-300 dark:bg-indigo-600 rounded-full animate-bounce"></div>
                  <div className="w-3 h-3 bg-indigo-300 dark:bg-indigo-600 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                  <div className="w-3 h-3 bg-indigo-300 dark:bg-indigo-600 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                </div>
              )}
              {m.sources && m.sources.length > 0 && (
                <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800">
                  <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 mb-4 uppercase tracking-[0.2em]">Verified Citations</p>
                  <div className="flex flex-wrap gap-2">
                    {m.sources.map((s, i) => (
                      <a 
                        key={i} 
                        href={s.web.uri} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-[10px] md:text-xs bg-slate-50 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 px-4 py-2.5 rounded-xl border border-slate-100 dark:border-slate-700 flex items-center gap-2 font-bold shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/></svg>
                        <span className="truncate max-w-[120px] md:max-w-[200px]">{s.web.title}</span>
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
      <div className="sticky bottom-0 pt-4 bg-gradient-to-t from-slate-50 dark:from-slate-950 via-slate-50/90 dark:via-slate-950/90 to-transparent pb-6 md:pb-10">
        <div className="relative flex items-center bg-white dark:bg-slate-900 rounded-[1.5rem] md:rounded-[3rem] shadow-2xl border border-slate-100 dark:border-slate-800 pr-2 h-16 md:h-24">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Deep search any topic..."
            className="flex-1 px-6 md:px-12 py-4 bg-transparent outline-none text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-700 font-bold text-lg md:text-2xl"
          />
          <button
            onClick={() => handleSend()}
            disabled={loading || !input.trim()}
            className={`p-3 md:p-6 rounded-[1rem] md:rounded-[2rem] transition-all flex items-center justify-center ${
              input.trim() ? 'bg-indigo-600 text-white shadow-xl hover:scale-105' : 'bg-slate-100 dark:bg-slate-800 text-slate-300 dark:text-slate-700'
            }`}
          >
            <svg className="w-6 h-6 md:w-10 md:h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Chat;