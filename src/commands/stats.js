import { api } from '../api.js'
import { header, row, dim, bold, cyan } from '../format.js'

const LABELS = {
  population:      'População',
  gdp_per_capita:  'PIB per capita',
  unemployment:    'Desemprego',
  inflation:       'Inflação',
  gdp_growth:      'Crescimento PIB',
  birth_rate:      'Taxa de natalidade',
  life_expectancy: 'Esperança de vida',
}

const UNITS = {
  population:      'hab',
  gdp_per_capita:  'EUR/hab',
  unemployment:    '%',
  inflation:       '%',
  gdp_growth:      '%',
  birth_rate:      'por 1000 hab',
  life_expectancy: 'anos',
}

function fmt(value, key) {
  if (value == null) return 'n/a'
  if (key === 'population') return Number(value).toLocaleString('pt-PT')
  if (key === 'gdp_per_capita') return Number(value).toLocaleString('pt-PT')
  return String(value)
}

export async function stats(args) {
  const indicator = args['--indicator'] || args['-i'] || null
  const json      = args['--json']      || args['-j']

  const params = {}
  if (indicator) params.indicator = indicator

  const data = await api.ineStats(params)
  if (json) return console.log(JSON.stringify(data, null, 2))

  const items = data.data || data.stats || []

  header(`Estatísticas — Portugal (INE / Eurostat)`)

  if (!items.length && data.value != null) {
    // Single indicator response
    const key = data.indicator || indicator || 'value'
    console.log()
    row(LABELS[key] || key, fmt(data.value, key), UNITS[key] || '')
    if (data.year) console.log(dim(`  Ano: ${data.year}`))
  } else if (items.length) {
    console.log()
    for (const item of items) {
      const key   = item.indicator || item.key || ''
      const label = LABELS[key] || item.label || key
      const val   = item.value ?? item.latest ?? null
      const unit  = UNITS[key] || item.unit || ''
      const year  = item.year ? dim(` (${item.year})`) : ''
      row(label + year, fmt(val, key), unit)
    }
  } else {
    // Raw dump
    for (const [k, v] of Object.entries(data)) {
      if (typeof v === 'object') continue
      row(LABELS[k] || k, fmt(v, k), UNITS[k] || '')
    }
  }

  console.log()
  console.log(dim('  Fonte: INE Portugal / Eurostat  ·  api.apiaberta.pt/v1/ine'))
  console.log()
}
