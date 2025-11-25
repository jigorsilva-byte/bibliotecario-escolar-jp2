import React, { useState } from 'react';
import { Home, Users, BookOpen, FileText, Settings, ChevronDown, ChevronRight, LogOut, X } from 'lucide-react';

interface SidebarProps {
  user: any;
  onChangePage: (page: string) => void;
  currentPage: string;
  onLogout: () => void;
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ user, onChangePage, currentPage, onLogout, isOpen, onClose }) => {
  const [expandedMenus, setExpandedMenus] = useState<Record<string, boolean>>({
    'home': true,
    'cadastros': true
  });

  const toggleMenu = (menu: string) => {
    setExpandedMenus(prev => ({ ...prev, [menu]: !prev[menu] }));
  };

  const handleItemClick = (id: string, hasSub: boolean) => {
    if (hasSub) {
      toggleMenu(id);
    } else {
      onChangePage(id);
      onClose(); // Close sidebar on mobile when item selected
    }
  };

  const MenuItem = ({ id, label, icon: Icon, subItems = [] }: { id: string, label: string, icon: any, subItems?: { id: string, label: string }[] }) => {
    const hasSub = subItems.length > 0;
    const isExpanded = expandedMenus[id];
    const isActive = currentPage === id || subItems.some(sub => sub.id === currentPage);

    return (
      <li className="mb-1">
        <button
          onClick={() => handleItemClick(id, hasSub)}
          className={`flex items-center w-full px-4 py-3 text-sm transition-colors ${isActive ? 'bg-sidebarHover border-l-4 border-primary' : 'hover:bg-sidebarHover border-l-4 border-transparent'}`}
        >
          <Icon size={18} className="mr-3" />
          <span className="flex-1 text-left">{label}</span>
          {hasSub && (isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />)}
        </button>

        {hasSub && isExpanded && (
          <ul className="bg-slate-900/50 py-1">
            {subItems.map(sub => (
              <li key={sub.id}>
                <button
                  onClick={() => {
                    onChangePage(sub.id);
                    onClose();
                  }}
                  className={`w-full text-left px-12 py-2 text-sm text-gray-400 hover:text-white transition-colors ${currentPage === sub.id ? 'text-white font-medium' : ''}`}
                >
                  {sub.label}
                </button>
              </li>
            ))}
          </ul>
        )}
      </li>
    );
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
          onClick={onClose}
        ></div>
      )}

      <aside className={`
        fixed top-0 left-0 z-40 h-screen w-64 bg-sidebar text-gray-100 overflow-y-auto shadow-xl flex flex-col transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        md:translate-x-0
      `}>
        {/* Profile Header */}
        <div className="p-6 border-b border-gray-700 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-primary bg-gray-600">
              <img src={user.photoUrl || "https://picsum.photos/200"} alt="User" className="w-full h-full object-cover" />
            </div>
            <div>
              <p className="text-xs text-gray-400">Bem-vindo(a),</p>
              <p className="font-bold text-sm truncate w-28">{user.name}</p>
            </div>
          </div>
          <button onClick={onClose} className="md:hidden text-gray-400 hover:text-white">
            <X size={20} />
          </button>
        </div>

        <div className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Menu</div>

        <ul className="flex-1">
          <MenuItem 
            id="home" 
            label="Home" 
            icon={Home} 
            subItems={[
              { id: 'dashboard', label: 'Painel Principal' },
              { id: 'profile', label: 'Perfil' }
            ]} 
          />
          
          <MenuItem 
            id="cadastros" 
            label="Cadastros" 
            icon={Users} 
            subItems={[
              { id: 'classes', label: 'Setor/Turma' },
              { id: 'users', label: 'Usuários' },
              { id: 'books', label: 'Acervos' },
              { id: 'digital', label: 'Acervos Digitais' },
            ]} 
          />

          <MenuItem id="loans" label="Empréstimos" icon={BookOpen} />
          <MenuItem id="settings" label="Configurações" icon={Settings} />
          <MenuItem id="reports" label="Relatórios" icon={FileText} />
        </ul>

        <div className="p-4 border-t border-gray-700">
          <button onClick={onLogout} className="flex items-center text-red-400 hover:text-red-300 transition-colors w-full">
            <LogOut size={18} className="mr-3" />
            <span>Sair do Sistema</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;