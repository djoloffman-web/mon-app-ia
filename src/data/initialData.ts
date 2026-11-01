import { Agent, AgentWeekSchedule } from '../types/tds';

export const INITIAL_AGENTS: Agent[] = [
  {
    id: 'agt-1',
    matricule: 'MGA-1042',
    firstName: 'Claire',
    lastName: 'Delorme',
    pole: 'Moyens Généraux',
    role: 'Responsable Moyens Généraux',
    email: 'claire.delorme@mr-mga.fr',
    weeklyWorkHours: 35,
  },
  {
    id: 'agt-2',
    matricule: 'MGA-1088',
    firstName: 'Marc',
    lastName: 'Benali',
    pole: 'Achats & Marchés',
    role: 'Acheteur Principal Marchés Fournisseurs',
    email: 'marc.benali@mr-mga.fr',
    weeklyWorkHours: 35,
  },
  {
    id: 'agt-3',
    matricule: 'MGA-2150',
    firstName: 'Sophie',
    lastName: 'Rousseau',
    pole: 'Achats & Marchés',
    role: 'Gestionnaire Contrats & Facturation',
    email: 'sophie.rousseau@mr-mga.fr',
    weeklyWorkHours: 35,
  },
  {
    id: 'agt-4',
    matricule: 'MGA-3094',
    firstName: 'Karim',
    lastName: 'Tahar',
    pole: 'Logistique & Stocks',
    role: 'Superviseur Logistique & Réception',
    email: 'karim.tahar@mr-mga.fr',
    weeklyWorkHours: 35,
  },
  {
    id: 'agt-5',
    matricule: 'MGA-4211',
    firstName: 'Julien',
    lastName: 'Moreau',
    pole: 'Maintenance & Sécurité',
    role: 'Technicien Astreinte & Équipements',
    email: 'julien.moreau@mr-mga.fr',
    weeklyWorkHours: 35,
  },
  {
    id: 'agt-6',
    matricule: 'MGA-4552',
    firstName: 'Amélie',
    lastName: 'Fontaine',
    pole: 'Moyens Généraux',
    role: 'Coordinatrice Services aux Occupants',
    email: 'amelie.fontaine@mr-mga.fr',
    weeklyWorkHours: 35,
  },
];

