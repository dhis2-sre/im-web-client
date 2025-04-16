import { hasValue, SingleSelectField, SingleSelectOption } from '@dhis2/ui'
import { FC, useMemo } from 'react'
import { useField } from 'react-final-form'
import { mapStringToValueLabel } from './map-string-to-value-label.tsx'
import { ParameterFieldProps } from './parameter-field.tsx'

type SameSiteCookieOption = 'strict' | 'lax' | 'none' | ''

const sameSiteCookieOptions: Array<SameSiteCookieOption> = ['strict', 'lax', 'none']
const isValidOption = (input: unknown): boolean => typeof input === 'string' && input.length > 0 && sameSiteCookieOptions.includes(input as SameSiteCookieOption)
const parseSelected = (value: unknown, initalValue: unknown): SameSiteCookieOption => {
    if (isValidOption(value)) {
        return value as SameSiteCookieOption
    } else if (isValidOption(initalValue)) {
        return initalValue as SameSiteCookieOption
    } else {
        return ''
    }
}

export const SameSiteCookiesSelect: FC<ParameterFieldProps> = ({ displayName, parameterName, stackId }) => {
    const fieldName = `${stackId}.${parameterName}`
    const { meta, input } = useField(fieldName, {
        subscription: { initial: true, value: true },
        validate: hasValue,
    })
    const options = useMemo(() => {
        if (!meta.initial) {
            return []
        }
        return sameSiteCookieOptions.map(mapStringToValueLabel)
    }, [meta.initial])
    const selected: SameSiteCookieOption = parseSelected(input.value, meta.initial)
    const showWarning = selected === 'none'

    return (
        <SingleSelectField
            onChange={({ selected }) => input.onChange(selected)}
            selected={selected}
            required
            loading={false}
            error={null}
            label={displayName}
            filterable={false}
            tabIndex="0"
            helpText="If you are setting session.cookie.samesite in the dhis.conf field, ensure this matches the value you select here"
            warning={showWarning}
            validationText={showWarning ? 'Insecure, only use for local development' : undefined}
        >
            {options.map((option) => (
                <SingleSelectOption key={option.value} {...option} />
            ))}
        </SingleSelectField>
    )
}
