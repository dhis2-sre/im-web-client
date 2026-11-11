import { useState } from 'react'
import type { FC } from 'react'
import { useNavigate } from 'react-router-dom'
import { ActionsMenu, useActionAlert } from '../../../components/index.ts'
import { STACK_NAMES } from '../../../constants.ts'
import { useAuthAxios, useDatabaseLabel } from '../../../hooks/index.ts'
import type { Deployment, DeploymentInstanceComponents } from '../../../types/index.ts'
import { isDeploying, refusalMessage } from '../../../utils/deploy-state.ts'
import { SaveAsModal } from '../details/save-as-modal.tsx'
import { DATABASE_ID } from '../parameters.ts'

// A backup needs one target, so unlike restart and reset this resolves the one instance that owns
// the database, and it asks the components what they can do rather than matching on stack name.
const advertises = (components: DeploymentInstanceComponents[] | undefined, operation: string) =>
    components?.find((instance) => instance.components.some((component) => component.supportedOperations.includes(operation)))

/* Rendered only once the reset dialog opens, so a list of instances doesn't look up every database.
 * Until the name resolves, or where the list carries no parameters, it reads without one. */
const ResetMessage: FC<{ deployment: Deployment }> = ({ deployment }) => {
    const databaseId = deployment.instances?.map((instance) => instance.parameters?.[DATABASE_ID]?.value).find(Boolean)
    const { label, loading } = useDatabaseLabel(databaseId)
    const named = !loading && label && label !== databaseId

    return (
        <>
            Restores the instance to how it was deployed. The database
            {named && (
                <>
                    , <strong>{label}</strong>,
                </>
            )}{' '}
            goes back to its original state and any changes since are lost. This can&apos;t be undone.
        </>
    )
}

type InstanceActionsMenuProps = {
    deployment: Deployment
    components?: DeploymentInstanceComponents[]
    /* Off where Edit is already a button of its own, as on the details page. */
    includeEdit?: boolean
    /* Every action as a button instead of a menu, as on the details page. pgAdmin is left out there,
     * since its stack has an Open of its own. */
    buttons?: boolean
    onChanged: () => void
    onDeleted: () => void
}

/* Everything that can be done to a deployment as a whole, on its row in the list and on its own page.
 * Restart and reset act on every instance, and within each instance every component, since the
 * endpoints without a selector cover all of them. Instances are walked in the order the deployment
 * lists them, which is the order they were added, so a stack is acted on after whatever it depends
 * on. */
export const InstanceActionsMenu: FC<InstanceActionsMenuProps> = ({ deployment, components, includeEdit = true, buttons, onChanged, onDeleted }) => {
    const navigate = useNavigate()
    const alert = useActionAlert()
    const [savingAs, setSavingAs] = useState(false)
    const [, execute] = useAuthAxios({ method: 'PUT', url: '' }, { manual: true, autoCancel: false })
    const [, executeDelete] = useAuthAxios({ method: 'DELETE', url: `/deployments/${deployment.id}` }, { manual: true, autoCancel: false })

    const instances = deployment.instances ?? []
    const hasStacks = instances.length > 0
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
            alert.success(`${action === 'restart' ? 'Restarting' : 'Resetting'} ${name}…`)
            onChanged()
        } catch (error) {
            console.error(error)
            alert.error(`Couldn't ${action} ${name}`)
        }
    }

    const remove = async () => {
        try {
            await executeDelete()
            alert.success(`Deleted ${name}`)
            onDeleted()
        } catch (error) {
            console.error(error)
            alert.error(refusalMessage(error, `Couldn't delete ${name}`))
        }
    }

    return (
        <>
            <ActionsMenu
                label={`Actions for ${name}`}
                buttons={buttons}
                dataTest="deployment-actions-menu-button"
                items={[
                    includeEdit && {
                        label: 'Edit',
                        unavailable: deploying ? 'Unavailable while deploying' : undefined,
                        onClick: () => navigate(`/instances/${deployment.id}/edit`),
                    },
                    pgAdmin &&
                        !buttons && {
                            label: 'Open pgAdmin',
                            onClick: () => void window.open(`https://${deployment.group.hostname}/${name}-pgadmin`, '_blank', 'noopener,noreferrer'),
                        },
                    backupTarget && { label: 'Back up…', onClick: () => setSavingAs(true) },
                    /* A deployment whose first stack failed to save has nothing to restart or reset, but must still be deletable. */
                    hasStacks && {
                        label: 'Restart',
                        confirm: {
                            title: `Restart ${name}?`,
                            message: 'Every component restarts, so the instance is unavailable until they are back up.',
                            confirmLabel: 'Restart instance',
                        },
                        onClick: actOnAll('restart'),
                    },
                    hasStacks && {
                        label: 'Reset',
                        destructive: true,
                        confirm: {
                            title: `Reset ${name}?`,
                            message: <ResetMessage deployment={deployment} />,
                            confirmLabel: 'Reset instance',
                            destructive: true,
                        },
                        onClick: actOnAll('reset'),
                    },
                    {
                        label: 'Delete',
                        destructive: true,
                        unavailable: deploying ? 'Unavailable while deploying' : undefined,
                        confirm: {
                            title: `Delete ${name}?`,
                            message:
                                "Deletes the instance and everything in it: its database, files and settings. Saved databases and presets aren't affected. This can't be undone.",
                            confirmLabel: 'Delete instance',
                            destructive: true,
                            /* With one stack the instance is the stack, so listing it would only repeat the name. */
                            typed: { name, consequences: instances.length > 1 ? instances.map((instance) => instance.stackName) : undefined },
                        },
                        onClick: remove,
                    },
                ]}
            />
            {savingAs && backupTarget && (
                <SaveAsModal onClose={() => setSavingAs(false)} instanceId={backupTarget.instanceId} instanceName={name} groupName={deployment.groupName} />
            )}
        </>
    )
}
