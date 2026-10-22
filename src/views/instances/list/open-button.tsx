import { Button, IconLaunch16 } from '@dhis2/ui'
import type { FC } from 'react'
import { STACK_NAMES } from '../../../constants.ts'
import type { Group } from '../../../types/index.ts'

/* Opens a stack in a new tab at its own address. pgAdmin is served beside the instance it belongs to
 * rather than at its name. */
export const OpenButton: FC<{ group: Group; name: string; stackName?: string }> = ({ group, name, stackName }) => {
    const path = stackName === STACK_NAMES.PG_ADMIN ? `${name}-pgadmin` : name

    return (
        <Button small secondary icon={<IconLaunch16 />} onClick={() => window.open(`https://${group.hostname}/${path}`, '_blank', 'noopener,noreferrer')}>
            Open
        </Button>
    )
}
