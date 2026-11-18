import { buildBulkFromPresetRequest, buildEditPresetRequest, buildFromPresetRequest, creationParameters, missingUncopyable, uncopyableParameters } from './preset-payloads.ts'

describe('preset payloads', () => {
    it('edits a preset without sending untouched sensitive values', () => {
        const request = buildEditPresetRequest({
            source: { name: 'p', groupName: 'g' },
            stackName: 'dhis2-v2',
            includedParameters: new Set(['IMAGE_TAG', 'DATABASE_PASSWORD']),
            values: { 'name': 'p', 'groupName': 'g', 'dhis2-v2': { IMAGE_TAG: '2.42', DATABASE_PASSWORD: '' } },
            dirtyFields: { 'dhis2-v2.IMAGE_TAG': true },
        })
        expect(request).toEqual({ instances: { 'dhis2-v2': { parameters: { IMAGE_TAG: { value: '2.42' } } } } })
    })
    it('renames and moves only when name or group changed', () => {
        const request = buildEditPresetRequest({
            source: { name: 'p', groupName: 'g' },
            stackName: 'dhis2-v2',
            includedParameters: new Set(),
            values: { name: 'q', groupName: 'h' },
            dirtyFields: { name: true, groupName: true },
        })
        expect(request).toEqual({ name: 'q', group: 'h' })
    })
    it('creates from an unchanged preset with no overrides', () => {
        expect(
            buildFromPresetRequest({
                stackName: 'dhis2-v2',
                includedParameters: new Set(),
                dirtyFields: {},
                values: { name: 'p-1', groupName: 'g', description: '', ttl: 3600 },
            })
        ).toEqual({ name: 'p-1', group: 'g', description: '', ttl: 3600 })
    })
    it('finds required sensitive parameters with no default', () => {
        expect(
            uncopyableParameters([
                { parameterName: 'PGADMIN_USERNAME', required: true, sensitive: true },
                { parameterName: 'DATABASE_PASSWORD', required: true, sensitive: true, defaultValue: 'dhis' },
                { parameterName: 'NOTE', required: false, sensitive: true },
            ])
        ).toEqual(['PGADMIN_USERNAME'])
    })
    it('flags blank uncopyable values only for active stacks', () => {
        const uncopyable = { pgadmin: ['PGADMIN_USERNAME', 'PGADMIN_PASSWORD'] }
        expect(missingUncopyable({ pgadmin: { PGADMIN_USERNAME: 'a@b.org', PGADMIN_PASSWORD: '' } }, uncopyable, ['pgadmin'])).toEqual({
            'pgadmin.PGADMIN_PASSWORD': 'Enter a value',
        })
        expect(missingUncopyable({}, uncopyable, [])).toEqual({})
    })
    it('bulk deploys from a preset with a prefix and count and only the changed values', () => {
        expect(
            buildBulkFromPresetRequest(
                {
                    stackName: 'dhis2-v2',
                    includedParameters: new Set(['IMAGE_TAG', 'DATABASE_PASSWORD']),
                    dirtyFields: { 'dhis2-v2.IMAGE_TAG': true },
                    values: { 'name': 'ignored', 'groupName': 'g', 'ttl': 3600, 'dhis2-v2': { IMAGE_TAG: '2.42', DATABASE_PASSWORD: '' } },
                },
                'load',
                3
            )
        ).toEqual({ prefix: 'load', count: 3, group: 'g', ttl: 3600, instances: { 'dhis2-v2': { parameters: { IMAGE_TAG: { value: '2.42' } } } } })
    })
    it('creates an instance only with the declared parameters the server accepts', () => {
        const pgadmin = {
            name: 'pgadmin',
            parameters: [{ parameterName: 'PGADMIN_USERNAME' }, { parameterName: 'CHART_VERSION' }, { parameterName: 'DATABASE_HOSTNAME', consumed: true }],
        }
        const values = { PGADMIN_USERNAME: 'a@b.org', PGADMIN_CONFIRM_PASSWORD: 'x', CHART_VERSION: '', DATABASE_HOSTNAME: 'db.svc', UNKNOWN: 'u' }
        expect(creationParameters(values, pgadmin)).toEqual({ PGADMIN_USERNAME: { value: 'a@b.org' } })
        expect(creationParameters({ ...values, CHART_VERSION: '1.3' }, pgadmin, (name) => name !== 'PGADMIN_USERNAME')).toEqual({ CHART_VERSION: { value: '1.3' } })
        expect(creationParameters(values, undefined)).toEqual({})
    })
})
