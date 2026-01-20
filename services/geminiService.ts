
import { GoogleGenAI, Type } from "@google/genai";
import { AIAnalysisResult } from "../types";

export const analyzePhoto = async (base64Image: string): Promise<AIAnalysisResult> => {
  // In a browser environment without a bundler, we must safely check for process.env
  // Netlify provides these via a special injection or we fall back to an empty string
  let apiKey = "";
  try {
    if (typeof process !== 'undefined' && process.env && process.env.API_KEY) {
      apiKey = process.env.API_KEY;
    }
  } catch (e) {
    console.warn("Could not access process.env.API_KEY directly.");
  }

  if (!apiKey) {
    console.warn("Gemini API Key is missing. AI features will use fallback metadata.");
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
