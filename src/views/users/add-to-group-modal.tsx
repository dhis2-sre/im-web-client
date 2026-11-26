import { Button, ButtonStrip, FieldSet, hasValue, Legend, Modal, ModalActions, ModalContent, ModalTitle, NoticeBox, RadioFieldFF, SingleSelectFieldFF } from '@dhis2/ui'
import { FORM_ERROR } from 'final-form'
import type { FC } from 'react'
import { useState } from 'react'
import { Field, Form } from 'react-final-form'
import { useActionAlert } from '../../components/index.ts'
import { useAuthAxios } from '../../hooks/index.ts'
import { Group, User } from '../../types/index.ts'
import styles from './add-to-group-modal.module.css'
import type { Role } from './group-roles.ts'
import { useSetGroupRole } from './use-set-group-role.ts'

type Values = { group: string; role: Role }

/* Adds the user to one group, as a member or an admin. Groups they are already in are left out. */
export const AddToGroupModal: FC<{ user: User; joined: string[]; onClose: () => void; onChanged: () => void }> = ({ user, joined, onClose, onChanged }) => {
    const [{ data: groups, loading, error: groupsError }] = useAuthAxios<Group[]>('/groups')
    const setGroupRole = useSetGroupRole()
    const alert = useActionAlert()
    /* Taken when the modal opens, so a failed add that refreshes the page doesn't pull the picked group
     * out of the options under the error. */
    const [skip] = useState(joined)
    const options = (groups ?? []).filter(({ name }) => name && !skip.includes(name)).map(({ name }) => ({ label: name, value: name }))

    const submit = async ({ group, role }: Values) => {
        try {
            await setGroupRole(user.id, { name: group, member: false, admin: false }, role)
            alert.success(`Added ${user.email} to ${group}`)
            onChanged()
            onClose()
            return undefined
        } catch (error) {
            console.error(error)
            /* Adding an admin takes two calls, and the first may have gone through. */
            onChanged()
            return { [FORM_ERROR]: `Couldn't add ${user.email} to ${group}` }
        }
    }

    return (
        <Form<Values> onSubmit={submit} initialValues={{ role: 'member' }}>
            {({ handleSubmit, invalid, submitting, submitError, dirtySinceLastSubmit }) => (
                <Modal onClose={submitting ? undefined : onClose}>
                    <ModalTitle>Add to group</ModalTitle>
                    <ModalContent className={styles.container}>
                        {groupsError && (
                            <NoticeBox error title="Couldn't load the groups">
                                {groupsError.message}
                            </NoticeBox>
                        )}
                        <Field
                            name="group"
                            label="Group"
                            placeholder="Choose a group"
                            filterable
                            noMatchText="No groups match"
                            loading={loading}
                            component={SingleSelectFieldFF}
                            options={options}
                            validate={hasValue}
                        />
                        <FieldSet>
                            <Legend>Role</Legend>
                            <Field type="radio" name="role" value="member" label="Member" component={RadioFieldFF} />
                            <Field type="radio" name="role" value="admin" label="Admin" component={RadioFieldFF} />
                        </FieldSet>
                        {submitError && !dirtySinceLastSubmit && <NoticeBox error title={submitError} />}
                    </ModalContent>
                    <ModalActions>
                        <ButtonStrip end>
                            <Button secondary onClick={onClose} disabled={submitting}>
                                Cancel
                            </Button>
                            <Button primary onClick={() => void handleSubmit()} disabled={invalid} loading={submitting}>
                                Add to group
                            </Button>
                        </ButtonStrip>
                    </ModalActions>
                </Modal>
            )}
        </Form>
    )
}
