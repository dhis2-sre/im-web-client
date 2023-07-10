import { Button, IconLaunch16 } from '@dhis2/ui'
import { useCallback } from 'react'

type OpenButtonProps = {
    hostname: string
    instanceName: string
}

export const OpenButton: React.FC<OpenButtonProps> = ({ hostname, instanceName }) => {
    const onClick = useCallback(() => {
        window.open(`https://${hostname}/${instanceName}`)
    }, [hostname, instanceName])

    return (
        <Button small secondary icon={<IconLaunch16 />} onClick={onClick}>
            Open
        </Button>
    )
}
