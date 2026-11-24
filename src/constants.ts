import { Dhis2StackName } from './views/instances/parameters.ts'

export const DHIS2_STACK = 'dhis2-v2'

export const STACK_NAMES: Record<string, Dhis2StackName> = {
    DHIS2: DHIS2_STACK,
    PG_ADMIN: 'pgadmin',
    CHAP: 'chap',
}

/* How companions are known to people, by stack name. Others show their stack name. */
export const COMPANION_LABELS: Record<string, string> = { pgadmin: 'pgAdmin', chap: 'CHAP', doris: 'Doris' }
