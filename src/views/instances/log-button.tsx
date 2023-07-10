import {
    Button,
    ButtonStrip,
    Center,
    CircularLoader,
    IconTerminalWindow16,
    Modal,
    ModalActions,
    ModalContent,
    ModalTitle,
    NoticeBox,
} from '@dhis2/ui'
import { useCallback, useState } from 'react'
import { useAuthAxios } from '../../hooks'
import { Instance } from '../../types'

type LogButtonProps = {
    instanceId: number
    instanceName: string
}

export const LogButton: React.FC<LogButtonProps> = ({ instanceId, instanceName }) => {
    const [showLogModal, setShowLogModal] = useState(false)
    const [log, setLog] = useState('')
    const [{ loading, error }, getLog] = useAuthAxios<Instance>(
        {
            method: 'GET',
            url: `instances/${instanceId}/logs`,
            onDownloadProgress: (progressEvent) => {
                setLog(progressEvent.event.currentTarget.response)
            },
        },
        {
            manual: true,
        }
    )
    const onClick = useCallback(() => {
        getLog()
        setShowLogModal(true)
    }, [getLog, setShowLogModal])

    const onClose = useCallback(() => {
        setShowLogModal(false)
    }, [setShowLogModal])

    return (
        <>
            <Button small secondary icon={IconTerminalWindow16} onClick={onClick}>
                Logs
            </Button>
            {showLogModal && (
                <Modal large onClose={onClose}>
                    <ModalTitle>{instanceName}</ModalTitle>
                    <ModalContent>
                        {loading && (
                            <Center>
                                <CircularLoader />
                            </Center>
                        )}
                        {error && (
                            <NoticeBox error title="Could not fetch the log">
                                {error.message}
                            </NoticeBox>
                        )}
                        {log && <pre>{log}</pre>}
                    </ModalContent>
                    <ModalActions>
                        <ButtonStrip end>
                            <Button primary onClick={onClose}>
                                Primary action
                            </Button>
                        </ButtonStrip>
                    </ModalActions>
                </Modal>
            )}
        </>
    )
}
