import React from 'react';
import { Agent, AgentWeekSchedule, StatusCode } from '../types/tds';
import { calculateWeeklySynthesis, getWeekDateRange, STATUS_DEFINITIONS, MR_MGA_PRIORITY_ORDER } from '../utils/tdsCalculations';
import { Printer, ArrowLeft, ShieldCheck, Calendar, Info } from 'lucide-react';

interface PrintViewProps {
  agents: Agent[];
  schedules: Record<string, AgentWeekSchedule>;
  currentYear: number;
  selectedWeek: number;
  onClose: () => void;
}

export const PrintView: React.FC<PrintViewProps> = ({
  agents,
  schedules,
  currentYear,
  selectedWeek,
  onClose,
}) => {
  const weekRange = getWeekDateRange(selectedWeek, currentYear);

  const handlePrint = () => {
    window.print();
  };

  // Only Planning Legend statuses (all operational planning codes)
  const planningStatusCodes: StatusCode[] = [
    'AE',
    'EPI',
    'TRV',
    'TLT',
    'FOR',
    'MIS',
    'ABS_V',
    'EXC',
    'CET',
    'ABS_D',
    'OFF',
  ];

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 p-4 sm:p-8">
      {/* Top action bar (hidden during print) */}
      <div className="no-print max-w-7xl mx-auto mb-6 bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center gap-1.5 text-xs font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour à l'application
          </button>
          <div className="h-4 w-px bg-slate-200 dark:bg-slate-800" />
          <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
            Aperçu avant impression · TDS Hebdomadaire S{selectedWeek < 10 ? `0${selectedWeek}` : selectedWeek} ({currentYear})
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] text-slate-500 mr-2 hidden sm:inline">
            MR-MGA : Légende Tableau de Service masquée · Commentaires multi-lignes compacts
          </span>
          <button
            onClick={handlePrint}
            className="px-4 py-2 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-medium text-xs flex items-center gap-2 shadow-sm transition-colors cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            Imprimer / Exporter PDF
          </button>
        </div>
      </div>

      {/* Printable Sheet */}
      <div className="max-w-7xl mx-auto bg-white text-black p-6 rounded-lg shadow-md border border-slate-300 print:border-none print:shadow-none print:p-0 print:m-0">
        {/* Document Header */}
        <div className="border-b-2 border-slate-900 pb-3 mb-4">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold tracking-tight uppercase">
                  Tableau de Service Hebdomadaire (TDS)
                </span>
                <span className="text-xs font-mono font-bold px-2 py-0.5 bg-slate-100 border border-slate-400 rounded">
                  MR-MGA
                </span>
              </div>
              <div className="text-xs text-slate-700 font-medium mt-0.5">
                Direction des Moyens Généraux & Achats · Service Exploitation & Logistique
              </div>
            </div>

            <div className="text-right">
              <div className="text-sm font-bold font-mono">
                SEMAINE S{selectedWeek < 10 ? `0${selectedWeek}` : selectedWeek} — {currentYear}
              </div>
              <div className="text-xs text-slate-600 font-mono">
                Période du {weekRange.formatted}
              </div>
            </div>
          </div>
        </div>

        {/* Main Service Table */}
        <table className="w-full border-collapse text-left border border-slate-400 mb-4 text-[10px]">
          <thead>
            <tr className="bg-slate-100 text-slate-900 font-bold border-b border-slate-400">
              <th className="p-2 border-r border-slate-400 w-44">
                Agent / Pôle
              </th>
              {weekRange.days.map((day) => {
                const isWeekend = day.key === 'sat' || day.key === 'sun';
                return (
                  <th
                    key={day.key}
                    className={`p-1.5 text-center border-r border-slate-400 ${
                      isWeekend ? 'bg-slate-200/80 text-slate-700' : ''
                    }`}
                  >
                    <div>{day.label}</div>
                    <div className="font-mono text-[9px] font-normal text-slate-600">
                      {day.formatted}
                    </div>
                  </th>
                );
              })}
              <th className="p-1.5 text-center border-r border-slate-400 bg-teal-50 text-teal-950 w-24">
                Synthèse MR-MGA
              </th>
              <th className="p-1.5 border-slate-400 w-36">
                Observations
              </th>
            </tr>
          </thead>
          <tbody>
            {agents.map((agent, index) => {
              const key = `${agent.id}-${currentYear}-${selectedWeek}`;
              const schedule = schedules[key] || {
                agentId: agent.id,
                weekNumber: selectedWeek,
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
              const dayKeys: (keyof AgentWeekSchedule['days'])[] = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];

              return (
                <tr
                  key={agent.id}
                  className={`border-b border-slate-400 ${
                    index % 2 === 1 ? 'bg-slate-50/50' : 'bg-white'
                  }`}
                >
                  {/* Agent Identity */}
                  <td className="p-1.5 border-r border-slate-400 align-top">
                    <div className="font-bold text-slate-900 leading-tight">
                      {agent.lastName.toUpperCase()} {agent.firstName}
                    </div>
                    <div className="text-[8.5px] font-mono text-slate-600">
                      {agent.matricule}
                    </div>
                    <div className="text-[8.5px] text-slate-500 truncate">
                      {agent.pole}
                    </div>
                  </td>

                  {/* 7 Days of the Week */}
                  {dayKeys.map((dKey) => {
                    const dayEntry = schedule.days[dKey];
                    const isWeekend = dKey === 'sat' || dKey === 'sun';
                    const statusDef = STATUS_DEFINITIONS[dayEntry.statusCode] || STATUS_DEFINITIONS.OFF;

                    return (
                      <td
                        key={dKey}
                        className={`p-1 border-r border-slate-400 align-top text-center ${
                          isWeekend ? 'bg-slate-100/60' : ''
                        }`}
                      >
                        {/* Status Code badge */}
                        <div className="inline-block font-mono font-bold text-[9.5px] px-1 py-0.5 rounded border border-slate-400/80 mb-0.5">
                          {dayEntry.statusCode}
                        </div>

                        {/* Hours */}
                        {dayEntry.hours && (
                          <div className="text-[8px] font-mono text-slate-600 leading-tight">
                            {dayEntry.hours}
                          </div>
                        )}

                        {/* SPECIFIC MR-MGA REQUIREMENT:
                            "Applique un style respectant les retours à la ligne (whitespace-pre-wrap, police mono compacte) pour l'affichage des commentaires dans les cases du TDS hebdomadaire à l'impression." */}
                        {dayEntry.comment && (
                          <div className="tds-print-comment whitespace-pre-wrap font-mono text-[8.5px] leading-tight text-slate-800 text-left mt-0.5 pt-0.5 border-t border-slate-300">
                            {dayEntry.comment}
                          </div>
                        )}
                      </td>
                    );
                  })}

                  {/* Synthetic Weekly Status for MR-MGA */}
                  <td className="p-1 border-r border-slate-400 align-top text-center bg-teal-50/30">
                    <div className="inline-block font-mono font-bold text-[10px] px-1.5 py-0.5 rounded border border-slate-700 bg-white">
                      {synthesis.statusCode}
                    </div>
                    <div className="text-[8px] text-slate-600 leading-tight mt-0.5">
                      {synthesis.statusDefinition.title}
                    </div>
                    {synthesis.isOverridden && (
                      <div className="text-[7.5px] font-bold text-rose-700">
                        [Forcé]
                      </div>
                    )}
                  </td>

                  {/* Observations */}
                  <td className="p-1 align-top">
                    {schedule.weekComment && (
                      <div className="tds-print-comment whitespace-pre-wrap font-mono text-[8.5px] leading-tight text-slate-800">
                        {schedule.weekComment}
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* SPECIFIC MR-MGA REQUIREMENT:
            "Impression hebdomadaire (Print View) : 
             * Masque complètement la 'Légende Tableau de Service' pour MR-MGA, conserve uniquement la 'Légende Planning'." */}
        <div className="border border-slate-400 p-2.5 rounded bg-slate-50 mb-4 text-[9px]">
          <div className="font-bold text-slate-900 uppercase text-[9.5px] mb-1.5 flex items-center justify-between">
            <span>Légende Planning (Codes opérationnels MR-MGA)</span>
            <span className="text-[8px] font-normal text-slate-500 font-mono">
              Synthèse calculée sur Lun-Ven · Samedi et Dimanche exclus · Priorités : AE &gt; EPI &gt; TRV &gt; TLT &gt; FOR &gt; MIS &gt; ABS_V &gt; EXC &gt; CET &gt; ABS_D &gt; OFF
            </span>
          </div>

          <div className="grid grid-cols-4 sm:grid-cols-6 gap-x-3 gap-y-1">
            {planningStatusCodes.map((code) => {
              const def = STATUS_DEFINITIONS[code];
              return (
                <div key={code} className="flex items-center gap-1.5">
                  <span className="font-mono font-bold px-1 py-0.2 rounded border border-slate-400 bg-white text-[9px] min-w-[34px] text-center">
                    {def.code}
                  </span>
                  <span className="text-slate-800 truncate" title={def.title}>
                    {def.title}
                  </span>
                </div>
              );
            })}
          </div>

          {/* NOTE: Notice that "Légende Tableau de Service" is deliberately omitted/masked as strictly required */}
        </div>

        {/* Footer / Signatures block for administrative compliance */}
        <div className="grid grid-cols-2 gap-4 text-[9.5px] border-t border-slate-400 pt-3">
          <div>
            <div className="font-semibold text-slate-800">
              Établi par le Coordinateur Moyens Généraux & Achats :
            </div>
            <div className="h-10 border-b border-dashed border-slate-400 mt-2" />
            <div className="text-[8px] text-slate-500 mt-0.5">Date et Visa</div>
          </div>
          <div>
            <div className="font-semibold text-slate-800">
              Visa du Responsable de Service / Direction MR-MGA :
            </div>
            <div className="h-10 border-b border-dashed border-slate-400 mt-2" />
            <div className="text-[8px] text-slate-500 mt-0.5">Date et Signature</div>
          </div>
        </div>
      </div>
    </div>
  );
};
