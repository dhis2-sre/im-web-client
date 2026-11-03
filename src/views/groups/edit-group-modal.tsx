import type { BaseButtonProps } from '@dhis2/ui'
import { Button, ButtonStrip, CheckboxField, InputField, Modal, ModalActions, ModalContent, ModalTitle, NoticeBox, SingleSelectField, SingleSelectOption } from '@dhis2/ui'
import type { FC } from 'react'
import { useCallback, useState } from 'react'
import { useAuthAxios } from '../../hooks/index.ts'
import { Cluster } from '../../types/generated/models/Cluster.ts'
import { Group } from '../../types/generated/models/Group.ts'
import { errorMessage } from '../../utils/error-message.ts'

type EditGroupModalProps = {
    group: Group
    onComplete: () => void
    onCancel: BaseButtonProps['onClick']
}

export const EditGroupModal: FC<EditGroupModalProps> = ({ group, onComplete, onCancel }) => {
    const [namespace, setNamespace] = useState(group.namespace ?? '')
    const [hostname, setHostname] = useState(group.hostname ?? '')
    const [description, setDescription] = useState(group.description ?? '')
    const [deployable, setDeployable] = useState(group.deployable ?? false)
    const [clusterId, setClusterId] = useState<string | undefined>(group.clusterId != null ? String(group.clusterId) : undefined)

    const [error, setError] = useState<string>()

    const [{ data: clusters }] = useAuthAxios<Cluster[]>('/clusters', { useCache: false })
    /* The select throws on a value none of its options has, which is every value until the clusters arrive. */
    const knownClusterId = clusters?.some((cluster) => String(cluster.id) === clusterId) ? clusterId : undefined
    const [{ loading }, updateGroup] = useAuthAxios<Group>({ url: `/groups/${group.name}`, method: 'PUT' }, { manual: true })

    const onSave = useCallback(async () => {
        setError(undefined)
        try {
            const data = {
                namespace,
                hostname,
                description,
                deployable,
                clusterId: clusterId != null ? Number(clusterId) : null,
            }
            await updateGroup({ data })
            onComplete()
        } catch (caught) {
            console.error(caught)
            setError(errorMessage(caught))
        }
    }, [namespace, hostname, description, deployable, clusterId, updateGroup, onComplete])

    const incomplete = !namespace.trim() || !hostname.trim() || !description.trim()

    return (
        <Modal onClose={loading ? undefined : () => onCancel({}, undefined satisfies React.MouseEvent<HTMLDivElement>)}>
            <ModalTitle>Edit {group.name}</ModalTitle>
            <ModalContent>
                <InputField label="Description" value={description} onChange={({ value }) => setDescription(value)} required disabled={loading} />
                <InputField label="Namespace" value={namespace} onChange={({ value }) => setNamespace(value)} required disabled={loading} />
                <InputField label="Hostname" value={hostname} onChange={({ value }) => setHostname(value)} required disabled={loading} />
                <SingleSelectField label="Cluster" selected={knownClusterId} onChange={({ selected }) => setClusterId(selected)} clearable disabled={loading}>
                    {(clusters ?? []).map((cluster) => (
                        <SingleSelectOption key={cluster.id} label={cluster.name} value={String(cluster.id)} />
                    ))}
                </SingleSelectField>
                <CheckboxField label="Members can create instances" checked={deployable} onChange={({ checked }) => setDeployable(checked)} disabled={loading} />
                {error && (
                    <NoticeBox error title={`Couldn't save ${group.name}`}>
                        {error}
                    </NoticeBox>
                )}
            </ModalContent>
            <ModalActions>
                <ButtonStrip end>
                    <Button secondary onClick={onCancel} disabled={loading}>
                        Cancel
                    </Button>
                    <Button primary onClick={onSave} disabled={incomplete} loading={loading}>
                        Save
                    </Button>
                </ButtonStrip>
            </ModalActions>
        </Modal>
    )
}
