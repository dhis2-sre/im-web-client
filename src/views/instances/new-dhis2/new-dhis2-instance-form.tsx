import { Button, ButtonStrip, NoticeBox } from '@dhis2/ui'
import cx from 'classnames'
import type { AnyObject } from 'final-form'
import { useFormState } from 'react-final-form'
import { Deployment } from '../../../types/index.ts'
import { CompanionFieldset } from './companion-fieldset.tsx'
import { DescriptionTextarea } from './fields/description-textarea.tsx'
import { GroupSelect } from './fields/group-select.tsx'
import { NameInput } from './fields/name-input.tsx'
import { PublicCheckbox } from './fields/public-checkbox.tsx'
import { TtlSelect } from './fields/ttl-select.tsx'
import { Dhis2StackName, ParameterFieldset } from './parameter-fieldset.tsx'
import styles from './styles.module.css'

const STACK_DISPLAY_NAMES: Record<string, string> = {
    'dhis2-core': 'DHIS2 Core',
    'dhis2-db': 'Database',
    minio: 'MinIO',
    pgadmin: 'PG Admin',
    'chap-core': 'CHAP',
    'chap-worker': 'CHAP Worker',
    'chap-db': 'CHAP Database',
    'chap-valkey': 'CHAP Valkey',
}

const STACK_ORDER: Dhis2StackName[] = ['dhis2-core', 'dhis2-db', 'minio', 'pgadmin', 'chap-core', 'chap-worker', 'chap-db', 'chap-valkey']

const getStackDisplayName = (stackName: string): string => STACK_DISPLAY_NAMES[stackName] ?? stackName

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
    const isUpdate = mode === 'update'
    const orderedInstances = isUpdate
        ? [...(deployment?.instances ?? [])].sort((a, b) => STACK_ORDER.indexOf(a.stackName as Dhis2StackName) - STACK_ORDER.indexOf(b.stackName as Dhis2StackName))
        : []

    return (
        <form onSubmit={handleSubmit}>
            <fieldset className={cx(styles.fieldset, styles.main)}>
                <legend className={styles.legend}>Basic information</legend>
                {!isUpdate && <NameInput />}
                <DescriptionTextarea />
                <PublicCheckbox />
                <TtlSelect />
                {!isUpdate && <GroupSelect />}
            </fieldset>
            <hr className={styles.hr} />
            {!isUpdate && (
                <>
                    <ParameterFieldset stackId="dhis2-core" displayName="DHIS2 Core" />
                    <CompanionFieldset stackId="minio" displayName="MinIO" sourceStack="dhis2-core" sourceField="STORAGE_TYPE" sourceValue="minio" />
                    <ParameterFieldset stackId="dhis2-db" displayName="Database" />
                    <ParameterFieldset stackId="pgadmin" displayName="PG Admin" optional />
                    <CompanionFieldset stackId="chap-core" displayName="CHAP" sourceStack="dhis2-core" sourceField="DEPLOY_CHAP" sourceValue="true" />
                    <CompanionFieldset stackId="chap-worker" displayName="CHAP Worker" sourceStack="dhis2-core" sourceField="DEPLOY_CHAP" sourceValue="true" />
                    <CompanionFieldset stackId="chap-db" displayName="CHAP Database" sourceStack="dhis2-core" sourceField="DEPLOY_CHAP" sourceValue="true" />
                    <CompanionFieldset stackId="chap-valkey" displayName="CHAP Valkey" sourceStack="dhis2-core" sourceField="DEPLOY_CHAP" sourceValue="true" />
                </>
            )}
            {isUpdate &&
                orderedInstances.map((instance) => (
                    <ParameterFieldset
                        key={instance.stackName}
                        stackId={instance.stackName as Dhis2StackName}
                        displayName={getStackDisplayName(instance.stackName!)}
                        formMode="update"
                    />
                ))}
            {submitError && (
                <NoticeBox className={styles.submitError} error title="There was an error in one of the deployment steps">
                    {submitError}
                </NoticeBox>
            )}
            <ButtonStrip>
                <Button primary disabled={shouldDisableSubmit} loading={submitting} type="submit">
                    {isUpdate ? 'Update instance' : 'Create instance'}
                </Button>
                <Button disabled={submitting} onClick={handleCancel}>
                    Cancel
                </Button>
            </ButtonStrip>
        </form>
    )
}
