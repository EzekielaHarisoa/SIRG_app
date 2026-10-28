import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'
import { ROLES, ROLE_LABELS } from '../../config/contracts.js'
import FormField from '../../components/ui/FormField.jsx'
import Button from '../../components/ui/Button.jsx'
import { roleHomePath } from '../../components/layout/ProtectedRoute.jsx'

const ROLE_OPTIONS = [
  { value: ROLES.EMPLOYE, label: ROLE_LABELS[ROLES.EMPLOYE] },
  { value: ROLES.RH, label: ROLE_LABELS[ROLES.RH] },
  { value: ROLES.COMPTABLE, label: ROLE_LABELS[ROLES.COMPTABLE] },
]

export default function LoginPage() {
  const { login, previewRole } = useAuth()
  const navigate = useNavigate()

  const [loginField, setLoginField] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState(ROLES.EMPLOYE)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      await login({ login: loginField, password, role })
      navigate(roleHomePath(role), { replace: true })
    } catch (err) {
      setError(err)
      setLoading(false)
    }
  }

  const handlePreview = (r) => {
    previewRole(r)
    navigate(roleHomePath(r), { replace: true })
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-[400px]">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-lg bg-blue-700 text-lg font-bold text-white">S</div>
          <h1 className="text-2xl font-bold tracking-wide text-slate-900">SIRG</h1>
          <p className="mx-auto mt-1 max-w-sm text-sm leading-5 text-slate-500">
            Système intégré de gestion des ressources humaines et de paie
          </p>
        </div>

        <form
          onSubmit={handleLogin}
          className="space-y-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
        >
          <div className="mb-1">
            <h2 className="text-lg font-bold text-slate-900">Bienvenue</h2>
            <p className="mt-1 text-sm text-slate-500">Connectez-vous à votre espace de travail.</p>
          </div>
          <FormField
            label="Login"
            name="login"
            value={loginField}
            onChange={(e) => setLoginField(e.target.value)}
            required
            placeholder="Identifiant"
          />
          <FormField
            label="Mot de passe"
            name="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <FormField
            label="Rôle"
            name="role"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            options={ROLE_OPTIONS}
            required
          />

          {error && (
            <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {error.message || String(error)}
            </div>
          )}

          <Button type="submit" variant="primary" className="w-full" loading={loading}>
            Se connecter
          </Button>


        </form>

        <div className="mt-4 rounded-xl border border-slate-200 bg-white p-4">
          <div className="flex items-start gap-3">
            <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-sm text-blue-700" aria-hidden="true">i</span>
            <div>
              <p className="text-xs font-bold text-slate-700">Explorer les espaces</p>
              <p className="mt-1 text-xs leading-5 text-slate-500">
                Prévisualisation de développement — non sécurisée, sans connexion réelle.
              </p>
            </div>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {ROLE_OPTIONS.map((r) => (
              <Button
                key={r.value}
                variant="secondary"
                size="sm"
                onClick={() => handlePreview(r.value)}
              >
                {r.label}
              </Button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
