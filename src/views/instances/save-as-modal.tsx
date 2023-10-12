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
const formats = new Map<string, { label: string; extension: string }>([
    ['custom', { label: 'custom (pgc)', extension: '.pgc' }],
    ['plain', { label: 'plain (sql.gz)', extension: '.sql.gz' }],
])

export const SaveAsModal: FC<SaveAsModalProps> = ({ instanceId, instanceName, onClose }) => {
    const [name, setName] = useState<string>('')
    const [format, setFormat] = useState<string>(defaultFormat)
    const [extension, setExtension] = useState<string>(formats.get(defaultFormat).extension)
    const { show: showAlert } = useAlert(
        ({ message }) => message,
        ({ isCritical }) => (isCritical ? { critical: true } : { success: true })
    )

    const [{ loading }, saveAs] = useAuthAxios<Database>(
        {
            url: `/databases/save-as/${instanceId}`,
            method: 'post',
            data: {
                name: name + extension,
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

    const onSelectChange = useCallback(
        ({ selected }) => {
            setFormat(selected)
            setExtension(formats.get(selected).extension)
        },
        [setFormat, setExtension]
    )

    return (
        <Modal onClose={onClose}>
            <ModalTitle>Save "{instanceName}" database as</ModalTitle>
            <ModalContent className={styles.container}>
                <InputField className={fieldStyles.field} label="New name" value={name} onChange={({ value }) => setName(value)} required disabled={loading} /> {extension}
                <SingleSelectField className={fieldStyles.field} selected={format} onChange={onSelectChange} label="Format">
                    {Array.from(formats.keys()).map((key) => (
                        <SingleSelectOption key={key} label={formats.get(key).label} value={key} />
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
