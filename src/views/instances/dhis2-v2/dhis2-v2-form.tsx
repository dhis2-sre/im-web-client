import { Button, ButtonStrip, CircularLoader, NoticeBox } from '@dhis2/ui'
import cx from 'classnames'
import type { AnyObject } from 'final-form'
import { useEffect, useMemo } from 'react'
import type { FC } from 'react'
import { useForm, useFormState } from 'react-final-form'
import { useGroupedStackParameters } from '../../../hooks/use-grouped-stack-parameters.ts'
import type { GroupedParameters } from '../../../hooks/use-grouped-stack-parameters.ts'
import type { DeploymentStep } from '../../../hooks/use-stack-deployment-creation.ts'
import type { Deployment } from '../../../types/index.ts'
import { DescriptionTextarea } from '../fields/description-textarea.tsx'
import { ExtendTtlSelect } from '../fields/extend-ttl-select.tsx'
import { GroupSelect } from '../fields/group-select.tsx'
import { NameInput } from '../fields/name-input.tsx'
import { PublicCheckbox } from '../fields/public-checkbox.tsx'
import { TtlSelect } from '../fields/ttl-select.tsx'
import styles from '../styles.module.css'
import { CompanionSection } from './companion-section.tsx'
import { DeploymentProgress } from './deployment-progress.tsx'
import { GroupFieldset } from './group-fieldset.tsx'

export const STACK_ID = 'dhis2-v2'

/* One form for creating and for editing. Editing renders the same sections from the same stack
 * metadata; what differs is where the initial values come from, that identity is fixed once a
 * deployment exists, and that the submit sends a diff rather than everything. */
export const Dhis2V2Form: FC<{
    handleCancel: () => void
    handleSubmit: (event?: Partial<Pick<React.SyntheticEvent, 'preventDefault' | 'stopPropagation'>>) => Promise<AnyObject | undefined> | undefined
    name?: string
    steps?: DeploymentStep[]
    mode?: 'create' | 'edit'
    deployment?: Deployment
}> = ({ handleCancel, handleSubmit, name, steps = [], mode = 'create', deployment }) => {
    const isEdit = mode === 'edit'
    const formMode = isEdit ? 'update' : 'create'
    const { groups, companions, initialParameterValues, sensitiveParameters, immutableReasons, loading, error } = useGroupedStackParameters(STACK_ID)
    const form = useForm()
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

    /* A conditional group nests under the group that owns its enabling parameter, e.g. the MinIO
     * section renders inside DHIS 2 Core because STORAGE_TYPE lives there. */
    const { topLevel, subGroupsByParent } = useMemo(() => {
        const ownerOf = (parameterName: string) => groups.find(({ parameters }) => parameters.some((parameter) => parameter.parameterName === parameterName))
        const subGroupsByParent = new Map<string, GroupedParameters[]>()
        const topLevel: GroupedParameters[] = []
        for (const grouped of groups) {
            const owner = grouped.group.when ? ownerOf(grouped.group.when.parameter) : undefined
            if (owner && owner.group.name !== grouped.group.name) {
                subGroupsByParent.set(owner.group.name, [...(subGroupsByParent.get(owner.group.name) ?? []), grouped])
            } else {
                topLevel.push(grouped)
            }
        }
        return { topLevel, subGroupsByParent }
    }, [groups])

    /* Stack defaults seed a new deployment. An edit is seeded from the deployment it is editing, so
     * folding the defaults in would quietly rewrite the values the instance actually holds. */
    useEffect(() => {
        if (isEdit) {
            return
        }
        const currentValues = form.getState().values
        form.initialize({
            ...currentValues,
            [STACK_ID]: {
                ...initialParameterValues,
                ...(currentValues[STACK_ID] ?? {}),
            },
        })
    }, [form, initialParameterValues, isEdit])

    return (
        <form onSubmit={handleSubmit}>
            <fieldset className={cx(styles.fieldset, styles.main)}>
                <legend className={styles.legend}>Basic information</legend>
                {!isEdit && <NameInput />}
                <DescriptionTextarea />
                <PublicCheckbox />
                {isEdit && deployment ? <ExtendTtlSelect deployment={deployment} /> : <TtlSelect />}
                {!isEdit && <GroupSelect />}
            </fieldset>
            <hr className={styles.hr} />
            {loading && <CircularLoader />}
            {error && !loading && (
                <NoticeBox error title="Could not load parameter fields">
                    {error.message}
                </NoticeBox>
            )}
            {!error &&
                !loading &&
                topLevel.map(({ group, parameters }) => (
                    <GroupFieldset
                        key={group.name}
                        stackId={STACK_ID}
                        group={group}
                        parameters={parameters}
                        subGroups={subGroupsByParent.get(group.name)}
                        sensitiveParameters={sensitiveParameters}
                        immutableReasons={immutableReasons}
                        formMode={formMode}
                    />
                ))}
            {/* Every companion the stack declares, each shown while the condition it was declared
                with holds. Nothing here names a particular companion. */}
            {!error && !loading && companions.map((companion) => <CompanionSection key={companion.name} offeringStackId={STACK_ID} companion={companion} formMode={formMode} />)}
            {submitError && (
                <NoticeBox className={styles.submitError} error title="There was an error in one of the deployment steps">
                    {submitError}
                </NoticeBox>
            )}
            <ButtonStrip>
                <Button primary disabled={shouldDisableSubmit} loading={submitting} type="submit">
                    {isEdit ? 'Save changes' : 'Create instance'}
                </Button>
                <Button disabled={submitting} onClick={handleCancel}>
                    Cancel
                </Button>
            </ButtonStrip>
            {!isEdit && <DeploymentProgress name={name ?? ''} steps={steps} />}
        </form>
    )
}
