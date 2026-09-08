import { CheckboxField } from '@dhis2/ui'
import { FC } from 'react'
import { useField } from 'react-final-form'
import styles from './fields.module.css'
import { ParameterFieldProps } from './parameter-field.tsx'

// Form state holds 'true'/'false' strings to match the API shape. We render the
// checkbox via useField + CheckboxField directly because react-final-form 7's
// `<Field type="checkbox">` computes `checked` as `!!parse(state.value)`, which
// gives `!!'false' === true` for a string-valued state — leaving every checkbox
// stuck in the checked position. See https://github.com/final-form/react-final-form/pull/1074
export const BooleanParameterCheckbox: FC<ParameterFieldProps> = ({ displayName, parameterName, stackId }) => {
    const name = `${stackId}.${parameterName}`
    const { input } = useField(name, { subscription: { value: true } })
    return (
        <CheckboxField
            name={name}
            label={displayName}
            required
            checked={input.value === 'true'}
            onChange={({ checked }) => input.onChange(checked ? 'true' : 'false')}
            className={styles.parameterCheckbox}
        />
    )
}
