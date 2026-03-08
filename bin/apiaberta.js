#!/usr/bin/env node
/**
 * apiaberta CLI — access Portuguese public data from the terminal
 *
 * Usage:
 *   apiaberta <command> [options]
 *
 * Commands:
 *   fuel       Current fuel prices in Portugal (DGEG)
 *   weather    Weather forecast (IPMA)
 *   incidents  Civil protection incidents (ANEPC)
 *   stats      Portugal statistics (INE/Eurostat)
 *   status     API Aberta platform status
 *
 * Options:
 *   --json, -j         Output raw JSON
 *   --help, -h         Show help
 *   --version, -v      Show version
 *
 * Environment:
 *   APIABERTA_KEY      API key (from apiaberta.pt — free to register)
 *   APIABERTA_URL      Override API base URL (default: https://api.apiaberta.pt/v1)
 */

import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dir = dirname(fileURLToPath(import.meta.url))
const pkg   = JSON.parse(readFileSync(join(__dir, '../package.json'), 'utf8'))

// ── Minimal arg parser ───────────────────────────────────────────────────────
function parseArgs(argv) {
  const args = {}
  const positional = []

  for (let i = 0; i < argv.length; i++) {
    const a = argv[i]
    if (a.startsWith('--') || a.startsWith('-')) {
      if (a.includes('=')) {
        const [k, v] = a.split('=')
        args[k] = v
      } else if (argv[i + 1] && !argv[i + 1].startsWith('-')) {
        args[a] = argv[++i]
      } else {
        args[a] = true
      }
    } else {
      positional.push(a)
    }
  }

  args['_'] = positional
  return args
}

// ── Help text ────────────────────────────────────────────────────────────────
function printHelp() {
  console.log(`
  ${'\x1b[1m'}apiaberta${'\x1b[0m'} — dados abertos de Portugal, no terminal

  ${'\x1b[2m'}Uso:${'\x1b[0m'}
    apiaberta <comando> [opções]
    npx apiaberta <comando>

  ${'\x1b[2m'}Comandos:${'\x1b[0m'}
    fuel         Preços de combustíveis (DGEG)
    weather      Previsão do tempo (IPMA)
    incidents    Ocorrências proteção civil (ANEPC)
    stats        Estatísticas de Portugal (INE/Eurostat)
    status       Estado da plataforma API Aberta

  ${'\x1b[2m'}Opções globais:${'\x1b[0m'}
    --json, -j   Output em JSON puro
    --help, -h   Mostrar ajuda
    --version    Versão

  ${'\x1b[2m'}fuel:${'\x1b[0m'}
    --district=<nome>   Filtrar por distrito
    --date=<YYYY-MM-DD> Data específica

  ${'\x1b[2m'}weather:${'\x1b[0m'}
    --city=<nome>       Cidade (ex: Lisboa, Porto, Faro)

  ${'\x1b[2m'}incidents:${'\x1b[0m'}
    --type=<tipo>       Filtrar por tipo de ocorrência
    --limit=<n>         Número de resultados (padrão: 10)

  ${'\x1b[2m'}stats:${'\x1b[0m'}
    --indicator=<nome>  Indicador (population, gdp_per_capita, unemployment…)

  ${'\x1b[2m'}Variáveis de ambiente:${'\x1b[0m'}
    APIABERTA_KEY       API key gratuita em apiaberta.pt

  ${'\x1b[2m'}Exemplos:${'\x1b[0m'}
    npx apiaberta fuel
    npx apiaberta fuel --district=Lisboa
    npx apiaberta weather --city=Porto
    npx apiaberta incidents
    npx apiaberta stats --indicator=unemployment
    npx apiaberta status
    npx apiaberta fuel --json | jq '.data[0]'

  Mais info: ${'\x1b[36m'}https://apiaberta.pt${'\x1b[0m'}
`)
}

// ── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  const argv = process.argv.slice(2)
  const args = parseArgs(argv)
  const [command] = args['_']

  if (args['--version'] || args['-v']) {
    console.log(`apiaberta/${pkg.version}`)
    process.exit(0)
  }

  if (!command || args['--help'] || args['-h']) {
    printHelp()
    process.exit(0)
  }

  try {
    switch (command) {
      case 'fuel': {
        const { fuel } = await import('../src/commands/fuel.js')
        await fuel(args)
        break
      }
      case 'weather': {
        const { weather } = await import('../src/commands/weather.js')
        await weather(args)
        break
      }
      case 'incidents': {
        const { incidents } = await import('../src/commands/incidents.js')
        await incidents(args)
        break
      }
      case 'stats': {
        const { stats } = await import('../src/commands/stats.js')
        await stats(args)
        break
      }
      case 'status': {
        const { status } = await import('../src/commands/status.js')
        await status(args)
        break
      }
      default:
        console.error(`\x1b[31m✖\x1b[0m Comando desconhecido: "${command}"`)
        console.error('  Usa \x1b[1mapiaberta --help\x1b[0m para ver os comandos disponíveis.')
        process.exit(1)
    }
  } catch (err) {
    if (err.message?.includes('fetch failed') || err.message?.includes('ECONNREFUSED')) {
      console.error('\x1b[31m✖\x1b[0m Não foi possível ligar à API Aberta.')
      console.error('  Verifica a tua ligação ou o estado em: https://status.apiaberta.pt')
    } else {
      console.error(`\x1b[31m✖\x1b[0m ${err.message}`)
    }
    process.exit(1)
  }
}

main()
