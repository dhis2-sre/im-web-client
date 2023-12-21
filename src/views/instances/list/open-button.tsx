import { Button, IconLaunch16 } from '@dhis2/ui'
import { useCallback } from 'react'
import type { FC } from 'react'

type OpenButtonProps = {
    hostname: string
    name: string
}

export const OpenButton: FC<OpenButtonProps> = ({ hostname, name }) => {
    const onClick = useCallback(
        (_, event) => {
            event.stopPropagation()
            window.open(`https://${hostname}/${name}`)
        },
        [hostname, name]
    )

    return (
        <Button small secondary icon={<IconLaunch16 />} onClick={onClick}>
            Open
        </Button>
    )
}
