
import { GoogleGenAI, Type } from "@google/genai";
import { AIAnalysisResult } from "../types";

export const analyzePhoto = async (base64Image: string): Promise<AIAnalysisResult> => {
  // In Netlify/Browser environments without a bundler, process.env might be undefined.
  // We use a safe check to prevent the app from crashing.
  const apiKey = (typeof process !== 'undefined' && process.env?.API_KEY) || "";
  
  if (!apiKey) {
    console.warn("Gemini API Key is missing. AI features will be disabled.");
    return {
      title: "Untitled Composition",
      category: "Uncategorized",
      description: "AI analysis is currently unavailable (API Key not found)."
    };
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: 'image/jpeg',
              data: base64Image.split(',')[1] || base64Image,
            },
          },
          {
            text: "Analyze this photography piece. Provide a minimal premium title, a single word category (Prefer one of: Portrait, Pre-wed, Kids, Product, Landscape, Street, or Architecture), and a short poetic description.",
          },
        ],
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            category: { type: Type.STRING },
            description: { type: Type.STRING },
          },
          required: ["title", "category", "description"],
        },
      },
    });

    return JSON.parse(response.text || '{}') as AIAnalysisResult;
  } catch (e) {
    console.error("AI Analysis failed:", e);
    return {
      title: "Untitled Composition",
      category: "Uncategorized",
      description: "A moment captured in light."
    };
  }
};
