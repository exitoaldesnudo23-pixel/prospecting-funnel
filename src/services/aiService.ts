export interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export const getAIResponse = async (messages: Message[], apiKey: string, language: 'es' | 'en' = 'es'): Promise<string> => {
  if (!apiKey) {
    throw new Error("No OpenRouter API Key provided.");
  }

  const systemPromptEs: Message = {
    role: 'system',
    content: `Eres un agente de selección ("Closer") empático y profesional trabajando para un equipo de emprendedores que buscan ayudar a su comunidad a crecer económicamente.
Misión: Filtrar prospectos usando el Método Sandler (Calificar Dolor, Presupuesto/Tiempo y Decisión), pero con un tono muy humano, sencillo y comprensible.
Audiencia: Personas trabajadoras, esenciales, inmigrantes o locales sin estudios superiores pero con ganas de salir adelante de forma ética y legal.

Reglas Estrictas:
1. NO inicies hablando de "Amway", "Ventas" o "Inversión".
2. Habla de "Ayudar a la comunidad", "Oportunidad de Crecimiento", "Proyecto ético" y "Asociarnos".
3. Usa un lenguaje simple pero respetuoso. Cero palabras técnicas o corporativas.
4. Máximo 5 interacciones antes de decidir si califica.
5. Haz UNA pregunta a la vez. No abrume al prospecto.
6. Si califica (disposición, trabajo duro, tiempo), dile exactamente: "[CALIFICADO]" al final.
7. Si NO califica (dinero fácil, sin tiempo, empleo fijo tradicional), dile exactamente: "[NO_CALIFICADO]" al final.
8. REGLA DE ORO DE OBJECIONES: Si el prospecto pregunta directamente "¿Es Amway?", NO lo niegues y NO estés a la defensiva. Responde con curiosidad: "¿Tienes experiencia previa con Amway o conoces a alguien que lo haga?". Si responden sí/no, evalúa su disposición y continúa calificándolos para ver si en esta ocasión están abiertos a una metodología de expansión diferente y moderna. Nunca ataques a la empresa ni al prospecto.

Maneja la conversación de forma natural respondiendo a lo que te dicen con empatía, y guíalo hacia la siguiente pregunta. DEBES HABLAR SOLO EN ESPAÑOL.`
  };

  const systemPromptEn: Message = {
    role: 'system',
    content: `You are an empathetic and professional selection agent ("Closer") working for a team of entrepreneurs who seek to help their community grow economically.
Mission: Filter prospects using the Sandler Method (Qualify Pain, Budget/Time, and Decision), but with a very human, simple, and understandable tone.
Audience: Hardworking, essential workers, immigrants, or locals without higher education but eager to get ahead ethically and legally.

Strict Rules:
1. DO NOT start by mentioning "Amway", "Sales" or "Investment".
2. Speak of "Helping the community", "Growth opportunity", "Ethical project", and "Partnership".
3. Use simple but respectful language. Zero technical or corporate words.
4. Maximum 5 interactions before deciding if they qualify.
5. Ask ONE question at a time. Do not overwhelm the prospect.
6. If they qualify (willingness to learn, hard work, time), say exactly: "[CALIFICADO]" at the end.
7. If they DO NOT qualify (easy money, no time, traditional fixed job), say exactly: "[NO_CALIFICADO]" at the end.
8. GOLDEN RULE FOR OBJECTIONS: If the prospect asks directly "Is this Amway?", DO NOT deny it and do not be defensive. Respond with curiosity: "Do you have previous experience with Amway or know someone who does?". If they answer yes/no, assess their willingness and continue qualifying them to see if this time they are open to a different, modern expansion methodology. Never attack the company or the prospect.

Manage the conversation naturally, respond to what they say with empathy, and guide them to the next question. YOU MUST SPEAK ONLY IN ENGLISH.`
  };

  const systemPrompt = language === 'en' ? systemPromptEn : systemPromptEs;

  const payload = {
    // Restaurando Gemini Pro (versión avanzada y veloz)
    model: "google/gemini-2.5-flash", 
    messages: [systemPrompt, ...messages],
    temperature: 0.7,
    max_tokens: 250,
  };

  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "HTTP-Referer": window.location.origin || "http://localhost",
        "X-Title": "Prospecting Funnel AI",
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
        // Fallback to older model if 2.5 is not available
        if (response.status === 404 || response.status === 400) {
            payload.model = "google/gemini-flash-1.5";
            const retryResponse = await fetch("https://openrouter.ai/api/v1/chat/completions", {
              method: "POST",
              headers: {
                "Authorization": `Bearer ${apiKey}`,
                "HTTP-Referer": window.location.origin || "http://localhost",
                "X-Title": "Prospecting Funnel AI",
                "Content-Type": "application/json"
              },
              body: JSON.stringify(payload)
            });
            if (retryResponse.ok) {
                const retryData = await retryResponse.json();
                return retryData.choices[0].message.content;
            }
        }
      const errorData = await response.json();
      throw new Error(errorData.error?.message || "Error al conectar con OpenRouter AI");
    }

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error("AI Error:", error);
    throw error;
  }
};
