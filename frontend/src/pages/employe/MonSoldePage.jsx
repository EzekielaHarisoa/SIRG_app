import { useState } from 'react'
import PageHeader from '../../components/ui/PageHeader.jsx'
import FormField from '../../components/ui/FormField.jsx'
import Button from '../../components/ui/Button.jsx'
import StatCard from '../../components/ui/StatCard.jsx'
import { getSoldeByMatricule, getSoldeByMatriculeAndYear } from '../../services/soldeCongeService.js'
import { SOLDE_CONGE_FIELDS as F } from '../../config/contracts.js'

export default function MonSoldePage() {
  const [matricule, setMatricule] = useState('')
  const [annee, setAnnee] = useState('')
  const [solde, setSolde] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const load = async (e) => {
    e?.preventDefault()
    if (!matricule) return
    setLoading(true)
    setError(null)
    setSolde(null)
    try {
      const data = annee
        ? await getSoldeByMatriculeAndYear(matricule, annee)
        : await getSoldeByMatricule(matricule)
      setSolde(data)
    } catch (err) {
      setError(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <PageHeader title="Mon solde de congé" description="Consultez votre solde de congé par matricule." />

      <p className="mb-4 rounded-md border border-slate-200 bg-white p-3 text-xs text-slate-500">
        Lidentité employé nétant pas vérifiée par le backend, saisissez votre matricule pour
        consulter votre propre solde.
      </p>

      <form onSubmit={load} className="mb-6 flex flex-wrap items-end gap-3 rounded-md border border-slate-200 bg-white p-4">
        <div className="min-w-[180px] flex-1">
          <FormField label="Matricule" name="matricule" value={matricule} onChange={(e) => setMatricule(e.target.value)} required />
        </div>
        <div className="min-w-[140px] flex-1">
          <FormField label="Année (optionnel)" name="annee" type="number" value={annee} onChange={(e) => setAnnee(e.target.value)} placeholder="Ex : 2026" />
        </div>
        <Button type="submit" variant="primary" loading={loading}>
          Consulter
        </Button>
      </form>

      {error && (
        <div className="mb-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error.message || String(error)}
        </div>
      )}

      {solde && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatCard label="Solde annuel" value={solde[F.soldeAnnuel]} />
          <StatCard label="Solde maladie" value={solde[F.soldeMaladie]} />
          <StatCard label="Jours pris" value={solde[F.joursPris]} />
        </div>
      )}
    </div>
  )
}
