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
  // ASSUMED — confirm against OpenAPI /employe POST & PUT bodies.
  numeroMatricule: 'numeroMatricule',
  nom: 'nom',
  prenom: 'prenom',
  email: 'email',
  telephone: 'telephone',
  dateEmbauche: 'dateEmbauche',
  poste: 'poste',
  salaireBase: 'salaireBase',
  departement: 'departement',
}

// ---- Solde de congé ----
export const SOLDE_CONGE_FIELDS = {
  numeroMatricule: 'numeroMatricule',
  anne: 'anne',
  soldeAnnuel: 'soldeAnnuel',
  soldeMaladie: 'soldeMaladie',
  joursPris: 'joursPris',
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
export const DEMANDE_CONGE_FIELDS = {
  numeroMatricule: 'numeroMatricule',
  dateDebut: 'dateDebut',
  dateFin: 'dateFin',
  typeConge: 'typeConge',
  motif: 'motif',
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
  SOLDE_CONGE: 'ASSUMED',
  POINTAGE: 'ASSUMED',
  DEMANDE_CONGE: 'ASSUMED',
  BULLETIN: 'ASSUMED',
}
