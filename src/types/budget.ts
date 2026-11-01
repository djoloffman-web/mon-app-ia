export type TransactionType = 'income' | 'expense' | 'transfer';

export type PaymentMethod = 'card' | 'transfer' | 'direct_debit' | 'cash' | 'check' | 'other';

export type AccountType = 'checking' | 'savings' | 'credit' | 'cash' | 'investment';

export interface Account {
  id: string;
  name: string;
  type: AccountType;
  initialBalance: number;
  currentBalance: number;
  color: string;
  icon: string;
  institution?: string;
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  type: 'expense' | 'income';
  color: string;
  icon: string;
  monthlyBudget: number; // 0 if no budget defined
  isDefault?: boolean;
}

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  date: string; // YYYY-MM-DD
  categoryId: string;
  accountId: string;
  toAccountId?: string; // For transfers
  payee: string; // Marchand, tiers ou source
  notes?: string;
  paymentMethod: PaymentMethod;
  isRecurring?: boolean;
  recurringFrequency?: 'monthly' | 'weekly' | 'yearly';
  createdAt: string;
}

export interface BudgetSummary {
  totalBalance: number;
  monthlyIncome: number;
  monthlyExpense: number;
  netSavings: number;
  savingsRate: number;
  leftToSpend: number;
}

export interface CategoryBreakdown {
  category: Category;
  totalSpent: number;
  percentage: number;
  budget: number;
  budgetExceeded: boolean;
  percentageOfBudget: number;
}

export interface MonthlyHistoryPoint {
  monthKey: string; // YYYY-MM
  label: string;
  income: number;
  expense: number;
  savings: number;
}

export interface OnboardingData {
  accounts: Array<{
    name: string;
    type: AccountType;
    balance: number;
    color: string;
    icon: string;
  }>;
  incomes: Array<{
    title: string;
    amount: number;
    categoryId: string;
    accountIdIndex: number;
  }>;
  fixedExpenses: Array<{
    title: string;
    amount: number;
    categoryId: string;
    accountIdIndex: number;
  }>;
  monthlySavingsGoal: number;
}
