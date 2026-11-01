import React, { useState } from 'react';
import { Agent } from '../types/tds';
import { X, UserPlus, Check } from 'lucide-react';

interface AgentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddAgent: (newAgent: Agent) => void;
}

export const AgentModal: React.FC<AgentModalProps> = ({ isOpen, onClose, onAddAgent }) => {
  if (!isOpen) return null;

  const [matricule, setMatricule] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [pole, setPole] = useState<Agent['pole']>('Moyens Généraux');
  const [role, setRole] = useState('');
  const [email, setEmail] = useState('');
  const [weeklyWorkHours, setWeeklyWorkHours] = useState(35);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!lastName || !firstName) return;

    const newAgent: Agent = {
      id: `agt-${Date.now()}`,
      matricule: matricule.trim() || `MGA-${Math.floor(1000 + Math.random() * 9000)}`,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      pole,
      role: role.trim() || 'Agent MR-MGA',
      email: email.trim() || `${firstName.toLowerCase()}.${lastName.toLowerCase()}@mr-mga.fr`,
      weeklyWorkHours: Number(weeklyWorkHours) || 35,
    };

    onAddAgent(newAgent);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-teal-100 dark:bg-teal-950 flex items-center justify-center text-teal-700 dark:text-teal-300">
              <UserPlus className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-slate-100 text-sm">
                Ajouter un agent MR-MGA
              </h3>
              <p className="text-xs text-slate-500">
                Enregistrement dans l'effectif du Tableau de Service
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-3.5 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">
                Nom *
              </label>
              <input
                type="text"
                required
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="ex: Dupont"
                className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
              />
            </div>
            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">
                Prénom *
              </label>
              <input
                type="text"
                required
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="ex: Julien"
                className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">
                Matricule
              </label>
              <input
                type="text"
                value={matricule}
                onChange={(e) => setMatricule(e.target.value)}
                placeholder="ex: MGA-5012"
                className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 font-mono"
              />
            </div>
            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">
                Heures / semaine
              </label>
              <input
                type="number"
                value={weeklyWorkHours}
                onChange={(e) => setWeeklyWorkHours(Number(e.target.value))}
                min={1}
                max={50}
                className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">
              Pôle MR-MGA
            </label>
            <select
              value={pole}
              onChange={(e) => setPole(e.target.value as Agent['pole'])}
              className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
            >
              <option value="Moyens Généraux">Moyens Généraux</option>
              <option value="Achats & Marchés">Achats & Marchés</option>
              <option value="Logistique & Stocks">Logistique & Stocks</option>
              <option value="Maintenance & Sécurité">Maintenance & Sécurité</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">
              Fonction / Rôle
            </label>
            <input
              type="text"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              placeholder="ex: Gestionnaire de parc, Acheteur..."
              className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
            />
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-medium transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-medium flex items-center gap-1.5 shadow-xs transition-colors"
            >
              <Check className="w-4 h-4" />
              Ajouter
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
