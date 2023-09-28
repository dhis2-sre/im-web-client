import {Button, IconSave16} from '@dhis2/ui'
import type {FC} from 'react'
import {useState} from 'react'
import {SaveAsModal} from "./save-as-modal";

type AddToGroupButtonProps = {
    instanceId: Number
    instanceName: string
}

export const SaveAsButton: FC<AddToGroupButtonProps> = ({instanceId, instanceName}) => {
    const [showModal, setShowModal] = useState<boolean>(false)

    return (
        <>
            <Button small secondary icon={<IconSave16 />} onClick={() => setShowModal(true)}>
                Save as
            </Button>
            {showModal &&
                <SaveAsModal onClose={() => setShowModal(false)} instanceId={instanceId} instanceName={instanceName}/>}
        </>
    )
}
