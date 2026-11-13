import { Button, IconLaunch16 } from '@dhis2/ui'
import type { FC } from 'react'
import { STACK_NAMES } from '../../../constants.ts'
import type { Group } from '../../../types/index.ts'

/* The address a stack answers on. pgAdmin is served beside the instance it belongs to rather than at
 * its name. */
export const stackUrl = (group: Group, name: string, stackName?: string) => `https://${group.hostname}/${stackName === STACK_NAMES.PG_ADMIN ? `${name}-pgadmin` : name}`

/* Opens a stack in a new tab at its own address. */
export const OpenButton: FC<{ group: Group; name: string; stackName?: string }> = ({ group, name, stackName }) => (
    <Button small secondary icon={<IconLaunch16 />} onClick={() => window.open(stackUrl(group, name, stackName), '_blank', 'noopener,noreferrer')}>
        Open
    </Button>
)
