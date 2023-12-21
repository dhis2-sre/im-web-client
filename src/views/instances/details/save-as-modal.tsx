import { Button, ButtonStrip, InputField, Modal, ModalActions, ModalContent, ModalTitle, SingleSelectField, SingleSelectOption } from '@dhis2/ui'
import styles from './save-as-modal.module.css'
import type { FC } from 'react'
import { useCallback, useState } from 'react'
import { useAuthAxios } from '../../../hooks'
import { Database } from '../../../types'
import { useAlert } from '@dhis2/app-service-alerts'
import { AsyncActionProps } from './actions-dropdown-menu'

interface SaveAsModalProps extends AsyncActionProps {
    onClose: () => void
}

const defaultFormat = 'custom'
const formats = new Map<string, { label: string; extension: string }>([
    ['custom', { label: 'custom (pgc)', extension: '.pgc' }],
    ['plain', { label: 'plain (sql.gz)', extension: '.sql.gz' }],
])

export const SaveAsModal: FC<SaveAsModalProps> = ({ instanceId, stackName, onClose, onStart, onComplete }) => {
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
        { manual: true, autoCancel: false }
    )

    const submit = useCallback(async () => {
        try {
            onStart()
            await saveAs()
            showAlert({
                message: 'Save as request submitted successfully',
                isCritical: false,
            })
            onClose()
            /* No need to refetch the instance list since this
             * adds a DB not an instance */
            onComplete(false)
        } catch (error) {
            showAlert({
                message: 'There was a problem submitting the request',
                isCritical: true,
            })
            console.error(error)
            onComplete(false)
        }
    }, [saveAs, showAlert, onClose, onStart, onComplete])

    const onSelectChange = useCallback(
        ({ selected }) => {
            setFormat(selected)
            setExtension(formats.get(selected).extension)
        },
        [setFormat, setExtension]
    )

    return (
        <Modal onClose={onClose}>
            <ModalTitle>Save "{stackName}" database as</ModalTitle>
            <ModalContent className={styles.container}>
                <div className={styles.fileAndExtension}>
                    <InputField className={styles.field} label="New name" value={name} onChange={({ value }) => setName(value)} required disabled={loading} />
                    <span className={styles.extension}>{extension}</span>
                </div>
                <SingleSelectField className={styles.field} selected={format} onChange={onSelectChange} label="Format">
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