// Helper to generate realistic weekly schedule with variety
export function createDefaultSchedules(agents: Agent[], year: number = 2026): Record<string, AgentWeekSchedule> {
  const schedules: Record<string, AgentWeekSchedule> = {};

  agents.forEach((agent, agentIdx) => {
    for (let w = 1; w <= 52; w++) {
      const key = `${agent.id}-${year}-${w}`;

      // Default baseline: TRV / TLT
      let monStatus: any = 'TRV';
      let tueStatus: any = 'TRV';
      let wedStatus: any = 'TLT';
      let thuStatus: any = 'TRV';
      let friStatus: any = agentIdx % 2 === 0 ? 'TLT' : 'TRV';
      let satStatus: any = 'OFF';
      let sunStatus: any = 'OFF';
      let weekComment = '';
      let monComment = '';
      let tueComment = '';
      let wedComment = '';
      let thuComment = '';
      let friComment = '';
      let satComment = '';
      let sunComment = '';

      // Introduce realistic variations across weeks
      if (w === 44) {
        // Current/active sample week: W44
        if (agent.id === 'agt-1') {
          // Claire: 2 TRV, 2 TLT, 1 MIS (TRV > TLT tie broken by priority TRV)
          monStatus = 'TRV';
          tueStatus = 'TLT';
          wedStatus = 'TRV';
          thuStatus = 'TLT';
          friStatus = 'MIS';
          friComment = 'Audit annuel prestataire nettoyage\nSite Nord - Bâtiment C';
          weekComment = 'Coordination audit d\'exploitation';
        } else if (agent.id === 'agt-2') {
          // Marc: 2 TLT, 2 FOR, 1 TRV (tie FOR vs TLT -> TLT > FOR by priority order!)
          monStatus = 'TLT';
          tueStatus = 'FOR';
          wedStatus = 'TLT';
          thuStatus = 'FOR';
          friStatus = 'TRV';
          tueComment = 'Marchés publics dématérialisés';
          thuComment = 'Module 2 : Négociation Grands Comptes';
        } else if (agent.id === 'agt-5') {
          // Julien (Maintenance & Sécurité):
          // 2 TRV, 2 EPI, 1 TLT + Weekend Astreinte Exceptionnelle (AE on Sat/Sun)
          // Notice: Weekday tie 2 TRV vs 2 EPI -> EPI > TRV by MR-MGA priority!
          // And Sat/Sun AE does NOT override Mon-Fri synthesis!
          monStatus = 'TRV';
          tueStatus = 'EPI';
          wedStatus = 'TRV';
          thuStatus = 'EPI';
          friStatus = 'TLT';
          satStatus = 'AE';
          sunStatus = 'AE';
          tueComment = 'Vérification extincteurs & RIA\nProcès-verbal de sécurité';
          thuComment = 'Contrôle nacelle élévatrice';
          satComment = 'Astreinte N2 Week-end\nDisponibilité d\'urgence 24/24';
          sunComment = 'Astreinte N2 Week-end\nFin dimanche 20:00';
          weekComment = 'Semaine d\'astreinte sécurité bâtiment';
        } else if (agent.id === 'agt-4') {
          // Karim: 4 TRV, 1 CET
          monStatus = 'TRV';
          tueStatus = 'TRV';
          wedStatus = 'TRV';
          thuStatus = 'TRV';
          friStatus = 'CET';
          monComment = 'Réception livraisons mobilier';
          friComment = 'Jour posé Compte Épargne Temps';
        } else if (agent.id === 'agt-3') {
          // Sophie: All week ABS_V (Congés)
          monStatus = 'ABS_V';
          tueStatus = 'ABS_V';
          wedStatus = 'ABS_V';
          thuStatus = 'ABS_V';
          friStatus = 'ABS_V';
          weekComment = 'Congés Toussaint validés';
        }
      } else if (w >= 30 && w <= 32) {
        // Summer vacations
        if (agentIdx % 2 === 0) {
          monStatus = 'ABS_V';
          tueStatus = 'ABS_V';
          wedStatus = 'ABS_V';
          thuStatus = 'ABS_V';
          friStatus = 'ABS_V';
          weekComment = 'Congés d\'été annuels';
        }
      } else if (w === 12) {
        // Training week for technical staff
        if (agent.pole === 'Maintenance & Sécurité' || agent.pole === 'Logistique & Stocks') {
          monStatus = 'FOR';
          tueStatus = 'FOR';
          wedStatus = 'FOR';
          thuStatus = 'FOR';
          friStatus = 'FOR';
          weekComment = 'Habilitation électrique & CACES';
        }
      } else if (w === 51 || w === 52) {
        // End of year
        if (agentIdx % 3 === 0) {
          monStatus = 'CET';
          tueStatus = 'CET';
          wedStatus = 'CET';
          thuStatus = 'CET';
          friStatus = 'CET';
          weekComment = 'Soldes CET fin d\'exercice';
        }
      }

      schedules[key] = {
        agentId: agent.id,
        weekNumber: w,
        year,
        days: {
          mon: { statusCode: monStatus, comment: monComment, hours: '08:30 - 17:00' },
          tue: { statusCode: tueStatus, comment: tueComment, hours: '08:30 - 17:00' },
          wed: { statusCode: wedStatus, comment: wedComment, hours: '08:30 - 17:00' },
          thu: { statusCode: thuStatus, comment: thuComment, hours: '08:30 - 17:00' },
          fri: { statusCode: friStatus, comment: friComment, hours: '08:30 - 16:00' },
          sat: { statusCode: satStatus, comment: satComment, hours: satStatus !== 'OFF' ? 'Astreinte' : undefined },
          sun: { statusCode: sunStatus, comment: sunComment, hours: sunStatus !== 'OFF' ? 'Astreinte' : undefined },
        },
        weekComment,
      };
    }
  });

  return schedules;
}
