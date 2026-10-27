const MONTHS_FR = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre',
]

export function formatCell(value) {
  if (value === null || value === undefined || value === '') return '—'

  if (typeof value === 'boolean') return value ? 'Oui' : 'Non'

  if (typeof value === 'number') {
    return new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 2 }).format(value)
  }

  if (typeof value === 'string') {
    // ISO date (YYYY-MM-DD)
    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
      const [y, m, d] = value.split('-')
      return `${d}/${m}/${y}`
    }
    // ISO datetime
    if (/^\d{4}-\d{2}-\d{2}T/.test(value)) {
      return value.replace('T', ' ').slice(0, 16)
    }
    return value
  }

  if (Array.isArray(value)) return value.join(', ')
  if (typeof value === 'object') return JSON.stringify(value)

  return String(value)
}

export function formatMontant(value) {
  if (value === null || value === undefined || value === '') return '—'
  const num = typeof value === 'number' ? value : parseFloat(value)
  if (Number.isNaN(num)) return formatCell(value)
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 2,
  }).format(num)
}

export function formatDate(value) {
  if (!value) return '—'
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const [y, m, d] = value.split('-')
    return `${d}/${m}/${y}`
  }
  return formatCell(value)
}

export function toTitle(name) {
  if (!name || typeof name !== 'string') return ''
  // camelCase -> spaces
  let out = name.replace(/([a-z])([A-Z])/g, '$1 $2')
  // underscores/points -> spaces
  out = out.replace(/[_\\.]/g, ' ')
  // collapse spaces
  out = out.replace(/\s+/g, ' ').trim()
  if (!out) return name
  // common French abbreviations / special words
  const known = {
    id: 'ID',
    rh: 'RH',
    matricule: 'Matricule',
    email: 'Email',
    telephone: 'Téléphone',
    poste: 'Poste',
    salaire: 'Salaire',
    base: 'base',
    brut: 'brut',
    net: 'net',
    anne: 'Année',
    mois: 'Mois',
    date: 'Date',
    debut: 'début',
    fin: 'fin',
    type: 'Type',
    conge: 'congé',
    motif: 'Motif',
    arrivee: 'arrivée',
    depart: 'départ',
    heure: 'Heure',
    total: 'Total',
    primes: 'primes',
    solde: 'Solde',
    annuel: 'annuel',
    maladie: 'maladie',
    jours: 'Jours',
    pris: 'pris',
    departement: 'Département',
    nom: 'Nom',
    prenom: 'Prénom',
    numero: 'Numéro',
    matriculeemploye: 'Matricule employé',
    employe: 'Employé',
    statut: 'Statut',
  }
  const words = out.split(' ')
  const titled = words.map((w) => {
    const key = w.toLowerCase()
    if (known[key]) return known[key]
    return w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()
  })
  return titled.join(' ')
}

export function monthLabel(mois) {
  const num = typeof mois === 'string' ? parseInt(mois, 10) : mois
  if (!Number.isInteger(num) || num < 1 || num > 12) return formatCell(mois)
  return MONTHS_FR[num - 1]
}
