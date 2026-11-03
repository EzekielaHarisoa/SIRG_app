// Centralised field names / contracts confirmed (or assumed) from the Swagger
// documentation at http://localhost:8080/v3/api-docs.
//
// Sections marked "ASSUMED" have not been confirmed against the live backend.
// When the OpenAPI spec is reachable, update the matching field arrays here and
// the forms will pick up the changes automatically.

export const ROLES = {
  EMPLOYE: 'EMPLOYE',
  RH: 'RH',
  COMPTABLE: 'COMPTABLE',
}

export const ROLE_LABELS = {
  EMPLOYE: 'Employé',
  RH: 'Responsable RH',
  COMPTABLE: 'Comptable',
}

// Roles returned by the backend (POST /api/auth/login) mapped to the internal
// role keys used by the routes and layouts.
export const ROLE_ALIASES = {
  EMPLOYE: ROLES.EMPLOYE,
  RESPONSABLE: ROLES.RH,
  RH: ROLES.RH,
  COMPTABLE: ROLES.COMPTABLE,
}

export function normalizeRole(role) {
  const key = String(role ?? '')
    .trim()
    .toUpperCase()
  return ROLE_ALIASES[key] || null
}

// Login payload expected by the backend.
export const AUTH_FIELDS = {
  login: 'login',
  motDePasse: 'motDePasse',
}

// ---- Employé ----
export const EMPLOYE_FIELDS = {
  numeroMatricule: 'numerMatricule',
  nomEtPrenoms: 'nomEtPrenoms',
  telephone: 'telephone',
  adresse: 'adresse',
  dateEmbauche: 'dateEmbauche',
  entrepriseId: 'entrepriseId',
  posteId: 'posteId',
}
// ---- Solde de congé ----
// Confirmed against com.project.backend.conge.soldeConge.SoldeCongeDTO and
// com.project.backend.conge.TrancheConge.TrancheCongeSoldeDTO.
// GET /tranches-conge/solde/{numeroMatricule} returns the aggregate + `tranches`.
export const SOLDE_CONGE_FIELDS = {
  numeroMatricule: 'numeroMatricule',
  totalJoursAcquis: 'totalJoursAcquis',
  totalJoursConsommes: 'totalJoursConsommes',
  totalJoursRestants: 'totalJoursRestants',
  tranches: 'tranches',
}

// One row of GET /tranches-conge/employe/{numeroMatricule}.
export const TRANCHE_CONGE_FIELDS = {
  id: 'id',
  anneeCycle: 'anneeCycle',
  typeTranche: 'typeTranche',
  dateOuverture: 'dateOuverture',
  dateExpiration: 'dateExpiration',
  joursAcquis: 'joursAcquis',
  joursConsommes: 'joursConsommes',
  joursRestants: 'joursRestants',
  statut: 'statut',
}

// PREMIERE = 15 jours valables 3 mois, DEUXIEME = 15 jours valables 3 ans.
export const TYPE_TRANCHE_LABELS = {
  PREMIERE: 'Première tranche',
  DEUXIEME: 'Deuxième tranche',
}

// Statuts réellement utilisés par le backend (DemandeConge.status).
export const STATUTS_DEMANDE = {
  EN_ATTENTE: { value: 'EN_ATTENTE', label: 'En attente', tone: 'warning' },
  ACCEPTER: { value: 'ACCEPTER', label: 'Acceptée', tone: 'success' },
  REFUSER: { value: 'REFUSER', label: 'Refusée', tone: 'danger' },
}

export const STATUT_OPTIONS = Object.values(STATUTS_DEMANDE).map(({ value, label }) => ({
  value,
  label,
}))

export function labelStatutDemande(status) {
  return STATUTS_DEMANDE[status]?.label || status || '—'
}

// Active/expired state of a tranche.
export const STATUTS_TRANCHE = {
  ACTIVE: { label: 'Active', tone: 'success' },
  EXPIREE: { label: 'Expirée', tone: 'neutral' },
}

