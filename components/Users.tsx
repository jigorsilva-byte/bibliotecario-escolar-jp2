
import React, { useState, useRef, useMemo } from 'react';
import { User, UserRole, AppSettings } from '../types';
import { Edit, Trash2, CreditCard, Save, X, Printer, Users as UsersIcon, FileText, Upload, User as UserIconSVG, Filter } from 'lucide-react';
import * as Storage from '../services/storage';

interface UsersProps {
  users: User[];
  settings?: AppSettings;
  currentUser?: User | null;
}

const Users: React.FC<UsersProps> = ({ users: initialUsers, settings, currentUser }) => {
  const [users, setUsers] = useState(initialUsers);
  const [view, setView] = useState<'list' | 'form' | 'bulk' | 'cards'>('list');
  const [formData, setFormData] = useState<Partial<User>>({});
  
  // Bulk Import State
  const [bulkText, setBulkText] = useState('');
  const [bulkClass, setBulkClass] = useState('');
  
  // Card Generation State
  const [showCardModal, setShowCardModal] = useState(false);
  const [cardUser, setCardUser] = useState<User | null>(null);
  const [cardFilterClass, setCardFilterClass] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSave = () => {
      if(!formData.name || !formData.email) return;

      const newUser: User = {
          id: formData.id || Date.now().toString(),
          name: formData.name,
          email: formData.email,
          password: formData.password || '123456',
          role: formData.role || UserRole.USER,
          phone: formData.phone || '',
          type: formData.type || 'Aluno',
          sectorOrClass: formData.sectorOrClass || '',
          photoUrl: formData.photoUrl
      };

      let updated;
      if(formData.id) {
         updated = users.map(u => u.id === formData.id ? newUser : u);
      } else {
         updated = [...users, newUser];
      }
      
      Storage.saveCollection('users', updated);
      setUsers(updated);
      setView('list');
      setFormData({});
  };

  const handleBulkSave = () => {
      if (!bulkText) return;

      const lines = bulkText.split('\n');
      const newUsers: User[] = [];

      lines.forEach(line => {
          // Format: Name; Email; Phone (optional)
          const parts = line.split(';').map(p => p.trim());
          if (parts.length >= 2 && parts[0] && parts[1]) {
              newUsers.push({
                  id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
                  name: parts[0],
                  email: parts[1],
                  password: '123456', // Default password
                  phone: parts[2] || '',
                  type: 'Aluno',
                  role: UserRole.USER,
                  sectorOrClass: bulkClass || 'Geral'
              });
          }
      });

      if (newUsers.length > 0) {
          const updated = [...users, ...newUsers];
          Storage.saveCollection('users', updated);
          setUsers(updated);
          alert(`${newUsers.length} usuários cadastrados com sucesso!`);
          setBulkText('');
          setView('list');
      } else {
          alert('Nenhum dado válido encontrado. Use o formato: Nome; E-mail');
      }
  };

  const handleEdit = (user: User) => {
      setFormData(user);
      setView('form');
  };

  const handleDelete = (id: string) => {
      if(confirm('Tem certeza que deseja excluir?')) {
          const updated = users.filter(u => u.id !== id);
          Storage.saveCollection('users', updated);
          setUsers(updated);
      }
  };
  
  const handleGenerateCard = (user?: User) => {
      if(user) {
          setCardUser(user);
          setShowCardModal(true);
      } else {
          setView('cards');
      }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, photoUrl: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  // Filter users for bulk card printing
  const usersForCards = useMemo(() => {
      if (!cardFilterClass) return users;
      return users.filter(u => u.sectorOrClass?.toLowerCase().includes(cardFilterClass.toLowerCase()));
  }, [users, cardFilterClass]);

  const uniqueClasses = Array.from(new Set(users.map(u => u.sectorOrClass).filter(Boolean)));

  return (
    <div className="space-y-6 animate-fade-in relative">
      <div className="flex flex-col space-y-2">
        <h2 className="text-xl font-medium text-gray-600">Cadastrar/Editar/Listar Usuários</h2>
        <div className="flex flex-wrap gap-2">
          <button 
            onClick={() => { setFormData({}); setView('form'); }}
            className={`px-4 py-2 rounded text-white text-sm font-medium ${view === 'form' ? 'bg-teal-600' : 'bg-primary hover:bg-primaryDark'}`}
          >
            Novo Cadastro Individual
          </button>
          <button 
            onClick={() => setView('bulk')}
            className={`px-4 py-2 rounded text-white text-sm font-medium ${view === 'bulk' ? 'bg-cyan-600' : 'bg-cyan-500 hover:bg-cyan-600'}`}
          >
            Novo Cadastro Lista
          </button>
          <button 
             onClick={() => setView('list')}
             className={`px-4 py-2 rounded text-white text-sm font-medium ${view === 'list' ? 'bg-blue-700' : 'bg-blue-700 hover:bg-blue-800'}`}
          >
             Tabela
          </button>
          <button 
             onClick={() => setView('cards')}
             className={`px-4 py-2 rounded text-white text-sm font-medium flex items-center ${view === 'cards' ? 'bg-orange-600' : 'bg-orange-500 hover:bg-orange-600'}`}
          >
             <CreditCard size={16} className="mr-2"/> Carteiras
          </button>
        </div>
      </div>

      {view === 'list' && (
      <div className="bg-white rounded shadow-sm border border-gray-200">
          <div className="p-4 border-b flex justify-between items-center bg-gray-50 rounded-t">
             <h3 className="text-lg text-gray-600">Tabela de Usuários</h3>
          </div>
          
          <div className="p-4 overflow-x-auto">
             <table className="w-full text-sm text-left text-gray-600">
                <thead className="text-xs text-gray-700 uppercase bg-gray-100">
                    <tr>
                        <th className="px-4 py-3">#</th>
                        <th className="px-4 py-3">Nome</th>
                        <th className="px-4 py-3">Turma/Setor</th>
                        <th className="px-4 py-3">Nível</th>
                        <th className="px-4 py-3">Fone</th>
                        <th className="px-4 py-3">Login</th>
                        <th className="px-4 py-3 text-center">Ações</th>
                    </tr>
                </thead>
                <tbody>
                    {users.map((user, idx) => (
                        <tr key={user.id} className="bg-white border-b hover:bg-gray-50">
                            <td className="px-4 py-3 font-medium">{idx + 1}</td>
                            <td className="px-4 py-3 font-bold text-gray-800">{user.name}</td>
                            <td className="px-4 py-3">{user.sectorOrClass || '-'}</td>
                            <td className="px-4 py-3">{user.role === 'ADMIN' ? 'Administrador' : user.type}</td>
                            <td className="px-4 py-3">{user.phone}</td>
                            <td className="px-4 py-3">{user.email}</td>
                            <td className="px-4 py-3">
                                <div className="flex justify-center space-x-1">
                                    <button 
                                        onClick={() => handleGenerateCard(user)}
                                        title="Gerar Carteirinha Individual"
                                        className="p-1.5 bg-orange-400 text-white rounded hover:bg-orange-500"
                                    >
                                        <CreditCard size={14}/>
                                    </button>
                                    <button onClick={() => handleEdit(user)} className="p-1.5 bg-yellow-400 text-white rounded hover:bg-yellow-500"><Edit size={14}/></button>
                                    <button onClick={() => handleDelete(user.id)} className="p-1.5 bg-danger text-white rounded hover:bg-red-600"><Trash2 size={14}/></button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
             </table>
          </div>
      </div>
      )}

      {view === 'cards' && (
          <div className="bg-white p-6 rounded shadow-sm border border-gray-200">
              <div className="flex justify-between items-center mb-6 border-b pb-4 no-print">
                  <h3 className="text-lg font-medium text-gray-700 flex items-center">
                      <CreditCard className="mr-2" /> Impressão de Carteirinhas em Lote
                  </h3>
                  <div className="flex gap-4">
                      <select 
                        className="border p-2 rounded bg-white text-gray-700 text-sm focus:ring-2 focus:ring-primary focus:outline-none"
                        value={cardFilterClass}
                        onChange={(e) => setCardFilterClass(e.target.value)}
                      >
                          <option value="">Todas as Turmas</option>
                          {uniqueClasses.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                      <button onClick={() => window.print()} className="bg-primary text-white px-4 py-2 rounded hover:bg-primaryDark flex items-center">
                          <Printer size={16} className="mr-2"/> Imprimir Página
                      </button>
                  </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 print:grid-cols-2 print:gap-4">
                  {usersForCards.map(user => (
                      <div key={user.id} className="border-2 border-primary rounded-lg p-3 bg-white relative overflow-hidden break-inside-avoid page-break-avoid h-48 flex flex-col justify-between">
                          {/* Card Design */}
                          <div className="absolute top-0 right-0 w-12 h-12 bg-primary opacity-10 rounded-bl-full"></div>
                          
                          <div className="text-center border-b border-gray-300 pb-1 mb-2">
                              <h4 className="font-bold text-gray-800 text-xs truncate uppercase">{settings?.institutionName || "BIBLIOTECA ESCOLAR"}</h4>
                              <p className="text-[9px] text-gray-500">Cartão de Identificação</p>
                          </div>

                          <div className="flex items-center flex-1">
                              <div className="w-16 h-20 bg-gray-200 rounded border border-gray-300 flex-shrink-0 overflow-hidden">
                                  {user.photoUrl ? (
                                      <img src={user.photoUrl} className="w-full h-full object-cover" />
                                  ) : (
                                      <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs"><UserIconSVG size={24}/></div>
                                  )}
                              </div>
                              <div className="ml-3 space-y-1 overflow-hidden">
                                  <div>
                                      <p className="text-[8px] text-gray-500 uppercase">Nome</p>
                                      <p className="text-sm font-bold text-gray-800 leading-tight truncate">{user.name}</p>
                                  </div>
                                  <div>
                                      <p className="text-[8px] text-gray-500 uppercase">Categoria / Turma</p>
                                      <p className="text-xs text-gray-700 truncate">{user.type} {user.sectorOrClass && ` - ${user.sectorOrClass}`}</p>
                                  </div>
                                  <div>
                                      <p className="text-[8px] text-gray-500 uppercase">Matrícula</p>
                                      <p className="text-xs text-gray-700 font-mono">{user.id}</p>
                                  </div>
                              </div>
                          </div>
                          <div className="mt-2 pt-1 border-t border-gray-300 flex justify-between items-center">
                              <div className="h-4 w-20 bg-black"></div> {/* Simulated Barcode */}
                              <p className="text-[8px] text-gray-400">Válido: {new Date().getFullYear()}</p>
                          </div>
                      </div>
                  ))}
              </div>
          </div>
      )}

      {view === 'form' && (
        <div className="bg-white p-6 rounded shadow-sm border border-gray-200">
             <h3 className="text-lg font-medium text-gray-700 mb-6 border-b pb-2">{formData.id ? 'Editar' : 'Novo'} Cadastro de Usuário</h3>
             
             <div className="flex items-center space-x-6 mb-6">
                 <div className="relative group cursor-pointer w-24 h-24 rounded-full bg-gray-200 overflow-hidden border border-gray-300" onClick={() => fileInputRef.current?.click()}>
                    {formData.photoUrl ? (
                        <img src={formData.photoUrl} className="w-full h-full object-cover" alt="Foto" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400"><UserIconSVG size={32}/></div>
                    )}
                    <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Upload className="text-white" size={20}/>
                    </div>
                 </div>
                 <div>
                     <p className="text-sm font-medium text-gray-700">Foto do Perfil</p>
                     <button onClick={() => fileInputRef.current?.click()} className="text-xs text-primary hover:underline">Escolher arquivo...</button>
                     <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
                 </div>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div className="col-span-1 md:col-span-2">
                     <label className="block text-sm font-medium text-gray-700 mb-1">Nome Completo *</label>
                     <input 
                        className="w-full border p-2 rounded bg-white text-gray-700 focus:ring-2 focus:ring-primary focus:outline-none"
                        value={formData.name || ''}
                        onChange={e => setFormData({...formData, name: e.target.value})}
                     />
                 </div>
                 <div>
                     <label className="block text-sm font-medium text-gray-700 mb-1">E-mail (Login) *</label>
                     <input 
                        className="w-full border p-2 rounded bg-white text-gray-700 focus:ring-2 focus:ring-primary focus:outline-none"
                        value={formData.email || ''}
                        onChange={e => setFormData({...formData, email: e.target.value})}
                     />
                 </div>
                 <div>
                     <label className="block text-sm font-medium text-gray-700 mb-1">Senha</label>
                     <input 
                        type="password"
                        className="w-full border p-2 rounded bg-white text-gray-700 focus:ring-2 focus:ring-primary focus:outline-none"
                        value={formData.password || ''}
                        placeholder="Padrão: 123456"
                        onChange={e => setFormData({...formData, password: e.target.value})}
                     />
                 </div>
                 <div>
                     <label className="block text-sm font-medium text-gray-700 mb-1">Telefone / WhatsApp</label>
                     <input 
                        className="w-full border p-2 rounded bg-white text-gray-700 focus:ring-2 focus:ring-primary focus:outline-none"
                        value={formData.phone || ''}
                        onChange={e => setFormData({...formData, phone: e.target.value})}
                     />
                 </div>
                 <div>
                     <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Usuário (Categoria)</label>
                     <select 
                        className="w-full border p-2 rounded bg-white text-gray-700 focus:ring-2 focus:ring-primary focus:outline-none"
                        value={formData.type || 'Aluno'}
                        onChange={e => setFormData({...formData, type: e.target.value as any})}
                     >
                         <option value="Aluno">Aluno</option>
                         <option value="Professor">Professor</option>
                         <option value="Funcionário">Funcionário</option>
                     </select>
                 </div>
                 <div>
                     <label className="block text-sm font-medium text-gray-700 mb-1">Turma / Setor</label>
                     <input 
                        className="w-full border p-2 rounded bg-white text-gray-700 focus:ring-2 focus:ring-primary focus:outline-none"
                        value={formData.sectorOrClass || ''}
                        onChange={e => setFormData({...formData, sectorOrClass: e.target.value})}
                     />
                 </div>
                 <div>
                     <label className="block text-sm font-medium text-gray-700 mb-1">Perfil de Acesso</label>
                     <select 
                        className="w-full border p-2 rounded bg-white text-gray-700 focus:ring-2 focus:ring-primary focus:outline-none"
                        value={formData.role || UserRole.USER}
                        disabled={currentUser?.role !== UserRole.ADMIN}
                        title={currentUser?.role !== UserRole.ADMIN ? "Apenas administradores podem alterar isso" : ""}
                        onChange={e => setFormData({...formData, role: e.target.value as UserRole})}
                     >
                         <option value={UserRole.USER}>Usuário Comum (Leitor)</option>
                         <option value={UserRole.ADMIN}>Administrador (Bibliotecário)</option>
                     </select>
                 </div>
             </div>
             
             <div className="mt-6 flex justify-end gap-2">
                <button onClick={() => setView('list')} className="px-4 py-2 border rounded text-gray-600 hover:bg-gray-50 bg-white flex items-center">
                    <X size={16} className="mr-1"/> Cancelar
                </button>
                <button onClick={handleSave} className="px-4 py-2 bg-primary text-white rounded hover:bg-primaryDark flex items-center">
                    <Save size={16} className="mr-1"/> Salvar Usuário
                </button>
             </div>
        </div>
      )}

      {view === 'bulk' && (
         <div className="bg-white p-6 rounded shadow-sm border border-gray-200">
             <h3 className="text-lg font-medium text-gray-700 mb-2 border-b pb-2 flex items-center">
                 <UsersIcon className="mr-2" /> Cadastro em Lote (Lista)
             </h3>
             <div className="p-4 bg-blue-50 text-blue-800 rounded text-sm mb-4">
                 Cole a lista de alunos abaixo. O sistema criará usuários automaticamente com a senha padrão <strong>123456</strong>.
                 <br/>
                 <strong>Formato obrigatório por linha:</strong> Nome do Aluno; E-mail (Opcional: ; Telefone)
             </div>

             <div className="mb-4">
                 <label className="block text-sm font-medium text-gray-700 mb-1">Turma Padrão para esta Lista (Opcional)</label>
                 <input 
                    className="w-full border p-2 rounded bg-white text-gray-700 focus:ring-2 focus:ring-primary focus:outline-none"
                    placeholder="Ex: 1º Ano A"
                    value={bulkClass}
                    onChange={e => setBulkClass(e.target.value)}
                 />
             </div>

             <div className="mb-4">
                 <label className="block text-sm font-medium text-gray-700 mb-1">Lista de Dados</label>
                 <textarea 
                    className="w-full h-64 border p-2 rounded bg-white text-gray-700 font-mono text-sm focus:ring-2 focus:ring-primary focus:outline-none"
                    placeholder={`Ana Silva; ana@escola.com\nCarlos Souza; carlos@escola.com\nPedro Santos; pedro@escola.com`}
                    value={bulkText}
                    onChange={e => setBulkText(e.target.value)}
                 ></textarea>
             </div>

             <div className="flex justify-end gap-2">
                 <button onClick={() => setView('list')} className="px-4 py-2 border rounded text-gray-600 hover:bg-gray-50 bg-white">Cancelar</button>
                 <button onClick={handleBulkSave} className="px-4 py-2 bg-cyan-600 text-white rounded hover:bg-cyan-700 flex items-center">
                     <FileText size={16} className="mr-2"/> Processar Lista
                 </button>
             </div>
         </div>
      )}

      {/* Single Card Preview Modal (Kept for table usage) */}
      {showCardModal && cardUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-96 shadow-xl animate-fade-in relative">
                <button onClick={() => setShowCardModal(false)} className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"><X size={20}/></button>
                
                <h3 className="text-lg font-medium text-gray-700 mb-4 flex items-center">
                    <CreditCard className="mr-2" size={20}/> Carteira da Biblioteca
                </h3>

                <div className="border-2 border-primary rounded-lg p-4 bg-gray-50 mb-4 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-16 h-16 bg-primary opacity-10 rounded-bl-full"></div>
                    
                    <div className="text-center border-b border-gray-300 pb-2 mb-3">
                        <h4 className="font-bold text-gray-800 text-sm">{settings?.institutionName || "BIBLIOTECÁRIO ESCOLAR 3.0"}</h4>
                        <p className="text-[10px] text-gray-500">Cartão de Identificação</p>
                    </div>

                    <div className="flex items-center">
                        <div className="w-20 h-24 bg-gray-200 rounded border border-gray-300 flex-shrink-0 overflow-hidden">
                             {cardUser.photoUrl ? (
                                 <img src={cardUser.photoUrl} className="w-full h-full object-cover" />
                             ) : (
                                 <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">Sem Foto</div>
                             )}
                        </div>
                        <div className="ml-3 space-y-1">
                            <div>
                                <p className="text-[10px] text-gray-500 uppercase">Nome do Usuário</p>
                                <p className="text-sm font-bold text-gray-800 leading-tight">{cardUser.name}</p>
                            </div>
                            <div>
                                <p className="text-[10px] text-gray-500 uppercase">Categoria / Turma</p>
                                <p className="text-xs text-gray-700">{cardUser.type} {cardUser.sectorOrClass && ` - ${cardUser.sectorOrClass}`}</p>
                            </div>
                            <div>
                                <p className="text-[10px] text-gray-500 uppercase">Matrícula/ID</p>
                                <p className="text-xs text-gray-700 font-mono">{cardUser.id}</p>
                            </div>
                        </div>
                    </div>
                    <div className="mt-4 pt-2 border-t border-gray-300 flex justify-between items-center">
                         <div className="h-6 w-24 bg-black"></div> 
                         <p className="text-[9px] text-gray-400">Válido até: Dez/{new Date().getFullYear()}</p>
                    </div>
                </div>

                <button onClick={() => window.print()} className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 flex items-center justify-center">
                    <Printer size={16} className="mr-2"/> Imprimir Carteira
                </button>
            </div>
        </div>
      )}
    </div>
  );
};

export default Users;
