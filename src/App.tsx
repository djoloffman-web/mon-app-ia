import React, { useState, useEffect, useMemo } from 'react';
import {
  loadStoredAccounts,
  saveStoredAccounts,
  loadStoredTransactions,
  saveStoredTransactions,
  loadStoredCategories,
  saveStoredCategories,
  loadSavingsGoal,
  saveSavingsGoal,
  isOnboardingCompleted,
  setOnboardingCompleted,
  clearAllData,
} from './utils/storage';
import { Account, Category, Transaction } from './types/budget';
import {
  calculateAccountsWithBalances,
  calculateBudgetSummary,
  calculateCategoryBreakdown,
  calculateMonthlyHistory,
} from './utils/budgetCalculations';
import { getCurrentMonthKey } from './utils/formatters';
import { getDemoAccounts, getDemoTransactions } from './data/demoData';

import { Navbar } from './components/Navbar';
import { DashboardKPIs } from './components/DashboardKPIs';
import { AccountsView } from './components/AccountsView';
import { ChartsSection } from './components/ChartsSection';
import { TransactionList } from './components/TransactionList';
import { TransactionModal } from './components/TransactionModal';
import { AccountModal } from './components/AccountModal';
import { TransferModal } from './components/TransferModal';
import { CategoryManagerModal } from './components/CategoryManagerModal';
import { ExportImportModal } from './components/ExportImportModal';
import { OnboardingWizard } from './components/OnboardingWizard';
import { Sparkles } from 'lucide-react';

