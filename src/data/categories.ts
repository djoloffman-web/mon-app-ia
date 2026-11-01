import { Category } from '../types/budget';

export const DEFAULT_CATEGORIES: Category[] = [
  // Revenus
  {
    id: 'cat_salaire',
    name: 'Salaires & Activité',
    type: 'income',
    color: '#10b981', // emerald-500
    icon: 'Wallet',
    monthlyBudget: 0,
    isDefault: true,
  },
  {
    id: 'cat_allocations',
    name: 'Allocations & Aides',
    type: 'income',
    color: '#06b6d4', // cyan-500
    icon: 'Users',
    monthlyBudget: 0,
    isDefault: true,
  },
  {
    id: 'cat_revenus_divers',
    name: 'Autres revenus & Extras',
    type: 'income',
    color: '#6366f1', // indigo-500
    icon: 'PlusCircle',
    monthlyBudget: 0,
    isDefault: true,
  },

  // Dépenses
  {
    id: 'cat_logement',
    name: 'Logement & Charges',
    type: 'expense',
    color: '#3b82f6', // blue-500
    icon: 'Home',
    monthlyBudget: 900,
    isDefault: true,
  },
  {
    id: 'cat_alimentation',
    name: 'Alimentation & Courses',
    type: 'expense',
    color: '#f97316', // orange-500
    icon: 'ShoppingCart',
    monthlyBudget: 600,
    isDefault: true,
  },
  {
    id: 'cat_transports',
    name: 'Transports & Carburant',
    type: 'expense',
    color: '#f59e0b', // amber-500
    icon: 'Car',
    monthlyBudget: 250,
    isDefault: true,
  },
  {
    id: 'cat_factures',
    name: 'Énergie, Eau & Abonnements',
    type: 'expense',
    color: '#eab308', // yellow-500
    icon: 'Zap',
    monthlyBudget: 200,
    isDefault: true,
  },
  {
    id: 'cat_sante',
    name: 'Santé & Bien-être',
    type: 'expense',
    color: '#ec4899', // pink-500
    icon: 'HeartPulse',
    monthlyBudget: 120,
    isDefault: true,
  },
  {
    id: 'cat_enfants',
    name: 'Enfants & Scolarité',
    type: 'expense',
    color: '#8b5cf6', // purple-500
    icon: 'GraduationCap',
    monthlyBudget: 200,
    isDefault: true,
  },
  {
    id: 'cat_loisirs',
    name: 'Loisirs & Sorties',
    type: 'expense',
    color: '#a855f7', // violet-500
    icon: 'Compass',
    monthlyBudget: 200,
    isDefault: true,
  },
  {
    id: 'cat_assurances',
    name: 'Assurances & Fiscalité',
    type: 'expense',
    color: '#64748b', // slate-500
    icon: 'ShieldCheck',
    monthlyBudget: 150,
    isDefault: true,
  },
  {
    id: 'cat_shopping',
    name: 'Shopping & Équipement',
    type: 'expense',
    color: '#4f46e5', // indigo-600
    icon: 'ShoppingBag',
    monthlyBudget: 150,
    isDefault: true,
  },
  {
    id: 'cat_divers',
    name: 'Imprévus & Divers',
    type: 'expense',
    color: '#94a3b8', // slate-400
    icon: 'AlertCircle',
    monthlyBudget: 100,
    isDefault: true,
  },
];
