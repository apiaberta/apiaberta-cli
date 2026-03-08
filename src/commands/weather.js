import { api } from '../api.js'
import { header, row, dim, bold, cyan, yellow, red, green } from '../format.js'

const WEATHER_ICONS = {
  Sunny:        '☀️',
  'Partly cloudy': '⛅',
  Cloudy:       '☁️',
  Rainy:        '🌧️',
  Stormy:       '⛈️',
  Windy:        '💨',
  Foggy:        '🌫️',
  Snow:         '❄️',
}

function icon(desc) {
  for (const [k, v] of Object.entries(WEATHER_ICONS)) {
    if (desc?.toLowerCase().includes(k.toLowerCase())) return v
  }
  return '🌡️'
}

export async function weather(args) {
  const city = args['--city'] || args['-c'] || null
  const json  = args['--json'] || args['-j']

  const params = {}
  if (city) params.city = city

  const data = await api.ipmaForecast(params)
  if (json) return console.log(JSON.stringify(data, null, 2))

  const forecasts = data.data || data.forecasts || []

  if (!forecasts.length) {
    console.log(dim('No forecast data available.'))
    return
  }

  const locationName = data.location || city || 'Portugal'
  header(`Previsão do Tempo — ${locationName}`)

  for (const f of forecasts.slice(0, 5)) {
    const date     = f.date || f.forecastDate || ''
    const desc     = f.description || f.precipitaProb != null ? '' : 'n/a'
    const maxT     = f.tMax ?? f.max_temp ?? f.tmax ?? null
    const minT     = f.tMin ?? f.min_temp ?? f.tmin ?? null
    const rain     = f.precipitaProb ?? f.rain_prob ?? null
    const wind     = f.predWindDir   ?? f.wind_dir  ?? null

    const temp = (maxT != null && minT != null)
      ? `${bold(red(maxT + '°'))} / ${cyan(minT + '°')}`
      : maxT != null ? bold(red(maxT + '°')) : dim('n/a')

    const rainStr = rain != null ? yellow(`🌧 ${rain}%`) : ''
    const windStr = wind ? dim(`💨 ${wind}`) : ''

    console.log(`  ${bold(date.substring(0, 10))}  ${temp}  ${rainStr}  ${windStr}`.trimEnd())
    if (f.description) console.log(`  ${dim('  ' + icon(f.description) + ' ' + f.description)}`)
  }

  console.log()
  console.log(dim('  Source: IPMA  ·  api.apiaberta.pt/v1/ipma'))
  console.log()
}
