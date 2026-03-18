import { Button, IconLaunch16 } from '@dhis2/ui'
import type { FC } from 'react'
import { STACK_NAMES } from '../../../constants.ts'
import { Group } from '../../../types/generated/models/Group.ts'
import { DeploymentInstanceParameters } from '../../../types/index.ts'
import { DEPLOY_GLOWROOT } from '../new-dhis2/constants.ts'

type ViewInstanceMenuItemProps = {
    group: Group
    name: string
    stackName: string
    parameters: DeploymentInstanceParameters
}

export const ViewInstanceMenuItem: FC<ViewInstanceMenuItemProps> = ({ group, name, stackName, parameters }) => {
    const basePath = name
    const instancePath = stackName === STACK_NAMES.PG_ADMIN ? `${basePath}-pgadmin` : basePath
    const url = `https://${group.hostname}/${instancePath}`

    const glowrootEnabled = stackName === STACK_NAMES.CORE && parameters[DEPLOY_GLOWROOT]?.value === 'true'
    const glowrootUrl = `https://${group.hostname}/${basePath}-glowroot`

    return (
        <>
            <Button small secondary icon={<IconLaunch16 />} onClick={() => window.open(url, '_blank', 'noopener,noreferrer')}>
                Open
            </Button>
            &nbsp;
            {glowrootEnabled && (
                <Button small secondary icon={<IconLaunch16 />} onClick={() => window.open(glowrootUrl, '_blank', 'noopener,noreferrer')}>
                    Glowroot
                </Button>
            )}
        </>
    )
}
