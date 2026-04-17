import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Clock, CheckCircle, Loader } from 'lucide-react';

const API_URL = 'https://deploy-netlify-delta.vercel.app/api/sistema-vision';

const HORARIOS = [
  '9:00 AM', '10:00 AM', '11:00 AM',
  '12:00 PM', '1:00 PM', '2:00 PM',
  '3:00 PM', '4:00 PM', '5:00 PM',
  '6:00 PM', '7:00 PM', '8:00 PM',
];

function toISO(dateStr: string, timeStr: string): string {
  const [time, meridiem] = timeStr.split(' ');
  let [h, m] = time.split(':').map(Number);
  if (meridiem === 'PM' && h !== 12) h += 12;
  if (meridiem === 'AM' && h === 12) h = 0;
  return `${dateStr}T${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:00`;
}

function addHour(iso: string): string {
  const d = new Date(iso);
  d.setHours(d.getHours() + 1);
  return d.toISOString().slice(0, 19);
}

function fechaLegible(dateStr: string): string {
  const d = new Date(dateStr + 'T12:00:00');
  return d.toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long' });
}

function minDate(): string {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().split('T')[0];
}

interface BookingWidgetProps {
  whatsappNumber: string;
}

export const BookingWidget: React.FC<BookingWidgetProps> = ({ whatsappNumber }) => {
  const [nombre, setNombre] = useState('');
  const [telefono, setTelefono] = useState('');
  const [fecha, setFecha] = useState('');
  const [hora, setHora] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const wsLink = `https://wa.me/1${whatsappNumber.replace(/\D/g,'')}?text=${encodeURIComponent('Hola Nay, acabo de agendar mi cita. ¡Lista para conocer más!')}`;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!nombre || !telefono || !fecha || !hora) return;

    setStatus('loading');
    setErrorMsg('');

    const fecha_iso     = toISO(fecha, hora);
    const fecha_iso_fin = addHour(fecha_iso);
    const fecha_legible = fechaLegible(fecha);

    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accion: 'NUEVO_EVENTO_AGENDA',
          titulo: `Llamada estratégica — ${nombre}`,
          tipo: 'LLAMADA',
          fecha_iso,
          fecha_iso_fin,
          fecha_legible,
          hora_legible: hora,
          emoji_tipo: '📞',
          calendar_color: '7',
          participantes: [{ nombre, telefono }],
          descripcion: `Cita agendada desde nayfani08.com\nNombre: ${nombre}\nTeléfono: ${telefono}`,
        }),
      });

      if (!res.ok) throw new Error('Error del servidor');
      setStatus('done');
    } catch (err) {
      setStatus('error');
      setErrorMsg('Hubo un error. Intenta de nuevo o contáctanos por WhatsApp.');
    }
  }

  if (status === 'done') {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-2xl mx-auto glass-gold rounded-2xl p-8 text-center shadow-[0_0_40px_rgba(212,175,55,0.15)]"
      >
        <div className="w-16 h-16 bg-gradient-to-tr from-green-500 to-green-400 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="text-white" size={32} />
        </div>
        <h2 className="text-2xl font-bold text-gray-100 mb-3">¡Cita confirmada! 🎉</h2>
        <p className="text-gray-400 mb-2">
          <span className="text-gold-400 font-semibold">{fechaLegible(fecha)}</span> a las <span className="text-gold-400 font-semibold">{hora}</span>
        </p>
        <p className="text-gray-500 text-sm mb-8">
          Recibirás más detalles pronto. Nos vemos en la llamada, {nombre.split(' ')[0]}!
        </p>
        <a
          href={wsLink}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 bg-[#25D366] hover:bg-[#20bd5a] text-white px-8 py-4 rounded-xl font-bold text-base transition-all hover:scale-105"
        >
          📱 Confirmar por WhatsApp
        </a>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-2xl mx-auto glass-gold rounded-2xl overflow-hidden shadow-[0_0_40px_rgba(212,175,55,0.15)] p-8"
    >
      <div className="flex flex-col items-center text-center mb-8">
        <div className="w-16 h-16 bg-gradient-to-tr from-gold-600 to-gold-400 rounded-full flex items-center justify-center mb-6 shadow-lg shadow-gold-500/20">
          <Calendar className="text-dark-900" size={32} />
        </div>
        <h2 className="text-3xl font-bold text-gray-100 mb-3">
          ¡Tu perfil ha <span className="text-gradient">calificado</span>!
        </h2>
        <p className="text-gray-400 text-sm max-w-md">
          Selecciona el día y hora para tu llamada estratégica de 30 minutos con Nay o Fani.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Nombre y teléfono */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-gray-500 uppercase tracking-widest mb-1.5">Nombre</label>
            <input
              type="text"
              value={nombre}
              onChange={e => setNombre(e.target.value)}
              placeholder="Tu nombre completo"
              required
              className="w-full bg-dark-800/60 border border-dark-600 focus:border-gold-500 rounded-xl px-4 py-3 text-gray-100 placeholder-gray-600 outline-none transition-colors text-sm"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 uppercase tracking-widest mb-1.5">WhatsApp</label>
            <input
              type="tel"
              value={telefono}
              onChange={e => setTelefono(e.target.value)}
              placeholder="(000) 000-0000"
              required
              className="w-full bg-dark-800/60 border border-dark-600 focus:border-gold-500 rounded-xl px-4 py-3 text-gray-100 placeholder-gray-600 outline-none transition-colors text-sm"
            />
          </div>
        </div>

        {/* Fecha */}
        <div>
          <label className="block text-xs text-gray-500 uppercase tracking-widest mb-1.5">
            <Calendar size={11} className="inline mr-1" />Fecha
          </label>
          <input
            type="date"
            value={fecha}
            min={minDate()}
            onChange={e => setFecha(e.target.value)}
            required
            className="w-full bg-dark-800/60 border border-dark-600 focus:border-gold-500 rounded-xl px-4 py-3 text-gray-100 outline-none transition-colors text-sm [color-scheme:dark]"
          />
        </div>

        {/* Horario */}
        <div>
          <label className="block text-xs text-gray-500 uppercase tracking-widest mb-2">
            <Clock size={11} className="inline mr-1" />Horario disponible
          </label>
          <div className="grid grid-cols-4 gap-2">
            {HORARIOS.map(h => (
              <button
                key={h}
                type="button"
                onClick={() => setHora(h)}
                className={`py-2 rounded-lg text-xs font-semibold border transition-all ${
                  hora === h
                    ? 'bg-gold-500/20 border-gold-500 text-gold-400'
                    : 'bg-dark-800/40 border-dark-600 text-gray-400 hover:border-gold-600'
                }`}
              >
                {h}
              </button>
            ))}
          </div>
        </div>

        {errorMsg && (
          <p className="text-red-400 text-xs text-center">{errorMsg}</p>
        )}

        <button
          type="submit"
          disabled={!nombre || !telefono || !fecha || !hora || status === 'loading'}
          className="w-full bg-gradient-to-r from-gold-600 to-gold-400 hover:from-gold-500 hover:to-gold-300 disabled:opacity-40 disabled:cursor-not-allowed text-dark-900 font-bold py-4 rounded-xl transition-all hover:scale-[1.02] flex items-center justify-center gap-2 text-base mt-2"
        >
          {status === 'loading' ? (
            <><Loader size={18} className="animate-spin" /> Agendando...</>
          ) : (
            <>📅 Confirmar mi cita</>
          )}
        </button>
      </form>

      <p className="text-xs text-gray-600 text-center mt-5">
        Tu información es confidencial. Al agendar confirmas tu interés en evaluar esta oportunidad.
      </p>
    </motion.div>
  );
};
