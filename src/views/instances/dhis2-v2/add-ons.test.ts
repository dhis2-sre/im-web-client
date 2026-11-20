import type { GroupedParameters } from '../../../hooks/use-grouped-stack-parameters.ts'
import { findAddOns } from './add-ons.ts'

const core: GroupedParameters = {
    group: { name: 'dhis2', title: 'DHIS2 core' },
    parameters: [
        { parameterName: 'IMAGE_TAG', displayName: 'Image tag' },
        { parameterName: 'STORAGE_TYPE', displayName: 'Storage type' },
        { parameterName: 'DEPLOY_CHAP', displayName: 'Deploy CHAP' },
        { parameterName: 'ENABLE_DORIS', displayName: 'Use Doris' },
        { parameterName: 'DEPLOY_GLOWROOT', displayName: 'Deploy Glowroot' },
        { parameterName: 'ENABLE_FEATURE_X', displayName: 'Enable feature X' },
    ],
}
const minio: GroupedParameters = { group: { name: 'minio', title: 'MinIO', when: { parameter: 'STORAGE_TYPE', equals: 'minio' } }, parameters: [] }
const dorisFe: GroupedParameters = { group: { name: 'doris-fe', title: 'Doris frontend', when: { parameter: 'ENABLE_DORIS', equals: 'true' } }, parameters: [] }
const dorisBe: GroupedParameters = { group: { name: 'doris-be', title: 'Doris backend', when: { parameter: 'ENABLE_DORIS', equals: 'true' } }, parameters: [] }
const featureX: GroupedParameters = { group: { name: 'x', title: 'Feature X', when: { parameter: 'ENABLE_FEATURE_X', equals: 'true' } }, parameters: [] }
const chap = { name: 'chap', when: { parameter: 'DEPLOY_CHAP', equals: 'true' } }

describe('findAddOns', () => {
    const addOns = findAddOns([core, minio, dorisFe, dorisBe, featureX], [chap])

    it('finds companions, gated sections and described switches, in the stack order', () => {
        expect(addOns.map(({ parameter }) => parameter)).toEqual(['DEPLOY_CHAP', 'ENABLE_DORIS', 'DEPLOY_GLOWROOT', 'ENABLE_FEATURE_X'])
    })

    it('leaves out a choice between sections', () => {
        expect(addOns.find(({ parameter }) => parameter === 'STORAGE_TYPE')).toBeUndefined()
    })

    it('carries what each add-on switches on', () => {
        const byParameter = Object.fromEntries(addOns.map((addOn) => [addOn.parameter, addOn]))
        expect(byParameter.DEPLOY_CHAP.companion).toBe(chap)
        expect(byParameter.ENABLE_DORIS.groups).toEqual([dorisFe, dorisBe])
        expect(byParameter.DEPLOY_GLOWROOT.groups).toEqual([])
    })

    it('names an undescribed add-on after its parameter', () => {
        expect(addOns.find(({ parameter }) => parameter === 'ENABLE_FEATURE_X')?.name).toBe('Enable feature X')
    })
})
