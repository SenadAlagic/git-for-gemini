import { GoogleGenAI } from "@google/genai";
import type { GeminiMessage } from "./hooks/useEngine";

const ai = new GoogleGenAI({
  apiKey: import.meta.env.VITE_API_KEY,
});

const formattedContents = (messages: GeminiMessage[]) => {
  return messages.map((message) => ({
    role: message.role === "model" ? "model" : "user",
    parts: [{ text: message.text }],
  }));
};

export const holdConversation = async (messages: GeminiMessage[]) => {
  console.log(messages);
  const chat = await ai.models.generateContent({
    model: "gemini-3.5-flash-lite", // gemini-3.5-flash-lite, gemini-3.1-flash-lite
    contents: formattedContents(messages),
  });
  return chat.text;
};
