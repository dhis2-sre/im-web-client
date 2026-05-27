import { useAlert } from '@dhis2/app-service-alerts'
import type { BaseButtonProps } from '@dhis2/ui'
import { Button, ButtonStrip, FileInput, InputField, Modal, ModalActions, ModalContent, ModalTitle } from '@dhis2/ui'
import type { FC } from 'react'
import { useCallback, useState } from 'react'
import { useAuthAxios } from '../../hooks/index.ts'
import { Cluster } from '../../types/index.ts'
import styles from './new-cluster-modal.module.css'

type EditClusterModalProps = {
    cluster: Cluster
    onComplete: () => void
    onCancel: BaseButtonProps['onClick']
}

export const EditClusterModal: FC<EditClusterModalProps> = ({ cluster, onComplete, onCancel }) => {
    const [name, setName] = useState(cluster.name ?? '')
    const [description, setDescription] = useState(cluster.description ?? '')
    const [kubernetesConfiguration, setKubernetesConfiguration] = useState<File | null>(null)

    const { show: showAlert } = useAlert(
        ({ message }) => message,
        ({ isCritical }) => (isCritical ? { critical: true } : { success: true })
    )

    const [{ loading }, updateCluster] = useAuthAxios<Cluster>({ url: `/clusters/${cluster.id}`, method: 'PUT' }, { manual: true })

    const onFileSelect = useCallback(({ files }) => {
        setKubernetesConfiguration(files[0] ?? null)
    }, [])

    const onSave = useCallback(async () => {
        try {
            const formData = new FormData()
            formData.append('name', name)
            formData.append('description', description)
            if (kubernetesConfiguration) {
                formData.append('kubernetesConfiguration', kubernetesConfiguration)
            }
            await updateCluster({ data: formData })
            onComplete()
        } catch (error) {
            showAlert({ message: 'There was an error when updating the cluster', isCritical: true })
            console.error(error)
        }
    }, [name, description, kubernetesConfiguration, updateCluster, onComplete, showAlert])

    return (
        <Modal onClose={() => onCancel({}, undefined satisfies React.MouseEvent<HTMLDivElement>)}>
            <ModalTitle>Edit cluster</ModalTitle>
            <ModalContent className={styles.container}>
                <InputField className={styles.field} label="Name" value={name} onChange={({ value }) => setName(value)} required disabled={loading} />
                <InputField className={styles.field} label="Description" value={description} onChange={({ value }) => setDescription(value)} required disabled={loading} />
                <FileInput buttonLabel="Replace Kubernetes configuration" onChange={onFileSelect} disabled={loading} />
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
        </Modal>
    )
}
