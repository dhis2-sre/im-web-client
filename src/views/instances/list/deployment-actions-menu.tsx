import { Button, IconLaunch16, IconMore24, Menu, MenuItem, Popover } from '@dhis2/ui'
import { useCallback, useRef, useState } from 'react'
import type { FC } from 'react'
import { STACK_NAMES } from '../../../constants.ts'
import { Deployment, DeploymentInstance } from '../../../types/index.ts'
import { OnActionCompletFn } from '../details/action-types.ts'
import { LogMenuItem } from '../details/log-menu-item.tsx'
import { ResetMenuItem } from '../details/reset-menu-item.tsx'
import { RestartMenuItem } from '../details/restart-menu-item.tsx'
import { SaveAsMenuItem } from '../details/save-as-menu-item.tsx'
import { DEPLOY_GLOWROOT } from '../new-dhis2/constants.ts'
import { Dhis2StackName } from '../new-dhis2/parameter-fieldset.tsx'
import { DeleteDeploymentMenuItem } from './delete-deployment-menu-item.tsx'

/* The instance users mean by "my instance": umbrella stacks are a single instance, while the
 * classic composition spreads over several, where dhis2-core is what logs, restart and reset
 * should target. */
const PRIMARY_STACKS = ['dhis2-v2', 'dhis2', STACK_NAMES.CORE]

/* Whichever instance owns the database that save-as dumps. */
const DATABASE_STACKS = [STACK_NAMES.DB, 'dhis2-v2', 'dhis2']

const findByStack = (instances: DeploymentInstance[], stackNames: string[]) =>
    stackNames.map((stackName) => instances.find((instance) => instance.stackName === stackName)).find(Boolean)

export const DeploymentActionsMenu: FC<{ deployment: Deployment; refetch: () => void }> = ({ deployment, refetch }) => {
    const anchor = useRef<HTMLSpanElement>(null)
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)

    const instances = deployment.instances ?? []
    const primary = findByStack(instances, PRIMARY_STACKS) ?? instances[0]
    const database = findByStack(instances, DATABASE_STACKS)
    const pgAdmin = findByStack(instances, [STACK_NAMES.PG_ADMIN])
    const glowrootEnabled = primary?.stackName === STACK_NAMES.CORE && primary?.parameters?.[DEPLOY_GLOWROOT]?.value === 'true'

    const onStart = useCallback(() => {
        setOpen(false)
        setLoading(true)
    }, [])

    const onComplete: OnActionCompletFn = useCallback(
        (shouldRefetch) => {
            setLoading(false)
            if (shouldRefetch) {
                refetch()
            }
        },
        [refetch]
    )

    const openPath = useCallback(
        (path: string) => {
            setOpen(false)
            window.open(`https://${deployment.group.hostname}/${path}`, '_blank', 'noopener,noreferrer')
        },
        [deployment.group.hostname]
    )

    if (!primary) {
        return null
    }

    return (
        // The row navigates to the details page on click; menu and modal clicks must not reach it.
        <span onClick={(event) => event.stopPropagation()}>
            <span ref={anchor}>
                <Button small secondary loading={loading} icon={<IconMore24 />} onClick={() => setOpen((current) => !current)} dataTest="deployment-actions-menu-button" />
            </span>
            {open && (
                <Popover onClickOutside={() => setOpen(false)} reference={anchor} placement="bottom-start">
                    <Menu>
                        <LogMenuItem instanceId={primary.id} stackName={primary.stackName as Dhis2StackName} />
                        {pgAdmin && <MenuItem dense icon={<IconLaunch16 />} label="Open pgAdmin" onClick={() => openPath(`${deployment.name}-pgadmin`)} />}
                        {glowrootEnabled && <MenuItem dense icon={<IconLaunch16 />} label="Open Glowroot" onClick={() => openPath(`${deployment.name}-glowroot`)} />}
                        {database && <SaveAsMenuItem instanceId={database.id} stackName={database.stackName} onStart={onStart} onComplete={onComplete} />}
                        <RestartMenuItem instanceId={primary.id} stackName={primary.stackName} onStart={onStart} onComplete={onComplete} />
                        <ResetMenuItem instanceId={primary.id} stackName={primary.stackName} onStart={onStart} onComplete={onComplete} />
                        <DeleteDeploymentMenuItem deploymentId={deployment.id} displayName={deployment.name} onStart={onStart} onComplete={onComplete} />
                    </Menu>
                </Popover>
            )}
        </span>
    )
}
