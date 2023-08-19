import { Button, IconAdd24 } from '@dhis2/ui'
import type { FC } from 'react'
import { useCallback, useState } from 'react'
import { NewGroupModal } from './new-group-modal'

type NewGroupButtonProps = {
    onComplete: Function
}

export const NewGroupButton: FC<NewGroupButtonProps> = ({ onComplete }) => {
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
                New group
            </Button>
            {showModal && <NewGroupModal onCancel={closeModal} onComplete={closeModalAndFetchList} />}
        </>
    )
}
