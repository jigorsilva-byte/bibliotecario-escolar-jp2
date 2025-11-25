import React, { useMemo } from 'react';
import { Book, Users, ArrowLeftRight, TabletSmartphone } from 'lucide-react';
import { DashboardStats, Loan } from '../types';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

interface DashboardProps {
  stats: DashboardStats;
  loans: Loan[];
  onNavigate: (page: string) => void;
}

const StatCard = ({ title, value, label, icon: Icon, onClick, colorClass }: { title: string, value: number, label: string, icon: any, onClick: () => void, colorClass: string }) => (
  <div 
    onClick={onClick}
    className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 flex items-center justify-between cursor-pointer transform transition-transform hover:scale-105 hover:shadow-md"
  >
    <div>
      <h2 className={`text-4xl font-bold mb-1 ${colorClass}`}>{value}</h2>
      <p className="text-lg font-medium text-gray-600">{title}</p>
      <p className="text-xs text-gray-400 mt-1">{label}</p>
    </div>
    <div className="bg-gray-100 p-4 rounded-full text-gray-500">
      <Icon size={40} />
    </div>
  </div>
);

const Dashboard: React.FC<DashboardProps> = ({ stats, loans, onNavigate }) => {
  
  // Calculate real chart data based on loans history
  const chartData = useMemo(() => {
    const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    const currentYear = new Date().getFullYear();
    const data = months.map(m => ({ name: m, loans: 0 }));

    loans.forEach(loan => {
        const date = new Date(loan.loanDate);
        if (date.getFullYear() === currentYear) {
            data[date.getMonth()].loans += 1;
        }
    });

    // Return current month and previous 5
    const currentMonthIndex = new Date().getMonth();
    const start = Math.max(0, currentMonthIndex - 5);
    return data.slice(start, currentMonthIndex + 1);
  }, [loans]);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="border-b pb-4">
        <h2 className="text-2xl font-light text-gray-600">Sistema Para Gestão de Biblioteca</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
            title="Livros" 
            value={stats.totalBooks} 
            label="Cadastrados no Sistema." 
            icon={Book} 
            onClick={() => onNavigate('books')}
            colorClass="text-teal-600"
        />
        <StatCard 
            title="Usuários" 
            value={stats.totalUsers} 
            label="Registrados." 
            icon={Users} 
            onClick={() => onNavigate('users')}
            colorClass="text-blue-600"
        />
        <StatCard 
            title="Empréstimos" 
            value={stats.activeLoans} 
            label="Atendimentos ao Público." 
            icon={ArrowLeftRight} 
            onClick={() => onNavigate('loans')}
            colorClass="text-orange-500"
        />
        <StatCard 
            title="E-Books" 
            value={stats.totalEbooks} 
            label="Cadastrados." 
            icon={TabletSmartphone} 
            onClick={() => onNavigate('digital')}
            colorClass="text-purple-600"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        <div className="bg-white p-6 rounded shadow-sm border border-gray-200">
            <h3 className="text-lg font-medium text-gray-700 mb-4">Fluxo de Empréstimos ({new Date().getFullYear()})</h3>
            <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                        <XAxis dataKey="name" stroke="#8884d8" />
                        <YAxis stroke="#8884d8" allowDecimals={false} />
                        <Tooltip contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e5e7eb' }} />
                        <Bar dataKey="loans" name="Empréstimos" fill="#1abc9c" radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
        <div className="bg-white p-6 rounded shadow-sm border border-gray-200">
            <h3 className="text-lg font-medium text-gray-700 mb-4">Avisos Importantes</h3>
            <div className="space-y-4">
                <div className="p-4 bg-yellow-50 border-l-4 border-yellow-400 text-yellow-700">
                    <p className="font-bold">Backup Pendente</p>
                    <p className="text-sm">Realize o backup do sistema para evitar perda de dados.</p>
                </div>
                <div className="p-4 bg-blue-50 border-l-4 border-blue-400 text-blue-700">
                    <p className="font-bold">Atualização V3.1</p>
                    <p className="text-sm">Nova versão disponível. Verifique as configurações.</p>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;