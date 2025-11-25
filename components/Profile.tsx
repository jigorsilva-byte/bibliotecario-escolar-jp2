
import React, { useState, useRef } from 'react';
import { User } from '../types';
import { Save, User as UserIcon, Camera, Upload } from 'lucide-react';
import * as Storage from '../services/storage';

interface ProfileProps {
  user: User;
  onUpdateUser: (updatedUser: User) => void;
}

const Profile: React.FC<ProfileProps> = ({ user, onUpdateUser }) => {
  const [formData, setFormData] = useState(user);
  const [message, setMessage] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSave = () => {
    // In a real app, we would validate and send to backend
    // Here we update local storage and app state
    const allUsers = Storage.getCollection<User>('users', []);
    
    // Check if email is being changed and if it already exists (excluding self)
    const emailExists = allUsers.some(u => u.email.toLowerCase() === formData.email.toLowerCase() && u.id !== user.id);
    if (emailExists) {
        setMessage('Erro: Este e-mail já está sendo usado por outro usuário.');
        return;
    }

    const updatedUsers = allUsers.map(u => u.id === user.id ? formData : u);
    
    Storage.saveCollection('users', updatedUsers);
    onUpdateUser(formData);
    
    setMessage('Perfil atualizado com sucesso!');
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
    <div className="space-y-6 animate-fade-in max-w-4xl mx-auto">
      <div className="flex items-center space-x-4 border-b pb-4">
        <div className="h-16 w-16 bg-primary rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-lg overflow-hidden">
           {formData.photoUrl ? <img src={formData.photoUrl} className="w-full h-full object-cover" /> : formData.name.charAt(0)}
        </div>
        <div>
           <h2 className="text-2xl font-light text-gray-600">Meu Perfil</h2>
           <p className="text-sm text-gray-400">Gerencie suas informações pessoais</p>
        </div>
      </div>

      {message && (
        <div className={`p-4 rounded border animate-fade-in ${message.includes('Erro') ? 'bg-red-100 text-red-700 border-red-200' : 'bg-green-100 text-green-700 border-green-200'}`}>
            {message}
        </div>
      )}

      <div className="bg-white p-8 rounded shadow-sm border border-gray-200">
         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="col-span-1 md:col-span-2 flex flex-col items-center justify-center mb-6">
                <div 
                    className="relative group cursor-pointer w-32 h-32 rounded-full overflow-hidden border-4 border-gray-100 bg-gray-200 shadow-inner"
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
                    className="w-full border p-2 rounded bg-white text-gray-700 focus:ring-2 focus:ring-primary focus:outline-none"
                    value={formData.type}
                    onChange={e => setFormData({...formData, type: e.target.value as any})}
                >
                    <option value="Aluno">Aluno</option>
                    <option value="Professor">Professor</option>
                    <option value="Funcionário">Funcionário</option>
                </select>
            </div>
         </div>

         <div className="mt-8 flex justify-end border-t pt-6">
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
