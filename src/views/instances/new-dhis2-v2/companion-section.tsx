import { CircularLoader, NoticeBox } from '@dhis2/ui'
import { useEffect } from 'react'
import type { FC } from 'react'
import { useForm } from 'react-final-form'
import { useGroupedStackParameters } from '../../../hooks/use-grouped-stack-parameters.ts'
import { useParameterCondition } from '../../../hooks/use-parameter-condition.ts'
import { StackCompanion } from '../../../types/index.ts'
import { Dhis2StackName } from '../new-dhis2/parameter-fieldset.tsx'
import { GroupFieldset } from './group-fieldset.tsx'

/* A companion stack's own parameters, shown while the condition the offering stack declared holds.
 * The condition is the opt-in, so there is no include checkbox: turning the enabling parameter on
 * is what adds the companion, and the same declaration decides what the submit sends. */
export const CompanionSection: FC<{ offeringStackId: string; companion: StackCompanion }> = ({ offeringStackId, companion }) => {
    const { groups, initialParameterValues, sensitiveParameters, loading, error } = useGroupedStackParameters(companion.name)
    const form = useForm()
    const applies = useParameterCondition(offeringStackId, companion.when)

    /* Seed the companion's defaults with change rather than initialize. Initializing would fold
     * everything already typed into the form's initial values, leaving it pristine and the submit
     * button disabled until the next edit. */
    useEffect(() => {
        if (!applies) {
            return
        }
        const values = form.getState().values[companion.name] ?? {}
        form.batch(() => {
            for (const [parameterName, value] of Object.entries(initialParameterValues)) {
                if (values[parameterName] === undefined) {
                    form.change(`${companion.name}.${parameterName}`, value)
                }
            }
        })
    }, [applies, form, companion.name, initialParameterValues])

    if (!applies) {
        return null
    }
    if (loading) {
        return <CircularLoader />
    }
    if (error) {
        return (
            <NoticeBox error title={`Could not load the ${companion.name} fields`}>
                {error.message}
            </NoticeBox>
        )
    }

    return (
        <>
            {groups.map(({ group, parameters }) => (
                <GroupFieldset key={group.name} stackId={companion.name as Dhis2StackName} group={group} parameters={parameters} sensitiveParameters={sensitiveParameters} />
            ))}
        </>
    )
}
