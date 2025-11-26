import React, { useState } from 'react';
import { User } from '../types';
import { Lock, Save, AlertTriangle, CheckCircle } from 'lucide-react';
import * as Storage from '../services/storage';

interface ForcePasswordChangeProps {
  user: User;
  onSuccess: (updatedUser: User) => void;
}

const ForcePasswordChange: React.FC<ForcePasswordChangeProps> = ({ user, onSuccess }) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // 1. Validar Senha Atual
    // Verifica se a senha digitada bate com a do usuário OU se é a senha padrão '123456' caso o usuário ainda esteja com ela
    if (currentPassword !== user.password && !(user.password === undefined && currentPassword === '123456')) {
        setError('A senha atual está incorreta.');
        return;
    }

    // 2. Validar Nova Senha
    if (newPassword.length < 4) {
        setError('A nova senha deve ter pelo menos 4 caracteres.');
        return;
    }

    if (newPassword === currentPassword) {
        setError('A nova senha não pode ser igual à senha atual.');
        return;
    }

    if (newPassword !== confirmPassword) {
        setError('A nova senha e a confirmação não coincidem.');
        return;
    }

    // 3. Salvar
    const updatedUser: User = {
        ...user,
        password: newPassword,
        mustChangePassword: false // Libera o usuário
    };

    // Atualizar no LocalStorage
    const allUsers = Storage.getCollection<User>('users', []);
    const updatedList = allUsers.map(u => u.id === user.id ? updatedUser : u);
    Storage.saveCollection('users', updatedList);

    setSuccess(true);
    
    // Aguarda um momento para mostrar a mensagem de sucesso antes de liberar
    setTimeout(() => {
        onSuccess(updatedUser);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-8 border-t-4 border-red-500 animate-fade-in">
            <div className="text-center mb-6">
                <div className="bg-red-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3 text-red-600">
                    <Lock size={32} />
                </div>
                <h2 className="text-xl font-bold text-gray-800">Segurança da Conta</h2>
                <p className="text-sm text-gray-500 mt-2">
                    Para sua segurança, é obrigatório redefinir sua senha antes de prosseguir.
                </p>
            </div>

            {error && (
                <div className="bg-red-50 text-red-700 p-3 rounded text-sm mb-4 flex items-center border border-red-200">
                    <AlertTriangle size={16} className="mr-2 flex-shrink-0" />
                    {error}
                </div>
            )}

            {success && (
                <div className="bg-green-50 text-green-700 p-3 rounded text-sm mb-4 flex items-center border border-green-200">
                    <CheckCircle size={16} className="mr-2 flex-shrink-0" />
                    Senha atualizada com sucesso! Redirecionando...
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Senha Atual (Padrão)</label>
                    <input 
                        type="password"
                        className="w-full border p-2 rounded focus:ring-2 focus:ring-red-500 focus:outline-none bg-gray-50"
                        placeholder="Digite sua senha atual"
                        value={currentPassword}
                        onChange={e => setCurrentPassword(e.target.value)}
                        required
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nova Senha</label>
                    <input 
                        type="password"
                        className="w-full border p-2 rounded focus:ring-2 focus:ring-red-500 focus:outline-none"
                        placeholder="Crie uma nova senha"
                        value={newPassword}
                        onChange={e => setNewPassword(e.target.value)}
                        required
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Confirmar Nova Senha</label>
                    <input 
                        type="password"
                        className="w-full border p-2 rounded focus:ring-2 focus:ring-red-500 focus:outline-none"
                        placeholder="Repita a nova senha"
                        value={confirmPassword}
                        onChange={e => setConfirmPassword(e.target.value)}
                        required
                    />
                </div>

                <button 
                    type="submit" 
                    className="w-full bg-red-600 text-white py-2 rounded font-medium hover:bg-red-700 transition-colors flex items-center justify-center mt-4"
                    disabled={success}
                >
                    <Save size={18} className="mr-2" />
                    Definir Nova Senha
                </button>
            </form>
        </div>
    </div>
  );
};

export default ForcePasswordChange;