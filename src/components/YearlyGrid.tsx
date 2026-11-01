import React, { useState, useMemo } from 'react';
import { Agent, AgentWeekSchedule, StatusCode } from '../types/tds';
import { calculateWeeklySynthesis, getWeekDateRange, STATUS_DEFINITIONS, MR_MGA_PRIORITY_ORDER } from '../utils/tdsCalculations';
import { Calendar, Filter, Search, ChevronRight, MessageSquare, Info, ShieldAlert } from 'lucide-react';

interface YearlyGridProps {
  agents: Agent[];
  schedules: Record<string, AgentWeekSchedule>;
  currentYear: number;
  onSelectWeek: (week: number) => void;
  selectedWeek: number;
}

interface HoveredCellInfo {
  agent: Agent;
  weekNumber: number;
  year: number;
  schedule: AgentWeekSchedule;
  synthesis: ReturnType<typeof calculateWeeklySynthesis>;
  dateRange: ReturnType<typeof getWeekDateRange>;
  rect: DOMRect;
}

export const YearlyGrid: React.FC<YearlyGridProps> = ({
  agents,
  schedules,
  currentYear,
  onSelectWeek,
  selectedWeek,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPole, setSelectedPole] = useState<string>('all');
  const [hoveredCell, setHoveredCell] = useState<HoveredCellInfo | null>(null);

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

  const weeks = Array.from({ length: 52 }, (_, i) => i + 1);

  const handleCellMouseEnter = (
    e: React.MouseEvent<HTMLButtonElement>,
    agent: Agent,
    weekNumber: number
  ) => {
    const key = `${agent.id}-${currentYear}-${weekNumber}`;
    const schedule = schedules[key] || {
      agentId: agent.id,
      weekNumber,
      year: currentYear,
      days: {
        mon: { statusCode: 'TRV' },
        tue: { statusCode: 'TRV' },
        wed: { statusCode: 'TRV' },
        thu: { statusCode: 'TRV' },
        fri: { statusCode: 'TRV' },
        sat: { statusCode: 'OFF' },
        sun: { statusCode: 'OFF' },
      },
    };

    const synthesis = calculateWeeklySynthesis(schedule);
    const dateRange = getWeekDateRange(weekNumber, currentYear);
    const rect = e.currentTarget.getBoundingClientRect();

    setHoveredCell({
      agent,
      weekNumber,
      year: currentYear,
      schedule,
      synthesis,
      dateRange,
      rect,
    });
  };

  const handleCellMouseLeave = () => {
    setHoveredCell(null);
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
      {/* Header controls */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
              Tableau Annuel de Service (YearlyGrid)
            </h2>
            <span className="text-xs px-2 py-0.5 rounded-md bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800 font-mono">
              MR-MGA · {currentYear}
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Survolez les cellules pour consulter la synthèse MR-MGA, la description complète et les commentaires.
          </p>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Rechercher un agent..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-teal-500 w-48"
            />
          </div>

          <div className="flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedPole}
              onChange={(e) => setSelectedPole(e.target.value)}
              className="py-1.5 px-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-teal-500"
            >
              <option value="all">Tous les pôles ({agents.length})</option>
              {poles.map((pole) => (
                <option key={pole} value={pole}>
                  {pole}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Grid container with horizontal scroll */}
      <div className="flex-1 overflow-auto relative">
        <table className="w-full border-collapse text-left text-xs">
          <thead className="bg-slate-50 dark:bg-slate-800/80 sticky top-0 z-20 border-b border-slate-200 dark:border-slate-700">
            <tr>
              <th className="sticky left-0 z-30 bg-slate-50 dark:bg-slate-800 px-3 py-2.5 font-semibold text-slate-700 dark:text-slate-300 min-w-[210px] border-r border-slate-200 dark:border-slate-700 shadow-xs">
                Agent / Pôle
              </th>
              {weeks.map((week) => (
                <th
                  key={week}
                  onClick={() => onSelectWeek(week)}
                  title={`Semaine ${week} - Cliquer pour ouvrir le TDS hebdomadaire`}
                  className={`px-1 py-2 text-center font-mono font-medium text-[11px] min-w-[34px] cursor-pointer transition-colors border-r border-slate-100 dark:border-slate-800 select-none ${
                    selectedWeek === week
                      ? 'bg-teal-100/70 text-teal-900 dark:bg-teal-950/80 dark:text-teal-200 font-bold'
                      : 'text-slate-500 hover:bg-slate-200/50 dark:hover:bg-slate-700/50'
                  }`}
                >
                  S{week < 10 ? `0${week}` : week}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {filteredAgents.length === 0 ? (
              <tr>
                <td colSpan={53} className="py-12 text-center text-slate-400">
                  Aucun agent trouvé avec ces critères de recherche.
                </td>
              </tr>
            ) : (
              filteredAgents.map((agent) => (
                <tr
                  key={agent.id}
                  className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
                >
                  {/* Fixed Left Column for Agent Info */}
                  <td className="sticky left-0 z-10 bg-white dark:bg-slate-900 px-3 py-2 border-r border-slate-200 dark:border-slate-800 shadow-xs">
                    <div className="font-semibold text-slate-900 dark:text-slate-100 truncate">
                      {agent.lastName.toUpperCase()} {agent.firstName}
                    </div>
                    <div className="flex items-center gap-1.5 text-[10px] text-slate-500 dark:text-slate-400">
                      <span className="font-mono text-slate-600 dark:text-slate-300 font-medium">{agent.matricule}</span>
                      <span>·</span>
                      <span className="truncate max-w-[120px]" title={agent.pole}>{agent.pole}</span>
                    </div>
                  </td>

                  {/* 52 Week Cells */}
                  {weeks.map((week) => {
                    const key = `${agent.id}-${currentYear}-${week}`;
                    const schedule = schedules[key] || {
                      agentId: agent.id,
                      weekNumber: week,
                      year: currentYear,
                      days: {
                        mon: { statusCode: 'TRV' },
                        tue: { statusCode: 'TRV' },
                        wed: { statusCode: 'TRV' },
                        thu: { statusCode: 'TRV' },
                        fri: { statusCode: 'TRV' },
                        sat: { statusCode: 'OFF' },
                        sun: { statusCode: 'OFF' },
                      },
                    };
                    const synthesis = calculateWeeklySynthesis(schedule);
                    const statusDef = synthesis.statusDefinition;
                    const hasComments = synthesis.commentsSummary.length > 0;
                    const isSelected = selectedWeek === week;

                    return (
                      <td
                        key={week}
                        className={`p-0.5 text-center border-r border-slate-100 dark:border-slate-800/60 ${
                          isSelected ? 'bg-teal-50/40 dark:bg-teal-950/20' : ''
                        }`}
                      >
                        <button
                          type="button"
                          onMouseEnter={(e) => handleCellMouseEnter(e, agent, week)}
                          onMouseLeave={handleCellMouseLeave}
                          onClick={() => onSelectWeek(week)}
                          className={`w-full h-8 rounded-sm font-mono text-[10px] font-bold flex flex-col items-center justify-center transition-transform hover:scale-105 hover:z-10 relative cursor-pointer ${statusDef.colorClasses.bg} ${statusDef.colorClasses.text} border ${statusDef.colorClasses.border}`}
                        >
                          <span>{synthesis.statusCode}</span>
                          {hasComments && (
                            <span className="absolute bottom-0.5 right-0.5 w-1.5 h-1.5 rounded-full bg-slate-700/60 dark:bg-slate-300/80" />
                          )}
                          {synthesis.isOverridden && (
                            <span className="absolute top-0.5 right-0.5 w-1 h-1 rounded-full bg-rose-500" />
                          )}
                        </button>
                      </td>
                    );
                  })}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* MR-MGA SPECIFIC TOOLTIP REQUIREMENT */}
      {/* "Survol des cellules (YearlyGrid) : Affiche une infobulle (tooltip) contenant le titre du statut synthétique, sa description complète et les commentaires éventuels lors du passage de la souris sur les cellules du tableau annuel." */}
      {hoveredCell && (
        <div
          role="tooltip"
          className="fixed z-50 pointer-events-none w-80 bg-slate-900 text-slate-100 dark:bg-slate-950 p-3.5 rounded-xl shadow-xl border border-slate-700 text-xs animate-in fade-in-0 zoom-in-95 duration-100"
          style={{
            top: Math.min(window.innerHeight - 260, Math.max(10, hoveredCell.rect.bottom + 8)),
            left: Math.min(window.innerWidth - 330, Math.max(10, hoveredCell.rect.left - 120)),
          }}
        >
          {/* Header of Tooltip */}
          <div className="flex items-start justify-between border-b border-slate-800 pb-2 mb-2.5">
            <div>
              <div className="font-semibold text-slate-200">
                {hoveredCell.agent.lastName.toUpperCase()} {hoveredCell.agent.firstName}
              </div>
              <div className="text-[11px] text-slate-400 font-mono">
                Semaine S{hoveredCell.weekNumber < 10 ? `0${hoveredCell.weekNumber}` : hoveredCell.weekNumber} · {hoveredCell.dateRange.formatted}
              </div>
            </div>
            <span
              className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${hoveredCell.synthesis.statusDefinition.colorClasses.badge}`}
            >
              {hoveredCell.synthesis.statusCode}
            </span>
          </div>

          {/* Title & Full Description */}
          <div className="space-y-1 mb-2.5">
            <div className="font-semibold text-white flex items-center gap-1.5 text-xs">
              <span className={`w-2 h-2 rounded-full ${hoveredCell.synthesis.statusDefinition.colorClasses.dot}`} />
              {hoveredCell.synthesis.statusDefinition.title}
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              {hoveredCell.synthesis.statusDefinition.description}
            </p>
          </div>

          {/* Synthesis Details & Weekend Exclusion Notice */}
          <div className="bg-slate-800/80 rounded-lg p-2 mb-2 text-[10.5px] border border-slate-700/60 space-y-1">
            <div className="text-slate-300 font-medium flex items-center justify-between">
              <span>Synthèse MR-MGA (Lun-Ven) :</span>
              <span className="font-mono text-teal-300 font-bold">
                {hoveredCell.synthesis.statusCode}
                {hoveredCell.synthesis.isOverridden && ' (Forcé)'}
              </span>
            </div>
            <div className="text-[10px] text-slate-400 flex items-center gap-1">
              <Info className="w-3 h-3 text-teal-400 shrink-0" />
              <span>Samedi & Dimanche exclus du calcul d'agrégation.</span>
            </div>
          </div>

          {/* Daily breakdown */}
          <div className="grid grid-cols-7 gap-1 text-center font-mono text-[9px] mb-2.5 bg-slate-800/40 p-1.5 rounded-md">
            <div>
              <span className="text-slate-400 block text-[8px]">Lun</span>
              <span className="font-bold text-slate-200">{hoveredCell.schedule.days.mon.statusCode}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[8px]">Mar</span>
              <span className="font-bold text-slate-200">{hoveredCell.schedule.days.tue.statusCode}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[8px]">Mer</span>
              <span className="font-bold text-slate-200">{hoveredCell.schedule.days.wed.statusCode}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[8px]">Jeu</span>
              <span className="font-bold text-slate-200">{hoveredCell.schedule.days.thu.statusCode}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[8px]">Ven</span>
              <span className="font-bold text-slate-200">{hoveredCell.schedule.days.fri.statusCode}</span>
            </div>
            <div className="opacity-60 border-l border-slate-700 pl-0.5">
              <span className="text-slate-400 block text-[8px]">Sam</span>
              <span className="text-slate-300">{hoveredCell.schedule.days.sat.statusCode}</span>
            </div>
            <div className="opacity-60">
              <span className="text-slate-400 block text-[8px]">Dim</span>
              <span className="text-slate-300">{hoveredCell.schedule.days.sun.statusCode}</span>
            </div>
          </div>

          {/* Comments Section */}
          {hoveredCell.synthesis.commentsSummary.length > 0 ? (
            <div className="border-t border-slate-800 pt-2 space-y-1">
              <div className="text-[10px] font-semibold text-amber-300 flex items-center gap-1">
                <MessageSquare className="w-3 h-3" />
                <span>Commentaires :</span>
              </div>
              <div className="space-y-1 max-h-24 overflow-y-auto pr-1">
                {hoveredCell.synthesis.commentsSummary.map((comm, idx) => (
                  <p key={idx} className="text-[10.5px] text-slate-200 font-mono whitespace-pre-wrap bg-slate-800/60 px-1.5 py-1 rounded">
                    {comm}
                  </p>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-[10px] text-slate-500 italic border-t border-slate-800 pt-1.5">
              Aucun commentaire pour cette semaine.
            </div>
          )}

          <div className="mt-2 pt-1 border-t border-slate-800/80 text-[9px] text-slate-400 text-right">
            Cliquer pour ouvrir le TDS Semaine {hoveredCell.weekNumber}
          </div>
        </div>
      )}
    </div>
  );
};
