import { AgentWeekSchedule, StatusCode, StatusDefinition, WeeklySynthesisResult } from '../types/tds';

// Strict MR-MGA Priority Order for tie-breaking:
// AE > EPI > TRV > TLT > FOR > MIS > ABS_V > EXC > CET > ABS_D > OFF
export const MR_MGA_PRIORITY_ORDER: readonly StatusCode[] = [
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
] as const;

export const STATUS_DEFINITIONS: Record<StatusCode, StatusDefinition> = {
  AE: {
    code: 'AE',
    title: 'Activité Exceptionnelle',
    description: 'Astreinte exceptionnelle, intervention d’urgence ou événement critique hors cadre standard',
    category: 'special',
    priorityRank: 1,
    colorClasses: {
      bg: 'bg-rose-50 dark:bg-rose-950/40',
      text: 'text-rose-700 dark:text-rose-300',
      border: 'border-rose-300 dark:border-rose-800',
      badge: 'bg-rose-600 text-white',
      dot: 'bg-rose-500',
    },
  },
  EPI: {
    code: 'EPI',
    title: 'Équipement & Intervention',
    description: 'Intervention technique matérielle, gestion des équipements de protection ou logistique critique',
    category: 'presence',
    priorityRank: 2,
    colorClasses: {
      bg: 'bg-amber-50 dark:bg-amber-950/40',
      text: 'text-amber-800 dark:text-amber-300',
      border: 'border-amber-300 dark:border-amber-800',
      badge: 'bg-amber-600 text-white',
      dot: 'bg-amber-500',
    },
  },
  TRV: {
    code: 'TRV',
    title: 'Travail sur site',
    description: 'Présence physique normale au poste de travail sur site MR-MGA',
    category: 'presence',
    priorityRank: 3,
    colorClasses: {
      bg: 'bg-teal-50 dark:bg-teal-950/40',
      text: 'text-teal-800 dark:text-teal-300',
      border: 'border-teal-300 dark:border-teal-800',
      badge: 'bg-teal-700 text-white',
      dot: 'bg-teal-600',
    },
  },
  TLT: {
    code: 'TLT',
    title: 'Télétravail',
    description: 'Activité professionnelle effectuée à distance selon le protocole de télétravail MR-MGA',
    category: 'remote',
    priorityRank: 4,
    colorClasses: {
      bg: 'bg-sky-50 dark:bg-sky-950/40',
      text: 'text-sky-800 dark:text-sky-300',
      border: 'border-sky-300 dark:border-sky-800',
      badge: 'bg-sky-600 text-white',
      dot: 'bg-sky-500',
    },
  },
  FOR: {
    code: 'FOR',
    title: 'Formation',
    description: 'Session de formation professionnelle interne ou externe, e-learning ou perfectionnement',
    category: 'presence',
    priorityRank: 5,
    colorClasses: {
      bg: 'bg-indigo-50 dark:bg-indigo-950/40',
      text: 'text-indigo-800 dark:text-indigo-300',
      border: 'border-indigo-300 dark:border-indigo-800',
      badge: 'bg-indigo-600 text-white',
      dot: 'bg-indigo-500',
    },
  },
  MIS: {
    code: 'MIS',
    title: 'Mission',
    description: 'Déplacement professionnel extérieur, visite de sites déportés, audits ou rendez-vous prestataires',
    category: 'presence',
    priorityRank: 6,
    colorClasses: {
      bg: 'bg-violet-50 dark:bg-violet-950/40',
      text: 'text-violet-800 dark:text-violet-300',
      border: 'border-violet-300 dark:border-violet-800',
      badge: 'bg-violet-600 text-white',
      dot: 'bg-violet-500',
    },
  },
  ABS_V: {
    code: 'ABS_V',
    title: 'Absence Validée (Congés)',
    description: 'Congés annuels payés, RTT autorisés ou repos récupérateur validé par la hiérarchie',
    category: 'absence',
    priorityRank: 7,
    colorClasses: {
      bg: 'bg-emerald-50 dark:bg-emerald-950/40',
      text: 'text-emerald-800 dark:text-emerald-300',
      border: 'border-emerald-300 dark:border-emerald-800',
      badge: 'bg-emerald-600 text-white',
      dot: 'bg-emerald-500',
    },
  },
  EXC: {
    code: 'EXC',
    title: 'Excusé',
    description: 'Absence autorisée (événements familiaux, autorisations spéciales d’absence, garde d’enfant)',
    category: 'absence',
    priorityRank: 8,
    colorClasses: {
      bg: 'bg-lime-50 dark:bg-lime-950/40',
      text: 'text-lime-800 dark:text-lime-300',
      border: 'border-lime-300 dark:border-lime-800',
      badge: 'bg-lime-700 text-white',
      dot: 'bg-lime-600',
    },
  },
  CET: {
    code: 'CET',
    title: 'Compte Épargne Temps',
    description: 'Journée d’absence imputée sur le Compte Épargne Temps de l’agent',
    category: 'absence',
    priorityRank: 9,
    colorClasses: {
      bg: 'bg-orange-50 dark:bg-orange-950/40',
      text: 'text-orange-800 dark:text-orange-300',
      border: 'border-orange-300 dark:border-orange-800',
      badge: 'bg-orange-600 text-white',
      dot: 'bg-orange-500',
    },
  },
  ABS_D: {
    code: 'ABS_D',
    title: 'Absence Décidée / Non justifiée',
    description: 'Absence non rémunérée, convenance personnelle sans solde ou en cours de régularisation',
    category: 'absence',
    priorityRank: 10,
    colorClasses: {
      bg: 'bg-zinc-100 dark:bg-zinc-800',
      text: 'text-zinc-700 dark:text-zinc-300',
      border: 'border-zinc-300 dark:border-zinc-700',
      badge: 'bg-zinc-600 text-white',
      dot: 'bg-zinc-500',
    },
  },
  OFF: {
    code: 'OFF',
    title: 'Repos / Non Travaillé',
    description: 'Jour de repos statutaire ou non travaillé',
    category: 'rest',
    priorityRank: 11,
    colorClasses: {
      bg: 'bg-slate-100 dark:bg-slate-800/60',
      text: 'text-slate-600 dark:text-slate-400',
      border: 'border-slate-200 dark:border-slate-700',
      badge: 'bg-slate-500 text-white',
      dot: 'bg-slate-400',
    },
  },
};

