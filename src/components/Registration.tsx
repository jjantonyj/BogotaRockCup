import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { motion } from 'motion/react';
import { Send, Youtube, Instagram, Facebook, MapPin } from 'lucide-react';

const registrationSchema = z.object({
  bandName: z.string().min(2, 'El nombre de la banda es requerido'),
  genre: z.string().min(2, 'El género es requerido'),
  contactName: z.string().min(2, 'El nombre de contacto es requerido'),
  email: z.string().email('Email inválido'),
  locality: z.string().min(1, 'Selecciona una localidad'),
  instagram: z.string().optional(),
  facebook: z.string().optional(),
  video1: z.string().url('URL de YouTube inválida'),
  video2: z.string().url('URL de YouTube inválida'),
  video3: z.string().url('URL de YouTube inválida'),
});

type RegistrationForm = z.infer<typeof registrationSchema>;

const BOGOTA_LOCALITIES = [
  "Usaquén", "Chapinero", "Santa Fe", "San Cristóbal", "Usme", "Tunjuelito", 
  "Bosa", "Kennedy", "Fontibón", "Engativá", "Suba", "Barrios Unidos", 
  "Teusaquillo", "Los Mártires", "Antonio Nariño", "Puente Aranda", 
  "La Candelaria", "Rafael Uribe Uribe", "Ciudad Bolívar", "Sumapaz",
  "Soacha (Área Metropolitana)", "Chía (Área Metropolitana)", "Cota (Área Metropolitana)"
];

export function Registration() {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<RegistrationForm>({
    resolver: zodResolver(registrationSchema),
  });

  const onSubmit = async (data: RegistrationForm) => {
    console.log(data);
    // Here we would save to Firestore
    alert('¡Inscripción enviada con éxito! El jurado revisará tu propuesta.');
  };

  return (
    <div className="py-20 px-4 max-w-3xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-zinc-900 border border-zinc-800 p-8 rounded-3xl shadow-2xl"
      >
        <div className="mb-10 text-center">
          <h2 className="text-4xl font-black uppercase italic tracking-tighter mb-2">
            Inscripción de <span className="text-bogota-yellow">Bandas</span>
          </h2>
          <p className="text-zinc-500 font-medium">
            Completa el formulario para participar en la Bogotá Rock Cup 2026.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-zinc-400">Nombre de la Banda</label>
              <input 
                {...register('bandName')}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 focus:border-bogota-yellow outline-none transition-all"
                placeholder="Ej: Los Truenos"
              />
              {errors.bandName && <p className="text-bogota-red text-xs font-bold">{errors.bandName.message}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-zinc-400">Género Musical</label>
              <input 
                {...register('genre')}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 focus:border-bogota-yellow outline-none transition-all"
                placeholder="Ej: Punk Rock"
              />
              {errors.genre && <p className="text-bogota-red text-xs font-bold">{errors.genre.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-zinc-400">Persona de Contacto</label>
              <input 
                {...register('contactName')}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 focus:border-bogota-yellow outline-none transition-all"
              />
              {errors.contactName && <p className="text-bogota-red text-xs font-bold">{errors.contactName.message}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-zinc-400">Correo Electrónico</label>
              <input 
                {...register('email')}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 focus:border-bogota-yellow outline-none transition-all"
              />
              {errors.email && <p className="text-bogota-red text-xs font-bold">{errors.email.message}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-zinc-400 flex items-center gap-2">
              <MapPin className="w-3 h-3" /> Localidad (Bogotá y Área Metropolitana)
            </label>
            <select 
              {...register('locality')}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 focus:border-bogota-yellow outline-none transition-all appearance-none"
            >
              <option value="">Selecciona una localidad...</option>
              {BOGOTA_LOCALITIES.map(l => <option key={l} value={l}>{l}</option>)}
            </select>
            {errors.locality && <p className="text-bogota-red text-xs font-bold">{errors.locality.message}</p>}
          </div>

          <div className="space-y-4 pt-4 border-t border-zinc-800">
            <h4 className="text-sm font-black uppercase tracking-widest text-zinc-300 flex items-center gap-2">
              <Youtube className="w-4 h-4 text-bogota-red" /> Videos de Competencia (YouTube)
            </h4>
            <div className="space-y-3">
              <input {...register('video1')} className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm" placeholder="URL Video 1" />
              <input {...register('video2')} className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm" placeholder="URL Video 2" />
              <input {...register('video3')} className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm" placeholder="URL Video 3" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-zinc-400 flex items-center gap-2">
                <Instagram className="w-3 h-3" /> Instagram
              </label>
              <input {...register('instagram')} className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm" placeholder="@tu_banda" />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-zinc-400 flex items-center gap-2">
                <Facebook className="w-3 h-3" /> Facebook
              </label>
              <input {...register('facebook')} className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm" placeholder="facebook.com/tu_banda" />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={isSubmitting}
            className="w-full bg-bogota-yellow hover:bg-yellow-500 text-zinc-950 font-black uppercase tracking-widest py-4 rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isSubmitting ? 'Enviando...' : <><Send className="w-5 h-5" /> Enviar Inscripción</>}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
