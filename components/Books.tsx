
import React, { useState, useEffect, useRef } from 'react';
import { Book, AppSettings, BookFormat, ClassSector } from '../types';
import { Edit, Trash2, Tag, Book as BookIcon, Plus, X, Printer, Search, Upload } from 'lucide-react';
import * as Storage from '../services/storage';

interface BooksProps {
  books: Book[];
  onUpdate: (books: Book[]) => void;
  settings: AppSettings;
  formats: BookFormat[];
  onUpdateFormats: (formats: BookFormat[]) => void;
  classes: ClassSector[];
}

const Books: React.FC<BooksProps> = ({ books, onUpdate, settings, formats, onUpdateFormats, classes }) => {
  const [view, setView] = useState<'list' | 'form' | 'formats'>('list');
  const [formData, setFormData] = useState<Partial<Book>>({});
  
  // Category State
  const [categories, setCategories] = useState<string[]>(settings.categories || []);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [newCategory, setNewCategory] = useState('');

  // Format State
  const [formatName, setFormatName] = useState('');

  // Label Generation State
  const [showLabelsModal, setShowLabelsModal] = useState(false);

  // Search API State
  const [isSearching, setIsSearching] = useState(false);

  // File Upload Ref
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Update categories if settings change externally
  useEffect(() => {
    setCategories(settings.categories || []);
  }, [settings]);

  const handleSave = () => {
    if (!formData.title || !formData.author) {
        alert("Preencha Título e Autor.");
        return;
    }

    const newBook: Book = {
      id: formData.id || Date.now().toString(),
      title: formData.title,
      author: formData.author,
      isbn: formData.isbn || '',
      category: formData.category || 'Geral',
      format: formData.format || 'LIVRO',
      knowledgeArea: formData.knowledgeArea || '',
      year: formData.year || '',
      quantity: formData.quantity || 1,
      available: formData.available !== undefined ? formData.available : (formData.quantity || 1),
      shelf: formData.shelf || '',
      shelfLocation: formData.shelfLocation || '',
      synopsis: formData.synopsis || '',
      publisher: formData.publisher || '',
      coverUrl: formData.coverUrl || '',
      sector: formData.sector || ''
    };

    let updated;
    if (formData.id) {
         updated = books.map(b => b.id === formData.id ? newBook : b);
    } else {
         updated = [...books, newBook];
    }

    Storage.saveCollection('books', updated);
    onUpdate(updated);
    setView('list');
    setFormData({});
  };

  const handleEdit = (book: Book) => {
    setFormData(book);
    setView('form');
  };

  const handleDelete = (id: string) => {
    if (confirm('Tem certeza que deseja excluir?')) {
        const updated = books.filter(b => b.id !== id);
        Storage.saveCollection('books', updated);
        onUpdate(updated);
    }
  };

  const handleAddCategory = () => {
      if (!newCategory) return;
      if (categories.includes(newCategory)) {
          alert('Categoria já existe');
          return;
      }

      const updatedCategories = [...categories, newCategory];
      setCategories(updatedCategories);
      
      const currentSettings = Storage.getSettings();
      currentSettings.categories = updatedCategories;
      Storage.saveSettings(currentSettings);
      
      setNewCategory('');
      setShowCategoryModal(false);
  };

  const handleFormatSave = () => {
      if(!formatName) return;
      const newFormat: BookFormat = {
          id: Date.now().toString(),
          name: formatName.toUpperCase()
      };
      const updated = [...formats, newFormat];
      Storage.saveCollection('formats', updated);
      onUpdateFormats(updated);
      setFormatName('');
  };

  const handleFormatDelete = (id: string) => {
      if(confirm('Excluir este formato?')) {
          const updated = formats.filter(f => f.id !== id);
          Storage.saveCollection('formats', updated);
          onUpdateFormats(updated);
      }
  };

  const handleOnlineSearch = async (query: string, type: 'isbn' | 'title') => {
    if (!query) return;
    setIsSearching(true);
    try {
        const q = type === 'isbn' ? `isbn:${query}` : query;
        const response = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(q)}&maxResults=1`);
        const data = await response.json();
        
        if (data.items && data.items.length > 0) {
            const info = data.items[0].volumeInfo;
            setFormData(prev => ({
                ...prev,
                title: info.title,
                author: info.authors ? info.authors[0] : '',
                publisher: info.publisher,
                year: info.publishedDate ? info.publishedDate.substring(0,4) : '',
                synopsis: info.description,
                coverUrl: info.imageLinks?.thumbnail,
                isbn: type === 'isbn' ? query : (info.industryIdentifiers ? info.industryIdentifiers[0]?.identifier : '')
            }));
        } else {
            alert('Livro não encontrado.');
        }
    } catch (e) {
        alert('Erro na pesquisa.');
    } finally {
        setIsSearching(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, coverUrl: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in relative">
        <div className="flex flex-col space-y-2">
            <h2 className="text-xl font-medium text-gray-600">Cadastrar/Editar/Listar Acervos</h2>
            <div className="flex flex-wrap gap-2">
            <button 
                onClick={() => { setFormData({}); setView('form'); }}
                className={`px-4 py-2 rounded text-white text-sm font-medium ${view === 'form' ? 'bg-teal-600' : 'bg-primary hover:bg-primaryDark'}`}
            >
                Novo Cadastro
            </button>
            <button 
                onClick={() => setView('list')}
                className={`px-4 py-2 rounded text-white text-sm font-medium ${view === 'list' ? 'bg-blue-700' : 'bg-secondary hover:bg-blue-600'}`}
            >
                Tabela Acervos
            </button>
            <button 
                onClick={() => setShowCategoryModal(true)}
                className="px-4 py-2 rounded text-white text-sm font-medium bg-cyan-500 hover:bg-cyan-600"
            >
                Nova Categoria
            </button>
            <button 
                onClick={() => setView('formats')}
                className={`px-4 py-2 rounded text-white text-sm font-medium ${view === 'formats' ? 'bg-red-600' : 'bg-red-500 hover:bg-red-600'}`}
            >
                Formato
            </button>
            </div>
        </div>

      {view === 'list' && (
        <div className="bg-white rounded shadow-sm border border-gray-200">
             <div className="p-4 border-b flex justify-between items-center bg-gray-50 rounded-t">
             <h3 className="text-lg text-gray-600">Tabela de Acervos Cadastrados</h3>
             <div className="flex gap-2">
                <button 
                    onClick={() => setShowLabelsModal(true)}
                    className="bg-yellow-400 text-white px-3 py-1 rounded text-sm hover:bg-yellow-500 flex items-center"
                >
                    <Tag size={16} className="mr-1"/> Gerar Etiquetas
                </button>
                <button className="bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600">Salvar Excel</button>
             </div>
          </div>
          <div className="p-4 overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-600">
                <thead className="text-xs text-gray-700 uppercase bg-gray-100">
                    <tr>
                        <th className="px-4 py-3 text-center"><input type="checkbox"/></th>
                        <th className="px-4 py-3">Capa</th>
                        <th className="px-4 py-3">Título</th>
                        <th className="px-4 py-3">Categoria</th>
                        {settings.bookColumns.format && <th className="px-4 py-3">Formato</th>}
                        {settings.bookColumns.author && <th className="px-4 py-3">Autor</th>}
                        {settings.bookColumns.year && <th className="px-4 py-3">Ano</th>}
                        {settings.bookColumns.isbn && <th className="px-4 py-3">ISBN</th>}
                        {settings.bookColumns.quantity && <th className="px-4 py-3">Qtd</th>}
                        {settings.bookColumns.shelf && <th className="px-4 py-3">Estante</th>}
                        {settings.bookColumns.shelfLocation && <th className="px-4 py-3">Prateleira</th>}
                        {settings.bookColumns.knowledgeArea && <th className="px-4 py-3">Área de Conhecimento</th>}
                        <th className="px-4 py-3">Ações</th>
                    </tr>
                </thead>
                <tbody>
                    {books.map((book) => (
                        <tr key={book.id} className="bg-white border-b hover:bg-gray-50">
                            <td className="px-4 py-3 text-center"><input type="checkbox"/></td>
                            <td className="px-4 py-3">
                                <div className="w-8 h-12 bg-gray-200 flex items-center justify-center rounded overflow-hidden">
                                    {book.coverUrl ? <img src={book.coverUrl} className="w-full h-full object-cover" /> : <BookIcon size={16} className="text-gray-400"/>}
                                </div>
                            </td>
                            <td className="px-4 py-3 font-medium">{book.title}</td>
                            <td className="px-4 py-3">{book.category}</td>
                            {settings.bookColumns.format && <td className="px-4 py-3">{book.format}</td>}
                            {settings.bookColumns.author && <td className="px-4 py-3">{book.author}</td>}
                            {settings.bookColumns.year && <td className="px-4 py-3">{book.year}</td>}
                            {settings.bookColumns.isbn && <td className="px-4 py-3">{book.isbn}</td>}
                            {settings.bookColumns.quantity && <td className="px-4 py-3">{book.quantity}</td>}
                            {settings.bookColumns.shelf && <td className="px-4 py-3">{book.shelf}</td>}
                            {settings.bookColumns.shelfLocation && <td className="px-4 py-3">{book.shelfLocation}</td>}
                            {settings.bookColumns.knowledgeArea && <td className="px-4 py-3">{book.knowledgeArea}</td>}
                            <td className="px-4 py-3">
                                <div className="flex space-x-1">
                                    <button onClick={() => handleEdit(book)} className="p-1.5 bg-yellow-400 text-white rounded hover:bg-yellow-500"><Edit size={14}/></button>
                                    <button onClick={() => handleDelete(book.id)} className="p-1.5 bg-red-500 text-white rounded hover:bg-red-600"><Trash2 size={14}/></button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
          </div>
        </div>
      )}

      {view === 'formats' && (
          <div className="bg-white p-6 rounded shadow-sm border border-gray-200">
             <h3 className="text-lg font-medium text-gray-700 mb-6 border-b pb-2">Inserir Novo Formato de Acervo</h3>
             <div className="flex gap-2 mb-8 items-end">
                 <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nome do Formato</label>
                    <input 
                        className="w-full border p-2 rounded bg-white text-gray-700 focus:ring-2 focus:ring-primary focus:outline-none"
                        placeholder="Descrição (ex: GIBI, REVISTA)"
                        value={formatName}
                        onChange={e => setFormatName(e.target.value)}
                    />
                 </div>
                 <button onClick={handleFormatSave} className="bg-secondary text-white px-4 py-2 rounded hover:bg-blue-600 h-10 mb-[1px]">Inserir</button>
                 <button onClick={() => setFormatName('')} className="bg-gray-200 text-gray-600 px-4 py-2 rounded hover:bg-gray-300 h-10 mb-[1px]">Cancelar</button>
             </div>

             <h4 className="text-md text-gray-600 mb-4">Lista de Formatos Cadastrados</h4>
             <table className="w-full text-sm text-left text-gray-600 border">
                 <thead className="bg-gray-100 uppercase text-xs">
                     <tr>
                         <th className="px-4 py-2 border">ID</th>
                         <th className="px-4 py-2 border">Descrição</th>
                         <th className="px-4 py-2 border text-right">Ações</th>
                     </tr>
                 </thead>
                 <tbody>
                     {formats.map((fmt, idx) => (
                         <tr key={fmt.id} className="bg-white hover:bg-gray-50">
                             <td className="px-4 py-2 border">{idx + 1}</td>
                             <td className="px-4 py-2 border font-bold">{fmt.name}</td>
                             <td className="px-4 py-2 border text-right">
                                 <button onClick={() => handleFormatDelete(fmt.id)} className="bg-red-500 text-white px-3 py-1 rounded text-xs hover:bg-red-600">Excluir</button>
                             </td>
                         </tr>
                     ))}
                 </tbody>
             </table>
          </div>
      )}

      {view === 'form' && (
        <div className="bg-white p-6 rounded shadow-sm border border-gray-200">
             <h3 className="text-lg font-medium text-gray-700 mb-6 border-b pb-2">{formData.id ? 'Editar' : 'Inserir Novo'} Cadastro</h3>
             
             <div className="grid grid-cols-12 gap-6">
                 {/* Left Column: Cover Image */}
                 <div className="col-span-12 md:col-span-3">
                     <label className="block text-sm font-medium text-gray-700 mb-1 text-center">Capa do Acervo</label>
                     <div 
                        className="w-full aspect-[3/4] bg-gray-200 rounded flex flex-col items-center justify-center border-2 border-dashed border-gray-300 mb-2 overflow-hidden relative cursor-pointer group"
                        onClick={() => fileInputRef.current?.click()}
                     >
                         {formData.coverUrl ? (
                             <img src={formData.coverUrl} alt="Capa" className="w-full h-full object-cover" />
                         ) : (
                             <BookIcon size={64} className="text-gray-400" />
                         )}
                         <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                             <Upload className="text-white" size={32}/>
                         </div>
                     </div>
                     <button 
                        onClick={() => fileInputRef.current?.click()} 
                        className="text-sm text-primary hover:underline w-full text-center font-medium"
                     >
                        Escolher arquivo...
                     </button>
                     <input 
                        type="file" 
                        ref={fileInputRef} 
                        className="hidden" 
                        accept="image/*" 
                        onChange={handleFileChange} 
                     />
                 </div>

                 {/* Right Column: Fields */}
                 <div className="col-span-12 md:col-span-9 space-y-4">
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                         <div>
                             <label className="block text-xs font-bold text-gray-600 mb-1">ISBN</label>
                             <input 
                                className="w-full border p-2 rounded bg-white text-gray-700 focus:ring-2 focus:ring-primary focus:outline-none"
                                placeholder="ISBN"
                                value={formData.isbn || ''}
                                onChange={e => setFormData({...formData, isbn: e.target.value})}
                             />
                         </div>
                         <div>
                             <label className="block text-xs font-bold text-gray-600 mb-1">Pesquisar em:</label>
                             <div className="flex gap-2">
                                 <button 
                                    onClick={() => handleOnlineSearch(formData.isbn || '', 'isbn')} 
                                    className="bg-secondary text-white px-3 py-2 rounded text-xs flex-1 hover:bg-blue-600 flex items-center justify-center"
                                    disabled={isSearching}
                                >
                                     {isSearching ? '...' : 'GoogleBooks'}
                                 </button>
                                 <button 
                                    onClick={() => handleOnlineSearch(formData.title || '', 'title')}
                                    className="bg-secondary text-white px-3 py-2 rounded text-xs flex-1 hover:bg-blue-600 flex items-center justify-center"
                                    disabled={isSearching}
                                >
                                     {isSearching ? '...' : 'OpenLibrary'}
                                 </button>
                             </div>
                             <p className="text-[10px] text-gray-400 mt-1">Resultado da pesquisa preenche os campos automaticamente.</p>
                         </div>
                     </div>

                     <div>
                         <label className="block text-xs font-bold text-gray-600 mb-1">Título</label>
                         <input 
                            className="w-full border p-2 rounded bg-white text-gray-700 focus:ring-2 focus:ring-primary focus:outline-none"
                            placeholder="Título da Obra"
                            value={formData.title || ''}
                            onChange={e => setFormData({...formData, title: e.target.value})}
                         />
                     </div>

                     <div>
                         <label className="block text-xs font-bold text-gray-600 mb-1">Autor</label>
                         <input 
                            className="w-full border p-2 rounded bg-white text-gray-700 focus:ring-2 focus:ring-primary focus:outline-none"
                            placeholder="Nome do Autor"
                            value={formData.author || ''}
                            onChange={e => setFormData({...formData, author: e.target.value})}
                         />
                     </div>

                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                         <div>
                             <label className="block text-xs font-bold text-gray-600 mb-1">Editora</label>
                             <input 
                                className="w-full border p-2 rounded bg-white text-gray-700 focus:ring-2 focus:ring-primary focus:outline-none"
                                placeholder="Editora"
                                value={formData.publisher || ''}
                                onChange={e => setFormData({...formData, publisher: e.target.value})}
                             />
                         </div>
                         <div>
                             <label className="block text-xs font-bold text-gray-600 mb-1">Setor</label>
                             <select
                                className="w-full border p-2 rounded bg-white text-gray-700 focus:ring-2 focus:ring-primary focus:outline-none"
                                value={formData.sector || ''}
                                onChange={e => setFormData({...formData, sector: e.target.value})}
                             >
                                 <option value="">Selecione...</option>
                                 {classes.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                             </select>
                         </div>
                     </div>

                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                         <div>
                             <label className="block text-xs font-bold text-gray-600 mb-1">Área de Conhecimento</label>
                             <select 
                                className="w-full border p-2 rounded bg-white text-gray-700 focus:ring-2 focus:ring-primary focus:outline-none"
                                value={formData.category || ''}
                                onChange={e => setFormData({...formData, category: e.target.value})}
                             >
                                 <option value="">Selecione...</option>
                                 {categories.map(c => <option key={c} value={c}>{c}</option>)}
                             </select>
                         </div>
                         <div>
                             <label className="block text-xs font-bold text-gray-600 mb-1">Formato</label>
                             <select 
                                className="w-full border p-2 rounded bg-white text-gray-700 focus:ring-2 focus:ring-primary focus:outline-none"
                                value={formData.format || ''}
                                onChange={e => setFormData({...formData, format: e.target.value})}
                             >
                                 <option value="">Selecione...</option>
                                 {formats.map(f => <option key={f.id} value={f.name}>{f.name}</option>)}
                             </select>
                         </div>
                     </div>

                     <div className="grid grid-cols-3 gap-4">
                         <div>
                             <label className="block text-xs font-bold text-gray-600 mb-1">Quantidade</label>
                             <input 
                                type="number"
                                className="w-full border p-2 rounded bg-white text-gray-700 focus:ring-2 focus:ring-primary focus:outline-none"
                                value={formData.quantity || ''}
                                onChange={e => setFormData({...formData, quantity: parseInt(e.target.value)})}
                             />
                         </div>
                         <div>
                             <label className="block text-xs font-bold text-gray-600 mb-1">Estante</label>
                             <input 
                                className="w-full border p-2 rounded bg-white text-gray-700 focus:ring-2 focus:ring-primary focus:outline-none"
                                value={formData.shelf || ''}
                                onChange={e => setFormData({...formData, shelf: e.target.value})}
                             />
                         </div>
                         <div>
                             <label className="block text-xs font-bold text-gray-600 mb-1">Prateleira</label>
                             <input 
                                className="w-full border p-2 rounded bg-white text-gray-700 focus:ring-2 focus:ring-primary focus:outline-none"
                                value={formData.shelfLocation || ''}
                                onChange={e => setFormData({...formData, shelfLocation: e.target.value})}
                             />
                         </div>
                     </div>

                     <div>
                        <label className="block text-xs font-bold text-gray-600 mb-1">Sinopse</label>
                        <textarea 
                            className="border p-2 rounded w-full h-24 bg-white text-gray-700 focus:ring-2 focus:ring-primary focus:outline-none"
                            value={formData.synopsis || ''}
                            onChange={e => setFormData({...formData, synopsis: e.target.value})}
                        ></textarea>
                     </div>
                 </div>
             </div>

             <div className="mt-6 flex justify-end gap-2 border-t pt-4">
                <button onClick={() => setView('list')} className="px-4 py-2 bg-gray-200 border rounded text-gray-600 hover:bg-gray-300">Retornar</button>
                <button onClick={() => setView('list')} className="px-4 py-2 border rounded text-gray-600 bg-white hover:bg-gray-50">Cancelar</button>
                <button onClick={handleSave} className="px-6 py-2 bg-secondary text-white rounded hover:bg-blue-600">Submit</button>
             </div>
        </div>
      )}

      {/* Category Modal */}
      {showCategoryModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-96 shadow-xl animate-fade-in">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-medium text-gray-700">Nova Categoria</h3>
                    <button onClick={() => setShowCategoryModal(false)} className="text-gray-400 hover:text-gray-600"><X size={20}/></button>
                </div>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Nome da Categoria</label>
                        <input 
                            className="w-full border p-2 rounded bg-white text-gray-700 focus:ring-2 focus:ring-primary focus:outline-none"
                            value={newCategory}
                            onChange={e => setNewCategory(e.target.value)}
                            autoFocus
                        />
                    </div>
                    <div className="flex justify-end gap-2">
                        <button onClick={() => setShowCategoryModal(false)} className="px-4 py-2 border rounded text-gray-600 hover:bg-gray-50">Cancelar</button>
                        <button onClick={handleAddCategory} className="px-4 py-2 bg-primary text-white rounded hover:bg-primaryDark">Adicionar</button>
                    </div>
                </div>
            </div>
        </div>
      )}

      {/* Labels Modal */}
      {showLabelsModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 w-[800px] h-[80vh] shadow-xl animate-fade-in flex flex-col">
                  <div className="flex justify-between items-center mb-4 border-b pb-2">
                      <h3 className="text-lg font-medium text-gray-700 flex items-center"><Tag className="mr-2"/> Etiquetas de Lombada</h3>
                      <button onClick={() => setShowLabelsModal(false)} className="text-gray-400 hover:text-gray-600"><X size={20}/></button>
                  </div>
                  
                  <div className="flex-1 overflow-y-auto bg-gray-100 p-4 border rounded">
                      <div className="grid grid-cols-4 gap-4 print:grid-cols-4">
                          {books.map(book => (
                              <div key={book.id} className="bg-white border-2 border-dashed border-gray-300 p-2 text-center text-xs flex flex-col items-center justify-center h-24 w-full shadow-sm">
                                  <span className="font-bold text-[10px] uppercase truncate w-full">{book.category.substring(0, 10)}</span>
                                  <span className="text-lg font-bold my-1">{book.shelf}</span>
                                  <span className="text-[9px] uppercase truncate w-full">{book.author.split(' ').pop()?.substring(0, 3)}</span>
                              </div>
                          ))}
                      </div>
                  </div>

                  <div className="mt-4 flex justify-end">
                      <button onClick={() => window.print()} className="bg-primary text-white px-4 py-2 rounded flex items-center hover:bg-primaryDark">
                          <Printer size={16} className="mr-2"/> Imprimir Etiquetas
                      </button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};

export default Books;
