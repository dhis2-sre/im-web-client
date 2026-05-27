import { useAlert } from '@dhis2/app-service-alerts'
import type { BaseButtonProps } from '@dhis2/ui'
import { Button, ButtonStrip, Center, CheckboxField, CircularLoader, InputField, Modal, ModalActions, ModalContent, ModalTitle, SingleSelectField, SingleSelectOption } from '@dhis2/ui'
import cx from 'classnames'
import type { FC } from 'react'
import { useCallback, useState } from 'react'
import { useAuthAxios } from '../../hooks/index.ts'
import { Cluster } from '../../types/generated/models/Cluster.ts'
import { Group } from '../../types/generated/models/Group.ts'
import styles from './groups-list.module.css'

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

    const { show: showAlert } = useAlert(
        ({ message }) => message,
        ({ isCritical }) => (isCritical ? { critical: true } : { success: true })
    )

    const [{ data: clusters }] = useAuthAxios<Cluster[]>('/clusters', { useCache: false })
    const [{ loading }, updateGroup] = useAuthAxios<Group>({ url: `/groups/${group.name}`, method: 'PUT' }, { manual: true })

    const onSave = useCallback(async () => {
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
        } catch (error) {
            showAlert({ message: `There was an error when updating the group`, isCritical: true })
            console.error(error)
        }
    }, [namespace, hostname, description, deployable, clusterId, updateGroup, onComplete, showAlert])

    return (
        <Modal onClose={() => onCancel({}, undefined satisfies React.MouseEvent<HTMLDivElement>)}>
            <ModalTitle>Edit group</ModalTitle>
            <ModalContent>
                <InputField className={styles.field} label="Namespace" value={namespace} onChange={({ value }) => setNamespace(value)} required />
                <InputField className={styles.field} label="Hostname" value={hostname} onChange={({ value }) => setHostname(value)} required />
                <InputField className={styles.field} label="Description" value={description} onChange={({ value }) => setDescription(value)} required />
                <CheckboxField className={cx(styles.field, styles.checkboxfield)} label="Deployable" checked={deployable} onChange={({ checked }) => setDeployable(checked)} />
                <SingleSelectField className={styles.field} label="Cluster" selected={clusterId} onChange={({ selected }) => setClusterId(selected)} clearable>
                    {(clusters ?? []).map((cluster) => (
                        <SingleSelectOption key={cluster.id} label={cluster.name} value={String(cluster.id)} />
                    ))}
                </SingleSelectField>
            </ModalContent>
            <ModalActions>
                <ButtonStrip end>
                    <Button onClick={onSave} disabled={loading} primary>
                        Save
                    </Button>
                    <Button onClick={onCancel} disabled={loading}>
                        Cancel
                    </Button>
                </ButtonStrip>
            </ModalActions>
            {loading && (
                <Center>
                    <CircularLoader />
                </Center>
            )}
        </Modal>
    )
}
