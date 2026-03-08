# apiaberta CLI

Access Portuguese public data from the terminal.

```bash
npx apiaberta fuel
npx apiaberta weather --city=Lisboa
npx apiaberta incidents
npx apiaberta stats
npx apiaberta status
```

## Install

```bash
# Use without installing
npx apiaberta <command>

# Or install globally
npm install -g apiaberta
```

## Commands

| Command | Description | Source |
|---------|-------------|--------|
| `fuel` | Fuel prices across Portugal | DGEG |
| `weather` | Weather forecast | IPMA |
| `incidents` | Civil protection incidents | ANEPC |
| `stats` | Portugal statistics | INE / Eurostat |
| `status` | API platform status | API Aberta |

## Options

### Global
- `--json`, `-j` — Raw JSON output (pipe to jq)
- `--help`, `-h` — Show help
- `--version` — Version

### `fuel`
- `--district=<name>` — Filter by district (e.g. Lisboa, Porto)
- `--date=<YYYY-MM-DD>` — Specific date

### `weather`
- `--city=<name>` — City name (Lisboa, Porto, Faro...)

### `incidents`
- `--type=<type>` — Filter by incident type
- `--limit=<n>` — Number of results (default: 10)

### `stats`
- `--indicator=<name>` — Indicator: `population`, `gdp_per_capita`, `unemployment`, `inflation`...

## Examples

```bash
# Fuel prices in Porto
apiaberta fuel --district=Porto

# JSON output for scripting
apiaberta fuel --json | jq '.data[] | select(.fuel_slug == "gasoline_95")'

# Weather in Faro
apiaberta weather --city=Faro

# Active civil protection incidents
apiaberta incidents --limit=5

# Unemployment rate
apiaberta stats --indicator=unemployment

# Check API status
apiaberta status
```

## Environment Variables

| Variable | Description |
|----------|-------------|
| `APIABERTA_KEY` | API key (free at [apiaberta.pt](https://apiaberta.pt)) |
| `APIABERTA_URL` | Override API base URL |

An API key increases your rate limits. Get one free at [apiaberta.pt](https://apiaberta.pt).

## Data Sources

- **DGEG** — Direção-Geral de Energia e Geologia (fuel prices)
- **IPMA** — Instituto Português do Mar e da Atmosfera (weather)
- **ANEPC** — Autoridade Nacional de Emergência e Proteção Civil (incidents)
- **INE / Eurostat** — Statistics Portugal

## License

MIT © [API Aberta](https://apiaberta.pt)
