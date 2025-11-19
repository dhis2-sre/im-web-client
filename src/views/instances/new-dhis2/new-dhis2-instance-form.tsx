import { Button, ButtonStrip, NoticeBox } from '@dhis2/ui'
import cx from 'classnames'
import type { AnyObject } from 'final-form'
import { useFormState } from 'react-final-form'
import { Deployment } from '../../../types/index.ts'
import { DescriptionTextarea } from './fields/description-textarea.tsx'
import { GroupSelect } from './fields/group-select.tsx'
import { NameInput } from './fields/name-input.tsx'
import { PublicCheckbox } from './fields/public-checkbox.tsx'
import { TtlSelect } from './fields/ttl-select.tsx'
import { ParameterFieldset, Dhis2StackName } from './parameter-fieldset.tsx'
import styles from './styles.module.css'

const STACK_DISPLAY_NAMES: Record<string, string> = {
    'dhis2-core': 'DHIS2 Core',
    'dhis2-db': 'Database',
    pgadmin: 'PG Admin',
}

const getStackDisplayName = (stackName: string): string => STACK_DISPLAY_NAMES[stackName] || stackName

type NewDhis2InstanceFormProps = {
    handleCancel: () => void
    handleSubmit: (event?: Partial<Pick<React.SyntheticEvent, 'preventDefault' | 'stopPropagation'>>) => Promise<AnyObject | undefined> | undefined
    mode?: 'create' | 'update'
    deployment?: Deployment
}

export const NewDhis2InstanceForm = ({ handleCancel, handleSubmit, mode = 'create', deployment }: NewDhis2InstanceFormProps) => {
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
                {mode === 'create' && (
                    <>
                        <NameInput />
                        <PublicCheckbox />
                        <GroupSelect />
                    </>
                )}
                <DescriptionTextarea />
                <TtlSelect />
            </fieldset>
            {mode === 'create' && (
                <>
                    <hr className={styles.hr} />
                    <ParameterFieldset stackId="dhis2-core" displayName="DHIS2 Core" />
                    <ParameterFieldset stackId="dhis2-db" displayName="Database" />
                    <ParameterFieldset stackId="pgadmin" displayName="PG Admin" optional />
                </>
            )}
            {mode === 'update' && deployment?.instances && (
                <>
                    <hr className={styles.hr} />
                    {deployment.instances.map((instance) => (
                        <ParameterFieldset key={instance.stackName} stackId={instance.stackName as Dhis2StackName} displayName={getStackDisplayName(instance.stackName)} />
                    ))}
                </>
            )}
            {submitError && (
                <NoticeBox className={styles.submitError} error title="There was an error in one of the deployment steps">
                    {submitError}
                </NoticeBox>
            )}
            <ButtonStrip>
                <Button primary disabled={shouldDisableSubmit} loading={submitting} type="submit">
                    {mode === 'create' ? 'Create instance' : 'Update instance'}
                </Button>
                <Button disabled={submitting} onClick={handleCancel}>
                    Cancel
                </Button>
            </ButtonStrip>
        </form>
    )
}
