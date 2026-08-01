import { Button, ButtonStrip, CircularLoader, NoticeBox } from '@dhis2/ui'
import cx from 'classnames'
import type { AnyObject } from 'final-form'
import { useEffect, useMemo } from 'react'
import type { FC } from 'react'
import { useForm, useFormState } from 'react-final-form'
import { useGroupedStackParameters } from '../../../hooks/use-grouped-stack-parameters.ts'
import type { GroupedParameters } from '../../../hooks/use-grouped-stack-parameters.ts'
import { DescriptionTextarea } from '../new-dhis2/fields/description-textarea.tsx'
import { GroupSelect } from '../new-dhis2/fields/group-select.tsx'
import { NameInput } from '../new-dhis2/fields/name-input.tsx'
import { PublicCheckbox } from '../new-dhis2/fields/public-checkbox.tsx'
import { TtlSelect } from '../new-dhis2/fields/ttl-select.tsx'
import styles from '../new-dhis2/styles.module.css'
import { GroupFieldset } from './group-fieldset.tsx'

export const STACK_ID = 'dhis2-v2'

export const NewDhis2V2Form: FC<{
    handleCancel: () => void
    handleSubmit: (event?: Partial<Pick<React.SyntheticEvent, 'preventDefault' | 'stopPropagation'>>) => Promise<AnyObject | undefined> | undefined
}> = ({ handleCancel, handleSubmit }) => {
    const { groups, initialParameterValues, sensitiveParameters, loading, error } = useGroupedStackParameters(STACK_ID)
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

    useEffect(() => {
        const currentValues = form.getState().values
        form.initialize({
            ...currentValues,
            [STACK_ID]: {
                ...initialParameterValues,
                ...(currentValues[STACK_ID] ?? {}),
            },
        })
    }, [form, initialParameterValues])

    return (
        <form onSubmit={handleSubmit}>
            <fieldset className={cx(styles.fieldset, styles.main)}>
                <legend className={styles.legend}>Basic information</legend>
                <NameInput />
                <DescriptionTextarea />
                <PublicCheckbox />
                <TtlSelect />
                <GroupSelect />
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
                    />
                ))}
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
