export type StatusCode = 
  | 'AE'
  | 'EPI'
  | 'TRV'
  | 'TLT'
  | 'FOR'
  | 'MIS'
  | 'ABS_V'
  | 'EXC'
  | 'CET'
  | 'ABS_D'
  | 'OFF';

export interface StatusDefinition {
  code: StatusCode;
  title: string;
  description: string;
  category: 'presence' | 'remote' | 'absence' | 'special' | 'rest';
  colorClasses: {
    bg: string;
    text: string;
    border: string;
    badge: string;
    dot: string;
  };
  priorityRank: number; // lower number = higher priority
}

export type DayOfWeek = 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun';

export interface DayEntry {
  statusCode: StatusCode;
  hours?: string; // e.g. "08:00 - 16:30"
  comment?: string;
}

export interface AgentWeekSchedule {
  agentId: string;
  weekNumber: number; // 1 to 52
  year: number;
  days: {
    mon: DayEntry;
    tue: DayEntry;
    wed: DayEntry;
    thu: DayEntry;
    fri: DayEntry;
    sat: DayEntry;
    sun: DayEntry;
  };
  // Manual override if manager explicitly sets synthetic status
  overrideSyntheticStatus?: StatusCode | null;
  weekComment?: string;
}

export interface Agent {
  id: string;
  matricule: string;
  firstName: string;
  lastName: string;
  pole: 'Moyens Généraux' | 'Achats & Marchés' | 'Logistique & Stocks' | 'Maintenance & Sécurité';
  role: string;
  email: string;
  weeklyWorkHours: number; // e.g. 35
}

export interface WeeklySynthesisResult {
  statusCode: StatusCode;
  isOverridden: boolean;
  counts: Record<string, number>; // counts for working days mon-fri
  ignoredWeekendCounts: Record<string, number>;
  statusDefinition: StatusDefinition;
  commentsSummary: string[];
}
