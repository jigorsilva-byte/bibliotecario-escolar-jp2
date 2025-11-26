
import React, { useState, useRef } from 'react';
import { User } from '../types';
import { Save, User as UserIcon, Camera, Upload, Lock, ShieldCheck } from 'lucide-react';
import * as Storage from '../services/storage';

interface ProfileProps {
  user: User;
  onUpdateUser: (updatedUser: User) => void;
}

const Profile: React.FC<ProfileProps> = ({ user, onUpdateUser }) => {
  const [formData, setFormData] = useState(user);
  
  // Password Change State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [message, setMessage] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Flag apenas para controlar o campo de Cargo, que deve ser sempre bloqueado para auto-edição de alunos
  const isStudent = user.type === 'Aluno';

  const handleSave = () => {
    const allUsers = Storage.getCollection<User>('users', []);
    
    // 1. Validation: Check email uniqueness (Only if email changed)
    if (formData.email !== user.email) {
        const emailExists = allUsers.some(u => u.email.toLowerCase() === formData.email.toLowerCase() && u.id !== user.id);
        if (emailExists) {
            setMessage('Erro: Este e-mail já está sendo usado por outro usuário.');
            return;
        }
    }

    // 2. Validation: Password Change Logic
    let updatedPassword = formData.password; // Keep old password by default

    // If user is trying to change password (typed something in new password fields)
    if (newPassword || currentPassword) {
        if (currentPassword !== user.password) {
            setMessage('Erro: A senha atual informada está incorreta.');
            return;
        }
        if (newPassword.length < 4) {
             setMessage('Erro: A nova senha deve ter pelo menos 4 caracteres.');
             return;
        }
        if (newPassword !== confirmPassword) {
            setMessage('Erro: A nova senha e a confirmação não coincidem.');
            return;
        }
        updatedPassword = newPassword; // Set new password
    }

    // 3. Prepare Updated User Object
    const updatedUser: User = {
        ...formData,
        password: updatedPassword
    };

    // 4. Save to Storage
    const updatedUsersList = allUsers.map(u => u.id === user.id ? updatedUser : u);
    
    Storage.saveCollection('users', updatedUsersList);
    onUpdateUser(updatedUser);
    
    // 5. Clear sensitive fields and show success
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    
    setMessage('Perfil e dados de segurança atualizados com sucesso!');
    setTimeout(() => setMessage(''), 3000);
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

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl mx-auto pb-10">
      <div className="flex items-center space-x-4 border-b pb-4">
        <div className="h-16 w-16 bg-primary rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-lg overflow-hidden">
           {formData.photoUrl ? <img src={formData.photoUrl} className="w-full h-full object-cover" /> : formData.name.charAt(0)}
        </div>
        <div>
           <h2 className="text-2xl font-light text-gray-600">Meu Perfil</h2>
           <p className="text-sm text-gray-400">Gerencie suas informações e segurança</p>
        </div>
      </div>

      {message && (
        <div className={`p-4 rounded border animate-fade-in ${message.includes('Erro') ? 'bg-red-100 text-red-700 border-red-200' : 'bg-green-100 text-green-700 border-green-200'}`}>
            {message}
        </div>
      )}

      <div className="bg-white p-8 rounded shadow-sm border border-gray-200">
         {/* --- PERSONAL DATA SECTION --- */}
         <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-700 flex items-center">
                <UserIcon size={20} className="mr-2 text-primary"/> Dados Pessoais
            </h3>
         </div>
         
         <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="col-span-1 md:col-span-2 flex flex-col items-center justify-center mb-2">
                <div 
                    className="relative group w-32 h-32 rounded-full overflow-hidden border-4 border-gray-100 bg-gray-200 shadow-inner cursor-pointer"
                    onClick={() => fileInputRef.current?.click()}
                >
                     {formData.photoUrl ? (
                         <img src={formData.photoUrl} alt="Profile" className="w-full h-full object-cover"/>
                     ) : (
                         <div className="w-full h-full flex items-center justify-center text-gray-400">
                            <UserIcon size={48} />
                         </div>
                     )}
                    <div className="absolute inset-0 bg-black bg-opacity-40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Camera className="text-white" />
                    </div>
                </div>
                
                <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    accept="image/*"
                    onChange={handleFileChange}
                />
                
                <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="mt-3 text-sm text-primary hover:text-primaryDark font-medium flex items-center"
                >
                    <Upload size={14} className="mr-1"/> Alterar Foto
                </button>
            </div>

            <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">Nome Completo</label>
                <input 
                    type="text" 
                    className="w-full border p-2 rounded bg-white text-gray-700 focus:ring-2 focus:ring-primary focus:outline-none"
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                />
            </div>

            <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">E-mail (Login)</label>
                <input 
                    type="email" 
                    className="w-full border p-2 rounded bg-white text-gray-700 focus:ring-2 focus:ring-primary focus:outline-none"
                    value={formData.email}
                    onChange={e => setFormData({...formData, email: e.target.value})}
                />
            </div>

            <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">Telefone</label>
                <input 
                    type="text" 
                    className="w-full border p-2 rounded bg-white text-gray-700 focus:ring-2 focus:ring-primary focus:outline-none"
                    value={formData.phone}
                    onChange={e => setFormData({...formData, phone: e.target.value})}
                />
            </div>

            <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">Cargo / Função</label>
                <select 
                    className="w-full border p-2 rounded bg-gray-100 text-gray-500 focus:outline-none cursor-not-allowed"
                    value={formData.type}
                    onChange={e => setFormData({...formData, type: e.target.value as any})}
                    disabled={true} // Sempre desabilitado para evitar mudança de cargo
                >
                    <option value="Aluno">Aluno</option>
                    <option value="Professor">Professor</option>
                    <option value="Funcionário">Funcionário</option>
                </select>
            </div>
         </div>

         {/* --- SECURITY SECTION --- */}
         <hr className="my-6 border-gray-100" />
         
         <h3 className="text-lg font-medium text-gray-700 mb-4 flex items-center">
            <ShieldCheck size={20} className="mr-2 text-primary"/> Segurança e Senha
         </h3>
         
         <div className="bg-gray-50 p-6 rounded border border-gray-100">
             <p className="text-xs text-gray-500 mb-4">Preencha os campos abaixo apenas se desejar alterar sua senha de acesso.</p>
             <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700">Senha Atual</label>
                    <div className="relative">
                        <Lock size={16} className="absolute left-3 top-3 text-gray-400"/>
                        <input 
                            type="password" 
                            placeholder="••••••"
                            className="w-full border p-2 pl-9 rounded bg-white text-gray-700 focus:ring-2 focus:ring-primary focus:outline-none"
                            value={currentPassword}
                            onChange={e => setCurrentPassword(e.target.value)}
                        />
                    </div>
                </div>

                <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700">Nova Senha</label>
                    <div className="relative">
                        <Lock size={16} className="absolute left-3 top-3 text-gray-400"/>
                        <input 
                            type="password" 
                            placeholder="Nova senha"
                            className="w-full border p-2 pl-9 rounded bg-white text-gray-700 focus:ring-2 focus:ring-primary focus:outline-none"
                            value={newPassword}
                            onChange={e => setNewPassword(e.target.value)}
                        />
                    </div>
                </div>

                <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700">Confirmar Nova Senha</label>
                    <div className="relative">
                        <Lock size={16} className="absolute left-3 top-3 text-gray-400"/>
                        <input 
                            type="password" 
                            placeholder="Repita a nova senha"
                            className="w-full border p-2 pl-9 rounded bg-white text-gray-700 focus:ring-2 focus:ring-primary focus:outline-none"
                            value={confirmPassword}
                            onChange={e => setConfirmPassword(e.target.value)}
                        />
                    </div>
                </div>
             </div>
         </div>

         <div className="mt-8 flex justify-end">
            <button 
                onClick={handleSave}
                className="flex items-center px-6 py-2 bg-primary text-white rounded hover:bg-primaryDark transition-colors shadow-sm"
            >
                <Save size={18} className="mr-2" /> Salvar Alterações
            </button>
         </div>
      </div>
    </div>
  );
};

export default Profile;
