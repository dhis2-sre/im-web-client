import { Dhis2StackName } from './views/instances/new-dhis2/parameter-fieldset.tsx'

export const STACK_NAMES: Record<string, Dhis2StackName> = {
    DB: 'dhis2-db',
    CORE: 'dhis2-core',
    PG_ADMIN: 'pgadmin',
    MINIO: 'minio',
    CHAP_DB: 'chap-db',
    CHAP_VALKEY: 'chap-valkey',
    CHAP_WORKER: 'chap-worker',
    CHAP_CORE: 'chap-core',
}

export const VIEWABLE_INSTANCE_TYPES = ['pgadmin', 'dhis2-core', 'chap-core']
