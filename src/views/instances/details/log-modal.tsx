import { Button, ButtonStrip, Center, CircularLoader, Modal, ModalActions, ModalContent, ModalTitle, NoticeBox, SingleSelectField, SingleSelectOption } from '@dhis2/ui'
import { useCallback, useEffect, useRef, useState } from 'react'
import type { FC } from 'react'
import { useAuthAxios } from '../../../hooks/index.ts'
import styles from './log-modal.module.css'

type LogModalProps = {
    instanceId: number
    componentName: string
    replica: string
    containers: string[]
    onClose: () => void
}

export const LogModal: FC<LogModalProps> = ({ instanceId, componentName, replica, containers, onClose }) => {
    const [log, setLog] = useState('')
    /* Empty means whichever container the API picks, which is the first one the pod declares. Pods
     * running a single container never show the picker, so nothing else can be selected there. */
    const [container, setContainer] = useState('')
    /* The request is configured with the url alone so the hook keeps handing back the same execute
     * function: it compares the config, and a config carrying onDownloadProgress compares unequal
     * on every render. As an effect dependency that would re-issue the request for every chunk of
     * the log, an endless stream of requests for as long as the modal is open. */
    const [{ error }, requestLog, cancelLog] = useAuthAxios<string>(
        {
            method: 'GET',
            url: `/instances/${instanceId}/logs`,
        },
        { manual: true, autoCatch: true }
    )

    /* The endpoint follows the log, so the request ends only when it is cancelled. Cancelling is
     * the hook's own, which is what holds the abort signal; a signal passed in here is replaced. */
    useEffect(() => {
        let current = true
        setLog('')

        requestLog({
            params: { selector: componentName, replica, container },
            /* The growing response body is read off the request itself. Some progress events carry
             * no target, and a cancelled request can still deliver one, so anything but a string
             * from the current request leaves what is on screen alone. */
            onDownloadProgress: (progressEvent) => {
                const response = (progressEvent.event?.currentTarget as XMLHttpRequest | undefined)?.response
                if (current && typeof response === 'string') {
                    setLog(response)
                }
            },
        })

        return () => {
            current = false
            cancelLog()
        }
    }, [requestLog, cancelLog, componentName, replica, container])

    /* The log is followed, so new lines arrive for as long as the modal is open. The view stays at
     * the end as they do, unless the reader has scrolled up to look at something. */
    const logView = useRef<HTMLDivElement>(null)
    const followTail = useRef(true)

    const onScroll = useCallback(() => {
        const element = logView.current
        if (element) {
            followTail.current = element.scrollHeight - element.scrollTop - element.clientHeight < 32
        }
    }, [])

    useEffect(() => {
        const element = logView.current
        if (element && followTail.current) {
            element.scrollTop = element.scrollHeight
        }
    }, [log])

    return (
        <Modal fluid onClose={onClose}>
            <ModalTitle>Logs: {replica}</ModalTitle>
            <ModalContent>
                {containers.length > 1 && (
                    <SingleSelectField
                        dense
                        inputWidth="280px"
                        className={styles.picker}
                        label="Container"
                        selected={container || containers[0]}
                        onChange={({ selected }) => setContainer(selected)}
                    >
                        {containers.map((name) => (
                            <SingleSelectOption key={name} label={name} value={name} />
                        ))}
                    </SingleSelectField>
                )}
                <div className={styles.container} ref={logView} onScroll={onScroll}>
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
    )
}
