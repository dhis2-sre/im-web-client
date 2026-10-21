import { parseGhcrRepository } from './parse-ghcr-repository.ts'

describe('parseGhcrRepository', () => {
    test('splits a GHCR reference into organization and repository', () => {
        expect(parseGhcrRepository('ghcr.io/dhis2/core-embargoed')).toEqual({ organization: 'dhis2', repository: 'core-embargoed' })
    })

    test.each(['core', 'core-dev', 'ghcr.io/dhis2', 'ghcr.io/dhis2/a/b', 'docker.io/dhis2/core', '', undefined])('%s is not a GHCR reference', (repository) => {
        expect(parseGhcrRepository(repository)).toBe(undefined)
    })
})
