import { Button, ButtonStrip, Center, CheckboxField, CircularLoader, InputField, Modal, ModalActions, ModalContent, ModalTitle } from '@dhis2/ui'
import cx from 'classnames'
import styles from './groups-list.module.css'
import type { FC } from 'react'
import { useCallback, useState } from 'react'
import { useAuthAxios } from '../../hooks'
import { useAlert } from '@dhis2/app-service-alerts'

type NewGroupModalProps = {
    onClose: Function
}

export const NewGroupModal: FC<NewGroupModalProps> = ({ onClose }) => {
    const [name, setName] = useState('')
    const [hostname, setHostname] = useState('')
    const [deployable, setDeployable] = useState(true)

    const { show: showAlert } = useAlert(
        ({ message }) => message,
        ({ isCritical }) => (isCritical ? { critical: true } : { success: true })
    )

    const [{ loading }, createGroup] = useAuthAxios({ url: '/groups', method: 'POST' }, { manual: true })

    const onCreate = useCallback(async () => {
        try {
            const data = { name, hostname, deployable }
            await createGroup({ data })
            onClose()
        } catch (error) {
            showAlert({ message: `There was an error when creating the group`, isCritical: true })
            console.error(error)
        }
    }, [createGroup, deployable, hostname, name, onClose, showAlert])

    return (
        <Modal fluid onClose={onClose}>
            <ModalTitle>New group</ModalTitle>
            <ModalContent>
                <InputField className={styles.field} label="Name" value={name} onChange={({ value }) => setName(value)} required />
                <InputField className={styles.field} label="Hostname" value={hostname} onChange={({ value }) => setHostname(value)} required />
                <CheckboxField className={cx(styles.field, styles.checkboxfield)} label="Deployable" checked={deployable} onChange={({ checked }) => setDeployable(checked)} />
            </ModalContent>
            <ModalActions>
                <ButtonStrip end>
                    <Button onClick={onCreate} disabled={loading}>
                        Create
                    </Button>
                    <Button onClick={onClose} disabled={loading}>
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
