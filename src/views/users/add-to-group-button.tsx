import { Button, IconAdd24 } from '@dhis2/ui'
import type { FC } from 'react'
import { useState } from 'react'
import {AddToGroupModal} from "./add-to-group-modal";

type AddToGroupButtonProps = {
    userId: Number
    onComplete: Function
}

export const AddToGroupButton: FC<AddToGroupButtonProps> = ({ userId, onComplete }) => {
    const [showModal, setShowModal] = useState<boolean>(false)

    const complete = () => {
        setShowModal(false)
        onComplete()
    }

    return (
        <>
            <Button icon={<IconAdd24 />} onClick={() => setShowModal(true)} />
            {showModal && <AddToGroupModal onClose={() => setShowModal(false)} onComplete={complete}  userId={userId}/>}
        </>
    )
}
