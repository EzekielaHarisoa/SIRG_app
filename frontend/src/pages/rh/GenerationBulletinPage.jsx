import { useState } from 'react'
import { Link } from 'react-router-dom'
import PageHeader from '../../components/ui/PageHeader.jsx'
import Button from '../../components/ui/Button.jsx'
import FormField from '../../components/ui/FormField.jsx'
import AsyncBoundary from '../../components/ui/AsyncBoundary.jsx'
import BulletinDetailPage from '../../components/paie/BulletinDetailPage.jsx'
import { useApi } from '../../hooks/useApi.js'
import { getAllEmployes } from '../../services/employeService.js'
import { genererBulletin, getSalaireDuPoste } from '../../services/bulletinPaieService.js'
import { formatDate, formatMontant, monthLabel } from '../../utils/format.js'

const MOIS = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre',
]

const AUJOURDHUI = new Date()
const A_ANNEES = Array.from({ length: 6 }, (_, i) => AUJOURDHUI.getFullYear() - 1 + i)

function etatInitial() {
  return {
    numeroMatricule: '',
    mois: String(AUJOURDHUI.getMonth() + 1),
    annee: String(AUJOURDHUI.getFullYear()),
    salaireDeBase: '',
    heuresSupplementaires: '',
    totalPrime: '',
    congeRestant: '',
  }
}

/** Dernier jour du mois de paie (le bulletin est émis ce jour-là), au format ISO. */
function dateEmission(annee, mois) {
  const dernierJour = new Date(Number(annee), Number(mois), 0).getDate()
  const moisTexte = String(mois).padStart(2, '0')
  return `${annee}-${moisTexte}-${String(dernierJour).padStart(2, '0')}`
}

/** « 1 234,5 » ou « 1234.5 » → 1234.5 ; vide → 0. */
function nombre(valeur) {
  const propre = String(valeur ?? '').replace(/\s/g, '').replace(',', '.')
  if (propre === '') return 0
  const n = Number(propre)
  return Number.isFinite(n) ? n : 0
}

/**
 * GenerationBulletinPage — espace du responsable RH : saisie de ce dont le
 * bulletin de paie a besoin (employé, mois, salaire de base, heures
 * supplémentaires, primes, congés restants) puis génération et impression.
 */
