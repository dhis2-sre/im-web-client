import {
  BaseButtonProps,
  Button,
  ButtonStrip,
  Modal,
  ModalActions,
  ModalContent,
  ModalTitle,
  SingleSelectField,
  SingleSelectOption,
} from '@dhis2/ui'
import styles from './add-to-group-modal.module.css'
import type { FC } from 'react'
import { useCallback, useEffect, useState } from 'react'
import { useAuthAxios } from '../../hooks'
import { Group, GroupsWithDatabases } from '../../types'
import { useAlert } from '@dhis2/app-service-alerts'

type AddToGroupModalProps = {
    userId: Number
    onClose: BaseButtonProps['onClick']
    onComplete: Function
}

export const AddToGroupModal: FC<AddToGroupModalProps> = ({ userId, onClose, onComplete }) => {
    const [group, setGroup] = useState('')

    const [{ data: groups, loading: groupsLoading, error: groupsError }] = useAuthAxios<Group[]>({
        method: 'GET',
        url: '/groups',
    })

    const { show: showAlert } = useAlert(
        ({ message }) => message,
        ({ isCritical }) => (isCritical ? { critical: true } : { success: true })
    )

    if (groupsError) {
        showAlert({ message: 'There was a problem loading the groups', isCritical: true })
        console.error(groupsError)
    }

    useEffect(() => {
        if (groups && groups.length > 0) {
            setGroup(groups[0].name)
        }
    }, [groups])

    const [{ loading }, addUser] = useAuthAxios<GroupsWithDatabases>(
        {
            url: `/groups/${group}/users/${userId}`,
            method: 'post',
        },
        { manual: true }
    )

    const submit = useCallback(async () => {
        try {
            await addUser()
            showAlert({
                message: 'User added successfully',
                isCritical: false,
            })
            onComplete()
        } catch (error) {
            showAlert({
                message: 'There was a problem adding the user',
                isCritical: true,
            })
            console.error(error)
        }
    }, [addUser, onComplete, showAlert])

    if (groupsLoading) {
        return
    }

    return (
        <Modal onClose={() => onClose(
          {},
          undefined satisfies React.MouseEvent<HTMLDivElement>
        )}>
            <ModalTitle>Add user to group</ModalTitle>
            <ModalContent className={styles.container}>
                <SingleSelectField inputWidth="280px" className={styles.field} selected={group} filterable={true} onChange={({ selected }) => setGroup(selected)} label="Group">
                    {groups.map((group) => (
                        <SingleSelectOption key={group.name} label={group.name} value={group.name} />
                    ))}
                </SingleSelectField>
            </ModalContent>
            <ModalActions>
                <ButtonStrip end>
                    <Button onClick={submit} disabled={loading}>
                        Add
                    </Button>
                    <Button onClick={onClose}>Close</Button>
                </ButtonStrip>
            </ModalActions>
        </Modal>
    )
}
