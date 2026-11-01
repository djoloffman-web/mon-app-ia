import React, { useRef, useState } from 'react';
import {
  X,
  Download,
  Upload,
  FileSpreadsheet,
  RotateCcw,
  AlertTriangle,
  CheckCircle2,
  Database,
  Sparkles,
} from 'lucide-react';
import { Account, Category, Transaction } from '../types/budget';
import { exportDataAsJSON, exportTransactionsAsCSV } from '../utils/storage';

interface ExportImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  accounts: Account[];
  transactions: Transaction[];
  categories: Category[];
  savingsGoal: number;
  onImportData: (data: {
    accounts: Account[];
    transactions: Transaction[];
    categories: Category[];
    savingsGoal: number;
  }) => void;
  onResetData: () => void;
  onRestartOnboarding: () => void;
}

export const ExportImportModal: React.FC<ExportImportModalProps> = ({
  isOpen,
  onClose,
  accounts,
  transactions,
  categories,
  savingsGoal,
  onImportData,
  onResetData,
  onRestartOnboarding,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  if (!isOpen) return null;

  const handleExportJSON = () => {
    exportDataAsJSON(accounts, transactions, categories, savingsGoal);
  };

  const handleExportCSV = () => {
    exportTransactionsAsCSV(transactions, accounts, categories);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const parsed = JSON.parse(content);

        if (parsed?.data?.accounts && parsed?.data?.transactions) {
          onImportData({
            accounts: parsed.data.accounts,
            transactions: parsed.data.transactions,
            categories: parsed.data.categories || categories,
            savingsGoal: parsed.data.savingsGoal || 300,
          });
          setImportStatus('Sauvegarde restaurée avec succès !');
          setTimeout(() => {
            onClose();
          }, 1200);
        } else {
          setImportStatus('Erreur : format de fichier non reconnu.');
        }
      } catch (err) {
        setImportStatus('Erreur lors de la lecture du fichier JSON.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 max-w-md w-full overflow-hidden transition-all animate-fade-in">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Database className="w-4 h-4" />
            </div>
            <h3 className="text-base font-bold text-slate-900 font-display">
              Sauvegarde & Données
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

        <div className="p-6 space-y-4">
          {importStatus && (
            <div
              className={`p-3 rounded-xl text-xs font-semibold flex items-center gap-2 ${
                importStatus.includes('succès')
                  ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                  : 'bg-rose-50 border border-rose-200 text-rose-800'
              }`}
            >
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{importStatus}</span>
            </div>
          )}

          <p className="text-xs text-slate-500">
            Toutes vos données budgétaires restent stockées localement sur votre appareil. Vous pouvez sauvegarder vos comptes ou les exporter à tout moment.
          </p>

          <div className="space-y-2.5">
            {/* Export JSON */}
            <button
              type="button"
              onClick={handleExportJSON}
              className="w-full flex items-center justify-between p-3.5 rounded-2xl border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/40 text-left transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-indigo-100/70 text-indigo-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Download className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">
                    Exporter la sauvegarde complète (.JSON)
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    Comptes, opérations, plafonds et objectifs
                  </p>
                </div>
              </div>
            </button>

            {/* Export CSV */}
            <button
              type="button"
              onClick={handleExportCSV}
              className="w-full flex items-center justify-between p-3.5 rounded-2xl border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/40 text-left transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-100/70 text-emerald-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <FileSpreadsheet className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">
                    Exporter les opérations (.CSV / Excel)
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    Format universel compatible tableur
                  </p>
                </div>
              </div>
            </button>

            {/* Import JSON */}
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleFileChange}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full flex items-center justify-between p-3.5 rounded-2xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-left transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                    <Upload className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">
                      Restaurer une sauvegarde (.JSON)
                    </h4>
                    <p className="text-[11px] text-slate-400">
                      Recharger un fichier préalablement sauvegardé
                    </p>
                  </div>
                </div>
              </button>
            </div>

            {/* Restart Onboarding */}
            <button
              type="button"
              onClick={() => {
                onRestartOnboarding();
                onClose();
              }}
              className="w-full flex items-center justify-between p-3.5 rounded-2xl border border-slate-200 hover:border-indigo-200 hover:bg-indigo-50/30 text-left transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">
                    Relancer l'assistant de configuration
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    Reconfigurer vos comptes et dépenses de départ
                  </p>
                </div>
              </div>
            </button>
          </div>

          {/* Reset App */}
          <div className="pt-4 border-t border-slate-100">
            {!showResetConfirm ? (
              <button
                type="button"
                onClick={() => setShowResetConfirm(true)}
                className="text-xs text-rose-500 hover:text-rose-700 flex items-center gap-1.5 font-medium transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Réinitialiser toutes les données
              </button>
            ) : (
              <div className="p-3 bg-rose-50 rounded-2xl border border-rose-200 space-y-2">
                <div className="flex items-center gap-2 text-xs font-semibold text-rose-800">
                  <AlertTriangle className="w-4 h-4 text-rose-600" />
                  <span>Êtes-vous sûr de vouloir tout effacer ?</span>
                </div>
                <p className="text-[11px] text-rose-600">
                  Cette action est irréversible. Pensez à faire un export au préalable.
                </p>
                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setShowResetConfirm(false)}
                    className="px-3 py-1 rounded-lg text-xs font-medium text-slate-600 bg-white border border-slate-200 hover:bg-slate-50"
                  >
                    Annuler
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      onResetData();
                      setShowResetConfirm(false);
                      onClose();
                    }}
                    className="px-3 py-1 rounded-lg text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700"
                  >
                    Confirmer l'effacement
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
