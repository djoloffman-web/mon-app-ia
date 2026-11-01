import { Account, Category, Transaction } from '../types/budget';
import { DEFAULT_CATEGORIES } from '../data/categories';

const STORAGE_KEYS = {
  ACCOUNTS: 'monbudget_accounts',
  TRANSACTIONS: 'monbudget_transactions',
  CATEGORIES: 'monbudget_categories',
  SAVINGS_GOAL: 'monbudget_savings_goal',
  ONBOARDING_DONE: 'monbudget_onboarding_done',
};

export const loadStoredAccounts = (): Account[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ACCOUNTS);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load accounts', e);
    return [];
  }
};

export const saveStoredAccounts = (accounts: Account[]): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.ACCOUNTS, JSON.stringify(accounts));
  } catch (e) {
    console.error('Failed to save accounts', e);
  }
};

export const loadStoredTransactions = (): Transaction[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load transactions', e);
    return [];
  }
};

export const saveStoredTransactions = (transactions: Transaction[]): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
  } catch (e) {
    console.error('Failed to save transactions', e);
  }
};

export const loadStoredCategories = (): Category[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
    if (!raw) return DEFAULT_CATEGORIES;
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load categories', e);
    return DEFAULT_CATEGORIES;
  }
};

export const saveStoredCategories = (categories: Category[]): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
  } catch (e) {
    console.error('Failed to save categories', e);
  }
};

export const loadSavingsGoal = (): number => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SAVINGS_GOAL);
    return raw ? Number(raw) : 300;
  } catch {
    return 300;
  }
};

export const saveSavingsGoal = (goal: number): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.SAVINGS_GOAL, String(goal));
  } catch (e) {
    console.error('Failed to save savings goal', e);
  }
};

export const isOnboardingCompleted = (): boolean => {
  try {
    return localStorage.getItem(STORAGE_KEYS.ONBOARDING_DONE) === 'true';
  } catch {
    return false;
  }
};

export const setOnboardingCompleted = (done: boolean): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.ONBOARDING_DONE, done ? 'true' : 'false');
  } catch (e) {
    console.error('Failed to set onboarding state', e);
  }
};

export const clearAllData = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEYS.ACCOUNTS);
    localStorage.removeItem(STORAGE_KEYS.TRANSACTIONS);
    localStorage.removeItem(STORAGE_KEYS.CATEGORIES);
    localStorage.removeItem(STORAGE_KEYS.SAVINGS_GOAL);
    localStorage.removeItem(STORAGE_KEYS.ONBOARDING_DONE);
  } catch (e) {
    console.error('Failed to clear data', e);
  }
};

export const exportDataAsJSON = (
  accounts: Account[],
  transactions: Transaction[],
  categories: Category[],
  savingsGoal: number
): void => {
  const exportPayload = {
    version: '1.0',
    exportedAt: new Date().toISOString(),
    author: 'Demba',
    appName: 'Mon budget',
    data: {
      accounts,
      transactions,
      categories,
      savingsGoal,
    },
  };

  const blob = new Blob([JSON.stringify(exportPayload, null, 2)], {
    type: 'application/json',
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `mon-budget-sauvegarde-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

export const exportTransactionsAsCSV = (
  transactions: Transaction[],
  accounts: Account[],
  categories: Category[]
): void => {
  const accountMap = new Map(accounts.map((a) => [a.id, a.name]));
  const categoryMap = new Map(categories.map((c) => [c.id, c.name]));

  const headers = ['Date', 'Type', 'Montant (€)', 'Catégorie', 'Compte', 'Bénéficiaire / Tiers', 'Moyen', 'Notes'];
  const rows = transactions.map((t) => [
    t.date,
    t.type === 'income' ? 'Revenu' : t.type === 'expense' ? 'Dépense' : 'Virement',
    (t.type === 'expense' ? -t.amount : t.amount).toFixed(2),
    categoryMap.get(t.categoryId) || 'Non catégorisé',
    accountMap.get(t.accountId) || 'Compte inconnu',
    `"${(t.payee || '').replace(/"/g, '""')}"`,
    t.paymentMethod,
    `"${(t.notes || '').replace(/"/g, '""')}"`,
  ]);

  const csvContent = '\uFEFF' + [headers.join(';'), ...rows.map((e) => e.join(';'))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `mon-budget-transactions-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};