/**
 * Calculates the weekly synthetic status for MR-MGA:
 * 1. Strictly EXCLUDES Saturday and Sunday (weekends are never counted).
 * 2. Only counts the 5 working days: Monday, Tuesday, Wednesday, Thursday, Friday.
 * 3. Identifies the maximum frequency among statuses present in those 5 days.
 * 4. In case of ties (two or more statuses having the exact same maximum frequency),
 *    strictly applies the MR-MGA priority order:
 *    AE > EPI > TRV > TLT > FOR > MIS > ABS_V > EXC > CET > ABS_D > OFF
 */
export function calculateWeeklySynthesis(schedule: AgentWeekSchedule): WeeklySynthesisResult {
  if (schedule.overrideSyntheticStatus) {
    const statusDef = STATUS_DEFINITIONS[schedule.overrideSyntheticStatus] || STATUS_DEFINITIONS.OFF;
    return {
      statusCode: schedule.overrideSyntheticStatus,
      isOverridden: true,
      counts: {},
      ignoredWeekendCounts: {},
      statusDefinition: statusDef,
      commentsSummary: collectScheduleComments(schedule),
    };
  }

  // Working days only (Mon-Fri) - Saturday & Sunday are NEVER counted in MR-MGA synthesis
  const workingDayCodes: StatusCode[] = [
    schedule.days.mon.statusCode,
    schedule.days.tue.statusCode,
    schedule.days.wed.statusCode,
    schedule.days.thu.statusCode,
    schedule.days.fri.statusCode,
  ];

  const weekendCodes: StatusCode[] = [
    schedule.days.sat.statusCode,
    schedule.days.sun.statusCode,
  ];

  const workingCounts: Record<string, number> = {};
  for (const code of workingDayCodes) {
    workingCounts[code] = (workingCounts[code] || 0) + 1;
  }

  const weekendCounts: Record<string, number> = {};
  for (const code of weekendCodes) {
    weekendCounts[code] = (weekendCounts[code] || 0) + 1;
  }

  // Find max count
  let maxCount = 0;
  for (const count of Object.values(workingCounts)) {
    if (count > maxCount) {
      maxCount = count;
    }
  }

  // Find all statuses with maxCount
  const topCandidates: StatusCode[] = [];
  for (const [codeStr, count] of Object.entries(workingCounts)) {
    if (count === maxCount) {
      topCandidates.push(codeStr as StatusCode);
    }
  }

  // Apply MR-MGA strict priority tie-breaker:
  // AE > EPI > TRV > TLT > FOR > MIS > ABS_V > EXC > CET > ABS_D > OFF
  let chosenStatus: StatusCode = 'TRV'; // fallback
  if (topCandidates.length === 1) {
    chosenStatus = topCandidates[0];
  } else if (topCandidates.length > 1) {
    for (const priorityCode of MR_MGA_PRIORITY_ORDER) {
      if (topCandidates.includes(priorityCode)) {
        chosenStatus = priorityCode;
        break;
      }
    }
  }

  const statusDefinition = STATUS_DEFINITIONS[chosenStatus] || STATUS_DEFINITIONS.OFF;
  const commentsSummary = collectScheduleComments(schedule);

  return {
    statusCode: chosenStatus,
    isOverridden: false,
    counts: workingCounts,
    ignoredWeekendCounts: weekendCounts,
    statusDefinition,
    commentsSummary,
  };
}

