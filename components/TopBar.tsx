
import React, { useState, useRef, useEffect } from 'react';
import { Menu, Bell, Check, Mail, ChevronDown, User as UserIcon, LogOut, RefreshCw } from 'lucide-react';
import { AppSettings, User, Notification } from '../types';
import * as Storage from '../services/storage';

interface TopBarProps {
  settings: AppSettings;
  user: User;
  onToggleSidebar: () => void;
  onLogout: () => void;
}

const TopBar: React.FC<TopBarProps> = ({ settings, user, onToggleSidebar, onLogout }) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>(Storage.getCollection('notifications', []));
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
        if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
            setShowUserMenu(false);
        }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter notifications relevant to current user (or all if admin)
  const myNotifications = notifications.filter(n => 
    user.role === 'ADMIN' ? true : n.userId === user.id
  ).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const unreadCount = myNotifications.filter(n => !n.isRead).length;

  const markAsRead = (id: string) => {
    const updated = notifications.map(n => n.id === id ? { ...n, isRead: true } : n);
    setNotifications(updated);
    Storage.saveCollection('notifications', updated);
  };

  const markAllRead = () => {
    const updated = notifications.map(n => ({ ...n, isRead: true }));
    setNotifications(updated);
    Storage.saveCollection('notifications', updated);
  };

  return (
    <header className="bg-white shadow-sm h-16 flex items-center justify-between px-4 md:px-6 fixed top-0 right-0 left-0 md:left-64 z-30 transition-all duration-300">
      <div className="flex items-center">
        <button 
          onClick={onToggleSidebar}
          className="text-gray-500 hover:text-primary mr-4 md:hidden focus:outline-none"
        >
          <Menu size={24} />
        </button>
        <div className="flex items-center">
            {settings.logoUrl && (
                <img src={settings.logoUrl} alt="Logo" className="h-6 md:h-8 w-auto mr-3" />
            )}
            <h1 className="text-base md:text-xl font-semibold text-gray-700 uppercase tracking-tight truncate max-w-[150px] md:max-w-none">
              {settings.institutionName}
            </h1>
        </div>
      </div>

      <div className="flex items-center space-x-2 md:space-x-4">
        {/* Notifications Dropdown */}
        <div className="relative">
            <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 rounded-full hover:bg-gray-100 transition-colors focus:outline-none"
            >
                <Bell size={20} className="text-gray-500" />
                {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 bg-red-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center animate-pulse">
                        {unreadCount}
                    </span>
                )}
            </button>

            {showNotifications && (
                <div className="absolute right-0 top-12 w-72 md:w-80 bg-white shadow-xl rounded-lg border border-gray-100 overflow-hidden animate-fade-in z-40">
                    <div className="p-3 bg-gray-50 border-b flex justify-between items-center">
                        <h3 className="text-sm font-semibold text-gray-700">Notificações</h3>
                        {unreadCount > 0 && (
                            <button onClick={markAllRead} className="text-xs text-primary hover:text-primaryDark">
                                Marcar todas
                            </button>
                        )}
                    </div>
                    <div className="max-h-80 overflow-y-auto">
                        {myNotifications.length === 0 ? (
                            <div className="p-4 text-center text-gray-500 text-sm">Nenhuma notificação recente.</div>
                        ) : (
                            myNotifications.map(notif => (
                                <div key={notif.id} className={`p-3 border-b hover:bg-gray-50 flex items-start space-x-3 ${notif.isRead ? 'opacity-60' : 'bg-blue-50/50'}`}>
                                    <div className={`mt-1 w-2 h-2 rounded-full flex-shrink-0 ${notif.type === 'danger' ? 'bg-red-500' : notif.type === 'warning' ? 'bg-orange-500' : 'bg-blue-500'}`} />
                                    <div className="flex-1">
                                        <p className="text-sm font-medium text-gray-800">{notif.title}</p>
                                        <p className="text-xs text-gray-600 mt-1">{notif.message}</p>
                                        <div className="flex items-center justify-between mt-2">
                                            <span className="text-[10px] text-gray-400">{new Date(notif.date).toLocaleDateString()}</span>
                                            {!notif.isRead && (
                                                <button onClick={() => markAsRead(notif.id)} title="Marcar como lida" className="text-gray-400 hover:text-green-600">
                                                    <Check size={14} />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>

        {/* User Profile Dropdown */}
        <div className="relative border-l pl-2 md:pl-4 ml-2 md:ml-4" ref={userMenuRef}>
            <button 
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center space-x-2 focus:outline-none hover:bg-gray-50 rounded-full p-1 pr-2 transition-colors"
            >
                <div className="text-right hidden md:block">
                    <p className="text-sm font-medium text-gray-700">{user.name}</p>
                </div>
                <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold text-sm overflow-hidden">
                    {user.photoUrl ? (
                        <img src={user.photoUrl} alt="User" className="w-full h-full object-cover" />
                    ) : (
                        user.name.charAt(0)
                    )}
                </div>
                <ChevronDown size={14} className="text-gray-400" />
            </button>

            {showUserMenu && (
                <div className="absolute right-0 top-12 w-48 bg-white shadow-xl rounded-lg border border-gray-100 overflow-hidden animate-fade-in z-40">
                    <div className="p-3 border-b bg-gray-50 md:hidden">
                        <p className="text-sm font-bold text-gray-800">{user.name}</p>
                        <p className="text-xs text-gray-500">{user.email}</p>
                    </div>
                    <ul className="py-1">
                        <li>
                            <button 
                                onClick={onLogout}
                                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                            >
                                <RefreshCw size={16} className="mr-2 text-blue-500" /> Trocar Usuário
                            </button>
                        </li>
                        <li>
                            <button 
                                onClick={onLogout}
                                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center text-red-600"
                            >
                                <LogOut size={16} className="mr-2" /> Sair / Logoff
                            </button>
                        </li>
                    </ul>
                </div>
            )}
        </div>
      </div>
    </header>
  );
};

export default TopBar;
