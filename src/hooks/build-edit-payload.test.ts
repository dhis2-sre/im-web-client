import { buildEditPayload } from './build-edit-payload.ts'

const STACK = 'dhis2-v2'
const allParameters = new Set(['IMAGE_TAG', 'DATABASE_PASSWORD', 'ENABLE_PGADMIN', 'MINIO_STORAGE_SIZE'])

describe('buildEditPayload', () => {
    it('sends nothing when nothing was touched', () => {
        expect(buildEditPayload({ values: { description: 'unchanged' }, dirtyFields: {}, includedParameters: allParameters, stackName: STACK })).toEqual({})
    })

    it('sends only the fields the user changed', () => {
        const values = { description: 'now with more', ttl: 172800, [STACK]: { IMAGE_TAG: '2.43.0', DATABASE_PASSWORD: 'stored' } }
        const dirty = { description: true, [`${STACK}.IMAGE_TAG`]: true }

        expect(buildEditPayload({ values, dirtyFields: dirty, includedParameters: allParameters, stackName: STACK })).toEqual({
            description: 'now with more',
            instances: { [STACK]: { parameters: { IMAGE_TAG: { value: '2.43.0' } } } },
        })
    })

    it('leaves an untouched sensitive field out so the stored value is kept', () => {
        const values = { [STACK]: { DATABASE_PASSWORD: '' } }
        const dirty = { [`${STACK}.DATABASE_PASSWORD`]: true }

        expect(buildEditPayload({ values, dirtyFields: dirty, includedParameters: allParameters, stackName: STACK })).toEqual({})
    })

    it('carries a companion under its own stack name', () => {
        const values = { [STACK]: { ENABLE_PGADMIN: 'true' }, pgadmin: { PGADMIN_PASSWORD: 'district', PGADMIN_CONFIRM_PASSWORD: 'district' } }
        const dirty = { [`${STACK}.ENABLE_PGADMIN`]: true, 'pgadmin.PGADMIN_PASSWORD': true, 'pgadmin.PGADMIN_CONFIRM_PASSWORD': true }

        expect(buildEditPayload({ values, dirtyFields: dirty, includedParameters: allParameters, stackName: STACK })).toEqual({
            instances: {
                [STACK]: { parameters: { ENABLE_PGADMIN: { value: 'true' } } },
                pgadmin: { parameters: { PGADMIN_PASSWORD: { value: 'district' } } },
            },
        })
    })

    it('drops a parameter whose section is no longer visible', () => {
        const values = { [STACK]: { MINIO_STORAGE_SIZE: '10Gi' } }
        const dirty = { [`${STACK}.MINIO_STORAGE_SIZE`]: true }

        expect(buildEditPayload({ values, dirtyFields: dirty, includedParameters: new Set(['IMAGE_TAG']), stackName: STACK })).toEqual({})
    })

    it('sends the public flag against the stack being edited', () => {
        expect(buildEditPayload({ values: { public: true }, dirtyFields: { public: true }, includedParameters: allParameters, stackName: STACK })).toEqual({
            instances: { [STACK]: { public: true } },
        })
    })

    it('sends a ttl change on its own', () => {
        expect(buildEditPayload({ values: { ttl: 604800 }, dirtyFields: { ttl: true }, includedParameters: allParameters, stackName: STACK })).toEqual({ ttl: 604800 })
    })
})
