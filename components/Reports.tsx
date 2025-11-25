
import React, { useState, useMemo } from 'react';
import { Loan, Book, User } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Printer, FileText, Download, Filter } from 'lucide-react';

interface ReportsProps {
  loans: Loan[];
  books: Book[];
  users: User[];
}

const COLORS = ['#1abc9c', '#2980b9', '#f39c12', '#e74c3c'];

const Reports: React.FC<ReportsProps> = ({ loans, books, users }) => {
  const [activeTab, setActiveTab] = useState<'geral' | 'historico'>('geral');
  const [dateStart, setDateStart] = useState('');
  const [dateEnd, setDateEnd] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  // Filtering Logic
  const filteredLoans = useMemo(() => {
    return loans.filter(loan => {
      const loanDate = new Date(loan.loanDate);
      const start = dateStart ? new Date(dateStart) : new Date('2000-01-01');
      const end = dateEnd ? new Date(dateEnd) : new Date('2099-12-31');
      
      const categoryMatch = categoryFilter 
        ? books.find(b => b.id === loan.bookId)?.category === categoryFilter
        : true;

      return loanDate >= start && loanDate <= end && categoryMatch;
    });
  }, [loans, books, dateStart, dateEnd, categoryFilter]);

  // Statistics Calculation
  const stats = useMemo(() => {
    const totalLoans = filteredLoans.length;
    const returned = filteredLoans.filter(l => l.status === 'Devolvido').length;
    const late = filteredLoans.filter(l => l.status === 'Atrasado' || (l.status === 'Emprestado' && new Date(l.dueDate) < new Date())).length;
    
    // Top Borrowed Books
    const bookCounts: Record<string, number> = {};
    filteredLoans.forEach(l => {
      bookCounts[l.bookTitle] = (bookCounts[l.bookTitle] || 0) + 1;
    });
    
    const topBooks = Object.entries(bookCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Status Distribution
    const statusData = [
      { name: 'Devolvidos', value: returned },
      { name: 'Em Atraso', value: late },
      { name: 'Ativos (Em dia)', value: totalLoans - returned - late }
    ];

    return { totalLoans, returned, late, topBooks, statusData };
  }, [filteredLoans]);

  const uniqueCategories = Array.from(new Set(books.map(b => b.category)));

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    const headers = "ID,Usuário,Livro,Data Empréstimo,Data Devolução,Status\n";
    const rows = filteredLoans.map(l => 
        `${l.id},${l.userName},${l.bookTitle},${l.loanDate},${l.dueDate},${l.status}`
    ).join("\n");
    
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'relatorio_emprestimos.csv';
    a.click();
  };

  return (
    <div className="space-y-6 animate-fade-in pb-10">
       <div className="flex flex-col md:flex-row md:justify-between md:items-center space-y-4 md:space-y-0">
          <h2 className="text-xl font-medium text-gray-600">Relatórios Gerenciais</h2>
          <div className="flex space-x-2">
             <button 
                onClick={() => setActiveTab('geral')}
                className={`px-4 py-2 rounded text-sm font-medium ${activeTab === 'geral' ? 'bg-primary text-white' : 'bg-white text-gray-600 border'}`}
             >
                Estatísticas
             </button>
             <button 
                onClick={() => setActiveTab('historico')}
                className={`px-4 py-2 rounded text-sm font-medium ${activeTab === 'historico' ? 'bg-primary text-white' : 'bg-white text-gray-600 border'}`}
             >
                Histórico Detalhado
             </button>
          </div>
       </div>

       {/* Filters Section */}
       <div className="bg-white p-4 rounded shadow-sm border border-gray-200">
          <div className="flex flex-col md:flex-row gap-4 items-end">
             <div className="w-full md:w-auto">
                <label className="block text-xs font-bold text-gray-500 mb-1">Data Início</label>
                <input type="date" className="border rounded p-2 text-sm w-full bg-white text-gray-700" value={dateStart} onChange={e => setDateStart(e.target.value)} />
             </div>
             <div className="w-full md:w-auto">
                <label className="block text-xs font-bold text-gray-500 mb-1">Data Fim</label>
                <input type="date" className="border rounded p-2 text-sm w-full bg-white text-gray-700" value={dateEnd} onChange={e => setDateEnd(e.target.value)} />
             </div>
             <div className="w-full md:w-auto">
                <label className="block text-xs font-bold text-gray-500 mb-1">Categoria</label>
                <select className="border rounded p-2 text-sm w-full min-w-[150px] bg-white text-gray-700" value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}>
                    <option value="">Todas</option>
                    {uniqueCategories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
             </div>
             <div className="w-full md:w-auto flex-1 flex justify-end gap-2">
                <button onClick={handlePrint} className="flex items-center px-3 py-2 bg-gray-600 text-white rounded text-sm hover:bg-gray-700">
                    <Printer size={16} className="mr-2"/> Imprimir
                </button>
                <button onClick={handleExportCSV} className="flex items-center px-3 py-2 bg-green-600 text-white rounded text-sm hover:bg-green-700">
                    <Download size={16} className="mr-2"/> Exportar CSV
                </button>
             </div>
          </div>
       </div>

       {/* Stats View */}
       {activeTab === 'geral' && (
           <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Summary Cards */}
                <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
                        <h3 className="text-gray-500 text-sm font-bold uppercase">Total de Empréstimos</h3>
                        <p className="text-2xl font-bold text-blue-600">{stats.totalLoans}</p>
                        <p className="text-xs text-gray-400">no período selecionado</p>
                    </div>
                    <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded">
                        <h3 className="text-gray-500 text-sm font-bold uppercase">Devolvidos</h3>
                        <p className="text-2xl font-bold text-green-600">{stats.returned}</p>
                    </div>
                    <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
                        <h3 className="text-gray-500 text-sm font-bold uppercase">Em Atraso</h3>
                        <p className="text-2xl font-bold text-red-600">{stats.late}</p>
                    </div>
                </div>

                {/* Charts */}
                <div className="bg-white p-6 rounded shadow-sm border border-gray-200">
                    <h3 className="text-lg font-medium text-gray-700 mb-4">Livros Mais Emprestados</h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={stats.topBooks} layout="vertical" margin={{ left: 20 }}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis type="number" />
                                <YAxis dataKey="name" type="category" width={100} tick={{fontSize: 12}} />
                                <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #ccc' }} />
                                <Bar dataKey="count" name="Empréstimos" fill="#1abc9c" radius={[0, 4, 4, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-white p-6 rounded shadow-sm border border-gray-200">
                    <h3 className="text-lg font-medium text-gray-700 mb-4">Status dos Empréstimos</h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={stats.statusData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {stats.statusData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #ccc' }}/>
                                <Legend verticalAlign="bottom" height={36}/>
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
           </div>
       )}

       {/* Detailed History View */}
       {activeTab === 'historico' && (
           <div className="bg-white rounded shadow-sm border border-gray-200">
                <div className="p-4 border-b bg-gray-50">
                    <h3 className="text-lg text-gray-600">Listagem Completa de Movimentações</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-600">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-100">
                            <tr>
                                <th className="px-4 py-3">Data Emp.</th>
                                <th className="px-4 py-3">Usuário</th>
                                <th className="px-4 py-3">Livro</th>
                                <th className="px-4 py-3">Prev. Devolução</th>
                                <th className="px-4 py-3">Devolvido em</th>
                                <th className="px-4 py-3">Situação</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredLoans.length > 0 ? filteredLoans.map((loan) => (
                                <tr key={loan.id} className="bg-white border-b hover:bg-gray-50">
                                    <td className="px-4 py-3">{new Date(loan.loanDate).toLocaleDateString()}</td>
                                    <td className="px-4 py-3 font-medium">{loan.userName}</td>
                                    <td className="px-4 py-3">{loan.bookTitle}</td>
                                    <td className="px-4 py-3">{new Date(loan.dueDate).toLocaleDateString()}</td>
                                    <td className="px-4 py-3">{loan.returnDate ? new Date(loan.returnDate).toLocaleDateString() : '-'}</td>
                                    <td className="px-4 py-3">
                                        <span className={`px-2 py-1 rounded text-xs font-semibold 
                                            ${loan.status === 'Devolvido' ? 'bg-green-100 text-green-800' : 
                                            loan.status === 'Atrasado' ? 'bg-red-100 text-red-800' : 
                                            'bg-blue-100 text-blue-800'}`}>
                                            {loan.status}
                                        </span>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={6} className="px-4 py-8 text-center text-gray-400">Nenhum registro encontrado neste período.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
           </div>
       )}
    </div>
  );
};

export default Reports;
