import React, { useState } from 'react';
import { StatusCode, DayEntry, DayOfWeek, Agent } from '../types/tds';
import { STATUS_DEFINITIONS, MR_MGA_PRIORITY_ORDER } from '../utils/tdsCalculations';
import { X, Clock, MessageSquare, Check, Sparkles } from 'lucide-react';

interface CellEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedEntry: DayEntry, applyToAllWeekdays?: boolean) => void;
  agent: Agent;
  dayKey: DayOfWeek;
  dayLabel: string;
  dayDateFormatted: string;
  currentEntry: DayEntry;
  weekNumber: number;
}

export const CellEditModal: React.FC<CellEditModalProps> = ({
  isOpen,
  onClose,
  onSave,
  agent,
  dayKey,
  dayLabel,
  dayDateFormatted,
  currentEntry,
  weekNumber,
}) => {
  if (!isOpen) return null;

  const [statusCode, setStatusCode] = useState<StatusCode>(currentEntry.statusCode || 'TRV');
  const [hours, setHours] = useState<string>(currentEntry.hours || '');
  const [comment, setComment] = useState<string>(currentEntry.comment || '');
  const [applyToAllWeekdays, setApplyToAllWeekdays] = useState<boolean>(false);

  const isWeekend = dayKey === 'sat' || dayKey === 'sun';

  const handleSave = () => {
    onSave(
      {
        statusCode,
        hours: hours.trim() || undefined,
        comment: comment.trim() || undefined,
      },
      applyToAllWeekdays
    );
    onClose();
  };

  const setHoursPreset = (preset: string) => {
    setHours(preset);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-slate-900 dark:text-slate-100 text-sm">
                Édition Planning TDS : {dayLabel} ({dayDateFormatted})
              </h3>
              {isWeekend && (
                <span className="text-[10px] bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 px-1.5 py-0.5 rounded font-medium">
                  Week-end (Hors Synthèse MR-MGA)
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {agent.lastName.toUpperCase()} {agent.firstName} · {agent.matricule} · Semaine S{weekNumber < 10 ? `0${weekNumber}` : weekNumber}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto text-xs">
          {/* Status Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
              Statut du poste (Ordre de priorité MR-MGA affiché)
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {MR_MGA_PRIORITY_ORDER.map((code) => {
                const def = STATUS_DEFINITIONS[code];
                const isSelected = statusCode === code;
                return (
                  <button
                    key={code}
                    type="button"
                    onClick={() => {
                      setStatusCode(code);
                      if (code === 'OFF' && !hours) {
                        setHours('');
                      } else if (code === 'TRV' && !hours) {
                        setHours('08:30 - 17:00');
                      } else if (code === 'TLT' && !hours) {
                        setHours('08:30 - 17:00');
                      }
                    }}
                    className={`flex flex-col items-start p-2.5 rounded-lg border text-left transition-all ${
                      isSelected
                        ? `${def.colorClasses.bg} ${def.colorClasses.border} ring-2 ring-teal-500/50 shadow-xs`
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/50 dark:bg-slate-800/30'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full mb-1">
                      <span className={`px-1.5 py-0.5 rounded font-mono font-bold text-[10px] ${def.colorClasses.badge}`}>
                        {def.code}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        Prio #{def.priorityRank}
                      </span>
                    </div>
                    <span className="font-semibold text-slate-800 dark:text-slate-200 leading-tight">
                      {def.title}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Selected Status description preview */}
          <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg border border-slate-200/80 dark:border-slate-700/60">
            <span className="font-medium text-slate-700 dark:text-slate-300">
              {STATUS_DEFINITIONS[statusCode]?.title} :
            </span>{' '}
            <span className="text-slate-500 dark:text-slate-400">
              {STATUS_DEFINITIONS[statusCode]?.description}
            </span>
          </div>

          {/* Horaires */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-500" />
                Horaires / Amplitude horaire
              </label>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setHoursPreset('08:30 - 17:00')}
                  className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-[10px] text-slate-600 dark:text-slate-300"
                >
                  Standard (08:30-17:00)
                </button>
                <button
                  type="button"
                  onClick={() => setHoursPreset('Astreinte 24h')}
                  className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-[10px] text-slate-600 dark:text-slate-300"
                >
                  Astreinte
                </button>
                <button
                  type="button"
                  onClick={() => setHoursPreset('')}
                  className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-[10px] text-slate-600 dark:text-slate-300"
                >
                  Vide
                </button>
              </div>
            </div>
            <input
              type="text"
              value={hours}
              onChange={(e) => setHours(e.target.value)}
              placeholder="ex: 08:30 - 17:00 ou Astreinte de sécurité"
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-teal-500 font-mono text-xs"
            />
          </div>

          {/* Commentaire Multi-lignes */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5 text-slate-500" />
              Commentaires & Observations (Retours à la ligne conservés à l'impression)
            </label>
            <textarea
              rows={3}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Saisissez des précisions techniques, motif de mission, site d'intervention... (les sauts de ligne sont respectés)"
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-teal-500 text-xs font-mono"
            />
            <p className="text-[10px] text-slate-400 mt-1">
              Affiché dans les infobulles annuelles et dans les cases du TDS hebdomadaire en police mono compacte.
            </p>
          </div>

          {/* Quick apply across working days */}
          {!isWeekend && (
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
              <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-700 dark:text-slate-300">
                <input
                  type="checkbox"
                  checked={applyToAllWeekdays}
                  onChange={(e) => setApplyToAllWeekdays(e.target.checked)}
                  className="rounded border-slate-300 dark:border-slate-700 text-teal-600 focus:ring-teal-500"
                />
                <span className="font-medium">
                  Appliquer ce statut à toute la semaine ouvrée (Lundi à Vendredi)
                </span>
              </label>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3.5 bg-slate-50 dark:bg-slate-800/60 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-700/60 font-medium transition-colors"
          >
            Annuler
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-4 py-2 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-medium flex items-center gap-1.5 shadow-sm transition-colors"
          >
            <Check className="w-4 h-4" />
            Enregistrer
          </button>
        </div>
      </div>
    </div>
  );
};
