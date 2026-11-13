import { buildEditPresetRequest, buildFromPresetRequest, changedFromPreset, describeChanges, missingUncopyable, uncopyableParameters } from './preset-payloads.ts'

describe('preset payloads', () => {
    it('ignores per-instance fields when comparing with the preset', () => {
        expect(changedFromPreset({ 'name': true, 'ttl': true, 'groupName': true, 'description': true, 'presetChoice': true, 'dhis2-v2.IMAGE_TAG': true })).toEqual([
            'dhis2-v2.IMAGE_TAG',
        ])
    })
    it('lists the first four changes then a count', () => {
        const names = { 'dhis2-v2.IMAGE_TAG': 'Version', 'dhis2-v2.ENABLE_PGADMIN': 'pgAdmin' }
        expect(describeChanges(['dhis2-v2.IMAGE_TAG', 'dhis2-v2.ENABLE_PGADMIN'], names)).toBe('2 settings differ: Version, pgAdmin')
        expect(describeChanges(['a.A', 'a.B', 'a.C', 'a.D', 'a.E', 'a.F'], {})).toBe('6 settings differ: A, B, C, D and 2 more')
        expect(describeChanges(['a.A'], {})).toBe('1 setting differs: A')
    })
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
})
