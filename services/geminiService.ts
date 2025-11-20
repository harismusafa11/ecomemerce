import { GoogleGenAI, Chat } from "@google/genai";

// Fix: Updated GoogleGenAI initialization to follow coding guidelines.
// The API key is sourced directly from process.env.API_KEY and is assumed to be present.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const chatInstances: { [key: string]: Chat } = {};

const getSystemInstruction = (locale: string) => {
    if (locale === 'en') {
        return `You are a friendly and helpful customer service assistant for an e-commerce store called "Tapak Pamungkas". 
    This store sells traditional and mystical items from Indonesian culture, like 'Pusaka' (heirlooms/keris), accessories, ritual oils, and traditional clothing. 
    Your role is to answer customer questions about products, the store, and policies. Be concise, polite, and knowledgeable about the store's theme. 
    Do not answer questions that are not related to "Tapak Pamungkas" or its products. Respond in English.`;
    }
    // Default to Indonesian
    return `You are a friendly and helpful customer service assistant for an e-commerce store called "Tapak Pamungkas". 
    This store sells traditional and mystical items from Indonesian culture, like 'Pusaka' (heirlooms/keris), accessories, ritual oils, and traditional clothing. 
    Your role is to answer customer questions about products, the store, and policies. Be concise, polite, and knowledgeable about the store's theme. 
    Do not answer questions that are not related to "Tapak Pamungkas" or its products. Respond in Indonesian.`;
};


const getChatInstance = (locale: string): Chat => {
    if (!chatInstances[locale]) {
        console.log(`Creating new chat instance for locale: ${locale}`);
        chatInstances[locale] = ai.chats.create({
          model: 'gemini-2.5-flash',
          config: {
            systemInstruction: getSystemInstruction(locale),
          },
        });
    }
    return chatInstances[locale];
};


export const sendMessageToGemini = async (message: string, locale: string): Promise<string> => {
  try {
    const chat = getChatInstance(locale);
    const response = await chat.sendMessage({ message });
    return response.text;
  } catch (error) {
    console.error("Error communicating with Gemini API:", error);
    if (locale === 'en') {
        return "Sorry, I'm having some trouble right now. Please try again later.";
    }
    return "Maaf, saya sedang mengalami gangguan. Silakan coba lagi nanti.";
  }
};