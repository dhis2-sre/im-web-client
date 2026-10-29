import { IDENTICON_SIZE, identicon } from './identicon.ts'

const emails = ['a@example.org', 'b@example.org', 'admin@dhis2.org', 'joe@dhis2.org', 'you@example.org']

describe('identicon', () => {
    it('gives the same email the same identicon, whatever its case or spacing', () => {
        expect(identicon(' You@Example.org ')).toEqual(identicon('you@example.org'))
    })

    it('gives different emails different identicons', () => {
        expect(new Set(emails.map((email) => JSON.stringify(identicon(email)))).size).toBe(emails.length)
    })

    it('places one dot on every point of the grid', () => {
        const positions = identicon('you@example.org').dots.map(({ x, y }) => `${x},${y}`)
        expect(new Set(positions).size).toBe(IDENTICON_SIZE * IDENTICON_SIZE)
    })
})
