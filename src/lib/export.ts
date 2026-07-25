import * as XLSX from 'xlsx';
import { supabase } from '@/lib/supabase';

export function getSpanishMonth() {
  const months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
  return months[new Date().getMonth()];
}

export function exportProcesos(data: any[]) {
  const headers = ['Fecha', 'Actividad', 'Tipo', 'Caso', 'Tipo de Gestión', 'Prioridad', 'Tiempo', 'OBSERVACIONES'];
  const rows = data.map(r => [
    r.fecha_realizacion || '',
    r.tarea || '',
    r.tipo_proceso || '',
    r.cliente || '',
    r.tipo_gestion || '',
    r.prioridad || '',
    r.tiempo || '',
    r.observaciones || ''
  ]);
  
  const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
  const wb = XLSX.utils.book_new();
  const sheetName = getSpanishMonth();
  XLSX.utils.book_append_sheet(wb, ws, sheetName);
  XLSX.writeFile(wb, `Procesos_${sheetName}.xlsx`);
}

export function exportAsesorias(data: any[]) {
  const headers = ['Fecha', 'Tipo', 'Caso', 'Cantidad', 'Observaciones'];
  const rows = data.map(r => [
    r.fecha || '',
    r.tipo_asesoria || '',
    r.cliente || '',
    r.cantidad || 1,
    r.observaciones || ''
  ]);
  
  const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Asesorías');
  XLSX.writeFile(wb, `Asesorias.xlsx`);
}

export function exportSeguimientos(data: any[]) {
  const headers = ['fecha', 'hora', 'nombre', 'fuente', 'telefono', 'tipo', 'interesado', 'Estado Seguimiento', 'Proximo paso', 'Fecha Proximo Paso', 'Valor propuesta', 'Probabilidad (%)', 'Fecha est. cierre', 'Observaciones Detalladas', 'fecha de firma de contrato'];
  
  const rows = data.map(r => [
    r.fecha || '',
    r.hora || '',
    r.nombre || '',
    r.fuente || '',
    r.telefono || '',
    r.tipo || '',
    r.interesado || '',
    r.estado || 'Pendiente',
    r.proximo_paso || '',
    r.fecha_proximo_paso || '',
    r.valor_propuesta || '',
    r.probabilidad || '',
    r.fecha_cierre || '',
    r.observaciones || '',
    r.fecha_firma || ''
  ]);
  
  const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'seguimientos asesorias');
  XLSX.writeFile(wb, `Seguimientos.xlsx`);
}

export async function exportAllToExcel() {
  const [procesosRes, asesoriasRes, seguimientosRes] = await Promise.all([
    supabase.from('procesos').select('*').order('fecha_creacion', { ascending: false }),
    supabase.from('asesorias').select('*').order('fecha', { ascending: false }),
    supabase.from('seguimientos').select('*').order('fecha', { ascending: false })
  ]);
  
  const wb = XLSX.utils.book_new();
  
  // Procesos
  if (procesosRes.data) {
    const pHeaders = ['Fecha', 'Actividad', 'Tipo', 'Caso', 'Tipo de Gestión', 'Prioridad', 'Tiempo', 'OBSERVACIONES'];
    const pRows = procesosRes.data.map(r => [
      r.fecha_realizacion || '', r.tarea || '', r.tipo_proceso || '', r.cliente || '', r.tipo_gestion || '', r.prioridad || '', r.tiempo || '', r.observaciones || ''
    ]);
    const ws = XLSX.utils.aoa_to_sheet([pHeaders, ...pRows]);
    XLSX.utils.book_append_sheet(wb, ws, getSpanishMonth());
  }
  
  // Asesorias
  if (asesoriasRes.data) {
    const aHeaders = ['Fecha', 'Tipo', 'Caso', 'Cantidad', 'Observaciones'];
    const aRows = asesoriasRes.data.map(r => [
      r.fecha || '', r.tipo_asesoria || '', r.cliente || '', r.cantidad || 1, r.observaciones || ''
    ]);
    const ws = XLSX.utils.aoa_to_sheet([aHeaders, ...aRows]);
    XLSX.utils.book_append_sheet(wb, ws, 'Asesorías');
  }
  
  // Seguimientos
  if (seguimientosRes.data) {
    const sHeaders = ['fecha', 'hora', 'nombre', 'fuente', 'telefono', 'tipo', 'interesado', 'Estado Seguimiento', 'Proximo paso', 'Fecha Proximo Paso', 'Valor propuesta', 'Probabilidad (%)', 'Fecha est. cierre', 'Observaciones Detalladas', 'fecha de firma de contrato'];
    const sRows = seguimientosRes.data.map(r => [
      r.fecha || '', r.hora || '', r.nombre || '', r.fuente || '', r.telefono || '', r.tipo || '', r.interesado || '', r.estado || 'Pendiente', r.proximo_paso || '', r.fecha_proximo_paso || '', r.valor_propuesta || '', r.probabilidad || '', r.fecha_cierre || '', r.observaciones || '', r.fecha_firma || ''
    ]);
    const ws = XLSX.utils.aoa_to_sheet([sHeaders, ...sRows]);
    XLSX.utils.book_append_sheet(wb, ws, 'seguimientos asesorias');
  }
  
  XLSX.writeFile(wb, `Consolidado_Despacho_${new Date().toISOString().split('T')[0]}.xlsx`);
}
