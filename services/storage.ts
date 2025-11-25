
import { Book, User, Loan, DigitalAsset, AppSettings, UserRole, Notification, ClassSector, BookFormat } from '../types';

// Mock Data for initial load
const INITIAL_USERS: User[] = [
  { id: '1', name: 'José Igor', email: 'admin@escola.com', password: '123', role: UserRole.ADMIN, phone: '(84) 98738-4620', type: 'Funcionário', photoUrl: 'https://picsum.photos/100/100', mustChangePassword: false },
  { id: '2', name: 'Maria Silva', email: 'aluno@escola.com', password: '123', role: UserRole.USER, phone: '(11) 99999-9999', type: 'Aluno', sectorOrClass: '3º Ano A', mustChangePassword: true },
];

const INITIAL_FORMATS: BookFormat[] = [
  { id: '1', name: 'LIVRO' },
  { id: '2', name: 'GIBI' },
  { id: '3', name: 'REVISTA' },
  { id: '4', name: 'ENCICLOPÉDIA' },
  { id: '5', name: 'APOSTILA' },
  { id: '6', name: 'COLEÇÃO' },
  { id: '7', name: 'JORNAL' }
];

const INITIAL_BOOKS: Book[] = [
  { id: '1', title: 'Novo Manual da Literatura', author: 'João', isbn: '123857484', category: 'Literatura', format: 'LIVRO', knowledgeArea: 'Linguagens', year: '2020', quantity: 3, available: 2, shelf: '8', shelfLocation: '3', coverUrl: 'https://picsum.photos/100/140', publisher: 'Editora A' },
  { id: '2', title: 'Dom Casmurro', author: 'Machado de Assis', isbn: '978852504', category: 'Clássico', format: 'LIVRO', knowledgeArea: 'Literatura Brasileira', year: '1899', quantity: 5, available: 5, shelf: 'A1', shelfLocation: '1', publisher: 'Garnier' },
];

const INITIAL_LOANS: Loan[] = [
  { id: '101', userId: '2', userName: 'Maria Silva', bookId: '1', bookTitle: 'Novo Manual da Literatura', loanDate: '2023-10-25', dueDate: '2023-11-01', status: 'Atrasado' }
];

const INITIAL_CLASSES: ClassSector[] = [
  { id: '1', name: '1º Ano A - Matutino' },
  { id: '2', name: '2º Ano B - Vespertino' },
  { id: '3', name: 'Biblioteca Central' },
  { id: '4', name: 'Sala dos Professores' },
];

const INITIAL_ASSETS: DigitalAsset[] = [
  { id: '1', title: 'Dom Quixote - PDF', type: 'PDF', category: 'Clássico', url: '#', coverUrl: 'https://picsum.photos/100/140?random=10' },
  { id: '2', title: 'Audiobook: Harry Potter', type: 'Audiobook', category: 'Fantasia', url: '#', coverUrl: 'https://picsum.photos/100/140?random=11' },
];

const INITIAL_SETTINGS: AppSettings = {
  institutionName: 'SISTEMA BIBLIOTECÁRIO ESCOLAR 3.0',
  address: 'Rua São Francisco Bairro Angrião Nº 3099',
  logoUrl: 'https://cdn-icons-png.flaticon.com/512/2232/2232688.png',
  bookColumns: {
    format: true,
    isbn: true,
    author: true,
    publisher: true,
    quantity: true,
    synopsis: false,
    year: true,
    shelf: true,
    shelfLocation: true,
    knowledgeArea: false
  },
  categories: ['Geral', 'Literatura', 'Clássico', 'Didático', 'Fantasia', 'História', 'Ciências', 'Infantil']
};

// Generic hook-like functions for local storage management
export const getCollection = <T>(key: string, defaultVal: T[]): T[] => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultVal;
  } catch (e) {
    console.error(`Error loading ${key}`, e);
    return defaultVal;
  }
};

export const saveCollection = <T>(key: string, data: T[]): void => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.error(`Error saving ${key}`, e);
  }
};

export const getSettings = (): AppSettings => {
  try {
    const item = localStorage.getItem('app_settings');
    if (!item) return INITIAL_SETTINGS;
    
    const parsed = JSON.parse(item);
    return { 
        ...INITIAL_SETTINGS, 
        ...parsed,
        bookColumns: { ...INITIAL_SETTINGS.bookColumns, ...(parsed.bookColumns || {}) },
        categories: parsed.categories && parsed.categories.length ? parsed.categories : INITIAL_SETTINGS.categories
    };
  } catch (e) {
    return INITIAL_SETTINGS;
  }
};

export const saveSettings = (data: AppSettings): void => {
  localStorage.setItem('app_settings', JSON.stringify(data));
};

// Initializers
export const loadInitialData = () => {
  if (!localStorage.getItem('users')) saveCollection('users', INITIAL_USERS);
  if (!localStorage.getItem('books')) saveCollection('books', INITIAL_BOOKS);
  if (!localStorage.getItem('loans')) saveCollection('loans', INITIAL_LOANS);
  if (!localStorage.getItem('assets')) saveCollection('assets', INITIAL_ASSETS);
  if (!localStorage.getItem('classes')) saveCollection('classes', INITIAL_CLASSES);
  if (!localStorage.getItem('formats')) saveCollection('formats', INITIAL_FORMATS);
  if (!localStorage.getItem('notifications')) saveCollection('notifications', []);
  
  const currentSettings = getSettings();
  saveSettings(currentSettings); 
};

// Notification Helpers
export const checkAndGenerateNotifications = () => {
  const loans = getCollection<Loan>('loans', []);
  const notifications = getCollection<Notification>('notifications', []);
  const today = new Date().toISOString().split('T')[0];

  let newNotifications: Notification[] = [];

  loans.forEach(loan => {
    if (loan.status === 'Emprestado' || loan.status === 'Atrasado') {
        const dueDate = new Date(loan.dueDate);
        const todayDate = new Date();
        const diffTime = dueDate.getTime() - todayDate.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
        
        const exists = notifications.some(n => n.message.includes(loan.bookTitle) && n.userId === loan.userId && n.date === today);

        if (!exists) {
            if (diffDays < 0) {
                newNotifications.push({
                    id: Date.now() + Math.random().toString(),
                    userId: loan.userId,
                    title: 'Empréstimo Atrasado',
                    message: `O livro "${loan.bookTitle}" está atrasado. Por favor, devolva o quanto antes.`,
                    type: 'danger',
                    isRead: false,
                    date: today
                });
            } else if (diffDays <= 3) {
                 newNotifications.push({
                    id: Date.now() + Math.random().toString(),
                    userId: loan.userId,
                    title: 'Devolução Próxima',
                    message: `O livro "${loan.bookTitle}" deve ser devolvido em ${diffDays} dias.`,
                    type: 'warning',
                    isRead: false,
                    date: today
                });
            }
        }
    }
  });

  if (newNotifications.length > 0) {
    saveCollection('notifications', [...notifications, ...newNotifications]);
    return [...notifications, ...newNotifications];
  }
  
  return notifications;
};
