import { Button, IconAdd24 } from '@dhis2/ui'
import type { FC } from 'react'
import { useCallback, useState } from 'react'
import { NewClusterModal } from './new-cluster-modal.tsx'

type NewClusterButtonProps = {
    onComplete: () => void
}

export const NewClusterButton: FC<NewClusterButtonProps> = ({ onComplete }) => {
    const [showModal, setShowModal] = useState<boolean>(false)
    const closeModal = useCallback(() => {
        setShowModal(false)
    }, [])
    const closeModalAndFetchList = useCallback(() => {
        setShowModal(false)
        onComplete()
    }, [onComplete])

    return (
        <>
            <Button icon={<IconAdd24 />} onClick={() => setShowModal(true)}>
                New cluster
            </Button>
            {showModal && <NewClusterModal onCancel={closeModal} onComplete={closeModalAndFetchList} />}
        </>
    )
}
