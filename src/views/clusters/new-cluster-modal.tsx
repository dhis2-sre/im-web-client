import { useAlert } from '@dhis2/app-service-alerts'
import type { BaseButtonProps } from '@dhis2/ui'
import { Button, ButtonStrip, FileInput, InputField, Modal, ModalActions, ModalContent, ModalTitle } from '@dhis2/ui'
import type { FC } from 'react'
import { useCallback, useState } from 'react'
import { useAuthAxios } from '../../hooks/index.ts'
import { Cluster } from '../../types/index.ts'
import styles from './new-cluster-modal.module.css'

type NewClusterModalProps = {
    onComplete: () => void
    onCancel: BaseButtonProps['onClick']
}

export const NewClusterModal: FC<NewClusterModalProps> = ({ onComplete, onCancel }) => {
    const [name, setName] = useState('')
    const [description, setDescription] = useState('')
    const [kubernetesConfiguration, setKubernetesConfiguration] = useState<File>(new Blob() as File)

    const { show: showAlert } = useAlert(
        ({ message }) => message,
        ({ isCritical }) => (isCritical ? { critical: true } : { success: true })
    )

    const [{ loading }, createCluster] = useAuthAxios<Cluster>(
        {
            url: '/clusters',
            method: 'POST',
        },
        { manual: true }
    )

    const onFileSelect = useCallback(({ files }) => {
        const uploadedFile = files[0]
        setKubernetesConfiguration(uploadedFile)
    }, [])

    const onCreate = useCallback(async () => {
        if (kubernetesConfiguration.size === 0) {
            showAlert({
                message: 'No Kubernetes configuration file selected',
                isCritical: true,
            })
            return
        }

        try {
            const formData = new FormData()
            formData.append('name', name)
            formData.append('description', description)
            formData.append('kubernetesConfiguration', kubernetesConfiguration)

            await createCluster({
                data: formData,
            })

            showAlert({
                message: 'Cluster created successfully',
                isCritical: false,
            })
            onComplete()
        } catch (error) {
            showAlert({
                message: 'There was an error when creating the cluster',
                isCritical: true,
            })
            console.error(error)
        }
    }, [name, description, kubernetesConfiguration, createCluster, onComplete, showAlert])

    return (
        <Modal onClose={() => onCancel({}, undefined satisfies React.MouseEvent<HTMLDivElement>)}>
            <ModalTitle>New cluster</ModalTitle>
            <ModalContent className={styles.container}>
                <InputField className={styles.field} label="Name" value={name} onChange={({ value }) => setName(value)} required disabled={loading} />
                <InputField className={styles.field} label="Description" value={description} onChange={({ value }) => setDescription(value)} required disabled={loading} />
                <FileInput buttonLabel="Select Kubernetes configuration" onChange={onFileSelect} disabled={loading} />
                <div className={styles.hint}>
                    The configuration file must be <b>encrypted</b>.
                </div>
            </ModalContent>
            <ModalActions>
                <ButtonStrip end>
                    <Button onClick={onCreate} disabled={loading || kubernetesConfiguration.size === 0}>
                        Create
                    </Button>
                    <Button onClick={onCancel} disabled={loading}>
                        Close
                    </Button>
                </ButtonStrip>
            </ModalActions>
        </Modal>
    )
}
