import { Button, IconLaunch16, IconMore24, Menu, MenuItem, Popover } from '@dhis2/ui'
import { useCallback, useRef, useState } from 'react'
import type { FC } from 'react'
import { STACK_NAMES } from '../../../constants.ts'
import { Deployment, DeploymentInstance } from '../../../types/index.ts'
import { OnActionCompletFn } from '../details/action-types.ts'
import { SaveAsMenuItem } from '../details/save-as-menu-item.tsx'
import { DeploymentWideActionMenuItem } from './deployment-wide-action-menu-item.tsx'

// A dump needs one target, so unlike restart and reset this resolves the instance that owns the database.
const findByStack = (instances: DeploymentInstance[], stackName: string) => instances.find((instance) => instance.stackName === stackName)

export const DeploymentActionsMenu: FC<{ deployment: Deployment; refetch: () => void }> = ({ deployment, refetch }) => {
    const anchor = useRef<HTMLSpanElement>(null)
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)

    const instances = deployment.instances ?? []
    const database = findByStack(instances, STACK_NAMES.DHIS2)
    const pgAdmin = findByStack(instances, STACK_NAMES.PG_ADMIN)

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

    if (instances.length === 0) {
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
                        {pgAdmin && <MenuItem dense icon={<IconLaunch16 />} label="Open pgAdmin" onClick={() => openPath(`${deployment.name}-pgadmin`)} />}
                        {database && <SaveAsMenuItem instanceId={database.id} stackName={database.stackName} onStart={onStart} onComplete={onComplete} />}
                        <DeploymentWideActionMenuItem action="restart" instances={instances} deploymentName={deployment.name} onStart={onStart} onComplete={onComplete} />
                        <DeploymentWideActionMenuItem action="reset" instances={instances} deploymentName={deployment.name} onStart={onStart} onComplete={onComplete} />
                    </Menu>
                </Popover>
            )}
        </span>
    )
}
