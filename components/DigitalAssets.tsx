
import React, { useState } from 'react';
import { DigitalAsset } from '../types';
import { Edit, Trash2, Plus, ExternalLink, FileText, Headphones, Book, Search, Download } from 'lucide-react';
import * as Storage from '../services/storage';

interface DigitalAssetsProps {
  assets: DigitalAsset[];
  onUpdate: (assets: DigitalAsset[]) => void;
}

const DigitalAssets: React.FC<DigitalAssetsProps> = ({ assets, onUpdate }) => {
  const [view, setView] = useState<'list' | 'form' | 'search'>('list');
  const [formData, setFormData] = useState<Partial<DigitalAsset>>({});
  
  // Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const handleSave = () => {
    if (!formData.title || !formData.url) return;

    const newAsset: DigitalAsset = {
        id: formData.id || Date.now().toString(),
        title: formData.title,
        type: formData.type || 'PDF',
        category: formData.category || 'Geral',
        url: formData.url,
        coverUrl: formData.coverUrl
    };

    let updated;
    if (formData.id) {
        updated = assets.map(a => a.id === formData.id ? newAsset : a);
    } else {
        updated = [...assets, newAsset];
    }

    Storage.saveCollection('assets', updated);
    onUpdate(updated);
    setView('list');
    setFormData({});
  };

  const handleDelete = (id: string) => {
      if (confirm('Deseja remover este item do acervo digital?')) {
          const updated = assets.filter(a => a.id !== id);
          Storage.saveCollection('assets', updated);
          onUpdate(updated);
      }
  };

  const handleOnlineSearch = async () => {
      if (!searchQuery) return;
      setIsSearching(true);
      try {
          // Using Google Books API
          const response = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(searchQuery)}&maxResults=10`);
          const data = await response.json();
          setSearchResults(data.items || []);
      } catch (error) {
          console.error("Error fetching books:", error);
          alert("Erro ao buscar livros.");
      } finally {
          setIsSearching(false);
      }
  };

  const getIcon = (type: string) => {
      switch(type) {
          case 'Audiobook': return <Headphones size={20} className="text-purple-500"/>;
          case 'E-Book': return <Book size={20} className="text-blue-500"/>;
          default: return <FileText size={20} className="text-red-500"/>;
      }
  };

  const freeLibraries = [
      { name: 'Domínio Público', url: 'http://www.dominiopublico.gov.br/' },
      { name: 'Project Gutenberg', url: 'https://www.gutenberg.org/' },
      { name: 'Open Library', url: 'https://openlibrary.org/' },
      { name: 'Biblioteca Digital Mundial', url: 'https://www.wdl.org/pt/' },
      { name: 'Machado de Assis - MEC', url: 'http://machado.mec.gov.br/' }
  ];

  return (
    <div className="space-y-6 animate-fade-in">
        <div className="flex flex-col space-y-2">
            <h2 className="text-xl font-medium text-gray-600">Acervo Digital</h2>
            <div className="flex flex-wrap gap-2">
                <button 
                    onClick={() => { setFormData({}); setView('form'); }}
                    className={`px-4 py-2 rounded text-white text-sm font-medium flex items-center ${view === 'form' ? 'bg-teal-600' : 'bg-primary hover:bg-primaryDark'}`}
                >
                    <Plus size={16} className="mr-2"/> Novo Arquivo
                </button>
                <button 
                    onClick={() => setView('list')}
                    className={`px-4 py-2 rounded text-white text-sm font-medium ${view === 'list' ? 'bg-blue-700' : 'bg-secondary hover:bg-blue-600'}`}
                >
                    Biblioteca Digital
                </button>
                <button 
                    onClick={() => setView('search')}
                    className={`px-4 py-2 rounded text-white text-sm font-medium flex items-center ${view === 'search' ? 'bg-indigo-600' : 'bg-indigo-500 hover:bg-indigo-600'}`}
                >
                    <Search size={16} className="mr-2"/> Pesquisa Online
                </button>
            </div>
        </div>

        {/* Free Libraries Links */}
        <div className="bg-white p-4 rounded shadow-sm border border-gray-200">
            <h3 className="text-sm font-bold text-gray-500 uppercase mb-3">Bibliotecas Gratuitas</h3>
            <div className="flex flex-wrap gap-3">
                {freeLibraries.map(lib => (
                    <a 
                        key={lib.name} 
                        href={lib.url} 
                        target="_blank" 
                        rel="noreferrer" 
                        className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded text-xs flex items-center border"
                    >
                        {lib.name} <ExternalLink size={10} className="ml-1"/>
                    </a>
                ))}
            </div>
        </div>

        {view === 'list' && (
             <div className="bg-white rounded shadow-sm border border-gray-200">
                <div className="p-4 border-b bg-gray-50 rounded-t">
                    <h3 className="text-lg text-gray-600">Arquivos Disponíveis</h3>
                </div>
                <div className="p-4 overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-600">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-100">
                            <tr>
                                <th className="px-4 py-3 text-center">Tipo</th>
                                <th className="px-4 py-3">Título</th>
                                <th className="px-4 py-3">Categoria</th>
                                <th className="px-4 py-3">Link</th>
                                <th className="px-4 py-3 text-center">Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {assets.length > 0 ? assets.map((asset) => (
                                <tr key={asset.id} className="bg-white border-b hover:bg-gray-50">
                                    <td className="px-4 py-3 text-center flex justify-center">{getIcon(asset.type)}</td>
                                    <td className="px-4 py-3 font-medium text-gray-800">{asset.title}</td>
                                    <td className="px-4 py-3">{asset.category}</td>
                                    <td className="px-4 py-3">
                                        <a href={asset.url} target="_blank" rel="noreferrer" className="text-blue-500 hover:underline flex items-center">
                                            Acessar <ExternalLink size={12} className="ml-1"/>
                                        </a>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex justify-center space-x-2">
                                            <button onClick={() => { setFormData(asset); setView('form'); }} className="p-1.5 bg-yellow-400 text-white rounded hover:bg-yellow-500"><Edit size={14}/></button>
                                            <button onClick={() => handleDelete(asset.id)} className="p-1.5 bg-danger text-white rounded hover:bg-red-600"><Trash2 size={14}/></button>
                                        </div>
                                    </td>
                                </tr>
                            )) : (
                                <tr><td colSpan={5} className="p-8 text-center text-gray-400">Nenhum arquivo digital cadastrado.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
             </div>
        )}

        {view === 'form' && (
            <div className="bg-white p-6 rounded shadow-sm border border-gray-200 max-w-2xl">
                 <h3 className="text-lg font-medium text-gray-700 mb-6 border-b pb-2">{formData.id ? 'Editar' : 'Cadastrar'} Mídia Digital</h3>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Título do Arquivo *</label>
                        <input 
                            className="w-full border p-2 rounded bg-white text-gray-700 focus:ring-2 focus:ring-primary focus:outline-none"
                            value={formData.title || ''}
                            onChange={e => setFormData({...formData, title: e.target.value})}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Mídia</label>
                        <select 
                            className="w-full border p-2 rounded bg-white text-gray-700 focus:ring-2 focus:ring-primary focus:outline-none"
                            value={formData.type || 'PDF'}
                            onChange={e => setFormData({...formData, type: e.target.value as any})}
                        >
                            <option value="PDF">Documento PDF</option>
                            <option value="E-Book">E-Book (ePub/Mobi)</option>
                            <option value="Audiobook">Audiobook</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Categoria</label>
                        <input 
                            className="w-full border p-2 rounded bg-white text-gray-700 focus:ring-2 focus:ring-primary focus:outline-none"
                            value={formData.category || ''}
                            onChange={e => setFormData({...formData, category: e.target.value})}
                        />
                    </div>
                    <div className="col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">URL de Acesso / Link do Arquivo *</label>
                        <input 
                            className="w-full border p-2 rounded bg-white text-gray-700 focus:ring-2 focus:ring-primary focus:outline-none"
                            placeholder="https://drive.google.com/..."
                            value={formData.url || ''}
                            onChange={e => setFormData({...formData, url: e.target.value})}
                        />
                    </div>
                 </div>
                 <div className="mt-6 flex justify-end space-x-2">
                     <button onClick={() => setView('list')} className="px-4 py-2 border rounded text-gray-600 hover:bg-gray-50">Cancelar</button>
                     <button onClick={handleSave} className="px-4 py-2 bg-primary text-white rounded hover:bg-primaryDark">Salvar Arquivo</button>
                 </div>
            </div>
        )}

        {view === 'search' && (
            <div className="bg-white p-6 rounded shadow-sm border border-gray-200">
                <h3 className="text-lg font-medium text-gray-700 mb-4 border-b pb-2">Pesquisa Online (Google Books)</h3>
                <div className="flex gap-2 mb-6">
                    <input 
                        className="flex-1 border p-2 rounded bg-white text-gray-700 focus:ring-2 focus:ring-primary focus:outline-none"
                        placeholder="Digite o nome do livro, autor ou assunto..."
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleOnlineSearch()}
                    />
                    <button 
                        onClick={handleOnlineSearch} 
                        disabled={isSearching}
                        className="px-6 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50"
                    >
                        {isSearching ? 'Buscando...' : 'Pesquisar'}
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {searchResults.map((book: any, idx) => {
                        const info = book.volumeInfo;
                        return (
                            <div key={book.id + idx} className="border rounded p-4 flex gap-4 hover:shadow-md transition-shadow">
                                <div className="w-16 h-24 bg-gray-200 flex-shrink-0">
                                    {info.imageLinks?.thumbnail ? (
                                        <img src={info.imageLinks.thumbnail} className="w-full h-full object-cover" alt="Cover"/>
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-400"><Book size={24}/></div>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="font-bold text-gray-800 text-sm truncate" title={info.title}>{info.title}</h4>
                                    <p className="text-xs text-gray-500 mb-1 truncate">{info.authors?.join(', ')}</p>
                                    <p className="text-xs text-gray-400 mb-2">{info.publishedDate?.substring(0,4)}</p>
                                    
                                    <div className="flex gap-2 mt-auto">
                                        {info.previewLink && (
                                            <a 
                                                href={info.previewLink} 
                                                target="_blank" 
                                                rel="noreferrer" 
                                                className="text-xs bg-gray-100 px-2 py-1 rounded hover:bg-gray-200 text-gray-700 flex items-center"
                                            >
                                                Ver <ExternalLink size={10} className="ml-1"/>
                                            </a>
                                        )}
                                        {/* Quick Add Button Logic could be implemented here */}
                                        <button 
                                            onClick={() => {
                                                setFormData({
                                                    title: info.title,
                                                    category: 'Pesquisa Online',
                                                    url: info.previewLink || '#',
                                                    coverUrl: info.imageLinks?.thumbnail
                                                });
                                                setView('form');
                                            }}
                                            className="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded hover:bg-indigo-200 flex items-center"
                                        >
                                            <Download size={10} className="ml-1"/> Salvar
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
                {searchResults.length === 0 && !isSearching && searchQuery && (
                    <p className="text-center text-gray-500 mt-8">Nenhum resultado encontrado.</p>
                )}
            </div>
        )}
    </div>
  );
};

export default DigitalAssets;
