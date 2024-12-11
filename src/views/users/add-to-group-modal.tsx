import { Modal, ModalContent, ModalTitle, Transfer } from '@dhis2/ui'
import type { BaseButtonProps } from '@dhis2/ui'
import type { FC } from 'react'
import { useState } from 'react'
import { useAuthAxios } from '../../hooks/index.ts'
import { Group, User } from '../../types/index.ts'
import styles from './add-to-group-modal.module.css'
import { useAddGroups } from './use-add-groups.tsx'

type AddToGroupModalProps = {
    user: User
    onClose: BaseButtonProps['onClick']
    onComplete: () => void
}

export const AddToGroupModal: FC<AddToGroupModalProps> = ({ user, onClose, onComplete }) => {
    const [{ data: groups }] = useAuthAxios<Group[]>({
        method: 'GET',
        url: '/groups',
    })

    const { addGroups, addGroupLoading } = useAddGroups()

    const [selectedGroups, setSelectedGroups] = useState<string[]>([])

    const filteredGroups = groups?.filter((group) => !user?.groups.some((userGroup) => userGroup.name === group.name))

    const groupOptions =
        filteredGroups?.map((group) => ({
            label: group.name,
            value: group.name,
        })) || []

    const onChange = async ({ selected }: { selected: string[] }) => {
        setSelectedGroups(selected)
        await addGroups(selected, user.id)
        onComplete()
        onClose({}, undefined satisfies React.MouseEvent<HTMLDivElement>)
    }

    return (
        <Modal onClose={() => onClose({}, undefined satisfies React.MouseEvent<HTMLDivElement>)}>
            <ModalTitle>Add user to group</ModalTitle>
            <ModalContent className={styles.container}>
                <Transfer
                    maxSelections={1}
                    loading={addGroupLoading}
                    options={groupOptions}
                    selected={selectedGroups}
                    leftHeader={<p>Available Groups</p>}
                    rightHeader={<p>Selected Groups</p>}
                    onChange={onChange}
                    disabled={addGroupLoading}
                />
            </ModalContent>
        </Modal>
    )
}
