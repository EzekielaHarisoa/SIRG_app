import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'
import FormField from '../../components/ui/FormField.jsx'
import Button from '../../components/ui/Button.jsx'
import { roleHomePath } from '../../components/layout/ProtectedRoute.jsx'
import { ApiError } from '../../services/api.js'

function loginErrorMessage(error) {
  if (error instanceof ApiError) {
    if (error.status === 401) return 'Login ou mot de passe incorrect.'
    if (error.status === 0) {
      return 'Serveur injoignable. Vérifiez que le backend Spring Boot est démarré sur le port 8080.'
    }
  }
  return error?.message || 'Une erreur est survenue lors de la connexion.'
}

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()

  const [loginField, setLoginField] = useState('')
  const [motDePasse, setMotDePasse] = useState('')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e) => {
    e.preventDefault()
    if (loading) return

    setError(null)
    setLoading(true)
    try {
      const session = await login({
        login: loginField.trim(),
        motDePasse,
      })
      navigate(roleHomePath(session.role), { replace: true })
    } catch (err) {
      setError(err)
      setLoading(false)
    }
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
            autoComplete="username"
            placeholder="Identifiant"
          />
          <FormField
            label="Mot de passe"
            name="motDePasse"
            type="password"
            value={motDePasse}
            onChange={(e) => setMotDePasse(e.target.value)}
            required
            autoComplete="current-password"
          />

          <div aria-live="polite">
            {error && (
              <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                {loginErrorMessage(error)}
              </div>
            )}
          </div>

          <Button type="submit" variant="primary" className="w-full" loading={loading} disabled={loading}>
            {loading ? 'Connexion…' : 'Se connecter'}
          </Button>
        </form>
      </div>
    </div>
  )
}
