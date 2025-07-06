import { Button, IconAdd24 } from '@dhis2/ui'
import type { FC } from 'react'

type NewClusterButtonProps = {
    onComplete: () => void
}

// TODO: See new NewGroupButton for inspiration

export const NewClusterButton: FC<NewClusterButtonProps> = ({ onComplete }) => {
    return (
        <Button icon={<IconAdd24 />} onClick={() => onComplete()}>
            New cluster
        </Button>
    )
}
