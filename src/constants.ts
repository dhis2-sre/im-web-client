import { Dhis2StackName } from './views/instances/new-dhis2/parameter-fieldset.tsx'

export const STACK_NAMES: Record<string, Dhis2StackName> = {
    DB: 'dhis2-db',
    CORE: 'dhis2-core',
    PG_ADMIN: 'pgadmin',
}

export const DePLOYMENT_CATEGORIES: Record<string, string> = {
    STABLE: 'Stable',
    CANARY: 'Canary',
    UNDER_DEVELOPMENT: 'Under Development',
}

export const INSTANCE_NAME: Record<string, string> = {
    DEV: 'dev',
    NIGHTLY: 'nightly',
    STABLE: 'stable',
}
export const DEPLOYMENT_NAME: Record<string, string> = {
    ANDROID_DEV: 'android',
    PLAY: 'play',
    STABLE: 'qa',
}

export const VIEWABLE_INSTANCE_TYPES = ['pgadmin', 'dhis2-core']
