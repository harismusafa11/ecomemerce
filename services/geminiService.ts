const getFallback = (locale: string) => {
    if (locale === 'en') {
        return "Sorry, I'm having some trouble right now. Please try again later.";
    }
    return "Maaf, saya sedang mengalami gangguan. Silakan coba lagi nanti.";
};

export const sendMessageToGemini = async (message: string, locale: string): Promise<string> => {
  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, locale }),
    });
    if (!response.ok) return getFallback(locale);
    const data = await response.json();
    return data.text || getFallback(locale);
  } catch (error) {
    console.error("Error communicating with Gemini API:", error);
    return getFallback(locale);
  }
};
