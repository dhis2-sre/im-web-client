import type { Deployment } from '../../../types/index.ts'
import { presetFormValues } from './preset-values.ts'

const preset: Deployment = {
    id: 3,
    name: 'sierra-leone',
    groupName: 'play',
    description: 'SL setup',
    ttl: 7200,
    preset: true,
    instances: [
        {
            stackName: 'dhis2-v2',
            public: true,
            parameters: {
                IMAGE_TAG: { value: '2.41.0' },
                DATABASE_PASSWORD: { value: '***' },
                STORAGE_TYPE: { value: '' },
            },
        },
        { stackName: 'pgadmin', parameters: { PGADMIN_USERNAME: { value: 'admin@dhis2.org' } } },
    ],
}

describe('presetFormValues', () => {
    it('lays the preset over the initial values and restores the name', () => {
        const initialValues = {
            'name': 'typed-name',
            'ttl': 3600,
            'groupName': 'other',
            'dhis2-v2': { IMAGE_TAG: '2.40.0', DATABASE_PASSWORD: 'default', STORAGE_TYPE: 'filesystem', FLYWAY_REPAIR: 'false' },
        }

        expect(presetFormValues(preset, 'dhis2-v2', initialValues)).toEqual({
            'name': 'sierra-leone',
            'ttl': 7200,
            'groupName': 'play',
            'description': 'SL setup',
            'public': true,
            'dhis2-v2': { IMAGE_TAG: '2.41.0', DATABASE_PASSWORD: 'default', STORAGE_TYPE: 'filesystem', FLYWAY_REPAIR: 'false' },
            'pgadmin': { PGADMIN_USERNAME: 'admin@dhis2.org' },
        })
    })
})
