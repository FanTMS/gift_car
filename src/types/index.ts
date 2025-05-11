export interface Company {
  id: string;
  name: string;
  logo: string;
  color: string;
  isMain: boolean;
  description?: string;
  website?: string;
  phone?: string;
  email?: string;
  address?: string;
  createdAt: any;
  updatedAt: any;
}

export interface PrizePlace {
  place: number;
  rangeStart?: number;
  rangeEnd?: number;
  description: string;
  prizeTitle: string;
  prizeImage?: string;
  specifications?: any;
}

export interface Raffle {
  id: string;
  companyId: string;
  title: string;
  description: string;
  images: string[];
  price: number;
  totalTickets: number;
  ticketsSold: number;
  status: 'draft' | 'active' | 'completed' | 'cancelled';
  startDate: any;
  endDate: any;
  createdAt: any;
  itemType: 'cars' | 'phones' | 'consoles' | 'other';
  engine?: string;
  power?: string;
  acceleration?: string;
  maxSpeed?: string;
  color?: string;
  year?: number;
  features?: any[];
  carSpecifications?: CarSpecifications | null;
  phoneSpecifications?: {
    brand: string;
    model: string;
    ram: string;
    storage: string;
    processor: string;
    camera: string;
    display: string;
    battery: string;
    operatingSystem: string;
  };
  consoleSpecifications?: {
    brand: string;
    model: string;
    storage: string;
    resolution: string;
    features: string[];
    bundledGames?: string[];
    accessories?: string[];
  };
  debugEnabled?: boolean;
  participants?: number;
  isFavorited?: boolean;
  isMultiPrize?: boolean;
  prizePlaces?: PrizePlace[];
}

export interface CarDimensions {
  length: string;
  width: string;
  height: string;
  wheelbase: string;
}

export interface CarEngine {
  type: string;
  displacement: string;
  horsepower: number;
  torque: string;
}

export interface CarSpecifications {
  make: string;
  model: string;
  year: number;
  engine: CarEngine;
  transmission: string;
  drivetrain: string;
  acceleration: string;
  topSpeed: string;
  power: string;
  fuel: string;
  features: string[];
  exteriorColor: string;
  interiorColor: string;
  dimensions: CarDimensions;
  weight: string;
  fuelEconomy: string;
}

export interface CarFeature {
  id: string;
  name: string;
  category: 'exterior' | 'interior' | 'comfort' | 'safety' | 'tech' | 'performance' | 'technology';
}

export interface AppSettings {
  id: string;
  maintenanceMode: boolean;
  maintenanceMessage: string;
  minVersion: string;
  currentVersion: string;
  appName: string;
  logoUrl?: string;
  heroImageUrl?: string;
  primaryColor: string;
  secondaryColor: string;
  contactEmail?: string;
  contactPhone?: string;
  cardSettings?: {
    enableFavorites: boolean;
    showCompanyLogo: boolean;
    showPrice: boolean;
    showProgress: boolean;
    cornerRadius: string;
    enableHoverEffects: boolean;
    cardElevation: 'low' | 'medium' | 'high';
  };
  theme: {
    primaryColor: string;
    secondaryColor: string;
    backgroundColor: string;
  };
  social: {
    facebook: string;
    instagram: string;
    twitter: string;
    telegram: string;
  };
  telegramWallet?: {
    enabled: boolean;
    botToken: string;
    botUsername: string;
    callbackUrl: string;
    welcomeMessage?: string;
  };
  createdAt?: any;
  updatedAt?: any;
}

export interface Ticket {
  id: string;
  raffleId: string;
  userId: string;
  quantity: number;
  purchaseDate: any;
  ticketNumbers: number[];
  status: 'active' | 'used' | 'cancelled';
  transactionId: string;
}

export interface Winner {
  id: string;
  raffleId: string;
  userId: string;
  ticketNumber: number;
  winDate: any;
  place?: number;
  prizeTitle?: string;
  prizeImage?: string;
}

export interface Transaction {
  id: string;
  userId: string;
  raffleId?: string;
  amount: number;
  status: 'pending' | 'completed' | 'failed';
  paymentMethod: string;
  ticketQuantity?: number;
  createdAt: any;
  completedAt?: any;
  description?: string;
  type?: 'deposit' | 'withdrawal' | 'purchase';
  operation?: 'add' | 'subtract';
  metadata?: Record<string, any>;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  isRead: boolean;
  createdAt: any;
  link?: string;
  metadata?: Record<string, any>;
}

export interface User {
  id: string;
  displayName?: string;
  photoURL?: string;
  telegramId?: string;
  username?: string;
  email?: string;
  phone?: string;
  role?: 'user' | 'admin' | 'superadmin';
  companyId?: string; // ID компании для администратора с ограниченным доступом
  createdAt?: any;
  updatedAt?: any;
  ticketsTotal?: number;
  wins?: number;
  balance?: number;
  activeTickets?: any[];
  historyTickets?: any[];
  // Новые поля для расширенного профиля
  firstName?: string;
  lastName?: string;
  bio?: string;
  city?: string;
  country?: string;
  language?: string;
  birthDate?: any;
  notifications?: {
    email: boolean;
    telegram: boolean;
    sms: boolean;
  };
  preferences?: {
    theme: 'light' | 'dark' | 'system';
    currency: string;
    language: string;
  };
  wallet?: {
    balance: number;
    transactions: any[];
    walletAddress?: string;
  };
  referralCode?: string;
  referredBy?: string;
  referralCount?: number;
  bonusPoints?: number;
  verified?: boolean;
  lastLogin?: any;
  stats?: {
    totalParticipations: number;
    totalSpent: number;
    rafflesWon: number;
    ticketsBought: number;
  };
} 