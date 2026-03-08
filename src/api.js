/**
 * API Aberta client — thin wrapper around the REST API.
 */

const BASE_URL = process.env.APIABERTA_URL || 'https://api.apiaberta.pt/v1'
const API_KEY  = process.env.APIABERTA_KEY || ''

async function request(path, params = {}) {
  const url = new URL(`${BASE_URL}${path}`)
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null) url.searchParams.set(k, v)
  }

  const headers = { Accept: 'application/json' }
  if (API_KEY) headers['X-API-Key'] = API_KEY

  const res = await fetch(url.toString(), { headers })
  const body = await res.json().catch(() => ({ error: 'Invalid JSON from server' }))

  if (!res.ok) {
    const msg = body.message || body.error || `HTTP ${res.status}`
    throw new Error(msg)
  }

  return body
}

export const api = {
  // Status
  status: () => request('/status'),

  // Fuel
  fuelPrices:   (params) => request('/fuel/prices', params),
  fuelStations: (params) => request('/fuel/stations', params),

  // IPMA (weather)
  ipmaForecast: (params) => request('/ipma/forecasts', params),
  ipmaAlerts:   ()       => request('/ipma/warnings'),

  // ANPC (civil protection)
  anpcIncidents: (params) => request('/anpc/incidents', params),

  // INE (statistics)
  ineStats: (params) => request('/ine/stats', params),
  ineIndicators: () => request('/ine/indicators'),

  // EV
  evTariffs: (params) => request('/ev/tariffs', params),

  // Base (public contracts)
  baseContracts: (params) => request('/base/contracts', params),
}
