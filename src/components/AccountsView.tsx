import React, { useState } from 'react';
import {
  Wallet,
  PiggyBank,
  Plus,
  ArrowRightLeft,
  Coins,
  CreditCard,
  Edit2,
  Trash2,
} from 'lucide-react';
import { Account, Transaction } from '../types/budget';
import { formatCurrency } from '../utils/formatters';

interface AccountsViewProps {
  accounts: Account[];
  transactions: Transaction[];
  onOpenAddAccount: () => void;
  onOpenEditAccount: (account: Account) => void;
  onDeleteAccount: (accountId: string) => void;
  onOpenTransferModal: () => void;
}

export const AccountsView: React.FC<AccountsViewProps> = ({
  accounts,
  transactions,
  onOpenAddAccount,
  onOpenEditAccount,
  onDeleteAccount,
  onOpenTransferModal,
}) => {
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const getAccountStats = (accountId: string) => {
    const accountTxs = transactions.filter((t) => t.accountId === accountId || t.toAccountId === accountId);
    return {
      count: accountTxs.length,
    };
  };

  const getAccountTypeLabel = (type: Account['type']) => {
    switch (type) {
      case 'checking':
        return 'Compte Courant';
      case 'savings':
        return 'Épargne & Livret';
      case 'cash':
        return 'Porte-monnaie Espèces';
      case 'credit':
        return 'Carte de Crédit';
      case 'investment':
        return 'Investissement & Titres';
      default:
        return 'Compte bancaire';
    }
  };

  const getAccountTypeIcon = (type: Account['type']) => {
    switch (type) {
      case 'savings':
        return PiggyBank;
      case 'cash':
        return Coins;
      case 'credit':
        return CreditCard;
      default:
        return Wallet;
    }
  };

  const totalWealth = accounts.reduce((acc, a) => acc + a.currentBalance, 0);

  return (
    <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-6">
      {/* Header with Title and action buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-bold text-slate-900 tracking-tight font-display flex items-center gap-2">
              Synthèse des comptes bancaires
            </h3>
            <span className="text-xs font-bold font-mono px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700">
              Total : {formatCurrency(totalWealth)}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Vue consolidée de l'ensemble de vos avoirs et transferts entre comptes
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {accounts.length >= 2 && (
            <button
              type="button"
              onClick={onOpenTransferModal}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 transition-colors"
            >
              <ArrowRightLeft className="w-3.5 h-3.5" />
              <span>Virement interne</span>
            </button>
          )}

          <button
            type="button"
            onClick={onOpenAddAccount}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Nouveau compte</span>
          </button>
        </div>
      </div>

      {/* Account Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {accounts.map((acc) => {
          const stats = getAccountStats(acc.id);
          const IconComponent = getAccountTypeIcon(acc.type);
          const isNegative = acc.currentBalance < 0;

          return (
            <div
              key={acc.id}
              className="p-5 rounded-2xl border border-slate-200/80 hover:border-slate-300 bg-gradient-to-b from-white to-slate-50/50 shadow-xs hover:shadow-sm transition-all flex flex-col justify-between group relative overflow-hidden"
            >
              {/* Top Accent Strip */}
              <div
                className="absolute top-0 left-0 right-0 h-1.5"
                style={{ backgroundColor: acc.color }}
              />

              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-xs"
                      style={{ backgroundColor: acc.color }}
                    >
                      <IconComponent className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                        {acc.name}
                      </h4>
                      <span className="text-[11px] text-slate-400 font-medium">
                        {getAccountTypeLabel(acc.type)}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                    <button
                      type="button"
                      onClick={() => onOpenEditAccount(acc)}
                      className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                      title="Modifier le compte"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    {accounts.length > 1 && (
                      <button
                        type="button"
                        onClick={() => setDeleteConfirmId(acc.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        title="Supprimer le compte"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                <div className="my-4">
                  <span className="text-xs uppercase font-semibold text-slate-400 block tracking-wider mb-0.5">
                    Solde en direct
                  </span>
                  <div
                    className={`text-2xl font-bold font-display tracking-tight ${
                      isNegative ? 'text-rose-600' : 'text-slate-900'
                    }`}
                  >
                    {formatCurrency(acc.currentBalance)}
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                <span>{stats.count} opération(s) associées</span>
                <span className="font-medium text-slate-500">
                  Initial : {formatCurrency(acc.initialBalance)}
                </span>
              </div>

              {/* Confirm deletion overlay */}
              {deleteConfirmId === acc.id && (
                <div className="absolute inset-0 bg-white/95 backdrop-blur-xs p-4 flex flex-col items-center justify-center text-center z-10 animate-fade-in">
                  <p className="text-xs font-semibold text-slate-800 mb-1">
                    Supprimer le compte « {acc.name} » ?
                  </p>
                  <p className="text-[11px] text-rose-600 mb-3">
                    Cette action supprimera également les opérations liées.
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setDeleteConfirmId(null)}
                      className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200"
                    >
                      Annuler
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        onDeleteAccount(acc.id);
                        setDeleteConfirmId(null);
                      }}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700"
                    >
                      Confirmer
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
