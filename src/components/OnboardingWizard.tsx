import React, { useState } from 'react';
import {
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Plus,
  Trash2,
  HelpCircle,
} from 'lucide-react';
import { Account, AccountType, Category, Transaction } from '../types/budget';
import { generateId, getCurrentMonthKey } from '../utils/formatters';

interface OnboardingWizardProps {
  categories: Category[];
  onComplete: (accounts: Account[], transactions: Transaction[], savingsGoal: number) => void;
  onSkipEmpty: () => void;
  onLoadDemo: () => void;
}

interface InitialAccountForm {
  name: string;
  type: AccountType;
  balance: number;
  color: string;
}

interface IncomeForm {
  title: string;
  amount: number;
  categoryId: string;
}

interface ExpenseForm {
  title: string;
  amount: number;
  categoryId: string;
}

export const OnboardingWizard: React.FC<OnboardingWizardProps> = ({
  categories,
  onComplete,
  onSkipEmpty,
  onLoadDemo,
}) => {
  const [step, setStep] = useState<number>(1);

  // Étape 1 : Comptes bancaires de départ
  const [accounts, setAccounts] = useState<InitialAccountForm[]>([
    { name: 'Compte Courant Principal', type: 'checking', balance: 1500, color: '#4f46e5' },
    { name: 'Livret Épargne / Secours', type: 'savings', balance: 4000, color: '#10b981' },
  ]);

  // Étape 2 : Salaires et rentrées régulières
  const [incomes, setIncomes] = useState<IncomeForm[]>([
    { title: 'Salaire mensuel net (Foyer)', amount: 2800, categoryId: 'cat_salaire' },
    { title: 'Allocations / Compléments', amount: 0, categoryId: 'cat_allocations' },
  ]);

  // Étape 3 : Dépenses fixes et courantes
  const [expenses, setExpenses] = useState<ExpenseForm[]>([
    { title: 'Loyer ou Remboursement de prêt', amount: 850, categoryId: 'cat_logement' },
    { title: 'Budget Alimentation & Courses', amount: 550, categoryId: 'cat_alimentation' },
    { title: 'Électricité, Eau & Abonnements Internet', amount: 180, categoryId: 'cat_factures' },
    { title: 'Transports (Carburant / Transports en commun)', amount: 160, categoryId: 'cat_transports' },
  ]);

  // Étape 4 : Objectif d'épargne mensuel
  const [savingsGoal, setSavingsGoal] = useState<number>(300);

  // Calculations for preview
  const totalInitialWealth = accounts.reduce((sum, a) => sum + (Number(a.balance) || 0), 0);
  const totalMonthlyIncome = incomes.reduce((sum, i) => sum + (Number(i.amount) || 0), 0);
  const totalMonthlyExpense = expenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
  const estimatedResteAVivre = totalMonthlyIncome - totalMonthlyExpense;

  const handleAddAccount = () => {
    setAccounts([
      ...accounts,
      { name: 'Nouveau Compte', type: 'checking', balance: 0, color: '#06b6d4' },
    ]);
  };

  const handleRemoveAccount = (index: number) => {
    if (accounts.length > 1) {
      setAccounts(accounts.filter((_, i) => i !== index));
    }
  };

  const handleAddIncome = () => {
    setIncomes([
      ...incomes,
      { title: 'Autre revenu', amount: 200, categoryId: 'cat_revenus_divers' },
    ]);
  };

  const handleRemoveIncome = (index: number) => {
    setIncomes(incomes.filter((_, i) => i !== index));
  };

  const handleAddExpense = () => {
    setExpenses([
      ...expenses,
      { title: 'Autre dépense courante', amount: 100, categoryId: 'cat_divers' },
    ]);
  };

  const handleRemoveExpense = (index: number) => {
    setExpenses(expenses.filter((_, i) => i !== index));
  };

  const handleFinish = () => {
    const currentMonth = getCurrentMonthKey();
    const today = new Date().toISOString().slice(0, 10);

    // Generate accounts
    const createdAccounts: Account[] = accounts.map((acc, index) => ({
      id: generateId(),
      name: acc.name.trim() || `Compte ${index + 1}`,
      type: acc.type,
      initialBalance: Number(acc.balance) || 0,
      currentBalance: Number(acc.balance) || 0,
      color: acc.color,
      icon: acc.type === 'savings' ? 'PiggyBank' : 'Wallet',
      institution: 'Banque',
      createdAt: new Date().toISOString(),
    }));

    const mainAccount = createdAccounts[0];
    const createdTransactions: Transaction[] = [];

    // Generate initial income transactions for the month if amount > 0
    incomes.forEach((inc) => {
      if (inc.amount > 0 && mainAccount) {
        createdTransactions.push({
          id: generateId(),
          type: 'income',
          amount: Number(inc.amount),
          date: `${currentMonth}-01`,
          categoryId: inc.categoryId || 'cat_salaire',
          accountId: mainAccount.id,
          payee: inc.title.trim() || 'Revenu régulier',
          notes: 'Configuré lors de la mise en place initiale',
          paymentMethod: 'transfer',
          isRecurring: true,
          createdAt: today,
        });
      }
    });

    // Generate initial recurring expense transactions if amount > 0
    expenses.forEach((exp, idx) => {
      if (exp.amount > 0 && mainAccount) {
        const day = String(Math.min(28, 3 + idx * 3)).padStart(2, '0');
        createdTransactions.push({
          id: generateId(),
          type: 'expense',
          amount: Number(exp.amount),
          date: `${currentMonth}-${day}`,
          categoryId: exp.categoryId || 'cat_divers',
          accountId: mainAccount.id,
          payee: exp.title.trim() || 'Dépense courante',
          notes: 'Charge mensuelle estimée',
          paymentMethod: 'direct_debit',
          isRecurring: true,
          createdAt: today,
        });
      }
    });

    onComplete(createdAccounts, createdTransactions, savingsGoal);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 max-w-2xl w-full overflow-hidden transition-all duration-300">
        {/* Header with step indicator */}
        <div className="bg-slate-900 text-white px-8 py-6 relative overflow-hidden">
          <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-40 h-40 bg-indigo-500/20 rounded-full blur-2xl pointer-events-none" />
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold text-sm">
                  MB
                </span>
                <span className="text-xs uppercase tracking-wider font-semibold text-indigo-300">
                  Configuration initiale
                </span>
              </div>
              <span className="text-xs text-slate-400 font-mono">
                Étape {step} sur 4
              </span>
            </div>
            <h2 className="text-2xl font-bold tracking-tight font-display">
              {step === 1 && '1. Vos comptes bancaires'}
              {step === 2 && '2. Vos revenus mensuels réguliers'}
              {step === 3 && '3. Vos dépenses courantes & charges'}
              {step === 4 && '4. Objectif & Synthèse prévisionnelle'}
            </h2>
            <p className="text-sm text-slate-300 mt-1">
              {step === 1 && 'Indiquez les comptes à suivre et leurs soldes de départ actuels.'}
              {step === 2 && 'Renseignez vos salaires, pensions ou autres rentrées régulières.'}
              {step === 3 && 'Estimez les postes de dépenses incontournables de la famille.'}
              {step === 4 && 'Vérifiez la balance et commencez la gestion de votre budget.'}
            </p>

            {/* Step progress bar */}
            <div className="w-full bg-slate-800 h-1.5 rounded-full mt-5 overflow-hidden flex">
              <div
                className="bg-indigo-500 h-full transition-all duration-300"
                style={{ width: `${(step / 4) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Wizard Body */}
        <div className="p-8 max-h-[65vh] overflow-y-auto">
          {step === 1 && (
            <div className="space-y-4">
              <div className="bg-indigo-50/70 border border-indigo-100 rounded-2xl p-4 text-xs text-indigo-900 flex items-start gap-3">
                <HelpCircle className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
                <p>
                  Ces soldes représentent la situation actuelle de vos comptes aujourd'hui. Vos transactions futures viendront recalculer vos soldes en direct.
                </p>
              </div>

              <div className="space-y-3">
                {accounts.map((acc, index) => (
                  <div
                    key={index}
                    className="p-4 rounded-2xl border border-slate-200 hover:border-slate-300 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center gap-3 transition-colors"
                  >
                    <div className="flex-1">
                      <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                        Nom du compte
                      </label>
                      <input
                        type="text"
                        value={acc.name}
                        onChange={(e) => {
                          const next = [...accounts];
                          next[index].name = e.target.value;
                          setAccounts(next);
                        }}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                        placeholder="Ex: Compte Courant"
                      />
                    </div>

                    <div className="w-full sm:w-36">
                      <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                        Type
                      </label>
                      <select
                        value={acc.type}
                        onChange={(e) => {
                          const next = [...accounts];
                          next[index].type = e.target.value as AccountType;
                          setAccounts(next);
                        }}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                      >
                        <option value="checking">Courant</option>
                        <option value="savings">Épargne / Livret</option>
                        <option value="cash">Espèces</option>
                      </select>
                    </div>

                    <div className="w-full sm:w-40">
                      <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                        Solde actuel (€)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={acc.balance}
                        onChange={(e) => {
                          const next = [...accounts];
                          next[index].balance = parseFloat(e.target.value) || 0;
                          setAccounts(next);
                        }}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-right focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                        placeholder="0.00"
                      />
                    </div>

                    {accounts.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveAccount(index)}
                        className="self-end sm:self-center p-2 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-rose-50 transition-colors"
                        title="Supprimer ce compte"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={handleAddAccount}
                className="inline-flex items-center gap-2 text-xs font-semibold text-indigo-600 hover:text-indigo-700 py-2 px-3 rounded-xl hover:bg-indigo-50 transition-colors"
              >
                <Plus className="w-4 h-4" /> Ajouter un autre compte bancaire
              </button>

              <div className="pt-2 border-t border-slate-100 flex justify-between items-center text-sm font-medium text-slate-600">
                <span>Total patrimoine de départ :</span>
                <span className="font-bold text-slate-900 text-lg font-mono">
                  {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(totalInitialWealth)}
                </span>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <p className="text-xs text-slate-500">
                Ajoutez les principales sources de revenus réguliers de votre foyer. Une première opération de crédit sera créée pour le mois en cours.
              </p>

              <div className="space-y-3">
                {incomes.map((inc, index) => (
                  <div
                    key={index}
                    className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center gap-3"
                  >
                    <div className="flex-1">
                      <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                        Intitulé du revenu
                      </label>
                      <input
                        type="text"
                        value={inc.title}
                        onChange={(e) => {
                          const next = [...incomes];
                          next[index].title = e.target.value;
                          setIncomes(next);
                        }}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                      />
                    </div>

                    <div className="w-full sm:w-44">
                      <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                        Catégorie
                      </label>
                      <select
                        value={inc.categoryId}
                        onChange={(e) => {
                          const next = [...incomes];
                          next[index].categoryId = e.target.value;
                          setIncomes(next);
                        }}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                      >
                        {categories
                          .filter((c) => c.type === 'income')
                          .map((cat) => (
                            <option key={cat.id} value={cat.id}>
                              {cat.name}
                            </option>
                          ))}
                      </select>
                    </div>

                    <div className="w-full sm:w-36">
                      <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                        Montant net (€)
                      </label>
                      <input
                        type="number"
                        step="10"
                        value={inc.amount}
                        onChange={(e) => {
                          const next = [...incomes];
                          next[index].amount = parseFloat(e.target.value) || 0;
                          setIncomes(next);
                        }}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-right text-emerald-600 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                        placeholder="0"
                      />
                    </div>

                    {incomes.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveIncome(index)}
                        className="self-end sm:self-center p-2 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-rose-50 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={handleAddIncome}
                className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-600 hover:text-emerald-700 py-2 px-3 rounded-xl hover:bg-emerald-50 transition-colors"
              >
                <Plus className="w-4 h-4" /> Ajouter une source de revenu
              </button>

              <div className="pt-2 border-t border-slate-100 flex justify-between items-center text-sm font-medium text-slate-600">
                <span>Revenus mensuels totaux :</span>
                <span className="font-bold text-emerald-600 text-lg font-mono">
                  +{new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(totalMonthlyIncome)}
                </span>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <p className="text-xs text-slate-500">
                Estimez vos dépenses incompressibles et courantes du mois. Vous pourrez bien sûr enregistrer vos dépenses au jour le jour ensuite.
              </p>

              <div className="space-y-3">
                {expenses.map((exp, index) => (
                  <div
                    key={index}
                    className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center gap-3"
                  >
                    <div className="flex-1">
                      <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                        Poste de dépense
                      </label>
                      <input
                        type="text"
                        value={exp.title}
                        onChange={(e) => {
                          const next = [...expenses];
                          next[index].title = e.target.value;
                          setExpenses(next);
                        }}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                      />
                    </div>

                    <div className="w-full sm:w-44">
                      <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                        Catégorie
                      </label>
                      <select
                        value={exp.categoryId}
                        onChange={(e) => {
                          const next = [...expenses];
                          next[index].categoryId = e.target.value;
                          setExpenses(next);
                        }}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                      >
                        {categories
                          .filter((c) => c.type === 'expense')
                          .map((cat) => (
                            <option key={cat.id} value={cat.id}>
                              {cat.name}
                            </option>
                          ))}
                      </select>
                    </div>

                    <div className="w-full sm:w-36">
                      <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                        Estimation (€)
                      </label>
                      <input
                        type="number"
                        step="10"
                        value={exp.amount}
                        onChange={(e) => {
                          const next = [...expenses];
                          next[index].amount = parseFloat(e.target.value) || 0;
                          setExpenses(next);
                        }}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-right text-rose-600 focus:ring-2 focus:ring-rose-500 focus:outline-none"
                        placeholder="0"
                      />
                    </div>

                    {expenses.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveExpense(index)}
                        className="self-end sm:self-center p-2 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-rose-50 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={handleAddExpense}
                className="inline-flex items-center gap-2 text-xs font-semibold text-indigo-600 hover:text-indigo-700 py-2 px-3 rounded-xl hover:bg-indigo-50 transition-colors"
              >
                <Plus className="w-4 h-4" /> Ajouter un autre poste de dépense
              </button>

              <div className="pt-2 border-t border-slate-100 flex justify-between items-center text-sm font-medium text-slate-600">
                <span>Dépenses prévisionnelles :</span>
                <span className="font-bold text-rose-600 text-lg font-mono">
                  -{new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(totalMonthlyExpense)}
                </span>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-6">
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase text-slate-500 tracking-wider">
                    Objectif d'épargne mensuel
                  </span>
                  <span className="font-bold font-mono text-emerald-600 text-base">
                    {savingsGoal} € / mois
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="2000"
                  step="50"
                  value={savingsGoal}
                  onChange={(e) => setSavingsGoal(Number(e.target.value))}
                  className="w-full accent-emerald-600 cursor-pointer"
                />
                <p className="text-xs text-slate-500">
                  Définissez la somme que vous aimeriez mettre de côté chaque mois pour vos projets ou la réserve d'urgence.
                </p>
              </div>

              {/* Financial Recap Card */}
              <div className="bg-gradient-to-br from-slate-900 to-indigo-950 text-white rounded-2xl p-6 shadow-sm">
                <h4 className="text-xs uppercase font-semibold text-indigo-300 tracking-wider mb-4">
                  Bilan prévisionnel mensuel
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-white/10 rounded-xl p-3">
                    <span className="text-xs text-slate-300 block">Revenus</span>
                    <span className="text-lg font-bold font-mono text-emerald-300">
                      +{totalMonthlyIncome.toFixed(0)} €
                    </span>
                  </div>
                  <div className="bg-white/10 rounded-xl p-3">
                    <span className="text-xs text-slate-300 block">Dépenses</span>
                    <span className="text-lg font-bold font-mono text-rose-300">
                      -{totalMonthlyExpense.toFixed(0)} €
                    </span>
                  </div>
                  <div className="bg-white/10 rounded-xl p-3">
                    <span className="text-xs text-slate-300 block">Reste à vivre</span>
                    <span
                      className={`text-lg font-bold font-mono ${
                        estimatedResteAVivre >= 0 ? 'text-indigo-200' : 'text-amber-400'
                      }`}
                    >
                      {estimatedResteAVivre >= 0 ? '+' : ''}
                      {estimatedResteAVivre.toFixed(0)} €
                    </span>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs text-slate-300">
                  <span>Patrimoine initial (soldes bancaires) :</span>
                  <span className="font-mono font-bold text-white text-sm">
                    {totalInitialWealth.toFixed(0)} €
                  </span>
                </div>
              </div>

              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-center gap-3 text-xs text-emerald-800">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>
                  Tout est prêt ! En validant, votre application sera configurée avec vos comptes bancaires et vos flux prévisionnels.
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Wizard Footer with Navigation & Action Buttons */}
        <div className="px-8 py-4 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            {step > 1 ? (
              <button
                type="button"
                onClick={() => setStep(step - 1)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-200 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" /> Précédent
              </button>
            ) : (
              <button
                type="button"
                onClick={onSkipEmpty}
                className="text-xs text-slate-400 hover:text-slate-700 underline underline-offset-2 transition-colors"
              >
                Commencer à zéro sans assistant
              </button>
            )}
          </div>

          <div className="flex items-center gap-3">
            {step === 1 && (
              <button
                type="button"
                onClick={onLoadDemo}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-indigo-700 hover:bg-indigo-100 bg-indigo-50 transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5" /> Charger un exemple type
              </button>
            )}

            {step < 4 ? (
              <button
                type="button"
                onClick={() => setStep(step + 1)}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm hover:shadow transition-all"
              >
                Suivant <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleFinish}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm hover:shadow transition-all"
              >
                <CheckCircle2 className="w-4 h-4" /> Finaliser et créer mon budget
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
