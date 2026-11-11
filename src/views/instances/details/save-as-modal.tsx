import { Button, ButtonStrip, InputField, Modal, ModalActions, ModalContent, ModalTitle, NoticeBox, SingleSelectField, SingleSelectOption } from '@dhis2/ui'
import type { FC } from 'react'
import { useState } from 'react'
import { useActionAlert } from '../../../components/index.ts'
import { useAuthAxios } from '../../../hooks/index.ts'
import { Database } from '../../../types/index.ts'
import { errorMessage } from '../../../utils/error-message.ts'
import styles from './save-as-modal.module.css'

type SaveAsModalProps = {
    instanceId: number
    instanceName: string
    groupName?: string
    onClose: () => void
}

const defaultFormat = 'custom'
const formats = new Map<string, { label: string; extension: string }>([
    ['custom', { label: 'Custom format (.pgc)', extension: '.pgc' }],
    ['plain', { label: 'Plain SQL (.sql.gz)', extension: '.sql.gz' }],
])

/* The request only starts the backup, so the dialog stays open until it is accepted and shows a refusal
 * in place rather than losing what was typed. */
export const SaveAsModal: FC<SaveAsModalProps> = ({ instanceId, instanceName, groupName, onClose }) => {
    const [name, setName] = useState(() => `${instanceName}-${new Date().toISOString().slice(0, 10)}`)
    const [format, setFormat] = useState(defaultFormat)
    const [error, setError] = useState<string>()
    const extension = formats.get(format)?.extension ?? ''
    const alert = useActionAlert()

    const [{ loading }, saveAs] = useAuthAxios<Database>({ url: `/databases/save-as/${instanceId}`, method: 'post' }, { manual: true, autoCancel: false })

    const submit = async () => {
        setError(undefined)
        try {
            await saveAs({ data: { name: name.trim() + extension, format } })
            alert.success(`Backing up ${instanceName}…`)
            onClose()
        } catch (caught) {
            console.error(caught)
            setError(errorMessage(caught))
        }
    }

    return (
        <Modal onClose={loading ? undefined : onClose}>
            <ModalTitle>Back up {instanceName}</ModalTitle>
            <ModalContent className={styles.container}>
                <p className={styles.note}>
                    Saves a copy of the instance&apos;s database and files
                    {groupName && (
                        <>
                            {' '}
                            to the <strong>{groupName}</strong> group
                        </>
                    )}
                    .
                </p>
                <div className={styles.fileAndExtension}>
                    <InputField className={styles.field} label="Backup name" value={name} onChange={({ value }) => setName(value ?? '')} required disabled={loading} />
                    <span className={styles.extension}>{extension}</span>
                </div>
                <SingleSelectField className={styles.field} selected={format} onChange={({ selected }) => setFormat(selected)} label="Format" disabled={loading}>
                    {Array.from(formats.entries()).map(([key, { label }]) => (
                        <SingleSelectOption key={key} label={label} value={key} />
                    ))}
                </SingleSelectField>
                {error && (
                    <NoticeBox error title="Couldn't start the backup">
                        {error}
                    </NoticeBox>
                )}
            </ModalContent>
            <ModalActions>
                <ButtonStrip end>
                    <Button secondary onClick={onClose} disabled={loading}>
                        Cancel
                    </Button>
                    <Button primary onClick={() => void submit()} disabled={!name.trim()} loading={loading}>
                        Back up
                    </Button>
                </ButtonStrip>
            </ModalActions>
        </Modal>
    )
}
