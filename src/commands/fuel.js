import { api } from '../api.js'
import { header, row, bold, dim, price, cyan } from '../format.js'

export async function fuel(args) {
  const district = args['--district'] || args['-d'] || null
  const date     = args['--date']     || null
  const json     = args['--json']     || args['-j']

  const params = {}
  if (district) params.district = district
  if (date)     params.date     = date

  const data = await api.fuelPrices(params)

  if (json) return console.log(JSON.stringify(data, null, 2))

  const prices = data.data || []
  if (!prices.length) {
    console.log(dim('No fuel price data available.'))
    return
  }

  const dateStr = prices[0]?.date || 'today'
  header(`Combustíveis — Portugal (${dateStr})`)

  if (district) {
    console.log(dim(`  Filtered to: ${district}`))
    console.log()
  }

  for (const p of prices) {
    if (!p.road_vehicle) continue // skip non-road fuels unless requested
    const fuel_label = p.fuel_name.padEnd(25)
    console.log(`  ${bold(cyan(fuel_label))}  avg ${bold(price(p.avg_price_eur))}  min ${dim(price(p.min_price_eur))}  max ${dim(price(p.max_price_eur))}  (${dim(p.station_count + ' postos')})`)
  }

  console.log()
  console.log(dim(`  Source: DGEG   Updated daily at 07:30 PT`))

  if (!process.env.APIABERTA_KEY) {
    console.log(dim(`  Tip: Set APIABERTA_KEY for higher rate limits — apiaberta.pt`))
  }
  console.log()
}
