import React from 'react';
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  PiggyBank,
  ArrowUpRight,
  ArrowDownRight,
  ShieldAlert,
} from 'lucide-react';
import { BudgetSummary } from '../types/budget';
import { formatCurrency, formatPercentage } from '../utils/formatters';

interface DashboardKPIsProps {
  summary: BudgetSummary;
  savingsGoal: number;
}

export const DashboardKPIs: React.FC<DashboardKPIsProps> = ({ summary, savingsGoal }) => {
  const isDeficit = summary.netSavings < 0;
  const isGoalReached = summary.netSavings >= savingsGoal && savingsGoal > 0;
  const goalProgress = savingsGoal > 0 ? Math.min(100, Math.max(0, (summary.netSavings / savingsGoal) * 100)) : 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. Solde Global Disponible */}
      <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Trésorerie globale
          </span>
          <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Wallet className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-3">
          <div className="text-2xl font-bold tracking-tight text-slate-900 font-display">
            {formatCurrency(summary.totalBalance)}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Solde cumulé de l'ensemble de vos comptes
          </p>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 to-indigo-600" />
      </div>

      {/* 2. Total Entrées du mois */}
      <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Revenus du mois
          </span>
          <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <ArrowUpRight className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-3">
          <div className="text-2xl font-bold tracking-tight text-emerald-600 font-display">
            +{formatCurrency(summary.monthlyIncome)}
          </div>
          <div className="flex items-center gap-1.5 mt-1 text-xs text-emerald-700">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Salaires et rentrées enregistrées</span>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-emerald-600" />
      </div>

      {/* 3. Total Sorties du mois */}
      <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Dépenses du mois
          </span>
          <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
            <ArrowDownRight className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-3">
          <div className="text-2xl font-bold tracking-tight text-rose-600 font-display">
            -{formatCurrency(summary.monthlyExpense)}
          </div>
          <div className="flex items-center gap-1.5 mt-1 text-xs text-rose-600">
            <TrendingDown className="w-3.5 h-3.5" />
            <span>Charges fixes et achats courants</span>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-rose-500 to-rose-600" />
      </div>

      {/* 4. Reste à vivre / Épargne */}
      <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Reste à vivre / Épargne
          </span>
          <div
            className={`w-9 h-9 rounded-xl flex items-center justify-center ${
              isDeficit ? 'bg-amber-50 text-amber-600' : 'bg-indigo-50 text-indigo-600'
            }`}
          >
            {isDeficit ? <ShieldAlert className="w-5 h-5" /> : <PiggyBank className="w-5 h-5" />}
          </div>
        </div>
        <div className="mt-3">
          <div
            className={`text-2xl font-bold tracking-tight font-display ${
              isDeficit ? 'text-amber-600' : 'text-slate-900'
            }`}
          >
            {isDeficit ? '' : '+'}
            {formatCurrency(summary.netSavings)}
          </div>
          <div className="mt-2">
            <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
              <span>Objectif {savingsGoal} € (Taux : {formatPercentage(summary.savingsRate)})</span>
              <span className="font-semibold">{goalProgress.toFixed(0)}%</span>
            </div>
            <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  isGoalReached ? 'bg-emerald-500' : isDeficit ? 'bg-amber-400' : 'bg-indigo-500'
                }`}
                style={{ width: `${goalProgress}%` }}
              />
            </div>
          </div>
        </div>
        <div
          className={`absolute bottom-0 left-0 right-0 h-1 ${
            isDeficit ? 'bg-amber-500' : isGoalReached ? 'bg-emerald-500' : 'bg-indigo-500'
          }`}
        />
      </div>
    </div>
  );
};
