import { useEffect, useState, FormEvent } from 'react';
import { supabase, Proceso } from '@/lib/supabase';
import { exportProcesos } from '@/lib/export';
import { Button, Input, Select, Modal, Label, Textarea, Badge } from '@/components/ui';
import { Plus, Edit2, Trash2, Download, CheckCircle, Clock, AlertCircle } from 'lucide-react';

export default function Procesos() {
  const [data, setData] = useState<Proceso[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Proceso | null>(null);
  
  const [formData, setFormData] = useState({
    tarea: '',
    cliente: '',
    tipo_proceso: '',
    tipo_gestion: '',
    prioridad: 'Media',
    fecha_limite: '',
    tiempo: '',
    observaciones: ''
  });

  const fetchData = async () => {
    setLoading(true);
    const { data: result, error } = await supabase.from('procesos').select('*').order('fecha_creacion', { ascending: false });
    if (!error && result) setData(result as Proceso[]);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenModal = (item?: Proceso) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        tarea: item.tarea || '',
        cliente: item.cliente || '',
        tipo_proceso: item.tipo_proceso || '',
        tipo_gestion: item.tipo_gestion || '',
        prioridad: item.prioridad || 'Media',
        fecha_limite: item.fecha_limite || '',
        tiempo: item.tiempo || '',
        observaciones: item.observaciones || ''
      });
    } else {
      setEditingItem(null);
      setFormData({ tarea: '', cliente: '', tipo_proceso: '', tipo_gestion: '', prioridad: 'Media', fecha_limite: '', tiempo: '', observaciones: '' });
    }
    setIsModalOpen(true);
  };

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    if (editingItem) {
      await supabase.from('procesos').update(formData).eq('id', editingItem.id);
    } else {
      await supabase.from('procesos').insert({
        ...formData,
        estado: 'Pendiente'
      });
    }
    setIsModalOpen(false);
    fetchData();
  };

  const handleDelete = async (id: string) => {
    if (confirm('¿Está seguro de eliminar este proceso?')) {
      await supabase.from('procesos').delete().eq('id', id);
      fetchData();
    }
  };

  const handleToggleState = async (item: Proceso) => {
    const nextStates = {
      'Pendiente': 'En progreso',
      'En progreso': 'Finalizado',
      'Finalizado': 'Pendiente'
    };
    const nuevoEstado = nextStates[item.estado as keyof typeof nextStates];
    const fechaRealizacion = nuevoEstado === 'Finalizado' ? new Date().toISOString().split('T')[0] : null;
    
    await supabase.from('procesos').update({ 
      estado: nuevoEstado, 
      fecha_realizacion: fechaRealizacion 
    }).eq('id', item.id);
    
    fetchData();
  };

  const getStateBadge = (estado: string) => {
    if (estado === 'Pendiente') return <Badge variant="destructive" className="cursor-pointer"><AlertCircle className="w-3 h-3 mr-1"/>Pendiente</Badge>;
    if (estado === 'En progreso') return <Badge variant="warning" className="cursor-pointer"><Clock className="w-3 h-3 mr-1"/>En progreso</Badge>;
    if (estado === 'Finalizado') return <Badge variant="success" className="cursor-pointer"><CheckCircle className="w-3 h-3 mr-1"/>Finalizado</Badge>;
    return <Badge className="cursor-pointer">{estado}</Badge>;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Procesos</h2>
          <p className="text-muted-foreground">Gestión de tareas y casos legales.</p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Button variant="outline" onClick={() => exportProcesos(data)} className="flex-1 sm:flex-none">
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </Button>
          <Button onClick={() => handleOpenModal()} className="flex-1 sm:flex-none">
            <Plus className="w-4 h-4 mr-2" />
            Nuevo Proceso
          </Button>
        </div>
      </div>

      <div className="border rounded-lg overflow-x-auto bg-card shadow-sm">
        <table className="w-full text-sm text-left">
          <thead className="bg-muted text-muted-foreground font-semibold border-b">
            <tr>
              <th className="px-4 py-3 whitespace-nowrap">Tarea / Actividad</th>
              <th className="px-4 py-3 whitespace-nowrap">Cliente / Caso</th>
              <th className="px-4 py-3 whitespace-nowrap">Tipo</th>
              <th className="px-4 py-3 whitespace-nowrap">Prioridad</th>
              <th className="px-4 py-3 whitespace-nowrap">Fecha Límite</th>
              <th className="px-4 py-3 whitespace-nowrap">Estado</th>
              <th className="px-4 py-3 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {loading ? (
              <tr><td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">Cargando datos...</td></tr>
            ) : data.length === 0 ? (
              <tr><td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">No hay procesos registrados.</td></tr>
            ) : (
              data.map((item) => (
                <tr key={item.id} className="hover:bg-muted/50 transition-colors">
                  <td className="px-4 py-3 font-medium max-w-xs truncate" title={item.tarea}>{item.tarea}</td>
                  <td className="px-4 py-3 max-w-[200px] truncate" title={item.cliente}>{item.cliente}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-col">
                      <span className="font-medium text-foreground">{item.tipo_proceso}</span>
                      <span className="text-xs text-muted-foreground">{item.tipo_gestion}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                      item.prioridad === 'Alta' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' :
                      item.prioridad === 'Media' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' : 
                      'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                    }`}>
                      {item.prioridad}
                    </span>
                  </td>
                  <td className="px-4 py-3">{item.fecha_limite || '-'}</td>
                  <td className="px-4 py-3" onClick={() => handleToggleState(item)}>
                    <div className="inline-block transition-transform active:scale-95">{getStateBadge(item.estado)}</div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" onClick={() => handleOpenModal(item)}>
                        <Edit2 className="w-4 h-4 text-muted-foreground" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(item.id)}>
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingItem ? 'Editar Proceso' : 'Nuevo Proceso'}>
        <form onSubmit={handleSave} className="space-y-4 max-h-[75vh] overflow-y-auto px-1">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 space-y-2">
              <Label htmlFor="tarea">Tarea / Actividad *</Label>
              <Input id="tarea" required value={formData.tarea} onChange={e => setFormData({...formData, tarea: e.target.value})} />
            </div>
            <div className="col-span-2 sm:col-span-1 space-y-2">
              <Label htmlFor="cliente">Cliente / Caso *</Label>
              <Input id="cliente" required value={formData.cliente} onChange={e => setFormData({...formData, cliente: e.target.value})} />
            </div>
            <div className="col-span-2 sm:col-span-1 space-y-2">
              <Label htmlFor="prioridad">Prioridad *</Label>
              <Select id="prioridad" value={formData.prioridad} onChange={e => setFormData({...formData, prioridad: e.target.value})}>
                <option value="Alta">Alta</option>
                <option value="Media">Media</option>
                <option value="Baja">Baja</option>
              </Select>
            </div>
            <div className="col-span-2 sm:col-span-1 space-y-2">
              <Label htmlFor="tipo_proceso">Tipo de Proceso *</Label>
              <Input id="tipo_proceso" required value={formData.tipo_proceso} onChange={e => setFormData({...formData, tipo_proceso: e.target.value})} />
            </div>
            <div className="col-span-2 sm:col-span-1 space-y-2">
              <Label htmlFor="tipo_gestion">Tipo de Gestión *</Label>
              <Input id="tipo_gestion" required value={formData.tipo_gestion} onChange={e => setFormData({...formData, tipo_gestion: e.target.value})} />
            </div>
            <div className="col-span-2 sm:col-span-1 space-y-2">
              <Label htmlFor="fecha_limite">Fecha Límite</Label>
              <Input id="fecha_limite" type="date" value={formData.fecha_limite} onChange={e => setFormData({...formData, fecha_limite: e.target.value})} />
            </div>
            
            {editingItem && (
              <>
                <div className="col-span-2 sm:col-span-1 space-y-2">
                  <Label htmlFor="tiempo">Tiempo Invertido</Label>
                  <Input id="tiempo" placeholder="Ej: 2 horas" value={formData.tiempo} onChange={e => setFormData({...formData, tiempo: e.target.value})} />
                </div>
                <div className="col-span-2 space-y-2">
                  <Label htmlFor="observaciones">Observaciones</Label>
                  <Textarea id="observaciones" value={formData.observaciones} onChange={e => setFormData({...formData, observaciones: e.target.value})} />
                </div>
              </>
            )}
          </div>
          <div className="flex justify-end gap-2 pt-4 border-t mt-4 sticky bottom-0 bg-background pb-2">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
            <Button type="submit">Guardar</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
