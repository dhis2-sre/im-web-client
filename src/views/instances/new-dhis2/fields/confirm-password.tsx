import { InputFieldFF } from '@dhis2/ui'
import { FC, useCallback } from 'react'
import { Field, useField } from 'react-final-form'
import { PGADMIN_PASSWORD, PGADMIN_CONFIRM_PASSWORD } from '../constants.ts'

type ConfirmPasswordInputProps = {
    stackId: string
}

export const ConfirmPasswordInput: FC<ConfirmPasswordInputProps> = ({ stackId }) => {
    const {
        input: { value: password },
    } = useField(`${stackId}.${PGADMIN_PASSWORD}`, {
        subscription: { value: true },
    })

    const validateConfirmPassword = useCallback(
        (confirmPassword: string) => {
            return confirmPassword === password ? undefined : 'Passwords do not match'
        },
        [password]
    )

    return <Field name={`${stackId}.${PGADMIN_CONFIRM_PASSWORD}`} type="password" component={InputFieldFF} label="Confirm Password" validate={validateConfirmPassword} />
}
