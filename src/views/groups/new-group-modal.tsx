import type { BaseButtonProps } from '@dhis2/ui'
import { Button, ButtonStrip, CheckboxField, InputField, Modal, ModalActions, ModalContent, ModalTitle, NoticeBox, SingleSelectField, SingleSelectOption } from '@dhis2/ui'
import type { FC } from 'react'
import { useCallback, useState } from 'react'
import { useActionAlert } from '../../components/index.ts'
import { useAuthAxios } from '../../hooks/index.ts'
import { Cluster } from '../../types/generated/models/Cluster.ts'
import { Group } from '../../types/generated/models/Group.ts'
import { errorMessage } from '../../utils/error-message.ts'

type NewGroupModalProps = {
    onComplete: () => void
    onCancel: BaseButtonProps['onClick']
}

export const NewGroupModal: FC<NewGroupModalProps> = ({ onComplete, onCancel }) => {
    const alert = useActionAlert()
    const [name, setName] = useState('')
    const [namespace, setNamespace] = useState('')
    const [hostname, setHostname] = useState('')
    const [description, setDescription] = useState('')
    const [deployable, setDeployable] = useState(true)
    const [clusterId, setClusterId] = useState<string | undefined>(undefined)

    const [error, setError] = useState<string>()

    const [{ data: clusters }] = useAuthAxios<Cluster[]>({ method: 'GET', url: '/clusters' })

    /* The select throws on a value none of its options has, which is every value until the clusters arrive. */
    const knownClusterId = clusters?.some((cluster) => String(cluster.id) === clusterId) ? clusterId : undefined
    const [{ loading }, createGroup] = useAuthAxios<Group>({ url: '/groups', method: 'POST' }, { manual: true })

    const onCreate = useCallback(async () => {
        setError(undefined)
        try {
            const data = { name, namespace, hostname, description, deployable, ...(clusterId ? { clusterId: Number(clusterId) } : {}) }
            await createGroup({ data })
            alert.success(`Created ${name}`)
            onComplete()
        } catch (caught) {
            console.error(caught)
            setError(errorMessage(caught))
        }
    }, [name, namespace, hostname, description, deployable, clusterId, createGroup, onComplete, alert])

    const incomplete = !name.trim() || !namespace.trim() || !hostname.trim() || !description.trim()

    return (
        <Modal onClose={loading ? undefined : () => onCancel({}, undefined satisfies React.MouseEvent<HTMLDivElement>)}>
            <ModalTitle>New group</ModalTitle>
            <ModalContent>
                <InputField label="Name" value={name} onChange={({ value }) => setName(value)} required disabled={loading} />
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
                    <NoticeBox error title="Couldn't create the group">
                        {error}
                    </NoticeBox>
                )}
            </ModalContent>
            <ModalActions>
                <ButtonStrip end>
                    <Button secondary onClick={onCancel} disabled={loading}>
                        Cancel
                    </Button>
                    <Button primary onClick={onCreate} disabled={incomplete} loading={loading}>
                        Create group
                    </Button>
                </ButtonStrip>
            </ModalActions>
        </Modal>
    )
}
