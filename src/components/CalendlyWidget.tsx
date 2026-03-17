import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, MessageCircle, ArrowRight } from 'lucide-react';

interface CalendlyWidgetProps {
  calendlyLink?: string; // Fallback or direct link if embed fails
  whatsappNumber: string;
}

export const CalendlyWidget: React.FC<CalendlyWidgetProps> = ({ whatsappNumber }) => {
  const wsLink = `https://wa.me/1${whatsappNumber.replace(/[^0-9]/g, '')}?text=${encodeURIComponent("Hola Nay, estoy list@ para la reunión. Ya completé la encuesta.")}`;

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-2xl mx-auto glass-gold rounded-2xl overflow-hidden shadow-[0_0_40px_rgba(212,175,55,0.15)] flex flex-col items-center p-8 text-center"
    >
      <div className="w-16 h-16 bg-gradient-to-tr from-gold-600 to-gold-400 rounded-full flex items-center justify-center mb-6 shadow-lg shadow-gold-500/20">
        <Calendar className="text-dark-900" size={32} />
      </div>
      
      <h2 className="text-3xl font-bold text-gray-100 mb-4">
        ¡Felicidades, tu perfil ha <span className="text-gradient">calificado</span>!
      </h2>
      
      <p className="text-gray-400 text-base mb-8 max-w-md">
        Basado en tus respuestas, cumples con el perfil de liderazgo y disposición que buscamos. El siguiente paso es una breve llamada para conocernos.
      </p>

      {/* Calendly Inline Widget - Placeholder since user didn't give strict link yet */}
      <div className="w-full bg-dark-900/50 rounded-xl p-6 border border-dark-600 mb-8">
         <p className="text-sm text-gray-400 mb-4">Selecciona el mejor horario para nuestra llamada estratégica:</p>
         <a 
          href="https://calendly.com/nayfani08/30min" 
          target="_blank" 
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-3 rounded-lg transition-colors w-full justify-center"
         >
           <Calendar size={18} />
           Abrir Calendario (Calendly)
         </a>
      </div>

      <div className="flex items-center gap-4 w-full">
        <div className="h-px bg-dark-600 flex-1"></div>
        <span className="text-xs text-gray-500 uppercase tracking-widest">Opción Directa</span>
        <div className="h-px bg-dark-600 flex-1"></div>
      </div>

      <a 
        href={wsLink}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-8 flex items-center gap-3 bg-[#25D366] hover:bg-[#20bd5a] text-white px-8 py-4 rounded-xl font-bold text-lg shadow-[0_0_20px_rgba(37,211,102,0.3)] transition-all hover:scale-105"
      >
        <MessageCircle size={24} />
        Contactar por WhatsApp
        <ArrowRight size={20} className="ml-2" />
      </a>
      
      <p className="text-xs text-gray-500 mt-6">
        Tu información será tratada de forma confidencial. Al agendar, confirmas tu interés en evaluar esta oportunidad comercial.
      </p>
    </motion.div>
  );
};
