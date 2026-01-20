
import { GoogleGenAI, Type } from "@google/genai";
import { AIAnalysisResult } from "../types";

/**
 * Robust API key retrieval for browser environments.
 */
const getSafeApiKey = (): string => {
  try {
    // We use a string check for 'process' to avoid ReferenceErrors in strict environments
    if (typeof window !== 'undefined' && (window as any).process?.env?.API_KEY) {
      return (window as any).process.env.API_KEY;
    }
    // Fallback for typical build-time injection or environment variable patterns
    // @ts-ignore
    if (typeof process !== 'undefined' && process.env?.API_KEY) {
      // @ts-ignore
      return process.env.API_KEY;
    }
  } catch (e) {
    // Ignore errors in detection
  }
  return "";
};

export const analyzePhoto = async (base64Image: string): Promise<AIAnalysisResult> => {
  const apiKey = getSafeApiKey();

  if (!apiKey) {
    console.warn("Gemini API Key is missing. Using fallback metadata.");
    return {
      title: "New Capture",
      category: "Archive",
      description: "A moment preserved in the gallery."
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

    const text = response.text;
    return JSON.parse(text || '{}') as AIAnalysisResult;
  } catch (e) {
    console.error("AI Analysis failed:", e);
    return {
      title: "Untitled Composition",
      category: "General",
      description: "Captured light and shadow."
    };
  }
};