// Mirrors DemandeCongeService.TYPES_CONGE_AUTORISES.
export const TYPES_CONGE = [
  { value: 'CONGE_PAYE', label: 'Congé payé', description: 'Décompté des tranches de congé.' },
  { value: 'MALADIE', label: 'Congé maladie', description: 'Absence pour raison médicale.' },
  { value: 'MATERNITE', label: 'Congé maternité', description: 'Absence liée à une naissance.' },
  { value: 'PATERNITE', label: 'Congé paternité', description: 'Absence liée à une naissance.' },
  { value: 'PERMISSION', label: 'Permission', description: 'Absence courte autorisée.' },
]

export const TYPE_CONGE_OPTIONS = TYPES_CONGE.map(({ value, label }) => ({ value, label }))

export function labelTypeConge(type) {
  return TYPES_CONGE.find((t) => t.value === type)?.label || type || '—'
}

// ---- Pointage ----
// Field names confirmed against com.project.backend.pointage.Pointage.
export const POINTAGE_FIELDS = {
  numeroMatricule: 'numeroMatricule',
  datePointage: 'datePointage',
  heureEntree: 'heureEntree',
  heureSortie: 'heureSortie',
  retardMinute: 'retardMinute',
  heureSup: 'heureSup',
}

// ---- Événements de pointage QR ----
// Values match com.project.backend.pointage.evenement.TypeEvenement.
export const EVENEMENTS_POINTAGE = [
  { value: 'ENTREE', label: 'Entrée', description: 'Arrivée au travail' },
  { value: 'SORTIE_PAUSE', label: 'Départ en pause', description: 'Début de la pause' },
  { value: 'RETOUR_PAUSE', label: 'Retour de pause', description: 'Fin de la pause' },
  { value: 'SORTIE', label: 'Sortie', description: 'Fin de la journée' },
]

// Mirrors PointageEvenementService.verifierTransition. The backend stays the
// authority: this only prevents offering an event the server would reject.
export const TRANSITIONS_EVENEMENTS = {
  ENTREE: ['SORTIE_PAUSE', 'SORTIE'],
  SORTIE_PAUSE: ['RETOUR_PAUSE'],
  RETOUR_PAUSE: ['SORTIE_PAUSE', 'SORTIE'],
  SORTIE: [],
}

/**
 * Events the employee can register after `dernierType` (null = nothing yet).
 * Returns [] when the day is already closed by a SORTIE.
 */
export function evenementsAutorises(dernierType) {
  if (!dernierType) return ['ENTREE']
  return TRANSITIONS_EVENEMENTS[dernierType] || []
}

export function labelEvenement(type) {
  return EVENEMENTS_POINTAGE.find((evenement) => evenement.value === type)?.label || type || '—'
}

// ---- Demande de congé ----
// Confirmed against com.project.backend.conge.DemandeConge:
// the first day is `dateDeDebut` (not `dateDebut`).
export const DEMANDE_CONGE_FIELDS = {
  id: 'id',
  numeroMatricule: 'numeroMatricule',
  dateDeDebut: 'dateDeDebut',
  dateFin: 'dateFin',
  typeConge: 'typeConge',
  motif: 'motif',
  status: 'status',
  motifRefus: 'motifRefus',
  dateDeDemande: 'dateDeDemande',
}

// ---- Bulletin de paie ----
export const BULLETIN_FIELDS = {
  id: 'id',
  numeroMatricule: 'numeroMatricule',
  mois: 'mois',
  anne: 'anne',
  salaireBase: 'salaireBase',
  salaireBrut: 'salaireBrut',
  totalPrimes: 'totalPrimes',
}

// Fields marked CONFIRMED have been verified against the OpenAPI doc.
export const CONTRACT_STATUS = {
  EMPLOYE: 'ASSUMED',
  SOLDE_CONGE: 'CONFIRMED',
  POINTAGE: 'ASSUMED',
  DEMANDE_CONGE: 'CONFIRMED',
  BULLETIN: 'ASSUMED',
}
