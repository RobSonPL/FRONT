
import { GoogleGenAI, Type } from "@google/genai";
import { VocItem, FaqItem, Language } from "../types";

const MODEL_NAME = 'gemini-3-pro-preview';

const getAi = () => new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

const getLanguageName = (lang: Language) => {
  const names = { pl: 'Polish', en: 'English', de: 'German', es: 'Spanish' };
  return names[lang];
};

export const generateSuggestion = async (field: string, context: string, lang: Language): Promise<string> => {
  const ai = getAi();
  const langName = getLanguageName(lang);
  const prompt = `As a world-class CX consultant, suggest a short, professional, and creative entry for the field: "${field}" in ${langName}. 
  Context so far: ${context}.
  Make it specific and realistic. Output ONLY the suggested text, nothing else. Language: ${langName}.`;

  const response = await ai.models.generateContent({
    model: MODEL_NAME,
    contents: prompt,
  });
  return response.text?.replace(/^"|"$/g, '') || "";
};

export const generateMission = async (feeling: string, goal: string, problem: string, lang: Language): Promise<string> => {
  const ai = getAi();
  const langName = getLanguageName(lang);
  const prompt = `You are a CX expert named FRONT. Based on these 3 inputs:
  1. Customer feeling: ${feeling}
  2. Business goal: ${goal}
  3. Main problem: ${problem}
  
  Formulate a "Customer Service Mission" in ${langName}. Use this structure:
  "Our mission is to make every customer feel [feeling] through [goal]. Our first goal is to eliminate [problem]."
  Output ONLY the mission text in ${langName}.`;

  const response = await ai.models.generateContent({
    model: MODEL_NAME,
    contents: prompt,
  });
  return response.text || "";
};

export const analyzeJourney = async (channels: string, tools: string, example: string, lang: Language): Promise<string> => {
  const ai = getAi();
  const langName = getLanguageName(lang);
  const prompt = `As a customer journey auditor, analyze channels (${channels}), tools (${tools}) and this example response: "${example}".
  Identify 3 specific pain points in ${langName}. Format as text list.`;

  const response = await ai.models.generateContent({
    model: MODEL_NAME,
    contents: prompt,
  });
  return response.text || "";
};

export const generateManifesto = async (adjectives: string, form: string, forbidden: string, preferred: string, lang: Language): Promise<string> => {
  const ai = getAi();
  const langName = getLanguageName(lang);
  const prompt = `Create a FRONT Communication Manifesto in ${langName}. 
  Adjectives: ${adjectives}. Form: ${form}. Forbidden phrase: ${forbidden}. Preferred phrase: ${preferred}.
  Write 3 key principles in ${langName}.`;

  const response = await ai.models.generateContent({
    model: MODEL_NAME,
    contents: prompt,
  });
  return response.text || "";
};

export const analyzeVoc = async (messages: string, lang: Language): Promise<VocItem[]> => {
  const ai = getAi();
  const langName = getLanguageName(lang);
  const response = await ai.models.generateContent({
    model: MODEL_NAME,
    contents: `Analyze these customer messages: ${messages}. Use 3C analysis (Concern, Cause, Correction) and Systemic Action. Response must be in ${langName}. Return as JSON array of objects.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            problem: { type: Type.STRING },
            cause: { type: Type.STRING },
            response: { type: Type.STRING },
            systemAction: { type: Type.STRING }
          },
          required: ["problem", "cause", "response", "systemAction"]
        }
      }
    }
  });
  
  return JSON.parse(response.text || "[]");
};

export const generateFaq = async (questions: string, lang: Language): Promise<FaqItem[]> => {
  const ai = getAi();
  const langName = getLanguageName(lang);
  const response = await ai.models.generateContent({
    model: MODEL_NAME,
    contents: `Create FAQ for these 5 questions: ${questions}. For each write a clear answer and one proactive action in ${langName}. Return as JSON array.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            question: { type: Type.STRING },
            answer: { type: Type.STRING },
            proactiveAction: { type: Type.STRING }
          },
          required: ["question", "answer", "proactiveAction"]
        }
      }
    }
  });
  
  return JSON.parse(response.text || "[]");
};

export const generateProactiveStrategy = async (context: string, lang: Language): Promise<string> => {
  const ai = getAi();
  const langName = getLanguageName(lang);
  const prompt = `Based on this context: ${context}, identify 2 key proactive moments in ${langName}. For each describe Problem and Proactive Action.`;

  const response = await ai.models.generateContent({
    model: MODEL_NAME,
    contents: prompt,
  });
  return response.text || "";
};
