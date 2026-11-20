import { validateDnsLabel } from './validate-dns-label.ts'

describe('<NameInput /> - DNS Label validation', () => {
    describe('it accepts valid names', () => {
        test.each(['aaaaaa', 'aaaaa1', 'a111111', 'a1-1-1-1-1'])('name: %s', (name) => {
            expect(validateDnsLabel(name)).toBe(undefined)
        })
    })

    describe('it rejects invalid names', () => {
        test.each([
            { name: '', errorMessage: 'Enter a name' },
            { name: '1aaaa', errorMessage: 'Name must start with a lowercase letter' },
            { name: '-1aaaa', errorMessage: 'Name must start with a lowercase letter' },
            { name: 'aaaa@@@aaa', errorMessage: 'Use only lowercase letters, numbers and hyphens' },
            { name: 'lsdf22-||sar', errorMessage: 'Use only lowercase letters, numbers and hyphens' },
            { name: 'f2&¤%".......22', errorMessage: 'Use only lowercase letters, numbers and hyphens' },
            { name: 'aaaaa11111-', errorMessage: 'Name must end with a lowercase letter or a number' },
        ])('name "$name" produces error message "$errorMessage"', ({ name, errorMessage }) => {
            expect(validateDnsLabel(name)).toBe(errorMessage)
        })
    })
})
