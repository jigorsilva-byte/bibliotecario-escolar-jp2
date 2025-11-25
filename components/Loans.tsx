import React, { useState } from 'react';
import { Loan, Book, User } from '../types';
import { Printer, MessageCircle, Edit, Trash2, CheckSquare, Search } from 'lucide-react';
import * as Storage from '../services/storage';

interface LoansProps {
  loans: Loan[];
  books: Book[];
  users: User[];
  onUpdateLoans: (loans: Loan[]) => void;
  onUpdateBooks: (books: Book[]) => void;
}

const Loans: React.FC<LoansProps> = ({ loans, books, users, onUpdateLoans, onUpdateBooks }) => {
  const [view, setView] = useState<'list' | 'form'>('list');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Form State
  const [selectedUser, setSelectedUser] = useState('');
  const [selectedBook, setSelectedBook] = useState('');
  const [loanDate, setLoanDate] = useState(new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState('');

  const handleSave = () => {
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

  const isOverdue = (date: string) => {
    return new Date(date) < new Date() && new Date().toISOString().split('T')[0] !== date;
  };

  const filteredLoans = loans.filter(l => 
    l.userName.toLowerCase().includes(searchTerm.toLowerCase()) || 
    l.bookTitle.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col space-y-2">
        <h2 className="text-xl font-medium text-gray-600">Empréstimos</h2>
        <div className="flex space-x-2">
          <button 
            onClick={() => setView('form')}
            className={`px-4 py-2 rounded text-white text-sm font-medium ${view === 'form' ? 'bg-teal-600' : 'bg-primary hover:bg-primaryDark'}`}
          >
            Registrar Novo Empréstimo
          </button>
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
             <button onClick={() => window.print()} className="bg-blue-400 text-white px-3 py-1 rounded text-sm hover:bg-blue-500 flex items-center">
                <Printer size={16} className="mr-2" /> Imprimir
             </button>
          </div>
          
          <div className="p-4">
             <div className="flex justify-between mb-4">
                <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600">Exibir</span>
                    <select className="border rounded p-1 text-sm bg-white text-gray-700">
                        <option>10</option>
                        <option>25</option>
                    </select>
                    <span className="text-sm text-gray-600">resultados por página</span>
                </div>
                <div className="flex items-center">
                    <span className="text-sm text-gray-600 mr-2">Pesquisar</span>
                    <div className="relative">
                        <input 
                            type="text" 
                            className="border rounded pl-2 pr-8 py-1 text-sm focus:outline-none focus:border-primary bg-white text-gray-700" 
                            placeholder="Buscar registros"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <Search size={14} className="absolute right-2 top-2 text-gray-400"/>
                    </div>
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
                            <th className="px-4 py-3 text-center">Opções</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredLoans.length > 0 ? filteredLoans.map((loan, idx) => (
                            <tr key={loan.id} className="bg-white border-b hover:bg-gray-50">
                                <td className="px-4 py-3 font-medium text-gray-900">{idx + 1}</td>
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
                                <td className="px-4 py-3">
                                    <div className="flex justify-center space-x-1">
                                        <button 
                                            title="Devolver" 
                                            onClick={() => handleReturn(loan)}
                                            disabled={loan.status === 'Devolvido'}
                                            className={`p-1.5 rounded text-white ${loan.status === 'Devolvido' ? 'bg-gray-300' : 'bg-blue-500 hover:bg-blue-600'}`}>
                                            <CheckSquare size={16} />
                                        </button>
                                        <button title="WhatsApp" className="bg-green-500 p-1.5 rounded text-white hover:bg-green-600"><MessageCircle size={16} /></button>
                                        <button title="Excluir" className="bg-danger p-1.5 rounded text-white hover:bg-red-600"><Trash2 size={16} /></button>
                                    </div>
                                </td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan={7} className="px-4 py-8 text-center text-gray-400">Nenhum registro encontrado</td>
                            </tr>
                        )}
                    </tbody>
                </table>
             </div>
             <div className="mt-4 flex justify-between items-center text-xs text-gray-500">
                <span>Mostrando {filteredLoans.length} registros</span>
                <div className="flex space-x-1">
                    <button className="px-3 py-1 bg-gray-200 rounded text-gray-600 hover:bg-gray-300">Anterior</button>
                    <button className="px-3 py-1 bg-gray-200 rounded text-gray-600 hover:bg-gray-300">Próximo</button>
                </div>
             </div>
          </div>
        </div>
      ) : (
        <div className="bg-white p-6 rounded shadow-sm border border-gray-200 max-w-4xl">
            <h3 className="text-lg font-medium text-gray-700 mb-6 border-b pb-2">Novo Empréstimo</h3>
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
        </div>
      )}
    </div>
  );
};

export default Loans;