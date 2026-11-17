import { askForUncopyable, buildEditPresetRequest, buildFromPresetRequest, creationParameters, missingUncopyable, uncopyableParameters, withAsked } from './preset-payloads.ts'

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
    it('asks only for the uncopyable values still missing, labelling a companion', () => {
        const stacks = [
            {
                name: 'pgadmin',
                parameters: [
                    { parameterName: 'PGADMIN_USERNAME', displayName: 'Login' },
                    { parameterName: 'PGADMIN_PASSWORD', displayName: 'Password' },
                ],
            },
        ]
        const askFor = askForUncopyable({
            values: { pgadmin: { PGADMIN_USERNAME: 'dba@example.org' } },
            activeStacks: ['dhis2-v2', 'pgadmin'],
            uncopyable: { pgadmin: ['PGADMIN_USERNAME', 'PGADMIN_PASSWORD'] },
            stacks,
        })
        expect(askFor).toEqual([{ stackName: 'pgadmin', parameterName: 'PGADMIN_PASSWORD', displayName: 'pgAdmin: Password', type: 'password' }])
    })
    it('labels the asked values as the form does, without naming the companion twice', () => {
        const stacks = [
            {
                name: 'pgadmin',
                parameters: [
                    { parameterName: 'PGADMIN_USERNAME', displayName: 'pgAdmin Username' },
                    { parameterName: 'PGADMIN_PASSWORD', displayName: 'pgAdmin Password' },
                ],
            },
        ]
        expect(askForUncopyable({ values: {}, activeStacks: ['dhis2-v2', 'pgadmin'], uncopyable: { pgadmin: ['PGADMIN_USERNAME', 'PGADMIN_PASSWORD'] }, stacks })).toEqual([
            { stackName: 'pgadmin', parameterName: 'PGADMIN_USERNAME', displayName: 'pgAdmin Login email', type: 'email' },
            { stackName: 'pgadmin', parameterName: 'PGADMIN_PASSWORD', displayName: 'pgAdmin Password', type: 'password' },
        ])
    })
    it('lays asked values into their stacks', () => {
        expect(withAsked({ name: 'a', pgadmin: { X: '1' } }, { pgadmin: { Y: '2' } })).toEqual({ name: 'a', pgadmin: { X: '1', Y: '2' } })
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
