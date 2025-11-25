
export enum UserRole {
  ADMIN = 'ADMIN',
  USER = 'USER'
}

export interface User {
  id: string;
  name: string;
  email: string; // Used as login
  password?: string; // Added password
  role: UserRole;
  phone: string;
  type: 'Aluno' | 'Professor' | 'Funcionário';
  sectorOrClass?: string;
  photoUrl?: string;
  mustChangePassword?: boolean;
}

export interface BookFormat {
  id: string;
  name: string;
}

export interface Book {
  id: string;
  title: string;
  author: string;
  isbn: string;
  category: string; // Genero literário
  format: string; // Ex: Livro, Gibi, Revista
  knowledgeArea: string; // Área de conhecimento
  year?: string;
  quantity: number;
  available: number;
  shelf: string; // Estante
  shelfLocation: string; // Prateleira
  coverUrl?: string;
  synopsis?: string;
  publisher?: string;
  sector?: string; // Setor de origem
}

export interface Loan {
  id: string;
  userId: string;
  userName: string;
  bookId: string;
  bookTitle: string;
  loanDate: string; // ISO Date
  dueDate: string; // ISO Date
  returnDate?: string; // ISO Date, null if not returned
  status: 'Emprestado' | 'Devolvido' | 'Atrasado';
}

export interface DigitalAsset {
  id: string;
  title: string;
  type: 'PDF' | 'E-Book' | 'Audiobook';
  category: string;
  url: string;
  coverUrl?: string;
}

export interface ClassSector {
  id: string;
  name: string;
}

export interface AppSettings {
  institutionName: string;
  address: string;
  logoUrl: string;
  bookColumns: {
    format: boolean;
    isbn: boolean;
    author: boolean;
    publisher: boolean;
    quantity: boolean;
    synopsis: boolean;
    year: boolean;
    shelf: boolean;
    shelfLocation: boolean;
    knowledgeArea: boolean;
  };
  categories: string[];
}

export interface DashboardStats {
  totalBooks: number;
  totalUsers: number;
  activeLoans: number;
  totalEbooks: number;
}

export interface Notification {
  id: string;
  userId?: string; // If null, it's a system/admin notification
  title: string;
  message: string;
  type: 'info' | 'warning' | 'danger';
  isRead: boolean;
  date: string;
}
