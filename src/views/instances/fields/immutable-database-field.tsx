import { InputField } from '@dhis2/ui'
import type { FC } from 'react'
import { Field } from 'react-final-form'
import { useDatabaseLabel } from '../../../hooks/index.ts'

const DatabaseValue: FC<{ value: string; displayName: string; reason: string }> = ({ value, displayName, reason }) => {
    const { label, loading } = useDatabaseLabel(value)

    return <InputField label={displayName} value={label} helpText={`Cannot be changed: ${reason}`} loading={loading} disabled />
}

/* A deployment stores its database as an id, so the plain immutable field shows a number nobody
 * recognises. The field stays registered and keeps the id as its value, which is what an edit
 * submits back; only what is displayed changes. */
export const ImmutableDatabaseField: FC<{ stackId: string; parameterName: string; displayName: string; reason: string }> = ({ stackId, parameterName, displayName, reason }) => (
    <Field name={`${stackId}.${parameterName}`} subscription={{ value: true }}>
        {({ input }) => <DatabaseValue value={String(input.value ?? '')} displayName={displayName} reason={reason} />}
    </Field>
)
