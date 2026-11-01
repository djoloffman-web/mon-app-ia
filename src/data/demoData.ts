import { Account, Transaction } from '../types/budget';
import { generateId, getCurrentMonthKey } from '../utils/formatters';

export const getDemoAccounts = (): Account[] => [
  {
    id: generateId(),
    name: 'Compte Courant Principal',
    type: 'checking',
    initialBalance: 2450,
    currentBalance: 2450,
    color: '#4f46e5', // indigo
    icon: 'Wallet',
    institution: 'Banque Principale',
    createdAt: new Date().toISOString(),
  },
  {
    id: generateId(),
    name: 'Livret A & Épargne Projet',
    type: 'savings',
    initialBalance: 8200,
    currentBalance: 8200,
    color: '#10b981', // emerald
    icon: 'PiggyBank',
    institution: 'Épargne Familiale',
    createdAt: new Date().toISOString(),
  },
  {
    id: generateId(),
    name: 'Compte Dépenses Communes',
    type: 'checking',
    initialBalance: 680,
    currentBalance: 680,
    color: '#06b6d4', // cyan
    icon: 'CreditCard',
    institution: 'Banque En Ligne',
    createdAt: new Date().toISOString(),
  },
];

export const getDemoTransactions = (accounts: Account[]): Transaction[] => {
  const currentMonth = getCurrentMonthKey();
  const checking = accounts[0]?.id || '';
  const joint = accounts[2]?.id || checking;

  return [
    {
      id: generateId(),
      type: 'income',
      amount: 2750,
      date: `${currentMonth}-01`,
      categoryId: 'cat_salaire',
      accountId: checking,
      payee: 'Entreprise - Salaire net',
      notes: 'Salaire mensuel principal',
      paymentMethod: 'transfer',
      isRecurring: true,
      createdAt: new Date().toISOString(),
    },
    {
      id: generateId(),
      type: 'income',
      amount: 320,
      date: `${currentMonth}-05`,
      categoryId: 'cat_allocations',
      accountId: checking,
      payee: 'CAF - Allocations familiales',
      notes: 'Prestations familiales',
      paymentMethod: 'transfer',
      isRecurring: true,
      createdAt: new Date().toISOString(),
    },
    {
      id: generateId(),
      type: 'expense',
      amount: 880,
      date: `${currentMonth}-03`,
      categoryId: 'cat_logement',
      accountId: checking,
      payee: 'Bailleur / Prêt immobilier',
      notes: 'Loyer mensuel charges comprises',
      paymentMethod: 'direct_debit',
      isRecurring: true,
      createdAt: new Date().toISOString(),
    },
    {
      id: generateId(),
      type: 'expense',
      amount: 142.5,
      date: `${currentMonth}-06`,
      categoryId: 'cat_alimentation',
      accountId: joint,
      payee: 'Supermarché Bio & Local',
      notes: 'Courses de la semaine',
      paymentMethod: 'card',
      createdAt: new Date().toISOString(),
    },
    {
      id: generateId(),
      type: 'expense',
      amount: 85,
      date: `${currentMonth}-08`,
      categoryId: 'cat_transports',
      accountId: checking,
      payee: 'Pass Navigo / Transports en commun',
      paymentMethod: 'direct_debit',
      isRecurring: true,
      createdAt: new Date().toISOString(),
    },
    {
      id: generateId(),
      type: 'expense',
      amount: 115,
      date: `${currentMonth}-10`,
      categoryId: 'cat_factures',
      accountId: checking,
      payee: 'Fournisseur Énergie & Internet',
      paymentMethod: 'direct_debit',
      isRecurring: true,
      createdAt: new Date().toISOString(),
    },
    {
      id: generateId(),
      type: 'expense',
      amount: 64,
      date: `${currentMonth}-12`,
      categoryId: 'cat_loisirs',
      accountId: checking,
      payee: 'Cinéma & Restaurant familial',
      paymentMethod: 'card',
      createdAt: new Date().toISOString(),
    },
  ];
};
