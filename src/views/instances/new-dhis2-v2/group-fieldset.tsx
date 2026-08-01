import cx from 'classnames'
import { getIn } from 'final-form'
import { useEffect, useState } from 'react'
import type { FC } from 'react'
import { useForm } from 'react-final-form'
import { StackParameterGroup, StackParameterWithGroup } from '../../../types/index.ts'
import { ParameterField } from '../new-dhis2/fields/parameter-field.tsx'
import { Dhis2StackName } from '../new-dhis2/parameter-fieldset.tsx'
import styles from '../new-dhis2/styles.module.css'

/* Parameters shown directly in a group's section; everything else goes under its Advanced
 * configuration expander. */
const PRIMARY_PARAMETERS = new Set([
    'IMAGE_TAG',
    'IMAGE_REPOSITORY',
    'DATABASE_ID',
    'DATABASE_SIZE',
    'STORAGE_TYPE',
    'MINIO_STORAGE_SIZE',
    'FILESYSTEM_VOLUME_SIZE',
    'S3_BUCKET',
    'S3_REGION',
    'S3_IDENTITY',
    'S3_SECRET',
])

export const GroupFieldset: FC<{
    stackId: Dhis2StackName
    group: StackParameterGroup
    parameters: StackParameterWithGroup[]
    sensitiveParameters: Record<string, boolean>
}> = ({ stackId, group, parameters, sensitiveParameters }) => {
    const form = useForm()
    const conditionPath = group.when ? `${stackId}.${group.when.parameter}` : null
    const [conditionValue, setConditionValue] = useState(() => (conditionPath ? getIn(form.getState().values, conditionPath) : null))

    useEffect(() => {
        if (!conditionPath) {
            return
        }
        return form.subscribe(
            ({ values }) => {
                setConditionValue(getIn(values, conditionPath))
            },
            { values: true }
        )
    }, [form, conditionPath])

    if (group.when && conditionValue !== group.when.equals) {
        return null
    }

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

    return (
        <>
            <fieldset className={cx(styles.fieldset, styles.parameters, styles.primary)}>
                <legend className={styles.legend}>{group.title}</legend>
                {primary.map(renderField)}
                {secondary.length > 0 && (
                    <details>
                        <summary className={styles.summary}>Advanced configuration</summary>
                        <fieldset className={cx(styles.fieldset, styles.parameters, styles.secondary)}>{secondary.map(renderField)}</fieldset>
                    </details>
                )}
            </fieldset>
            <hr className={styles.hr} />
        </>
    )
}
