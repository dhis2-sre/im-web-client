import { InputFieldFF } from '@dhis2/ui'
import { useMemo } from 'react'
import { Field } from 'react-final-form'
import { useAuthAxios } from '../../../hooks/index.ts'
import styles from './fields.module.css'
import { createDeploymentNameValidator } from './validate-deployment-name.ts'
import type { DeploymentNameAvailability } from './validate-deployment-name.ts'

export const NameInput = () => {
    const [, fetchAvailability] = useAuthAxios<DeploymentNameAvailability>({ method: 'GET', url: '/deployments/availability' }, { manual: true, autoCancel: false })
    const validate = useMemo(() => createDeploymentNameValidator(async (group, name) => (await fetchAvailability({ params: { group, name } })).data), [fetchAvailability])

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
                        label="Name"
                        helpText="Shown in the instance URL"
                        loading={meta.validating}
                        valid={settled && meta.valid}
                        error={settled && meta.invalid}
                    />
                )
            }}
        </Field>
    )
}
