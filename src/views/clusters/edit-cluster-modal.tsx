import type { BaseButtonProps } from '@dhis2/ui'
import { Button, ButtonStrip, FileInputField, FileListItem, InputField, Modal, ModalActions, ModalContent, ModalTitle, NoticeBox } from '@dhis2/ui'
import type { FC } from 'react'
import { useCallback, useState } from 'react'
import { useActionAlert } from '../../components/index.ts'
import { useAuthAxios } from '../../hooks/index.ts'
import { Cluster } from '../../types/index.ts'
import { errorMessage } from '../../utils/error-message.ts'
import styles from './new-cluster-modal.module.css'

type EditClusterModalProps = {
    cluster: Cluster
    onComplete: () => void
    onCancel: BaseButtonProps['onClick']
}

export const EditClusterModal: FC<EditClusterModalProps> = ({ cluster, onComplete, onCancel }) => {
    const alert = useActionAlert()
    const [name, setName] = useState(cluster.name ?? '')
    const [description, setDescription] = useState(cluster.description ?? '')
    const [kubernetesConfiguration, setKubernetesConfiguration] = useState<File | null>(null)

    const [error, setError] = useState<string>()

    const [{ loading }, updateCluster] = useAuthAxios<Cluster>({ url: `/clusters/${cluster.id}`, method: 'PUT' }, { manual: true })

    const onFileSelect = useCallback(({ files }) => {
        setKubernetesConfiguration(files[0] ?? null)
    }, [])

    const onSave = useCallback(async () => {
        setError(undefined)
        try {
            const formData = new FormData()
            formData.append('name', name)
            formData.append('description', description)
            if (kubernetesConfiguration) {
                formData.append('kubernetesConfiguration', kubernetesConfiguration)
            }
            await updateCluster({ data: formData })
            alert.success(`Saved ${name}`)
            onComplete()
        } catch (caught) {
            console.error(caught)
            setError(errorMessage(caught))
        }
    }, [name, description, kubernetesConfiguration, updateCluster, onComplete, alert])

    return (
        <Modal onClose={loading ? undefined : () => onCancel({}, undefined satisfies React.MouseEvent<HTMLDivElement>)}>
            <ModalTitle>Edit {cluster.name}</ModalTitle>
            <ModalContent className={styles.container}>
                <InputField className={styles.field} label="Name" value={name} onChange={({ value }) => setName(value)} required disabled={loading} />
                <InputField className={styles.field} label="Description" value={description} onChange={({ value }) => setDescription(value)} required disabled={loading} />
                <FileInputField
                    className={styles.field}
                    label="Kubeconfig file"
                    buttonLabel="Replace file"
                    placeholder="No new file chosen"
                    helpText="Leave empty to keep the current file."
                    onChange={onFileSelect}
                    disabled={loading}
                >
                    {kubernetesConfiguration && <FileListItem label={kubernetesConfiguration.name} onRemove={() => setKubernetesConfiguration(null)} removeText="Remove" />}
                </FileInputField>
                {error && (
                    <NoticeBox error title={`Couldn't save ${cluster.name}`}>
                        {error}
                    </NoticeBox>
                )}
            </ModalContent>
            <ModalActions>
                <ButtonStrip end>
                    <Button secondary onClick={onCancel} disabled={loading}>
                        Cancel
                    </Button>
                    <Button primary onClick={onSave} disabled={!name.trim() || !description.trim()} loading={loading}>
                        Save
                    </Button>
                </ButtonStrip>
            </ModalActions>
        </Modal>
    )
}
