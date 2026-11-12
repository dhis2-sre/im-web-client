/* FNV-1a: a tiny, stable string hash, so the same email always lights the same dots. */
const hash = (text: string) => {
    let h = 0x811c9dc5
    for (let i = 0; i < text.length; i++) {
        h ^= text.charCodeAt(i)
        h = Math.imul(h, 0x01000193)
    }
    return h >>> 0
}

export const IDENTICON_SIZE = 4

const CELLS = Array.from({ length: IDENTICON_SIZE * IDENTICON_SIZE }, (_, i) => i)
const lit = (bits: number, i: number) => (bits >>> i) & 1

/* Moves every dot of a pattern to the cell `move` sends it to. */
const remap = (bits: number, move: (i: number) => number) => CELLS.reduce((out, i) => out | (lit(bits, i) << move(i)), 0)
const x = (i: number) => i % IDENTICON_SIZE
const y = (i: number) => Math.floor(i / IDENTICON_SIZE)
const quarterTurn = (bits: number) => remap(bits, (i) => x(i) * IDENTICON_SIZE + IDENTICON_SIZE - 1 - y(i))
const mirror = (bits: number) => remap(bits, (i) => y(i) * IDENTICON_SIZE + IDENTICON_SIZE - 1 - x(i))

/* Patterns that look the same after a quarter turn: pinwheels that can read as a swastika, plus all-off and all-on. */
export const isQuarterTurnSymmetric = (bits: number) => quarterTurn(bits) === bits

/* Drawings to avoid, row by row from the top. Each is also blocked turned, mirrored, inverted, and with any one dot flipped. */
export const AVOID = {
    swastika: ['##.#', '...#', '#...', '#.##'],
    ssRunes: ['#.#.', '####', '.#.#', '.#.#'],
    middleFinger: ['.#..', '.#..', '####', '####'],
    middleFingerNarrow: ['.#..', '.#..', '####', '.##.'],
    middleFingerThreeWide: ['.#..', '.#..', '###.', '###.'],
    phallicTall: ['.#..', '.#..', '.#..', '###.'],
}

export const toBits = (rows: string[]) =>
    rows
        .join('')
        .split('')
        .reduce((bits, cell, i) => (cell === '#' ? bits | (1 << i) : bits), 0)

const lookalikes = (bits: number) => {
    const turns = [bits, quarterTurn(bits), quarterTurn(quarterTurn(bits)), quarterTurn(quarterTurn(quarterTurn(bits)))]
    const orientations = [...turns, ...turns.map(mirror)]
    return [...orientations, ...orientations.map((shape) => shape ^ 0xffff)].flatMap((shape) => [shape, ...CELLS.map((i) => shape ^ (1 << i))])
}

const BLOCKED = new Set(Object.values(AVOID).flatMap((rows) => lookalikes(toBits(rows))))

export const isBlocked = (bits: number) => isQuarterTurnSymmetric(bits) || BLOCKED.has(bits)

/* A 4×4 dot-matrix: the low 16 bits of the hash say which dots are lit and the rest pick the hue.
 * Round dots and no mirroring keep it from reading as a GitHub identicon. */
export const identicon = (email: string) => {
    const key = email.trim().toLowerCase()
    let h = hash(key)
    // Rehash with a suffix until the pattern is safe; about 1 email in 50 needs a second try.
    for (let salt = 1; isBlocked(h & 0xffff); salt++) {
        h = hash(`${key}#${salt}`)
    }
    const dots = Array.from({ length: IDENTICON_SIZE * IDENTICON_SIZE }, (_, i) => ({
        x: i % IDENTICON_SIZE,
        y: Math.floor(i / IDENTICON_SIZE),
        lit: ((h >>> i) & 1) === 1,
    }))
    return { dots, color: `oklch(75% 0.15 ${(h >>> 16) % 360})` }
}
