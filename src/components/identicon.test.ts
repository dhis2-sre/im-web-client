import { AVOID, identicon, isBlocked, isQuarterTurnSymmetric, toBits } from './identicon.ts'

const emails = ['a@example.org', 'b@example.org', 'admin@dhis2.org', 'joe@dhis2.org', 'you@example.org']

describe('identicon', () => {
    it('gives the same email the same identicon, whatever its case or spacing', () => {
        expect(identicon(' You@Example.org ')).toEqual(identicon('you@example.org'))
    })

    it('gives different emails different identicons', () => {
        expect(new Set(emails.map((email) => JSON.stringify(identicon(email)))).size).toBe(emails.length)
    })

    it('finds exactly 16 quarter-turn symmetric patterns, including all-off and all-on', () => {
        const symmetric = Array.from({ length: 1 << 16 }, (_, bits) => bits).filter(isQuarterTurnSymmetric)
        expect(symmetric).toHaveLength(16)
        expect(symmetric).toEqual(expect.arrayContaining([0, 0xffff]))
    })

    it('draws the avoided shapes the way the identicon research found them', () => {
        expect(toBits(AVOID.swastika)).toBe(0xd18b)
        expect(toBits(AVOID.ssRunes)).toBe(0xaaf5)
        expect(toBits(AVOID.middleFinger)).toBe(0xff22)
        expect(toBits(AVOID.middleFingerNarrow)).toBe(0x6f22)
        expect(toBits(AVOID.middleFingerThreeWide)).toBe(0x7722)
        expect(toBits(AVOID.phallicTall)).toBe(0x7222)
    })

    it('blocks mirrored, inverted and one-dot-off versions of the avoided shapes', () => {
        expect(isBlocked(0xb81d)).toBe(true) // swastika turning the other way
        expect(isBlocked(0x55fa)).toBe(true) // SS runes, mirrored
        expect(isBlocked(0xff44)).toBe(true) // middle finger, other side of centre
        expect(isBlocked(0xd18b ^ 0x0001)).toBe(true) // swastika with one dot off
        expect(isBlocked(0xd18b ^ 0xffff)).toBe(true) // swastika inverted
        expect(isBlocked(0xd18b ^ 0xffff ^ 0x0100)).toBe(true) // swastika inverted, one dot off
        expect(isBlocked(0x5a5a)).toBe(false) // checkerboard is fine
    })

    it('blocks only a small share of patterns', () => {
        const blocked = Array.from({ length: 1 << 16 }, (_, bits) => bits).filter(isBlocked).length
        expect(blocked).toBe(1312) // 2% of the 65,536
    })

    it('never draws a blocked pattern', () => {
        const bitsOf = (email: string) => identicon(email).dots.reduce((bits, dot, i) => bits | (Number(dot.lit) << i), 0)
        const samples = Array.from({ length: 20000 }, (_, n) => `user${n}@example.org`)
        expect(samples.filter((email) => isBlocked(bitsOf(email)))).toEqual([])
    })
})
