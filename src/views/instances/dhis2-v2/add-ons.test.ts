import type { GroupedParameters } from '../../../hooks/use-grouped-stack-parameters.ts'
import { findAddOns } from './add-ons.ts'

const core: GroupedParameters = {
    group: { name: 'dhis2', title: 'DHIS2 core' },
    parameters: [
        { parameterName: 'IMAGE_TAG', displayName: 'Image tag' },
        { parameterName: 'STORAGE_TYPE', displayName: 'Storage type' },
        { parameterName: 'DEPLOY_CHAP', displayName: 'CHAP', description: 'Climate and health modelling.', addOn: true },
        { parameterName: 'ENABLE_DORIS', displayName: 'Doris', description: 'A separate database for analytics.', addOn: true },
        { parameterName: 'DEPLOY_GLOWROOT', displayName: 'Glowroot', description: 'Performance monitoring.', addOn: true },
        { parameterName: 'ENABLE_QUERY_LOGGING', displayName: 'Enable query logging' },
        { parameterName: 'ENABLE_FEATURE_X', displayName: 'Enable feature X' },
        { parameterName: 'ENABLE_SIDECAR', displayName: 'Enable sidecar' },
        { parameterName: 'ENABLE_BARE', addOn: true },
    ],
}
const minio: GroupedParameters = { group: { name: 'minio', title: 'MinIO', when: { parameter: 'STORAGE_TYPE', equals: 'minio' } }, parameters: [] }
const dorisFe: GroupedParameters = { group: { name: 'doris-fe', title: 'Doris frontend', when: { parameter: 'ENABLE_DORIS', equals: 'true' } }, parameters: [] }
const dorisBe: GroupedParameters = { group: { name: 'doris-be', title: 'Doris backend', when: { parameter: 'ENABLE_DORIS', equals: 'true' } }, parameters: [] }
const featureX: GroupedParameters = { group: { name: 'x', title: 'Feature X', when: { parameter: 'ENABLE_FEATURE_X', equals: 'true' } }, parameters: [] }
const chap = { name: 'chap', when: { parameter: 'DEPLOY_CHAP', equals: 'true' } }
const sidecar = { name: 'sidecar', when: { parameter: 'ENABLE_SIDECAR', equals: 'true' } }
const endpoints = [{ pathSuffix: '' }, { pathSuffix: '-glowroot', when: { parameter: 'DEPLOY_GLOWROOT', equals: 'true' } }]

describe('findAddOns', () => {
    const addOns = findAddOns([core, minio, dorisFe, dorisBe, featureX], [chap, sidecar], endpoints)
    const byParameter = Object.fromEntries(addOns.map((addOn) => [addOn.parameter, addOn]))

    it('finds the parameters the stack marks as add-ons, in the stack order', () => {
        expect(addOns.map(({ parameter }) => parameter)).toEqual(['DEPLOY_CHAP', 'ENABLE_DORIS', 'DEPLOY_GLOWROOT', 'ENABLE_BARE'])
    })

    it('leaves out an unmarked switch, whatever the stack gates on it', () => {
        expect(byParameter.ENABLE_QUERY_LOGGING).toBeUndefined()
        expect(byParameter.ENABLE_FEATURE_X).toBeUndefined()
        expect(byParameter.ENABLE_SIDECAR).toBeUndefined()
    })

    it('carries what each add-on switches on', () => {
        expect(byParameter.DEPLOY_CHAP.companion).toBe(chap)
        expect(byParameter.DEPLOY_CHAP.groups).toEqual([])
        expect(byParameter.ENABLE_DORIS.companion).toBeUndefined()
        expect(byParameter.ENABLE_DORIS.groups).toEqual([dorisFe, dorisBe])
        expect(byParameter.DEPLOY_GLOWROOT.companion).toBeUndefined()
        expect(byParameter.DEPLOY_GLOWROOT.groups).toEqual([])
    })

    it('names and describes an add-on as the stack does', () => {
        expect(byParameter.ENABLE_DORIS).toMatchObject({ name: 'Doris', description: 'A separate database for analytics.' })
    })

    it('carries the path of the endpoint an add-on switches on', () => {
        expect(byParameter.DEPLOY_GLOWROOT.pathSuffix).toBe('-glowroot')
        expect(byParameter.DEPLOY_CHAP.pathSuffix).toBeUndefined()
    })

    it('names an add-on the stack gives no display name after its parameter', () => {
        expect(byParameter.ENABLE_BARE).toMatchObject({ name: 'ENABLE_BARE', description: '' })
    })
})
