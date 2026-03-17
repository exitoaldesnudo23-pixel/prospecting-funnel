import React, { useState } from 'react';
import { ChatInterface } from './components/ChatInterface';
import { CalendlyWidget } from './components/CalendlyWidget';
import { motion, AnimatePresence } from 'framer-motion';
import { Key } from 'lucide-react';

function App() {
  const [funnelState, setFunnelState] = useState<'chat' | 'qualified' | 'disqualified'>('chat');
  const [apiKey, setApiKey] = useState(import.meta.env.VITE_OPENROUTER_API_KEY || '');
  const [isConfiguring, setIsConfiguring] = useState(!import.meta.env.VITE_OPENROUTER_API_KEY);

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
      {/* AI Generated Luxury Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-40 mix-blend-screen"
          style={{ backgroundImage: "url('/hero-bg.png')" }}
        ></div>
        {/* Gradients on top for extra depth */}
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-gold-600/5 blur-[120px] mix-blend-screen animate-pulse-slow"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[40%] h-[60%] rounded-full bg-blue-600/5 blur-[120px] mix-blend-screen animate-pulse-slow object-right"></div>
      </div>

      {/* Navbar Premium */}
      <nav className="border-b border-dark-800 bg-dark-900/80 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <div className="text-xl font-black tracking-tight flex items-center gap-2">
             <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center text-dark-900 text-sm">HE</span>
             <span className="bg-clip-text text-transparent bg-gradient-to-r from-gray-100 to-gray-300">Hub de Expansión</span>
          </div>
          <div className="hidden sm:block text-xs font-medium text-gold-400 uppercase tracking-widest border border-gold-500/20 px-3 py-1 rounded-full bg-gold-500/10">
            Apertura de Expansión
          </div>
        </div>
      </nav>

      {/* Main Content: Split Layout (Hero Banner) */}
      <main className="flex-1 container mx-auto px-6 py-12 lg:py-20 relative z-10 flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-20">
        
        {/* Left Column: Copy & Photo */}
        <div className="flex-1 text-center lg:text-left animate-fade-in flex flex-col items-center lg:items-start w-full max-w-2xl">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight mb-6 leading-[1.1]">
              Trabajas duro por tu familia. <br className="hidden sm:block"/>
              <span className="text-gradient">Es hora de que tu esfuerzo te pague bien.</span>
            </h1>
            
            <p className="text-lg sm:text-xl text-gray-400 mb-10 leading-relaxed max-w-xl mx-auto lg:mx-0">
              Estamos buscando personas trabajadoras que quieran mejorar su economía. Si tienes ganas de salir adelante y disposición para aprender, hablemos.
            </p>
          </motion.div>

          {/* User's Photo Card */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="w-full max-w-sm mx-auto lg:mx-0 group relative"
          >
            {/* Glow Effect behind image */}
            <div className="absolute -inset-1 bg-gradient-to-r from-gold-600 to-yellow-400 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
            
            <div className="relative rounded-2xl overflow-hidden border border-dark-700 bg-dark-800 aspect-[5/4] sm:aspect-[4/3] flex items-center justify-center shadow-2xl">
              <img 
                src="/couple.jpg" 
                alt="Directores de Expansión" 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  e.currentTarget.parentElement?.classList.add('fallback-bg');
                }}
              />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-dark-900 via-dark-900/80 to-transparent pt-24 pb-6 px-6">
                <p className="text-gray-100 font-bold text-lg mb-0.5">Nay y Fani</p>
                <p className="text-gold-400 text-sm font-medium">Capacitadores en Liderazgo y Emprendimiento</p>
              </div>
            </div>
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
                  <CalendlyWidget whatsappNumber="8479979255" />
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
          <p>&copy; {new Date().getFullYear()} Hub de Expansión. Una iniciativa comercial privada.</p>
          <p className="mt-2 md:mt-0">Confidencialidad garantizada. Las reuniones son solo por invitación.</p>
        </div>
      </footer>
    </div>
  );
}

export default App;
