import { Dhis2StackPrimaryParameters } from './parameter-fieldset.tsx'

export const DHIS2_STACK_ID = 'dhis2'
export const DATABASE_ID = 'DATABASE_ID'
export const FLYWAY_MIGRATE_OUT_OF_ORDER = 'FLYWAY_MIGRATE_OUT_OF_ORDER'
export const FLYWAY_REPAIR_BEFORE_MIGRATION = 'FLYWAY_REPAIR_BEFORE_MIGRATION'
export const ENABLE_QUERY_LOGGING = 'ENABLE_QUERY_LOGGING'
export const IMAGE_REPOSITORY = 'IMAGE_REPOSITORY'
export const IMAGE_TAG = 'IMAGE_TAG'
export const IMAGE_PULL_POLICY = 'IMAGE_PULL_POLICY'
export const STORAGE_TYPE = 'STORAGE_TYPE'
export const INSTALL_REDIS = 'INSTALL_REDIS'
export const JAVA_OPTS = 'JAVA_OPTS'
export const PGADMIN_USERNAME = 'PGADMIN_USERNAME'
export const PGADMIN_PASSWORD = 'PGADMIN_PASSWORD'
export const PGADMIN_CONFIRM_PASSWORD = 'PGADMIN_CONFIRM_PASSWORD'
export const OPTIONAL_FIELDS = new Set([JAVA_OPTS])
export const CUSTOM_DHIS2_CONFIG = 'CUSTOM_DHIS2_CONFIG'

export const STACK_PRIMARY_PARAMETERS = new Map([
    ['dhis2-core', new Set(['IMAGE_TAG', 'IMAGE_REPOSITORY'])],
    ['dhis2-db', new Set(['DATABASE_ID'])],
    ['pgadmin', new Set(['PGADMIN_USERNAME', 'PGADMIN_PASSWORD', 'PGADMIN_CONFIRM_PASSWORD'])],
]) as Dhis2StackPrimaryParameters
