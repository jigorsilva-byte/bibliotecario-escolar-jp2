
import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import TopBar from './components/TopBar';
import Dashboard from './components/Dashboard';
import Loans from './components/Loans';
import Books from './components/Books';
import Users from './components/Users';
import Settings from './components/Settings';
import Reports from './components/Reports';
import Profile from './components/Profile';
import Classes from './components/Classes';
import DigitalAssets from './components/DigitalAssets';
import Login from './components/Login';
import * as Storage from './services/storage';
import { User, UserRole } from './types';

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  // Data State
  const [users, setUsers] = useState(Storage.getCollection('users', []));
  const [books, setBooks] = useState(Storage.getCollection('books', []));
  const [loans, setLoans] = useState(Storage.getCollection('loans', []));
  const [classes, setClasses] = useState(Storage.getCollection('classes', []));
  const [assets, setAssets] = useState(Storage.getCollection('assets', []));
  const [formats, setFormats] = useState(Storage.getCollection('formats', []));
  const [settings, setAppSettings] = useState(Storage.getSettings());

  useEffect(() => {
    Storage.loadInitialData();
    // Check for alerts and generate system notifications
    Storage.checkAndGenerateNotifications();

    setUsers(Storage.getCollection('users', []));
    setBooks(Storage.getCollection('books', []));
    setLoans(Storage.getCollection('loans', []));
    setClasses(Storage.getCollection('classes', []));
    setAssets(Storage.getCollection('assets', []));
    setFormats(Storage.getCollection('formats', []));
    setAppSettings(Storage.getSettings());
  }, []);

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    setIsAuthenticated(true);
    Storage.checkAndGenerateNotifications();
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentUser(null);
    setCurrentPage('dashboard');
    setIsSidebarOpen(false);
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const renderContent = () => {
    switch (currentPage) {
      case 'dashboard':
        const stats = {
          totalBooks: books.length,
          totalUsers: users.length,
          activeLoans: loans.filter(l => l.status === 'Emprestado' || l.status === 'Atrasado').length,
          totalEbooks: assets.length
        };
        return <Dashboard stats={stats} loans={loans} onNavigate={setCurrentPage} />;
      case 'loans':
        return <Loans 
            loans={loans} 
            books={books} 
            users={users} 
            onUpdateLoans={setLoans} 
            onUpdateBooks={setBooks} 
        />;
      case 'books':
        return <Books 
            books={books} 
            onUpdate={setBooks} 
            settings={settings} 
            formats={formats}
            onUpdateFormats={setFormats}
            classes={classes}
        />;
      case 'users':
        return <Users users={users} settings={settings} currentUser={currentUser} />;
      case 'reports':
        return <Reports loans={loans} books={books} users={users} />;
      case 'settings':
        return <Settings settings={settings} onUpdate={setAppSettings} />;
      case 'profile':
        return <Profile user={currentUser!} onUpdateUser={setCurrentUser} />;
      case 'classes':
        return <Classes classes={classes} onUpdate={setClasses} />;
      case 'digital':
        return <DigitalAssets assets={assets} onUpdate={setAssets} />;
      default:
        return (
            <div className="flex flex-col items-center justify-center h-full text-gray-400">
                <h2 className="text-2xl font-bold">Em construção</h2>
                <p>O módulo <strong>{currentPage}</strong> será implementado em breve.</p>
            </div>
        );
    }
  };

  // Force Password Change Screen
  if (isAuthenticated && currentUser?.mustChangePassword) {
      return (
          <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
              <div className="bg-white p-8 rounded shadow-xl w-full max-w-md">
                  <h2 className="text-xl font-bold text-red-600 mb-4">Troca de Senha Obrigatória</h2>
                  <p className="text-gray-600 mb-6 text-sm">Por medidas de segurança, você precisa alterar sua senha padrão antes de continuar.</p>
                  <Profile 
                    user={currentUser} 
                    onUpdateUser={(u) => {
                        const updated = { ...u, mustChangePassword: false };
                        setCurrentUser(updated);
                        // Also update in users list logic handled inside Profile but state needs sync
                        const usersList = Storage.getCollection('users', []);
                        const newUsersList = usersList.map(usr => usr.id === u.id ? updated : usr);
                        Storage.saveCollection('users', newUsersList);
                        setUsers(newUsersList);
                    }} 
                  />
              </div>
          </div>
      )
  }

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="flex min-h-screen bg-gray-100 relative">
      <Sidebar 
        user={currentUser} 
        currentPage={currentPage} 
        onChangePage={setCurrentPage} 
        onLogout={handleLogout}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />
      
      <div className={`w-full flex flex-col transition-all duration-300 ${isSidebarOpen ? '' : 'ml-0'} md:ml-64`}>
        <TopBar 
            settings={settings} 
            user={currentUser!} 
            onToggleSidebar={toggleSidebar}
            onLogout={handleLogout}
        />
        
        <main className="mt-16 p-4 md:p-8 flex-1 overflow-auto">
           {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default App;
