import type { BaseButtonProps } from '@dhis2/ui'
import { Button, ButtonStrip, FileInputField, FileListItem, InputField, Modal, ModalActions, ModalContent, ModalTitle, NoticeBox } from '@dhis2/ui'
import type { FC } from 'react'
import { useCallback, useState } from 'react'
import { useActionAlert } from '../../components/index.ts'
import { useAuthAxios } from '../../hooks/index.ts'
import { Cluster } from '../../types/index.ts'
import { errorMessage } from '../../utils/error-message.ts'
import styles from './new-cluster-modal.module.css'

type NewClusterModalProps = {
    onComplete: () => void
    onCancel: BaseButtonProps['onClick']
}

export const NewClusterModal: FC<NewClusterModalProps> = ({ onComplete, onCancel }) => {
    const [name, setName] = useState('')
    const [description, setDescription] = useState('')
    const [kubernetesConfiguration, setKubernetesConfiguration] = useState<File | null>(null)
    const [error, setError] = useState<string>()
    const alert = useActionAlert()

    const [{ loading }, createCluster] = useAuthAxios<Cluster>({ url: '/clusters', method: 'POST' }, { manual: true })

    const onFileSelect = useCallback(({ files }) => {
        setKubernetesConfiguration(files[0] ?? null)
    }, [])

    const onCreate = useCallback(async () => {
        if (!kubernetesConfiguration) {
            return
        }
        setError(undefined)
        try {
            const formData = new FormData()
            formData.append('name', name)
            formData.append('description', description)
            formData.append('kubernetesConfiguration', kubernetesConfiguration)
            await createCluster({ data: formData })
            alert.success(`Created ${name}`)
            onComplete()
        } catch (caught) {
            console.error(caught)
            setError(errorMessage(caught))
        }
    }, [name, description, kubernetesConfiguration, createCluster, onComplete, alert])

    return (
        <Modal onClose={loading ? undefined : () => onCancel({}, undefined satisfies React.MouseEvent<HTMLDivElement>)}>
            <ModalTitle>New cluster</ModalTitle>
            <ModalContent className={styles.container}>
                <InputField className={styles.field} label="Name" value={name} onChange={({ value }) => setName(value)} required disabled={loading} />
                <InputField className={styles.field} label="Description" value={description} onChange={({ value }) => setDescription(value)} required disabled={loading} />
                <FileInputField
                    className={styles.field}
                    label="Kubeconfig file"
                    buttonLabel="Choose file"
                    placeholder="No file chosen"
                    onChange={onFileSelect}
                    required
                    disabled={loading}
                >
                    {kubernetesConfiguration && <FileListItem label={kubernetesConfiguration.name} onRemove={() => setKubernetesConfiguration(null)} removeText="Remove" />}
                </FileInputField>
                {error && (
                    <NoticeBox error title="Couldn't create the cluster">
                        {error}
                    </NoticeBox>
                )}
            </ModalContent>
            <ModalActions>
                <ButtonStrip end>
                    <Button secondary onClick={onCancel} disabled={loading}>
                        Cancel
                    </Button>
                    <Button primary onClick={onCreate} disabled={!name.trim() || !description.trim() || !kubernetesConfiguration} loading={loading}>
                        Create cluster
                    </Button>
                </ButtonStrip>
            </ModalActions>
        </Modal>
    )
}
