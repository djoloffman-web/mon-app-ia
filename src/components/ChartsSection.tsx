import React, { useState } from 'react';
import {
  PieChart as PieIcon,
  BarChart3,
  Sliders,
  AlertTriangle,
  CheckCircle,
} from 'lucide-react';
import { CategoryBreakdown, MonthlyHistoryPoint } from '../types/budget';
import { formatCurrency, formatPercentage } from '../utils/formatters';
import { CategoryIcon } from './CategoryIcon';

interface ChartsSectionProps {
  categoryBreakdown: CategoryBreakdown[];
  historyPoints: MonthlyHistoryPoint[];
  totalExpenses: number;
  totalIncome: number;
  onOpenCategoryManager: () => void;
}

export const ChartsSection: React.FC<ChartsSectionProps> = ({
  categoryBreakdown,
  historyPoints,
  totalExpenses,
  totalIncome,
  onOpenCategoryManager,
}) => {
  const [activeTab, setActiveTab] = useState<'donut' | 'history' | 'budgets'>('donut');
  const [hoveredCategory, setHoveredCategory] = useState<CategoryBreakdown | null>(null);

  // Filter only categories with expenses > 0 for the pie chart
  const activeSlices = categoryBreakdown.filter((item) => item.totalSpent > 0);

  // Calculate SVG donut segments
  const size = 260;
  const strokeWidth = 34;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  let cumulativeAngle = 0;
  const slicesWithAngles = activeSlices.map((item) => {
    const fraction = totalExpenses > 0 ? item.totalSpent / totalExpenses : 0;
    const strokeDasharray = `${fraction * circumference} ${circumference}`;
    const strokeDashoffset = -cumulativeAngle * circumference;
    cumulativeAngle += fraction;
    return {
      ...item,
      strokeDasharray,
      strokeDashoffset,
    };
  });

  // Calculate max value for history bar chart
  const maxHistoryValue = Math.max(
    ...historyPoints.flatMap((p) => [p.income, p.expense]),
    1000
  );

  return (
    <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-6">
      {/* Header with Tab switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <h3 className="text-lg font-bold text-slate-900 tracking-tight font-display flex items-center gap-2">
            Analyses & Visualisations
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Répartition des flux, évolution des 6 derniers mois et contrôle des budgets
          </p>
        </div>

        <div className="flex items-center gap-1 bg-slate-100/80 p-1 rounded-2xl self-start sm:self-center">
          <button
            type="button"
            onClick={() => setActiveTab('donut')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'donut'
                ? 'bg-white text-indigo-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <PieIcon className="w-3.5 h-3.5" />
            <span>Répartition</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('history')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'history'
                ? 'bg-white text-indigo-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Évolution flux</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('budgets')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'budgets'
                ? 'bg-white text-indigo-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Plafonds ({categoryBreakdown.filter((b) => b.budget > 0).length})</span>
          </button>
        </div>
      </div>

      {/* 1. DONUT PIE CHART VIEW */}
      {activeTab === 'donut' && (
        <div>
          {activeSlices.length === 0 ? (
            <div className="py-12 text-center text-slate-400">
              <PieIcon className="w-12 h-12 mx-auto stroke-1 opacity-40 mb-2" />
              <p className="text-sm font-medium">Aucune dépense enregistrée sur cette période.</p>
              <p className="text-xs text-slate-400 mt-1">
                Ajoutez des dépenses pour visualiser automatiquement le camembert de répartition.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
              {/* Donut SVG */}
              <div className="md:col-span-5 flex justify-center">
                <div className="relative w-[260px] h-[260px]">
                  <svg className="w-full h-full -rotate-90" viewBox={`0 0 ${size} ${size}`}>
                    {/* Background ring */}
                    <circle
                      cx={size / 2}
                      cy={size / 2}
                      r={radius}
                      fill="none"
                      stroke="#f1f5f9"
                      strokeWidth={strokeWidth}
                    />

                    {/* Slices */}
                    {slicesWithAngles.map((item) => (
                      <circle
                        key={item.category.id}
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        fill="none"
                        stroke={item.category.color}
                        strokeWidth={hoveredCategory?.category.id === item.category.id ? strokeWidth + 6 : strokeWidth}
                        strokeDasharray={item.strokeDasharray}
                        strokeDashoffset={item.strokeDashoffset}
                        strokeLinecap="round"
                        className="transition-all duration-300 cursor-pointer origin-center"
                        onMouseEnter={() => setHoveredCategory(item)}
                        onMouseLeave={() => setHoveredCategory(null)}
                      />
                    ))}
                  </svg>

                  {/* Centered Info Overlay */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none p-4">
                    {hoveredCategory ? (
                      <>
                        <span className="text-xs font-semibold uppercase text-slate-400 tracking-wider truncate max-w-[150px]">
                          {hoveredCategory.category.name}
                        </span>
                        <span className="text-xl font-bold font-display text-slate-900 mt-0.5">
                          {formatCurrency(hoveredCategory.totalSpent)}
                        </span>
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-full mt-1 bg-indigo-50 text-indigo-700">
                          {formatPercentage(hoveredCategory.percentage)}
                        </span>
                      </>
                    ) : (
                      <>
                        <span className="text-xs font-semibold uppercase text-slate-400 tracking-wider">
                          Total Dépenses
                        </span>
                        <span className="text-2xl font-bold font-display text-slate-900 mt-0.5">
                          {formatCurrency(totalExpenses)}
                        </span>
                        <span className="text-[11px] text-slate-400 mt-1">
                          {activeSlices.length} catégorie(s)
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Category Legend & Breakdown List */}
              <div className="md:col-span-7 space-y-2.5">
                <div className="max-h-[280px] overflow-y-auto pr-1 space-y-2">
                  {categoryBreakdown.map((item) => {
                    if (item.totalSpent === 0 && item.budget === 0) return null;
                    const isHovered = hoveredCategory?.category.id === item.category.id;

                    return (
                      <div
                        key={item.category.id}
                        onMouseEnter={() => setHoveredCategory(item)}
                        onMouseLeave={() => setHoveredCategory(null)}
                        className={`flex items-center justify-between p-2.5 rounded-xl transition-all cursor-pointer ${
                          isHovered
                            ? 'bg-indigo-50/70 border border-indigo-100 shadow-xs'
                            : 'hover:bg-slate-50 border border-transparent'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <span
                            className="w-3.5 h-3.5 rounded-full shrink-0 shadow-xs"
                            style={{ backgroundColor: item.category.color }}
                          />
                          <div className="truncate">
                            <span className="text-sm font-semibold text-slate-800 block truncate">
                              {item.category.name}
                            </span>
                            {item.budget > 0 && (
                              <span className="text-xs text-slate-400">
                                Plafond: {formatCurrency(item.budget)}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <div className="text-sm font-bold text-slate-900 font-mono">
                            {formatCurrency(item.totalSpent)}
                          </div>
                          <div className="text-xs text-slate-500 font-medium">
                            {formatPercentage(item.percentage)}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 2. HISTORICAL COMPARISON BAR CHART */}
      {activeTab === 'history' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
            <span>
              Comparaison des flux sur 6 mois (Revenus ce mois : <strong className="text-emerald-600 font-mono">{formatCurrency(totalIncome)}</strong>)
            </span>
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-md bg-emerald-500" /> Entrées
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-md bg-rose-500" /> Sorties
              </span>
            </div>
          </div>

          <div className="h-64 flex items-end gap-3 pt-6 border-b border-slate-100 pb-2">
            {historyPoints.map((point) => {
              const incomeHeight = maxHistoryValue > 0 ? (point.income / maxHistoryValue) * 100 : 0;
              const expenseHeight = maxHistoryValue > 0 ? (point.expense / maxHistoryValue) * 100 : 0;

              return (
                <div key={point.monthKey} className="flex-1 flex flex-col items-center h-full justify-end group">
                  {/* Tooltip on hover */}
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity mb-2 text-center pointer-events-none">
                    <span className="text-[11px] font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md block">
                      Épargne: {formatCurrency(point.savings)}
                    </span>
                  </div>

                  <div className="w-full flex items-end justify-center gap-1.5 h-44">
                    {/* Income Bar */}
                    <div
                      className="w-1/2 max-w-[24px] bg-emerald-500 hover:bg-emerald-600 rounded-t-lg transition-all"
                      style={{ height: `${Math.max(4, incomeHeight)}%` }}
                      title={`Revenus: ${formatCurrency(point.income)}`}
                    />

                    {/* Expense Bar */}
                    <div
                      className="w-1/2 max-w-[24px] bg-rose-500 hover:bg-rose-600 rounded-t-lg transition-all"
                      style={{ height: `${Math.max(4, expenseHeight)}%` }}
                      title={`Dépenses: ${formatCurrency(point.expense)}`}
                    />
                  </div>

                  {/* Month Label */}
                  <span className="text-xs font-semibold text-slate-600 mt-2 truncate max-w-full">
                    {point.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 3. CATEGORY BUDGET GAUGES */}
      {activeTab === 'budgets' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs text-slate-500">
              Surveillez la consommation de vos enveloppes budgétaires mensuelles pour chaque poste de charge.
            </p>
            <button
              type="button"
              onClick={onOpenCategoryManager}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 py-1 px-2.5 rounded-lg hover:bg-indigo-50 transition-colors"
            >
              Modifier les plafonds
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {categoryBreakdown
              .filter((item) => item.budget > 0)
              .map((item) => {
                const percent = Math.min(100, item.percentageOfBudget);
                const isOver = item.budgetExceeded;
                const isWarning = item.percentageOfBudget >= 80 && !isOver;

                return (
                  <div
                    key={item.category.id}
                    className="p-4 rounded-2xl border border-slate-100 hover:border-slate-200 bg-slate-50/50 space-y-2.5 transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-7 h-7 rounded-lg flex items-center justify-center text-white"
                          style={{ backgroundColor: item.category.color }}
                        >
                          <CategoryIcon name={item.category.icon} className="w-3.5 h-3.5 text-white" />
                        </span>
                        <span className="text-sm font-semibold text-slate-800">
                          {item.category.name}
                        </span>
                      </div>

                      {isOver ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full">
                          <AlertTriangle className="w-3 h-3" /> Dépassé
                        </span>
                      ) : isWarning ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">
                          <AlertTriangle className="w-3 h-3" /> &gt; 80%
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                          <CheckCircle className="w-3 h-3" /> Sous contrôle
                        </span>
                      )}
                    </div>

                    {/* Progress bar */}
                    <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          isOver ? 'bg-rose-500' : isWarning ? 'bg-amber-500' : 'bg-emerald-500'
                        }`}
                        style={{ width: `${percent}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500">
                        Consommé : <strong className="text-slate-800">{formatCurrency(item.totalSpent)}</strong>
                      </span>
                      <span className="text-slate-500">
                        Plafond : <strong className="text-slate-800">{formatCurrency(item.budget)}</strong>
                      </span>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}
    </div>
  );
};
