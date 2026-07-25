import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabase URL and anon key are required. Check your environment variables.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Types matching exact Supabase tables
export interface Proceso {
  id: string;
  tarea: string;
  cliente: string;
  tipo_proceso: string;
  tipo_gestion: string;
  prioridad: string;
  estado: 'Pendiente' | 'En progreso' | 'Finalizado';
  fecha_creacion: string;
  fecha_limite: string | null;
  fecha_realizacion: string | null;
  tiempo: string | null;
  observaciones: string | null;
}

export interface Asesoria {
  id: string;
  cliente: string;
  tipo_asesoria: string;
  cantidad: number;
  fecha: string;
  observaciones: string | null;
}

export interface Seguimiento {
  id: string;
  fecha: string;
  hora: string;
  nombre: string;
  fuente: string;
  telefono: string;
  tipo: string;
  interesado: string;
  estado: string;
  proximo_paso: string | null;
  fecha_proximo_paso: string | null;
  valor_propuesta: number | null;
  probabilidad: number | null;
  fecha_cierre: string | null;
  observaciones: string | null;
  fecha_firma: string | null;
}
