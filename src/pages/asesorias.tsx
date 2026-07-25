import { useEffect, useState, FormEvent } from 'react';
import { supabase, Asesoria } from '@/lib/supabase';
import { exportAsesorias } from '@/lib/export';
import { Button, Input, Modal, Label, Textarea } from '@/components/ui';
import { Plus, Edit2, Trash2, Download } from 'lucide-react';

export default function Asesorias() {
  const [data, setData] = useState<Asesoria[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Asesoria | null>(null);
  
  const [formData, setFormData] = useState({
    cliente: '',
    tipo_asesoria: '',
    cantidad: 1,
    observaciones: ''
  });

  const fetchData = async () => {
    setLoading(true);
    const { data: result } = await supabase.from('asesorias').select('*').order('fecha', { ascending: false });
    if (result) setData(result as Asesoria[]);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const handleOpenModal = (item?: Asesoria) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        cliente: item.cliente || '',
        tipo_asesoria: item.tipo_asesoria || '',
        cantidad: item.cantidad || 1,
        observaciones: item.observaciones || ''
      });
    } else {
      setEditingItem(null);
      setFormData({ cliente: '', tipo_asesoria: '', cantidad: 1, observaciones: '' });
    }
    setIsModalOpen(true);
  };

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    if (editingItem) {
      await supabase.from('asesorias').update(formData).eq('id', editingItem.id);
    } else {
      await supabase.from('asesorias').insert({
        ...formData,
        fecha: new Date().toISOString().split('T')[0]
      });
    }
    setIsModalOpen(false);
    fetchData();
  };

  const handleDelete = async (id: string) => {
    if (confirm('¿Está seguro de eliminar este registro?')) {
      await supabase.from('asesorias').delete().eq('id', id);
      fetchData();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Asesorías</h2>
          <p className="text-muted-foreground">Registro de asesorías legales prestadas.</p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Button variant="outline" onClick={() => exportAsesorias(data)} className="flex-1 sm:flex-none">
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </Button>
          <Button onClick={() => handleOpenModal()} className="flex-1 sm:flex-none">
            <Plus className="w-4 h-4 mr-2" />
            Nueva Asesoría
          </Button>
        </div>
      </div>

      <div className="border rounded-lg overflow-x-auto bg-card shadow-sm">
        <table className="w-full text-sm text-left">
          <thead className="bg-muted text-muted-foreground font-semibold border-b">
            <tr>
              <th className="px-4 py-3 whitespace-nowrap">Fecha</th>
              <th className="px-4 py-3 whitespace-nowrap">Cliente / Caso</th>
              <th className="px-4 py-3 whitespace-nowrap">Tipo</th>
              <th className="px-4 py-3 whitespace-nowrap">Cant.</th>
              <th className="px-4 py-3">Observaciones</th>
              <th className="px-4 py-3 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {loading ? (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">Cargando datos...</td></tr>
            ) : data.length === 0 ? (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">No hay asesorías registradas.</td></tr>
            ) : (
              data.map((item) => (
                <tr key={item.id} className="hover:bg-muted/50 transition-colors">
                  <td className="px-4 py-3 whitespace-nowrap font-medium text-muted-foreground">{item.fecha}</td>
                  <td className="px-4 py-3 font-medium text-foreground">{item.cliente}</td>
                  <td className="px-4 py-3">{item.tipo_asesoria}</td>
                  <td className="px-4 py-3 font-semibold text-center w-20">{item.cantidad}</td>
                  <td className="px-4 py-3 text-muted-foreground max-w-xs truncate" title={item.observaciones || ''}>{item.observaciones || '-'}</td>
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

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingItem ? 'Editar Asesoría' : 'Nueva Asesoría'}>
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 space-y-2">
              <Label htmlFor="cliente">Cliente / Caso *</Label>
              <Input id="cliente" required value={formData.cliente} onChange={e => setFormData({...formData, cliente: e.target.value})} />
            </div>
            <div className="col-span-2 sm:col-span-1 space-y-2">
              <Label htmlFor="tipo_asesoria">Tipo de Asesoría *</Label>
              <Input id="tipo_asesoria" required value={formData.tipo_asesoria} onChange={e => setFormData({...formData, tipo_asesoria: e.target.value})} />
            </div>
            <div className="col-span-2 sm:col-span-1 space-y-2">
              <Label htmlFor="cantidad">Cantidad *</Label>
              <Input id="cantidad" type="number" min="1" required value={formData.cantidad} onChange={e => setFormData({...formData, cantidad: parseInt(e.target.value) || 1})} />
            </div>
            <div className="col-span-2 space-y-2">
              <Label htmlFor="observaciones">Observaciones</Label>
              <Textarea id="observaciones" value={formData.observaciones} onChange={e => setFormData({...formData, observaciones: e.target.value})} />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-4 mt-2">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
            <Button type="submit">Guardar</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
