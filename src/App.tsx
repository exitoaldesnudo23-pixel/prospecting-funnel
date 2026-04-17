import React, { useState } from 'react';
import { ChatInterface } from './components/ChatInterface';
import { BookingWidget } from './components/BookingWidget';
import { motion, AnimatePresence } from 'framer-motion';
import { Key } from 'lucide-react';

function App() {
  const [funnelState, setFunnelState] = useState<'chat' | 'qualified' | 'disqualified'>('chat');
  const [apiKey, setApiKey] = useState(import.meta.env.VITE_OPENROUTER_API_KEY || '');
  const [isConfiguring, setIsConfiguring] = useState(false); // Temporarily bypassed: !import.meta.env.VITE_OPENROUTER_API_KEY);

  const handleQualify = () => setFunnelState('qualified');
  const handleDisqualify = () => setFunnelState('disqualified');

  if (isConfiguring) {
    return (
      <div className="min-h-screen bg-dark-900 flex items-center justify-center p-4">
        <div className="glass-gold p-8 rounded-2xl max-w-md w-full">
          <div className="flex items-center gap-3 mb-6 relative">
             <Key className="text-gold-500" size={24} />
             <h2 className="text-xl font-bold text-gray-100">Configuración de AI</h2>
          </div>
          <p className="text-sm text-gray-400 mb-6">
            Para que el asistente de selección ("Closer 24/7") funcione, ingresa tu API Key de OpenRouter. Esta llave <b>solo se usa localmente en tu navegador</b> para esta demo.
          </p>
          <input 
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="sk-or-v1-..."
            className="w-full bg-dark-800 border border-dark-600 rounded-lg px-4 py-3 text-gray-200 mb-4 focus:outline-none focus:border-gold-500"
          />
          <button 
            onClick={() => setIsConfiguring(false)}
            disabled={!apiKey.trim()}
            className="w-full bg-gradient-to-r from-gold-600 to-gold-400 text-dark-900 font-bold py-3 rounded-lg disabled:opacity-50"
          >
            Comenzar Embudo
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-900 flex flex-col relative overflow-x-hidden font-sans">
      {/* Background Photo */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: "url('/tafolla.png')" }}
        ></div>
        {/* Dark overlay for readability - reduced darkness by 70% for more life */}
        <div className="absolute inset-0 bg-gradient-to-t from-dark-900/50 via-dark-900/20 to-dark-900/40"></div>
        
        {/* Subtle gold/blue glows */}
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-gold-600/5 blur-[120px] animate-pulse-slow"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[40%] h-[60%] rounded-full bg-blue-600/5 blur-[120px] animate-pulse-slow"></div>
      </div>

      {/* Navbar */}
      <nav className="border-b border-dark-800/50 bg-dark-900/60 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <div className="text-xl font-black tracking-tight flex items-center gap-2">
             <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center text-dark-900 text-sm font-bold">NF</span>
             <span className="bg-clip-text text-transparent bg-gradient-to-r from-gray-100 to-gray-300">Nay &amp; Fani</span>
          </div>
          <div className="hidden sm:block text-xs font-medium text-gold-400 uppercase tracking-widest border border-gold-500/20 px-3 py-1 rounded-full bg-gold-500/10">
            Por Invitación
          </div>
        </div>
      </nav>

      {/* Main Content: Split Layout (Hero Banner) */}
      <main className="flex-1 container mx-auto px-6 py-12 lg:py-20 relative z-10 flex flex-col lg:flex-row-reverse items-center justify-between gap-12 lg:gap-24">
        
        {/* Right Column: Copy (Now visually on the right due to flex-row-reverse) */}
        <div className="flex-1 text-center lg:text-left animate-fade-in flex flex-col justify-center w-full max-w-2xl">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-4 leading-[1.1] text-white drop-shadow-[0_4px_10px_rgba(0,0,0,0.6)]">
              Trabajas duro por tu familia.
            </h1>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-light italic tracking-wide mb-8 leading-[1.3] text-gold-400 drop-shadow-[0_4px_10px_rgba(0,0,0,0.6)]">
              Es hora de que tu esfuerzo te pague bien.
            </h2>
            
            <p className="text-base sm:text-lg text-gray-100 mb-10 leading-relaxed max-w-lg mx-auto lg:mx-0 font-medium drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)] bg-dark-900/20 p-4 rounded-xl backdrop-blur-sm border border-white/5">
              Estamos buscando personas trabajadoras que quieran mejorar su economía. Si tienes ganas de salir adelante y disposición para aprender, hablemos.
            </p>
          </motion.div>
        </div>

        {/* Right Column: AI Chat Funnel */}
        <div className="flex-1 w-full max-w-[600px] relative">
          <div className="absolute inset-0 bg-gold-600/5 blur-[80px] rounded-full"></div>
          
          <div className="relative z-10 w-full animate-slide-up" style={{ animationDelay: '0.3s' }}>
            <AnimatePresence mode="wait">
              {funnelState === 'chat' && (
                <motion.div 
                  key="chat"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.95, filter: 'blur(5px)' }}
                >
                  <ChatInterface 
                    onQualify={handleQualify} 
                    onDisqualify={handleDisqualify} 
                    apiKey={apiKey}
                  />
                </motion.div>
              )}

              {funnelState === 'qualified' && (
                <motion.div
                  key="qualified"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                >
                  <BookingWidget whatsappNumber="8479979255" />
                </motion.div>
              )}

              {funnelState === 'disqualified' && (
                <motion.div 
                  key="disqualified"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="w-full p-8 md:p-12 rounded-2xl glass text-center border-dark-600 shadow-xl"
                >
                  <div className="text-gray-400 mb-6 flex justify-center">
                    <svg className="w-20 h-20 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-200 mb-4">Proceso Finalizado</h2>
                  <p className="text-base text-gray-400 leading-relaxed">
                    Agradecemos mucho tu tiempo. Tras evaluar las respuestas, hemos determinado que en esta fase específica del proyecto, los tiempos o el enfoque actual no se alinean completamente. Te deseamos mucho éxito y crecimiento en todas tus metas actuales.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

      </main>
      
      {/* Footer */}
      <footer className="border-t border-dark-800 bg-dark-900/60 mt-auto">
        <div className="container mx-auto px-6 py-8 flex flex-col md:flex-row items-center justify-between text-xs text-gray-600">
          <p>&copy; {new Date().getFullYear()} Nay &amp; Fani. Una oportunidad de crecimiento personal.</p>
          <p className="mt-2 md:mt-0">Confidencialidad garantizada. Las reuniones son solo por invitación.</p>
        </div>
      </footer>
    </div>
  );
}

export default App;
