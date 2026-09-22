import { Button, IconEdit16, IconLaunch16, IconMore24, Menu, MenuItem, Popover } from '@dhis2/ui'
import { useCallback, useRef, useState } from 'react'
import type { FC } from 'react'
import { useNavigate } from 'react-router-dom'
import { STACK_NAMES } from '../../../constants.ts'
import { Deployment, DeploymentInstance, DeploymentInstanceComponents } from '../../../types/index.ts'
import { OnActionCompletFn } from '../details/action-types.ts'
import { SaveAsMenuItem } from '../details/save-as-menu-item.tsx'
import { DeploymentWideActionMenuItem } from './deployment-wide-action-menu-item.tsx'

// A backup needs one target, so unlike restart and reset this resolves the one instance that owns
// the database, and it asks the components what they can do rather than matching on stack name.
const advertises = (components: DeploymentInstanceComponents[] | undefined, operation: string) =>
    components?.find((instance) => instance.components.some((component) => component.supportedOperations.includes(operation)))

const findByStack = (instances: DeploymentInstance[], stackName: string) => instances.find((instance) => instance.stackName === stackName)

export const DeploymentActionsMenu: FC<{ deployment: Deployment; components?: DeploymentInstanceComponents[]; refetch: () => void }> = ({ deployment, components, refetch }) => {
    const anchor = useRef<HTMLSpanElement>(null)
    const navigate = useNavigate()
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)

    const instances = deployment.instances ?? []
    /* One backup covers the deployment: the dump and the file store are written together and linked,
     * so this offers a single action whenever any component can back either of them up, rather than
     * one per component, which would back the same pair up twice. */
    const database = advertises(components, 'databaseSave')
    const filestore = advertises(components, 'filestoreBackup')
    const backupTarget = database ?? filestore
    const savesFilestore = filestore !== undefined
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
                        <MenuItem dense icon={<IconEdit16 />} label="Edit" onClick={() => navigate(`/instances/${deployment.id}/edit`)} />
                        {pgAdmin && <MenuItem dense icon={<IconLaunch16 />} label="Open pgAdmin" onClick={() => openPath(`${deployment.name}-pgadmin`)} />}
                        {backupTarget && (
                            <SaveAsMenuItem
                                instanceId={backupTarget.instanceId}
                                stackName={backupTarget.stackName}
                                savesFilestore={savesFilestore}
                                onStart={onStart}
                                onComplete={onComplete}
                            />
                        )}
                        <DeploymentWideActionMenuItem action="restart" instances={instances} deploymentName={deployment.name} onStart={onStart} onComplete={onComplete} />
                        <DeploymentWideActionMenuItem action="reset" instances={instances} deploymentName={deployment.name} onStart={onStart} onComplete={onComplete} />
                    </Menu>
                </Popover>
            )}
        </span>
    )
}
