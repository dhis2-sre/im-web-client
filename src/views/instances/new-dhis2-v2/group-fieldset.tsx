import cx from 'classnames'
import { getIn } from 'final-form'
import { useEffect, useState } from 'react'
import type { FC } from 'react'
import { useForm } from 'react-final-form'
import type { GroupedParameters } from '../../../hooks/use-grouped-stack-parameters.ts'
import { StackParameterGroup, StackParameterWithGroup } from '../../../types/index.ts'
import { ParameterField } from '../new-dhis2/fields/parameter-field.tsx'
import { Dhis2StackName } from '../new-dhis2/parameter-fieldset.tsx'
import styles from '../new-dhis2/styles.module.css'
import ownStyles from './group-fieldset.module.css'

/* Parameters shown directly in a group's section; everything else goes under its Advanced
 * configuration expander. */
const PRIMARY_PARAMETERS = new Set([
    'IMAGE_TAG',
    'IMAGE_REPOSITORY',
    'DATABASE_ID',
    'DATABASE_SIZE',
    'MINIO_STORAGE_SIZE',
    'FILESYSTEM_VOLUME_SIZE',
    'S3_BUCKET',
    'S3_REGION',
    'S3_IDENTITY',
    'S3_SECRET',
])

const ConditionalSection: FC<{
    stackId: Dhis2StackName
    when: NonNullable<StackParameterGroup['when']>
    children: React.ReactNode
}> = ({ stackId, when, children }) => {
    const form = useForm()
    const conditionPath = `${stackId}.${when.parameter}`
    const [conditionValue, setConditionValue] = useState(() => getIn(form.getState().values, conditionPath))

    useEffect(() => {
        return form.subscribe(
            ({ values }) => {
                setConditionValue(getIn(values, conditionPath))
            },
            { values: true }
        )
    }, [form, conditionPath])

    if (conditionValue !== when.equals) {
        return null
    }
    return <>{children}</>
}

export const GroupFieldset: FC<{
    stackId: Dhis2StackName
    group: StackParameterGroup
    parameters: StackParameterWithGroup[]
    subGroups?: GroupedParameters[]
    sensitiveParameters: Record<string, boolean>
}> = ({ stackId, group, parameters, subGroups = [], sensitiveParameters }) => {
    const primary = parameters.filter((parameter) => PRIMARY_PARAMETERS.has(parameter.parameterName ?? ''))
    const secondary = parameters.filter((parameter) => !PRIMARY_PARAMETERS.has(parameter.parameterName ?? ''))

    const renderField = (parameter: StackParameterWithGroup) => (
        <ParameterField
            key={parameter.parameterName}
            stackId={stackId}
            parameterName={parameter.parameterName ?? ''}
            displayName={parameter.displayName ?? parameter.parameterName ?? ''}
            sensitive={sensitiveParameters[parameter.parameterName ?? '']}
        />
    )

    const body = (
        <fieldset className={cx(styles.fieldset, styles.parameters, styles.primary)}>
            <legend className={styles.legend}>{group.title}</legend>
            {primary.map(renderField)}
            {secondary.length > 0 && (
                <details className={ownStyles.advanced}>
                    <summary className={styles.summary}>Advanced configuration</summary>
                    <fieldset className={cx(styles.fieldset, styles.parameters, styles.secondary)}>{secondary.map(renderField)}</fieldset>
                </details>
            )}
            {subGroups.length > 0 && (
                <div className={ownStyles.subGroups}>
                    {subGroups.map((subGroup) => (
                        <GroupFieldset
                            key={subGroup.group.name}
                            stackId={stackId}
                            group={subGroup.group}
                            parameters={subGroup.parameters}
                            sensitiveParameters={sensitiveParameters}
                        />
                    ))}
                </div>
            )}
        </fieldset>
    )

    if (group.when) {
        return (
            <ConditionalSection stackId={stackId} when={group.when}>
                {body}
            </ConditionalSection>
        )
    }
    return (
        <>
            {body}
            <hr className={styles.hr} />
        </>
    )
}