/**
 * Collects any comments present in the week schedule (daily + week-level)
 */
export function collectScheduleComments(schedule: AgentWeekSchedule): string[] {
  const comments: string[] = [];
  if (schedule.weekComment && schedule.weekComment.trim()) {
    comments.push(`Hebdo : ${schedule.weekComment.trim()}`);
  }

  const dayLabels: Record<string, string> = {
    mon: 'Lun',
    tue: 'Mar',
    wed: 'Mer',
    thu: 'Jeu',
    fri: 'Ven',
    sat: 'Sam',
    sun: 'Dim',
  };

  const dayKeys: (keyof AgentWeekSchedule['days'])[] = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
  for (const key of dayKeys) {
    const dayEntry = schedule.days[key];
    if (dayEntry.comment && dayEntry.comment.trim()) {
      comments.push(`${dayLabels[key]} : ${dayEntry.comment.trim()}`);
    }
  }

  return comments;
}

/**
 * Returns formatted date ranges for a given ISO week number and year
 */
export function getWeekDateRange(weekNumber: number, year: number): {
  start: Date;
  end: Date;
  formatted: string;
  days: { key: keyof AgentWeekSchedule['days']; label: string; date: Date; formatted: string }[];
} {
  // Simple ISO week calculator
  const simple = new Date(year, 0, 1 + (weekNumber - 1) * 7);
  const dow = simple.getDay();
  const ISOweekStart = simple;
  if (dow <= 4) {
    ISOweekStart.setDate(simple.getDate() - simple.getDay() + 1);
  } else {
    ISOweekStart.setDate(simple.getDate() + 8 - simple.getDay());
  }

  const days: { key: keyof AgentWeekSchedule['days']; label: string; date: Date; formatted: string }[] = [];
  const dayKeys: (keyof AgentWeekSchedule['days'])[] = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
  const dayLabels = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];

  for (let i = 0; i < 7; i++) {
    const d = new Date(ISOweekStart);
    d.setDate(ISOweekStart.getDate() + i);
    days.push({
      key: dayKeys[i],
      label: dayLabels[i],
      date: d,
      formatted: d.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' }),
    });
  }

  const start = days[0].date;
  const end = days[6].date;
  const formatted = `${start.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })} - ${end.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}`;

  return { start, end, formatted, days };
}
