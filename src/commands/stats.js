import { api } from '../api.js'
import { header, row, dim, bold } from '../format.js'

const LABELS = {
  population:        'População',
  gdp_per_capita:    'PIB per capita',
  gdp:               'PIB (total)',
  unemployment:      'Desemprego',
  unemployment_rate: 'Desemprego',
  inflation:         'Inflação',
  gdp_growth:        'Crescimento PIB',
  birth_rate:        'Taxa de natalidade',
  death_rate:        'Taxa de mortalidade',
  life_expectancy:   'Esperança de vida',
}

const UNITS_MAP = {
  population:        'hab',
  gdp_per_capita:    'EUR/hab',
  gdp:               'M EUR',
  unemployment:      '%',
  unemployment_rate: '%',
  inflation:         '%',
  gdp_growth:        '%',
  birth_rate:        'por 1000 hab',
  death_rate:        'por 1000 hab',
  life_expectancy:   'anos',
}

function fmt(value, key) {
  if (value == null) return 'n/a'
  if (key === 'population') return Number(value).toLocaleString('pt-PT')
  if (key === 'gdp' || key === 'gdp_per_capita') return Number(value).toLocaleString('pt-PT')
  return String(value)
}

export async function stats(args) {
  const indicator = args['--indicator'] || args['-i'] || null
  const json      = args['--json']      || args['-j']

  const params = {}
  if (indicator) params.indicator = indicator

  const data = await api.ineStats(params)
  if (json) return console.log(JSON.stringify(data, null, 2))

  // Each item = { indicator, label, unit, data: [{year, value}...] }
  const items = data.data || []

  header('Estatísticas — Portugal (INE / Eurostat)')
  console.log()

  if (!items.length) {
    console.log(dim('  Sem dados disponíveis.'))
    console.log()
    return
  }

  for (const item of items) {
    const key    = item.indicator || ''
    const label  = LABELS[key] || item.label || key
    const unit   = UNITS_MAP[key] || item.unit || ''
    const series = item.data || []
    const latest = series[series.length - 1] || {}
    const val    = latest.value ?? null
    const year   = latest.year || ''

    row(`${label} ${dim(`(${year})`)}`, fmt(val, key), unit)
  }

  console.log()
  console.log(dim('  Fonte: INE Portugal / Eurostat  ·  api.apiaberta.pt/v1/ine'))
  console.log()
}
