import { Button, IconLaunch16 } from '@dhis2/ui'
import type { FC } from 'react'
import { STACK_NAMES } from '../../../constants.ts'
import { Group } from '../../../types/generated/models/Group.ts'

type ViewInstanceMenuItemProps = {
    group: Group
    name: string
    stackName: string
}

export const ViewInstanceMenuItem: FC<ViewInstanceMenuItemProps> = ({ group, name, stackName }) => {
    const path = stackName === STACK_NAMES.PG_ADMIN ? `${name}-pgadmin` : name
    const url = `https://${group.hostname}/${path}`

    return (
        <Button small secondary icon={<IconLaunch16 />} onClick={() => window.open(url, '_blank', 'noopener,noreferrer')}>
            Open
        </Button>
    )
}
