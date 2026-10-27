// Opens a print-friendly window with the bulletin details.
// Renders only the confirmed fields so we never print fabricated values.
import { formatCell, formatMontant, monthLabel } from './format.js'
import { BULLETIN_FIELDS as F } from '../config/contracts.js'

export function printBulletin(bulletin, extra = {}) {
  if (!bulletin) return
  const win = window.open('', '_blank', 'width=800,height=600')
  if (!win) return
  const rows = [
    ['Matricule', formatCell(bulletin[F.numeroMatricule])],
    ['Mois', monthLabel(bulletin[F.mois])],
    ['Année', formatCell(bulletin[F.anne])],
    ['Salaire de base', formatMontant(bulletin[F.salaireBase])],
    ['Salaire brut', formatMontant(extra.salaireBrut ?? bulletin[F.salaireBrut])],
    ['Total des primes', formatMontant(extra.totalPrimes ?? bulletin[F.totalPrimes])],
  ]
  const body = rows
    .map(
      ([label, value]) =>
        `<tr><th style="text-align:left;padding:6px 12px;background:#f1f5f9">${label}</th><td style="padding:6px 12px">${value}</td></tr>`,
    )
    .join('')
  win.document.write(`<!doctype html><html lang="fr"><head><meta charset="utf-8"><title>Bulletin #${bulletin.id}</title>
    <style>body{font-family:Segoe UI,Inter,system-ui,sans-serif;padding:32px;color:#1f2937}
    h1{font-size:18px}table{width:100%;border-collapse:collapse;font-size:14px}
    tr{border-bottom:1px solid #e5e7eb}</style></head>
    <body><h1>Bulletin de paie #${formatCell(bulletin.id)}</h1>
    <table><tbody>${body}</tbody></table>
    <script>window.onload=function(){window.print()}</script></body></html>`)
  win.document.close()
}
