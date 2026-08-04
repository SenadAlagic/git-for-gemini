import { GoogleGenAI } from "@google/genai";
import type { GeminiMessage } from "./useGraphEngine";

const ai = new GoogleGenAI({
  apiKey: import.meta.env.VITE_API_KEY,
});

export const holdConversation = async (messages: GeminiMessage[]) => {
  const chat = await ai.models.generateContent({
    model: "gemini-3.5-flash-lite", // gemini-3.5-flash-lite, gemini-3.1-flash-lite
    contents: messages,
  });
  return chat.text;
};
