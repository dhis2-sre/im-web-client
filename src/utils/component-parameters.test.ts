import { DeploymentInstanceParameters, StackWithParameterGroups } from '../types/index.ts'
import { groupParametersByComponent } from './component-parameters.ts'

const dhis2V2Stack: StackWithParameterGroups = {
    name: 'dhis2-v2',
    parameterGroups: [
        { name: 'dhis2', title: 'DHIS 2 Core' },
        { name: 'db', title: 'PostgreSQL' },
        { name: 'minio', title: 'Storage: MinIO', when: { parameter: 'STORAGE_TYPE', equals: 'minio' } },
        { name: 's3', title: 'Storage: S3', when: { parameter: 'STORAGE_TYPE', equals: 's3' } },
    ],
    parameters: [
        { parameterName: 'IMAGE_TAG', displayName: 'Image Tag', group: 'dhis2', priority: 1 },
        { parameterName: 'STORAGE_TYPE', displayName: 'Storage type', group: 'dhis2', priority: 10 },
        { parameterName: 'DATABASE_PASSWORD', displayName: 'Database Password', group: 'db', priority: 6, sensitive: true },
        { parameterName: 'DATABASE_ID', displayName: 'Database', group: 'db', priority: 4 },
        { parameterName: 'MINIO_STORAGE_SIZE', displayName: 'Storage size', group: 'minio', priority: 11 },
        { parameterName: 'S3_BUCKET', displayName: 'Bucket', group: 's3', priority: 13 },
    ],
}

const parameters = (values: Record<string, string>): DeploymentInstanceParameters => Object.entries(values).reduce((all, [name, value]) => ({ ...all, [name]: { value } }), {})

describe('groupParametersByComponent', () => {
    it('assigns parameters to the component their group names', () => {
        const { byComponent, leftover } = groupParametersByComponent(
            parameters({ IMAGE_TAG: '2.42', STORAGE_TYPE: 'minio', DATABASE_PASSWORD: 'secret', DATABASE_ID: '13', MINIO_STORAGE_SIZE: '10Gi' }),
            dhis2V2Stack,
            ['dhis2', 'db', 'minio']
        )

        expect(byComponent.dhis2.map((entry) => entry.name)).toEqual(['IMAGE_TAG', 'STORAGE_TYPE'])
        expect(byComponent.db.map((entry) => entry.name)).toEqual(['DATABASE_ID', 'DATABASE_PASSWORD'])
        expect(byComponent.minio.map((entry) => entry.name)).toEqual(['MINIO_STORAGE_SIZE'])
        expect(leftover).toEqual([])
    })

    it('carries display names and the sensitive flag', () => {
        const { byComponent } = groupParametersByComponent(parameters({ DATABASE_PASSWORD: 'secret' }), dhis2V2Stack, ['db'])

        expect(byComponent.db[0]).toEqual({ name: 'DATABASE_PASSWORD', displayName: 'Database Password', sensitive: true, value: 'secret' })
    })

    it('hangs a conditional group without its own component off the component owning the enabling parameter', () => {
        // STORAGE_TYPE lives in the dhis2 group, so with external S3 there is no minio component and
        // the S3 settings belong to dhis2, exactly where the deploy form nests them.
        const { byComponent, leftover } = groupParametersByComponent(parameters({ STORAGE_TYPE: 's3', S3_BUCKET: 'dhis2-bucket' }), dhis2V2Stack, ['dhis2', 'db'])

        expect(byComponent.dhis2.map((entry) => entry.name)).toEqual(['STORAGE_TYPE', 'S3_BUCKET'])
        expect(leftover).toEqual([])
    })

    it('drops parameters of groups whose condition does not hold', () => {
        const { byComponent, leftover } = groupParametersByComponent(parameters({ STORAGE_TYPE: 'minio', MINIO_STORAGE_SIZE: '10Gi', S3_BUCKET: 'unused' }), dhis2V2Stack, [
            'dhis2',
            'minio',
        ])

        expect(byComponent.minio.map((entry) => entry.name)).toEqual(['MINIO_STORAGE_SIZE'])
        expect(JSON.stringify(byComponent)).not.toContain('S3_BUCKET')
        expect(leftover).toEqual([])
    })

    it('treats a stack without groups as one flat list', () => {
        const ungrouped: StackWithParameterGroups = {
            name: 'dhis2-core',
            parameters: [{ parameterName: 'IMAGE_TAG', displayName: 'Image Tag', priority: 1 }],
        }

        const { byComponent, leftover } = groupParametersByComponent(parameters({ IMAGE_TAG: '2.42' }), ungrouped, ['dhis2'])

        expect(byComponent).toEqual({})
        expect(leftover.map((entry) => entry.name)).toEqual(['IMAGE_TAG'])
    })

    it('nests an applicable group under the enabling component when its own component is absent', () => {
        // The storage type says minio but no minio component was reported, e.g. it has not appeared
        // yet. The settings still apply, so they nest under the component owning STORAGE_TYPE rather
        // than vanishing or ending up in a stray list of their own.
        const { byComponent, leftover } = groupParametersByComponent(parameters({ STORAGE_TYPE: 'minio', MINIO_STORAGE_SIZE: '10Gi' }), dhis2V2Stack, ['dhis2'])

        expect(byComponent.dhis2.map((entry) => entry.name)).toEqual(['STORAGE_TYPE', 'MINIO_STORAGE_SIZE'])
        expect(leftover).toEqual([])
    })
})
