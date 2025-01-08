import { Button, ButtonStrip, Calendar, NoticeBox } from '@dhis2/ui'
import cx from 'classnames'
import type { AnyObject } from 'final-form'
import { useField, useFormState } from 'react-final-form'
import { DescriptionTextarea } from './fields/description-textarea.tsx'
import { GroupSelect } from './fields/group-select.tsx'
import { NameInput } from './fields/name-input.tsx'
import { PublicCheckbox } from './fields/public-checkbox.tsx'
import { TtlSelect } from './fields/ttl-select.tsx'
import { ParameterFieldset } from './parameter-fieldset.tsx'
import styles from './styles.module.css'

type NewDhis2InstanceFormProps = {
    handleCancel: () => void
    handleSubmit: (event?: Partial<Pick<React.SyntheticEvent, 'preventDefault' | 'stopPropagation'>>) => Promise<AnyObject | undefined> | undefined
}

export const NewDhis2InstanceForm = ({ handleCancel, handleSubmit }: NewDhis2InstanceFormProps) => {
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

    const { input: ttlInput } = useField('ttl', {
        subscription: { value: true },
    })

    console.log('TTL Value:', ttlInput.value, typeof ttlInput)

    const handleCustomDateChange = (date: any) => {
        const newDate = new Date(date.calendarDateString)
        const timestamp = newDate.getTime() / 1000 // Convert to seconds
        ttlInput.onChange(timestamp) // Update TTL field
        console.log('Selected Timestamp:', timestamp)
    }

    return (
        <form onSubmit={handleSubmit}>
            <fieldset className={cx(styles.fieldset, styles.main)}>
                <legend className={styles.legend}>Basic information</legend>
                <NameInput />
                <DescriptionTextarea />
                <PublicCheckbox />
                <TtlSelect />
                {ttlInput.value === -1 && (
                    <Calendar
                        onDateSelect={handleCustomDateChange}
                        calendar="iso8601"
                    />
                )}
                <GroupSelect />
            </fieldset>
            <hr className={styles.hr} />
            <ParameterFieldset stackId="dhis2-core" displayName="DHIS2 Core" />
            <ParameterFieldset stackId="dhis2-db" displayName="Database" />
            <ParameterFieldset stackId="pgadmin" displayName="PG Admin" optional />
            {submitError && (
                <NoticeBox className={styles.submitError} error title="There was an error in one of the deployment steps">
                    {submitError}
                </NoticeBox>
            )}
            <ButtonStrip>
                <Button primary disabled={shouldDisableSubmit} loading={submitting} type="submit">
                    Create instance
                </Button>
                <Button disabled={submitting} onClick={handleCancel}>
                    Cancel
                </Button>
            </ButtonStrip>
        </form>
    )
}
