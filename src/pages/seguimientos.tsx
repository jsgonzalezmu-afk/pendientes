import { useEffect, useState, FormEvent } from 'react';
import { supabase, Seguimiento } from '@/lib/supabase';
import { exportSeguimientos } from '@/lib/export';
import { Button, Input, Modal, Label, Textarea, Select, Badge } from '@/components/ui';
import { Plus, Edit2, Trash2, Download, CheckCircle, Clock } from 'lucide-react';

export default function Seguimientos() {
  const [data, setData] = useState<Seguimiento[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Seguimiento | null>(null);
  
  const [formData, setFormData] = useState({
    nombre: '',
    fuente: '',
    telefono: '',
    tipo: '',
    interesado: '',
    estado: 'Pendiente',
    proximo_paso: '',
    fecha_proximo_paso: '',
    valor_propuesta: '',
    probabilidad: '',
    fecha_cierre: '',
    observaciones: '',
    fecha_firma: ''
  });

  const fetchData = async () => {
    setLoading(true);
    const { data: result } = await supabase.from('seguimientos').select('*').order('fecha', { ascending: false });
    if (result) setData(result as Seguimiento[]);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const handleOpenModal = (item?: Seguimiento) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        nombre: item.nombre || '',
        fuente: item.fuente || '',
        telefono: item.telefono || '',
        tipo: item.tipo || '',
        interesado: item.interesado || '',
        estado: item.estado || 'Pendiente',
        proximo_paso: item.proximo_paso || '',
        fecha_proximo_paso: item.fecha_proximo_paso || '',
        valor_propuesta: item.valor_propuesta?.toString() || '',
        probabilidad: item.probabilidad?.toString() || '',
        fecha_cierre: item.fecha_cierre || '',
        observaciones: item.observaciones || '',
        fecha_firma: item.fecha_firma || ''
      });
    } else {
      setEditingItem(null);
      setFormData({
        nombre: '', fuente: '', telefono: '', tipo: '', interesado: '', estado: 'Pendiente', 
        proximo_paso: '', fecha_proximo_paso: '', valor_propuesta: '', probabilidad: '', 
        fecha_cierre: '', observaciones: '', fecha_firma: ''
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    
    // Automations processing
    let payload: any = {
      ...formData,
      valor_propuesta: formData.valor_propuesta ? parseFloat(formData.valor_propuesta) : null,
      probabilidad: formData.probabilidad ? parseInt(formData.probabilidad) : null,
      fecha_proximo_paso: formData.fecha_proximo_paso || null,
      fecha_cierre: formData.fecha_cierre || null,
      fecha_firma: formData.fecha_firma || null,
    };

    if (payload.fecha_firma) {
      payload.estado = 'Cerrado';
      payload.probabilidad = 100;
    }

    if (editingItem) {
      await supabase.from('seguimientos').update(payload).eq('id', editingItem.id);
    } else {
      const now = new Date();
      await supabase.from('seguimientos').insert({
        ...payload,
        fecha: now.toISOString().split('T')[0],
        hora: now.toTimeString().split(' ')[0].substring(0, 5)
      });
    }
    setIsModalOpen(false);
    fetchData();
  };

  const handleDelete = async (id: string) => {
    if (confirm('¿Está seguro de eliminar este seguimiento?')) {
      await supabase.from('seguimientos').delete().eq('id', id);
      fetchData();
    }
  };

  const formatCurrency = (val: number | null) => {
    if (val === null || val === undefined) return '-';
    return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(val);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Seguimientos</h2>
          <p className="text-muted-foreground">Pipeline comercial y gestión de prospectos.</p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Button variant="outline" onClick={() => exportSeguimientos(data)} className="flex-1 sm:flex-none">
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </Button>
          <Button onClick={() => handleOpenModal()} className="flex-1 sm:flex-none">
            <Plus className="w-4 h-4 mr-2" />
            Nuevo Seguimiento
          </Button>
        </div>
      </div>

      <div className="border rounded-lg overflow-x-auto bg-card shadow-sm">
        <table className="w-full text-sm text-left whitespace-nowrap">
          <thead className="bg-muted text-muted-foreground font-semibold border-b">
            <tr>
              <th className="px-4 py-3">Fecha/Hora</th>
              <th className="px-4 py-3">Nombre</th>
              <th className="px-4 py-3">Interesado en</th>
              <th className="px-4 py-3">Estado</th>
              <th className="px-4 py-3">Próximo Paso</th>
              <th className="px-4 py-3">Propuesta</th>
              <th className="px-4 py-3">Prob.</th>
              <th className="px-4 py-3 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {loading ? (
              <tr><td colSpan={8} className="px-4 py-8 text-center text-muted-foreground">Cargando datos...</td></tr>
            ) : data.length === 0 ? (
              <tr><td colSpan={8} className="px-4 py-8 text-center text-muted-foreground">No hay seguimientos registrados.</td></tr>
            ) : (
              data.map((item) => (
                <tr key={item.id} className="hover:bg-muted/50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="font-medium text-foreground">{item.fecha}</div>
                    <div className="text-xs text-muted-foreground">{item.hora}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-medium text-foreground">{item.nombre}</div>
                    <div className="text-xs text-muted-foreground">{item.telefono}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-medium text-foreground">{item.interesado}</div>
                    <div className="text-xs text-muted-foreground">{item.tipo}</div>
                  </td>
                  <td className="px-4 py-3">
                    {item.estado === 'Cerrado' ? (
                      <Badge variant="success"><CheckCircle className="w-3 h-3 mr-1"/> Cerrado</Badge>
                    ) : item.estado === 'Perdido' ? (
                      <Badge variant="destructive">Perdido</Badge>
                    ) : (
                      <Badge variant="default">{item.estado}</Badge>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {item.proximo_paso ? (
                      <div className="flex flex-col">
                        <span className="text-sm">{item.proximo_paso}</span>
                        {item.fecha_proximo_paso && (
                          <span className="text-xs text-blue-600 dark:text-blue-400 font-medium flex items-center mt-0.5 bg-blue-50 dark:bg-blue-900/20 px-1.5 py-0.5 rounded w-max">
                            <Clock className="w-3 h-3 mr-1"/> {item.fecha_proximo_paso}
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </td>
                  <td className="px-4 py-3 font-semibold text-foreground">{formatCurrency(item.valor_propuesta)}</td>
                  <td className="px-4 py-3">
                    {item.probabilidad !== null ? (
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-border rounded-full h-1.5 overflow-hidden">
                          <div className={`h-1.5 rounded-full ${item.probabilidad > 70 ? 'bg-green-500' : item.probabilidad > 30 ? 'bg-yellow-500' : 'bg-red-500'}`} style={{width: `${item.probabilidad}%`}}></div>
                        </div>
                        <span className="text-xs font-medium text-foreground w-8">{item.probabilidad}%</span>
                      </div>
                    ) : <span className="text-muted-foreground">-</span>}
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

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingItem ? 'Editar Seguimiento' : 'Nuevo Seguimiento'}>
        <form onSubmit={handleSave} className="space-y-4 max-h-[75vh] overflow-y-auto px-1">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 sm:col-span-1 space-y-2">
              <Label htmlFor="nombre">Nombre *</Label>
              <Input id="nombre" required value={formData.nombre} onChange={e => setFormData({...formData, nombre: e.target.value})} />
            </div>
            <div className="col-span-2 sm:col-span-1 space-y-2">
              <Label htmlFor="telefono">Teléfono *</Label>
              <Input id="telefono" required value={formData.telefono} onChange={e => setFormData({...formData, telefono: e.target.value})} />
            </div>
            <div className="col-span-2 sm:col-span-1 space-y-2">
              <Label htmlFor="fuente">Fuente *</Label>
              <Input id="fuente" required value={formData.fuente} onChange={e => setFormData({...formData, fuente: e.target.value})} />
            </div>
            <div className="col-span-2 sm:col-span-1 space-y-2">
              <Label htmlFor="tipo">Tipo *</Label>
              <Input id="tipo" required value={formData.tipo} onChange={e => setFormData({...formData, tipo: e.target.value})} />
            </div>
            <div className="col-span-2 space-y-2">
              <Label htmlFor="interesado">Interesado en *</Label>
              <Input id="interesado" required value={formData.interesado} onChange={e => setFormData({...formData, interesado: e.target.value})} />
            </div>
            
            <div className="col-span-2 border-t pt-4 mt-2">
              <h3 className="font-semibold text-sm mb-3 text-foreground">Estado y Avance</h3>
            </div>
            
            <div className="col-span-2 sm:col-span-1 space-y-2">
              <Label htmlFor="estado">Estado</Label>
              <Select id="estado" value={formData.estado} onChange={e => setFormData({...formData, estado: e.target.value})}>
                <option value="Pendiente">Pendiente</option>
                <option value="En negociación">En negociación</option>
                <option value="Cerrado">Cerrado</option>
                <option value="Perdido">Perdido</option>
              </Select>
            </div>
            <div className="col-span-2 sm:col-span-1 space-y-2">
              <Label htmlFor="probabilidad">Probabilidad (%)</Label>
              <Input id="probabilidad" type="number" min="0" max="100" value={formData.probabilidad} onChange={e => setFormData({...formData, probabilidad: e.target.value})} />
            </div>
            <div className="col-span-2 sm:col-span-1 space-y-2">
              <Label htmlFor="valor_propuesta">Valor Propuesta ($)</Label>
              <Input id="valor_propuesta" type="number" min="0" value={formData.valor_propuesta} onChange={e => setFormData({...formData, valor_propuesta: e.target.value})} />
            </div>
            <div className="col-span-2 sm:col-span-1 space-y-2">
              <Label htmlFor="fecha_cierre">Fecha Est. Cierre</Label>
              <Input id="fecha_cierre" type="date" value={formData.fecha_cierre} onChange={e => setFormData({...formData, fecha_cierre: e.target.value})} />
            </div>
            
            <div className="col-span-2 border-t pt-4 mt-2">
              <h3 className="font-semibold text-sm mb-3 text-foreground">Seguimiento</h3>
            </div>
            
            <div className="col-span-2 sm:col-span-1 space-y-2">
              <Label htmlFor="proximo_paso">Próximo Paso</Label>
              <Input id="proximo_paso" value={formData.proximo_paso} onChange={e => setFormData({...formData, proximo_paso: e.target.value})} />
            </div>
            <div className="col-span-2 sm:col-span-1 space-y-2">
              <Label htmlFor="fecha_proximo_paso">Fecha Próximo Paso</Label>
              <Input id="fecha_proximo_paso" type="date" value={formData.fecha_proximo_paso} onChange={e => setFormData({...formData, fecha_proximo_paso: e.target.value})} />
            </div>
            <div className="col-span-2 space-y-2">
              <Label htmlFor="observaciones">Observaciones Detalladas</Label>
              <Textarea id="observaciones" value={formData.observaciones} onChange={e => setFormData({...formData, observaciones: e.target.value})} />
            </div>
            
            <div className="col-span-2 border-t border-green-200 dark:border-green-900 bg-green-50/50 dark:bg-green-900/10 -mx-1 px-3 py-4 mt-2 rounded-lg">
              <h3 className="font-semibold text-sm mb-3 text-green-700 dark:text-green-400 flex items-center"><CheckCircle className="w-4 h-4 mr-2"/> Cierre Exitoso</h3>
              <div className="space-y-2">
                <Label htmlFor="fecha_firma">Fecha de Firma de Contrato</Label>
                <Input id="fecha_firma" type="date" value={formData.fecha_firma} onChange={e => setFormData({...formData, fecha_firma: e.target.value})} className="border-green-300 dark:border-green-800" />
                <p className="text-xs text-green-600/80 dark:text-green-400/80 mt-1">Al establecer la fecha de firma, el estado cambiará automáticamente a "Cerrado" y la probabilidad a 100%.</p>
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-4 border-t mt-4 sticky bottom-0 bg-background pb-2 z-10">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
            <Button type="submit">Guardar</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
