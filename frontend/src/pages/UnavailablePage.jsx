export default function UnavailablePage({ title = 'Fonctionnalité indisponible', reason }) {
  return (
    <div className="rounded-md border border-amber-200 bg-amber-50 p-6">
      <h2 className="text-base font-semibold text-amber-800">{title}</h2>
      <p className="mt-2 text-sm text-amber-700">
        {reason ||
          "Cette fonctionnalité nest pas encore disponible. Elle est en attente dun endpoint backend ou de la confirmation du schéma JSON."}
      </p>
    </div>
  )
}
