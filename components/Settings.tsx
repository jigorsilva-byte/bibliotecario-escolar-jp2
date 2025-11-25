
import React, { useState } from 'react';
import { AppSettings } from '../types';
import * as Storage from '../services/storage';

interface SettingsProps {
  settings: AppSettings;
  onUpdate: (s: AppSettings) => void;
}

const Settings: React.FC<SettingsProps> = ({ settings, onUpdate }) => {
  const [form, setForm] = useState(settings);

  const handleSave = () => {
    Storage.saveSettings(form);
    onUpdate(form);
    alert('Configurações salvas com sucesso!');
  };

  const toggleColumn = (col: keyof typeof form.bookColumns) => {
    setForm({
        ...form,
        bookColumns: {
            ...form.bookColumns,
            [col]: !form.bookColumns[col]
        }
    });
  };

  return (
    <div className="space-y-6 animate-fade-in">
        <div className="border-b pb-2">
            <h2 className="text-xl font-medium text-gray-600">Configurações do Sistema</h2>
        </div>
        
        <div className="bg-white p-6 rounded shadow-sm border border-gray-200">
            <div className="space-y-4 max-w-2xl">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nome da Instituição</label>
                    <input 
                        className="w-full border p-2 rounded bg-white text-gray-700 focus:ring-2 focus:ring-primary focus:outline-none"
                        value={form.institutionName}
                        onChange={e => setForm({...form, institutionName: e.target.value})}
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Endereço da Instituição</label>
                    <input 
                        className="w-full border p-2 rounded bg-white text-gray-700 focus:ring-2 focus:ring-primary focus:outline-none"
                        value={form.address}
                        onChange={e => setForm({...form, address: e.target.value})}
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Logo da Instituição (URL)</label>
                    <div className="flex gap-4 items-center">
                         <input 
                            className="w-full border p-2 rounded bg-white text-gray-700 focus:ring-2 focus:ring-primary focus:outline-none"
                            value={form.logoUrl}
                            onChange={e => setForm({...form, logoUrl: e.target.value})}
                        />
                        {form.logoUrl && <img src={form.logoUrl} className="h-10 w-auto" alt="Preview"/>}
                    </div>
                </div>

                <div className="pt-4 border-t">
                    <label className="block text-sm font-medium text-gray-700 mb-3">Marque as colunas para exibir na tabela de Acervos</label>
                    <div className="grid grid-cols-2 gap-2">
                        <label className="flex items-center space-x-2">
                            <input type="checkbox" checked={form.bookColumns.format} onChange={() => toggleColumn('format')} className="rounded text-primary focus:ring-primary bg-white"/>
                            <span className="text-sm text-gray-600">Formato</span>
                        </label>
                        <label className="flex items-center space-x-2">
                            <input type="checkbox" checked={form.bookColumns.isbn} onChange={() => toggleColumn('isbn')} className="rounded text-primary focus:ring-primary bg-white"/>
                            <span className="text-sm text-gray-600">ISBN</span>
                        </label>
                         <label className="flex items-center space-x-2">
                            <input type="checkbox" checked={form.bookColumns.author} onChange={() => toggleColumn('author')} className="rounded text-primary focus:ring-primary bg-white"/>
                            <span className="text-sm text-gray-600">Autor</span>
                        </label>
                        <label className="flex items-center space-x-2">
                            <input type="checkbox" checked={form.bookColumns.publisher} onChange={() => toggleColumn('publisher')} className="rounded text-primary focus:ring-primary bg-white"/>
                            <span className="text-sm text-gray-600">Editora</span>
                        </label>
                        <label className="flex items-center space-x-2">
                            <input type="checkbox" checked={form.bookColumns.year} onChange={() => toggleColumn('year')} className="rounded text-primary focus:ring-primary bg-white"/>
                            <span className="text-sm text-gray-600">Ano</span>
                        </label>
                        <label className="flex items-center space-x-2">
                            <input type="checkbox" checked={form.bookColumns.quantity} onChange={() => toggleColumn('quantity')} className="rounded text-primary focus:ring-primary bg-white"/>
                            <span className="text-sm text-gray-600">Quantidade</span>
                        </label>
                        <label className="flex items-center space-x-2">
                            <input type="checkbox" checked={form.bookColumns.synopsis} onChange={() => toggleColumn('synopsis')} className="rounded text-primary focus:ring-primary bg-white"/>
                            <span className="text-sm text-gray-600">Sinopse</span>
                        </label>
                    </div>
                </div>

                <div className="flex space-x-2 pt-6">
                    <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Cancelar</button>
                    <button onClick={handleSave} className="bg-primary text-white px-4 py-2 rounded hover:bg-primaryDark">Salvar</button>
                </div>
            </div>
        </div>
    </div>
  );
};

export default Settings;
