import type { Group } from '../types/index.ts'
import { endpointUrl, ownEndpoint } from './stack-endpoints.ts'

const group = { hostname: 'play.example.org' } as Group
const glowroot = { pathSuffix: '-glowroot', when: { parameter: 'DEPLOY_GLOWROOT', equals: 'true' } }

describe('ownEndpoint', () => {
    it('is the endpoint a stack serves whatever its parameters', () => {
        expect(ownEndpoint({ name: 'dhis2-v2', endpoints: [glowroot, { pathSuffix: '' }] })).toEqual({ pathSuffix: '' })
        expect(ownEndpoint({ name: 'pgadmin', endpoints: [{ pathSuffix: '-pgadmin' }] })).toEqual({ pathSuffix: '-pgadmin' })
    })

    it('is missing for a stack that serves nothing of its own', () => {
        expect(ownEndpoint({ name: 'chap' })).toBeUndefined()
        expect(ownEndpoint({ name: 'agent', endpoints: [glowroot] })).toBeUndefined()
        expect(ownEndpoint(undefined)).toBeUndefined()
    })
})

describe('endpointUrl', () => {
    it("follows the instance's name with the endpoint's path suffix", () => {
        expect(endpointUrl(group, 'demo', { pathSuffix: '-pgadmin' })).toBe('https://play.example.org/demo-pgadmin')
    })

    it("is the instance's own address without an endpoint", () => {
        expect(endpointUrl(group, 'demo')).toBe('https://play.example.org/demo')
        expect(endpointUrl(group, 'demo', { pathSuffix: '' })).toBe('https://play.example.org/demo')
    })
})
