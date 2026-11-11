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

/* A 4×4 dot-matrix: the low 16 bits of the hash say which dots are lit and the rest pick the hue.
 * Round dots and no mirroring keep it from reading as a GitHub identicon. */
export const identicon = (email: string) => {
    const h = hash(email.trim().toLowerCase())
    const dots = Array.from({ length: IDENTICON_SIZE * IDENTICON_SIZE }, (_, i) => ({
        x: i % IDENTICON_SIZE,
        y: Math.floor(i / IDENTICON_SIZE),
        lit: ((h >>> i) & 1) === 1,
    }))
    return { dots, color: `oklch(75% 0.15 ${(h >>> 16) % 360})` }
}
