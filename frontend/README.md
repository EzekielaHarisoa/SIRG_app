# SIRG — Frontend

Système Intégré de Gestion des Ressources Humaines — interface frontend React
destinée à se connecter à un backend Spring Boot existant (API REST, Oracle).

Ce projet ne contient **aucun backend** et **aucune donnée fictive**. Les données
métier proviennent exclusivement des API réelles du backend SIRG.

## Stack technique

- React (JavaScript, `.js` / `.jsx` — pas de TypeScript)
- Vite
- Tailwind CSS v4 (plugin `@tailwindcss/vite`)
- React Router
- Lucide React (icônes)
- `fetch` natif (pas d'Axios)

## Installation

```bash
npm install
```

## Démarrage

```bash
npm run dev
```

Le frontend est servi sur `http://localhost:5173`.

## Construction

```bash
npm run build
```

## Variables d'environnement

Copiez `.env.example` en `.env` et adaptez si nécessaire :

```bash
cp .env.example .env
```

| Variable             | Description                              | Valeur par défaut        |
| -------------------- | ---------------------------------------- | ------------------------ |
| `VITE_API_BASE_URL`  | URL de base du backend Spring Boot       | `http://localhost:8080`  |

## Architecture

```
src/
  components/
    layout/
      AppLayout.jsx      # Layout global (sidebar + header + contenu)
      Sidebar.jsx        # Navigation latérale
      Header.jsx         # En-tête avec titre et fil d'Ariane
    ui/
      Button.jsx         # Bouton réutilisable
      ConfirmDialog.jsx  # Boîte de confirmation
      DataTable.jsx      # Tableau de données générique
      EmptyState.jsx     # État vide
      ErrorState.jsx     # État d'erreur
      FormField.jsx      # Champ de formulaire étiqueté
      LoadingState.jsx   # État de chargement
      Modal.jsx          # Boîte de dialogue (formulaires, détails)
  pages/
    DashboardPage.jsx
    EmployesPage.jsx
    PointagesPage.jsx
    DemandesCongePage.jsx
    SoldesCongePage.jsx
    BulletinsPaiePage.jsx
    NotFoundPage.jsx
  services/
    api.js               # Client HTTP central (fetch, gestion erreurs, 204)
    employeService.js
    pointageService.js
    demandeCongeService.js
    soldeCongeService.js
    bulletinPaieService.js
  hooks/
    useApi.js            # Hook de récupération de données
  App.jsx                # Configuration du routeur
  main.jsx
  index.css              # Thème Tailwind CSS v4
```

## Endpoints connectés

### A. Employés — `employeService`

| Méthode | Endpoint                    | Fonction                |
| ------- | --------------------------- | ----------------------- |
| GET     | `/employe`                  | Lister les employés     |
| POST    | `/employe`                  | Créer un employé        |
| PUT     | `/employe/{numeroMatricule}`| Modifier un employé     |

Aucun endpoint DELETE n'existe — la suppression n'est pas proposée.

### B. Pointages — `pointageService`

| Méthode | Endpoint                                   | Fonction                  |
| ------- | ------------------------------------------ | ------------------------- |
| GET     | `/pointage`                                | Lister les pointages      |
| POST    | `/pointage`                                | Enregistrer un pointage   |
| GET     | `/pointage/filtreMatricule/{numeroMatricule}` | Filtrer par matricule  |
| GET     | `/pointage/filtreDate/{date}`              | Filtrer par date          |

Le backend calcule le retard et les heures supplémentaires : le formulaire de
création ne demande que les saisies brutes.

### C. Demandes de congé — `demandeCongeService`

| Méthode | Endpoint                                    | Fonction                     |
| ------- | ------------------------------------------- | ---------------------------- |
| GET     | `/demandeConge`                             | Lister les demandes          |
| POST    | `/demandeConge`                             | Créer une demande            |
| GET     | `/demandeConge/employe/{numeroMatricule}`   | Demandes d'un employé        |
| GET     | `/demandeConge/byId/{id}`                   | Consulter une demande        |

Aucun endpoint de modification ou de suppression n'existe.

### D. Soldes de congé — `soldeCongeService`

| Méthode | Endpoint                                      | Fonction                       |
| ------- | --------------------------------------------- | ------------------------------ |
| GET     | `/soldeConge/{numeroMatricule}`               | Solde d'un employé             |
| GET     | `/soldeConge/{numeroMatricule}/{anne}`        | Solde pour une année           |
| POST    | `/soldeConge`                                 | Créer un solde                 |
| PUT     | `/soldeConge`                                 | Modifier un solde              |

Le paramètre `anne` respecte le nom déclaré dans le backend.

### E. Bulletins de paie — `bulletinPaieService`

| Méthode | Endpoint                                       | Fonction                        |
| ------- | ---------------------------------------------- | ------------------------------- |
| GET     | `/api/bulletins`                               | Lister les bulletins            |
| POST    | `/api/bulletins`                               | Créer un bulletin               |
| GET     | `/api/bulletins/{id}`                          | Bulletin par id                 |
| GET     | `/api/bulletins/employe/{numeroMatricule}`     | Bulletins d'un employé          |
| GET     | `/api/bulletins/{id}/totalPrimes`              | Total des primes                |
| PUT     | `/api/bulletins/{id}/totalPrimes`              | Mettre à jour le total des primes |
| GET     | `/api/bulletins/{id}/salaireBrut`              | Salaire brut                    |
| PUT     | `/api/bulletins/{id}/salaireBrut`              | Mettre à jour le salaire brut   |

Le frontend ne recalcule pas les règles de paie : il affiche et met à jour les
valeurs via les endpoints du backend.

## Pages

| Page               | Route              | Fonctionnalités                                             |
| ------------------ | ------------------ | ----------------------------------------------------------- |
| Tableau de bord    | `/`                | Indicateurs réels (employés, pointages, demandes, bulletins) |
| Employés           | `/employes`        | Liste, création, modification (pas de suppression)          |
| Pointages          | `/pointages`       | Liste, filtres (matricule, date), création                  |
| Demandes de congé  | `/demandes-conge`  | Liste, filtre par employé, consultation, création           |
| Soldes de congé    | `/soldes-conge`    | Recherche par matricule + année, création, modification     |
| Bulletins de paie  | `/bulletins-paie`  | Liste, filtre par employé, détail, totalPrimes, salaireBrut |

## À vérifier avec Swagger

Les chemins d'endpoints ci-dessus correspondent aux contrôleurs réels du
backend. Les **noms et types des propriétés JSON** utilisés dans les formulaires
(`FIELD_DEFS`) et les colonnes doivent encore être confirmés à partir de la
documentation OpenAPI :

- Interface Swagger : `http://localhost:8080/swagger-ui/index.html`
- Document OpenAPI : `http://localhost:8080/v3/api-docs`

Pour chaque formulaire, ajustez le tableau `FIELD_DEFS` en haut du fichier de
page correspondant selon le schéma réel du backend. Les tableaux de listes sont
construits dynamiquement à partir des clés renvoyées par l'API, donc ils
s'adaptent automatiquement aux propriétés réelles.

Points spécifiques à confirmer :

- [ ] Schéma de requête POST `/employe` (champs de l'employé)
- [ ] Schéma de requête POST `/pointage` et format de date attendu
- [ ] Schéma de requête POST `/demandeConge`
- [ ] Schéma de requête POST/PUT `/soldeConge`
- [ ] Schéma de requête POST `/api/bulletins`
- [ ] Corps des requêtes PUT `/api/bulletins/{id}/totalPrimes` et `/salaireBrut`
- [ ] Authentification : n'ajouter un profil utilisateur dans le header que
      lorsqu'un endpoint d'authentification réel existe côté backend.

## CORS

Le frontend (port 5173) et le backend (port 8080) étant sur des origines
différentes, le backend Spring Boot doit autoriser le CORS pour
`http://localhost:5173`. Côté Spring Boot, ajoutez par exemple une configuration
`@CrossOrigin(origins = "http://localhost:5173")` sur les contrôleurs, ou une
configuration globale `WebMvcConfigurer` / `CorsConfigurationSource`.

Si le navigateur bloque les requêtes, vérifiez que les en-têtes
`Access-Control-Allow-Origin`, `Access-Control-Allow-Methods` et
`Access-Control-Allow-Headers` sont bien renvoyés par le backend.
