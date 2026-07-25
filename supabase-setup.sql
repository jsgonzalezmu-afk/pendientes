-- =====================================================
-- CONFIGURACIÓN DE TABLAS PARA DESPACHO LEGAL APP
-- Ejecutar en: Supabase → SQL Editor → New Query
-- =====================================================

-- TABLA: procesos
CREATE TABLE IF NOT EXISTS procesos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tarea TEXT NOT NULL,
  cliente TEXT NOT NULL,
  tipo_proceso TEXT NOT NULL,
  tipo_gestion TEXT NOT NULL,
  prioridad TEXT NOT NULL,
  estado TEXT NOT NULL DEFAULT 'Pendiente',
  fecha_creacion TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  fecha_limite DATE,
  fecha_realizacion DATE,
  tiempo TEXT,
  observaciones TEXT
);

-- TABLA: asesorias
CREATE TABLE IF NOT EXISTS asesorias (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente TEXT NOT NULL,
  tipo_asesoria TEXT NOT NULL,
  cantidad INTEGER NOT NULL DEFAULT 1,
  fecha DATE NOT NULL DEFAULT CURRENT_DATE,
  observaciones TEXT
);

-- TABLA: seguimientos
CREATE TABLE IF NOT EXISTS seguimientos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fecha DATE NOT NULL DEFAULT CURRENT_DATE,
  hora TIME NOT NULL DEFAULT CURRENT_TIME,
  nombre TEXT NOT NULL,
  fuente TEXT NOT NULL,
  telefono TEXT NOT NULL,
  tipo TEXT NOT NULL,
  interesado TEXT NOT NULL,
  estado TEXT NOT NULL DEFAULT 'Pendiente',
  proximo_paso TEXT,
  fecha_proximo_paso DATE,
  valor_propuesta NUMERIC,
  probabilidad INTEGER,
  fecha_cierre DATE,
  observaciones TEXT,
  fecha_firma DATE
);

-- Deshabilitar Row Level Security (uso personal sin autenticación)
ALTER TABLE procesos DISABLE ROW LEVEL SECURITY;
ALTER TABLE asesorias DISABLE ROW LEVEL SECURITY;
ALTER TABLE seguimientos DISABLE ROW LEVEL SECURITY;

-- Permitir acceso anónimo
GRANT ALL ON procesos TO anon, authenticated;
GRANT ALL ON asesorias TO anon, authenticated;
GRANT ALL ON seguimientos TO anon, authenticated;
