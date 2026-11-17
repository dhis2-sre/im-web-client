import { Button, ButtonStrip, CircularLoader, NoticeBox } from '@dhis2/ui'
import cx from 'classnames'
import type { AnyObject } from 'final-form'
import { useEffect, useMemo } from 'react'
import type { FC, ReactNode } from 'react'
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
import { deploymentHasInstanceOf } from './deployment-instances.ts'
import { DeploymentProgress } from './deployment-progress.tsx'
import { GroupFieldset } from './group-fieldset.tsx'

export const STACK_ID = 'dhis2-v2'

const SUBMIT_ERROR_TITLES = {
    'create': "Couldn't create the instance",
    'edit': "Couldn't save the changes",
    'new-preset': "Couldn't save the preset",
    'edit-preset': "Couldn't save the preset",
}

/* One form for instances and presets, new and edited. Every mode renders the same sections from the
 * same stack metadata; what differs is where the initial values come from, which identity fields
 * can change, and what the submit sends. */
export const Dhis2V2Form: FC<{
    handleCancel: () => void
    handleSubmit: (event?: Partial<Pick<React.SyntheticEvent, 'preventDefault' | 'stopPropagation'>>) => Promise<AnyObject | undefined> | undefined
    name?: string
    steps?: DeploymentStep[]
    mode: 'create' | 'edit' | 'new-preset' | 'edit-preset'
    /* The instance or preset whose stored values blank sensitive fields stand for. */
    deployment?: Deployment
    onCreateSeveral?: () => void
    footer?: ReactNode
    actions?: ReactNode
}> = ({ handleCancel, handleSubmit, name, steps = [], mode, deployment, onCreateSeveral, footer, actions }) => {
    const isEdit = mode === 'edit'
    const isPreset = mode === 'new-preset' || mode === 'edit-preset'
    const formMode = deployment ? 'update' : 'create'
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
    const shouldDisableSubmit = (isEdit && pristine) || submitting || (invalid && !submitError) || (submitError && !modifiedSinceLastSubmit)

    /* A companion already on the deployment is edited like the rest of it: sensitive fields are
     * optional and left blank to keep what is stored. A companion opted into during this edit has
     * nothing stored yet, so it is filled in like a brand new instance instead. */
    const companionFormMode = (companionName: string): 'create' | 'update' => (deploymentHasInstanceOf(deployment, companionName) ? 'update' : 'create')

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

    /* Stack defaults seed a new deployment or preset. An edit is seeded from what it is editing, so
     * folding the defaults in would quietly rewrite the values it actually holds. */
    const seedsFromDefaults = mode !== 'edit' && mode !== 'edit-preset'
    useEffect(() => {
        if (!seedsFromDefaults) {
            return
        }
        const currentValues = form.getState().values
        form.initialize({
            ...currentValues,
            [STACK_ID]: {
                ...initialParameterValues,
                ...currentValues[STACK_ID],
            },
        })
    }, [form, initialParameterValues, seedsFromDefaults])

    const ownName = useMemo(() => (mode === 'edit-preset' ? { name: deployment?.name, group: deployment?.groupName } : undefined), [mode, deployment])

    return (
        <form onSubmit={handleSubmit}>
            <fieldset className={cx(styles.fieldset, styles.main)}>
                <legend className={styles.legend}>Basic information</legend>
                {mode === 'create' && <NameInput />}
                {isPreset && <NameInput availabilityUrl="/presets/availability" helpText="" own={ownName} />}
                <DescriptionTextarea />
                <PublicCheckbox />
                {isEdit && deployment ? <ExtendTtlSelect deployment={deployment} /> : isPreset ? <TtlSelect label="Lifetime of created instances" helpText="" /> : <TtlSelect />}
                {!isEdit && <GroupSelect />}
            </fieldset>
            <hr className={styles.hr} />
            {loading && <CircularLoader />}
            {error && !loading && (
                <NoticeBox error title="Couldn't load the stack parameters">
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
                        immutableReasons={isEdit ? immutableReasons : undefined}
                        formMode={formMode}
                    />
                ))}
            {/* Every companion the stack declares, each shown while the condition it was declared
                with holds. Nothing here names a particular companion. */}
            {!error &&
                !loading &&
                companions.map((companion) => (
                    <CompanionSection key={companion.name} offeringStackId={STACK_ID} companion={companion} formMode={companionFormMode(companion.name)} showImmutable={isEdit} />
                ))}
            {footer}
            {submitError && (
                <NoticeBox className={styles.submitError} error title={SUBMIT_ERROR_TITLES[mode]}>
                    {submitError}
                </NoticeBox>
            )}
            {actions ?? (
                <ButtonStrip>
                    <Button primary disabled={shouldDisableSubmit} loading={submitting} type="submit">
                        {isEdit ? 'Save changes' : 'Create instance'}
                    </Button>
                    {!isEdit && onCreateSeveral && (
                        <Button secondary disabled={submitting} onClick={onCreateSeveral}>
                            Create several instances…
                        </Button>
                    )}
                    <Button disabled={submitting} onClick={handleCancel}>
                        Cancel
                    </Button>
                </ButtonStrip>
            )}
            {mode === 'create' && <DeploymentProgress name={name ?? ''} steps={steps} />}
        </form>
    )
}
