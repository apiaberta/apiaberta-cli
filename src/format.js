/**
 * Terminal formatting helpers.
 */

// ANSI colours
const c = {
  reset:  '\x1b[0m',
  bold:   '\x1b[1m',
  dim:    '\x1b[2m',
  green:  '\x1b[32m',
  yellow: '\x1b[33m',
  blue:   '\x1b[34m',
  cyan:   '\x1b[36m',
  red:    '\x1b[31m',
  white:  '\x1b[37m',
}

const NO_COLOR = !process.stdout.isTTY || process.env.NO_COLOR

function paint(color, text) {
  return NO_COLOR ? text : `${c[color]}${text}${c.reset}`
}

export function bold(t)   { return NO_COLOR ? t : `${c.bold}${t}${c.reset}` }
export function dim(t)    { return NO_COLOR ? t : `${c.dim}${t}${c.reset}` }
export function green(t)  { return paint('green', t) }
export function yellow(t) { return paint('yellow', t) }
export function blue(t)   { return paint('blue', t) }
export function cyan(t)   { return paint('cyan', t) }
export function red(t)    { return paint('red', t) }

export function header(title) {
  console.log()
  console.log(bold(cyan(`▸ ${title}`)))
  console.log(dim('─'.repeat(50)))
}

export function row(label, value, unit = '') {
  const pad = 28
  const l = label.padEnd(pad)
  console.log(`  ${dim(l)} ${bold(String(value))} ${dim(unit)}`)
}

export function tag(text, color = 'green') {
  const colors = { green: '\x1b[42m\x1b[30m', yellow: '\x1b[43m\x1b[30m', red: '\x1b[41m\x1b[37m', blue: '\x1b[44m\x1b[37m' }
  if (NO_COLOR) return `[${text}]`
  return `${colors[color] || ''} ${text} ${c.reset}`
}

export function printError(msg) {
  console.error(`${red('✖')} ${msg}`)
}

export function printSuccess(msg) {
  console.log(`${green('✔')} ${msg}`)
}

// Format price with € symbol
export function price(eur) {
  return eur != null ? `€${Number(eur).toFixed(3)}` : 'n/a'
}
