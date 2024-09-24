import { useAlert } from '@dhis2/app-service-alerts'
import { Button, ButtonStrip, Center, CheckboxField, CircularLoader, InputField, Modal, ModalActions, ModalContent, ModalTitle } from '@dhis2/ui'
import type { BaseButtonProps } from '@dhis2/ui'
import cx from 'classnames'
import type { FC } from 'react'
import { useCallback, useState } from 'react'
import { useAuthAxios } from '../../hooks/index.ts'
import styles from './groups-list.module.css'

type NewGroupModalProps = {
    onComplete: () => void
    onCancel: BaseButtonProps['onClick']
}

export const NewGroupModal: FC<NewGroupModalProps> = ({ onComplete, onCancel }) => {
    const [name, setName] = useState('')
    const [hostname, setHostname] = useState('')
    const [description, setDescription] = useState('')
    const [deployable, setDeployable] = useState(true)

    const { show: showAlert } = useAlert(
        ({ message }) => message,
        ({ isCritical }) => (isCritical ? { critical: true } : { success: true })
    )

    const [{ loading }, createGroup] = useAuthAxios({ url: '/groups', method: 'POST' }, { manual: true })

    const onCreate = useCallback(async () => {
        try {
            const data = { name, hostname, description, deployable }
            await createGroup({ data })
            onComplete()
        } catch (error) {
            showAlert({ message: `There was an error when creating the group`, isCritical: true })
            console.error(error)
        }
    }, [createGroup, deployable, hostname, description, name, onComplete, showAlert])

    return (
        <Modal onClose={() => onCancel({}, undefined satisfies React.MouseEvent<HTMLDivElement>)}>
            <ModalTitle>New group</ModalTitle>
            <ModalContent>
                <InputField className={styles.field} label="Name" value={name} onChange={({ value }) => setName(value)} required />
                <InputField className={styles.field} label="Hostname" value={hostname} onChange={({ value }) => setHostname(value)} required />
                <InputField className={styles.field} label="Description" value={description} onChange={({ value }) => setDescription(value)} required />
                <CheckboxField className={cx(styles.field, styles.checkboxfield)} label="Deployable" checked={deployable} onChange={({ checked }) => setDeployable(checked)} />
            </ModalContent>
            <ModalActions>
                <ButtonStrip end>
                    <Button onClick={onCreate} disabled={loading}>
                        Create
                    </Button>
                    <Button onClick={onCancel} disabled={loading}>
                        Close
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
