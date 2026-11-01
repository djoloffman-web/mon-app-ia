import React, { useState, useMemo } from 'react';
import {
  Search,
  ArrowRightLeft,
  Plus,
  Trash2,
  Edit2,
  Repeat,
  Layers,
} from 'lucide-react';
import { Account, Category, Transaction, TransactionType } from '../types/budget';
import { formatCurrency, formatDate } from '../utils/formatters';
import { CategoryIcon } from './CategoryIcon';

interface TransactionListProps {
  transactions: Transaction[];
  accounts: Account[];
  categories: Category[];
  selectedMonthKey: string;
  onOpenAddModal: () => void;
  onOpenEditModal: (transaction: Transaction) => void;
  onDeleteTransaction: (id: string) => void;
}

export const TransactionList: React.FC<TransactionListProps> = ({
  transactions,
  accounts,
  categories,
  selectedMonthKey,
  onOpenAddModal,
  onOpenEditModal,
  onDeleteTransaction,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<TransactionType | 'all'>('all');
  const [selectedAccountId, setSelectedAccountId] = useState<string>('all');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date-desc' | 'date-asc' | 'amount-desc' | 'amount-asc'>('date-desc');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const accountMap = useMemo(() => new Map(accounts.map((a) => [a.id, a])), [accounts]);
  const categoryMap = useMemo(() => new Map(categories.map((c) => [c.id, c])), [categories]);

  // Filter transactions for current view
  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      // Month check
      const txMonth = tx.date.slice(0, 7);
      if (txMonth !== selectedMonthKey) return false;

      // Type check
      if (selectedType !== 'all' && tx.type !== selectedType) return false;

      // Account check
      if (selectedAccountId !== 'all' && tx.accountId !== selectedAccountId && tx.toAccountId !== selectedAccountId) {
        return false;
      }

      // Category check
      if (selectedCategoryId !== 'all' && tx.categoryId !== selectedCategoryId) return false;

      // Search query check
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchPayee = tx.payee.toLowerCase().includes(query);
        const matchNotes = (tx.notes || '').toLowerCase().includes(query);
        const matchAmount = tx.amount.toString().includes(query);
        const matchCategory = (categoryMap.get(tx.categoryId)?.name || '').toLowerCase().includes(query);
        return matchPayee || matchNotes || matchAmount || matchCategory;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'date-desc') return b.date.localeCompare(a.date);
      if (sortBy === 'date-asc') return a.date.localeCompare(b.date);
      if (sortBy === 'amount-desc') return b.amount - a.amount;
      if (sortBy === 'amount-asc') return a.amount - b.amount;
      return 0;
    });
  }, [transactions, selectedMonthKey, selectedType, selectedAccountId, selectedCategoryId, searchQuery, sortBy, categoryMap]);

  const getPaymentMethodLabel = (method: Transaction['paymentMethod']) => {
    switch (method) {
      case 'card':
        return 'Carte bancaire';
      case 'direct_debit':
        return 'Prélèvement';
      case 'transfer':
        return 'Virement';
      case 'cash':
        return 'Espèces';
      case 'check':
        return 'Chèque';
      default:
        return 'Autre';
    }
  };

  return (
    <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-6">
      {/* Header with Title and Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-bold text-slate-900 tracking-tight font-display">
              Historique des opérations
            </h3>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600">
              {filteredTransactions.length}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Détail des entrées, sorties et virements pour la période sélectionnée
          </p>
        </div>

        <button
          type="button"
          onClick={onOpenAddModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm hover:shadow transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Nouvelle opération</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="space-y-3">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Search input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher un marchand, une note ou un montant..."
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 placeholder-slate-400 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
              >
                Effacer
              </button>
            )}
          </div>

          {/* Type filters */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl shrink-0 overflow-x-auto">
            <button
              type="button"
              onClick={() => setSelectedType('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                selectedType === 'all' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Tous
            </button>
            <button
              type="button"
              onClick={() => setSelectedType('expense')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                selectedType === 'expense' ? 'bg-white text-rose-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Dépenses
            </button>
            <button
              type="button"
              onClick={() => setSelectedType('income')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                selectedType === 'income' ? 'bg-white text-emerald-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Revenus
            </button>
            <button
              type="button"
              onClick={() => setSelectedType('transfer')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                selectedType === 'transfer' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Virements
            </button>
          </div>
        </div>

        {/* Secondary filters row */}
        <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
          {/* Account Filter */}
          <select
            value={selectedAccountId}
            onChange={(e) => setSelectedAccountId(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">Tous les comptes</option>
            {accounts.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </select>

          {/* Category Filter */}
          <select
            value={selectedCategoryId}
            onChange={(e) => setSelectedCategoryId(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">Toutes les catégories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          {/* Sort By */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="ml-auto px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="date-desc">Date (du + récent)</option>
            <option value="date-asc">Date (du + ancien)</option>
            <option value="amount-desc">Montant (décroissant)</option>
            <option value="amount-asc">Montant (croissant)</option>
          </select>
        </div>
      </div>

      {/* Transaction List / Table */}
      {filteredTransactions.length === 0 ? (
        <div className="py-12 text-center text-slate-400 border border-dashed border-slate-200 rounded-2xl">
          <Layers className="w-10 h-10 mx-auto stroke-1 opacity-40 mb-2" />
          <p className="text-sm font-semibold text-slate-600">Aucune opération trouvée</p>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            {transactions.length === 0
              ? 'Enregistrez votre première rentrée ou dépense pour démarrer le suivi.'
              : 'Aucune transaction ne correspond à vos filtres de recherche pour ce mois.'}
          </p>
          <button
            type="button"
            onClick={onOpenAddModal}
            className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 transition-colors"
          >
            <Plus className="w-4 h-4" /> Ajouter une opération
          </button>
        </div>
      ) : (
        <div className="divide-y divide-slate-100 overflow-hidden">
          {filteredTransactions.map((tx) => {
            const cat = categoryMap.get(tx.categoryId);
            const sourceAcc = accountMap.get(tx.accountId);
            const targetAcc = tx.toAccountId ? accountMap.get(tx.toAccountId) : null;
            const isExpense = tx.type === 'expense';
            const isIncome = tx.type === 'income';
            const isTransfer = tx.type === 'transfer';

            return (
              <div
                key={tx.id}
                className="py-3.5 px-2 hover:bg-slate-50/70 rounded-xl transition-colors flex items-center justify-between gap-3 group relative"
              >
                {/* Left info: Icon, Payee, Category, Date, Account */}
                <div className="flex items-center gap-3.5 min-w-0 flex-1">
                  {/* Category / Type Icon badge */}
                  <div
                    className="w-10 h-10 rounded-xl shrink-0 flex items-center justify-center text-white shadow-xs"
                    style={{ backgroundColor: isTransfer ? '#6366f1' : cat?.color || '#94a3b8' }}
                  >
                    {isTransfer ? (
                      <ArrowRightLeft className="w-4 h-4 text-white" />
                    ) : (
                      <CategoryIcon name={cat?.icon || 'Layers'} className="w-4 h-4 text-white" />
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-semibold text-slate-900 truncate">
                        {tx.payee}
                      </span>
                      {tx.isRecurring && (
                        <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded-md">
                          <Repeat className="w-2.5 h-2.5" /> Récurrent
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-400 flex-wrap">
                      <span className="font-medium text-slate-600">
                        {isTransfer ? 'Virement interne' : cat?.name || 'Général'}
                      </span>
                      <span>•</span>
                      <span className="text-slate-500">{formatDate(tx.date)}</span>
                      <span>•</span>
                      <span className="text-slate-500 font-medium">
                        {isTransfer && targetAcc
                          ? `${sourceAcc?.name} → ${targetAcc.name}`
                          : sourceAcc?.name || 'Compte inconnu'}
                      </span>
                      {tx.paymentMethod && (
                        <>
                          <span className="hidden sm:inline">•</span>
                          <span className="hidden sm:inline text-slate-400">
                            {getPaymentMethodLabel(tx.paymentMethod)}
                          </span>
                        </>
                      )}
                    </div>

                    {tx.notes && (
                      <p className="text-[11px] text-slate-500 italic mt-0.5 line-clamp-1">
                        {tx.notes}
                      </p>
                    )}
                  </div>
                </div>

                {/* Right: Amount & Actions */}
                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-right">
                    <div
                      className={`text-sm sm:text-base font-bold font-mono tracking-tight ${
                        isIncome
                          ? 'text-emerald-600'
                          : isExpense
                          ? 'text-slate-900'
                          : 'text-indigo-600'
                      }`}
                    >
                      {isIncome ? '+' : isExpense ? '-' : ''}
                      {formatCurrency(tx.amount)}
                    </div>
                  </div>

                  {/* Actions (visible on group hover or always on mobile) */}
                  <div className="flex items-center gap-1 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      type="button"
                      onClick={() => onOpenEditModal(tx)}
                      className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                      title="Modifier l'opération"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteConfirmId(tx.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      title="Supprimer l'opération"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Confirm Deletion Popup */}
                {deleteConfirmId === tx.id && (
                  <div className="absolute inset-0 bg-white/95 backdrop-blur-xs px-4 flex items-center justify-between z-10 rounded-xl animate-fade-in">
                    <span className="text-xs font-semibold text-slate-800">
                      Supprimer cette opération de {formatCurrency(tx.amount)} ?
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setDeleteConfirmId(null)}
                        className="px-2.5 py-1 rounded-lg text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200"
                      >
                        Annuler
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          onDeleteTransaction(tx.id);
                          setDeleteConfirmId(null);
                        }}
                        className="px-2.5 py-1 rounded-lg text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700"
                      >
                        Supprimer
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
