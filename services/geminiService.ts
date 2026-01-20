
import { GoogleGenAI, Type } from "@google/genai";
import { AIAnalysisResult } from "../types";

export const analyzePhoto = async (base64Image: string): Promise<AIAnalysisResult> => {
  const apiKey = process.env.API_KEY;
  
  if (!apiKey) {
    console.error("Gemini API Key is missing. Please set API_KEY in your environment variables.");
    return {
      title: "Untitled Composition",
      category: "Uncategorized",
      description: "Please configure the API key to enable AI descriptions."
    };
  }

  const ai = new GoogleGenAI({ apiKey });
  
  try {
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
