import { useEffect, useMemo, useRef, useState } from 'react'

import PageHeader from '../../components/ui/PageHeader.jsx'
import Button from '../../components/ui/Button.jsx'
import FormField from '../../components/ui/FormField.jsx'
import EmptyState from '../../components/ui/EmptyState.jsx'
import SoldeCongesPanel from '../../components/conges/SoldeCongesPanel.jsx'

import { getAllEmployes } from '../../services/employeService.js'
import { getSoldeGlobal, initialiserTranches } from '../../services/soldeCongeService.js'

export default function SoldesRHPage() {
  const [matricule, setMatricule] = useState('')
  const [matriculeActif, setMatriculeActif] = useState('')
  const [solde, setSolde] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const [employes, setEmployes] = useState([])
  const [initialisation, setInitialisation] = useState(false)
  const initialisationRef = useRef(false)
  const [message, setMessage] = useState(null)

  useEffect(() => {
    let annule = false
    getAllEmployes()
      .then((liste) => {
        if (!annule && Array.isArray(liste)) setEmployes(liste)
      })
      .catch(() => {
        /* la liste des noms est un confort d'affichage, pas une donnée critique */
      })
    return () => {
      annule = true
    }
  }, [])

  const nomEmploye = useMemo(() => {
    if (!matriculeActif) return null
    const trouve = employes.find((e) => String(e.numerMatricule) === String(matriculeActif))
    return trouve?.nomEtPrenoms || null
  }, [employes, matriculeActif])

  const charger = async (numero) => {
    const valeur = String(numero ?? '').trim()
    if (!valeur) return

    setLoading(true)
    setError(null)
    setMessage(null)
    setMatriculeActif(valeur)

    try {
      const data = await getSoldeGlobal(valeur)
      setSolde(data)
    } catch (err) {
      setSolde(null)
      setError(err)
    } finally {
      setLoading(false)
    }
  }

  const handleRechercher = (e) => {
    e.preventDefault()
    charger(matricule)
  }

  const handleInitialiser = async () => {
    if (!matriculeActif || initialisationRef.current) return
    initialisationRef.current = true
    setInitialisation(true)
    setMessage(null)
    setError(null)

    try {
      await initialiserTranches(matriculeActif)
      // `charger` remet le message à zéro : on l'affiche donc après le
      // rafraîchissement du solde.
      await charger(matriculeActif)
      setMessage(
        'Tranches initialisées pour le cycle courant. Les tranches déjà existantes ne sont pas dupliquées.',
      )
    } catch (err) {
      setError(err)
    } finally {
      initialisationRef.current = false
      setInitialisation(false)
    }
  }

  const tranches = Array.isArray(solde?.tranches) ? solde.tranches : []
  const aucuneTranche = !!solde && tranches.length === 0

  return (
    <div className="space-y-6">
      <PageHeader
        title="Soldes de congé"
        description="Consultez le solde global et les tranches d’un employé, ou ouvrez ses tranches du cycle."
      />

      <form
        onSubmit={handleRechercher}
        className="flex flex-col gap-3 rounded-lg border border-slate-200 bg-white px-5 py-4 sm:flex-row sm:items-end"
      >
        <div className="w-full sm:max-w-xs">
          <FormField
            label="Matricule de l’employé"
            name="matricule"
            type="number"
            value={matricule}
            onChange={(e) => setMatricule(e.target.value)}
            placeholder="Ex : 61"
            required
          />
        </div>
        <Button type="submit" variant="primary" loading={loading}>
          Consulter
        </Button>
      </form>

      {message && (
        <div
          role="status"
          className="rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800"
        >
          {message}
        </div>
      )}

      {error && (
        <div
          role="alert"
          className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          <p className="font-medium">Opération impossible</p>
          <p className="mt-1">{error.message || 'Erreur inconnue.'}</p>
        </div>
      )}

      {!matriculeActif ? (
        <EmptyState
          label="Aucun employé sélectionné"
          hint="Saisissez un matricule pour afficher son solde et ses tranches de congé."
        />
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
          <div className="lg:col-span-3">
            <SoldeCongesPanel
              solde={solde}
              loading={loading}
              error={null}
              title="Solde global"
              description={`Employé ${matriculeActif}${nomEmploye ? ` — ${nomEmploye}` : ''}`}
            />
          </div>

          <div className="space-y-6 lg:col-span-2">
            <section className="rounded-lg border border-slate-200 bg-white">
              <header className="border-b border-slate-100 px-5 py-3.5">
                <h2 className="text-sm font-semibold text-slate-900">Employé</h2>
                <p className="mt-0.5 text-xs text-slate-500">Identité rattachée au matricule.</p>
              </header>
              <dl className="divide-y divide-slate-100 px-5">
                <div className="flex items-center justify-between gap-3 py-2.5">
                  <dt className="text-sm text-slate-500">Nom</dt>
                  <dd className="text-sm font-medium text-slate-800">
                    {nomEmploye || 'Employé sélectionné'}
                  </dd>
                </div>
                <div className="flex items-center justify-between gap-3 py-2.5">
                  <dt className="text-sm text-slate-500">Matricule</dt>
                  <dd className="text-sm font-medium tabular-nums text-slate-800">
                    {matriculeActif}
                  </dd>
                </div>
                <div className="flex items-center justify-between gap-3 py-2.5">
                  <dt className="text-sm text-slate-500">Tranches</dt>
                  <dd className="text-sm font-medium tabular-nums text-slate-800">
                    {loading ? '—' : tranches.length}
                  </dd>
                </div>
              </dl>
            </section>

            <section className="rounded-lg border border-slate-200 bg-white">
              <header className="border-b border-slate-100 px-5 py-3.5">
                <h2 className="text-sm font-semibold text-slate-900">Cycle de congé</h2>
                <p className="mt-0.5 text-xs text-slate-500">
                  Ouverture des deux tranches de 15 jours.
                </p>
              </header>
              <div className="space-y-3 px-5 py-4">
                <Button
                  variant="secondary"
                  onClick={handleInitialiser}
                  loading={initialisation}
                  disabled={initialisation}
                  className="w-full sm:w-auto"
                >
                  Initialiser les tranches
                </Button>
                <p className="text-xs text-slate-500">
                  L’opération est sans effet si les tranches existent déjà. Elle est refusée tant que
                  l’employé n’a pas atteint son premier anniversaire d’embauche.
                </p>
                {aucuneTranche && !loading && (
                  <p className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
                    Aucune tranche enregistrée pour cet employé.
                  </p>
                )}
              </div>
            </section>
          </div>
        </div>
      )}
    </div>
  )
}
