import { InputFieldFF } from '@dhis2/ui'
import { useMemo } from 'react'
import { Field } from 'react-final-form'
import { useAuthAxios } from '../../../hooks/index.ts'
import styles from './fields.module.css'
import { allowOwnName, createDeploymentNameValidator } from './validate-deployment-name.ts'
import type { DeploymentNameAvailability } from './validate-deployment-name.ts'

export const NameInput = ({
    availabilityUrl = '/deployments/availability',
    label = 'Name',
    helpText = 'Shown in the instance URL',
    own,
}: {
    availabilityUrl?: string
    label?: string
    helpText?: string
    own?: { name?: string; group?: string }
}) => {
    const [, fetchAvailability] = useAuthAxios<DeploymentNameAvailability>({ method: 'GET', url: availabilityUrl }, { manual: true, autoCancel: false })
    const validate = useMemo(() => {
        const checkAvailability = createDeploymentNameValidator(async (group, name) => (await fetchAvailability({ params: { group, name } })).data)
        return own ? allowOwnName(checkAvailability, own) : checkAvailability
    }, [fetchAvailability, own])

    return (
        <Field name="name" validate={validate}>
            {({ input, meta }) => {
                const settled = !meta.validating && !!input.value
                return (
                    <InputFieldFF
                        input={input}
                        meta={meta}
                        className={styles.field}
                        required
                        label={label}
                        helpText={helpText}
                        loading={meta.validating}
                        valid={settled && meta.valid}
                        error={settled && meta.invalid}
                    />
                )
            }}
        </Field>
    )
}
