import { SingleSelectFieldFF, hasValue } from '@dhis2/ui'
import { FC, useEffect, useMemo } from 'react'
import { Field, useField } from 'react-final-form'
import { useAuthAxios } from '../../../hooks/index.ts'
import { DATABASE_ID } from '../parameters.ts'
import { mapStringToValueLabel } from './map-string-to-value-label.tsx'
import { ParameterFieldProps } from './parameter-field.tsx'

export const IntergrationParameterSelect: FC<ParameterFieldProps> = ({ displayName, parameterName, stackId }) => {
    const fieldName = `${stackId}.${parameterName}`
    const { input } = useField(fieldName, {
        subscription: { value: true },
    })
    const [{ data, error, loading }, refetch] = useAuthAxios(
        {
            url: '/integrations',
            method: 'POST',
            data: {
                key: parameterName,
            },
        },
        { useCache: false, autoCatch: true }
    )

    /* Uploading the database this form needs means leaving the form, and coming back to a list that
     * does not have it is a reload of a form someone has already filled in. Remounting refetches on
     * its own now that the response is not cached; this covers the other tab, where the form is
     * never unmounted at all. Only the database list: the pull policies and storage types this
     * component also renders are fixed lists in the backend, so refetching them on every alt-tab
     * costs requests and can never say anything new. */
    const refetchesOnFocus = parameterName === DATABASE_ID
    useEffect(() => {
        if (!refetchesOnFocus) {
            return
        }

        const refresh = () => {
            void refetch()
        }
        window.addEventListener('focus', refresh)
        return () => window.removeEventListener('focus', refresh)
    }, [refetchesOnFocus, refetch])
    /* The select throws, taking the whole page with it, when the selected value is not one of its
     * options, so whatever the field holds is always offered. Keying on the value rather than on the
     * field's initial value matters for a companion stack: its defaults are seeded with change, not
     * initialize, so they have no initial value, and they are in place before /integrations answers. */
    const { value, onChange } = input
    const options = useMemo(() => {
        const listed: { value: string; label: string }[] = !data
            ? []
            : Array.isArray(data)
              ? data.map(mapStringToValueLabel)
              : Object.entries(data).map(([value, label]) => ({
                    value,
                    label: label as string,
                }))

        if (value && !listed.some((option) => option.value === value)) {
            return [...listed, { value, label: value }]
        }
        return listed
    }, [data, value])

    /* A parameter whose options are environment specific, the database being the one that matters,
     * has no default the stack could carry, so the field would sit empty and invalid until someone
     * opened it. The first option is as good a starting point as any and beats a blocked form.
     * Parameters that do carry a default already have a value here, so this leaves them alone. */
    useEffect(() => {
        if (!value && options.length > 0) {
            onChange(options[0].value)
        }
    }, [value, options, onChange])

    return (
        <Field
            required
            loading={loading}
            error={error}
            name={fieldName}
            label={displayName}
            component={SingleSelectFieldFF}
            filterable={options.length > 7}
            options={options}
            validate={hasValue}
        />
    )
}
