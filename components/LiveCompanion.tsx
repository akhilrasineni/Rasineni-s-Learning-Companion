
import React, { useState, useRef, useCallback } from 'react';
import { GoogleGenAI, Modality, LiveServerMessage } from '@google/genai';
import { decodeBase64, encodeAudio, decodeAudioData } from '../services/gemini';

const LiveCompanion: React.FC = () => {
  const [isActive, setIsActive] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [transcription, setTranscription] = useState<string[]>([]);
  const sessionRef = useRef<any>(null);
  const audioContextRef = useRef<{ input: AudioContext; output: AudioContext } | null>(null);
  const nextStartTimeRef = useRef(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());

  const stopSession = useCallback(() => {
    if (sessionRef.current) {
      sessionRef.current.close();
      sessionRef.current = null;
    }
    if (audioContextRef.current) {
      if (audioContextRef.current.input.state !== 'closed') {
        audioContextRef.current.input.close();
      }
      if (audioContextRef.current.output.state !== 'closed') {
        audioContextRef.current.output.close();
      }
      audioContextRef.current = null;
    }
    sourcesRef.current.forEach(s => {
      try { s.stop(); } catch (e) {}
    });
    sourcesRef.current.clear();
    setIsActive(false);
    setIsConnecting(false);
  }, []);

  const startSession = async () => {
    setIsConnecting(true);
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

    try {
      const inputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      const outputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      audioContextRef.current = { input: inputCtx, output: outputCtx };

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-12-2025',
        callbacks: {
          onopen: () => {
            setIsConnecting(false);
            setIsActive(true);
            
            const source = inputCtx.createMediaStreamSource(stream);
            const scriptProcessor = inputCtx.createScriptProcessor(4096, 1, 1);
            
            scriptProcessor.onaudioprocess = (e) => {
              const inputData = e.inputBuffer.getChannelData(0);
              const l = inputData.length;
              const int16 = new Int16Array(l);
              for (let i = 0; i < l; i++) {
                int16[i] = inputData[i] * 32768;
              }
              const pcmData = encodeAudio(new Uint8Array(int16.buffer));
              
              sessionPromise.then(session => {
                if (session) {
                  session.sendRealtimeInput({ media: { data: pcmData, mimeType: 'audio/pcm;rate=16000' } });
                }
              });
            };

            source.connect(scriptProcessor);
            scriptProcessor.connect(inputCtx.destination);
          },
          onmessage: async (msg: LiveServerMessage) => {
            // Safer access to audio data to satisfy TS strict checks
            const parts = msg.serverContent?.modelTurn?.parts;
            const audioPart = parts && parts.length > 0 ? parts[0] : null;
            const audioData = audioPart?.inlineData?.data;

            if (audioData && audioContextRef.current) {
              const outCtx = audioContextRef.current.output;
              const nextStartTime = Math.max(nextStartTimeRef.current, outCtx.currentTime);
              const buffer = await decodeAudioData(decodeBase64(audioData), outCtx, 24000, 1);
              const source = outCtx.createBufferSource();
              source.buffer = buffer;
              source.connect(outCtx.destination);
              source.addEventListener('ended', () => sourcesRef.current.delete(source));
              source.start(nextStartTime);
              nextStartTimeRef.current = nextStartTime + buffer.duration;
              sourcesRef.current.add(source);
            }

            if (msg.serverContent?.outputTranscription) {
               const text = msg.serverContent.outputTranscription.text;
               setTranscription(prev => [...prev.slice(-4), `AI: ${text}`]);
            }
            if (msg.serverContent?.inputTranscription) {
               const text = msg.serverContent.inputTranscription.text;
               setTranscription(prev => [...prev.slice(-4), `You: ${text}`]);
            }

            if (msg.serverContent?.interrupted) {
              sourcesRef.current.forEach(s => {
                try { s.stop(); } catch (e) {}
              });
              sourcesRef.current.clear();
              nextStartTimeRef.current = 0;
            }
          },
          onerror: (e) => {
            console.error('Live API Error:', e);
            stopSession();
          },
          onclose: () => stopSession()
        },
        config: {
          responseModalities: [Modality.AUDIO],
          systemInstruction: "You are Rasineni's Voice Companion. Talk like a friendly, encouraging teacher. Keep responses concise and engaging for conversation.",
          inputAudioTranscription: {},
          outputAudioTranscription: {},
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } } }
        }
      });

      sessionRef.current = await sessionPromise;
    } catch (err) {
      console.error('Failed to start session:', err);
      setIsConnecting(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-full space-y-12 animate-fade-in">
      <div className="relative">
        <div className={`w-48 h-48 rounded-full flex items-center justify-center border-4 transition-all duration-500 ${
          isActive ? 'border-indigo-500 bg-indigo-50 scale-110 shadow-xl shadow-indigo-200' : 'border-slate-200 bg-slate-50'
        }`}>
          {isActive ? (
            <div className="flex items-center space-x-1">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="w-1.5 h-12 bg-indigo-500 rounded-full animate-pulse" style={{ animationDelay: `${i * 0.15}s` }}></div>
              ))}
            </div>
          ) : (
            <svg className="w-20 h-20 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-20a3 3 0 013 3v10a3 3 0 01-3 33 3 0 01-3-3V5a3 3 0 013-3z" />
            </svg>
          )}
        </div>
        {isActive && (
            <div className="absolute -top-4 -right-4 bg-green-500 text-white text-[10px] font-bold px-2 py-1 rounded-full animate-bounce">LIVE</div>
        )}
      </div>

      <div className="text-center space-y-4 px-4">
        <h2 className="text-2xl font-black text-slate-800 tracking-tight">{isActive ? 'I\'m listening...' : 'Ready to talk?'}</h2>
        <p className="text-slate-500 max-w-sm mx-auto font-medium">Have a real-time conversation about any subject. Just speak naturally like you would with a tutor.</p>
      </div>

      <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-sm border border-slate-100 min-h-[160px] flex flex-col justify-end space-y-2 mx-4">
        {transcription.length === 0 ? (
          <p className="text-slate-300 text-sm text-center italic">Transcription will appear here...</p>
        ) : (
          transcription.map((t, i) => (
            <p key={i} className={`text-sm ${t.startsWith('You:') ? 'text-indigo-600 font-bold' : 'text-slate-600 font-medium'}`}>{t}</p>
          ))
        )}
      </div>

      <button
        onClick={isActive ? stopSession : startSession}
        disabled={isConnecting}
        className={`px-10 py-5 rounded-full font-black text-lg shadow-xl transition-all transform hover:scale-105 active:scale-95 flex items-center space-x-3 ${
          isActive ? 'bg-rose-500 text-white hover:bg-rose-600' : 'bg-indigo-600 text-white hover:bg-indigo-700'
        } ${isConnecting ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        {isConnecting ? (
          <>
            <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>Connecting...</span>
          </>
        ) : isActive ? (
          <>
            <div className="w-3 h-3 bg-white rounded-full animate-ping"></div>
            <span>End Session</span>
          </>
        ) : (
          <>
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/><path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/></svg>
            <span>Start Voice Learning</span>
          </>
        )}
      </button>
    </div>
  );
};

export default LiveCompanion;
