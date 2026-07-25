# Despacho Legal — App de Productividad Jurídica

App web para gestión de tareas legales, asesorías y seguimiento comercial (CRM), con exportación a Excel lista para pegar en Google Drive.

## Requisitos

- Node.js 18+ (descargar en nodejs.org)
- npm o pnpm

## Configuración rápida

### 1. Instalar dependencias

```bash
npm install
# o si usas pnpm:
pnpm install
```

### 2. Configurar variables de entorno

Crea un archivo `.env` en la raíz del proyecto (copia de `.env.example`):

```bash
cp .env.example .env
```

Edita `.env` con tus credenciales de Supabase:
```
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu_clave_anonima_aqui
```

Las encuentras en: **supabase.com → tu proyecto → Settings → API**

### 3. Crear las tablas en Supabase

Ve a **Supabase → SQL Editor → New Query** y pega el contenido del archivo `supabase-setup.sql`.

### 4. Correr en desarrollo

```bash
npm run dev
```

Abre http://localhost:5173

---

## Despliegue en Vercel (recomendado, gratis)

1. Sube el proyecto a un repositorio de GitHub
2. Ve a vercel.com y conecta el repositorio
3. En **Environment Variables** agrega:
   - `VITE_SUPABASE_URL` = tu URL de Supabase
   - `VITE_SUPABASE_ANON_KEY` = tu clave anónima
4. Click en **Deploy**

## Despliegue en Netlify (alternativa gratuita)

1. Sube el proyecto a GitHub
2. Ve a netlify.com → Add new site → Import from Git
3. Build command: `npm run build`
4. Publish directory: `dist`
5. En **Environment variables** agrega las mismas variables de Supabase
6. Deploy

---

## Módulos

| Módulo | Descripción |
|--------|------------|
| **Procesos** | Gestión de tareas legales con estados (Pendiente / En progreso / Finalizado). Registra automáticamente la fecha de realización al finalizar. |
| **Asesorías** | Registro rápido de consultas con fecha automática. |
| **Seguimientos** | CRM jurídico. Auto-cierra cuando se registra fecha de firma. Indica registros con próximo paso pendiente. |

## Exportación Excel

- Cada módulo tiene botón **Exportar**
- El botón **Descargar Todo** genera un `.xlsx` con las 3 hojas listas para pegar en tus plantillas de Drive
- Los nombres de columnas son exactos y no cambian
