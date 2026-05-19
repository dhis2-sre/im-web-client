import { Button, IconAdd16 } from '@dhis2/ui'
import type { FC } from 'react'
import { useState } from 'react'
import { User } from '../../types/index.ts'
import { AddToGroupAdminModal } from './add-to-group-admin-modal.tsx'

type AddToGroupAdminButtonProps = {
    user: User
    onComplete: () => void
}

export const AddToGroupAdminButton: FC<AddToGroupAdminButtonProps> = ({ user, onComplete }) => {
    const [showModal, setShowModal] = useState<boolean>(false)

    const complete = () => {
        setShowModal(false)
        onComplete()
    }

    return (
        <>
            <Button secondary icon={<IconAdd16 />} onClick={() => setShowModal(true)}>
                Add Groups Admin
            </Button>
            {showModal && <AddToGroupAdminModal onClose={() => setShowModal(false)} onComplete={complete} user={user} />}
        </>
    )
}
