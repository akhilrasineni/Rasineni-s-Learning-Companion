
import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";

const getClient = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

export function decodeBase64(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

export function encodeAudio(bytes: Uint8Array) {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

export async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

export const generateRoadmap = async (topic: string, days: number, level: string, time: string) => {
  const ai = getClient();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Act as a world-class educational strategist. Create a structured ${days}-day learning roadmap for a ${level} level student on the topic: "${topic}". The student has ${time} daily. 
    Ensure tasks are actionable and include specific sub-topics. 
    For each day, find and include 2-3 high-quality educational resource URLs (e.g. documentation, video tutorials, or articles) related to that day's theme.`,
    config: {
      tools: [{ googleSearch: {} }],
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          topic: { type: Type.STRING },
          duration: { type: Type.INTEGER },
          level: { type: Type.STRING },
          schedule: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                day: { type: Type.INTEGER },
                title: { type: Type.STRING },
                tasks: { type: Type.ARRAY, items: { type: Type.STRING } },
                revisionTip: { type: Type.STRING },
                links: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      title: { type: Type.STRING },
                      url: { type: Type.STRING }
                    },
                    required: ["title", "url"]
                  }
                }
              },
              required: ["day", "title", "tasks", "revisionTip"]
            }
          }
        },
        required: ["topic", "duration", "level", "schedule"]
      }
    }
  });
  return JSON.parse(response.text || '{}');
};

export const explainConcept = async (topic: string): Promise<GenerateContentResponse> => {
  const ai = getClient();
  return await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Explain "${topic}" using the Feynman Technique. 
    1. Use simple, non-jargon language that a 12-year-old would understand.
    2. Provide at least two relatable real-life metaphors or examples.
    3. Include a "Fast Facts" summary at the end.`,
    config: {
      systemInstruction: "You are Rasineni's Learning Companion. You specialize in making complex ideas simple. Use Markdown for clarity (bolding, lists).",
    }
  });
};

export const summarizeNotes = async (text: string): Promise<GenerateContentResponse> => {
  const ai = getClient();
  return await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Summarize the following study notes:
    - Overall Summary (max 3 sentences)
    - Key Concepts (bullet points)
    - Actionable Takeaways (how to apply this knowledge)
    
    Text: ${text}`,
  });
};

export const generateQuiz = async (topic: string) => {
  const ai = getClient();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Generate a 10-question multiple choice quiz about "${topic}". Challenge the student but remain within reasonable scope. Make the questions deep and conceptual.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            question: { type: Type.STRING },
            options: { type: Type.ARRAY, items: { type: Type.STRING } },
            correctAnswer: { type: Type.INTEGER },
            explanation: { type: Type.STRING }
          },
          required: ["question", "options", "correctAnswer", "explanation"]
        }
      }
    }
  });
  return JSON.parse(response.text || '[]');
};

export const getCoachAdvice = async () => {
  const ai = getClient();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: "Act as Rasineni's Personal Learning Coach. Provide: 1. A punchy motivational quote. 2. A specific 'Skill of the Day' recommendation. 3. A high-impact revision tip (like Spaced Repetition or Active Recall).",
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          motivation: { type: Type.STRING },
          suggestion: { type: Type.STRING },
          revisionTip: { type: Type.STRING }
        },
        required: ["motivation", "suggestion", "revisionTip"]
      }
    }
  });
  return JSON.parse(response.text || '{}');
};

export const generateExplanation = async (query: string): Promise<GenerateContentResponse> => {
  const ai = getClient();
  return await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: query,
    config: {
      tools: [{ googleSearch: {} }],
    },
  });
};

export const generateVisualConcept = async (concept: string) => {
  const ai = getClient();
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [
        { text: `Create an instructional diagram or visual representation for the educational concept: "${concept}". Also provide a clear, detailed breakdown explanation of the concept.` },
      ],
    },
  });
  
  let imageUrl = '';
  let explanation = '';
  
  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      imageUrl = `data:image/png;base64,${part.inlineData.data}`;
    } else if (part.text) {
      explanation += part.text;
    }
  }
  return { imageUrl, explanation };
};

export const generateVideoLesson = async (prompt: string, onStatus: (msg: string) => void) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  onStatus("Initiating video generation pipeline...");
  let operation = await ai.models.generateVideos({
    model: 'veo-3.1-fast-generate-preview',
    prompt: prompt,
    config: {
      numberOfVideos: 1,
      resolution: '720p',
      aspectRatio: '16:9'
    }
  });
  
  while (!operation.done) {
    onStatus("Crafting your video lesson... This usually takes 1-2 minutes.");
    await new Promise(resolve => setTimeout(resolve, 10000));
    operation = await ai.operations.getVideosOperation({operation: operation});
  }

  const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
  return `${downloadLink}&key=${process.env.API_KEY}`;
};
