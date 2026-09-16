import { Dhis2StackName } from './views/instances/parameters.ts'

export const STACK_NAMES: Record<string, Dhis2StackName> = {
    DHIS2: 'dhis2-v2',
    PG_ADMIN: 'pgadmin',
    CHAP: 'chap',
}

/* Stacks that serve something a user can open. The umbrella stack answers on the deployment's own
 * address. */
export const VIEWABLE_INSTANCE_TYPES = ['pgadmin', 'dhis2-v2']
