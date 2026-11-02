import { Button, ButtonStrip, Field, Modal, ModalActions, ModalContent, ModalTitle, NoticeBox, Radio, SingleSelectField, SingleSelectOption } from '@dhis2/ui'
import type { FC } from 'react'
import { useState } from 'react'
import { useActionAlert } from '../../components/index.ts'
import { useAuthAxios } from '../../hooks/index.ts'
import { Group, User } from '../../types/index.ts'
import styles from './add-to-group-modal.module.css'
import type { Role } from './group-roles.ts'
import { useSetGroupRole } from './use-set-group-role.ts'

/* Adds the user to one group, as a member or an admin. Groups they are already in are left out. */
export const AddToGroupModal: FC<{ user: User; joined: string[]; onClose: () => void; onAdded: () => void }> = ({ user, joined, onClose, onAdded }) => {
    const [{ data: groups, loading }] = useAuthAxios<Group[]>('/groups')
    const setGroupRole = useSetGroupRole()
    const alert = useActionAlert()
    const [group, setGroup] = useState('')
    const [role, setRole] = useState<Role>('member')
    const [submitting, setSubmitting] = useState(false)
    const [error, setError] = useState(false)
    const available = (groups ?? []).filter((g) => g.name && !joined.includes(g.name))

    const add = async () => {
        setSubmitting(true)
        setError(false)
        try {
            await setGroupRole(user.id, { name: group, member: false, admin: false }, role)
            alert.success(`Added ${user.email} to ${group}`)
            onAdded()
            onClose()
        } catch (e) {
            console.error(e)
            setError(true)
            setSubmitting(false)
        }
    }

    return (
        <Modal onClose={onClose}>
            <ModalTitle>Add to group</ModalTitle>
            <ModalContent className={styles.container}>
                <SingleSelectField
                    label="Group"
                    placeholder="Choose a group"
                    filterable
                    noMatchText="No groups match"
                    loading={loading}
                    selected={group}
                    onChange={({ selected }) => setGroup(selected)}
                >
                    {available.map((g) => (
                        <SingleSelectOption key={g.name} value={g.name} label={g.name} />
                    ))}
                </SingleSelectField>
                <Field label="Role">
                    <div className={styles.roles}>
                        <Radio label="Member" name="role" value="member" checked={role === 'member'} onChange={() => setRole('member')} />
                        <Radio label="Admin" name="role" value="admin" checked={role === 'admin'} onChange={() => setRole('admin')} />
                    </div>
                </Field>
                {error && (
                    <NoticeBox error title={`Could not add ${user.email} to ${group}`}>
                        Try again, or check the group still exists.
                    </NoticeBox>
                )}
            </ModalContent>
            <ModalActions>
                <ButtonStrip end>
                    <Button secondary onClick={onClose} disabled={submitting}>
                        Cancel
                    </Button>
                    <Button primary onClick={() => void add()} disabled={!group} loading={submitting}>
                        Add
                    </Button>
                </ButtonStrip>
            </ModalActions>
        </Modal>
    )
}
