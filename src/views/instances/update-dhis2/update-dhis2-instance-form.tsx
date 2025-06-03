import { Button, ButtonStrip, NoticeBox } from '@dhis2/ui'
import cx from 'classnames'
import type { AnyObject } from 'final-form'
import { useFormState } from 'react-final-form'
import { DescriptionTextarea } from '../new-dhis2/fields/description-textarea.tsx'
import { GroupSelect } from '../new-dhis2/fields/group-select.tsx'
import { PublicCheckbox } from '../new-dhis2/fields/public-checkbox.tsx'
import { TtlInput } from './fields/ttl-input.tsx'
import { NameInput } from './fields/name-input.tsx'
import styles from './styles.module.css'
import { Group } from '../../../types/index.ts'

type UpdateDhis2InstanceFormProps = {
    handleCancel: () => void
    handleSubmit: (event?: Partial<Pick<React.SyntheticEvent, 'preventDefault' | 'stopPropagation'>>) => Promise<AnyObject | undefined> | undefined
    groups: Group[]
}

export const UpdateDhis2InstanceForm = ({ handleCancel, handleSubmit, groups }: UpdateDhis2InstanceFormProps) => {
    const { submitError, submitting, modifiedSinceLastSubmit, pristine, invalid } = useFormState({
        subscription: {
            submitError: true,
            submitting: true,
            modifiedSinceLastSubmit: true,
            pristine: true,
            invalid: true,
        },
    })
    const shouldDisableSubmit = pristine || submitting || (invalid && !submitError) || (submitError && !modifiedSinceLastSubmit)
    return (
        <form onSubmit={handleSubmit}>
            <fieldset className={cx(styles.fieldset, styles.main)}>
                <legend className={styles.legend}>Basic information</legend>
                <NameInput />
                <DescriptionTextarea />
                <PublicCheckbox />
                <TtlInput className={styles.field} />
                <GroupSelect groups={groups} />
            </fieldset>
            {submitError && (
                <NoticeBox className={styles.submitError} error title="There was an error updating the deployment">
                    {submitError}
                </NoticeBox>
            )}
            <ButtonStrip className={styles.buttonStrip}>
                <Button primary disabled={shouldDisableSubmit} loading={submitting} type="submit">
                    Update instance
                </Button>
                <Button disabled={submitting} onClick={handleCancel}>
                    Cancel
                </Button>
            </ButtonStrip>
        </form>
    )
}
