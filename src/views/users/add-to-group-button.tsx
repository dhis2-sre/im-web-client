import { Button, IconAdd16 } from '@dhis2/ui'
import type { FC } from 'react'
import { useState } from 'react'
import { User } from '../../types/index.ts'
import { AddToGroupModal } from './add-to-group-modal.tsx'

type AddToGroupButtonProps = {
    user: User
    onComplete: () => void
}

export const AddToGroupButton: FC<AddToGroupButtonProps> = ({ user, onComplete }) => {
    const [showModal, setShowModal] = useState<boolean>(false)

    const complete = () => {
        setShowModal(false)
        onComplete()
    }

    return (
        <>
            <Button secondary icon={<IconAdd16 />} onClick={() => setShowModal(true)}>
                Add Groups
            </Button>
            {showModal && <AddToGroupModal onClose={() => setShowModal(false)} onComplete={complete} user={user} />}
        </>
    )
}
