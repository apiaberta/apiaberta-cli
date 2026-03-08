import { api } from '../api.js'
import { header, dim, bold, red, yellow, green } from '../format.js'

function severity(type) {
  const t = (type || '').toLowerCase()
  if (t.includes('incêndio') || t.includes('fire') || t.includes('major')) return red('🔴 CRÍTICO')
  if (t.includes('aviso')    || t.includes('warn') || t.includes('medium')) return yellow('🟡 AVISO')
  return green('🟢 INFO')
}

export async function incidents(args) {
  const type   = args['--type']   || args['-t'] || null
  const limit  = parseInt(args['--limit'] || args['-n'] || '10')
  const json   = args['--json']   || args['-j']

  const params = { limit }
  if (type) params.type = type

  const data = await api.anpcIncidents(params)
  if (json) return console.log(JSON.stringify(data, null, 2))

  const items = data.data || data.incidents || []
  const meta  = data.meta || {}

  header(`Proteção Civil — Ocorrências em tempo real`)

  if (meta.total != null) {
    console.log(dim(`  ${meta.total} ocorrências activas   Fonte: ANEPC / fogos.pt`))
    console.log()
  }

  if (!items.length) {
    console.log(dim('  Sem ocorrências activas.'))
    console.log()
    return
  }

  for (const inc of items.slice(0, limit)) {
    const label = inc.type || inc.natureza || inc.tipo || 'Ocorrência'
    const loc   = inc.location || inc.local || inc.municipio || ''
    const dist  = inc.district || inc.distrito || ''
    const time  = inc.date || inc.dataHora || inc.updated_at || ''
    const timeStr = time ? `  ${dim(new Date(time).toLocaleTimeString('pt-PT'))}` : ''

    const place = [loc, dist].filter(Boolean).join(', ')

    console.log(`  ${severity(label)}  ${bold(label)}`)
    if (place) console.log(`  ${dim('  📍 ' + place + timeStr)}`)
    console.log()
  }

  console.log(dim('  api.apiaberta.pt/v1/anpc/incidents'))
  console.log()
}
