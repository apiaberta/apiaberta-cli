import { api } from '../api.js'
import { header, bold, dim, cyan } from '../format.js'

export async function geo(args) {
  const json      = args['--json'] || args['-j']
  const district  = args['--district'] || args['-d'] || null
  const slug      = args['--municipality'] || args['-m'] || null
  const postal    = args['--postal'] || args['-p'] || null
  const page      = parseInt(args['--page'] || '1', 10)
  const limit     = parseInt(args['--limit'] || '20', 10)

  if (json) {
    // JSON mode: output whatever was requested
    if (postal) {
      const data = await api.geoPostal(postal)
      return console.log(JSON.stringify(data, null, 2))
    }
    if (slug) {
      const data = await api.geoMunicipality(slug)
      return console.log(JSON.stringify(data, null, 2))
    }
    if (district) {
      const data = await api.geoMunicipalities({ district, page, limit })
      return console.log(JSON.stringify(data, null, 2))
    }
    const data = await api.geoDistricts()
    return console.log(JSON.stringify(data, null, 2))
  }

  // Postal code lookup
  if (postal) {
    const data = await api.geoPostal(postal)
    header(`Código Postal — ${postal}`)
    if (data.CP4 || data.Localidade) {
      console.log(`  ${bold('Localidade:')} ${data.Localidade || dim('n/d')}`)
      console.log(`  ${bold('Concelho:')}   ${data.Concelho   || dim('n/d')}`)
      console.log(`  ${bold('Distrito:')}   ${data.Distrito   || dim('n/d')}`)
      if (data.Latitude && data.Longitude) {
        console.log(`  ${bold('Coords:')}     ${data.Latitude}, ${data.Longitude}`)
      }
    } else {
      console.log(JSON.stringify(data, null, 2))
    }
    console.log()
    return
  }

  // Municipality detail
  if (slug) {
    const data = await api.geoMunicipality(slug)
    header(`Município — ${data.name || slug}`)
    console.log(`  ${bold('Distrito:')}    ${data.district || dim('n/d')}`)
    if (data.area_km2)    console.log(`  ${bold('Área:')}        ${data.area_km2} km²`)
    if (data.population)  console.log(`  ${bold('População:')}   ${data.population.toLocaleString('pt-PT')}`)
    if (data.parishes)    console.log(`  ${bold('Freguesias:')}  ${data.parishes}`)
    console.log()
    return
  }

  // Municipality list (filtered by district)
  if (district) {
    const data = await api.geoMunicipalities({ district, page, limit })
    header(`Municípios — ${district}`)
    const items = data.data || []
    for (const m of items) {
      const pop = m.population ? dim(` · ${m.population.toLocaleString('pt-PT')} hab`) : ''
      console.log(`  ${bold(cyan(m.name.padEnd(28)))} ${dim(m.slug)}${pop}`)
    }
    if (data.total > items.length) {
      console.log()
      console.log(dim(`  Mostrando ${items.length} de ${data.total} municípios (página ${data.page}/${data.pages})`))
    }
    console.log()
    return
  }

  // District list (default)
  const data = await api.geoDistricts()
  header('Distritos de Portugal')
  for (const d of data.data || []) {
    console.log(`  ${bold(cyan(d.name.padEnd(20)))} ${dim('código: ' + d.codigoine)}`)
  }
  console.log()
  console.log(dim(`  ${data.count} distritos  |  api.apiaberta.pt/v1/geo`))
  console.log(dim('  Usa --district=<nome> para listar municípios, --postal=XXXX-XXX para código postal'))
  console.log()
}
