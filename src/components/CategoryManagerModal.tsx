import React, { useState } from 'react';
import { X, Sliders } from 'lucide-react';
import { Category } from '../types/budget';
import { generateId } from '../utils/formatters';
import { CategoryIcon } from './CategoryIcon';

interface CategoryManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  onUpdateCategoryBudget: (categoryId: string, newBudget: number) => void;
  onAddCategory: (category: Category) => void;
}

const CATEGORY_COLORS = [
  '#3b82f6', // blue
  '#f97316', // orange
  '#10b981', // emerald
  '#f59e0b', // amber
  '#eab308', // yellow
  '#ec4899', // pink
  '#8b5cf6', // purple
  '#a855f7', // violet
  '#4f46e5', // indigo
  '#06b6d4', // cyan
  '#64748b', // slate
];

export const CategoryManagerModal: React.FC<CategoryManagerModalProps> = ({
  isOpen,
  onClose,
  categories,
  onUpdateCategoryBudget,
  onAddCategory,
}) => {
  const [activeTab, setActiveTab] = useState<'budgets' | 'new'>('budgets');
  const [budgets, setBudgets] = useState<Record<string, number>>({});
  const [hasChanged, setHasChanged] = useState(false);

  // New category state
  const [newName, setNewName] = useState('');
  const [newType, setNewType] = useState<'expense' | 'income'>('expense');
  const [newColor, setNewColor] = useState(CATEGORY_COLORS[0]);
  const [newMonthlyBudget, setNewMonthlyBudget] = useState('0');

  // Initialize budgets map
  React.useEffect(() => {
    const map: Record<string, number> = {};
    categories.forEach((c) => {
      map[c.id] = c.monthlyBudget || 0;
    });
    setBudgets(map);
    setHasChanged(false);
  }, [categories, isOpen]);

  if (!isOpen) return null;

  const handleBudgetChange = (catId: string, val: string) => {
    const parsed = Math.max(0, parseFloat(val) || 0);
    setBudgets((prev) => ({ ...prev, [catId]: parsed }));
    setHasChanged(true);
  };

  const handleSaveBudgets = () => {
    Object.entries(budgets).forEach(([id, amount]) => {
      onUpdateCategoryBudget(id, amount);
    });
    setHasChanged(false);
    onClose();
  };

  const handleCreateCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    const newCat: Category = {
      id: 'cat_' + generateId(),
      name: newName.trim(),
      type: newType,
      color: newColor,
      icon: 'Tag',
      monthlyBudget: parseFloat(newMonthlyBudget) || 0,
    };

    onAddCategory(newCat);
    setNewName('');
    setNewMonthlyBudget('0');
    setActiveTab('budgets');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 max-w-lg w-full overflow-hidden transition-all animate-fade-in">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Sliders className="w-4 h-4" />
            </div>
            <h3 className="text-base font-bold text-slate-900 font-display">
              Gestion des catégories & Plafonds
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switch */}
        <div className="px-6 pt-4">
          <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => setActiveTab('budgets')}
              className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                activeTab === 'budgets'
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Plafonds de dépenses
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('new')}
              className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                activeTab === 'new'
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              + Nouvelle catégorie
            </button>
          </div>
        </div>

        {activeTab === 'budgets' ? (
          <div className="p-6 space-y-4">
            <p className="text-xs text-slate-500">
              Ajustez l'enveloppe budgétaire mensuelle autorisée pour chaque catégorie afin de recevoir des alertes en cas de dépassement.
            </p>

            <div className="max-h-[320px] overflow-y-auto space-y-2.5 pr-1">
              {categories
                .filter((c) => c.type === 'expense')
                .map((cat) => (
                  <div
                    key={cat.id}
                    className="flex items-center justify-between p-3 rounded-2xl border border-slate-100 bg-slate-50/60"
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className="w-8 h-8 rounded-xl flex items-center justify-center text-white"
                        style={{ backgroundColor: cat.color }}
                      >
                        <CategoryIcon name={cat.icon} className="w-4 h-4 text-white" />
                      </span>
                      <span className="text-sm font-semibold text-slate-800">
                        {cat.name}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="0"
                        step="10"
                        value={budgets[cat.id] ?? ''}
                        onChange={(e) => handleBudgetChange(cat.id, e.target.value)}
                        className="w-24 px-2.5 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-right text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                      />
                      <span className="text-xs font-medium text-slate-400">€/mois</span>
                    </div>
                  </div>
                ))}
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
              >
                Fermer
              </button>
              <button
                type="button"
                onClick={handleSaveBudgets}
                disabled={!hasChanged}
                className={`px-5 py-2.5 rounded-xl text-xs font-semibold text-white transition-all shadow-sm ${
                  hasChanged
                    ? 'bg-indigo-600 hover:bg-indigo-700'
                    : 'bg-slate-300 cursor-not-allowed'
                }`}
              >
                Enregistrer les plafonds
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleCreateCategory} className="p-6 space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                Nom de la catégorie *
              </label>
              <input
                type="text"
                required
                placeholder="Ex: Vacances d'été, Animaux, Jardinage..."
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                  Type
                </label>
                <select
                  value={newType}
                  onChange={(e) => setNewType(e.target.value as 'expense' | 'income')}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                >
                  <option value="expense">Dépense</option>
                  <option value="income">Revenu</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                  Plafond mensuel (€)
                </label>
                <input
                  type="number"
                  min="0"
                  step="10"
                  value={newMonthlyBudget}
                  onChange={(e) => setNewMonthlyBudget(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-2">
                Couleur
              </label>
              <div className="flex items-center gap-2 flex-wrap">
                {CATEGORY_COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setNewColor(c)}
                    className={`w-7 h-7 rounded-full transition-transform ${
                      newColor === c ? 'scale-125 ring-2 ring-offset-2 ring-slate-400' : 'hover:scale-110'
                    }`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setActiveTab('budgets')}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm transition-all"
              >
                Créer la catégorie
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
