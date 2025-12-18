
import { GoogleGenAI, Type } from "@google/genai";
import { VocItem, FaqItem } from "../types";

const MODEL_NAME = 'gemini-3-pro-preview';

const getAi = () => new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const generateMission = async (feeling: string, goal: string, problem: string): Promise<string> => {
  const ai = getAi();
  const prompt = `Jesteś ekspertem CX o imieniu FRONT. Na podstawie tych 3 odpowiedzi:
  1. Uczucie klienta: ${feeling}
  2. Cel biznesowy: ${goal}
  3. Główny problem: ${problem}
  
  Sformułuj "Misję Obsługi Klienta" dokładnie w tym formacie:
  "Naszą misją jest sprawić, aby każdy klient po kontakcie z nami czuł się [uczucie], poprzez [cel]. Naszym pierwszym celem jest wyeliminowanie problemu z [problem]."
  Pisz po polsku.`;

  const response = await ai.models.generateContent({
    model: MODEL_NAME,
    contents: prompt,
  });
  return response.text || "";
};

export const analyzeJourney = async (channels: string, tools: string, example: string): Promise<string> => {
  const ai = getAi();
  const prompt = `Jesteś audytorem podróży klienta. Przeanalizuj kanały (${channels}), narzędzia (${tools}) i tę odpowiedź: "${example}".
  Wskaż 3 konkretne punkty bólu (Ból #1, Ból #2, Ból #3) w formacie tekstowym po polsku.`;

  const response = await ai.models.generateContent({
    model: MODEL_NAME,
    contents: prompt,
  });
  return response.text || "";
};

export const generateManifesto = async (adjectives: string, form: string, forbidden: string, preferred: string): Promise<string> => {
  const ai = getAi();
  const prompt = `Stwórz Manifest Komunikacji FRONT. 
  Przymiotniki: ${adjectives}. Forma: ${form}. Zakazany zwrot: ${forbidden}. Pożądany zwrot: ${preferred}.
  Zasady powinny być sformułowane w 3 punktach. Pisz po polsku.`;

  const response = await ai.models.generateContent({
    model: MODEL_NAME,
    contents: prompt,
  });
  return response.text || "";
};

export const analyzeVoc = async (messages: string): Promise<VocItem[]> => {
  const ai = getAi();
  const response = await ai.models.generateContent({
    model: MODEL_NAME,
    contents: `Przeanalizuj te wiadomości od klientów: ${messages}. Zastosuj analizę 3C (Concern, Cause, Correction) oraz dodatkowo Działanie Systemowe. Zwróć dane w formacie JSON jako tablicę obiektów.`,
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

export const generateFaq = async (questions: string): Promise<FaqItem[]> => {
  const ai = getAi();
  const response = await ai.models.generateContent({
    model: MODEL_NAME,
    contents: `Stwórz sekcję FAQ dla tych 5 pytań: ${questions}. Dla każdego napisz klarowną odpowiedź i jedną akcję proaktywną. Zwróć jako JSON.`,
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

export const generateProactiveStrategy = async (context: string): Promise<string> => {
  const ai = getAi();
  const prompt = `Na podstawie całego kontekstu współpracy: ${context}, zidentyfikuj 2 kluczowe momenty proaktywne (Moment #1 i Moment #2). Dla każdego opisz Problem i Działanie Proaktywne. Pisz po polsku.`;

  const response = await ai.models.generateContent({
    model: MODEL_NAME,
    contents: prompt,
  });
  return response.text || "";
};
