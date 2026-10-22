import { IconClockHistory16, IconDelete16, IconEdit16, IconLaunch16, IconSave16, IconSync16 } from '@dhis2/ui'
import { useState } from 'react'
import type { FC } from 'react'
import { useNavigate } from 'react-router-dom'
import { ActionsMenu, useActionAlert } from '../../../components/index.ts'
import { STACK_NAMES } from '../../../constants.ts'
import { useAuthAxios } from '../../../hooks/index.ts'
import type { Deployment, DeploymentInstanceComponents } from '../../../types/index.ts'
import { DEPLOYING_REFUSAL, isDeploying, refusalMessage } from '../../../utils/deploy-state.ts'
import { SaveAsModal } from '../details/save-as-modal.tsx'

// A backup needs one target, so unlike restart and reset this resolves the one instance that owns
// the database, and it asks the components what they can do rather than matching on stack name.
const advertises = (components: DeploymentInstanceComponents[] | undefined, operation: string) =>
    components?.find((instance) => instance.components.some((component) => component.supportedOperations.includes(operation)))

type InstanceActionsMenuProps = {
    deployment: Deployment
    components?: DeploymentInstanceComponents[]
    /* Off where Edit is already a button of its own, as on the details page. */
    includeEdit?: boolean
    onChanged: () => void
    onDeleted: () => void
}

/* Everything that can be done to a deployment as a whole, on its row in the list and on its own page.
 * Restart and reset act on every instance, and within each instance every component, since the
 * endpoints without a selector cover all of them. Instances are walked in the order the deployment
 * lists them, which is the order they were added, so a stack is acted on after whatever it depends
 * on. */
export const InstanceActionsMenu: FC<InstanceActionsMenuProps> = ({ deployment, components, includeEdit = true, onChanged, onDeleted }) => {
    const navigate = useNavigate()
    const alert = useActionAlert()
    const [savingAs, setSavingAs] = useState(false)
    const [backupRunning, setBackupRunning] = useState(false)
    const [, execute] = useAuthAxios({ method: 'PUT', url: '' }, { manual: true, autoCancel: false })
    const [, executeDelete] = useAuthAxios({ method: 'DELETE', url: `/deployments/${deployment.id}` }, { manual: true, autoCancel: false })

    const instances = deployment.instances ?? []
    const deploying = isDeploying(deployment)
    const name = deployment.name
    /* One backup covers the deployment: the dump and the file store are written together and linked,
     * so this offers a single action whenever any component can back either of them up, rather than
     * one per component, which would back the same pair up twice. */
    const database = advertises(components, 'databaseSave')
    const filestore = advertises(components, 'filestoreBackup')
    const backupTarget = database ?? filestore
    const pgAdmin = instances.some((instance) => instance.stackName === STACK_NAMES.PG_ADMIN)

    const actOnAll = (action: 'restart' | 'reset') => async () => {
        try {
            for (const instance of instances) {
                await execute({ url: `/instances/${instance.id}/${action}` })
            }
            alert.success(`Successfully requested ${action} of "${name}"`)
            onChanged()
        } catch (error) {
            console.error(error)
            alert.error(`There was an error when trying to ${action} "${name}"`)
        }
    }

    const remove = async () => {
        try {
            await executeDelete()
            alert.success(`Successfully deleted instance "${name}"`)
            onDeleted()
        } catch (error) {
            console.error(error)
            alert.error(refusalMessage(error, `There was an error when deleting instance "${name}"`))
        }
    }

    if (instances.length === 0) {
        return null
    }

    return (
        <>
            <ActionsMenu
                label={`Actions for ${name}`}
                busy={backupRunning}
                dataTest="deployment-actions-menu-button"
                items={[
                    includeEdit && {
                        label: 'Edit',
                        icon: <IconEdit16 />,
                        disabled: deploying,
                        title: deploying ? DEPLOYING_REFUSAL : undefined,
                        onClick: () => navigate(`/instances/${deployment.id}/edit`),
                    },
                    pgAdmin && {
                        label: 'Open pgAdmin',
                        icon: <IconLaunch16 />,
                        onClick: () => void window.open(`https://${deployment.group.hostname}/${name}-pgadmin`, '_blank', 'noopener,noreferrer'),
                    },
                    backupTarget && { label: 'Backup', icon: <IconSave16 />, onClick: () => setSavingAs(true) },
                    {
                        label: 'Restart',
                        icon: <IconSync16 />,
                        confirm: { title: 'Restart instance', message: `Restart every component of "${name}"?`, confirmLabel: 'Restart' },
                        onClick: actOnAll('restart'),
                    },
                    {
                        label: 'Reset',
                        icon: <IconClockHistory16 />,
                        destructive: true,
                        confirm: { title: 'Reset instance', message: `Reset every component of "${name}"?`, confirmLabel: 'Reset', destructive: true },
                        onClick: actOnAll('reset'),
                    },
                    {
                        label: 'Delete',
                        icon: <IconDelete16 />,
                        destructive: true,
                        disabled: deploying,
                        title: deploying ? DEPLOYING_REFUSAL : undefined,
                        confirm: {
                            title: 'Delete instance',
                            message: (
                                <>
                                    Delete the instance <strong>{name}</strong>? This cannot be undone.
                                </>
                            ),
                            confirmLabel: 'Delete',
                            destructive: true,
                            typed: { name, consequences: instances.map((instance) => `The ${instance.stackName} stack and its components`) },
                        },
                        onClick: remove,
                    },
                ]}
            />
            {savingAs && backupTarget && (
                <SaveAsModal
                    onClose={() => setSavingAs(false)}
                    instanceId={backupTarget.instanceId}
                    stackName={backupTarget.stackName}
                    savesFilestore={filestore !== undefined}
                    onStart={() => {
                        setSavingAs(false)
                        setBackupRunning(true)
                    }}
                    onComplete={() => setBackupRunning(false)}
                />
            )}
        </>
    )
}
