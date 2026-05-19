import { Modal, ModalContent, ModalTitle, Transfer } from '@dhis2/ui'
import type { BaseButtonProps } from '@dhis2/ui'
import type { FC } from 'react'
import { useState } from 'react'
import { useAuthAxios } from '../../hooks/index.ts'
import { Group, User } from '../../types/index.ts'
import styles from './add-to-group-modal.module.css'
import { useAddGroupAdmins } from './use-add-group-admins.tsx'

type AddToGroupAdminModalProps = {
    user: User
    onClose: BaseButtonProps['onClick']
    onComplete: () => void
}

export const AddToGroupAdminModal: FC<AddToGroupAdminModalProps> = ({ user, onClose, onComplete }) => {
    const [{ data: groups }] = useAuthAxios<Group[]>({
        method: 'GET',
        url: '/groups',
    })

    const { addGroupAdmins, addGroupAdminLoading } = useAddGroupAdmins()

    const [selectedGroups, setSelectedGroups] = useState<string[]>([])

    const filteredGroups = groups?.filter((group) => !user?.adminGroups?.some((adminGroup) => adminGroup.name === group.name))

    const groupOptions =
        filteredGroups?.map((group) => ({
            label: group.name,
            value: group.name,
        })) || []

    const onChange = async ({ selected }: { selected: string[] }) => {
        setSelectedGroups(selected)
        await addGroupAdmins(selected, user.id)
        onComplete()
        onClose({}, undefined satisfies React.MouseEvent<HTMLDivElement>)
    }

    return (
        <Modal onClose={() => onClose({}, undefined satisfies React.MouseEvent<HTMLDivElement>)}>
            <ModalTitle>Assign user as group admin</ModalTitle>
            <ModalContent className={styles.container}>
                <Transfer
                    maxSelections={1}
                    loading={addGroupAdminLoading}
                    options={groupOptions}
                    selected={selectedGroups}
                    leftHeader={<p>Available Groups</p>}
                    rightHeader={<p>Selected Groups</p>}
                    onChange={onChange}
                    disabled={addGroupAdminLoading}
                />
            </ModalContent>
        </Modal>
    )
}
