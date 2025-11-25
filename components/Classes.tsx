
import React, { useState } from 'react';
import { ClassSector } from '../types';
import { Edit, Trash2, Plus, Save, X } from 'lucide-react';
import * as Storage from '../services/storage';

interface ClassesProps {
  classes: ClassSector[];
  onUpdate: (classes: ClassSector[]) => void;
}

const Classes: React.FC<ClassesProps> = ({ classes, onUpdate }) => {
  const [view, setView] = useState<'list' | 'form'>('list');
  const [formData, setFormData] = useState<Partial<ClassSector>>({});

  const handleSave = () => {
    if (!formData.name) return;

    if (formData.id) {
        // Edit
        const updated = classes.map(c => c.id === formData.id ? { ...c, name: formData.name! } : c);
        Storage.saveCollection('classes', updated);
        onUpdate(updated);
    } else {
        // Create
        const newClass: ClassSector = {
            id: Date.now().toString(),
            name: formData.name
        };
        const updated = [...classes, newClass];
        Storage.saveCollection('classes', updated);
        onUpdate(updated);
    }
    setView('list');
    setFormData({});
  };

  const handleDelete = (id: string) => {
      if (confirm('Tem certeza que deseja excluir este registro?')) {
          const updated = classes.filter(c => c.id !== id);
          Storage.saveCollection('classes', updated);
          onUpdate(updated);
      }
  };

  const handleEdit = (item: ClassSector) => {
      setFormData(item);
      setView('form');
  };

  return (
    <div className="space-y-6 animate-fade-in">
        <div className="flex flex-col space-y-2">
            <h2 className="text-xl font-medium text-gray-600">Gerenciar Turmas e Setores</h2>
            <div className="flex space-x-2">
                <button 
                    onClick={() => { setFormData({}); setView('form'); }}
                    className={`px-4 py-2 rounded text-white text-sm font-medium flex items-center ${view === 'form' ? 'bg-teal-600' : 'bg-primary hover:bg-primaryDark'}`}
                >
                    <Plus size={16} className="mr-2"/> Novo Cadastro
                </button>
                <button 
                    onClick={() => setView('list')}
                    className={`px-4 py-2 rounded text-white text-sm font-medium ${view === 'list' ? 'bg-blue-700' : 'bg-secondary hover:bg-blue-600'}`}
                >
                    Tabela
                </button>
            </div>
        </div>

        {view === 'list' ? (
            <div className="bg-white rounded shadow-sm border border-gray-200">
                <div className="p-4 border-b bg-gray-50 rounded-t">
                    <h3 className="text-lg text-gray-600">Tabela de Turmas/Setores</h3>
                </div>
                <div className="p-4">
                    <table className="w-full text-sm text-left text-gray-600">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-100">
                            <tr>
                                <th className="px-4 py-3 w-20">#</th>
                                <th className="px-4 py-3">Nome da Turma/Setor</th>
                                <th className="px-4 py-3 text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {classes.length > 0 ? classes.map((item, idx) => (
                                <tr key={item.id} className="bg-white border-b hover:bg-gray-50">
                                    <td className="px-4 py-3 font-medium">{idx + 1}</td>
                                    <td className="px-4 py-3 font-bold text-gray-800">{item.name}</td>
                                    <td className="px-4 py-3 text-right">
                                        <div className="flex justify-end space-x-2">
                                            <button onClick={() => handleEdit(item)} className="p-1.5 bg-yellow-400 text-white rounded hover:bg-yellow-500"><Edit size={14}/></button>
                                            <button onClick={() => handleDelete(item.id)} className="p-1.5 bg-danger text-white rounded hover:bg-red-600"><Trash2 size={14}/></button>
                                        </div>
                                    </td>
                                </tr>
                            )) : (
                                <tr><td colSpan={3} className="p-4 text-center text-gray-400">Nenhum registro encontrado.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        ) : (
            <div className="bg-white p-6 rounded shadow-sm border border-gray-200 max-w-lg">
                <h3 className="text-lg font-medium text-gray-700 mb-6 border-b pb-2">{formData.id ? 'Editar' : 'Cadastrar'} Turma ou Setor</h3>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Nome *</label>
                        <input 
                            type="text" 
                            className="w-full border p-2 rounded bg-white text-gray-700 focus:ring-2 focus:ring-primary focus:outline-none"
                            placeholder="Ex: 3º Ano A ou Sala dos Professores"
                            value={formData.name || ''}
                            onChange={e => setFormData({...formData, name: e.target.value})}
                        />
                    </div>
                    <div className="flex justify-end space-x-2 pt-4">
                        <button onClick={() => setView('list')} className="px-4 py-2 border rounded text-gray-600 hover:bg-gray-50 flex items-center">
                            <X size={16} className="mr-1"/> Cancelar
                        </button>
                        <button onClick={handleSave} className="px-4 py-2 bg-primary text-white rounded hover:bg-primaryDark flex items-center">
                            <Save size={16} className="mr-1"/> Salvar
                        </button>
                    </div>
                </div>
            </div>
        )}
    </div>
  );
};

export default Classes;
