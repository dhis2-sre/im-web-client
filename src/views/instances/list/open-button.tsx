import { Button, IconLaunch16 } from '@dhis2/ui'
import type { FC } from 'react'
import { useCallback } from 'react'
import { Deployment } from '../../../types'

type OpenButtonProps = {
    deployment: Deployment
}

export const OpenButton: FC<OpenButtonProps> = ({ deployment }) => {
    const group = deployment.group
    const hostname = group.hostname
    const groupId = group.id
    const name = deployment.name

    const onClick = useCallback(
        (_, event) => {
            event.stopPropagation()
            window.open(`https://${hostname}/${name}-${groupId}`)
        },
        [hostname, name, groupId]
    )

    return (
        <Button small secondary icon={<IconLaunch16 />} onClick={onClick}>
            Open
        </Button>
    )
}
