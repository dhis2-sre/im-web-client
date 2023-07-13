import { Button, ButtonStrip, Center, CircularLoader, IconTerminalWindow16, Modal, ModalActions, ModalContent, ModalTitle, NoticeBox } from '@dhis2/ui'
import { useCallback, useState } from 'react'
import { useAuthAxios } from '../../hooks'
import { Instance } from '../../types'
import styles from './log-button.module.css'
import type { FC } from 'react'

type LogButtonProps = {
    instanceId: number
    instanceName: string
}

export const LogButton: FC<LogButtonProps> = ({ instanceId, instanceName }) => {
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
            <Button small secondary icon={<IconTerminalWindow16 />} onClick={onClick}>
                Logs
            </Button>
            {showLogModal && (
                <Modal fluid onClose={onClose}>
                    <ModalTitle>Instance: {instanceName}</ModalTitle>
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
