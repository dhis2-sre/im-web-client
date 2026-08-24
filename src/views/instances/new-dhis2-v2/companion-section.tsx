import { CheckboxFieldFF, CircularLoader, NoticeBox } from '@dhis2/ui'
import cx from 'classnames'
import { useEffect } from 'react'
import type { FC } from 'react'
import { Field, useField, useForm } from 'react-final-form'
import { useGroupedStackParameters } from '../../../hooks/use-grouped-stack-parameters.ts'
import { useParameterCondition } from '../../../hooks/use-parameter-condition.ts'
import { StackCompanion } from '../../../types/index.ts'
import { Dhis2StackName } from '../new-dhis2/parameter-fieldset.tsx'
import styles from '../new-dhis2/styles.module.css'
import { GroupFieldset } from './group-fieldset.tsx'

/* A companion stack's own parameters. How it is opted into follows what the offering stack
 * declared: a companion with a condition appears while that condition holds, so turning the
 * enabling parameter on is the opt-in and no checkbox is needed. A companion declared without one
 * is always available and carries its own include checkbox instead. Either way the same
 * declaration decides what the submit sends. */
export const CompanionSection: FC<{ offeringStackId: string; companion: StackCompanion }> = ({ offeringStackId, companion }) => {
    const { groups, initialParameterValues, sensitiveParameters, loading, error } = useGroupedStackParameters(companion.name)
    const form = useForm()
    const conditionHolds = useParameterCondition(offeringStackId, companion.when)
    const includeFieldName = `include_${companion.name}`
    const {
        input: { value: included },
    } = useField(includeFieldName, { subscription: { value: true } })

    /* Without a condition the companion is always offered and the checkbox is the opt-in, which is
     * what useStackDeploymentCreation reads when deciding whether to send it. */
    const optional = !companion.when
    const applies = optional ? Boolean(included) : conditionHolds

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

    if (!optional && !applies) {
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

    const sections = applies
        ? groups.map(({ group, parameters }) => (
              <GroupFieldset key={group.name} stackId={companion.name as Dhis2StackName} group={group} parameters={parameters} sensitiveParameters={sensitiveParameters} />
          ))
        : null

    if (!optional) {
        return <>{sections}</>
    }

    /* The checkbox has to render whether or not the companion is included, since it is the only way
     * to include it. The title comes from the stack's own group so the label is not derived from
     * the stack name. */
    return (
        <fieldset className={cx(styles.fieldset, styles.main)}>
            <legend className={styles.legend}>
                <Field
                    type="checkbox"
                    name={includeFieldName}
                    label={groups[0]?.group.title ?? companion.name}
                    component={CheckboxFieldFF}
                    className={styles.optionalStackCheckbox}
                />
            </legend>
            {sections}
        </fieldset>
    )
}
