import {
  Account,
  Category,
  Transaction,
  BudgetSummary,
  CategoryBreakdown,
  MonthlyHistoryPoint,
} from '../types/budget';
import { getMonthKeyFromDate, formatMonthYear } from './formatters';

export const calculateAccountsWithBalances = (
  accounts: Account[],
  transactions: Transaction[]
): Account[] => {
  return accounts.map((acc) => {
    let balance = acc.initialBalance;

    transactions.forEach((tx) => {
      if (tx.accountId === acc.id) {
        if (tx.type === 'income') {
          balance += tx.amount;
        } else if (tx.type === 'expense') {
          balance -= tx.amount;
        } else if (tx.type === 'transfer') {
          // outgoing transfer
          balance -= tx.amount;
        }
      }

      // incoming transfer
      if (tx.type === 'transfer' && tx.toAccountId === acc.id) {
        balance += tx.amount;
      }
    });

    return {
      ...acc,
      currentBalance: balance,
    };
  });
};

export const calculateBudgetSummary = (
  accountsWithBalances: Account[],
  transactions: Transaction[],
  monthKey: string
): BudgetSummary => {
  const totalBalance = accountsWithBalances.reduce((sum, acc) => sum + acc.currentBalance, 0);

  let monthlyIncome = 0;
  let monthlyExpense = 0;

  transactions.forEach((tx) => {
    if (getMonthKeyFromDate(tx.date) === monthKey) {
      if (tx.type === 'income') {
        monthlyIncome += tx.amount;
      } else if (tx.type === 'expense') {
        monthlyExpense += tx.amount;
      }
    }
  });

  const netSavings = monthlyIncome - monthlyExpense;
  const savingsRate = monthlyIncome > 0 ? Math.max(0, (netSavings / monthlyIncome) * 100) : 0;
  const leftToSpend = netSavings;

  return {
    totalBalance,
    monthlyIncome,
    monthlyExpense,
    netSavings,
    savingsRate,
    leftToSpend,
  };
};

export const calculateCategoryBreakdown = (
  categories: Category[],
  transactions: Transaction[],
  monthKey: string
): CategoryBreakdown[] => {
  const expenseTransactions = transactions.filter(
    (tx) => tx.type === 'expense' && getMonthKeyFromDate(tx.date) === monthKey
  );

  const totalExpense = expenseTransactions.reduce((sum, tx) => sum + tx.amount, 0);

  const categoryMap = new Map<string, number>();
  expenseTransactions.forEach((tx) => {
    const prev = categoryMap.get(tx.categoryId) || 0;
    categoryMap.set(tx.categoryId, prev + tx.amount);
  });

  const expenseCategories = categories.filter((c) => c.type === 'expense');

  const breakdown: CategoryBreakdown[] = expenseCategories.map((cat) => {
    const spent = categoryMap.get(cat.id) || 0;
    const percentage = totalExpense > 0 ? (spent / totalExpense) * 100 : 0;
    const budget = cat.monthlyBudget || 0;
    const budgetExceeded = budget > 0 && spent > budget;
    const percentageOfBudget = budget > 0 ? (spent / budget) * 100 : 0;

    return {
      category: cat,
      totalSpent: spent,
      percentage,
      budget,
      budgetExceeded,
      percentageOfBudget,
    };
  });

  // Sort by spent descending
  return breakdown.sort((a, b) => b.totalSpent - a.totalSpent);
};

export const calculateMonthlyHistory = (
  transactions: Transaction[],
  referenceMonthKey: string,
  monthsCount: number = 6
): MonthlyHistoryPoint[] => {
  const [refYear, refMonth] = referenceMonthKey.split('-').map(Number);
  const points: MonthlyHistoryPoint[] = [];

  for (let i = monthsCount - 1; i >= 0; i--) {
    const date = new Date(refYear, refMonth - 1 - i, 1);
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const key = `${y}-${m}`;

    let income = 0;
    let expense = 0;

    transactions.forEach((tx) => {
      if (getMonthKeyFromDate(tx.date) === key) {
        if (tx.type === 'income') income += tx.amount;
        if (tx.type === 'expense') expense += tx.amount;
      }
    });

    points.push({
      monthKey: key,
      label: formatMonthYear(key).slice(0, 3) + ' ' + String(y).slice(2),
      income,
      expense,
      savings: income - expense,
    });
  }

  return points;
};
