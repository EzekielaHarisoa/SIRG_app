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
export const POINTAGE_FIELDS = {
  numeroMatricule: 'numeroMatricule',
  date: 'date',
  heureArrivee: 'heureArrivee',
  heureDepart: 'heureDepart',
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
