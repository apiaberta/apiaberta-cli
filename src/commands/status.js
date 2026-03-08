import { api } from '../api.js'
import { header, dim, bold, green, red, yellow } from '../format.js'

function statusIcon(s) {
  if (s === 'up')   return green('✔')
  if (s === 'down') return red('✖')
  return yellow('?')
}

export async function status(args) {
  const json = args['--json'] || args['-j']
  const data = await api.status()
  if (json) return console.log(JSON.stringify(data, null, 2))

  header('API Aberta — Status')

  const gw = data.gateway || {}
  const gwStatus = gw.status === 'up' ? green('online') : red('offline')
  console.log(`  Gateway ${gwStatus}  v${gw.version || '?'}  uptime ${fmt_uptime(gw.uptime_s)}`)
  console.log()

  const services = data.services || []
  for (const svc of services) {
    const icon    = statusIcon(svc.status)
    const latency = svc.latency_ms != null ? dim(` ${svc.latency_ms}ms`) : ''
    const prefix  = dim(svc.prefix || '')
    console.log(`  ${icon} ${bold(svc.name.padEnd(30))} ${prefix}${latency}`)
  }

  const overall = data.status === 'ok' ? green('All systems operational') : yellow('Some services degraded')
  console.log()
  console.log(`  ${overall}`)
  console.log(dim(`  Checked at: ${new Date(data.checked_at).toLocaleString('pt-PT')}`))
  console.log()
}

function fmt_uptime(seconds) {
  if (!seconds) return 'n/a'
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  if (h > 24) return `${Math.floor(h / 24)}d ${h % 24}h`
  return `${h}h ${m}m`
}
