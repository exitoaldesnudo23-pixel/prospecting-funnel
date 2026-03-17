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
  content: "¡Hola! Qué gusto que estés aquí. Te cuento rápido: estamos buscando a latinos con ganas reales de salir adelante y mejorar su economía con una oportunidad real. Para saber si este perfil es para ti, te haré un par de preguntas muy sencillas y así iré aprendiendo más sobre ti. Pero primero, ¿cuál es tu nombre?"
};

const INITIAL_MESSAGE_EN: Message = {
  role: 'assistant',
  content: "Hi there! I'm glad you're here. Quick intro: we are looking for hardworking people willing to improve their economy through a real opportunity. To see if this aligns with you, I'll ask a couple of simple questions and learn more about your profile as we talk. But first, what is your name?"
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
      
      let cleanResponse = response;
      if (response.includes('[CALIFICADO]')) {
        setTimeout(onQualify, 2000);
        cleanResponse = language === 'en' 
          ? "Excellent! Your profile perfectly matches our work ethic. I will prepare the details for you."
          : "¡Excelente! Tu perfil encaja perfectamente con nuestra ética de trabajo. Voy a prepararte los detalles.";
      } else if (response.includes('[NO_CALIFICADO]')) {
        setTimeout(onDisqualify, 2000);
        cleanResponse = language === 'en'
          ? "I appreciate your time. At this moment, we are looking for profiles with a different alignment. I wish you success."
          : "Aprecio tu tiempo. En este momento, buscamos perfiles con una alineación diferente. Te deseo mucho éxito.";
      }

      setMessages(prev => [...prev, { role: 'assistant', content: cleanResponse }]);
    } catch (error: any) {
      setMessages(prev => [...prev, { role: 'assistant', content: language === 'en' ? `Connection error: ${error.message}` : `Error de conexión: ${error.message}` }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto glass rounded-2xl overflow-hidden flex flex-col h-[600px] border border-dark-700 shadow-2xl relative">
      {/* Premium Header */}
      <div className="bg-dark-800/80 backdrop-blur-md p-4 border-b border-dark-700 flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-gold-600 to-gold-400 flex items-center justify-center shadow-[0_0_15px_rgba(212,175,55,0.4)]">
            <UserRound className="text-dark-900" size={20} />
          </div>
          <div>
            <h2 className="text-gray-100 font-semibold text-lg flex items-center gap-2">
              {language === 'en' ? 'Expansion Assistant' : 'Asistente de Expansión'} <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            </h2>
            <p className="text-xs text-gray-400">Hub de Expansión • {language === 'en' ? 'Regional Infrastructure' : 'Infraestructura Regional'}</p>
          </div>
        </div>
      </div>

      {/* Language Selector Output (If not selected) */}
      {!language ? (
        <div className="flex-1 flex items-center justify-center p-6 bg-dark-900/50">
           <div className="text-center w-full max-w-sm">
             <h3 className="text-xl font-bold text-gray-100 mb-2">¡Bienvenido! / Welcome!</h3>
             <p className="text-sm text-gray-400 mb-8">Selecciona tu idioma para comenzar / Select your language to start</p>
             <div className="flex flex-col gap-4">
                <button 
                  onClick={() => { setLanguage('es'); setMessages([INITIAL_MESSAGE_ES]); }}
                  className="w-full bg-dark-800 hover:bg-dark-700 border border-dark-600 text-gray-100 py-4 rounded-xl font-medium transition-all hover:border-gold-500/50 hover:shadow-[0_0_15px_rgba(212,175,55,0.15)]"
                >
                  Español
                </button>
                <button 
                  onClick={() => { setLanguage('en'); setMessages([INITIAL_MESSAGE_EN]); }}
                  className="w-full bg-dark-800 hover:bg-dark-700 border border-dark-600 text-gray-100 py-4 rounded-xl font-medium transition-all hover:border-gold-500/50 hover:shadow-[0_0_15px_rgba(212,175,55,0.15)]"
                >
                  English
                </button>
             </div>
           </div>
        </div>
      ) : (
        <>
          {/* Chat Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-dark-900/50">
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
                className={`max-w-[85%] rounded-2xl p-4 text-sm leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-gradient-to-br from-gold-600 to-gold-500 text-dark-900 rounded-tr-none font-medium'
                    : 'glass-gold text-gray-100 rounded-tl-none border border-gold-500/20'
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
              <div className="glass-gold py-3 px-4 rounded-2xl rounded-tl-none border border-gold-500/20 flex gap-1 items-center">
                <span className="w-1.5 h-1.5 bg-gold-400 rounded-full animate-bounce"></span>
                <span className="w-1.5 h-1.5 bg-gold-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                <span className="w-1.5 h-1.5 bg-gold-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-4 bg-dark-800/80 backdrop-blur-md border-t border-dark-700 w-full relative z-20">
            <div className="relative flex items-center">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder={language === 'en' ? "Type your response..." : "Escribe tu respuesta..."}
                className="w-full bg-dark-900 border border-dark-600 rounded-full px-5 py-3 pr-12 text-sm text-gray-200 focus:outline-none focus:border-gold-500/50 focus:ring-1 focus:ring-gold-500/50 transition-all placeholder:text-gray-500"
                disabled={isLoading}
              />
              <button
                onClick={handleSend}
                disabled={isLoading || !input.trim()}
                className="absolute right-2 p-2 bg-gradient-to-r from-gold-600 to-gold-400 text-dark-900 rounded-full hover:shadow-[0_0_10px_rgba(212,175,55,0.4)] transition-all disabled:opacity-50"
              >
                <Send size={16} />
              </button>
            </div>
            <p className="text-center text-[10px] text-gray-500 mt-2">
              {language === 'en' ? 'Private Expansion Opportunity' : 'Oportunidad de Expansión Privada'} &copy; {new Date().getFullYear()}
            </p>
          </div>
        </>
      )}
    </div>
  );
};
