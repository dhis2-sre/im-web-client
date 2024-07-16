import { Button, IconLaunch16 } from '@dhis2/ui'
import type { FC } from 'react'
import { STACK_NAMES } from '../../../constants'

type ViewInstanceMenuItemProps = {
    groupName: string
    name: string
    stackName: string
}

export const ViewInstanceMenuItem: FC<ViewInstanceMenuItemProps> = ({ groupName, name, stackName }) => {
    const host = `${groupName}.im.dhis2.org`
    const path = stackName === STACK_NAMES.PG_ADMIN ? `${name}-pgadmin` : name
    const url = `https://${host}/${path}`

    return <Button small secondary icon={<IconLaunch16 />} onClick={() => window.open(url, '_blank', 'noopener,noreferrer')}>Open</Button>
}
