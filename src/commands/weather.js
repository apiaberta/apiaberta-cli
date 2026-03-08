import { api } from '../api.js'
import { header, dim, bold, cyan, yellow, red } from '../format.js'

function weatherIcon(desc) {
  if (!desc) return '🌡️'
  const d = desc.toLowerCase()
  if (d.includes('sol') || d.includes('limpo') || d.includes('pouco nublado')) return '☀️'
  if (d.includes('nublado') || d.includes('nuvens')) return '⛅'
  if (d.includes('aguaceiro') || d.includes('chuva') || d.includes('precipitação')) return '🌧️'
  if (d.includes('trovoada') || d.includes('tempestade')) return '⛈️'
  if (d.includes('neve')) return '❄️'
  if (d.includes('nevoeiro') || d.includes('nev')) return '🌫️'
  if (d.includes('vento')) return '💨'
  return '🌤️'
}

export async function weather(args) {
  const city  = args['--city'] || args['-c'] || null
  const limit = parseInt(args['--limit'] || '5')
  const json  = args['--json'] || args['-j']

  const params = { limit: 10 }

  const data = await api.ipmaForecast(params)
  if (json) return console.log(JSON.stringify(data, null, 2))

  // data.data = array of cities, each with .forecasts[]
  let cities = data.data || []

  // Filter client-side if city was specified
  if (city) {
    const q = city.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    const filtered = cities.filter(c => {
      const name = c.cityName.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      return name.includes(q)
    })
    if (filtered.length) cities = filtered
    else cities = [cities[0]] // fallback to first city
  }

  if (!cities.length) {
    console.log(dim('Sem dados de previsão disponíveis.'))
    return
  }

  // Show one city (if filtered) or list of cities with today's forecast
  if (city || cities.length === 1) {
    const c = cities[0]
    header(`Previsão do Tempo — ${c.cityName}`)
    console.log()

    for (const f of (c.forecasts || []).slice(0, limit)) {
      const icon = weatherIcon(f.description)
      const tMax = f.tMax != null ? red(f.tMax + '°C') : ''
      const tMin = f.tMin != null ? cyan(f.tMin + '°C') : ''
      const rain = f.precipProb != null ? yellow(`🌧 ${f.precipProb}%`) : ''
      const wind = f.windDir ? dim(`💨 ${f.windDir}`) : ''

      console.log(`  ${bold(f.date)}  ${icon} ${f.description || ''}`)
      console.log(`  ${dim('  ')}${tMax} / ${tMin}  ${rain}  ${wind}`)
      console.log()
    }
  } else {
    // Summary across multiple cities (today only)
    header(`Previsão do Tempo — Portugal (hoje)`)
    console.log()

    for (const c of cities.slice(0, 12)) {
      const today = (c.forecasts || [])[0] || {}
      const icon  = weatherIcon(today.description)
      const tMax  = today.tMax != null ? red(today.tMax + '°') : dim('n/a')
      const tMin  = today.tMin != null ? cyan(today.tMin + '°') : ''
      const rain  = today.precipProb != null ? yellow(`${today.precipProb}%`) : ''

      const cityPad = c.cityName.padEnd(16)
      console.log(`  ${bold(cityPad)}  ${icon}  ${tMax} / ${tMin}  ${dim(rain)}`)
    }
  }

  console.log()
  console.log(dim('  Fonte: IPMA  ·  api.apiaberta.pt/v1/ipma'))
  console.log()
}