export const App: React.FC = () => {
  // Global persistent states
  const [accounts, setAccounts] = useState<Account[]>(() => loadStoredAccounts());
  const [transactions, setTransactions] = useState<Transaction[]>(() => loadStoredTransactions());
  const [categories, setCategories] = useState<Category[]>(() => loadStoredCategories());
  const [savingsGoal, setSavingsGoal] = useState<number>(() => loadSavingsGoal());
  const [showOnboarding, setShowOnboarding] = useState<boolean>(() => {
    const accountsLoaded = loadStoredAccounts();
    return accountsLoaded.length === 0 && !isOnboardingCompleted();
  });

  // Selected view month (YYYY-MM)
  const [selectedMonthKey, setSelectedMonthKey] = useState<string>(() => getCurrentMonthKey());

  // Modals state
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);

  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isBackupModalOpen, setIsBackupModalOpen] = useState(false);

  // Sync to localStorage
  useEffect(() => {
    saveStoredAccounts(accounts);
  }, [accounts]);

  useEffect(() => {
    saveStoredTransactions(transactions);
  }, [transactions]);

  useEffect(() => {
    saveStoredCategories(categories);
  }, [categories]);

  useEffect(() => {
    saveSavingsGoal(savingsGoal);
  }, [savingsGoal]);

  // Dynamic calculations
  const accountsWithBalances = useMemo(
    () => calculateAccountsWithBalances(accounts, transactions),
    [accounts, transactions]
  );

  const budgetSummary = useMemo(
    () => calculateBudgetSummary(accountsWithBalances, transactions, selectedMonthKey),
    [accountsWithBalances, transactions, selectedMonthKey]
  );

  const categoryBreakdown = useMemo(
    () => calculateCategoryBreakdown(categories, transactions, selectedMonthKey),
    [categories, transactions, selectedMonthKey]
  );

  const historyPoints = useMemo(
    () => calculateMonthlyHistory(transactions, selectedMonthKey, 6),
    [transactions, selectedMonthKey]
  );

  // Handlers for Transactions
  const handleSaveTransaction = (savedTx: Transaction) => {
    setTransactions((prev) => {
      const exists = prev.some((t) => t.id === savedTx.id);
      if (exists) {
        return prev.map((t) => (t.id === savedTx.id ? savedTx : t));
      }
      return [savedTx, ...prev];
    });
  };

  const handleDeleteTransaction = (txId: string) => {
    setTransactions((prev) => prev.filter((t) => t.id !== txId));
  };

  // Handlers for Accounts
  const handleSaveAccount = (savedAccount: Account) => {
    setAccounts((prev) => {
      const exists = prev.some((a) => a.id === savedAccount.id);
      if (exists) {
        return prev.map((a) => (a.id === savedAccount.id ? savedAccount : a));
      }
      return [...prev, savedAccount];
    });
  };

  const handleDeleteAccount = (accId: string) => {
    setAccounts((prev) => prev.filter((a) => a.id !== accId));
    // Also remove associated transactions
    setTransactions((prev) => prev.filter((t) => t.accountId !== accId && t.toAccountId !== accId));
  };

  // Handlers for Categories
  const handleUpdateCategoryBudget = (catId: string, newBudget: number) => {
    setCategories((prev) =>
      prev.map((c) => (c.id === catId ? { ...c, monthlyBudget: newBudget } : c))
    );
  };

  const handleAddCategory = (newCat: Category) => {
    setCategories((prev) => [...prev, newCat]);
  };

  // Handlers for Onboarding completion
  const handleCompleteOnboarding = (
    newAccounts: Account[],
    newTransactions: Transaction[],
    newSavingsGoal: number
  ) => {
    setAccounts(newAccounts);
    setTransactions(newTransactions);
    setSavingsGoal(newSavingsGoal);
    setOnboardingCompleted(true);
    setShowOnboarding(false);
  };

  const handleSkipOnboardingEmpty = () => {
    // Start with a default empty checking account
    const defaultAccount: Account = {
      id: 'acc_default',
      name: 'Compte Courant',
      type: 'checking',
      initialBalance: 0,
      currentBalance: 0,
      color: '#4f46e5',
      icon: 'Wallet',
      institution: 'Banque',
      createdAt: new Date().toISOString(),
    };
    setAccounts([defaultAccount]);
    setOnboardingCompleted(true);
    setShowOnboarding(false);
  };

  const handleLoadDemoData = () => {
    const demoAccs = getDemoAccounts();
    const demoTxs = getDemoTransactions(demoAccs);
    setAccounts(demoAccs);
    setTransactions(demoTxs);
    setSavingsGoal(400);
    setOnboardingCompleted(true);
    setShowOnboarding(false);
  };

  const handleResetData = () => {
    clearAllData();
    setAccounts([]);
    setTransactions([]);
    setSavingsGoal(300);
    setShowOnboarding(true);
  };

  const handleImportData = (imported: {
    accounts: Account[];
    transactions: Transaction[];
    categories: Category[];
    savingsGoal: number;
  }) => {
    setAccounts(imported.accounts);
    setTransactions(imported.transactions);
    setCategories(imported.categories);
    setSavingsGoal(imported.savingsGoal);
    setOnboardingCompleted(true);
    setShowOnboarding(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900 selection:bg-indigo-100 selection:text-indigo-900">
      {/* Interactive Onboarding Wizard when required */}
      {showOnboarding && (
        <OnboardingWizard
          categories={categories}
          onComplete={handleCompleteOnboarding}
          onSkipEmpty={handleSkipOnboardingEmpty}
          onLoadDemo={handleLoadDemoData}
        />
      )}

      {/* Main Top Navbar */}
      <Navbar
        selectedMonthKey={selectedMonthKey}
        onChangeMonth={setSelectedMonthKey}
        onOpenAddModal={() => {
          setEditingTransaction(null);
          setIsTransactionModalOpen(true);
        }}
        onOpenCategoryManager={() => setIsCategoryModalOpen(true)}
        onOpenBackupModal={() => setIsBackupModalOpen(true)}
        onOpenOnboarding={() => setShowOnboarding(true)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Empty state banner if no accounts are configured */}
        {accounts.length === 0 && !showOnboarding && (
          <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <Sparkles className="w-5 h-5 text-indigo-600 shrink-0" />
              <p className="text-xs sm:text-sm font-medium text-indigo-900">
                Vous n'avez pas encore configuré de comptes bancaires. Lancez l'assistant de configuration interactive.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowOnboarding(true)}
              className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm shrink-0"
            >
              Lancer la configuration
            </button>
          </div>
        )}

        {/* 1. Dashboard Financial KPI Cards */}
        <DashboardKPIs summary={budgetSummary} savingsGoal={savingsGoal} />

        {/* 2. Bank Accounts Synthesis */}
        <AccountsView
          accounts={accountsWithBalances}
          transactions={transactions}
          onOpenAddAccount={() => {
            setEditingAccount(null);
            setIsAccountModalOpen(true);
          }}
          onOpenEditAccount={(acc) => {
            setEditingAccount(acc);
            setIsAccountModalOpen(true);
          }}
          onDeleteAccount={handleDeleteAccount}
          onOpenTransferModal={() => setIsTransferModalOpen(true)}
        />

        {/* 3. Visualizations, Donut Pie Chart & Budget Gauges */}
        <ChartsSection
          categoryBreakdown={categoryBreakdown}
          historyPoints={historyPoints}
          totalExpenses={budgetSummary.monthlyExpense}
          totalIncome={budgetSummary.monthlyIncome}
          onOpenCategoryManager={() => setIsCategoryModalOpen(true)}
        />

        {/* 4. Complete Transaction History & Entry Management */}
        <TransactionList
          transactions={transactions}
          accounts={accountsWithBalances}
          categories={categories}
          selectedMonthKey={selectedMonthKey}
          onOpenAddModal={() => {
            setEditingTransaction(null);
            setIsTransactionModalOpen(true);
          }}
          onOpenEditModal={(tx) => {
            setEditingTransaction(tx);
            setIsTransactionModalOpen(true);
          }}
          onDeleteTransaction={handleDeleteTransaction}
        />
      </main>

      {/* Footer */}
      <footer className="mt-auto py-8 bg-white border-t border-slate-100 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-700 font-display">Mon budget</span>
            <span>•</span>
            <span>Application de gestion budgétaire familiale</span>
          </div>
          <div className="flex items-center gap-3">
            <span>Créé par <strong className="text-slate-600">Demba</strong></span>
            <span>•</span>
            <a
              href="https://budget.monapp.online/"
              target="_blank"
              rel="noreferrer"
              className="text-indigo-600 hover:text-indigo-700 underline underline-offset-2"
            >
              https://budget.monapp.online/
            </a>
          </div>
        </div>
      </footer>

      {/* MODALS */}
      {/* Transaction Modal (Add/Edit) */}
      <TransactionModal
        isOpen={isTransactionModalOpen}
        onClose={() => {
          setIsTransactionModalOpen(false);
          setEditingTransaction(null);
        }}
        onSave={handleSaveTransaction}
        accounts={accountsWithBalances}
        categories={categories}
        editingTransaction={editingTransaction}
        defaultDate={`${selectedMonthKey}-01`}
      />

      {/* Account Modal (Add/Edit) */}
      <AccountModal
        isOpen={isAccountModalOpen}
        onClose={() => {
          setIsAccountModalOpen(false);
          setEditingAccount(null);
        }}
        onSave={handleSaveAccount}
        editingAccount={editingAccount}
      />

      {/* Transfer Modal */}
      <TransferModal
        isOpen={isTransferModalOpen}
        onClose={() => setIsTransferModalOpen(false)}
        accounts={accountsWithBalances}
        onSaveTransfer={handleSaveTransaction}
        defaultDate={`${selectedMonthKey}-01`}
      />

      {/* Category Manager Modal */}
      <CategoryManagerModal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        categories={categories}
        onUpdateCategoryBudget={handleUpdateCategoryBudget}
        onAddCategory={handleAddCategory}
      />

      {/* Backup, Import/Export & Reset Modal */}
      <ExportImportModal
        isOpen={isBackupModalOpen}
        onClose={() => setIsBackupModalOpen(false)}
        accounts={accountsWithBalances}
        transactions={transactions}
        categories={categories}
        savingsGoal={savingsGoal}
        onImportData={handleImportData}
        onResetData={handleResetData}
        onRestartOnboarding={() => setShowOnboarding(true)}
      />
    </div>
  );
};

export default App;
