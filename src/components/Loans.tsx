
import React, { useState, useEffect } from 'react';
import { Loan, Book, User, UserRole } from '../types';
import { Printer, MessageCircle, Edit, Trash2, CheckSquare, Search, Save, X, AlertCircle, CalendarPlus, Filter } from 'lucide-react';
import * as Storage from '../services/storage';

interface LoansProps {
  loans: Loan[];
  books: Book[];
  users: User[];
  onUpdateLoans: (loans: Loan[]) => void;
  onUpdateBooks: (books: Book[]) => void;
  currentUser: User | null;
}

const Loans: React.FC<LoansProps> = ({ loans, books, users, onUpdateLoans, onUpdateBooks, currentUser }) => {
  const [view, setView] = useState<'list' | 'form' | 'edit'>('list');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Filters State
  const [statusFilter, setStatusFilter] = useState('');
  const [dueDateStart, setDueDateStart] = useState('');
  const [dueDateEnd, setDueDateEnd] = useState('');
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  
  // Form State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState('');
  const [selectedBook, setSelectedBook] = useState('');
  const [loanDate, setLoanDate] = useState(new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState('');
  const [status, setStatus] = useState<any>('Emprestado');

  const isAdmin = currentUser?.role === UserRole.ADMIN;

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, dueDateStart, dueDateEnd, itemsPerPage]);

  const handleSave = () => {
    if (editingId) {
        // Update Existing Loan
        const updatedLoans = loans.map(l => {
            if (l.id === editingId) {
                return {
                    ...l,
                    loanDate,
                    dueDate,
                    status
                }
            }
            return l;
        }) as Loan[];
        
        Storage.saveCollection('loans', updatedLoans);
        onUpdateLoans(updatedLoans);
        setEditingId(null);
        setView('list');

    } else {
        // Create New Loan
        const user = users.find(u => u.id === selectedUser);
        const book = books.find(b => b.id === selectedBook);

        if (user && book) {
            // Inventory Check
            if (book.available <= 0) {
                alert("Este livro não possui exemplares disponíveis para empréstimo no momento.");
                return;
            }

            const newLoan: Loan = {
                id: Date.now().toString(),
                userId: user.id,
                userName: user.name,
                bookId: book.id,
                bookTitle: book.title,
                loanDate,
                dueDate,
                status: 'Emprestado'
            };
            
            // Update Loans
            const updatedLoans = [...loans, newLoan];
            Storage.saveCollection('loans', updatedLoans);
            onUpdateLoans(updatedLoans);

            // Update Inventory (Decrease Availability)
            const updatedBooks = books.map(b => 
                b.id === book.id ? { ...b, available: b.available - 1 } : b
            );
            Storage.saveCollection('books', updatedBooks);
            onUpdateBooks(updatedBooks);

            // Reset & Redirect
            setSelectedBook('');
            setSelectedUser('');
            setDueDate('');
            setView('list');
        }
    }
  };

  const startEdit = (loan: Loan) => {
      setEditingId(loan.id);
      setSelectedUser(loan.userId);
      setSelectedBook(loan.bookId);
      setLoanDate(loan.loanDate);
      setDueDate(loan.dueDate);
      setStatus(loan.status);
      setView('edit');
  };

  const handleReturn = (loan: Loan) => {
    if (confirm(`Confirmar a devolução do livro "${loan.bookTitle}"?`)) {
        // Update Loan Status
        const updatedLoans = loans.map(l => 
            l.id === loan.id ? { ...l, status: 'Devolvido', returnDate: new Date().toISOString().split('T')[0] } : l
        ) as Loan[];
        
        Storage.saveCollection('loans', updatedLoans);
        onUpdateLoans(updatedLoans);

        // Update Inventory (Increase Availability)
        const updatedBooks = books.map(b => 
            b.id === loan.bookId ? { ...b, available: b.available + 1 } : b
        );
        Storage.saveCollection('books', updatedBooks);
        onUpdateBooks(updatedBooks);
    }
  };

  const handleRenew = (loan: Loan) => {
      if (confirm(`Renovar o empréstimo de "${loan.bookTitle}" por mais 7 dias a partir de hoje?`)) {
          const today = new Date();
          // Add 7 days from today
          today.setDate(today.getDate() + 7);
          const newDateStr = today.toISOString().split('T')[0];

          const updatedLoans = loans.map(l => 
              l.id === loan.id ? { ...l, dueDate: newDateStr, status: 'Emprestado' } : l
          ) as Loan[];

          Storage.saveCollection('loans', updatedLoans);
          onUpdateLoans(updatedLoans);
      }
  };

  const handleDelete = (id: string, bookId: string) => {
      if(confirm('Tem certeza que deseja excluir este registro de empréstimo? Se o livro não foi devolvido, o estoque será corrigido.')) {
          const loan = loans.find(l => l.id === id);
          const updatedLoans = loans.filter(l => l.id !== id);
          Storage.saveCollection('loans', updatedLoans);
          onUpdateLoans(updatedLoans);

          // If deleting an active loan, restore inventory
          if (loan && loan.status !== 'Devolvido') {
             const updatedBooks = books.map(b => 
                b.id === bookId ? { ...b, available: b.available + 1 } : b
             );
             Storage.saveCollection('books', updatedBooks);
             onUpdateBooks(updatedBooks);
          }
      }
  };

  const handleWhatsApp = (loan: Loan) => {
      const user = users.find(u => u.id === loan.userId);
      if (!user || !user.phone) {
          alert("Este usuário não possui telefone cadastrado para contato.");
          return;
      }
      
      // Limpar formatação do telefone
      let phone = user.phone.replace(/\D/g, '');
      // Adicionar 55 se parecer um número brasileiro sem DDI
      if (phone.length >= 10 && phone.length <= 11) {
          phone = '55' + phone;
      }

      const message = `Olá ${user.name}, aviso da Biblioteca Escolar:\n\nReferente ao livro: *${loan.bookTitle}*\nData de Devolução Prevista: ${new Date(loan.dueDate).toLocaleDateString('pt-BR')}\nStatus Atual: ${loan.status}\n\nPor favor, regularize sua situação ou renove o empréstimo.`;
      
      const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
      window.open(url, '_blank');
  };

  const handlePrintLoans = () => {
    const settings = Storage.getSettings();
    const printWindow = window.open('', '', 'height=600,width=900');
    
    if (printWindow) {
        printWindow.document.write('<html><head><title>Relatório de Empréstimos</title>');
        printWindow.document.write(`
            <style>
                body { font-family: sans-serif; padding: 20px; }
                h1 { text-align: center; font-size: 18px; margin-bottom: 5px; }
                h2 { text-align: center; font-size: 14px; color: #666; margin-top: 0; margin-bottom: 20px; }
                table { width: 100%; border-collapse: collapse; font-size: 12px; }
                th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                th { background-color: #f2f2f2; }
                .status-devolvido { color: green; }
                .status-atrasado { color: red; font-weight: bold; }
            </style>
        `);
        printWindow.document.write('</head><body>');
        printWindow.document.write(`<h1>${settings.institutionName}</h1>`);
        printWindow.document.write(`<h2>Relatório Geral de Empréstimos - Gerado em ${new Date().toLocaleDateString()}</h2>`);
        
        printWindow.document.write('<table>');
        printWindow.document.write('<thead><tr><th>Usuário</th><th>Livro</th><th>Data Empréstimo</th><th>Prev. Devolução</th><th>Situação</th></tr></thead>');
        printWindow.document.write('<tbody>');
        
        filteredLoans.forEach(loan => {
            const isLate = loan.status !== 'Devolvido' && isOverdue(loan.dueDate);
            const displayStatus = isLate ? 'Atrasado' : loan.status;
            const statusClass = displayStatus === 'Devolvido' ? 'status-devolvido' : displayStatus === 'Atrasado' ? 'status-atrasado' : '';
            
            printWindow.document.write(`
                <tr>
                    <td>${loan.userName}</td>
                    <td>${loan.bookTitle}</td>
                    <td>${new Date(loan.loanDate).toLocaleDateString()}</td>
                    <td>${new Date(loan.dueDate).toLocaleDateString()}</td>
                    <td class="${statusClass}">${displayStatus}</td>
                </tr>
            `);
        });
        
        printWindow.document.write('</tbody></table>');
        printWindow.document.write('</body></html>');
        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => {
            printWindow.print();
            printWindow.close();
        }, 500);
    }
  };

  const isOverdue = (date: string) => {
    return new Date(date) < new Date() && new Date().toISOString().split('T')[0] !== date;
  };

  const filteredLoans = loans.filter(l => {
    const matchesSearch = l.userName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          l.bookTitle.toLowerCase().includes(searchTerm.toLowerCase());

    // Determine status displayed to user (Dynamic 'Atrasado')
    let effectiveStatus = l.status;
    if (l.status !== 'Devolvido' && isOverdue(l.dueDate)) {
        effectiveStatus = 'Atrasado';
    }

    const matchesStatus = statusFilter ? effectiveStatus === statusFilter : true;

    let matchesDate = true;
    if (dueDateStart) {
        matchesDate = matchesDate && l.dueDate >= dueDateStart;
    }
    if (dueDateEnd) {
        matchesDate = matchesDate && l.dueDate <= dueDateEnd;
    }

    return matchesSearch && matchesStatus && matchesDate;
  });

  // Pagination Logic
  const totalPages = Math.ceil(filteredLoans.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentLoans = filteredLoans.slice(startIndex, startIndex + itemsPerPage);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
        setCurrentPage(newPage);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col space-y-2">
        <h2 className="text-xl font-medium text-gray-600">Empréstimos</h2>
        <div className="flex space-x-2">
          {isAdmin && (
              <button 
                onClick={() => { setEditingId(null); setView('form'); }}
                className={`px-4 py-2 rounded text-white text-sm font-medium ${view === 'form' ? 'bg-teal-600' : 'bg-primary hover:bg-primaryDark'}`}
              >
                Registrar Novo Empréstimo
              </button>
          )}
          <button 
            onClick={() => setView('list')}
            className={`px-4 py-2 rounded text-white text-sm font-medium ${view === 'list' ? 'bg-blue-700' : 'bg-secondary hover:bg-blue-600'}`}
          >
            Visualizar Tabela Geral
          </button>
        </div>
      </div>

      {view === 'list' ? (
        <div className="bg-white rounded shadow-sm border border-gray-200">
          <div className="p-4 border-b flex justify-between items-center bg-gray-50 rounded-t">
             <h3 className="text-lg text-gray-600">Tabela Geral de Empréstimos</h3>
             <button onClick={handlePrintLoans} className="bg-blue-400 text-white px-3 py-1 rounded text-sm hover:bg-blue-500 flex items-center">
                <Printer size={16} className="mr-2" /> Imprimir
             </button>
          </div>
          
          <div className="p-4">
             {/* Search and Display Options */}
             <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-4">
                <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600">Exibir</span>
                    <select 
                        className="border rounded p-1 text-sm bg-white text-gray-700"
                        value={itemsPerPage}
                        onChange={(e) => setItemsPerPage(Number(e.target.value))}
                    >
                        <option value={10}>10</option>
                        <option value={25}>25</option>
                        <option value={50}>50</option>
                    </select>
                    <span className="text-sm text-gray-600">resultados por página</span>
                </div>
                <div className="flex items-center w-full md:w-auto">
                    <span className="text-sm text-gray-600 mr-2">Pesquisar</span>
                    <div className="relative w-full">
                        <input 
                            type="text" 
                            className="border rounded pl-2 pr-8 py-1 text-sm focus:outline-none focus:border-primary bg-white text-gray-700 w-full" 
                            placeholder="Buscar registros"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <Search size={14} className="absolute right-2 top-2 text-gray-400"/>
                    </div>
                </div>
             </div>

             {/* Advanced Filters */}
             <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6 p-3 bg-gray-50 rounded border border-gray-200">
                <div className="flex flex-col">
                    <label className="text-xs font-semibold text-gray-500 mb-1 flex items-center"><Filter size={12} className="mr-1"/> Situação</label>
                    <select 
                        className="border rounded p-1.5 text-sm bg-white text-gray-700 focus:outline-none focus:border-primary"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                    >
                        <option value="">Todas</option>
                        <option value="Emprestado">Emprestado (Em dia)</option>
                        <option value="Devolvido">Devolvido</option>
                        <option value="Atrasado">Atrasado</option>
                    </select>
                </div>
                <div className="flex flex-col">
                    <label className="text-xs font-semibold text-gray-500 mb-1">Devolução (Início)</label>
                    <input 
                        type="date"
                        className="border rounded p-1.5 text-sm bg-white text-gray-700 focus:outline-none focus:border-primary"
                        value={dueDateStart}
                        onChange={(e) => setDueDateStart(e.target.value)}
                    />
                </div>
                <div className="flex flex-col">
                    <label className="text-xs font-semibold text-gray-500 mb-1">Devolução (Fim)</label>
                    <input 
                        type="date"
                        className="border rounded p-1.5 text-sm bg-white text-gray-700 focus:outline-none focus:border-primary"
                        value={dueDateEnd}
                        onChange={(e) => setDueDateEnd(e.target.value)}
                    />
                </div>
                <div className="flex items-end">
                    <button 
                        onClick={() => { setStatusFilter(''); setDueDateStart(''); setDueDateEnd(''); setSearchTerm(''); }}
                        className="text-sm text-primary hover:underline mb-1 w-full text-left md:text-center"
                    >
                        Limpar Filtros
                    </button>
                </div>
             </div>

             <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-600">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-100">
                        <tr>
                            <th className="px-4 py-3">#</th>
                            <th className="px-4 py-3">Usuário</th>
                            <th className="px-4 py-3">Título do Item</th>
                            <th className="px-4 py-3">Data Empréstimo</th>
                            <th className="px-4 py-3">Data Devolução</th>
                            <th className="px-4 py-3">Situação</th>
                            {isAdmin && <th className="px-4 py-3 text-center">Opções</th>}
                        </tr>
                    </thead>
                    <tbody>
                        {currentLoans.length > 0 ? currentLoans.map((loan, idx) => (
                            <tr key={loan.id} className="bg-white border-b hover:bg-gray-50">
                                <td className="px-4 py-3 font-medium text-gray-900">{startIndex + idx + 1}</td>
                                <td className="px-4 py-3">{loan.userName}</td>
                                <td className="px-4 py-3">{loan.bookTitle}</td>
                                <td className="px-4 py-3">{new Date(loan.loanDate).toLocaleDateString()}</td>
                                <td className="px-4 py-3">
                                    <span className={loan.status !== 'Devolvido' && isOverdue(loan.dueDate) ? 'text-red-600 font-bold' : ''}>
                                        {new Date(loan.dueDate).toLocaleDateString()}
                                    </span>
                                </td>
                                <td className="px-4 py-3">
                                    <span className={`px-2 py-1 rounded text-xs font-semibold 
                                        ${loan.status === 'Devolvido' ? 'bg-green-100 text-green-800' : 
                                          loan.status === 'Atrasado' || isOverdue(loan.dueDate) ? 'bg-red-100 text-red-800' : 
                                          'bg-blue-100 text-blue-800'}`}>
                                        {loan.status !== 'Devolvido' && isOverdue(loan.dueDate) ? 'Atrasado' : loan.status}
                                    </span>
                                </td>
                                {isAdmin && (
                                    <td className="px-4 py-3">
                                        <div className="flex justify-center space-x-1">
                                            <button 
                                                title="Devolver" 
                                                onClick={() => handleReturn(loan)}
                                                disabled={loan.status === 'Devolvido'}
                                                className={`p-1.5 rounded text-white ${loan.status === 'Devolvido' ? 'bg-gray-300' : 'bg-blue-500 hover:bg-blue-600'}`}>
                                                <CheckSquare size={16} />
                                            </button>
                                            
                                            {/* Botão Renovar - Apenas se não devolvido e não atrasado */}
                                            {loan.status !== 'Devolvido' && !isOverdue(loan.dueDate) && (
                                                <button
                                                    onClick={() => handleRenew(loan)}
                                                    title="Renovar por 7 dias"
                                                    className="bg-indigo-500 p-1.5 rounded text-white hover:bg-indigo-600"
                                                >
                                                    <CalendarPlus size={16} />
                                                </button>
                                            )}

                                            <button 
                                                onClick={() => handleWhatsApp(loan)}
                                                title="Enviar WhatsApp"
                                                className="bg-green-500 p-1.5 rounded text-white hover:bg-green-600"
                                            >
                                                <MessageCircle size={16} />
                                            </button>
                                            <button onClick={() => startEdit(loan)} title="Editar" className="bg-yellow-400 p-1.5 rounded text-white hover:bg-yellow-500"><Edit size={16} /></button>
                                            <button onClick={() => handleDelete(loan.id, loan.bookId)} title="Excluir" className="bg-danger p-1.5 rounded text-white hover:bg-red-600"><Trash2 size={16} /></button>
                                        </div>
                                    </td>
                                )}
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan={isAdmin ? 7 : 6} className="px-4 py-8 text-center text-gray-400">Nenhum registro encontrado</td>
                            </tr>
                        )}
                    </tbody>
                </table>
             </div>

             {/* Pagination Controls */}
             {filteredLoans.length > 0 && (
                 <div className="flex flex-col sm:flex-row justify-between items-center mt-4 gap-4">
                    <span className="text-sm text-gray-600">
                        Mostrando {startIndex + 1} até {Math.min(startIndex + itemsPerPage, filteredLoans.length)} de {filteredLoans.length} registros
                    </span>
                    <div className="flex space-x-2">
                        <button
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                            className="px-3 py-1 border rounded text-sm disabled:opacity-50 hover:bg-gray-50 bg-white text-gray-700"
                        >
                            Anterior
                        </button>
                        <span className="px-3 py-1 text-sm bg-white border rounded text-gray-700">
                            Página {currentPage} de {totalPages || 1}
                        </span>
                        <button
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage === totalPages || totalPages === 0}
                            className="px-3 py-1 border rounded text-sm disabled:opacity-50 hover:bg-gray-50 bg-white text-gray-700"
                        >
                            Próximo
                        </button>
                    </div>
                 </div>
             )}
          </div>
        </div>
      ) : view === 'edit' ? (
          /* EDIT MODE */
        <div className="bg-white p-6 rounded shadow-sm border border-gray-200 max-w-4xl">
             <div className="flex justify-between items-center border-b pb-4 mb-6">
                <h3 className="text-lg font-medium text-gray-700">Editar Empréstimo</h3>
                <div className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded">
                    Editando ID: {editingId}
                </div>
             </div>
             
             <div className="p-4 bg-blue-50 text-blue-800 rounded mb-6 text-sm">
                 <strong>Nota:</strong> Para manter a integridade do estoque, não é possível alterar o Usuário ou o Livro na edição. 
                 Se houver erro nestes campos, exclua este empréstimo e crie um novo.
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Usuário (Leitura)</label>
                    <input disabled className="w-full border p-2 rounded bg-gray-100 text-gray-500" value={users.find(u=>u.id===selectedUser)?.name || ''} />
                 </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Livro (Leitura)</label>
                    <input disabled className="w-full border p-2 rounded bg-gray-100 text-gray-500" value={books.find(b=>b.id===selectedBook)?.title || ''} />
                 </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Data Empréstimo</label>
                    <input 
                        type="date" 
                        className="w-full border rounded p-2 bg-white text-gray-700"
                        value={loanDate}
                        onChange={e => setLoanDate(e.target.value)}
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Data Devolução Prevista</label>
                    <input 
                        type="date" 
                        className="w-full border rounded p-2 bg-white text-gray-700"
                        value={dueDate}
                        onChange={e => setDueDate(e.target.value)}
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status Atual</label>
                    <select 
                        className="w-full border rounded p-2 bg-white text-gray-700"
                        value={status}
                        onChange={e => setStatus(e.target.value)}
                    >
                        <option value="Emprestado">Emprestado</option>
                        <option value="Atrasado">Atrasado</option>
                        <option value="Devolvido">Devolvido</option>
                    </select>
                </div>
             </div>

             <div className="mt-8 flex justify-end space-x-3">
                <button 
                    onClick={() => setView('list')}
                    className="px-4 py-2 border rounded text-gray-600 hover:bg-gray-50 bg-white"
                >
                    Cancelar
                </button>
                <button 
                    onClick={handleSave}
                    className="px-6 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 flex items-center"
                >
                    <Save size={16} className="mr-2"/> Atualizar Empréstimo
                </button>
            </div>
        </div>
      ) : (
          /* CREATE MODE */
        <div className="bg-white p-6 rounded shadow-sm border border-gray-200 max-w-4xl">
            <h3 className="text-lg font-medium text-gray-700 mb-6 border-b pb-2">Novo Empréstimo</h3>
            
            {!isAdmin && (
                <div className="bg-red-50 text-red-700 p-4 rounded mb-4 border border-red-200 flex items-center">
                    <AlertCircle size={20} className="mr-2"/> Acesso negado. Apenas administradores podem registrar empréstimos.
                </div>
            )}

            {isAdmin ? (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Usuário</label>
                            <select 
                                className="w-full border rounded p-2 focus:ring-2 focus:ring-primary focus:outline-none bg-white text-gray-700"
                                value={selectedUser}
                                onChange={e => setSelectedUser(e.target.value)}
                            >
                                <option value="">Selecione um usuário...</option>
                                {users.map(u => <option key={u.id} value={u.id}>{u.name} - {u.type}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Livro/Obra</label>
                            <select 
                                className="w-full border rounded p-2 focus:ring-2 focus:ring-primary focus:outline-none bg-white text-gray-700"
                                value={selectedBook}
                                onChange={e => setSelectedBook(e.target.value)}
                            >
                                <option value="">Selecione uma obra...</option>
                                {books.map(b => (
                                    <option key={b.id} value={b.id} disabled={b.available <= 0} className={b.available <= 0 ? 'text-red-300' : ''}>
                                        {b.title} (Disp: {b.available})
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Data Empréstimo</label>
                            <input 
                                type="date" 
                                className="w-full border rounded p-2 bg-white text-gray-700"
                                value={loanDate}
                                onChange={e => setLoanDate(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Data Devolução Prevista</label>
                            <input 
                                type="date" 
                                className="w-full border rounded p-2 bg-white text-gray-700"
                                value={dueDate}
                                onChange={e => setDueDate(e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="mt-8 flex justify-end space-x-3">
                        <button 
                            onClick={() => setView('list')}
                            className="px-4 py-2 border rounded text-gray-600 hover:bg-gray-50 bg-white"
                        >
                            Cancelar
                        </button>
                        <button 
                            onClick={handleSave}
                            disabled={!selectedUser || !selectedBook || !dueDate}
                            className="px-6 py-2 bg-primary text-white rounded hover:bg-primaryDark disabled:opacity-50"
                        >
                            Confirmar Empréstimo
                        </button>
                    </div>
                </>
            ) : (
                <button 
                    onClick={() => setView('list')}
                    className="px-4 py-2 border rounded text-gray-600 hover:bg-gray-50 bg-white"
                >
                    Voltar para Lista
                </button>
            )}
        </div>
      )}
    </div>
  );
};

export default Loans;
