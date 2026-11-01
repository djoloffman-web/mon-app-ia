import React, { useState, useMemo } from 'react';
import { Agent, AgentWeekSchedule, DayEntry, DayOfWeek, StatusCode } from '../types/tds';
import { calculateWeeklySynthesis, getWeekDateRange, STATUS_DEFINITIONS, MR_MGA_PRIORITY_ORDER } from '../utils/tdsCalculations';
import { CellEditModal } from './CellEditModal';
import {
  ChevronLeft,
  ChevronRight,
  Printer,
  Calendar,
  Filter,
  Search,
  Plus,
  HelpCircle,
  FileSpreadsheet,
  AlertCircle,
  Edit2,
  Clock,
  Sparkles,
} from 'lucide-react';

interface WeeklyPlanningProps {
  agents: Agent[];
  schedules: Record<string, AgentWeekSchedule>;
  currentYear: number;
  selectedWeek: number;
  onSelectWeek: (week: number) => void;
  onUpdateSchedule: (schedule: AgentWeekSchedule) => void;
  onOpenPrint: () => void;
  onOpenLegend: () => void;
  onOpenAddAgent: () => void;
}

export const WeeklyPlanning: React.FC<WeeklyPlanningProps> = ({
  agents,
  schedules,
  currentYear,
  selectedWeek,
  onSelectWeek,
  onUpdateSchedule,
  onOpenPrint,
  onOpenLegend,
  onOpenAddAgent,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPole, setSelectedPole] = useState<string>('all');

  // Modal editing state
  const [editingModal, setEditingModal] = useState<{
    agent: Agent;
    dayKey: DayOfWeek;
    dayLabel: string;
    dayDateFormatted: string;
    currentEntry: DayEntry;
  } | null>(null);

  const weekRange = useMemo(() => {
    return getWeekDateRange(selectedWeek, currentYear);
  }, [selectedWeek, currentYear]);

  const poles = useMemo(() => {
    return Array.from(new Set(agents.map((a) => a.pole)));
  }, [agents]);

  const filteredAgents = useMemo(() => {
    return agents.filter((agent) => {
      const matchSearch =
        agent.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        agent.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        agent.matricule.toLowerCase().includes(searchTerm.toLowerCase()) ||
        agent.role.toLowerCase().includes(searchTerm.toLowerCase());
      const matchPole = selectedPole === 'all' || agent.pole === selectedPole;
      return matchSearch && matchPole;
    });
  }, [agents, searchTerm, selectedPole]);

  const getAgentSchedule = (agentId: string): AgentWeekSchedule => {
    const key = `${agentId}-${currentYear}-${selectedWeek}`;
    return (
      schedules[key] || {
        agentId,
        weekNumber: selectedWeek,
        year: currentYear,
        days: {
          mon: { statusCode: 'TRV', hours: '08:30 - 17:00' },
          tue: { statusCode: 'TRV', hours: '08:30 - 17:00' },
          wed: { statusCode: 'TRV', hours: '08:30 - 17:00' },
          thu: { statusCode: 'TRV', hours: '08:30 - 17:00' },
          fri: { statusCode: 'TRV', hours: '08:30 - 16:00' },
          sat: { statusCode: 'OFF' },
          sun: { statusCode: 'OFF' },
        },
      }
    );
  };

  const handleDayCellClick = (agent: Agent, dayKey: DayOfWeek, dayLabel: string, dayDateFormatted: string) => {
    const schedule = getAgentSchedule(agent.id);
    const currentEntry = schedule.days[dayKey];
    setEditingModal({
      agent,
      dayKey,
      dayLabel,
      dayDateFormatted,
      currentEntry,
    });
  };

  const handleSaveDayEntry = (updatedEntry: DayEntry, applyToAllWeekdays?: boolean) => {
    if (!editingModal) return;
    const schedule = { ...getAgentSchedule(editingModal.agent.id) };
    const newDays = { ...schedule.days };

    if (applyToAllWeekdays) {
      const weekdays: (keyof AgentWeekSchedule['days'])[] = ['mon', 'tue', 'wed', 'thu', 'fri'];
      weekdays.forEach((k) => {
        newDays[k] = { ...updatedEntry };
      });
    } else {
      newDays[editingModal.dayKey] = updatedEntry;
    }

    schedule.days = newDays;
    onUpdateSchedule(schedule);
  };

  const handleToggleOverride = (agentId: string, currentStatus: StatusCode) => {
    const schedule = { ...getAgentSchedule(agentId) };
    if (schedule.overrideSyntheticStatus) {
      schedule.overrideSyntheticStatus = null;
    } else {
      schedule.overrideSyntheticStatus = currentStatus;
    }
    onUpdateSchedule(schedule);
  };

  const handleUpdateWeekComment = (agentId: string, comment: string) => {
    const schedule = { ...getAgentSchedule(agentId) };
    schedule.weekComment = comment;
    onUpdateSchedule(schedule);
  };

  const exportCSV = () => {
    const rows = [
      ['Matricule', 'Nom', 'Prenom', 'Pole', 'Semaine', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche', 'Synthese MR-MGA', 'Commentaire'],
    ];

    agents.forEach((agent) => {
      const schedule = getAgentSchedule(agent.id);
      const synthesis = calculateWeeklySynthesis(schedule);
      rows.push([
        agent.matricule,
        agent.lastName,
        agent.firstName,
        agent.pole,
        `S${selectedWeek}`,
        schedule.days.mon.statusCode,
        schedule.days.tue.statusCode,
        schedule.days.wed.statusCode,
        schedule.days.thu.statusCode,
        schedule.days.fri.statusCode,
        schedule.days.sat.statusCode,
        schedule.days.sun.statusCode,
        synthesis.statusCode,
        schedule.weekComment || '',
      ]);
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + rows.map((e) => e.join(';')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `TDS_MR-MGA_Semaine_${selectedWeek}_${currentYear}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
      {/* Top Controls Toolbar */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4 bg-slate-50/50 dark:bg-slate-800/30">
        {/* Week navigation & period */}
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-0.5 shadow-2xs">
            <button
              onClick={() => onSelectWeek(Math.max(1, selectedWeek - 1))}
              disabled={selectedWeek <= 1}
              className="p-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
              title="Semaine précédente"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="px-3 py-1 text-xs font-mono font-bold text-slate-900 dark:text-slate-100">
              S{selectedWeek < 10 ? `0${selectedWeek}` : selectedWeek} / 52
            </div>
            <button
              onClick={() => onSelectWeek(Math.min(52, selectedWeek + 1))}
              disabled={selectedWeek >= 52}
              className="p-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
              title="Semaine suivante"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div>
            <div className="text-xs font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <span>Semaine du {weekRange.formatted}</span>
            </div>
            <div className="text-[10px] text-teal-700 dark:text-teal-400 font-mono">
              Synthèse MR-MGA : Lun-Ven uniquement · Prio : AE &gt; EPI &gt; TRV &gt; TLT...
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center flex-wrap gap-2">
          {/* Quick jump to week selector */}
          <select
            value={selectedWeek}
            onChange={(e) => onSelectWeek(Number(e.target.value))}
            className="text-xs py-1.5 px-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 font-mono cursor-pointer"
          >
            {Array.from({ length: 52 }, (_, i) => i + 1).map((w) => (
              <option key={w} value={w}>
                Semaine S{w < 10 ? `0${w}` : w}
              </option>
            ))}
          </select>

          <button
            onClick={exportCSV}
            className="px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
            Export CSV
          </button>

          <button
            onClick={onOpenPrint}
            className="px-3 py-1.5 text-xs font-medium text-white bg-slate-900 dark:bg-slate-100 dark:text-slate-900 rounded-lg hover:bg-slate-800 dark:hover:bg-white/90 transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
          >
            <Printer className="w-3.5 h-3.5" />
            Imprimer TDS
          </button>
        </div>
      </div>

      {/* Filter and search bar */}
      <div className="px-4 py-2.5 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-4 text-xs bg-slate-50/30 dark:bg-slate-900">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Filtrer agent par nom ou matricule..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 pr-3 py-1 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md text-slate-900 dark:text-slate-100 w-56 focus:outline-hidden focus:ring-1 focus:ring-teal-500"
            />
          </div>

          <select
            value={selectedPole}
            onChange={(e) => setSelectedPole(e.target.value)}
            className="py-1 px-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md text-slate-800 dark:text-slate-200"
          >
            <option value="all">Tous les pôles ({agents.length})</option>
            {poles.map((pole) => (
              <option key={pole} value={pole}>
                {pole}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenAddAgent}
            className="px-2.5 py-1 text-xs font-medium text-teal-700 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800 rounded-md hover:bg-teal-100 transition-colors flex items-center gap-1 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            Ajouter un agent
          </button>
          <button
            onClick={onOpenLegend}
            className="px-2.5 py-1 text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white flex items-center gap-1 cursor-pointer"
          >
            <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
            Légende & Règles
          </button>
        </div>
      </div>

      {/* Interactive Table */}
      <div className="flex-1 overflow-auto">
        <table className="w-full border-collapse text-left text-xs">
          <thead className="bg-slate-50 dark:bg-slate-800/80 sticky top-0 z-20 border-b border-slate-200 dark:border-slate-700">
            <tr>
              <th className="px-3 py-2.5 font-semibold text-slate-700 dark:text-slate-300 w-48 border-r border-slate-200 dark:border-slate-700">
                Agent / Pôle
              </th>
              {weekRange.days.map((day) => {
                const isWeekend = day.key === 'sat' || day.key === 'sun';
                return (
                  <th
                    key={day.key}
                    className={`px-2 py-2 text-center border-r border-slate-200 dark:border-slate-700 min-w-[100px] ${
                      isWeekend ? 'bg-amber-50/40 dark:bg-amber-950/20 text-amber-900 dark:text-amber-200' : ''
                    }`}
                  >
                    <div className="font-semibold text-slate-800 dark:text-slate-200">
                      {day.label}
                    </div>
                    <div className="font-mono text-[10px] text-slate-500 font-normal">
                      {day.formatted}
                    </div>
                    {isWeekend && (
                      <span className="text-[8.5px] uppercase font-mono font-medium tracking-tight text-amber-700 dark:text-amber-400 block mt-0.5">
                        Exclus synthèse
                      </span>
                    )}
                  </th>
                );
              })}
              <th className="px-3 py-2 text-center border-r border-slate-200 dark:border-slate-700 bg-teal-50/60 dark:bg-teal-950/40 text-teal-900 dark:text-teal-200 min-w-[130px]">
                <div className="font-semibold">Synthèse MR-MGA</div>
                <div className="text-[10px] text-teal-700/80 dark:text-teal-400 font-mono font-normal">
                  Règle Lun-Ven
                </div>
              </th>
              <th className="px-3 py-2 font-semibold text-slate-700 dark:text-slate-300 min-w-[150px]">
                Commentaire Hebdomadaire
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {filteredAgents.length === 0 ? (
              <tr>
                <td colSpan={10} className="py-12 text-center text-slate-400">
                  Aucun agent trouvé.
                </td>
              </tr>
            ) : (
              filteredAgents.map((agent) => {
                const schedule = getAgentSchedule(agent.id);
                const synthesis = calculateWeeklySynthesis(schedule);
                const dayKeys: (keyof AgentWeekSchedule['days'])[] = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];

                return (
                  <tr
                    key={agent.id}
                    className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors"
                  >
                    {/* Agent Identity */}
                    <td className="px-3 py-2.5 border-r border-slate-200 dark:border-slate-800 align-top">
                      <div className="font-semibold text-slate-900 dark:text-slate-100">
                        {agent.lastName.toUpperCase()} {agent.firstName}
                      </div>
                      <div className="flex items-center gap-1.5 text-[10.5px] text-slate-500 font-mono">
                        <span className="text-teal-700 dark:text-teal-400 font-semibold">{agent.matricule}</span>
                        <span>·</span>
                        <span>{agent.weeklyWorkHours}h</span>
                      </div>
                      <div className="text-[10px] text-slate-500 truncate max-w-[160px]" title={agent.role}>
                        {agent.role}
                      </div>
                    </td>

                    {/* Day Cells */}
                    {dayKeys.map((dKey, idx) => {
                      const dayEntry = schedule.days[dKey];
                      const dayMeta = weekRange.days[idx];
                      const statusDef = STATUS_DEFINITIONS[dayEntry.statusCode] || STATUS_DEFINITIONS.OFF;
                      const isWeekend = dKey === 'sat' || dKey === 'sun';
                      const hasComment = Boolean(dayEntry.comment && dayEntry.comment.trim());

                      return (
                        <td
                          key={dKey}
                          onClick={() => handleDayCellClick(agent, dKey, dayMeta.label, dayMeta.formatted)}
                          className={`p-1.5 border-r border-slate-100 dark:border-slate-800 align-top cursor-pointer group hover:bg-slate-100/60 dark:hover:bg-slate-800/60 transition-colors ${
                            isWeekend ? 'bg-amber-50/20 dark:bg-amber-950/10' : ''
                          }`}
                        >
                          <div
                            className={`p-1.5 rounded-lg border transition-all ${statusDef.colorClasses.bg} ${statusDef.colorClasses.border} group-hover:shadow-xs`}
                          >
                            <div className="flex items-center justify-between gap-1 mb-1">
                              <span
                                className={`px-1.5 py-0.5 rounded font-mono font-bold text-[10px] ${statusDef.colorClasses.badge}`}
                              >
                                {dayEntry.statusCode}
                              </span>
                              <Edit2 className="w-2.5 h-2.5 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>

                            {dayEntry.hours ? (
                              <div className="text-[9.5px] font-mono text-slate-600 dark:text-slate-400 truncate flex items-center gap-0.5">
                                <Clock className="w-2.5 h-2.5 shrink-0 text-slate-400" />
                                {dayEntry.hours}
                              </div>
                            ) : (
                              <div className="text-[9.5px] text-slate-400 italic">
                                Sans horaire
                              </div>
                            )}

                            {hasComment && (
                              <div className="mt-1 pt-1 border-t border-slate-200/60 dark:border-slate-700/60 font-mono text-[9px] text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-tight line-clamp-2">
                                {dayEntry.comment}
                              </div>
                            )}
                          </div>
                        </td>
                      );
                    })}

                    {/* Synthesis Column */}
                    <td className="px-2.5 py-2 border-r border-slate-200 dark:border-slate-800 align-top text-center bg-teal-50/20 dark:bg-teal-950/10">
                      <div className="flex flex-col items-center">
                        <span
                          className={`px-2 py-0.5 rounded font-mono font-bold text-[11px] mb-1 ${synthesis.statusDefinition.colorClasses.badge}`}
                        >
                          {synthesis.statusCode}
                        </span>
                        <div className="text-[10px] font-semibold text-slate-800 dark:text-slate-200 text-center leading-tight">
                          {synthesis.statusDefinition.title}
                        </div>

                        {synthesis.isOverridden ? (
                          <div className="text-[9px] text-rose-600 dark:text-rose-400 font-medium mt-1">
                            Surchargé manuellement
                          </div>
                        ) : (
                          <div className="text-[9px] text-slate-500 font-mono mt-1">
                            Calcul auto MR-MGA
                          </div>
                        )}

                        {/* Button to toggle override */}
                        <button
                          type="button"
                          onClick={() => handleToggleOverride(agent.id, synthesis.statusCode)}
                          className="mt-1 text-[9px] text-teal-700 dark:text-teal-300 underline hover:text-teal-900 cursor-pointer"
                        >
                          {synthesis.isOverridden ? 'Rétablir auto' : 'Forcer statut'}
                        </button>
                      </div>
                    </td>

                    {/* Week-level Comment */}
                    <td className="px-2 py-2 align-top">
                      <textarea
                        rows={2}
                        value={schedule.weekComment || ''}
                        onChange={(e) => handleUpdateWeekComment(agent.id, e.target.value)}
                        placeholder="Note générale de la semaine..."
                        className="w-full text-xs font-mono p-1.5 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 resize-none focus:outline-hidden focus:ring-1 focus:ring-teal-500"
                      />
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Cell Edit Modal */}
      {editingModal && (
        <CellEditModal
          isOpen={Boolean(editingModal)}
          onClose={() => setEditingModal(null)}
          onSave={handleSaveDayEntry}
          agent={editingModal.agent}
          dayKey={editingModal.dayKey}
          dayLabel={editingModal.dayLabel}
          dayDateFormatted={editingModal.dayDateFormatted}
          currentEntry={editingModal.currentEntry}
          weekNumber={selectedWeek}
        />
      )}
    </div>
  );
};
