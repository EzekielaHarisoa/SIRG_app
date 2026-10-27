
import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const roleConfig = {
  EMPLOYE: {
    title: "Espace employé",
    description: "Gestion personnelle",
    links: [
      { label: "Tableau de bord", path: "/employe", end: true },
      { label: "Mes pointages", path: "/employe/pointages" },
      { label: "Mes congés", path: "/employe/conges" },
      { label: "Mes bulletins", path: "/employe/bulletins" },
      { label: "Mon solde de congés", path: "/employe/solde" },
    ],
  },

  RH: {
    title: "Espace Ressources humaines",
    description: "Administration du personnel",
    links: [
      { label: "Tableau de bord", path: "/rh", end: true },
      { label: "Employés", path: "/rh/employes" },
      { label: "Pointages", path: "/rh/pointages" },
      { label: "Demandes de congé", path: "/rh/conges" },
      { label: "Soldes de congés", path: "/rh/soldes" },
    ],
  },

  COMPTABLE: {
    title: "Espace comptable",
    description: "Gestion de la paie",
    links: [
      { label: "Tableau de bord", path: "/comptable", end: true },
      { label: "Bulletins de paie", path: "/comptable/bulletins" },
    ],
  },
};

function getRoleKey(role) {
  const normalizedRole = String(role ?? "")
    .trim()
    .toUpperCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

  const aliases = {
    EMPLOYE: "EMPLOYE",
    EMPLOYEE: "EMPLOYE",
    RH: "RH",
    COMPTABLE: "COMPTABLE",
    ACCOUNTANT: "COMPTABLE",
  };

  return aliases[normalizedRole] ?? null;
}

export default function RoleLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const role = getRoleKey(user?.role ?? user?.profil);
  const config = role ? roleConfig[role] : null;

  function handleLogout() {
    logout();
    navigate("/login", { replace: true });
  }

  if (!config) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
        <section className="max-w-md rounded-lg border border-slate-200 bg-white p-6">
          <h1 className="text-lg font-semibold text-slate-900">
            Accès indisponible
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            Aucun espace ne correspond au rôle associé à cet utilisateur.
          </p>
          <button
            type="button"
            onClick={handleLogout}
            className="mt-5 rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700"
          >
            Retour à la connexion
          </button>
        </section>
      </main>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {sidebarOpen && (
        <button
          type="button"
          aria-label="Fermer le menu"
          className="fixed inset-0 z-40 bg-black/30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-slate-200 bg-white transition-transform duration-200 lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-16 items-center border-b border-slate-200 px-5">
          <div className="flex h-9 w-9 items-center justify-center rounded-md bg-slate-900 text-sm font-bold text-white">
            S
          </div>

          <div className="ml-3">
            <p className="font-semibold tracking-tight">SIRG</p>
            <p className="text-xs text-slate-500">Gestion RH et paie</p>
          </div>

          <button
            type="button"
            aria-label="Fermer le menu"
            onClick={() => setSidebarOpen(false)}
            className="ml-auto rounded-md p-2 text-slate-500 hover:bg-slate-100 lg:hidden"
          >
            ✕
          </button>
        </div>

        <div className="border-b border-slate-200 px-5 py-4">
          <p className="text-sm font-semibold">{config.title}</p>
          <p className="mt-1 text-xs text-slate-500">
            {config.description}
          </p>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto p-3">
          <p className="px-3 pb-2 pt-1 text-xs font-semibold uppercase tracking-wider text-slate-400">
            Navigation
          </p>

          {config.links.map((link) => (
            <NavLink
              key={link.path}
              to={link.path}
              end={link.end}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `block rounded-md px-3 py-2.5 text-sm transition-colors ${
                  isActive
                    ? "bg-slate-900 font-medium text-white"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-slate-200 p-4">
          <div className="mb-3 truncate text-sm">
            <p className="font-medium">
              {user?.nomEtPrenoms ?? user?.login ?? "Utilisateur"}
            </p>
            <p className="mt-1 text-xs text-slate-500">{config.title}</p>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="w-full rounded-md border border-slate-200 px-3 py-2 text-left text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Se déconnecter
          </button>
        </div>
      </aside>

      <div className="min-h-screen lg:pl-64">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <button
              type="button"
              aria-label="Ouvrir le menu"
              onClick={() => setSidebarOpen(true)}
              className="rounded-md border border-slate-200 px-3 py-2 text-sm hover:bg-slate-50 lg:hidden"
            >
              ☰
            </button>

            <div>
              <p className="text-sm font-semibold">{config.title}</p>
              <p className="hidden text-xs text-slate-500 sm:block">
                Système intégré de gestion des ressources humaines et de paie
              </p>
            </div>
          </div>

          <span className="rounded-md bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-700">
            {role}
          </span>
        </header>

        <main className="mx-auto w-full max-w-screen-2xl p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
