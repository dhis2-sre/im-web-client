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
const x = (i: number) => i % IDENTICON_SIZE
const y = (i: number) => Math.floor(i / IDENTICON_SIZE)

/* Turning or mirroring a pattern only moves dots between cells, so both are a remap. */
const remap = (bits: number, move: (i: number) => number) => CELLS.reduce((out, i) => out | (lit(bits, i) << move(i)), 0)
const quarterTurn = (bits: number) => remap(bits, (i) => x(i) * IDENTICON_SIZE + IDENTICON_SIZE - 1 - y(i))
const mirror = (bits: number) => remap(bits, (i) => y(i) * IDENTICON_SIZE + IDENTICON_SIZE - 1 - x(i))

const turnsOf = (bits: number) => {
    const turns = [bits]
    while (turns.length < 4) {
        turns.push(quarterTurn(turns[turns.length - 1]))
    }
    return turns
}

/* Drawings to avoid, row by row from the top. Each is also blocked turned, mirrored, inverted, and with any one dot flipped.
 * The dense swastika hides its hooks among extra dots, but with one dot off it can still read as one. */
export const AVOID = {
    swastika: ['##.#', '...#', '#...', '#.##'],
    denseSwastika: ['#.##', '###.', '.###', '##.#'],
    ssRunes: ['#.#.', '####', '.#.#', '.#.#'],
    middleFinger: ['.#..', '.#..', '####', '####'],
    middleFingerNarrow: ['.#..', '.#..', '####', '.##.'],
    middleFingerThreeWide: ['.#..', '.#..', '###.', '###.'],
    phallicTall: ['.#..', '.#..', '.#..', '###.'],
} as const

export const toBits = (rows: readonly string[]) => {
    // A row of the wrong length would shift every later dot and quietly block the wrong shape.
    if (rows.length !== IDENTICON_SIZE || rows.some((row) => !new RegExp(`^[#.]{${IDENTICON_SIZE}}$`).test(row))) {
        throw new Error(`Not a ${IDENTICON_SIZE}×${IDENTICON_SIZE} drawing: ${rows.join('/')}`)
    }
    return [...rows.join('')].reduce((bits, cell, i) => (cell === '#' ? bits | (1 << i) : bits), 0)
}

const lookalikes = (bits: number) => {
    const orientations = turnsOf(bits).flatMap((turn) => [turn, mirror(turn)])
    return [...orientations, ...orientations.map((shape) => shape ^ 0xffff)].flatMap((shape) => [shape, ...CELLS.map((i) => shape ^ (1 << i))])
}

/* Patterns that look the same after a quarter turn (pinwheels, crosses, all-off, all-on) are built from whole rings of four cells that a turn
 * cycles through. There are 4 rings, so 16 such patterns. */
const rings = [...new Set(CELLS.map((i) => turnsOf(1 << i).reduce((ring, cell) => ring | cell, 0)))]
const quarterTurnSymmetric = Array.from({ length: 1 << rings.length }, (_, pick) => rings.reduce((bits, ring, k) => ((pick >>> k) & 1 ? bits | ring : bits), 0))

const BLOCKED = new Set([...quarterTurnSymmetric, ...Object.values(AVOID).flatMap((rows) => lookalikes(toBits(rows)))])

export const isBlocked = (bits: number) => BLOCKED.has(bits)

/* A 4×4 dot-matrix: the low 16 bits of the hash say which dots are lit and the rest pick the hue.
 * Round dots and no mirroring keep it from reading as a GitHub identicon. */
export const identicon = (email: string) => {
    const key = email.trim().toLowerCase()
    let h = hash(key)
    // Rehash with a suffix until the pattern is safe; about 1 email in 50 needs a second try.
    for (let salt = 1; isBlocked(h & 0xffff); salt++) {
        // A NUL separator can't appear in a trimmed email, so a rehash never matches another person's first hash.
        h = hash(`${key}\u0000${salt}`)
    }
    const dots = CELLS.map((i) => ({ x: x(i), y: y(i), lit: lit(h, i) === 1 }))
    return { dots, color: `oklch(75% 0.15 ${(h >>> 16) % 360})` }
}
