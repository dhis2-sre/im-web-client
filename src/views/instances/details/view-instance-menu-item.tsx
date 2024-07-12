import { MenuItem, IconLaunch16 } from '@dhis2/ui'
import type { FC } from 'react'

type ViewInstanceMenuItemProps = {
    groupName: string
    name: string
    stackName: string
}

export const ViewInstanceMenuItem: FC<ViewInstanceMenuItemProps> = ({ groupName, name, stackName }) => {
    const getBaseURL = () => {
        switch (stackName) {
            case 'pgadmin':
                return `${groupName}.im.dhis2.org/${name}-pgadmin`
            case 'dhis2-core':
                return `${groupName}.im.dhis2.org/${name}`
            default:
                return `${groupName}.im.dhis2.org/${name}`
        }
    }

    const handleClick = () => {
        const url = `https://${getBaseURL()}`
        window.open(url, '_blank', 'noopener,noreferrer')
    }

    return <MenuItem dense label="Open Instance" icon={<IconLaunch16 />} onClick={handleClick} />
}
