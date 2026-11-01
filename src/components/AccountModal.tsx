import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Account, AccountType } from '../types/budget';
import { generateId } from '../utils/formatters';

interface AccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (account: Account) => void;
  editingAccount?: Account | null;
}

const COLORS = [
  '#4f46e5', // indigo
  '#10b981', // emerald
  '#06b6d4', // cyan
  '#f59e0b', // amber
  '#ec4899', // pink
  '#8b5cf6', // purple
  '#64748b', // slate
  '#0ea5e9', // sky
];

export const AccountModal: React.FC<AccountModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingAccount,
}) => {
  const [name, setName] = useState('');
  const [type, setType] = useState<AccountType>('checking');
  const [initialBalance, setInitialBalance] = useState<string>('0');
  const [color, setColor] = useState(COLORS[0]);
  const [institution, setInstitution] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (editingAccount) {
      setName(editingAccount.name);
      setType(editingAccount.type);
      setInitialBalance(editingAccount.initialBalance.toString());
      setColor(editingAccount.color || COLORS[0]);
      setInstitution(editingAccount.institution || '');
    } else {
      setName('');
      setType('checking');
      setInitialBalance('0');
      setColor(COLORS[Math.floor(Math.random() * COLORS.length)]);
      setInstitution('');
    }
    setError(null);
  }, [editingAccount, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Veuillez renseigner un nom pour le compte.');
      return;
    }

    const parsedBalance = parseFloat(initialBalance);
    if (isNaN(parsedBalance)) {
      setError('Le solde initial doit être un nombre valide.');
      return;
    }

    const icon = type === 'savings' ? 'PiggyBank' : type === 'cash' ? 'Coins' : 'Wallet';

    const accountToSave: Account = {
      id: editingAccount ? editingAccount.id : generateId(),
      name: name.trim(),
      type,
      initialBalance: parsedBalance,
      currentBalance: parsedBalance,
      color,
      icon,
      institution: institution.trim() || undefined,
      createdAt: editingAccount ? editingAccount.createdAt : new Date().toISOString(),
    };

    onSave(accountToSave);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 max-w-md w-full overflow-hidden transition-all animate-fade-in">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-900 font-display">
            {editingAccount ? 'Modifier le compte' : 'Ajouter un compte bancaire'}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-700">
              {error}
            </div>
          )}

          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">
              Nom du compte *
            </label>
            <input
              type="text"
              required
              placeholder="Ex: Compte Courant, Livret A..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                Type de compte
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as AccountType)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              >
                <option value="checking">Courant</option>
                <option value="savings">Épargne / Livret</option>
                <option value="cash">Espèces</option>
                <option value="credit">Crédit / Différé</option>
                <option value="investment">Placement</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                Solde initial (€)
              </label>
              <input
                type="number"
                step="0.01"
                required
                value={initialBalance}
                onChange={(e) => setInitialBalance(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">
              Établissement / Banque (facultatif)
            </label>
            <input
              type="text"
              placeholder="Ex: BNP Paribas, Boursorama, La Banque Postale..."
              value={institution}
              onChange={(e) => setInstitution(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-2">
              Couleur distinctive
            </label>
            <div className="flex items-center gap-2 flex-wrap">
              {COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`w-7 h-7 rounded-full transition-transform ${
                    color === c ? 'scale-125 ring-2 ring-offset-2 ring-slate-400' : 'hover:scale-110'
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm transition-all"
            >
              {editingAccount ? 'Enregistrer' : 'Créer le compte'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
