import { Button, CircularLoader, InputField, NoticeBox } from '@dhis2/ui'
import type { AnyObject } from 'final-form'
import { useEffect, useMemo } from 'react'
import type { FC, ReactNode } from 'react'
import { useForm, useFormState } from 'react-final-form'
import { useGroupedStackParameters } from '../../../hooks/use-grouped-stack-parameters.ts'
import type { GroupedParameters } from '../../../hooks/use-grouped-stack-parameters.ts'
import { useParameterCondition } from '../../../hooks/use-parameter-condition.ts'
import type { DeploymentStep } from '../../../hooks/use-stack-deployment-creation.ts'
import type { Deployment, StackParameterGroup } from '../../../types/index.ts'
import { DescriptionTextarea } from '../fields/description-textarea.tsx'
import { ExtendTtlSelect } from '../fields/extend-ttl-select.tsx'
import { GroupSelect } from '../fields/group-select.tsx'
import { NameInput } from '../fields/name-input.tsx'
import { PublicCheckbox } from '../fields/public-checkbox.tsx'
import { TtlSelect } from '../fields/ttl-select.tsx'
import styles from '../styles.module.css'
import { AddOnsSection } from './add-ons-section.tsx'
import { findAddOns } from './add-ons.ts'
import { deploymentHasInstanceOf } from './deployment-instances.ts'
import { DeploymentProgress } from './deployment-progress.tsx'
import { ParameterCard } from './parameter-card.tsx'
import { SectionCard } from './section-card.tsx'

export const STACK_ID = 'dhis2-v2'

const Conditional: FC<{ when?: StackParameterGroup['when']; children: ReactNode }> = ({ when, children }) => (useParameterCondition(STACK_ID, when) ? <>{children}</> : null)

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
    const { submitError, submitting, modifiedSinceLastSubmit, pristine, invalid, errors } = useFormState({
        subscription: {
            submitError: true,
            submitting: true,
            modifiedSinceLastSubmit: true,
            pristine: true,
            invalid: true,
            errors: true,
        },
    })
    const shouldDisableSubmit = (isEdit && pristine) || submitting || (invalid && !submitError) || (submitError && !modifiedSinceLastSubmit)
    /* Creating several names the instances from a prefix the dialog asks for, so only the rest of the form has to
     * be valid: a taken or empty Name doesn't stop it. */
    const shouldDisableCreateSeveral = submitting || Object.keys(errors ?? {}).some((field) => field !== 'name') || (!!submitError && !modifiedSinceLastSubmit)

    /* A companion already on the deployment is edited like the rest of it: sensitive fields are
     * optional and left blank to keep what is stored. A companion opted into during this edit has
     * nothing stored yet, so it is filled in like a brand new instance instead. */
    const companionFormMode = (companionName: string): 'create' | 'update' => (deploymentHasInstanceOf(deployment, companionName) ? 'update' : 'create')

    /* Add-ons are offered as tiles and get a card of their own once added, so their switches and the
     * sections they gate leave the cards below. */
    const addOns = useMemo(() => findAddOns(groups, companions), [groups, companions])
    const addOnParameters = useMemo(() => new Set(addOns.map(({ parameter }) => parameter)), [addOns])

    /* A conditional group shows inside the card of the group that owns its enabling parameter, e.g. the MinIO
     * section inside DHIS 2 Core because STORAGE_TYPE lives there. */
    const { topLevel, insetsByParent } = useMemo(() => {
        const addOnGroups = new Set(addOns.flatMap(({ groups: gated }) => gated.map(({ group }) => group.name)))
        const ownerOf = (parameterName: string) => groups.find(({ parameters }) => parameters.some((parameter) => parameter.parameterName === parameterName))
        const insetsByParent = new Map<string, GroupedParameters[]>()
        const topLevel: GroupedParameters[] = []
        for (const grouped of groups.filter(({ group }) => !addOnGroups.has(group.name))) {
            const owner = grouped.group.when ? ownerOf(grouped.group.when.parameter) : undefined
            if (owner && owner.group.name !== grouped.group.name) {
                insetsByParent.set(owner.group.name, [...(insetsByParent.get(owner.group.name) ?? []), grouped])
            } else {
                topLevel.push(grouped)
            }
        }
        return { topLevel, insetsByParent }
    }, [groups, addOns])

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
        <form className={styles.form} onSubmit={handleSubmit}>
            <SectionCard title="Basic information">
                <div className={styles.grid}>
                    {mode === 'create' && <NameInput />}
                    {isPreset && <NameInput availabilityUrl="/presets/availability" helpText="Unique among the presets in the group" own={ownName} />}
                    {!isEdit && <GroupSelect />}
                    {/* An instance keeps its name and group, so editing shows them without letting them change. */}
                    {isEdit && deployment && (
                        <>
                            <InputField label="Name" value={deployment.name ?? ''} disabled />
                            <InputField label="Group" value={deployment.groupName ?? ''} disabled />
                        </>
                    )}
                    {isEdit && deployment ? (
                        <ExtendTtlSelect deployment={deployment} />
                    ) : isPreset ? (
                        <TtlSelect label="Lifetime of created instances" helpText="" />
                    ) : (
                        <TtlSelect />
                    )}
                    <DescriptionTextarea />
                </div>
                <PublicCheckbox />
            </SectionCard>
            {loading && <CircularLoader />}
            {error && !loading && (
                <NoticeBox error title="Couldn't load the stack parameters">
                    {error.message}
                </NoticeBox>
            )}
            {!error &&
                !loading &&
                topLevel.map((grouped) => (
                    <Conditional key={grouped.group.name} when={grouped.group.when}>
                        <ParameterCard
                            stackId={STACK_ID}
                            title={grouped.group.title}
                            groups={[grouped]}
                            insets={insetsByParent.get(grouped.group.name)}
                            hiddenParameters={addOnParameters}
                            sensitiveParameters={sensitiveParameters}
                            immutableReasons={isEdit ? immutableReasons : undefined}
                            formMode={formMode}
                        />
                    </Conditional>
                ))}
            {!error && !loading && (
                <AddOnsSection
                    stackId={STACK_ID}
                    addOns={addOns}
                    shared={{ sensitiveParameters, immutableReasons: isEdit ? immutableReasons : undefined, formMode }}
                    companionFormMode={companionFormMode}
                    showImmutable={isEdit}
                />
            )}
            {footer}
            {submitError && (
                <NoticeBox error title={SUBMIT_ERROR_TITLES[mode]}>
                    {submitError}
                </NoticeBox>
            )}
            {actions ?? (
                <div className={styles.actions}>
                    <Button primary disabled={shouldDisableSubmit} loading={submitting} type="submit">
                        {isEdit ? 'Save changes' : 'Create instance'}
                    </Button>
                    {!isEdit && onCreateSeveral && (
                        <Button secondary disabled={shouldDisableCreateSeveral} onClick={onCreateSeveral}>
                            Create several instances…
                        </Button>
                    )}
                    <Button secondary disabled={submitting} onClick={handleCancel}>
                        Cancel
                    </Button>
                </div>
            )}
            {mode === 'create' && <DeploymentProgress name={name ?? ''} steps={steps} />}
        </form>
    )
}
