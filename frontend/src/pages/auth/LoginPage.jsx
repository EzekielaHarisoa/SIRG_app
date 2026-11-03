import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'
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

const inputClass =
  'mt-1.5 block w-full rounded-sm border border-slate-300 bg-white px-3 py-2 text-[13px] text-slate-900 placeholder:text-slate-400 focus:border-[#2B5CB8] focus:outline-none focus:ring-2 focus:ring-[#2B5CB8]/20'

function Illustration() {
  const line = { fill: 'none', stroke: '#5F8FE0', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' }
  const qr = [
    [326, 400], [346, 400], [366, 410], [326, 420], [346, 430], [366, 440],
    [296, 450], [316, 460], [336, 450], [356, 470], [376, 460], [296, 480],
    [326, 490], [346, 500], [376, 490], [366, 510], [396, 500], [396, 440],
  ]
  return (
    <svg viewBox="0 0 700 820" className="h-full max-h-[62vh] w-full" aria-hidden="true">
      {/* Pictogrammes en traits */}
      <g {...line}>
        {/* horloge */}
        <circle cx="110" cy="130" r="42" />
        <path d="M110 105v26l18 12" />
        {/* badge employé */}
        <rect x="250" y="80" width="72" height="104" rx="3" />
        <circle cx="286" cy="115" r="14" />
        <path d="M262 160q24-26 48 0" />
        {/* mini QR */}
        <rect x="430" y="90" width="64" height="64" rx="2" />
        <rect x="442" y="102" width="14" height="14" />
        <rect x="468" y="102" width="14" height="14" />
        <rect x="442" y="128" width="14" height="14" />
        <path d="M468 130h14M475 130v14" />
        {/* document */}
        <path d="M570 90h56l22 22v78H570z" />
        <path d="M626 90v22h22M584 138h50M584 158h50M584 178h30" />
        {/* symboles dispersés */}
        <path d="M200 60l9 9M209 60l-9 9" />
        <path d="M370 50l9 9M379 50l-9 9" />
        <path d="M540 50l9 9M549 50l-9 9" />
        <path d="M660 250l9 9M669 250l-9 9" />
        <path d="M60 250l9 9M69 250l-9 9" />
        <path d="M200 270l9 9M209 270l-9 9" />
        <path d="M580 300l9 9M589 300l-9 9" />
        <circle cx="170" cy="200" r="6" />
        <circle cx="400" cy="130" r="6" />
        <circle cx="530" cy="200" r="6" />
        <circle cx="640" cy="60" r="7" />
        <circle cx="330" cy="250" r="6" />
        <circle cx="490" cy="270" r="6" />
        <circle cx="40" cy="330" r="6" />
        <circle cx="670" cy="340" r="6" />
        <path d="M120 230h26M350 200h26M520 240h26M240 230h22M620 215h26" />
      </g>

      {/* Lignes de liaison */}
      <path d="M212 500h24M464 500h26" stroke="#fff" strokeWidth="2" strokeDasharray="4 6" strokeLinecap="round" />

      {/* Téléphone : bordure claire + corps noir */}
      <rect x="249" y="304" width="230" height="450" rx="12" fill="#D3E3FC" />
      <rect x="235" y="290" width="230" height="450" rx="12" fill="#000" />
      <rect x="250" y="310" width="200" height="410" rx="8" fill="#fff" />
      <rect x="320" y="296" width="60" height="8" rx="4" fill="#2a2a2a" />

      {/* En-tête de l'écran */}
      <rect x="275" y="335" width="90" height="10" rx="2" fill="#1F3F8F" />
      <rect x="275" y="355" width="60" height="8" rx="4" fill="#D3E3FC" />

      {/* QR code */}
      <g>
        {[[290, 400], [374, 400], [290, 484]].map(([x, y]) => (
          <g key={`${x}-${y}`}>
            <rect x={x} y={y} width="36" height="36" rx="3" fill="none" stroke="#000" strokeWidth="5" />
            <rect x={x + 11} y={y + 11} width="14" height="14" fill="#000" />
          </g>
        ))}
        {qr.map(([x, y]) => (
          <rect key={`${x}-${y}`} x={x} y={y} width="10" height="10" fill="#000" />
        ))}
      </g>
      {/* Cadre de scan + ligne */}
      <path
        d="M274 428v-30a6 6 0 016-6h30M426 392h30a6 6 0 016 6v30M462 508v30a6 6 0 01-6 6h-30M310 544h-30a6 6 0 01-6-6v-30"
        transform="translate(-12 0)"
        stroke="#2B5CB8"
        strokeWidth="4"
        fill="none"
        strokeLinecap="round"
      />
      <rect x="276" y="462" width="148" height="4" rx="2" fill="#8DB2EE" />

      {/* Validation du pointage */}
      <circle cx="350" cy="640" r="30" fill="#1F3F8F" />
      <path d="M335 641l10 10 21-22" stroke="#fff" strokeWidth="4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <rect x="305" y="682" width="90" height="8" rx="4" fill="#D3E3FC" />

      {/* Calendrier (congés) */}
      <rect x="30" y="420" width="180" height="170" rx="5" fill="#fff" />
      <path d="M30 434a14 14 0 0114-14h152a14 14 0 0114 14v26H30z" fill="#1F3F8F" />
      <rect x="68" y="408" width="9" height="26" rx="2" fill="#D3E3FC" />
      <rect x="163" y="408" width="9" height="26" rx="2" fill="#D3E3FC" />
      {[0, 1, 2].map((j) =>
        [0, 1, 2, 3].map((i) => (
          <circle key={`${i}-${j}`} cx={60 + i * 40} cy={492 + j * 34} r="6" fill="#D3E3FC" />
        ))
      )}
      <circle cx="100" cy="526" r="15" fill="#8DB2EE" />
      <path d="M93 526l5 5 9-10" stroke="#fff" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="140" cy="526" r="15" fill="#8DB2EE" />
      <path d="M133 526l5 5 9-10" stroke="#fff" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" />

      {/* Fiche de paie */}
      <rect x="490" y="390" width="180" height="210" rx="5" fill="#fff" />
      <circle cx="526" cy="428" r="16" fill="#1F3F8F" />
      <rect x="552" y="418" width="80" height="8" rx="4" fill="#1F3F8F" />
      <rect x="552" y="434" width="50" height="7" rx="3.5" fill="#D3E3FC" />
      <rect x="512" y="470" width="136" height="7" rx="3.5" fill="#D3E3FC" />
      <rect x="512" y="490" width="136" height="7" rx="3.5" fill="#D3E3FC" />
      <rect x="512" y="510" width="96" height="7" rx="3.5" fill="#D3E3FC" />
      <rect x="512" y="556" width="136" height="24" rx="4" fill="#1F3F8F" />
      <rect x="528" y="564" width="50" height="8" rx="4" fill="#fff" />

      {/* Pièce de monnaie */}
      <circle cx="650" cy="620" r="36" fill="#D3E3FC" stroke="#fff" strokeWidth="2" />
      <circle cx="650" cy="620" r="24" fill="none" stroke="#1F3F8F" strokeWidth="2.5" />
      <text x="650" y="629" textAnchor="middle" fontSize="22" fontWeight="700" fill="#1F3F8F" fontFamily="sans-serif">
        Ar
      </text>

      {/* Ondulations et cercles */}
      <path d="M470 700q18-20 36 0t36 0 36 0 36 0" stroke="#fff" strokeWidth="2" fill="none" strokeLinecap="round" />
      <path d="M20 700q18-20 36 0t36 0 36 0" stroke="#fff" strokeWidth="2" fill="none" strokeLinecap="round" />
      <g fill="none" stroke="#fff" strokeWidth="2">
        <circle cx="560" cy="350" r="12" />
        <circle cx="596" cy="350" r="8" />
        <circle cx="626" cy="350" r="8" />
      </g>

      {/* Sol */}
      <path d="M60 790h580" stroke="#D3E3FC" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
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
    <div className="grid min-h-screen grid-cols-1 bg-white lg:grid-cols-2">
      {/* Gauche : formulaire */}
      <div className="flex flex-col px-6 py-6 sm:px-8">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="grid h-6 w-6 grid-cols-2 gap-[3px]" aria-hidden="true">
            <span className="rounded-[2px] bg-[#2B5CB8]" />
            <span className="rotate-45 scale-75 rounded-[2px] bg-[#8DB2EE]" />
            <span className="rounded-[2px] bg-[#2B5CB8]" />
            <span className="rounded-[2px] bg-[#2B5CB8]" />
          </div>
          <span className="font-serif text-[18px] leading-none tracking-tight text-slate-900">SIRG</span>
        </div>

        <div className="flex flex-1 items-center">
          <div className="mx-auto w-full max-w-[300px] py-8">
            <h1 className="text-2xl font-extrabold leading-tight text-black">Bienvenue</h1>
            <p className="mt-1 text-[13px] text-slate-500">Connectez-vous à votre espace de travail.</p>

            <form onSubmit={handleLogin} className="mt-6">
              <div>
                <label htmlFor="login" className="text-[13px] text-slate-900">
                  Login
                </label>
                <input
                  id="login"
                  name="login"
                  type="text"
                  value={loginField}
                  onChange={(e) => setLoginField(e.target.value)}
                  required
                  autoComplete="username"
                  placeholder="Identifiant"
                  className={inputClass}
                />
              </div>

              <div className="mt-4">
                <label htmlFor="motDePasse" className="text-[13px] text-slate-900">
                  Mot de passe
                </label>
                <input
                  id="motDePasse"
                  name="motDePasse"
                  type="password"
                  value={motDePasse}
                  onChange={(e) => setMotDePasse(e.target.value)}
                  required
                  autoComplete="current-password"
                  className={inputClass}
                />
              </div>

              <div aria-live="polite">
                {error && (
                  <div className="mt-4 rounded-sm border border-red-200 bg-red-50 p-2 text-xs text-red-700">
                    {loginErrorMessage(error)}
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="mt-5 flex w-full items-center justify-center gap-2 rounded-sm bg-[#2B5CB8] py-2 text-[13px] font-medium text-white transition-colors hover:bg-[#234C9A] focus:outline-none focus:ring-2 focus:ring-[#2B5CB8]/40 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {loading && (
                  <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25" />
                    <path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
                  </svg>
                )}
                {loading ? 'Connexion…' : 'Se connecter'}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Droite : aplat lavande + illustration */}
      <div className="hidden items-center justify-center bg-[#8DB2EE] p-10 lg:flex">
        <Illustration />
      </div>
    </div>
  )
}