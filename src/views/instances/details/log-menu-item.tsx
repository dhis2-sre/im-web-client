import { Button, ButtonStrip, Center, CircularLoader, IconTerminalWindow16, Modal, ModalActions, ModalContent, ModalTitle, NoticeBox, MenuItem } from '@dhis2/ui'
import { useCallback, useState } from 'react'
import { useAuthAxios } from '../../../hooks'
import { Instance } from '../../../types'
import styles from './log-menu-item.module.css'
import type { FC } from 'react'
import { Dhis2StackName } from '../new-dhis2/parameter-fieldset'

type LogMenuItemProps = {
    instanceId: number
    stackName: Dhis2StackName
}

export const LogMenuItem: FC<LogMenuItemProps> = ({ instanceId, stackName }) => {
    const [showLogModal, setShowLogModal] = useState(false)
    const [log, setLog] = useState('')
    const [{ error }, requestLog] = useAuthAxios<Instance>(
        {
            method: 'GET',
            url: `/instances/${instanceId}/logs`,
            onDownloadProgress: (progressEvent) => {
                setLog(progressEvent.event.currentTarget.response)
            },
        },
        /* The way this endpoint behaves triggers the hook's autoCancel
         * behaviour. But we can disable that. */
        { manual: true, autoCancel: false, autoCatch: true }
    )

    const onClick = useCallback(() => {
        requestLog()
        setShowLogModal(true)
    }, [requestLog, setShowLogModal])

    const onClose = useCallback(() => {
        setShowLogModal(false)
    }, [setShowLogModal])

    return (
        <>
            <MenuItem dense icon={<IconTerminalWindow16 />} onClick={onClick} label="Logs" />
            {showLogModal && (
                <Modal fluid onClose={onClose}>
                    <ModalTitle>Instance: {stackName}</ModalTitle>
                    <ModalContent>
                        <div className={styles.container}>
                            {!log && !error && (
                                <Center>
                                    <CircularLoader />
                                </Center>
                            )}
                            {error && (
                                <NoticeBox error title="Could not fetch the log">
                                    {error.message}
                                </NoticeBox>
                            )}
                            {log && !error && <pre>{log}</pre>}
                        </div>
                    </ModalContent>
                    <ModalActions>
                        <ButtonStrip end>
                            <Button onClick={onClose}>Close</Button>
                        </ButtonStrip>
                    </ModalActions>
                </Modal>
            )}
        </>
    )
}
