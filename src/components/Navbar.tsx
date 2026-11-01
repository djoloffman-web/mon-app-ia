import React from 'react';
import {
  Wallet,
  ChevronLeft,
  ChevronRight,
  Plus,
  Sliders,
  Database,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import { formatMonthYear } from '../utils/formatters';

interface NavbarProps {
  selectedMonthKey: string;
  onChangeMonth: (newMonthKey: string) => void;
  onOpenAddModal: () => void;
  onOpenCategoryManager: () => void;
  onOpenBackupModal: () => void;
  onOpenOnboarding: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  selectedMonthKey,
  onChangeMonth,
  onOpenAddModal,
  onOpenCategoryManager,
  onOpenBackupModal,
  onOpenOnboarding,
}) => {
  const handlePrevMonth = () => {
    const [year, month] = selectedMonthKey.split('-').map(Number);
    const date = new Date(year, month - 2, 1);
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    onChangeMonth(`${y}-${m}`);
  };

  const handleNextMonth = () => {
    const [year, month] = selectedMonthKey.split('-').map(Number);
    const date = new Date(year, month, 1);
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    onChangeMonth(`${y}-${m}`);
  };

  const handleCurrentMonth = () => {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    onChangeMonth(`${y}-${m}`);
  };

  return (
    <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-100 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18 gap-4">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-sm shadow-indigo-200">
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold tracking-tight text-slate-900 font-display">
                  Mon budget
                </span>
                <span className="hidden sm:inline text-[10px] font-semibold uppercase tracking-wider text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-100/60">
                  Familial
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <span>Par Demba</span>
                <span className="hidden md:inline">•</span>
                <a
                  href="https://budget.monapp.online/"
                  target="_blank"
                  rel="noreferrer"
                  className="hidden md:flex items-center gap-1 hover:text-indigo-600 transition-colors"
                >
                  budget.monapp.online
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          </div>

          {/* Month Selector */}
          <div className="flex items-center bg-slate-50 border border-slate-200/80 rounded-2xl p-1 shadow-2xs">
            <button
              type="button"
              onClick={handlePrevMonth}
              className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-white rounded-xl transition-all"
              title="Mois précédent"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={handleCurrentMonth}
              className="px-3 py-1 text-xs sm:text-sm font-bold text-slate-800 hover:text-indigo-600 font-display transition-colors"
              title="Revenir au mois en cours"
            >
              {formatMonthYear(selectedMonthKey)}
            </button>

            <button
              type="button"
              onClick={handleNextMonth}
              className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-white rounded-xl transition-all"
              title="Mois suivant"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onOpenOnboarding}
              className="hidden md:inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 transition-colors"
              title="Assistant de configuration initiale"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Assistant</span>
            </button>

            <button
              type="button"
              onClick={onOpenCategoryManager}
              className="hidden lg:inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
              title="Gérer les plafonds de budget"
            >
              <Sliders className="w-4 h-4" />
              <span>Budgets</span>
            </button>

            <button
              type="button"
              onClick={onOpenBackupModal}
              className="inline-flex items-center gap-1.5 p-2 sm:px-3 sm:py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
              title="Sauvegardes et Export"
            >
              <Database className="w-4 h-4" />
              <span className="hidden sm:inline">Données</span>
            </button>

            <button
              type="button"
              onClick={onOpenAddModal}
              className="inline-flex items-center gap-1.5 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm hover:shadow transition-all"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Nouvelle opération</span>
              <span className="sm:hidden">Ajouter</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
