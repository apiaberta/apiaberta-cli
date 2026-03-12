import { api } from '../api.js'
import { header, bold, dim, cyan, green } from '../format.js'

export async function bdpRates(args) {
  const json = args['--json'] || args['-j']
  const data = await api.bdpRates()
  if (json) return console.log(JSON.stringify(data, null, 2))

  const rates = data.data || []
  header('Banco de Portugal — Taxas de Juro BCE')

  for (const r of rates) {
    const date = r.ref_date ? dim(` (${r.ref_date.slice(0, 10)})`) : ''
    const val  = r.value != null ? green(`${r.value.toFixed(2)}%`) : dim('n/d')
    console.log(`  ${bold(cyan((r.label_pt || r.label || r.key).padEnd(60)))} ${val}${date}`)
  }

  console.log()
  console.log(dim('  Fonte: Banco de Portugal BPstat  |  api.apiaberta.pt/v1/bdp/rates'))
  console.log()
}

export async function bdpLendingRates(args) {
  const json = args['--json'] || args['-j']
  const data = await api.bdpLendingRates()
  if (json) return console.log(JSON.stringify(data, null, 2))

  const rates = data.data || []
  header('Banco de Portugal — Taxas de Crédito e Depósitos')

  for (const r of rates) {
    const date = r.ref_date ? dim(` (${r.ref_date.slice(0, 10)})`) : ''
    const val  = r.value != null ? green(`${r.value.toFixed(2)}%`) : dim('n/d')
    console.log(`  ${bold((r.label_pt || r.label || r.key).padEnd(60))} ${val}${date}`)
  }

  console.log()
  console.log(dim('  Fonte: Banco de Portugal BPstat  |  api.apiaberta.pt/v1/bdp/lending-rates'))
  console.log()
}
