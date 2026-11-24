import { Dhis2StackName } from './views/instances/parameters.ts'

/* The stack the instance and preset forms are built for. */
export const DHIS2_STACK = 'dhis2-v2'

export const STACK_NAMES: Record<string, Dhis2StackName> = {
    DHIS2: DHIS2_STACK,
    PG_ADMIN: 'pgadmin',
    CHAP: 'chap',
}

/* Stacks that serve something a user can open. The umbrella stack answers on the deployment's own
 * address. */
export const VIEWABLE_INSTANCE_TYPES = ['pgadmin', 'dhis2-v2']

/* How companions are known to people, by stack name. Others show their stack name. */
export const COMPANION_LABELS: Record<string, string> = { pgadmin: 'pgAdmin', chap: 'CHAP', doris: 'Doris' }
