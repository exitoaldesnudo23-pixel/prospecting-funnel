import React, { useState, useRef, useEffect } from 'react';
import { Send, UserRound } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getAIResponse, Message } from '../services/aiService';

interface ChatInterfaceProps {
  onQualify: () => void;
  onDisqualify: () => void;
  apiKey: string;
}

const INITIAL_MESSAGE_ES: Message = {
  role: 'assistant',
  content: "¡Hola! Soy Alex 👋 Qué bueno que estés aquí. Para empezar, ¿me puedes decir tu nombre y cómo llegaste a este chat? ¿Fue por un flyer, un anuncio o te lo compartió Nay o Fani?"
};

const INITIAL_MESSAGE_EN: Message = {
  role: 'assistant',
  content: "Hi! I'm Alex 👋 Glad you're here. To get started, can you tell me your name and how you found us? Was it through a flyer, an ad, or did Nay or Fani share this with you?"
};

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ onQualify, onDisqualify, apiKey }) => {
  const [language, setLanguage] = useState<'es' | 'en' | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg: Message = { role: 'user', content: input.trim() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const chatHistory = [...messages, userMsg].map(m => ({ role: m.role, content: m.content }));
      
      // Pass the selected language strictly to the AI service
      const response = await getAIResponse(chatHistory, apiKey, language || 'es');
      
      // Simulate typing delay based on response length (make it feel human)
      const words = response.split(' ').length;
      const delayMs = Math.min(Math.max(words * 60, 2000), 5000); // Increased delay
      await new Promise(resolve => setTimeout(resolve, delayMs));
      
      let cleanResponse = response;
      if (response.includes('[CALIFICADO]')) {
        // Extraer el JSON oculto
        const jsonMatch = response.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          try {
            // Limpiar posibles backticks de markdown que el LLM a veces incluye
            const cleanJson = jsonMatch[0].replace(/^```json\s*/i, '').replace(/\s*```$/, '').trim();
            const data = JSON.parse(cleanJson);
            console.log("Parsed AI Payload:", data);
            
            // Hacer la petición directa al backend de agendamiento (Vercel)
            // Se usa la URL absoluta para que funcione incluso si prueban en localhost
            fetch('https://nayfani08.com/api/schedule', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                date: data.fecha_iso ? data.fecha_iso.split('T')[0] : new Date().toISOString().split('T')[0],
                time: data.hora_legible || '4:00 PM', // Fallback
                phone: data.telefono,
                timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
              }),
            }).then(res => res.json()).then(res => console.log('Schedule API:', res)).catch(console.error);

          } catch (e) {
            console.error("Error parsing JSON from AI", e, "Raw output:", jsonMatch[0]);
          }
        }
        
        // Limpiar el mensaje para no mostrar la etiqueta ni el JSON al usuario
        cleanResponse = response.replace(/\[CALIFICADO\][\s\S]*$/, '').trim();
        // Disparamos la transición al calendario
        setTimeout(onQualify, 2500);
      } else if (response.includes('[NO_CALIFICADO]')) {
        setTimeout(onDisqualify, 3000);
        cleanResponse = response.replace(/\[NO_CALIFICADO\]/g, '').trim();
        if (!cleanResponse) {
          cleanResponse = language === 'en'
            ? "I appreciate your time. At this moment, we are looking for profiles with a different alignment. I wish you success."
            : "Aprecio tu tiempo. En este momento, buscamos perfiles con una alineación diferente. Te deseo mucho éxito.";
        }
      }

      setMessages(prev => [...prev, { role: 'assistant', content: cleanResponse }]);
    } catch (error: any) {
      setMessages(prev => [...prev, { role: 'assistant', content: language === 'en' ? `Connection error: ${error.message}` : `Error de conexión: ${error.message}` }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto bg-dark-900/40 backdrop-blur-xl rounded-3xl overflow-hidden flex flex-col h-[600px] border border-white/10 shadow-[0_16px_40px_rgba(0,0,0,0.5)] relative">
      {/* Premium Header */}
      <div className="bg-transparent p-6 pb-2 text-center z-10">
        <h2 className="text-white font-bold text-2xl mb-1">
          Bienvenido
        </h2>
      </div>

      {/* Language Selector Output (If not selected) */}
      {!language ? (
        <div className="flex-1 flex items-center justify-center p-6 bg-transparent">
           <div className="text-center w-full max-w-sm">
             <h3 className="text-lg font-bold text-white mb-2">How can we help? / ¿Cómo podemos ayudarte?</h3>
             <p className="text-xs text-gray-300 mb-8">Selecciona tu idioma / Select your language</p>
             <div className="flex flex-row justify-center gap-4">
                <button 
                  onClick={() => { setLanguage('es'); setMessages([INITIAL_MESSAGE_ES]); }}
                  className="flex-1 bg-white/10 hover:bg-white/20 border border-white/30 text-white py-3 rounded-xl font-medium transition-all"
                >
                  Español
                </button>
                <button 
                  onClick={() => { setLanguage('en'); setMessages([INITIAL_MESSAGE_EN]); }}
                  className="flex-1 bg-white/10 hover:bg-white/20 border border-white/30 text-white py-3 rounded-xl font-medium transition-all"
                >
                  English
                </button>
             </div>
           </div>
        </div>
      ) : (
        <>
          {/* Chat Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-transparent border-t border-white/10 mt-4">
        <AnimatePresence>
          {messages.map((msg, idx) => (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              key={idx}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl p-4 text-sm leading-relaxed shadow-sm ${
                  msg.role === 'user'
                    ? 'bg-white/20 text-white rounded-tr-none font-medium'
                    : 'bg-black/30 backdrop-blur-md border border-white/10 text-white rounded-tl-none'
                }`}
              >
                {msg.content}
              </div>
            </motion.div>
          ))}
          {isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex justify-start"
            >
              <div className="bg-black/30 backdrop-blur-md py-3 px-4 rounded-2xl rounded-tl-none border border-white/10 flex gap-1 items-center">
                <span className="w-1.5 h-1.5 bg-white rounded-full animate-bounce"></span>
                <span className="w-1.5 h-1.5 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                <span className="w-1.5 h-1.5 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-4 bg-black/40 backdrop-blur-md border-t border-white/10 w-full relative z-20">
            <div className="relative flex items-center">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder={language === 'en' ? "Type your response..." : "Escribe tu respuesta..."}
                className="w-full bg-white/10 border border-white/20 rounded-lg px-5 py-3 pr-12 text-sm text-white focus:outline-none focus:ring-2 focus:ring-gold-400 transition-all placeholder:text-gray-300 shadow-inner"
                disabled={isLoading}
              />
              <button
                onClick={handleSend}
                disabled={isLoading || !input.trim()}
                className="absolute right-2 p-2 bg-white/20 text-white rounded-md hover:bg-white/30 transition-all disabled:opacity-50"
              >
                <Send size={16} />
              </button>
            </div>
            <p className="text-center text-[10px] text-gray-400 mt-3 font-medium tracking-wide">
              {language === 'en' ? 'Nay & Fani · Private Invitation' : 'Nay & Fani · Por invitación'} &copy; {new Date().getFullYear()}
            </p>
          </div>
        </>
      )}
    </div>
  );
};
