import { InputFieldFF } from '@dhis2/ui'
import type { FC } from 'react'
import { Field } from 'react-final-form'

/* A parameter the stack says cannot change once the instance has been deployed. The value is shown
 * so the form still reads as a complete picture of the instance, and the stack's own reason is the
 * help text, so the explanation the user gets here is the one the backend would answer with. */
export const ImmutableParameterField: FC<{ stackId: string; parameterName: string; displayName: string; reason: string }> = ({ stackId, parameterName, displayName, reason }) => (
    <Field name={`${stackId}.${parameterName}`} label={displayName} component={InputFieldFF} disabled helpText={`Cannot be changed: ${reason}`} />
)
