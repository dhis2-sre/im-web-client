import { Button, ButtonStrip, NoticeBox } from '@dhis2/ui'
import cx from 'classnames'
import type { AnyObject } from 'final-form'
import { useFormState } from 'react-final-form'
import { Deployment } from '../../../types/index.ts'
import { CompanionFieldset } from './companion-fieldset.tsx'
import { DescriptionTextarea } from './fields/description-textarea.tsx'
import { ExtendTtlSelect } from './fields/extend-ttl-select.tsx'
import { GroupSelect } from './fields/group-select.tsx'
import { NameInput } from './fields/name-input.tsx'
import { PublicCheckbox } from './fields/public-checkbox.tsx'
import { TtlSelect } from './fields/ttl-select.tsx'
import { Dhis2StackName, ParameterFieldset } from './parameter-fieldset.tsx'
import styles from './styles.module.css'

const STACK_DEFS = [
    { stackId: 'dhis2-core', displayName: 'DHIS2 Core' },
    { stackId: 'dhis2-db', displayName: 'Database' },
    { stackId: 'minio', displayName: 'MinIO' },
    { stackId: 'pgadmin', displayName: 'PG Admin' },
    { stackId: 'chap-core', displayName: 'CHAP' },
    { stackId: 'chap-worker', displayName: 'CHAP Worker' },
    { stackId: 'chap-db', displayName: 'CHAP Database' },
    { stackId: 'chap-valkey', displayName: 'CHAP Valkey' },
] as const satisfies ReadonlyArray<{ stackId: Dhis2StackName; displayName: string }>

const CHAP_STACKS = STACK_DEFS.filter(({ stackId }) => stackId.startsWith('chap-'))
const STACK_ORDER: readonly Dhis2StackName[] = STACK_DEFS.map(({ stackId }) => stackId)
const KNOWN_STACKS = new Set<string>(STACK_ORDER)
const STACK_DISPLAY_NAMES: Record<string, string> = Object.fromEntries(STACK_DEFS.map(({ stackId, displayName }) => [stackId, displayName]))

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
        ? [...(deployment?.instances ?? [])]
              .filter((instance) => instance.stackName && KNOWN_STACKS.has(instance.stackName))
              .sort((a, b) => STACK_ORDER.indexOf(a.stackName as Dhis2StackName) - STACK_ORDER.indexOf(b.stackName as Dhis2StackName))
        : []

    return (
        <form onSubmit={handleSubmit}>
            <fieldset className={cx(styles.fieldset, styles.main)}>
                <legend className={styles.legend}>Basic information</legend>
                {!isUpdate && <NameInput />}
                <DescriptionTextarea />
                <PublicCheckbox />
                {isUpdate && deployment ? <ExtendTtlSelect deployment={deployment} /> : <TtlSelect />}
                {!isUpdate && <GroupSelect />}
            </fieldset>
            <hr className={styles.hr} />
            {!isUpdate && (
                <>
                    <ParameterFieldset stackId="dhis2-core" displayName="DHIS2 Core" />
                    <CompanionFieldset stackId="minio" displayName="MinIO" sourceStack="dhis2-core" sourceField="STORAGE_TYPE" sourceValue="minio" />
                    <ParameterFieldset stackId="dhis2-db" displayName="Database" />
                    <ParameterFieldset stackId="pgadmin" displayName="PG Admin" optional />
                    {CHAP_STACKS.map(({ stackId, displayName }) => (
                        <CompanionFieldset key={stackId} stackId={stackId} displayName={displayName} sourceStack="dhis2-core" sourceField="DEPLOY_CHAP" sourceValue="true" />
                    ))}
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
