import { useState } from 'react'
import { useAuth } from '../../context/AuthContext.jsx'
import FormField from '../ui/FormField.jsx'
import Button from '../ui/Button.jsx'
import {
  DEMANDE_CONGE_FIELDS as F,
  TYPE_CONGE_OPTIONS,
  labelTypeConge,
} from '../../config/contracts.js'

const EMPTY = {
  [F.numeroMatricule]: '',
  [F.dateDeDebut]: '',
  [F.dateFin]: '',
  [F.typeConge]: '',
  [F.motif]: '',
}

function nombreDeJours(debut, fin) {
  if (!debut || !fin) return null
  const d = new Date(`${debut}T00:00:00`)
  const f = new Date(`${fin}T00:00:00`)
  if (Number.isNaN(d.getTime()) || Number.isNaN(f.getTime()) || f < d) return null
  return Math.round((f - d) / 86400000) + 1
}

/**
 * DemandeCongeForm — formulaire de demande de congé.
 *
 * mode="employee" : l'identité vient de la session, le matricule n'est jamais saisi.
 * mode="rh"       : le responsable saisit le matricule de l'employé concerné.
 *
 * Les règles de solde, de tranches et d'anniversaire restent appliquées par le
 * backend : ce formulaire ne fait que contraindre la saisie.
 */
export default function DemandeCongeForm({
  onSubmit,
  loading = false,
  error,
  initial,
  mode = 'employee',
  submitLabel = 'Envoyer la demande',
  onCancel,
}) {
  const { user } = useAuth()
  const isEmployee = mode === 'employee'

  const [form, setForm] = useState(() => ({ ...EMPTY, ...initial }))
  const [erreurs, setErreurs] = useState({})

  const matricule = isEmployee ? user?.numeroMatricule : form[F.numeroMatricule]
  const nombreJours = nombreDeJours(form[F.dateDeDebut], form[F.dateFin])

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
    setErreurs((prev) => (prev[name] ? { ...prev, [name]: undefined } : prev))
  }

  const valider = () => {
    const suivantes = {}

    if (!isEmployee) {
      const valeur = Number(form[F.numeroMatricule])
      if (!form[F.numeroMatricule] || !Number.isInteger(valeur) || valeur <= 0) {
        suivantes[F.numeroMatricule] = 'Saisissez un numéro matricule valide.'
      }
    }

    if (!form[F.typeConge]) {
      suivantes[F.typeConge] = 'Sélectionnez un type de congé.'
    }

    if (!form[F.dateDeDebut]) {
      suivantes[F.dateDeDebut] = 'La date de début est obligatoire.'
    }

    if (!form[F.dateFin]) {
      suivantes[F.dateFin] = 'La date de fin est obligatoire.'
    }

    if (form[F.dateDeDebut] && form[F.dateFin] && form[F.dateFin] < form[F.dateDeDebut]) {
      suivantes[F.dateFin] = 'La date de fin ne peut pas précéder la date de début.'
    }

    setErreurs(suivantes)
    return Object.keys(suivantes).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (loading) return
    if (!valider()) return

    const motif = form[F.motif].trim()

    onSubmit({
      [F.numeroMatricule]: Number(isEmployee ? user.numeroMatricule : form[F.numeroMatricule]),
      [F.typeConge]: form[F.typeConge],
      [F.dateDeDebut]: form[F.dateDeDebut],
      [F.dateFin]: form[F.dateFin],
      [F.motif]: motif || null,
    })
  }

  const matriculeAbsent = isEmployee && !user?.numeroMatricule

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      {isEmployee ? (
        <div className="flex flex-wrap items-baseline justify-between gap-2 rounded-md bg-slate-50 px-3 py-2.5">
          <p className="text-sm text-slate-700">
            Demande au nom de{' '}
            <span className="font-medium text-slate-900">
              {user?.nomEtPrenoms || user?.login || '—'}
            </span>
          </p>
          <p className="text-xs tabular-nums text-slate-500">
            Matricule {user?.numeroMatricule ?? 'indisponible'}
          </p>
        </div>
      ) : (
        <FormField
          label="Matricule de l’employé"
          name={F.numeroMatricule}
          type="number"
          value={form[F.numeroMatricule]}
          onChange={handleChange}
          error={erreurs[F.numeroMatricule]}
          placeholder="Ex : 61"
          disabled={loading}
          required
        />
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <FormField
          label="Type de congé"
          name={F.typeConge}
          value={form[F.typeConge]}
          onChange={handleChange}
          options={TYPE_CONGE_OPTIONS}
          error={erreurs[F.typeConge]}
          disabled={loading}
          required
        />

        <div className="flex flex-col justify-end">
          <p className="text-sm text-slate-600">
            {form[F.typeConge] ? labelTypeConge(form[F.typeConge]) : 'Type non sélectionné'}
          </p>
          <p className="mt-0.5 text-xs text-slate-500">
            {nombreJours
              ? `Période de ${nombreJours} jour${nombreJours > 1 ? 's' : ''} calendaire${nombreJours > 1 ? 's' : ''}.`
              : 'Renseignez les deux dates pour connaître la durée.'}
          </p>
        </div>

        <FormField
          label="Date de début"
          name={F.dateDeDebut}
          type="date"
          value={form[F.dateDeDebut]}
          onChange={handleChange}
          error={erreurs[F.dateDeDebut]}
          disabled={loading}
          required
        />

        <FormField
          label="Date de fin"
          name={F.dateFin}
          type="date"
          value={form[F.dateFin]}
          onChange={handleChange}
          error={erreurs[F.dateFin]}
          disabled={loading}
          required
        />
      </div>

      <FormField
        label="Motif"
        name={F.motif}
        value={form[F.motif]}
        onChange={handleChange}
        rows={3}
        placeholder="Précisez la raison de la demande (facultatif)."
        hint="255 caractères maximum."
        disabled={loading}
      />

      {erreurs.motif && <p className="text-xs text-red-600">{erreurs.motif}</p>}

      <p className="border-t border-slate-100 pt-3 text-xs text-slate-500">
        Le solde disponible, la priorité de consommation des tranches et la disponibilité des congés
        payés sont vérifiés par le serveur à l’acceptation de la demande.
      </p>

      {error && (
        <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
          {error.message || String(error)}
        </p>
      )}

      {matriculeAbsent && (
        <p className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
          Votre compte n’est rattaché à aucun matricule employé : la demande ne peut pas être
          envoyée. Contactez le service RH.
        </p>
      )}

      <div className="flex flex-col-reverse gap-2 border-t border-slate-100 pt-3 sm:flex-row sm:justify-end">
        {onCancel && (
          <Button variant="secondary" onClick={onCancel} disabled={loading}>
            Annuler
          </Button>
        )}
        <Button
          type="submit"
          variant="primary"
          loading={loading}
          disabled={loading || matriculeAbsent || !matricule}
        >
          {loading ? 'Envoi…' : submitLabel}
        </Button>
      </div>
    </form>
  )
}
