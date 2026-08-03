import { GoogleGenAI } from "@google/genai";
import type { GeminiMessage } from "./useGraphEngine";

const ai = new GoogleGenAI({
  apiKey: import.meta.env.VITE_API_KEY,
});

export const holdConversation = async (messages: GeminiMessage[]) => {
  const chat = await ai.models.generateContent({
    model: "gemini-3.6-flash",
    contents: messages,
  });
  return chat.text;
};
