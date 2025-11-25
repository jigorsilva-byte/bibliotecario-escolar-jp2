
import React, { useState } from 'react';
import { User, UserRole } from '../types';
import { BookOpen, LogIn, Lock, User as UserIcon, UserPlus, Mail, Phone } from 'lucide-react';
import * as Storage from '../services/storage';

interface LoginProps {
  onLogin: (user: User) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [isRegistering, setIsRegistering] = useState(false);
  
  // Login States
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // Register States
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [regType, setRegType] = useState<'Aluno' | 'Professor'>('Aluno');

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!email || !password) {
        setError('Preencha todos os campos.');
        return;
    }

    const users = Storage.getCollection<User>('users', []);
    
    // Simple validation
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase() && (u.password === password || (!u.password && password === '123456')));

    if (user) {
        onLogin(user);
    } else {
        setError('Usuário ou senha incorretos.');
    }
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validation
    if (!regName || !regEmail || !regPassword || !regConfirmPassword) {
        setError('Preencha todos os campos obrigatórios.');
        return;
    }

    if (regPassword !== regConfirmPassword) {
        setError('As senhas não coincidem.');
        return;
    }

    const users = Storage.getCollection<User>('users', []);
    const emailExists = users.some(u => u.email.toLowerCase() === regEmail.toLowerCase());

    if (emailExists) {
        setError('Este e-mail já está cadastrado.');
        return;
    }

    // Create User
    const newUser: User = {
        id: Date.now().toString(),
        name: regName,
        email: regEmail,
        password: regPassword,
        phone: regPhone,
        type: regType,
        role: UserRole.USER, // Default to normal user
        sectorOrClass: '', // Can be updated later in profile
        photoUrl: ''
    };

    const updatedUsers = [...users, newUser];
    Storage.saveCollection('users', updatedUsers);

    setSuccess('Cadastro realizado com sucesso! Fazendo login...');
    
    setTimeout(() => {
        onLogin(newUser);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md animate-fade-in border-t-4 border-primary overflow-hidden">
        
        {/* Header Logo */}
        <div className="text-center pt-8 pb-6 px-8 bg-gray-50 border-b">
            <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3 text-primary">
                <BookOpen size={32} />
            </div>
            <h1 className="text-xl font-bold text-gray-800 uppercase">Bibliotecário Escolar</h1>
            <p className="text-gray-500 text-xs mt-1">Sistema de Gestão 3.0</p>
        </div>

        {/* Tabs */}
        <div className="flex border-b">
            <button 
                className={`flex-1 py-3 text-sm font-medium transition-colors ${!isRegistering ? 'text-primary border-b-2 border-primary bg-white' : 'text-gray-500 bg-gray-50 hover:bg-gray-100'}`}
                onClick={() => { setIsRegistering(false); setError(''); setSuccess(''); }}
            >
                Acesso (Login)
            </button>
            <button 
                className={`flex-1 py-3 text-sm font-medium transition-colors ${isRegistering ? 'text-primary border-b-2 border-primary bg-white' : 'text-gray-500 bg-gray-50 hover:bg-gray-100'}`}
                onClick={() => { setIsRegistering(true); setError(''); setSuccess(''); }}
            >
                Inscrição (Cadastro)
            </button>
        </div>
        
        <div className="p-8">
            {error && (
                <div className="bg-red-50 text-red-600 text-sm p-3 rounded border border-red-200 mb-4 animate-fade-in">
                    {error}
                </div>
            )}
            {success && (
                <div className="bg-green-50 text-green-600 text-sm p-3 rounded border border-green-200 mb-4 animate-fade-in">
                    {success}
                </div>
            )}

            {!isRegistering ? (
                /* LOGIN FORM */
                <form onSubmit={handleLogin} className="space-y-5">
                    <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">E-mail</label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                            <Mail size={18} />
                        </div>
                        <input 
                        type="email"
                        className="w-full pl-10 border border-gray-300 rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white text-gray-700"
                        placeholder="seu@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                    </div>

                    <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Senha</label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                            <Lock size={18} />
                        </div>
                        <input 
                        type="password"
                        className="w-full pl-10 border border-gray-300 rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white text-gray-700"
                        placeholder="••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>
                    </div>

                    <button 
                        type="submit"
                        className="w-full bg-primary text-white py-2.5 rounded-lg font-bold hover:bg-primaryDark transition-all duration-200 shadow-md flex items-center justify-center mt-2"
                    >
                        <LogIn size={20} className="mr-2" /> Entrar no Sistema
                    </button>
                    
                    <div className="text-center pt-4">
                        <p className="text-xs text-gray-400">Esqueceu a senha? Contate a biblioteca.</p>
                    </div>
                </form>
            ) : (
                /* REGISTER FORM */
                <form onSubmit={handleRegister} className="space-y-4">
                    <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Nome Completo *</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                <UserIcon size={16} />
                            </div>
                            <input 
                                type="text"
                                className="w-full pl-9 border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-primary bg-white text-gray-700 text-sm"
                                placeholder="Seu nome"
                                value={regName}
                                onChange={(e) => setRegName(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                         <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Eu sou: *</label>
                            <select 
                                className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-primary bg-white text-gray-700 text-sm"
                                value={regType}
                                onChange={(e) => setRegType(e.target.value as any)}
                            >
                                <option value="Aluno">Aluno</option>
                                <option value="Professor">Professor</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Telefone</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none text-gray-400">
                                    <Phone size={14} />
                                </div>
                                <input 
                                    type="text"
                                    className="w-full pl-7 border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-primary bg-white text-gray-700 text-sm"
                                    placeholder="(00) 00000-0000"
                                    value={regPhone}
                                    onChange={(e) => setRegPhone(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">E-mail *</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                <Mail size={16} />
                            </div>
                            <input 
                                type="email"
                                className="w-full pl-9 border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-primary bg-white text-gray-700 text-sm"
                                placeholder="seu@email.com"
                                value={regEmail}
                                onChange={(e) => setRegEmail(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Senha *</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none text-gray-400">
                                    <Lock size={14} />
                                </div>
                                <input 
                                    type="password"
                                    className="w-full pl-7 border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-primary bg-white text-gray-700 text-sm"
                                    placeholder="Senha"
                                    value={regPassword}
                                    onChange={(e) => setRegPassword(e.target.value)}
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Confirmar *</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none text-gray-400">
                                    <Lock size={14} />
                                </div>
                                <input 
                                    type="password"
                                    className="w-full pl-7 border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-primary bg-white text-gray-700 text-sm"
                                    placeholder="Repetir"
                                    value={regConfirmPassword}
                                    onChange={(e) => setRegConfirmPassword(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    <button 
                        type="submit"
                        className="w-full bg-primary text-white py-2.5 rounded-lg font-bold hover:bg-primaryDark transition-all duration-200 shadow-md flex items-center justify-center mt-4"
                    >
                        <UserPlus size={18} className="mr-2" /> Realizar Inscrição
                    </button>
                </form>
            )}
        </div>
        
        {!isRegistering && (
             <div className="bg-gray-50 p-4 text-center border-t">
                 <p className="text-xs text-gray-500">
                     Não tem conta? <button onClick={() => setIsRegistering(true)} className="text-primary font-bold hover:underline">Inscreva-se agora</button>
                 </p>
             </div>
        )}
        {isRegistering && (
             <div className="bg-gray-50 p-4 text-center border-t">
                 <p className="text-xs text-gray-500">
                     Já tem conta? <button onClick={() => setIsRegistering(false)} className="text-primary font-bold hover:underline">Faça login</button>
                 </p>
             </div>
        )}
      </div>
    </div>
  );
};

export default Login;
