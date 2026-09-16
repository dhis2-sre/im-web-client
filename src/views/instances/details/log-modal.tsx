import { Button, ButtonStrip, Center, CircularLoader, Modal, ModalActions, ModalContent, ModalTitle, NoticeBox } from '@dhis2/ui'
import { useCallback, useEffect, useRef, useState } from 'react'
import type { FC } from 'react'
import { useAuthAxios } from '../../../hooks/index.ts'
import styles from './log-modal.module.css'

type LogModalProps = {
    instanceId: number
    componentName: string
    replica: string
    onClose: () => void
}

export const LogModal: FC<LogModalProps> = ({ instanceId, componentName, replica, onClose }) => {
    const [log, setLog] = useState('')
    const abortController = useRef<AbortController | null>(null)
    const [{ error }, requestLog] = useAuthAxios<string>(
        {
            method: 'GET',
            url: `/instances/${instanceId}/logs`,
            onDownloadProgress: (progressEvent) => {
                const request = progressEvent.event?.currentTarget as XMLHttpRequest | undefined
                setLog(request?.response ?? '')
            },
        },
        /* The way this endpoint behaves triggers the hook's autoCancel
         * behaviour. But we can disable that. */
        { manual: true, autoCancel: false, autoCatch: true }
    )

    /* The endpoint follows the log, so the request ends only when we abort it. Without this it
     * keeps downloading in the background once the modal is gone. */
    useEffect(() => {
        const controller = new AbortController()
        abortController.current = controller
        requestLog({ params: { selector: componentName, replica }, signal: controller.signal })

        return () => controller.abort()
    }, [requestLog, componentName, replica])

    const onCloseClick = useCallback(() => {
        abortController.current?.abort()
        onClose()
    }, [onClose])

    return (
        <Modal fluid onClose={onCloseClick}>
            <ModalTitle>Logs: {replica}</ModalTitle>
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
                    <Button onClick={onCloseClick}>Close</Button>
                </ButtonStrip>
            </ModalActions>
        </Modal>
    )
}