export default function GenerationBulletinPage() {
  const employes = useApi(() => getAllEmployes(), [])

  const [form, setForm] = useState(etatInitial)
  const [poste, setPoste] = useState(null)
  const [envoi, setEnvoi] = useState(false)
  const [error, setError] = useState(null)
  const [bulletin, setBulletin] = useState(null)

  const salaireBrut =
    nombre(form.salaireDeBase) + nombre(form.heuresSupplementaires) + nombre(form.totalPrime)

  const modifier = (champ) => (event) => {
    setForm((precedent) => ({ ...precedent, [champ]: event.target.value }))
    setError(null)
  }

  async function choisirEmploye(event) {
    const matricule = event.target.value
    setForm((precedent) => ({ ...precedent, numeroMatricule: matricule, salaireDeBase: '' }))
    setPoste(null)
    setBulletin(null)
    setError(null)
    if (!matricule) return

    try {
      const info = await getSalaireDuPoste(matricule)
      setPoste(info)
      if (info?.salaireDeBase !== null && info?.salaireDeBase !== undefined) {
        // Ne jamais écraser un montant déjà saisi, ni changer d'employé au passage.
        setForm((precedent) =>
          precedent.numeroMatricule === matricule && precedent.salaireDeBase === ''
            ? { ...precedent, salaireDeBase: String(info.salaireDeBase) }
            : precedent,
        )
      }
    } catch {
      // Poste introuvable : la saisie manuelle du salaire reste possible.
      setPoste(null)
    }
  }

  async function soumettre(event) {
    event.preventDefault()
    setError(null)

    if (!form.numeroMatricule) {
      setError('Sélectionnez l’employé concerné.')
      return
    }
    if (!(nombre(form.salaireDeBase) > 0)) {
      setError('Le salaire de base doit être supérieur à zéro.')
      return
    }

    setEnvoi(true)
    try {
      const cree = await genererBulletin({
        numeroMatricule: Number(form.numeroMatricule),
        mois: Number(form.mois),
        annee: Number(form.annee),
        salaireDeBase: nombre(form.salaireDeBase),
        heuresSupplementaires: nombre(form.heuresSupplementaires),
        totalPrime: nombre(form.totalPrime),
        congeRestant: nombre(form.congeRestant),
      })
      setBulletin(cree)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch (err) {
      setError(err?.message || 'La génération du bulletin a échoué.')
    } finally {
      setEnvoi(false)
    }
  }

  function nouveauBulletin() {
    setBulletin(null)
    setPoste(null)
    setError(null)
    setForm(etatInitial())
  }

  const optionsEmployes = (employes.data ?? []).map((employe) => ({
    value: employe.numerMatricule,
    label: `${employe.nomEtPrenoms} — matricule ${employe.numerMatricule}`,
  }))

  return (
    <div className="space-y-6">
      <PageHeader
        title="Générer un bulletin de paie"
        description="Créez le bulletin d’un employé à partir de son salaire de base, de ses heures supplémentaires, de ses primes et de son solde de congé."
        actions={
          <Link
            to="/rh/paie"
            className="inline-flex items-center rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Historique des bulletins
          </Link>
        }
      />

      {bulletin && (
        <section className="rounded-md border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-900">
          <p className="font-semibold">
            Bulletin #{bulletin.id} généré pour {monthLabel(bulletin.mois)} {bulletin.anne}.
          </p>
          <p className="mt-1">
            Salaire brut {formatMontant(bulletin.salaireBrute)} · net à payer{' '}
            {formatMontant(bulletin.salaireNet)} · coût employeur{' '}
            {formatMontant(bulletin.coutGlobale)}.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button variant="secondary" size="sm" onClick={() => window.print()}>
              Imprimer / PDF
            </Button>
            <Button variant="ghost" size="sm" onClick={nouveauBulletin}>
              Nouveau bulletin
            </Button>
          </div>
        </section>
      )}

      {!bulletin && (
        <AsyncBoundary
          loading={employes.loading}
          error={employes.error}
          data={employes.data}
          onRetry={employes.refetch}
          emptyLabel="Aucun employé enregistré : ajoutez un employé avant de générer un bulletin."
        >
          {(liste) => (
            <form
              onSubmit={soumettre}
              className="rounded-md border border-slate-200 bg-white"
            >
              <div className="border-b border-slate-200 px-4 py-3">
                <h2 className="text-sm font-semibold text-slate-800">Éléments du bulletin</h2>
                <p className="mt-0.5 text-xs text-slate-500">
                  Le bulletin couvre le mois choisi et la fiche de paie est calculée automatiquement
                  à partir du référentiel de cotisations.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-4 px-4 py-4 sm:grid-cols-2">
                <FormField
                  label="Employé"
                  name="numeroMatricule"
                  required
                  value={form.numeroMatricule}
                  onChange={choisirEmploye}
                  options={optionsEmployes}
                  hint={
                    poste
                      ? `Poste : ${poste.titre || poste.emploi || '—'}${poste.qualification ? ` · ${poste.qualification}` : ''}`
                      : `${liste.length} employé(s) disponible(s)`
                  }
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    label="Mois de paie"
                    name="mois"
                    required
                    value={form.mois}
                    onChange={modifier('mois')}
                    options={MOIS.map((label, index) => ({ value: index + 1, label }))}
                  />
                  <FormField
                    label="Année"
                    name="annee"
                    type="number"
                    required
                    value={form.annee}
                    onChange={modifier('annee')}
                    options={A_ANNEES.map((annee) => ({ value: annee, label: String(annee) }))}
                  />
                </div>

                <FormField
                  label="Salaire de base"
                  name="salaireDeBase"
                  type="number"
                  required
                  value={form.salaireDeBase}
                  onChange={modifier('salaireDeBase')}
                  placeholder="0,00"
                  hint={
                    poste?.salaireDeBase !== null && poste?.salaireDeBase !== undefined
                      ? `Salaire prévu par le poste : ${formatMontant(poste.salaireDeBase)}`
                      : 'Salaire mensuel brut de base'
                  }
                />

                <FormField
                  label="Heures supplémentaires (montant brut)"
                  name="heuresSupplementaires"
                  type="number"
                  value={form.heuresSupplementaires}
                  onChange={modifier('heuresSupplementaires')}
                  placeholder="0,00"
                  hint="Montant en euros ajouté au salaire brut"
                />

                <FormField
                  label="Primes et indemnités"
                  name="totalPrime"
                  type="number"
                  value={form.totalPrime}
                  onChange={modifier('totalPrime')}
                  placeholder="0,00"
                  hint="Total des primes de la période, en euros"
                />

                <FormField
                  label="Congés restants (jours)"
                  name="congeRestant"
                  type="number"
                  value={form.congeRestant}
                  onChange={modifier('congeRestant')}
                  placeholder="0"
                  hint="Solde de congé reporté sur le bulletin"
                />
              </div>

              <div className="flex flex-col gap-3 border-t border-slate-200 bg-slate-50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="text-sm text-slate-700">
                  <p>
                    Période : <strong>{monthLabel(Number(form.mois))} {form.annee}</strong>
                    <span className="ml-3">
                      Émission le <strong>{formatDate(dateEmission(form.annee, form.mois))}</strong>
                    </span>
                  </p>
                  <p className="mt-0.5 text-xs text-slate-500">
                    Salaire brut estimé : {formatMontant(salaireBrut)}
                  </p>
                </div>
                <Button type="submit" loading={envoi} disabled={envoi}>
                  Générer le bulletin
                </Button>
              </div>

              {error && (
                <p className="border-t border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
                  {error}
                </p>
              )}
            </form>
          )}
        </AsyncBoundary>
      )}

      {bulletin && (
        <section className="space-y-3">
          <h2 className="text-base font-semibold text-slate-800">
            Fiche de paie du bulletin #{bulletin.id}
          </h2>
          <BulletinDetailPage
            bulletinId={bulletin.id}
            onPrint={() => window.print()}
            onClose={nouveauBulletin}
          />
        </section>
      )}
    </div>
  )
}
