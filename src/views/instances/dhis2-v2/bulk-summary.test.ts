import { formatGi, isBusy, perInstanceResources, toGi } from './bulk-summary.ts'

describe('bulk summary', () => {
    it('converts Kubernetes quantities to Gi', () => {
        expect(toGi('20Gi')).toBe(20)
        expect(toGi('1536Mi')).toBe(1.5)
        expect(toGi('nonsense')).toBe(0)
    })

    it('formats Gi', () => {
        expect(formatGi(2048)).toBe('2.0 Ti')
        expect(formatGi(1.5)).toBe('1.5 Gi')
    })

    it('adds up what one instance asks for', () => {
        expect(
            perInstanceResources({
                'dhis2-v2': {
                    DATABASE_SIZE: '20Gi',
                    STORAGE_TYPE: 'minio',
                    MINIO_STORAGE_SIZE: '10Gi',
                    CORE_RESOURCES_REQUESTS_MEMORY: '2Gi',
                    DB_RESOURCES_REQUESTS_MEMORY: '1Gi',
                    ENABLE_DORIS: 'true',
                    DORIS_FRONTEND_RESOURCES_REQUESTS_MEMORY: '1Gi',
                    DORIS_BACKEND_RESOURCES_REQUESTS_MEMORY: '2Gi',
                },
            })
        ).toEqual({ disk: 30, memory: 6 })
    })

    it('calls a cluster busy only when it is not autoscaled', () => {
        expect(isBusy({ CPU: '71%', Memory: '10%', Autoscaled: false })).toBe(true)
        expect(isBusy({ CPU: '95%', Memory: '95%', Autoscaled: true })).toBe(false)
    })
})
