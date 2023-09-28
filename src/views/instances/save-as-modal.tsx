import { Button, ButtonStrip, InputField, Modal, ModalActions, ModalContent, ModalTitle, SingleSelectField, SingleSelectOption } from '@dhis2/ui'
import styles from './save-as-modal.module.css'
import type { FC } from 'react'
import { useCallback, useState } from 'react'
import { useAuthAxios } from '../../hooks'
import { Database } from '../../types'
import { useAlert } from '@dhis2/app-service-alerts'
import fieldStyles from './parameter-field.module.css'

type SaveAsModalProps = {
    instanceId: Number
    instanceName: string
    onClose: Function
}

const defaultFormat = 'custom'
const formats = new Map<string, string>([
    ['custom', 'custom (pgc)'],
    ['plain', 'plain (sql.gz)'],
])

export const SaveAsModal: FC<SaveAsModalProps> = ({ instanceId, instanceName, onClose }) => {
    const [name, setName] = useState<string>('')
    const [format, setFormat] = useState<string>(defaultFormat)
    const { show: showAlert } = useAlert(
        ({ message }) => message,
        ({ isCritical }) => (isCritical ? { critical: true } : { success: true })
    )

    const [{ loading }, saveAs] = useAuthAxios<Database>(
        {
            url: `/databases/save-as/${instanceId}`,
            method: 'post',
            data: {
                name,
                format,
            },
        },
        { manual: true }
    )

    const submit = useCallback(async () => {
        try {
            await saveAs()
            showAlert({
                message: 'Save as request submitted successfully',
                isCritical: false,
            })
            onClose()
        } catch (error) {
            showAlert({
                message: 'There was a problem submitting the request',
                isCritical: true,
            })
            console.error(error)
        }
    }, [saveAs, showAlert, onClose])

    return (
        <Modal onClose={onClose}>
            <ModalTitle>Save "{instanceName}" database as</ModalTitle>
            <ModalContent className={styles.container}>
                <InputField className={fieldStyles.field} label="New name" value={name} onChange={({ value }) => setName(value)} required disabled={loading} />
                <SingleSelectField className={fieldStyles.field} selected={format} onChange={({ selected }) => setFormat(selected)} label="Format">
                    {Array.from(formats.keys()).map((key) => (
                        <SingleSelectOption key={key} label={formats.get(key)} value={key} />
                    ))}
                </SingleSelectField>
            </ModalContent>
            <ModalActions>
                <ButtonStrip end>
                    <Button onClick={submit} disabled={loading}>
                        Save
                    </Button>
                    <Button onClick={onClose}>Cancel</Button>
                </ButtonStrip>
            </ModalActions>
        </Modal>
    )
}