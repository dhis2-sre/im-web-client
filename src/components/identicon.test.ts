import { AVOID, identicon, isBlocked, toBits } from './identicon.ts'

const emails = ['a@example.org', 'b@example.org', 'admin@dhis2.org', 'joe@dhis2.org', 'you@example.org']

describe('identicon', () => {
    it('gives the same email the same identicon, whatever its case or spacing', () => {
        expect(identicon(' You@Example.org ')).toEqual(identicon('you@example.org'))
    })

    it('gives different emails different identicons', () => {
        expect(new Set(emails.map((email) => JSON.stringify(identicon(email)))).size).toBe(emails.length)
    })

    it('blocks patterns that look the same after a quarter turn', () => {
        expect(isBlocked(0x0000)).toBe(true) // all off
        expect(isBlocked(0xffff)).toBe(true) // all on
        expect(isBlocked(0x6ff6)).toBe(true) // cross
        expect(isBlocked(0x2814)).toBe(true) // pinwheel of four dots
    })

    it('rejects drawings that are not 4×4', () => {
        expect(() => toBits(['.#..', '###', '###.', '###.'])).toThrow('Not a 4×4 drawing')
        expect(() => toBits(['.#..', '###.', '###.'])).toThrow('Not a 4×4 drawing')
        expect(() => toBits(['.#..', '#x#.', '###.', '###.'])).toThrow('Not a 4×4 drawing')
    })

    it('draws the avoided shapes the way the identicon research found them', () => {
        expect(toBits(AVOID.swastika)).toBe(0xd18b)
        expect(toBits(AVOID.denseSwastika)).toBe(0xbe7d)
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
        expect(isBlocked(0xd7eb ^ 0x0010)).toBe(true) // dense swastika, mirrored, one dot off
        expect(isBlocked(0x5a5a)).toBe(false) // checkerboard is fine
    })

    it('blocks only a small share of patterns', () => {
        const blocked = Array.from({ length: 1 << 16 }, (_, bits) => bits).filter(isBlocked).length
        expect(blocked).toBe(1376) // 2% of the 65,536
    })

    it('never draws a blocked pattern', () => {
        const bitsOf = (email: string) => identicon(email).dots.reduce((bits, dot, i) => bits | (Number(dot.lit) << i), 0)
        const samples = Array.from({ length: 20000 }, (_, n) => `user${n}@example.org`)
        expect(samples.filter((email) => isBlocked(bitsOf(email)))).toEqual([])
    })
})
