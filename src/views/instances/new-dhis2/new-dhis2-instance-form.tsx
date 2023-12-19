import { Button, ButtonStrip, NoticeBox } from '@dhis2/ui'
import cx from 'classnames'
import { AnyObject } from 'final-form'
import { DescriptionTextarea } from './fields/description-textarea'
import { GroupSelect } from './fields/group-select'
import { NameInput } from './fields/name-input'
import { PublicCheckbox } from './fields/public-checkbox'
import { TtlSelect } from './fields/ttl-select'
import { ParameterFieldset } from './parameter-fieldset'
import styles from './styles.module.css'
import { useFormState } from 'react-final-form'

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
    return (
        <form onSubmit={handleSubmit}>
            <fieldset className={cx(styles.fieldset, styles.main)}>
                <legend className={styles.legend}>Basic information</legend>
                <NameInput />
                <DescriptionTextarea />
                <TtlSelect />
                <GroupSelect />
                <PublicCheckbox />
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
